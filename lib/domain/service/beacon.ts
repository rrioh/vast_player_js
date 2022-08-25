import { VASTObject } from "../model/vast";
import { MacroReplacer } from "../../util/macro";

function setImpressionUrl(video: HTMLVideoElement, urls: string[], macroReplacer: MacroReplacer) {
    for (let url of urls) {
        video.addEventListener("canplay", function(e) {
            createBeacon(video, url, macroReplacer);
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

function setVideoClickTrackingUrls(video: HTMLVideoElement, urls: string[], macroReplacer: MacroReplacer) {
    for ( let url of urls) {
        video.addEventListener("click", function(e) {
            createBeacon(video, url, macroReplacer);
        });
    }
}

function setTrackingUrls(video: HTMLVideoElement, vastObject: VASTObject, macroReplacer: MacroReplacer) {
    video.addEventListener("loadedmetadata", function(e) {
        for (let [point, url] of vastObject.trackings) {
            if (point == "loaded") {
                video.addEventListener("canplay", function (e) {
                    createBeacon(video, url, macroReplacer);
                },
                {once: true});
            } else if (point === "pause") {
                video.addEventListener("pause", function (e) {
                    createBeacon(video,url, macroReplacer);
                });
            } else if (typeof point === "number") {
                video.addEventListener("timeupdate", function timeBeaconEvent(e) {
                    if (video.currentTime >= point) {
                        createBeacon(video, url, macroReplacer);
                        video.removeEventListener("timeupdate", timeBeaconEvent);
                    }
                });
            }
        }
    });
}

export function createBeacon(parent: HTMLElement, url: string | null, macroReplacer: MacroReplacer) {
    if (!url) return;

    let date = new Date();
    let ele = document.createElement("img");
    url = macroReplacer(url, null);
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

export function setBeacons(video: HTMLVideoElement, vastObject: VASTObject, macroReplacer: MacroReplacer) {
    setImpressionUrl(video, vastObject.impressionUrls, macroReplacer);
    setVideoClickThroughUrl(video, vastObject.clickThroughUrl);
    setVideoClickTrackingUrls(video, vastObject.clickTrackingUrls, macroReplacer);
    setTrackingUrls(video, vastObject, macroReplacer);
}