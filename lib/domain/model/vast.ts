export interface VASTObject {
    errorUrls: string[];
    impressionUrls: string[];
    adTitle: string;
    adDesc: string | null;
    creatives: Creative[];
}

export interface Creative {
    linear: Linear;
}

export interface Linear {
    duration: number;
    mediaFiles: MediaFile[];
    trackingEvents: Map<number | string, string>;
    clickThrough: ClickThrough | null;
    clickTrackings: ClickTracking[];
    icons: Icon[];
}

export interface MediaFile {
    content: string;
}

export interface ClickThrough {
    content: string;
}

export interface ClickTracking {
    content: string;
}

export interface Icon {
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

export interface VastUtil {
    parseVastXML: (sourceVast: string) => Element;
};
