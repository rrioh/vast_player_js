import { VastUtil, VASTObject, ClickThrough, ClickTracking, Icon } from "../model/vast";
import { sendError } from "./beacon";
import { createIcons } from "./icon";
import { ErrorCode } from "../../util/macro";
import { convertTimeToSecond } from "../../util/time";


const TRACKING_EVENT_POINT = new Map<string, number>([
    ["start", 0],
    ["firstQuartile", 1 / 4],
    ["midpoint", 1 / 2],
    ["thirdQuartile", 3 / 4],
    ["complete", 1]
]);

class Vast implements VastUtil {
    errorUrls: string[];

    constructor() {
        this.errorUrls = [];
    }

    parseVast (sourceVast: string): VASTObject | null {
        try {
            let vastEle = this.parseVastXML(sourceVast);
            let vastObject = this.createVastObject(vastEle);

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

    createVastObject(vEle: Element): VASTObject {

        const rootErrorEle = vEle.querySelector(":scope>Error");
        if (rootErrorEle && rootErrorEle.textContent) this.errorUrls.push(rootErrorEle.textContent);

        const inlineEle = vEle.querySelector(":scope>Ad>InLine");
        if (!inlineEle) {
            sendError(this.errorUrls, ErrorCode.NoVASTResponseAfterWrapper);
            throw new Error("parse InLine error");
        }

        const errorEle = inlineEle.querySelector(":scope>Error");
        if (errorEle && errorEle.textContent) this.errorUrls.push(errorEle.textContent);

        const impEle = inlineEle.querySelector(":scope>Impression");
        if (!impEle || !impEle.textContent) {
            sendError(this.errorUrls, ErrorCode.XMLParseError);
            throw new Error("parse InLine Impression error");
        }
        const impressionUrl = impEle.textContent;

        const adTitleEle = inlineEle.querySelector(":scope>AdTitle");
        if (!adTitleEle || !adTitleEle.textContent) {
            sendError(this.errorUrls, ErrorCode.XMLParseError);
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
            sendError(this.errorUrls, ErrorCode.XMLParseError);
            throw new Error("parse InLine Linear error");
        }

        const durationEle = linearEle.querySelector(":scope>Duration");
        if (!durationEle || !durationEle.textContent) {
            sendError(this.errorUrls, ErrorCode.XMLParseError);
            throw new Error("parse InLine Linear Duration error");
        }
        const duration = convertTimeToSecond(durationEle.textContent);

        const trackingsEles = linearEle.querySelectorAll(":scope>TrackingEvents>Tracking");
        const trackingMap = this.createTrackingObject(trackingsEles, duration);

        const iconEles = linearEle.querySelectorAll(":scope>Icons>Icon");
        const icons = createIcons(iconEles);

        const mediaFileEles = linearEle.querySelectorAll(":scope>MediaFiles>MediaFile");
        if (!mediaFileEles) {
            sendError(this.errorUrls, ErrorCode.XMLParseError);
            throw new Error("parse MediaFiles error");
        }
        // ひとまず1つ目のMediaFileのURLのみ取得
        const mediaFileUrl = mediaFileEles[0]?.textContent!;

        const videoClicksEle = linearEle.querySelector(":scope>VideoClicks");
        let clickThroughUrl: string | null = null;
        let clickTrackingUrls: string[] = [];
        let clickThrough: ClickThrough | null = null;
        let clickTracking: ClickTracking[] = [];
        if (videoClicksEle) {
            const clickThroughEle = videoClicksEle.querySelector(":scope>ClickThrough");
            if (!clickThroughEle || !clickThroughEle.textContent) {
                sendError(this.errorUrls, ErrorCode.XMLParseError);
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

        const vastObject: VASTObject = {
            errorUrls: this.errorUrls,
            impressionUrls: [impressionUrl],
            adTitle: adTitle,
            adDesc: adDesc,
            creatives: [
                {
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
                }
            ]
        }

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
