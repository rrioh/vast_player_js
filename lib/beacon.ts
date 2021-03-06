import { VASTObject } from "../interface/interface";

function setImpressionUrl(video: HTMLVideoElement, urls: string[]) {
    for (let url of urls) {
        video.addEventListener("canplay", function(e) {
            createBeacon(video, url);
        },
        {once: true});
    }
}

function setVideoClickThroughUrl(video: HTMLVideoElement, url: string | null) {
    if (!url) return;

    video.addEventListener("click", function(e) {
        open(url, "_blank");
    });
}

function setVideoClickTrackingUrls(video: HTMLVideoElement, urls: string[]) {
    for ( let url of urls) {
        video.addEventListener("click", function(e) {
            createBeacon(video, url);
        });
    }
}

function setTrackingUrls(video: HTMLVideoElement, vastObject: VASTObject) {
    video.addEventListener("loadedmetadata", function(e) {
        for (let [point, url] of vastObject.trackings) {
            if (point == "loaded") {
                video.addEventListener("canplay", function (e) {
                    createBeacon(video, url);
                },
                {once: true});
            } else if (point === "pause") {
                video.addEventListener("pause", function (e) {
                    createBeacon(video,url);
                });
            } else if (typeof point === "number") {
                video.addEventListener("timeupdate", function timeBeaconEvent(e) {
                    if (video.currentTime >= point) {
                        createBeacon(video, url);
                        video.removeEventListener("timeupdate", timeBeaconEvent);
                    }
                });
            }
        }
    });
}

export function createBeacon(parent: HTMLElement, url: string | null) {
    if (!url) return;

    let date = new Date();
    let ele = document.createElement("img");
    url = url.replace(/\[TIMESTAMP\]/, date.toISOString());
    ele.src = url;
    ele.style.display = "none";
    parent.prepend(ele);

    console.log("[DEBUG] beacon sent: " + url);
}

export function sendError(urls: string[] | null, errorCode: number) {
    if (!urls) return;

    for (let url of urls) {
        let ele = document.createElement("img");
        ele.src = url.replace(/\[ERRORCODE\]/, errorCode.toString());
        ele.style.display = "none";
        document.body.prepend(ele);
        console.log("[DEBUG] error beacon sent: " + url);
    }
}

export function setBeacons(video: HTMLVideoElement, vastObject: VASTObject) {
    setImpressionUrl(video, vastObject.impressionUrls);
    setVideoClickThroughUrl(video, vastObject.clickThroughUrl);
    setVideoClickTrackingUrls(video, vastObject.clickTrackingUrls);
    setTrackingUrls(video, vastObject);
}