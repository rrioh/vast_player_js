import { convertTimeToSecond } from "./util";
import { VastUtil, VASTObject, IconObject } from "../interface/interface";
import { sendError } from "./beacon";
import { ErrorCode } from "./macro";


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

    parseVastXML (sourceVast: string) {
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
        if (!rootErrorEle) {
            throw new Error("cannot parse root Error");
        }
        if (rootErrorEle.textContent) this.errorUrls.push(rootErrorEle.textContent);

        const inlineEle = vEle.querySelector(":scope>Ad>InLine");
        if (!inlineEle) {
            sendError(this.errorUrls, ErrorCode.NoVASTResponseAfterWrapper);
            throw new Error("parse InLine error");
        }

        const errorEle = inlineEle.querySelector(":scope>Error");
        if (!errorEle || !errorEle.textContent) {
            sendError(this.errorUrls, ErrorCode.XMLParseError);
            throw new Error("parse InLine Error error");
        }
        if (errorEle.textContent) this.errorUrls.push(errorEle.textContent);

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
        const iconObjects = this.createIconObject(iconEles);

        const mediaFileEles = linearEle.querySelectorAll(":scope>MediaFiles>MediaFile");
        if (!mediaFileEles) {
            sendError(this.errorUrls, ErrorCode.XMLParseError);
            throw new Error("parse MediaFiles error");
        }
        // ひとまず1つ目のMediaFileのURLのみ取得
        const mediaFileUrl = mediaFileEles[0]?.textContent!;

        const clickThroughEle = linearEle.querySelector(":scope>VideoClicks>ClickThrough");
        if (!clickThroughEle || !clickThroughEle.textContent) {
            sendError(this.errorUrls, ErrorCode.XMLParseError);
            throw new Error("parse InLine Linear ClickThrough error");
        }
        const clickThroughUrl = clickThroughEle.textContent;

        const vastObject: VASTObject = {
            errorUrls: this.errorUrls,
            impressionUrls: [impressionUrl],
            adTitle: adTitle,
            adDesc: adDesc,
            trackings: trackingMap,
            icons: iconObjects,
            mediaFileUrl: mediaFileUrl,
            clickThroughUrl: clickThroughUrl
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

    createIconObject(iconEles: NodeList): IconObject[] {
        let iconObjects: IconObject[] = [];
        for (let icon of iconEles) {
            let iconEle = icon as Element;

            let width = parseInt(iconEle.getAttribute("width") || "10") || 10;
            let height = parseInt(iconEle.getAttribute("height") || "10") || 10;
            let x = "0px";
            let xPosition = iconEle.getAttribute("xPosition");
            if(xPosition) {
                if (xPosition === "left" || xPosition === "right") {
                    x = xPosition;
                } else {
                    x = xPosition + "px";
                }
            }
            let y = "0px";
            let yPosition = iconEle.getAttribute("yPosition");
            if(yPosition) {
                if (yPosition === "top" || yPosition === "bottom") {
                    y = yPosition;
                } else {
                    y = yPosition + "px";
                }
            }
            let offset = iconEle.getAttribute("offset");
            let start = 0;
            if (offset) start = convertTimeToSecond(offset);
            let duration = iconEle.getAttribute("duration");
            let end = null;
            if (duration) end = convertTimeToSecond(duration) + start;

            const staticResource = iconEle.querySelector(":scope>StaticResource");
            if (!staticResource || !staticResource.textContent) continue;
            const iconClickThrough = iconEle.querySelector(":scope>IconClicks>IconClickThrough");
            const iconClickTracking = iconEle.querySelector(":scope>IconClicks>IconClickTracking");

            iconObjects.push({
                width: width,
                height: height,
                xPosition: x,
                yPosition: y,
                start: start,
                end: end,
                imgUrl: staticResource.textContent,
                clickThroughtUrl: iconClickThrough?.textContent ?? null,
                clickTrackingUrl: iconClickTracking?.textContent ?? null
            });
        }

        return iconObjects;
    }
}

const vast = new Vast();

export default vast;
