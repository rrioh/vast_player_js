import { VASTObject } from "../interface/interface";

function setImpressionUrl(video: HTMLVideoElement, urls: string[]) {
    for (let url of urls) {
        video.addEventListener("canplay", function(e) {
            createBeacon(video, url);
        },
        {once: true});
    }
}

function setVideoClickThroughUrl(video: HTMLVideoElement, url: string) {
    video.addEventListener("click", function(e) {
        open(url, "_blank");
    });
}

function setTrackingUrls(video: HTMLVideoElement, vastObject: VASTObject) {
    video.addEventListener("loadedmetadata", function(e) {
        for (let [point, url] of vastObject.trackingMap) {
            let loop = function() {
                if (video.currentTime >= point) {
                    createBeacon(video, url);
                    return;
                }
                requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
        }
    });
}

function createBeacon(parent: HTMLElement, url: string | null) {
    if (!url) return;

    let date = new Date();
    let ele = document.createElement("img");
    ele.src = url.replace(/\[TIMESTAMP\]/, date.toISOString());
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
    setTrackingUrls(video, vastObject);
}