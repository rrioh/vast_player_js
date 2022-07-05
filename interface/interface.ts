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
    trackings: Map<number | string, string>;
    icons: IconObject[];
    mediaFileUrl: string;
    clickThroughUrl: string;
}

export interface IconObject {
    width: string;
    height: string;
    xPosition: string;
    yPosition: string;
    start: number;
    end: number | null;
    imgUrl: string;
    clickThroughtUrl: string;
    clickTrackingUrl: string;
}