import { IconObject } from "./icon";

export interface VASTObject {
    errorUrls: string[];
    impressionUrls: string[];
    adTitle: string;
    adDesc: string | null;
    trackings: Map<number | string, string>;
    icons: IconObject[];
    mediaFileUrl: string;
    clickThroughUrl: string | null;
    clickTrackingUrls: string[];
}

export interface VastUtil {
    parseVastXML: (sourceVast: string) => Element;
};
