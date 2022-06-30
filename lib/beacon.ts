import { VASTObject } from "../interface/interface";

function setImpressionUrl(video: HTMLVideoElement, urls: string[]) {
    for (let url of urls) {
        video.addEventListener("canplay", function(e) {
            let ele = document.createElement("img");
            ele.src = url;
            ele.style.display = "none";
            video.parentNode?.appendChild(ele);
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
                    let ele = document.createElement("img");
                    ele.src = url;
                    ele.style.display = "none";
                    video.parentNode?.appendChild(ele);
                    console.log("[DEBUG] tracking beacon sent: " + url);

                    return;
                }
                requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
        }
    });
}

export function setBeacons(video: HTMLVideoElement, vastObject: VASTObject) {
    setImpressionUrl(video, vastObject.impressionUrls);
    setVideoClickThroughUrl(video, vastObject.clickThroughUrl);
    setTrackingUrls(video, vastObject);
}