export interface VastUtil {
    parseVastXML: (sourceVast: string) => Element;
};

export interface InlineObject {
    errorUrl: string;
}

export interface VASTObject {
    errorUrl: string;
    impressionUrls: string[];
    adTitle: string;
    trackingMap: Map<number, string>;
    mediaFileUrl: string;
    clickThroughUrl: string;
}