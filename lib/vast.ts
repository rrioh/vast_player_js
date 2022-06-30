import { convertTimeToSecond } from "./util";
import { VastUtil, VASTObject } from "../interface/interface";


const TRACKING_EVENT_POINT = new Map<string, number>([
    ["start", 0],
    ["firstQuartile", 1 / 4],
    ["midpoint", 1 / 2],
    ["thirdQuartile", 3 / 4],
    ["complete", 1]
]);

class Vast implements VastUtil {
    parseVast (sourceVast: string) {
        let vastDoc = this.parseVastXML(sourceVast);

        const vastObject = this.createVastObject(vastDoc);

        return vastObject;
    }

    parseVastXML (sourceVast: string) {
        const parser = new DOMParser();
        let xmlDoc: XMLDocument  = parser.parseFromString(sourceVast,"application/xml");
        let parserError = xmlDoc.querySelector("parsererror");
        if (parserError) {
            throw new Error("cannot parse VAST");
        }

        let vastDoc = xmlDoc.querySelector("VAST");
        if (!vastDoc) {
            throw new Error("VAST tag not found");
        }

        return vastDoc;
    }

    createVastObject(vdoc: Element) {
        const inlineDoc = vdoc.querySelector(":scope>Ad>InLine");
        if (!inlineDoc) {
            throw new Error("cannot parse InLine");
        }

        const errorDoc = inlineDoc.querySelector(":scope>Error");
        if (!errorDoc || !errorDoc.textContent) {
            throw new Error("cannot parse InLine Error");
        }
        const errorUrl = errorDoc.textContent;

        const impDoc = inlineDoc.querySelector(":scope>Impression");
        if (!impDoc || !impDoc.textContent) {
            throw new Error("cannot parse InLine Impression");
        }
        const impressionUrl = impDoc.textContent;

        const adTitleDoc = inlineDoc.querySelector(":scope>AdTitle");
        if (!adTitleDoc || !adTitleDoc.textContent) {
            throw new Error("cannot parse InLine AdTitle");
        }
        const adTitle = adTitleDoc.textContent;

        const linearDoc = inlineDoc.querySelector(":scope>Creatives>Creative>Linear");
        if (!linearDoc) {
            throw new Error("cannot parse InLine Linear");
        }

        const durationDoc = linearDoc.querySelector(":scope>Duration");
        if (!durationDoc || !durationDoc.textContent) {
            throw new Error("cannot parse InLine Linear Duration");
        }
        const duration = convertTimeToSecond(durationDoc.textContent);

        const trackingsDoc = linearDoc.querySelectorAll(":scope>TrackingEvents>Tracking");
        const trackingMap = this.createTrackingObject(trackingsDoc, duration);

        const mediaFilesDoc = linearDoc.querySelectorAll(":scope>MediaFiles>MediaFile");
        if (!mediaFilesDoc) {
            throw new Error("cannot parse MediaFiles");
        }
        // ひとまず1つ目のMediaFileのURLのみ取得
        const mediaFileUrl = mediaFilesDoc[0]?.textContent!;

        const clickThroughDoc = linearDoc.querySelector(":scope>VideoClicks>ClickThrough");
        if (!clickThroughDoc || !clickThroughDoc.textContent) {
            throw new Error("cannot parse InLine Linear ClickThrough");
        }
        const clickThroughUrl = clickThroughDoc.textContent;

        const vastObject: VASTObject = {
            errorUrl: errorUrl,
            impressionUrls: [impressionUrl],
            adTitle: adTitle,
            trackingMap: trackingMap,
            mediaFileUrl: mediaFileUrl,
            clickThroughUrl: clickThroughUrl
        }

        return vastObject;
    }
 
    createTrackingObject(trackingsDoc: NodeList, duration: number) {
        const trackingMap = new Map<number, string>();
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
                if (event_point != undefined) trackingMap.set(event_point * duration, tracking.textContent);
            }
        });

        return trackingMap;
    }
}

const vast = new Vast();

export default vast;
