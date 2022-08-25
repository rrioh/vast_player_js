import { VASTObject } from "../interface/interface";
import { createBeacon } from "./beacon";
import { MacroReplacer } from "./macro";

export function setIcons(video: HTMLVideoElement, iconParent: HTMLElement, vastObject: VASTObject, macroReplacer: MacroReplacer) {
    for (let iconObj of vastObject.icons) {
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
