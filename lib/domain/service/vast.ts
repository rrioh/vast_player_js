import { VastUtil, VASTObject, ClickThrough, ClickTracking, Icon } from "../model/vast";
import { sendError } from "./beacon";
import { createIcons } from "./icon";
import { ErrorCode, MacroReplacer } from "../../util/macro";
import { convertTimeToSecond } from "../../util/time";

const WRAPPER_MAX = 5;

const TRACKING_EVENT_POINT = new Map<string, number>([
    ["start", 0],
    ["firstQuartile", 1 / 4],
    ["midpoint", 1 / 2],
    ["thirdQuartile", 3 / 4],
    ["complete", 1]
]);

function initVastObject(): VASTObject {
    return {
        errorUrls: [],
        impressionUrls: [],
        adTitle: "",
        adDesc: "",
        creatives: []
    };
}

class Vast implements VastUtil {

    constructor() {
    }

    private isWrapper(vEle: Element): boolean {
        const wrapperEle = vEle.querySelector(":scope>Ad>Wrapper");
        if (wrapperEle) {
            return true;
        }
        return false;
    }

    private async nextVast(vEle: Element) {
        const vastAdTagURIEle = vEle.querySelector(":scope>Ad>Wrapper>VASTAdTagURI");
        if (!vastAdTagURIEle || !vastAdTagURIEle.textContent) {
            throw new Error("next vast url error");
        }

        let url = vastAdTagURIEle.textContent;
        const res = await fetch(url);
        const data = await res.text();
        return data;
    }

    async parseVast (sourceVast: string, macroReplacer: MacroReplacer): Promise<VASTObject | null> {
        try {
            let vastObject = initVastObject();
            for (let i = 1; i <= WRAPPER_MAX; i++) {
                // parse VAST to Object
                let vastEle = this.parseVastXML(sourceVast);

                if (this.isWrapper(vastEle)) {
                    if (i == WRAPPER_MAX) {
                        throw new Error("too many wrapper");
                    }

                    vastObject = this.updateWrapperVastObject(vastObject, vastEle, macroReplacer);
                    sourceVast = await this.nextVast(vastEle);
                } else {
                    vastObject = this.updateInlineVastObject(vastObject, vastEle, macroReplacer);
                    break;
                }
            }
            return vastObject;
        } catch (e) {
            console.log("[ERROR] cannot create VASTObject: " + e);

            return null;
        }
    }

    parseVastXML (sourceVast: string): Element {
        const parser = new DOMParser();
        let xmlDoc: XMLDocument  = parser.parseFromString(sourceVast,"application/xml");
        let parserError = xmlDoc.querySelector("parsererror");
        if (parserError) {
            throw new Error(parserError.textContent || "parse vast error");
        }

        let vastEle = xmlDoc.querySelector("VAST");
        if (!vastEle) {
            throw new Error("VAST tag not found");
        }

        return vastEle;
    }

    updateWrapperVastObject(vastObject: VASTObject, vEle: Element, macroReplacer: MacroReplacer): VASTObject {
        let errorUrls: string[] = [];
        const rootErrorEle = vEle.querySelector(":scope>Error");
        if (rootErrorEle && rootErrorEle.textContent) errorUrls.push(rootErrorEle.textContent);

        const wrapperEle = vEle.querySelector(":scope>Ad>Wrapper");
        if (!wrapperEle) {
            sendError(errorUrls, ErrorCode.NoVASTResponseAfterWrapper, macroReplacer);
            throw new Error("parse Wrapper error");
        }

        const errorEle = wrapperEle.querySelector(":scope>Error");
        if (errorEle && errorEle.textContent) errorUrls.push(errorEle.textContent);

        const impEle = wrapperEle.querySelector(":scope>Impression");
        if (!impEle || !impEle.textContent) {
            sendError(errorUrls, ErrorCode.XMLParseError, macroReplacer);
            throw new Error("parse Wrapper Impression error");
        }
        const impressionUrl = impEle.textContent;

        const linearEle = wrapperEle.querySelector(":scope>Creatives>Creative>Linear");
        if (!linearEle) {
            vastObject.errorUrls = vastObject.errorUrls.concat(errorUrls);
            vastObject.impressionUrls.push(impressionUrl);

            return vastObject;
        }

        const durationEle = linearEle.querySelector(":scope>Duration");
        if (!durationEle || !durationEle.textContent) {
            sendError(errorUrls, ErrorCode.XMLParseError, macroReplacer);
            throw new Error("parse Wrapper Linear Duration error");
        }
        const duration = convertTimeToSecond(durationEle.textContent);

        const trackingsEles = linearEle.querySelectorAll(":scope>TrackingEvents>Tracking");
        const trackingMap = this.createTrackingObject(trackingsEles, duration);

        const iconEles = linearEle.querySelectorAll(":scope>Icons>Icon");
        const icons = createIcons(iconEles);

        const videoClicksEle = linearEle.querySelector(":scope>VideoClicks");
        let clickThrough: ClickThrough | null = null;
        let clickTracking: ClickTracking[] = [];
        if (videoClicksEle) {
            const clickThroughEle = videoClicksEle.querySelector(":scope>ClickThrough");
            if (clickThroughEle && clickThroughEle.textContent) {
                clickThrough = {
                    content: clickThroughEle.textContent
                }
            }

            const clickTrackingEles = videoClicksEle.querySelectorAll(":scope>ClickTracking");
            for (let clickTrackingEle of clickTrackingEles) {
                if (clickTrackingEle.textContent) {
                    clickTracking.push({
                        content: clickTrackingEle.textContent
                    });
                }
            }
        }

        vastObject.errorUrls = vastObject.errorUrls.concat(errorUrls);
        vastObject.impressionUrls.push(impressionUrl);
        vastObject.creatives.push({
            linear: {
                duration: duration,
                mediaFiles: [],
                trackingEvents: trackingMap,
                clickThrough: clickThrough,
                clickTrackings: clickTracking,
                icons: icons
            }
        });

        return vastObject;
    }

