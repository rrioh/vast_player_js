export interface VastUtil {
    parseVastXML: (sourceVast: string) => Element;
};

export interface InlineObject {
    errorUrl: string;
}

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

export interface IconObject {
    width: number;
    height: number;
    xPosition: string;
    yPosition: string;
    start: number;
    end: number | null;
    imgUrl: string;
    clickThroughUrl: string | null;
    clickTrackingUrl: string | null;
}