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
    trackingMap: Map<number | string, string>;
    mediaFileUrl: string;
    clickThroughUrl: string;
}