    updateInlineVastObject(vastObject: VASTObject, vEle: Element, macroReplacer: MacroReplacer): VASTObject {

        let errorUrls: string[] = [];
        const rootErrorEle = vEle.querySelector(":scope>Error");
        if (rootErrorEle && rootErrorEle.textContent) errorUrls.push(rootErrorEle.textContent);

        const inlineEle = vEle.querySelector(":scope>Ad>InLine");
        if (!inlineEle) {
            sendError(errorUrls, ErrorCode.NoVASTResponseAfterWrapper, macroReplacer);
            throw new Error("parse InLine error");
        }

        const errorEle = inlineEle.querySelector(":scope>Error");
        if (errorEle && errorEle.textContent) errorUrls.push(errorEle.textContent);

        const impEle = inlineEle.querySelector(":scope>Impression");
        if (!impEle || !impEle.textContent) {
            sendError(errorUrls, ErrorCode.XMLParseError, macroReplacer);
            throw new Error("parse InLine Impression error");
        }
        const impressionUrl = impEle.textContent;

        const adTitleEle = inlineEle.querySelector(":scope>AdTitle");
        if (!adTitleEle || !adTitleEle.textContent) {
            sendError(errorUrls, ErrorCode.XMLParseError, macroReplacer);
            throw new Error("parse InLine AdTitle error");
        }
        const adTitle = adTitleEle.textContent;

        let adDesc: string | null = null;
        const adDescEle = inlineEle.querySelector(":scope>Description");
        if (adDescEle && adDescEle.textContent) {
            adDesc = adDescEle.textContent;
        }

        const linearEle = inlineEle.querySelector(":scope>Creatives>Creative>Linear");
        if (!linearEle) {
            sendError(errorUrls, ErrorCode.XMLParseError, macroReplacer);
            throw new Error("parse InLine Linear error");
        }

        const durationEle = linearEle.querySelector(":scope>Duration");
        if (!durationEle || !durationEle.textContent) {
            sendError(errorUrls, ErrorCode.XMLParseError, macroReplacer);
            throw new Error("parse InLine Linear Duration error");
        }
        const duration = convertTimeToSecond(durationEle.textContent);

        const trackingsEles = linearEle.querySelectorAll(":scope>TrackingEvents>Tracking");
        const trackingMap = this.createTrackingObject(trackingsEles, duration);

        const iconEles = linearEle.querySelectorAll(":scope>Icons>Icon");
        const icons = createIcons(iconEles);

        const mediaFileEles = linearEle.querySelectorAll(":scope>MediaFiles>MediaFile");
        if (!mediaFileEles) {
            sendError(errorUrls, ErrorCode.XMLParseError, macroReplacer);
            throw new Error("parse MediaFiles error");
        }
        // ひとまず1つ目のMediaFileのURLのみ取得
        const mediaFileUrl = mediaFileEles[0]?.textContent!;

        const videoClicksEle = linearEle.querySelector(":scope>VideoClicks");
        let clickThrough: ClickThrough | null = null;
        let clickTracking: ClickTracking[] = [];
        if (videoClicksEle) {
            const clickThroughEle = videoClicksEle.querySelector(":scope>ClickThrough");
            if (!clickThroughEle || !clickThroughEle.textContent) {
                sendError(errorUrls, ErrorCode.XMLParseError, macroReplacer);
                throw new Error("parse InLine Linear ClickThrough error");
            }
            clickThrough = {
                content: clickThroughEle.textContent
            }

            const clickTrackingEles = videoClicksEle.querySelectorAll(":scope>ClickTracking");
            for (let clickTrackingEle of clickTrackingEles) {
                if (clickTrackingEle.textContent) {
                    clickTracking.push({
                        content: clickTrackingEle.textContent
                    });
                }
            }
        }

        vastObject.errorUrls = vastObject.errorUrls.concat(errorUrls);
        vastObject.impressionUrls.push(impressionUrl);
        vastObject.adTitle = adTitle;
        vastObject.adDesc = adDesc;
        vastObject.creatives.push({
            linear: {
                duration: duration,
                mediaFiles: [
                    {
                        content: mediaFileUrl
                    }
                ],
                trackingEvents: trackingMap,
                clickThrough: clickThrough,
                clickTrackings: clickTracking,
                icons: icons
            }
        });

        return vastObject;
    }
 
    createTrackingObject(trackingEles: NodeList, duration: number): Map<number | string, string> {
        const trackingMap = new Map<number | string, string>();
        trackingEles.forEach(function(tracking) {
            if (!tracking.textContent) return;
            const event = (tracking as Element).getAttribute("event");
            if (!event) return;
            if (event === "progress") {
                const offset = (tracking as Element).getAttribute("offset");
                if (!offset) return;
                const offsetSecond = convertTimeToSecond(offset);
                trackingMap.set(offsetSecond, tracking.textContent);
            } else {
                const event_point = TRACKING_EVENT_POINT.get(event);
                if (event_point != undefined) {
                    trackingMap.set(event_point * duration, tracking.textContent);
                } else {
                    trackingMap.set(event, tracking.textContent);
                }
            }
        });

        return trackingMap;
    }
}

export const vast = new Vast();
