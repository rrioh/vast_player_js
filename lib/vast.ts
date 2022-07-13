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
            let vastDoc = this.parseVastXML(sourceVast);
            let vastObject = this.createVastObject(vastDoc);

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

        let vastDoc = xmlDoc.querySelector("VAST");
        if (!vastDoc) {
            throw new Error("VAST tag not found");
        }

        return vastDoc;
    }

    createVastObject(vdoc: Element): VASTObject {

        const rootErrorDoc = vdoc.querySelector(":scope>Error");
        if (!rootErrorDoc) {
            throw new Error("cannot parse root Error");
        }
        if (rootErrorDoc.textContent) this.errorUrls.push(rootErrorDoc.textContent);

        const inlineDoc = vdoc.querySelector(":scope>Ad>InLine");
        if (!inlineDoc) {
            sendError(this.errorUrls, ErrorCode.NoVASTResponseAfterWrapper);
            throw new Error("parse InLine error");
        }

        const errorDoc = inlineDoc.querySelector(":scope>Error");
        if (!errorDoc || !errorDoc.textContent) {
            sendError(this.errorUrls, ErrorCode.XMLParseError);
            throw new Error("parse InLine Error error");
        }
        if (errorDoc.textContent) this.errorUrls.push(errorDoc.textContent);

        const impDoc = inlineDoc.querySelector(":scope>Impression");
        if (!impDoc || !impDoc.textContent) {
            sendError(this.errorUrls, ErrorCode.XMLParseError);
            throw new Error("parse InLine Impression error");
        }
        const impressionUrl = impDoc.textContent;

        const adTitleDoc = inlineDoc.querySelector(":scope>AdTitle");
        if (!adTitleDoc || !adTitleDoc.textContent) {
            sendError(this.errorUrls, ErrorCode.XMLParseError);
            throw new Error("parse InLine AdTitle error");
        }
        const adTitle = adTitleDoc.textContent;

        let adDesc: string | null = null;
        const adDescDoc = inlineDoc.querySelector(":scope>Description");
        if (adDescDoc && adDescDoc.textContent) {
            adDesc = adDescDoc.textContent;
        }

        const linearDoc = inlineDoc.querySelector(":scope>Creatives>Creative>Linear");
        if (!linearDoc) {
            sendError(this.errorUrls, ErrorCode.XMLParseError);
            throw new Error("parse InLine Linear error");
        }

        const durationDoc = linearDoc.querySelector(":scope>Duration");
        if (!durationDoc || !durationDoc.textContent) {
            sendError(this.errorUrls, ErrorCode.XMLParseError);
            throw new Error("parse InLine Linear Duration error");
        }
        const duration = convertTimeToSecond(durationDoc.textContent);

        const trackingsDoc = linearDoc.querySelectorAll(":scope>TrackingEvents>Tracking");
        const trackingMap = this.createTrackingObject(trackingsDoc, duration);

        const iconsDoc = linearDoc.querySelectorAll(":scope>Icons>Icon");
        const iconObjects = this.createIconObject(iconsDoc);

        const mediaFilesDoc = linearDoc.querySelectorAll(":scope>MediaFiles>MediaFile");
        if (!mediaFilesDoc) {
            sendError(this.errorUrls, ErrorCode.XMLParseError);
            throw new Error("parse MediaFiles error");
        }
        // ひとまず1つ目のMediaFileのURLのみ取得
        const mediaFileUrl = mediaFilesDoc[0]?.textContent!;

        const clickThroughDoc = linearDoc.querySelector(":scope>VideoClicks>ClickThrough");
        if (!clickThroughDoc || !clickThroughDoc.textContent) {
            sendError(this.errorUrls, ErrorCode.XMLParseError);
            throw new Error("parse InLine Linear ClickThrough error");
        }
        const clickThroughUrl = clickThroughDoc.textContent;

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
 
    createTrackingObject(trackingsDoc: NodeList, duration: number): Map<number | string, string> {
        const trackingMap = new Map<number | string, string>();
        trackingsDoc.forEach(function(tracking) {
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

    createIconObject(iconsDoc: NodeList): IconObject[] {
        let iconObjects: IconObject[] = [];
        for (let icon of iconsDoc) {
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
