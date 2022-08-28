import { VASTObject, Icon } from "../model/vast";
import { createBeacon } from "./beacon";
import { MacroReplacer } from "../../util/macro";
import { convertTimeToSecond } from "../../util/time";

export function createIcons(iconEles: NodeList): Icon[] {
    let iconObjects: Icon[] = [];
    for (let icon of iconEles) {
        let iconEle = icon as Element;

        let width = parseInt(iconEle.getAttribute("width") || "10") || 10;
        let height = parseInt(iconEle.getAttribute("height") || "10") || 10;
        let x = "0px";
        let xPosition = iconEle.getAttribute("xPosition");
        if(xPosition) {
            if (xPosition === "left" || xPosition === "right") {
                x = xPosition;
            } else {
                x = xPosition + "px";
            }
        }
        let y = "0px";
        let yPosition = iconEle.getAttribute("yPosition");
        if(yPosition) {
            if (yPosition === "top" || yPosition === "bottom") {
                y = yPosition;
            } else {
                y = yPosition + "px";
            }
        }
        let offset = iconEle.getAttribute("offset");
        let start = 0;
        if (offset) start = convertTimeToSecond(offset);
        let duration = iconEle.getAttribute("duration");
        let end = null;
        if (duration) end = convertTimeToSecond(duration) + start;

        const staticResource = iconEle.querySelector(":scope>StaticResource");
        if (!staticResource || !staticResource.textContent) continue;
        const iconClickThrough = iconEle.querySelector(":scope>IconClicks>IconClickThrough");
        const iconClickTracking = iconEle.querySelector(":scope>IconClicks>IconClickTracking");

        iconObjects.push({
            width: width,
            height: height,
            xPosition: x,
            yPosition: y,
            start: start,
            end: end,
            imgUrl: staticResource.textContent,
            clickThroughUrl: iconClickThrough?.textContent ?? null,
            clickTrackingUrl: iconClickTracking?.textContent ?? null
        });
    }

    return iconObjects;
}

export function setIcons(video: HTMLVideoElement, iconParent: HTMLElement, vastObject: VASTObject, macroReplacer: MacroReplacer) {
    for (let creative of vastObject.creatives) {
        for (let iconObj of creative.linear.icons) {
            let icon = document.createElement("img");
            icon.src = iconObj.imgUrl;
            icon.width = iconObj.width;
            icon.height = iconObj.height;
            icon.style.position = "fixed";
            if (iconObj.xPosition === "left") {
                icon.style.left = "0px";
            } else if (iconObj.xPosition === "right") {
                icon.style.right = "0px";
            } else {
                icon.style.left = iconObj.xPosition;
            }
            if (iconObj.yPosition === "top") {
                icon.style.top = "0px";
            } else if (iconObj.yPosition === "bottom") {
                icon.style.bottom = "0px";
            } else {
                icon.style.top = iconObj.yPosition;
            }

            icon.addEventListener("click", function(e) {
                if (iconObj.clickTrackingUrl) {
                    createBeacon(video, iconObj.clickTrackingUrl, macroReplacer);
                }
                if (iconObj.clickThroughUrl) {
                    open(iconObj.clickThroughUrl, "_blank");
                }
            });

            video.addEventListener("timeupdate", function timeIconEvent(e) {
                if (!iconParent.contains(icon) && video.currentTime >= iconObj.start) {
                    iconParent.appendChild(icon);
                }
                if (iconObj.end && iconParent.contains(icon) && video.currentTime >= iconObj.end) {
                    iconParent.removeChild(icon);
                    video.removeEventListener("timeupdate", timeIconEvent);
                }
            });

            // end未定義のiconの削除
            if (!iconObj.end) {
                video.addEventListener("ended", function(e) {
                    if (iconParent.contains(icon)) {
                        iconParent.removeChild(icon);
                    }
                });
            }
        }
    }
}
