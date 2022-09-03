/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./lib/domain/service/beacon.ts":
/*!**************************************!*\
  !*** ./lib/domain/service/beacon.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createBeacon": () => (/* binding */ createBeacon),
/* harmony export */   "sendError": () => (/* binding */ sendError),
/* harmony export */   "setBeacons": () => (/* binding */ setBeacons)
/* harmony export */ });
function setImpressionUrl(video, urls, macroReplacer) {
    for (let url of urls) {
        video.addEventListener("canplay", function (e) {
            createBeacon(video, url, macroReplacer);
        }, { once: true });
    }
}
function setVideoClickThroughUrl(video, vastObject) {
    for (let creative of vastObject.creatives) {
        if (creative.linear.clickThrough) {
            const url = creative.linear.clickThrough.content;
            video.addEventListener("click", function (e) {
                open(url, "_blank");
            });
        }
    }
}
function setVideoClickTrackingUrls(video, vastObject, macroReplacer) {
    for (let creative of vastObject.creatives) {
        for (let clickTracking of creative.linear.clickTrackings) {
            const url = clickTracking.content;
            video.addEventListener("click", function (e) {
                createBeacon(video, url, macroReplacer);
            });
        }
    }
}
function setTrackingUrls(video, vastObject, macroReplacer) {
    video.addEventListener("loadedmetadata", function (e) {
        for (let creative of vastObject.creatives) {
            for (let [point, url] of creative.linear.trackingEvents) {
                if (point == "loaded") {
                    video.addEventListener("canplay", function (e) {
                        createBeacon(video, url, macroReplacer);
                    }, { once: true });
                }
                else if (point === "pause") {
                    video.addEventListener("pause", function (e) {
                        createBeacon(video, url, macroReplacer);
                    });
                }
                else if (typeof point === "number") {
                    video.addEventListener("timeupdate", function timeBeaconEvent(e) {
                        if (video.currentTime >= point) {
                            createBeacon(video, url, macroReplacer);
                            video.removeEventListener("timeupdate", timeBeaconEvent);
                        }
                    });
                }
            }
        }
    });
}
function createBeacon(parent, url, macroReplacer) {
    if (!url)
        return;
    let date = new Date();
    let ele = document.createElement("img");
    url = macroReplacer(url, null);
    ele.src = url;
    ele.style.display = "none";
    parent.prepend(ele);
    console.log("[DEBUG] beacon sent: " + url);
}
function sendError(urls, errorCode, macroReplacer) {
    if (!urls)
        return;
    for (let url of urls) {
        url = url.replace(/\[ERRORCODE\]/, errorCode.toString());
        createBeacon(document.body, url, macroReplacer);
    }
}
function setBeacons(video, vastObject, macroReplacer) {
    setImpressionUrl(video, vastObject.impressionUrls, macroReplacer);
    setVideoClickThroughUrl(video, vastObject);
    setVideoClickTrackingUrls(video, vastObject, macroReplacer);
    setTrackingUrls(video, vastObject, macroReplacer);
}


/***/ }),

/***/ "./lib/domain/service/icon.ts":
/*!************************************!*\
  !*** ./lib/domain/service/icon.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createIcons": () => (/* binding */ createIcons),
/* harmony export */   "setIcons": () => (/* binding */ setIcons)
/* harmony export */ });
/* harmony import */ var _beacon__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./beacon */ "./lib/domain/service/beacon.ts");
/* harmony import */ var _util_time__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../util/time */ "./lib/util/time.ts");


function createIcons(iconEles) {
    let iconObjects = [];
    for (let icon of iconEles) {
        let iconEle = icon;
        let width = parseInt(iconEle.getAttribute("width") || "10") || 10;
        let height = parseInt(iconEle.getAttribute("height") || "10") || 10;
        let x = "0px";
        let xPosition = iconEle.getAttribute("xPosition");
        if (xPosition) {
            if (xPosition === "left" || xPosition === "right") {
                x = xPosition;
            }
            else {
                x = xPosition + "px";
            }
        }
        let y = "0px";
        let yPosition = iconEle.getAttribute("yPosition");
        if (yPosition) {
            if (yPosition === "top" || yPosition === "bottom") {
                y = yPosition;
            }
            else {
                y = yPosition + "px";
            }
        }
        let offset = iconEle.getAttribute("offset");
        let start = 0;
        if (offset)
            start = (0,_util_time__WEBPACK_IMPORTED_MODULE_1__.convertTimeToSecond)(offset);
        let duration = iconEle.getAttribute("duration");
        let end = null;
        if (duration)
            end = (0,_util_time__WEBPACK_IMPORTED_MODULE_1__.convertTimeToSecond)(duration) + start;
        const staticResource = iconEle.querySelector(":scope>StaticResource");
        if (!staticResource || !staticResource.textContent)
            continue;
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
function setIcons(video, iconParent, vastObject, macroReplacer) {
    for (let creative of vastObject.creatives) {
        for (let iconObj of creative.linear.icons) {
            let icon = document.createElement("img");
            icon.src = iconObj.imgUrl;
            icon.width = iconObj.width;
            icon.height = iconObj.height;
            icon.style.position = "fixed";
            if (iconObj.xPosition === "left") {
                icon.style.left = "0px";
            }
            else if (iconObj.xPosition === "right") {
                icon.style.right = "0px";
            }
            else {
                icon.style.left = iconObj.xPosition;
            }
            if (iconObj.yPosition === "top") {
                icon.style.top = "0px";
            }
            else if (iconObj.yPosition === "bottom") {
                icon.style.bottom = "0px";
            }
            else {
                icon.style.top = iconObj.yPosition;
            }
            icon.addEventListener("click", function (e) {
                if (iconObj.clickTrackingUrl) {
                    (0,_beacon__WEBPACK_IMPORTED_MODULE_0__.createBeacon)(video, iconObj.clickTrackingUrl, macroReplacer);
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
                video.addEventListener("ended", function (e) {
                    if (iconParent.contains(icon)) {
                        iconParent.removeChild(icon);
                    }
                });
            }
        }
    }
}


/***/ }),

/***/ "./lib/domain/service/vast.ts":
/*!************************************!*\
  !*** ./lib/domain/service/vast.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "vast": () => (/* binding */ vast)
/* harmony export */ });
/* harmony import */ var _beacon__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./beacon */ "./lib/domain/service/beacon.ts");
/* harmony import */ var _icon__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./icon */ "./lib/domain/service/icon.ts");
/* harmony import */ var _util_macro__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../util/macro */ "./lib/util/macro.ts");
/* harmony import */ var _util_time__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../util/time */ "./lib/util/time.ts");




const WRAPPER_MAX = 5;
const TRACKING_EVENT_POINT = new Map([
    ["start", 0],
    ["firstQuartile", 1 / 4],
    ["midpoint", 1 / 2],
    ["thirdQuartile", 3 / 4],
    ["complete", 1]
]);
function initVastObject() {
    return {
        errorUrls: [],
        impressionUrls: [],
        adTitle: "",
        adDesc: "",
        creatives: []
    };
}
class Vast {
    constructor() {
    }
    isWrapper(vEle) {
        const wrapperEle = vEle.querySelector(":scope>Ad>Wrapper");
        if (wrapperEle) {
            return true;
        }
        return false;
    }
    async nextVast(vEle) {
        const vastAdTagURIEle = vEle.querySelector(":scope>Ad>Wrapper>VASTAdTagURI");
        if (!vastAdTagURIEle || !vastAdTagURIEle.textContent) {
            throw new Error("next vast url error");
        }
        let url = vastAdTagURIEle.textContent;
        const res = await fetch(url);
        const data = await res.text();
        return data;
    }
    async parseVast(sourceVast, macroReplacer) {
        try {
            let vastObject = initVastObject();
            for (let i = 1; i <= WRAPPER_MAX; i++) {
                // parse VAST to Object
                let vastEle = this.parseVastXML(sourceVast);
                if (this.isWrapper(vastEle)) {
                    if (i == WRAPPER_MAX) {
                        throw new Error("too many wrapper");
                    }
                    vastObject = this.updateWrapperVastObject(vastObject, vastEle, macroReplacer);
                    sourceVast = await this.nextVast(vastEle);
                }
                else {
                    vastObject = this.updateInlineVastObject(vastObject, vastEle, macroReplacer);
                    break;
                }
            }
            return vastObject;
        }
        catch (e) {
            console.log("[ERROR] cannot create VASTObject: " + e);
            return null;
        }
    }
    parseVastXML(sourceVast) {
        const parser = new DOMParser();
        let xmlDoc = parser.parseFromString(sourceVast, "application/xml");
        let parserError = xmlDoc.querySelector("parsererror");
        if (parserError) {
            throw new Error(parserError.textContent || "parse vast error");
        }
        let vastEle = xmlDoc.querySelector("VAST");
        if (!vastEle) {
            throw new Error("VAST tag not found");
        }
        return vastEle;
    }
    updateWrapperVastObject(vastObject, vEle, macroReplacer) {
        let errorUrls = [];
        const rootErrorEle = vEle.querySelector(":scope>Error");
        if (rootErrorEle && rootErrorEle.textContent)
            errorUrls.push(rootErrorEle.textContent);
        const wrapperEle = vEle.querySelector(":scope>Ad>Wrapper");
        if (!wrapperEle) {
            (0,_beacon__WEBPACK_IMPORTED_MODULE_0__.sendError)(errorUrls, _util_macro__WEBPACK_IMPORTED_MODULE_2__.ErrorCode.NoVASTResponseAfterWrapper, macroReplacer);
            throw new Error("parse Wrapper error");
        }
        const errorEle = wrapperEle.querySelector(":scope>Error");
        if (errorEle && errorEle.textContent)
            errorUrls.push(errorEle.textContent);
        const impEle = wrapperEle.querySelector(":scope>Impression");
        if (!impEle || !impEle.textContent) {
            (0,_beacon__WEBPACK_IMPORTED_MODULE_0__.sendError)(errorUrls, _util_macro__WEBPACK_IMPORTED_MODULE_2__.ErrorCode.XMLParseError, macroReplacer);
            throw new Error("parse Wrapper Impression error");
        }
        const impressionUrl = impEle.textContent;
        const linearEle = wrapperEle.querySelector(":scope>Creatives>Creative>Linear");
        if (!linearEle) {
            vastObject.errorUrls = vastObject.errorUrls.concat(errorUrls);
            vastObject.impressionUrls.push(impressionUrl);
            return vastObject;
        }
        const durationEle = linearEle.querySelector(":scope>Duration");
        if (!durationEle || !durationEle.textContent) {
            (0,_beacon__WEBPACK_IMPORTED_MODULE_0__.sendError)(errorUrls, _util_macro__WEBPACK_IMPORTED_MODULE_2__.ErrorCode.XMLParseError, macroReplacer);
            throw new Error("parse Wrapper Linear Duration error");
        }
        const duration = (0,_util_time__WEBPACK_IMPORTED_MODULE_3__.convertTimeToSecond)(durationEle.textContent);
        const trackingsEles = linearEle.querySelectorAll(":scope>TrackingEvents>Tracking");
        const trackingMap = this.createTrackingObject(trackingsEles, duration);
        const iconEles = linearEle.querySelectorAll(":scope>Icons>Icon");
        const icons = (0,_icon__WEBPACK_IMPORTED_MODULE_1__.createIcons)(iconEles);
        const videoClicksEle = linearEle.querySelector(":scope>VideoClicks");
        let clickThrough = null;
        let clickTracking = [];
        if (videoClicksEle) {
            const clickThroughEle = videoClicksEle.querySelector(":scope>ClickThrough");
            if (clickThroughEle && clickThroughEle.textContent) {
                clickThrough = {
                    content: clickThroughEle.textContent
                };
            }
            const clickTrackingEles = videoClicksEle.querySelectorAll(":scope>ClickTracking");
            for (let clickTrackingEle of clickTrackingEles) {
                if (clickTrackingEle.textContent) {
                    clickTracking.push({
                        content: clickTrackingEle.textContent
                    });
                }
            }
        }
        vastObject.errorUrls = vastObject.errorUrls.concat(errorUrls);
        vastObject.impressionUrls.push(impressionUrl);
        vastObject.creatives.push({
            linear: {
                duration: duration,
                mediaFiles: [],
                trackingEvents: trackingMap,
                clickThrough: clickThrough,
                clickTrackings: clickTracking,
                icons: icons
            }
        });
        return vastObject;
    }
    updateInlineVastObject(vastObject, vEle, macroReplacer) {
        let errorUrls = [];
        const rootErrorEle = vEle.querySelector(":scope>Error");
        if (rootErrorEle && rootErrorEle.textContent)
            errorUrls.push(rootErrorEle.textContent);
        const inlineEle = vEle.querySelector(":scope>Ad>InLine");
        if (!inlineEle) {
            (0,_beacon__WEBPACK_IMPORTED_MODULE_0__.sendError)(errorUrls, _util_macro__WEBPACK_IMPORTED_MODULE_2__.ErrorCode.NoVASTResponseAfterWrapper, macroReplacer);
            throw new Error("parse InLine error");
        }
        const errorEle = inlineEle.querySelector(":scope>Error");
        if (errorEle && errorEle.textContent)
            errorUrls.push(errorEle.textContent);
        const impEle = inlineEle.querySelector(":scope>Impression");
        if (!impEle || !impEle.textContent) {
            (0,_beacon__WEBPACK_IMPORTED_MODULE_0__.sendError)(errorUrls, _util_macro__WEBPACK_IMPORTED_MODULE_2__.ErrorCode.XMLParseError, macroReplacer);
            throw new Error("parse InLine Impression error");
        }
        const impressionUrl = impEle.textContent;
        const adTitleEle = inlineEle.querySelector(":scope>AdTitle");
        if (!adTitleEle || !adTitleEle.textContent) {
            (0,_beacon__WEBPACK_IMPORTED_MODULE_0__.sendError)(errorUrls, _util_macro__WEBPACK_IMPORTED_MODULE_2__.ErrorCode.XMLParseError, macroReplacer);
            throw new Error("parse InLine AdTitle error");
        }
        const adTitle = adTitleEle.textContent;
        let adDesc = null;
        const adDescEle = inlineEle.querySelector(":scope>Description");
        if (adDescEle && adDescEle.textContent) {
            adDesc = adDescEle.textContent;
        }
        const linearEle = inlineEle.querySelector(":scope>Creatives>Creative>Linear");
        if (!linearEle) {
            (0,_beacon__WEBPACK_IMPORTED_MODULE_0__.sendError)(errorUrls, _util_macro__WEBPACK_IMPORTED_MODULE_2__.ErrorCode.XMLParseError, macroReplacer);
            throw new Error("parse InLine Linear error");
        }
        const durationEle = linearEle.querySelector(":scope>Duration");
        if (!durationEle || !durationEle.textContent) {
            (0,_beacon__WEBPACK_IMPORTED_MODULE_0__.sendError)(errorUrls, _util_macro__WEBPACK_IMPORTED_MODULE_2__.ErrorCode.XMLParseError, macroReplacer);
            throw new Error("parse InLine Linear Duration error");
        }
        const duration = (0,_util_time__WEBPACK_IMPORTED_MODULE_3__.convertTimeToSecond)(durationEle.textContent);
        const trackingsEles = linearEle.querySelectorAll(":scope>TrackingEvents>Tracking");
        const trackingMap = this.createTrackingObject(trackingsEles, duration);
        const iconEles = linearEle.querySelectorAll(":scope>Icons>Icon");
        const icons = (0,_icon__WEBPACK_IMPORTED_MODULE_1__.createIcons)(iconEles);
        const mediaFileEles = linearEle.querySelectorAll(":scope>MediaFiles>MediaFile");
        if (!mediaFileEles) {
            (0,_beacon__WEBPACK_IMPORTED_MODULE_0__.sendError)(errorUrls, _util_macro__WEBPACK_IMPORTED_MODULE_2__.ErrorCode.XMLParseError, macroReplacer);
            throw new Error("parse MediaFiles error");
        }
        // ひとまず1つ目のMediaFileのURLのみ取得
        const mediaFileUrl = mediaFileEles[0]?.textContent;
        const videoClicksEle = linearEle.querySelector(":scope>VideoClicks");
        let clickThrough = null;
        let clickTracking = [];
        if (videoClicksEle) {
            const clickThroughEle = videoClicksEle.querySelector(":scope>ClickThrough");
            if (!clickThroughEle || !clickThroughEle.textContent) {
                (0,_beacon__WEBPACK_IMPORTED_MODULE_0__.sendError)(errorUrls, _util_macro__WEBPACK_IMPORTED_MODULE_2__.ErrorCode.XMLParseError, macroReplacer);
                throw new Error("parse InLine Linear ClickThrough error");
            }
            clickThrough = {
                content: clickThroughEle.textContent
            };
            const clickTrackingEles = videoClicksEle.querySelectorAll(":scope>ClickTracking");
            for (let clickTrackingEle of clickTrackingEles) {
                if (clickTrackingEle.textContent) {
                    clickTracking.push({
                        content: clickTrackingEle.textContent
                    });
                }
            }
        }
        vastObject.errorUrls = vastObject.errorUrls.concat(errorUrls);
        vastObject.impressionUrls.push(impressionUrl);
        vastObject.adTitle = adTitle;
        vastObject.adDesc = adDesc;
        vastObject.creatives.push({
            linear: {
                duration: duration,
                mediaFiles: [
                    {
                        content: mediaFileUrl
                    }
                ],
                trackingEvents: trackingMap,
                clickThrough: clickThrough,
                clickTrackings: clickTracking,
                icons: icons
            }
        });
        return vastObject;
    }
    createTrackingObject(trackingEles, duration) {
        const trackingMap = new Map();
        trackingEles.forEach(function (tracking) {
            if (!tracking.textContent)
                return;
            const event = tracking.getAttribute("event");
            if (!event)
                return;
            if (event === "progress") {
                const offset = tracking.getAttribute("offset");
                if (!offset)
                    return;
                const offsetSecond = (0,_util_time__WEBPACK_IMPORTED_MODULE_3__.convertTimeToSecond)(offset);
                trackingMap.set(offsetSecond, tracking.textContent);
            }
            else {
                const event_point = TRACKING_EVENT_POINT.get(event);
                if (event_point != undefined) {
                    trackingMap.set(event_point * duration, tracking.textContent);
                }
                else {
                    trackingMap.set(event, tracking.textContent);
                }
            }
        });
        return trackingMap;
    }
}
const vast = new Vast();


/***/ }),

/***/ "./lib/index.ts":
/*!**********************!*\
  !*** ./lib/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createReplacer": () => (/* reexport safe */ _util_macro__WEBPACK_IMPORTED_MODULE_3__.createReplacer),
/* harmony export */   "getMediaType": () => (/* reexport safe */ _util_video__WEBPACK_IMPORTED_MODULE_4__.getMediaType),
/* harmony export */   "setBeacons": () => (/* reexport safe */ _domain_service_beacon__WEBPACK_IMPORTED_MODULE_1__.setBeacons),
/* harmony export */   "setIcons": () => (/* reexport safe */ _domain_service_icon__WEBPACK_IMPORTED_MODULE_2__.setIcons),
/* harmony export */   "vast": () => (/* reexport safe */ _domain_service_vast__WEBPACK_IMPORTED_MODULE_0__.vast)
/* harmony export */ });
/* harmony import */ var _domain_service_vast__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./domain/service/vast */ "./lib/domain/service/vast.ts");
/* harmony import */ var _domain_service_beacon__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./domain/service/beacon */ "./lib/domain/service/beacon.ts");
/* harmony import */ var _domain_service_icon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./domain/service/icon */ "./lib/domain/service/icon.ts");
/* harmony import */ var _util_macro__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util/macro */ "./lib/util/macro.ts");
/* harmony import */ var _util_video__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./util/video */ "./lib/util/video.ts");







/***/ }),

/***/ "./lib/util/macro.ts":
/*!***************************!*\
  !*** ./lib/util/macro.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ErrorCode": () => (/* binding */ ErrorCode),
/* harmony export */   "createReplacer": () => (/* binding */ createReplacer)
/* harmony export */ });
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["XMLParseError"] = 100] = "XMLParseError";
    ErrorCode[ErrorCode["VASTSchemaValidationError"] = 101] = "VASTSchemaValidationError";
    ErrorCode[ErrorCode["VASTVersionOfResponseNotSupported"] = 102] = "VASTVersionOfResponseNotSupported";
    ErrorCode[ErrorCode["NonPlayableAdType"] = 200] = "NonPlayableAdType";
    ErrorCode[ErrorCode["MediaPlayerExpectingDifferentLinearity"] = 201] = "MediaPlayerExpectingDifferentLinearity";
    ErrorCode[ErrorCode["MediaPlayerExpectingDifferentDuration"] = 202] = "MediaPlayerExpectingDifferentDuration";
    ErrorCode[ErrorCode["MediaPlayerExpectingDifferentSize"] = 203] = "MediaPlayerExpectingDifferentSize";
    ErrorCode[ErrorCode["AdCategoryNotProvided"] = 204] = "AdCategoryNotProvided";
    ErrorCode[ErrorCode["InlineCategoryViolatesWrapperBlockedAdCategories"] = 205] = "InlineCategoryViolatesWrapperBlockedAdCategories";
    ErrorCode[ErrorCode["AdNotServed"] = 206] = "AdNotServed";
    ErrorCode[ErrorCode["GeneralWrapperError"] = 300] = "GeneralWrapperError";
    ErrorCode[ErrorCode["VASTURIUnavailableOrTimeout"] = 301] = "VASTURIUnavailableOrTimeout";
    ErrorCode[ErrorCode["WrapperLimitReached"] = 302] = "WrapperLimitReached";
    ErrorCode[ErrorCode["NoVASTResponseAfterWrapper"] = 303] = "NoVASTResponseAfterWrapper";
    ErrorCode[ErrorCode["AdUnitNotDisplayed"] = 304] = "AdUnitNotDisplayed";
    ErrorCode[ErrorCode["GeneralLinearError"] = 400] = "GeneralLinearError";
    ErrorCode[ErrorCode["FileNotFound"] = 401] = "FileNotFound";
    ErrorCode[ErrorCode["MediaFileURITimeout"] = 402] = "MediaFileURITimeout";
    ErrorCode[ErrorCode["SupportedMediaFileNotFound"] = 403] = "SupportedMediaFileNotFound";
    ErrorCode[ErrorCode["ProblemDisplayingMediaFile"] = 405] = "ProblemDisplayingMediaFile";
    ErrorCode[ErrorCode["MezzanineNotProvided"] = 406] = "MezzanineNotProvided";
    ErrorCode[ErrorCode["MezzanineDownloading"] = 407] = "MezzanineDownloading";
    ErrorCode[ErrorCode["ConditionalAdRejected"] = 408] = "ConditionalAdRejected";
    ErrorCode[ErrorCode["InteractiveUnitNotExecuted"] = 409] = "InteractiveUnitNotExecuted";
    ErrorCode[ErrorCode["VerificationUnitNotExecuted"] = 410] = "VerificationUnitNotExecuted";
    ErrorCode[ErrorCode["NotRequiredSpecificationOfMezzanine"] = 411] = "NotRequiredSpecificationOfMezzanine";
    ErrorCode[ErrorCode["GeneralNonLinearAdsError"] = 500] = "GeneralNonLinearAdsError";
    ErrorCode[ErrorCode["NonLinearAdNonDisplayable"] = 501] = "NonLinearAdNonDisplayable";
    ErrorCode[ErrorCode["UnableToFetchNonLinearResource"] = 502] = "UnableToFetchNonLinearResource";
    ErrorCode[ErrorCode["SupportedNonLinearResourceNotFound"] = 503] = "SupportedNonLinearResourceNotFound";
    ErrorCode[ErrorCode["GeneralCompanionAdsError"] = 600] = "GeneralCompanionAdsError";
    ErrorCode[ErrorCode["CompanionNonDisplayableByDimemsionError"] = 601] = "CompanionNonDisplayableByDimemsionError";
    ErrorCode[ErrorCode["RequiredCompanionNonDisplayable"] = 602] = "RequiredCompanionNonDisplayable";
    ErrorCode[ErrorCode["UnableToFetchNonCompanionResource"] = 603] = "UnableToFetchNonCompanionResource";
    ErrorCode[ErrorCode["SupportedCompanionResourceNotFound"] = 604] = "SupportedCompanionResourceNotFound";
    ErrorCode[ErrorCode["UndefinedError"] = 900] = "UndefinedError";
    ErrorCode[ErrorCode["GeneralVPAIDError"] = 901] = "GeneralVPAIDError";
    ErrorCode[ErrorCode["GeneralInteractiveCreativeFileError"] = 902] = "GeneralInteractiveCreativeFileError";
})(ErrorCode || (ErrorCode = {}));
function createReplacer(videoParent) {
    let replaceMap = new Map();
    // time stamp
    replaceMap.set("[TIMESTAMP]", getTimestamp());
    // inview ratio
    const inviewRatioMgr = {
        ratio: 0
    };
    const options = {
        rootMargin: "0px",
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
    };
    function callback(entries) {
        entries.forEach(function (entry) {
            const ratio = Math.floor(entry.intersectionRatio * 100) / 100;
            inviewRatioMgr.ratio = ratio;
        });
    }
    const observer = new IntersectionObserver(callback, options);
    observer.observe(videoParent);
    replaceMap.set("[INVIEW_RATIO]", getInviewRatio(inviewRatioMgr));
    return (target, errorCode) => {
        console.log("REPLACE MAP:");
        console.log(replaceMap);
        if (errorCode) {
            replaceMap.set("[ERRORCODE]", errorCode.toString());
        }
        replaceMap.forEach((value, key) => {
            console.log("REPLACER KEY: " + key);
            console.log("REPLACER VALUE: ");
            console.log(value);
            target = target.replace(key, typeof value === "function" ? value() : value);
        });
        return target;
    };
}
function getTimestamp() {
    return () => {
        let date = new Date();
        return date.toISOString();
    };
}
function getInviewRatio(inviewRatioMgr) {
    return () => {
        return inviewRatioMgr.ratio.toFixed(2);
    };
}


/***/ }),

/***/ "./lib/util/time.ts":
/*!**************************!*\
  !*** ./lib/util/time.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "convertTimeToSecond": () => (/* binding */ convertTimeToSecond)
/* harmony export */ });
function convertTimeToSecond(durationStr) {
    let result = durationStr.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (!result || result.length < 4 || parseInt(result[1]) === NaN || parseInt(result[2]) === NaN || parseInt(result[3]) === NaN) {
        throw new Error("convertdurationToSecond error: " + durationStr);
    }
    return parseInt(result[1]) * 60 * 60 + parseInt(result[2]) * 60 + parseFloat(result[3]);
}


/***/ }),

/***/ "./lib/util/video.ts":
/*!***************************!*\
  !*** ./lib/util/video.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getMediaType": () => (/* binding */ getMediaType)
/* harmony export */ });
function getMediaType(url) {
    if (/\.mp4$/.test(url)) {
        return "video/mp4";
    }
    else if (/\.mov$/.test(url)) {
        return "video/quicktime";
    }
    else if (/\.mpg$/.test(url) || /\.mpeg$/.test(url)) {
        return "video/mpeg";
    }
    else if (/\.webm$/.test(url)) {
        return "video/webm";
    }
    else {
        return "";
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lib_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/index */ "./lib/index.ts");

const container = `
<!DOCTYPE html>
<html>
    <head>
    </head>
    <body style="margin:0;">
        <div id="vast_video_container">
            <div id="vast_video" style="width:300px;height:168.75px;"></div>
            <div id="progress_bar" style="width:50%;height:3px;background-color:gray;"></div>
            <div id="ad_text" style="margin:0;width:300px;height:78.25px;background-color:#dcdcdc;">
                <div id="ad_title" style="font-size:15px;font-weight:bold;"></div>
                <div id="ad_desc" style="font-size:10px;"></div>
            </div>
        </div>
    </body>
</html>
`;
const inlineVastSample = `
<VAST version="4.2">
  <Error>
    <![CDATA[http://test.example/error?code=[ERRORCODE]&clientTime=[TIMESTAMP]]]>
  </Error>
  <Ad id="1b330e59-3a62-4000-b9fb-ac9726e98c52" sequence="1">
    <Wrapper>
      <Impression><![CDATA[https://wrapper.test.example/impression?clientTime=[TIMESTAMP]&inview_ratio=[INVIEW_RATIO]]]></Impression>
      <VASTAdTagURI>
        <![CDATA[http://localhost:8080/sample/inline.html]]>
      </VASTAdTagURI>
    </Wrapper>
  </Ad>
</VAST>
`;
class VastExecutor {
    async startPlayer(sourceVast) {
        console.log("setPlayer started...");
        try {
            let iframe = document.createElement("iframe");
            iframe.width = "300px";
            iframe.height = "250px";
            iframe.style.border = "none";
            document.getElementById("playerbox")?.appendChild(iframe);
            let iDoc = iframe.contentWindow.document;
            iDoc.open();
            iDoc.write(container);
            iDoc.close();
            iDoc.documentElement.style.overflow = "hidden";
            let vastVideoDiv = iDoc.getElementById("vast_video");
            const macroReplacer = _lib_index__WEBPACK_IMPORTED_MODULE_0__.createReplacer(vastVideoDiv);
            sourceVast = inlineVastSample;
            const vastObject = await _lib_index__WEBPACK_IMPORTED_MODULE_0__.vast.parseVast(sourceVast, macroReplacer);
            if (!vastObject) {
                return;
            }
            let adTitleDiv = iDoc.getElementById("ad_title");
            adTitleDiv.textContent = vastObject.adTitle;
            let adDescDiv = iDoc.getElementById("ad_desc");
            if (vastObject.adDesc) {
                adDescDiv.textContent = vastObject.adDesc;
            }
            let video = document.createElement("video");
            for (let creative of vastObject.creatives) {
                for (let mediaFile of creative.linear.mediaFiles) {
                    let source = document.createElement("source");
                    source.src = mediaFile.content;
                    let mediaType = _lib_index__WEBPACK_IMPORTED_MODULE_0__.getMediaType(mediaFile.content);
                    if (mediaType) {
                        source.type = mediaType;
                    }
                    video.appendChild(source);
                }
            }
            //video.src = vastObject.mediaFileUrl;
            video.style.width = "100%";
            video.style.height = "100%";
            video.muted = true;
            video.autoplay = true;
            // loadedmetadataイベント後でないとdurationが取れない
            video.addEventListener("loadedmetadata", function (e) {
                let progressbar = iDoc.getElementById("progress_bar");
                let barAnimationLoop = function () {
                    let progressPoint = video.currentTime / video.duration * 100;
                    progressbar.style.width = progressPoint + "%";
                    requestAnimationFrame(barAnimationLoop);
                };
                requestAnimationFrame(barAnimationLoop);
            });
            _lib_index__WEBPACK_IMPORTED_MODULE_0__.setBeacons(video, vastObject, macroReplacer);
            _lib_index__WEBPACK_IMPORTED_MODULE_0__.setIcons(video, vastVideoDiv, vastObject, macroReplacer);
            // IntersectionObserver
            // 50%画面内に入ったら再生、出たら停止
            const options = {
                rootMargin: "0px",
                threshold: 0.5
            };
            function callback(entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        video.play();
                    }
                    else {
                        video.pause();
                    }
                });
            }
            const observer = new IntersectionObserver(callback, options);
            observer.observe(video);
            vastVideoDiv.appendChild(video);
        }
        catch (e) {
            console.log("cannot start Player: " + e);
        }
    }
}
const vastExecutor = new VastExecutor();
window.vastExecutor = window.vastExecutor || vastExecutor;

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly92YXN0X3BsYXllcl9qcy8uL2xpYi9kb21haW4vc2VydmljZS9iZWFjb24udHMiLCJ3ZWJwYWNrOi8vdmFzdF9wbGF5ZXJfanMvLi9saWIvZG9tYWluL3NlcnZpY2UvaWNvbi50cyIsIndlYnBhY2s6Ly92YXN0X3BsYXllcl9qcy8uL2xpYi9kb21haW4vc2VydmljZS92YXN0LnRzIiwid2VicGFjazovL3Zhc3RfcGxheWVyX2pzLy4vbGliL2luZGV4LnRzIiwid2VicGFjazovL3Zhc3RfcGxheWVyX2pzLy4vbGliL3V0aWwvbWFjcm8udHMiLCJ3ZWJwYWNrOi8vdmFzdF9wbGF5ZXJfanMvLi9saWIvdXRpbC90aW1lLnRzIiwid2VicGFjazovL3Zhc3RfcGxheWVyX2pzLy4vbGliL3V0aWwvdmlkZW8udHMiLCJ3ZWJwYWNrOi8vdmFzdF9wbGF5ZXJfanMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdmFzdF9wbGF5ZXJfanMvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3Zhc3RfcGxheWVyX2pzL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vdmFzdF9wbGF5ZXJfanMvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly92YXN0X3BsYXllcl9qcy8uL3NyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIHNldEltcHJlc3Npb25VcmwodmlkZW8sIHVybHMsIG1hY3JvUmVwbGFjZXIpIHtcbiAgICBmb3IgKGxldCB1cmwgb2YgdXJscykge1xuICAgICAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKFwiY2FucGxheVwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgY3JlYXRlQmVhY29uKHZpZGVvLCB1cmwsIG1hY3JvUmVwbGFjZXIpO1xuICAgICAgICB9LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgfVxufVxuZnVuY3Rpb24gc2V0VmlkZW9DbGlja1Rocm91Z2hVcmwodmlkZW8sIHZhc3RPYmplY3QpIHtcbiAgICBmb3IgKGxldCBjcmVhdGl2ZSBvZiB2YXN0T2JqZWN0LmNyZWF0aXZlcykge1xuICAgICAgICBpZiAoY3JlYXRpdmUubGluZWFyLmNsaWNrVGhyb3VnaCkge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gY3JlYXRpdmUubGluZWFyLmNsaWNrVGhyb3VnaC5jb250ZW50O1xuICAgICAgICAgICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgb3Blbih1cmwsIFwiX2JsYW5rXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBzZXRWaWRlb0NsaWNrVHJhY2tpbmdVcmxzKHZpZGVvLCB2YXN0T2JqZWN0LCBtYWNyb1JlcGxhY2VyKSB7XG4gICAgZm9yIChsZXQgY3JlYXRpdmUgb2YgdmFzdE9iamVjdC5jcmVhdGl2ZXMpIHtcbiAgICAgICAgZm9yIChsZXQgY2xpY2tUcmFja2luZyBvZiBjcmVhdGl2ZS5saW5lYXIuY2xpY2tUcmFja2luZ3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IGNsaWNrVHJhY2tpbmcuY29udGVudDtcbiAgICAgICAgICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZUJlYWNvbih2aWRlbywgdXJsLCBtYWNyb1JlcGxhY2VyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gc2V0VHJhY2tpbmdVcmxzKHZpZGVvLCB2YXN0T2JqZWN0LCBtYWNyb1JlcGxhY2VyKSB7XG4gICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRlZG1ldGFkYXRhXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGZvciAobGV0IGNyZWF0aXZlIG9mIHZhc3RPYmplY3QuY3JlYXRpdmVzKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBbcG9pbnQsIHVybF0gb2YgY3JlYXRpdmUubGluZWFyLnRyYWNraW5nRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBvaW50ID09IFwibG9hZGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcihcImNhbnBsYXlcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUJlYWNvbih2aWRlbywgdXJsLCBtYWNyb1JlcGxhY2VyKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChwb2ludCA9PT0gXCJwYXVzZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoXCJwYXVzZVwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlQmVhY29uKHZpZGVvLCB1cmwsIG1hY3JvUmVwbGFjZXIpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHBvaW50ID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoXCJ0aW1ldXBkYXRlXCIsIGZ1bmN0aW9uIHRpbWVCZWFjb25FdmVudChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmlkZW8uY3VycmVudFRpbWUgPj0gcG9pbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVCZWFjb24odmlkZW8sIHVybCwgbWFjcm9SZXBsYWNlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRpbWV1cGRhdGVcIiwgdGltZUJlYWNvbkV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQmVhY29uKHBhcmVudCwgdXJsLCBtYWNyb1JlcGxhY2VyKSB7XG4gICAgaWYgKCF1cmwpXG4gICAgICAgIHJldHVybjtcbiAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgbGV0IGVsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgdXJsID0gbWFjcm9SZXBsYWNlcih1cmwsIG51bGwpO1xuICAgIGVsZS5zcmMgPSB1cmw7XG4gICAgZWxlLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICBwYXJlbnQucHJlcGVuZChlbGUpO1xuICAgIGNvbnNvbGUubG9nKFwiW0RFQlVHXSBiZWFjb24gc2VudDogXCIgKyB1cmwpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHNlbmRFcnJvcih1cmxzLCBlcnJvckNvZGUsIG1hY3JvUmVwbGFjZXIpIHtcbiAgICBpZiAoIXVybHMpXG4gICAgICAgIHJldHVybjtcbiAgICBmb3IgKGxldCB1cmwgb2YgdXJscykge1xuICAgICAgICB1cmwgPSB1cmwucmVwbGFjZSgvXFxbRVJST1JDT0RFXFxdLywgZXJyb3JDb2RlLnRvU3RyaW5nKCkpO1xuICAgICAgICBjcmVhdGVCZWFjb24oZG9jdW1lbnQuYm9keSwgdXJsLCBtYWNyb1JlcGxhY2VyKTtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gc2V0QmVhY29ucyh2aWRlbywgdmFzdE9iamVjdCwgbWFjcm9SZXBsYWNlcikge1xuICAgIHNldEltcHJlc3Npb25VcmwodmlkZW8sIHZhc3RPYmplY3QuaW1wcmVzc2lvblVybHMsIG1hY3JvUmVwbGFjZXIpO1xuICAgIHNldFZpZGVvQ2xpY2tUaHJvdWdoVXJsKHZpZGVvLCB2YXN0T2JqZWN0KTtcbiAgICBzZXRWaWRlb0NsaWNrVHJhY2tpbmdVcmxzKHZpZGVvLCB2YXN0T2JqZWN0LCBtYWNyb1JlcGxhY2VyKTtcbiAgICBzZXRUcmFja2luZ1VybHModmlkZW8sIHZhc3RPYmplY3QsIG1hY3JvUmVwbGFjZXIpO1xufVxuIiwiaW1wb3J0IHsgY3JlYXRlQmVhY29uIH0gZnJvbSBcIi4vYmVhY29uXCI7XG5pbXBvcnQgeyBjb252ZXJ0VGltZVRvU2Vjb25kIH0gZnJvbSBcIi4uLy4uL3V0aWwvdGltZVwiO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUljb25zKGljb25FbGVzKSB7XG4gICAgbGV0IGljb25PYmplY3RzID0gW107XG4gICAgZm9yIChsZXQgaWNvbiBvZiBpY29uRWxlcykge1xuICAgICAgICBsZXQgaWNvbkVsZSA9IGljb247XG4gICAgICAgIGxldCB3aWR0aCA9IHBhcnNlSW50KGljb25FbGUuZ2V0QXR0cmlidXRlKFwid2lkdGhcIikgfHwgXCIxMFwiKSB8fCAxMDtcbiAgICAgICAgbGV0IGhlaWdodCA9IHBhcnNlSW50KGljb25FbGUuZ2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIpIHx8IFwiMTBcIikgfHwgMTA7XG4gICAgICAgIGxldCB4ID0gXCIwcHhcIjtcbiAgICAgICAgbGV0IHhQb3NpdGlvbiA9IGljb25FbGUuZ2V0QXR0cmlidXRlKFwieFBvc2l0aW9uXCIpO1xuICAgICAgICBpZiAoeFBvc2l0aW9uKSB7XG4gICAgICAgICAgICBpZiAoeFBvc2l0aW9uID09PSBcImxlZnRcIiB8fCB4UG9zaXRpb24gPT09IFwicmlnaHRcIikge1xuICAgICAgICAgICAgICAgIHggPSB4UG9zaXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB4ID0geFBvc2l0aW9uICsgXCJweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxldCB5ID0gXCIwcHhcIjtcbiAgICAgICAgbGV0IHlQb3NpdGlvbiA9IGljb25FbGUuZ2V0QXR0cmlidXRlKFwieVBvc2l0aW9uXCIpO1xuICAgICAgICBpZiAoeVBvc2l0aW9uKSB7XG4gICAgICAgICAgICBpZiAoeVBvc2l0aW9uID09PSBcInRvcFwiIHx8IHlQb3NpdGlvbiA9PT0gXCJib3R0b21cIikge1xuICAgICAgICAgICAgICAgIHkgPSB5UG9zaXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB5ID0geVBvc2l0aW9uICsgXCJweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxldCBvZmZzZXQgPSBpY29uRWxlLmdldEF0dHJpYnV0ZShcIm9mZnNldFwiKTtcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcbiAgICAgICAgaWYgKG9mZnNldClcbiAgICAgICAgICAgIHN0YXJ0ID0gY29udmVydFRpbWVUb1NlY29uZChvZmZzZXQpO1xuICAgICAgICBsZXQgZHVyYXRpb24gPSBpY29uRWxlLmdldEF0dHJpYnV0ZShcImR1cmF0aW9uXCIpO1xuICAgICAgICBsZXQgZW5kID0gbnVsbDtcbiAgICAgICAgaWYgKGR1cmF0aW9uKVxuICAgICAgICAgICAgZW5kID0gY29udmVydFRpbWVUb1NlY29uZChkdXJhdGlvbikgKyBzdGFydDtcbiAgICAgICAgY29uc3Qgc3RhdGljUmVzb3VyY2UgPSBpY29uRWxlLnF1ZXJ5U2VsZWN0b3IoXCI6c2NvcGU+U3RhdGljUmVzb3VyY2VcIik7XG4gICAgICAgIGlmICghc3RhdGljUmVzb3VyY2UgfHwgIXN0YXRpY1Jlc291cmNlLnRleHRDb250ZW50KVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIGNvbnN0IGljb25DbGlja1Rocm91Z2ggPSBpY29uRWxlLnF1ZXJ5U2VsZWN0b3IoXCI6c2NvcGU+SWNvbkNsaWNrcz5JY29uQ2xpY2tUaHJvdWdoXCIpO1xuICAgICAgICBjb25zdCBpY29uQ2xpY2tUcmFja2luZyA9IGljb25FbGUucXVlcnlTZWxlY3RvcihcIjpzY29wZT5JY29uQ2xpY2tzPkljb25DbGlja1RyYWNraW5nXCIpO1xuICAgICAgICBpY29uT2JqZWN0cy5wdXNoKHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgeFBvc2l0aW9uOiB4LFxuICAgICAgICAgICAgeVBvc2l0aW9uOiB5LFxuICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICAgICAgZW5kOiBlbmQsXG4gICAgICAgICAgICBpbWdVcmw6IHN0YXRpY1Jlc291cmNlLnRleHRDb250ZW50LFxuICAgICAgICAgICAgY2xpY2tUaHJvdWdoVXJsOiBpY29uQ2xpY2tUaHJvdWdoPy50ZXh0Q29udGVudCA/PyBudWxsLFxuICAgICAgICAgICAgY2xpY2tUcmFja2luZ1VybDogaWNvbkNsaWNrVHJhY2tpbmc/LnRleHRDb250ZW50ID8/IG51bGxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBpY29uT2JqZWN0cztcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRJY29ucyh2aWRlbywgaWNvblBhcmVudCwgdmFzdE9iamVjdCwgbWFjcm9SZXBsYWNlcikge1xuICAgIGZvciAobGV0IGNyZWF0aXZlIG9mIHZhc3RPYmplY3QuY3JlYXRpdmVzKSB7XG4gICAgICAgIGZvciAobGV0IGljb25PYmogb2YgY3JlYXRpdmUubGluZWFyLmljb25zKSB7XG4gICAgICAgICAgICBsZXQgaWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgICAgICAgICBpY29uLnNyYyA9IGljb25PYmouaW1nVXJsO1xuICAgICAgICAgICAgaWNvbi53aWR0aCA9IGljb25PYmoud2lkdGg7XG4gICAgICAgICAgICBpY29uLmhlaWdodCA9IGljb25PYmouaGVpZ2h0O1xuICAgICAgICAgICAgaWNvbi5zdHlsZS5wb3NpdGlvbiA9IFwiZml4ZWRcIjtcbiAgICAgICAgICAgIGlmIChpY29uT2JqLnhQb3NpdGlvbiA9PT0gXCJsZWZ0XCIpIHtcbiAgICAgICAgICAgICAgICBpY29uLnN0eWxlLmxlZnQgPSBcIjBweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaWNvbk9iai54UG9zaXRpb24gPT09IFwicmlnaHRcIikge1xuICAgICAgICAgICAgICAgIGljb24uc3R5bGUucmlnaHQgPSBcIjBweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWNvbi5zdHlsZS5sZWZ0ID0gaWNvbk9iai54UG9zaXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWNvbk9iai55UG9zaXRpb24gPT09IFwidG9wXCIpIHtcbiAgICAgICAgICAgICAgICBpY29uLnN0eWxlLnRvcCA9IFwiMHB4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpY29uT2JqLnlQb3NpdGlvbiA9PT0gXCJib3R0b21cIikge1xuICAgICAgICAgICAgICAgIGljb24uc3R5bGUuYm90dG9tID0gXCIwcHhcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGljb24uc3R5bGUudG9wID0gaWNvbk9iai55UG9zaXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpY29uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGlmIChpY29uT2JqLmNsaWNrVHJhY2tpbmdVcmwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlQmVhY29uKHZpZGVvLCBpY29uT2JqLmNsaWNrVHJhY2tpbmdVcmwsIG1hY3JvUmVwbGFjZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaWNvbk9iai5jbGlja1Rocm91Z2hVcmwpIHtcbiAgICAgICAgICAgICAgICAgICAgb3BlbihpY29uT2JqLmNsaWNrVGhyb3VnaFVybCwgXCJfYmxhbmtcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKFwidGltZXVwZGF0ZVwiLCBmdW5jdGlvbiB0aW1lSWNvbkV2ZW50KGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWljb25QYXJlbnQuY29udGFpbnMoaWNvbikgJiYgdmlkZW8uY3VycmVudFRpbWUgPj0gaWNvbk9iai5zdGFydCkge1xuICAgICAgICAgICAgICAgICAgICBpY29uUGFyZW50LmFwcGVuZENoaWxkKGljb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaWNvbk9iai5lbmQgJiYgaWNvblBhcmVudC5jb250YWlucyhpY29uKSAmJiB2aWRlby5jdXJyZW50VGltZSA+PSBpY29uT2JqLmVuZCkge1xuICAgICAgICAgICAgICAgICAgICBpY29uUGFyZW50LnJlbW92ZUNoaWxkKGljb24pO1xuICAgICAgICAgICAgICAgICAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKFwidGltZXVwZGF0ZVwiLCB0aW1lSWNvbkV2ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIGVuZOacquWumue+qeOBrmljb27jga7liYrpmaRcbiAgICAgICAgICAgIGlmICghaWNvbk9iai5lbmQpIHtcbiAgICAgICAgICAgICAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKFwiZW5kZWRcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGljb25QYXJlbnQuY29udGFpbnMoaWNvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25QYXJlbnQucmVtb3ZlQ2hpbGQoaWNvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IHNlbmRFcnJvciB9IGZyb20gXCIuL2JlYWNvblwiO1xuaW1wb3J0IHsgY3JlYXRlSWNvbnMgfSBmcm9tIFwiLi9pY29uXCI7XG5pbXBvcnQgeyBFcnJvckNvZGUgfSBmcm9tIFwiLi4vLi4vdXRpbC9tYWNyb1wiO1xuaW1wb3J0IHsgY29udmVydFRpbWVUb1NlY29uZCB9IGZyb20gXCIuLi8uLi91dGlsL3RpbWVcIjtcbmNvbnN0IFdSQVBQRVJfTUFYID0gNTtcbmNvbnN0IFRSQUNLSU5HX0VWRU5UX1BPSU5UID0gbmV3IE1hcChbXG4gICAgW1wic3RhcnRcIiwgMF0sXG4gICAgW1wiZmlyc3RRdWFydGlsZVwiLCAxIC8gNF0sXG4gICAgW1wibWlkcG9pbnRcIiwgMSAvIDJdLFxuICAgIFtcInRoaXJkUXVhcnRpbGVcIiwgMyAvIDRdLFxuICAgIFtcImNvbXBsZXRlXCIsIDFdXG5dKTtcbmZ1bmN0aW9uIGluaXRWYXN0T2JqZWN0KCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGVycm9yVXJsczogW10sXG4gICAgICAgIGltcHJlc3Npb25VcmxzOiBbXSxcbiAgICAgICAgYWRUaXRsZTogXCJcIixcbiAgICAgICAgYWREZXNjOiBcIlwiLFxuICAgICAgICBjcmVhdGl2ZXM6IFtdXG4gICAgfTtcbn1cbmNsYXNzIFZhc3Qge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgIH1cbiAgICBpc1dyYXBwZXIodkVsZSkge1xuICAgICAgICBjb25zdCB3cmFwcGVyRWxlID0gdkVsZS5xdWVyeVNlbGVjdG9yKFwiOnNjb3BlPkFkPldyYXBwZXJcIik7XG4gICAgICAgIGlmICh3cmFwcGVyRWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGFzeW5jIG5leHRWYXN0KHZFbGUpIHtcbiAgICAgICAgY29uc3QgdmFzdEFkVGFnVVJJRWxlID0gdkVsZS5xdWVyeVNlbGVjdG9yKFwiOnNjb3BlPkFkPldyYXBwZXI+VkFTVEFkVGFnVVJJXCIpO1xuICAgICAgICBpZiAoIXZhc3RBZFRhZ1VSSUVsZSB8fCAhdmFzdEFkVGFnVVJJRWxlLnRleHRDb250ZW50KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJuZXh0IHZhc3QgdXJsIGVycm9yXCIpO1xuICAgICAgICB9XG4gICAgICAgIGxldCB1cmwgPSB2YXN0QWRUYWdVUklFbGUudGV4dENvbnRlbnQ7XG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHVybCk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXMudGV4dCgpO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgYXN5bmMgcGFyc2VWYXN0KHNvdXJjZVZhc3QsIG1hY3JvUmVwbGFjZXIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCB2YXN0T2JqZWN0ID0gaW5pdFZhc3RPYmplY3QoKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IFdSQVBQRVJfTUFYOyBpKyspIHtcbiAgICAgICAgICAgICAgICAvLyBwYXJzZSBWQVNUIHRvIE9iamVjdFxuICAgICAgICAgICAgICAgIGxldCB2YXN0RWxlID0gdGhpcy5wYXJzZVZhc3RYTUwoc291cmNlVmFzdCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNXcmFwcGVyKHZhc3RFbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09IFdSQVBQRVJfTUFYKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0b28gbWFueSB3cmFwcGVyXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhc3RPYmplY3QgPSB0aGlzLnVwZGF0ZVdyYXBwZXJWYXN0T2JqZWN0KHZhc3RPYmplY3QsIHZhc3RFbGUsIG1hY3JvUmVwbGFjZXIpO1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2VWYXN0ID0gYXdhaXQgdGhpcy5uZXh0VmFzdCh2YXN0RWxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhc3RPYmplY3QgPSB0aGlzLnVwZGF0ZUlubGluZVZhc3RPYmplY3QodmFzdE9iamVjdCwgdmFzdEVsZSwgbWFjcm9SZXBsYWNlcik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YXN0T2JqZWN0O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltFUlJPUl0gY2Fubm90IGNyZWF0ZSBWQVNUT2JqZWN0OiBcIiArIGUpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcGFyc2VWYXN0WE1MKHNvdXJjZVZhc3QpIHtcbiAgICAgICAgY29uc3QgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICAgICAgICBsZXQgeG1sRG9jID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyhzb3VyY2VWYXN0LCBcImFwcGxpY2F0aW9uL3htbFwiKTtcbiAgICAgICAgbGV0IHBhcnNlckVycm9yID0geG1sRG9jLnF1ZXJ5U2VsZWN0b3IoXCJwYXJzZXJlcnJvclwiKTtcbiAgICAgICAgaWYgKHBhcnNlckVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocGFyc2VyRXJyb3IudGV4dENvbnRlbnQgfHwgXCJwYXJzZSB2YXN0IGVycm9yXCIpO1xuICAgICAgICB9XG4gICAgICAgIGxldCB2YXN0RWxlID0geG1sRG9jLnF1ZXJ5U2VsZWN0b3IoXCJWQVNUXCIpO1xuICAgICAgICBpZiAoIXZhc3RFbGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlZBU1QgdGFnIG5vdCBmb3VuZFwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFzdEVsZTtcbiAgICB9XG4gICAgdXBkYXRlV3JhcHBlclZhc3RPYmplY3QodmFzdE9iamVjdCwgdkVsZSwgbWFjcm9SZXBsYWNlcikge1xuICAgICAgICBsZXQgZXJyb3JVcmxzID0gW107XG4gICAgICAgIGNvbnN0IHJvb3RFcnJvckVsZSA9IHZFbGUucXVlcnlTZWxlY3RvcihcIjpzY29wZT5FcnJvclwiKTtcbiAgICAgICAgaWYgKHJvb3RFcnJvckVsZSAmJiByb290RXJyb3JFbGUudGV4dENvbnRlbnQpXG4gICAgICAgICAgICBlcnJvclVybHMucHVzaChyb290RXJyb3JFbGUudGV4dENvbnRlbnQpO1xuICAgICAgICBjb25zdCB3cmFwcGVyRWxlID0gdkVsZS5xdWVyeVNlbGVjdG9yKFwiOnNjb3BlPkFkPldyYXBwZXJcIik7XG4gICAgICAgIGlmICghd3JhcHBlckVsZSkge1xuICAgICAgICAgICAgc2VuZEVycm9yKGVycm9yVXJscywgRXJyb3JDb2RlLk5vVkFTVFJlc3BvbnNlQWZ0ZXJXcmFwcGVyLCBtYWNyb1JlcGxhY2VyKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInBhcnNlIFdyYXBwZXIgZXJyb3JcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXJyb3JFbGUgPSB3cmFwcGVyRWxlLnF1ZXJ5U2VsZWN0b3IoXCI6c2NvcGU+RXJyb3JcIik7XG4gICAgICAgIGlmIChlcnJvckVsZSAmJiBlcnJvckVsZS50ZXh0Q29udGVudClcbiAgICAgICAgICAgIGVycm9yVXJscy5wdXNoKGVycm9yRWxlLnRleHRDb250ZW50KTtcbiAgICAgICAgY29uc3QgaW1wRWxlID0gd3JhcHBlckVsZS5xdWVyeVNlbGVjdG9yKFwiOnNjb3BlPkltcHJlc3Npb25cIik7XG4gICAgICAgIGlmICghaW1wRWxlIHx8ICFpbXBFbGUudGV4dENvbnRlbnQpIHtcbiAgICAgICAgICAgIHNlbmRFcnJvcihlcnJvclVybHMsIEVycm9yQ29kZS5YTUxQYXJzZUVycm9yLCBtYWNyb1JlcGxhY2VyKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInBhcnNlIFdyYXBwZXIgSW1wcmVzc2lvbiBlcnJvclwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbXByZXNzaW9uVXJsID0gaW1wRWxlLnRleHRDb250ZW50O1xuICAgICAgICBjb25zdCBsaW5lYXJFbGUgPSB3cmFwcGVyRWxlLnF1ZXJ5U2VsZWN0b3IoXCI6c2NvcGU+Q3JlYXRpdmVzPkNyZWF0aXZlPkxpbmVhclwiKTtcbiAgICAgICAgaWYgKCFsaW5lYXJFbGUpIHtcbiAgICAgICAgICAgIHZhc3RPYmplY3QuZXJyb3JVcmxzID0gdmFzdE9iamVjdC5lcnJvclVybHMuY29uY2F0KGVycm9yVXJscyk7XG4gICAgICAgICAgICB2YXN0T2JqZWN0LmltcHJlc3Npb25VcmxzLnB1c2goaW1wcmVzc2lvblVybCk7XG4gICAgICAgICAgICByZXR1cm4gdmFzdE9iamVjdDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkdXJhdGlvbkVsZSA9IGxpbmVhckVsZS5xdWVyeVNlbGVjdG9yKFwiOnNjb3BlPkR1cmF0aW9uXCIpO1xuICAgICAgICBpZiAoIWR1cmF0aW9uRWxlIHx8ICFkdXJhdGlvbkVsZS50ZXh0Q29udGVudCkge1xuICAgICAgICAgICAgc2VuZEVycm9yKGVycm9yVXJscywgRXJyb3JDb2RlLlhNTFBhcnNlRXJyb3IsIG1hY3JvUmVwbGFjZXIpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwicGFyc2UgV3JhcHBlciBMaW5lYXIgRHVyYXRpb24gZXJyb3JcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZHVyYXRpb24gPSBjb252ZXJ0VGltZVRvU2Vjb25kKGR1cmF0aW9uRWxlLnRleHRDb250ZW50KTtcbiAgICAgICAgY29uc3QgdHJhY2tpbmdzRWxlcyA9IGxpbmVhckVsZS5xdWVyeVNlbGVjdG9yQWxsKFwiOnNjb3BlPlRyYWNraW5nRXZlbnRzPlRyYWNraW5nXCIpO1xuICAgICAgICBjb25zdCB0cmFja2luZ01hcCA9IHRoaXMuY3JlYXRlVHJhY2tpbmdPYmplY3QodHJhY2tpbmdzRWxlcywgZHVyYXRpb24pO1xuICAgICAgICBjb25zdCBpY29uRWxlcyA9IGxpbmVhckVsZS5xdWVyeVNlbGVjdG9yQWxsKFwiOnNjb3BlPkljb25zPkljb25cIik7XG4gICAgICAgIGNvbnN0IGljb25zID0gY3JlYXRlSWNvbnMoaWNvbkVsZXMpO1xuICAgICAgICBjb25zdCB2aWRlb0NsaWNrc0VsZSA9IGxpbmVhckVsZS5xdWVyeVNlbGVjdG9yKFwiOnNjb3BlPlZpZGVvQ2xpY2tzXCIpO1xuICAgICAgICBsZXQgY2xpY2tUaHJvdWdoID0gbnVsbDtcbiAgICAgICAgbGV0IGNsaWNrVHJhY2tpbmcgPSBbXTtcbiAgICAgICAgaWYgKHZpZGVvQ2xpY2tzRWxlKSB7XG4gICAgICAgICAgICBjb25zdCBjbGlja1Rocm91Z2hFbGUgPSB2aWRlb0NsaWNrc0VsZS5xdWVyeVNlbGVjdG9yKFwiOnNjb3BlPkNsaWNrVGhyb3VnaFwiKTtcbiAgICAgICAgICAgIGlmIChjbGlja1Rocm91Z2hFbGUgJiYgY2xpY2tUaHJvdWdoRWxlLnRleHRDb250ZW50KSB7XG4gICAgICAgICAgICAgICAgY2xpY2tUaHJvdWdoID0ge1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBjbGlja1Rocm91Z2hFbGUudGV4dENvbnRlbnRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY2xpY2tUcmFja2luZ0VsZXMgPSB2aWRlb0NsaWNrc0VsZS5xdWVyeVNlbGVjdG9yQWxsKFwiOnNjb3BlPkNsaWNrVHJhY2tpbmdcIik7XG4gICAgICAgICAgICBmb3IgKGxldCBjbGlja1RyYWNraW5nRWxlIG9mIGNsaWNrVHJhY2tpbmdFbGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNsaWNrVHJhY2tpbmdFbGUudGV4dENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tUcmFja2luZy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNsaWNrVHJhY2tpbmdFbGUudGV4dENvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhc3RPYmplY3QuZXJyb3JVcmxzID0gdmFzdE9iamVjdC5lcnJvclVybHMuY29uY2F0KGVycm9yVXJscyk7XG4gICAgICAgIHZhc3RPYmplY3QuaW1wcmVzc2lvblVybHMucHVzaChpbXByZXNzaW9uVXJsKTtcbiAgICAgICAgdmFzdE9iamVjdC5jcmVhdGl2ZXMucHVzaCh7XG4gICAgICAgICAgICBsaW5lYXI6IHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgICAgICAgICAgbWVkaWFGaWxlczogW10sXG4gICAgICAgICAgICAgICAgdHJhY2tpbmdFdmVudHM6IHRyYWNraW5nTWFwLFxuICAgICAgICAgICAgICAgIGNsaWNrVGhyb3VnaDogY2xpY2tUaHJvdWdoLFxuICAgICAgICAgICAgICAgIGNsaWNrVHJhY2tpbmdzOiBjbGlja1RyYWNraW5nLFxuICAgICAgICAgICAgICAgIGljb25zOiBpY29uc1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHZhc3RPYmplY3Q7XG4gICAgfVxuICAgIHVwZGF0ZUlubGluZVZhc3RPYmplY3QodmFzdE9iamVjdCwgdkVsZSwgbWFjcm9SZXBsYWNlcikge1xuICAgICAgICBsZXQgZXJyb3JVcmxzID0gW107XG4gICAgICAgIGNvbnN0IHJvb3RFcnJvckVsZSA9IHZFbGUucXVlcnlTZWxlY3RvcihcIjpzY29wZT5FcnJvclwiKTtcbiAgICAgICAgaWYgKHJvb3RFcnJvckVsZSAmJiByb290RXJyb3JFbGUudGV4dENvbnRlbnQpXG4gICAgICAgICAgICBlcnJvclVybHMucHVzaChyb290RXJyb3JFbGUudGV4dENvbnRlbnQpO1xuICAgICAgICBjb25zdCBpbmxpbmVFbGUgPSB2RWxlLnF1ZXJ5U2VsZWN0b3IoXCI6c2NvcGU+QWQ+SW5MaW5lXCIpO1xuICAgICAgICBpZiAoIWlubGluZUVsZSkge1xuICAgICAgICAgICAgc2VuZEVycm9yKGVycm9yVXJscywgRXJyb3JDb2RlLk5vVkFTVFJlc3BvbnNlQWZ0ZXJXcmFwcGVyLCBtYWNyb1JlcGxhY2VyKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInBhcnNlIEluTGluZSBlcnJvclwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlcnJvckVsZSA9IGlubGluZUVsZS5xdWVyeVNlbGVjdG9yKFwiOnNjb3BlPkVycm9yXCIpO1xuICAgICAgICBpZiAoZXJyb3JFbGUgJiYgZXJyb3JFbGUudGV4dENvbnRlbnQpXG4gICAgICAgICAgICBlcnJvclVybHMucHVzaChlcnJvckVsZS50ZXh0Q29udGVudCk7XG4gICAgICAgIGNvbnN0IGltcEVsZSA9IGlubGluZUVsZS5xdWVyeVNlbGVjdG9yKFwiOnNjb3BlPkltcHJlc3Npb25cIik7XG4gICAgICAgIGlmICghaW1wRWxlIHx8ICFpbXBFbGUudGV4dENvbnRlbnQpIHtcbiAgICAgICAgICAgIHNlbmRFcnJvcihlcnJvclVybHMsIEVycm9yQ29kZS5YTUxQYXJzZUVycm9yLCBtYWNyb1JlcGxhY2VyKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInBhcnNlIEluTGluZSBJbXByZXNzaW9uIGVycm9yXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGltcHJlc3Npb25VcmwgPSBpbXBFbGUudGV4dENvbnRlbnQ7XG4gICAgICAgIGNvbnN0IGFkVGl0bGVFbGUgPSBpbmxpbmVFbGUucXVlcnlTZWxlY3RvcihcIjpzY29wZT5BZFRpdGxlXCIpO1xuICAgICAgICBpZiAoIWFkVGl0bGVFbGUgfHwgIWFkVGl0bGVFbGUudGV4dENvbnRlbnQpIHtcbiAgICAgICAgICAgIHNlbmRFcnJvcihlcnJvclVybHMsIEVycm9yQ29kZS5YTUxQYXJzZUVycm9yLCBtYWNyb1JlcGxhY2VyKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInBhcnNlIEluTGluZSBBZFRpdGxlIGVycm9yXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFkVGl0bGUgPSBhZFRpdGxlRWxlLnRleHRDb250ZW50O1xuICAgICAgICBsZXQgYWREZXNjID0gbnVsbDtcbiAgICAgICAgY29uc3QgYWREZXNjRWxlID0gaW5saW5lRWxlLnF1ZXJ5U2VsZWN0b3IoXCI6c2NvcGU+RGVzY3JpcHRpb25cIik7XG4gICAgICAgIGlmIChhZERlc2NFbGUgJiYgYWREZXNjRWxlLnRleHRDb250ZW50KSB7XG4gICAgICAgICAgICBhZERlc2MgPSBhZERlc2NFbGUudGV4dENvbnRlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbGluZWFyRWxlID0gaW5saW5lRWxlLnF1ZXJ5U2VsZWN0b3IoXCI6c2NvcGU+Q3JlYXRpdmVzPkNyZWF0aXZlPkxpbmVhclwiKTtcbiAgICAgICAgaWYgKCFsaW5lYXJFbGUpIHtcbiAgICAgICAgICAgIHNlbmRFcnJvcihlcnJvclVybHMsIEVycm9yQ29kZS5YTUxQYXJzZUVycm9yLCBtYWNyb1JlcGxhY2VyKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInBhcnNlIEluTGluZSBMaW5lYXIgZXJyb3JcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZHVyYXRpb25FbGUgPSBsaW5lYXJFbGUucXVlcnlTZWxlY3RvcihcIjpzY29wZT5EdXJhdGlvblwiKTtcbiAgICAgICAgaWYgKCFkdXJhdGlvbkVsZSB8fCAhZHVyYXRpb25FbGUudGV4dENvbnRlbnQpIHtcbiAgICAgICAgICAgIHNlbmRFcnJvcihlcnJvclVybHMsIEVycm9yQ29kZS5YTUxQYXJzZUVycm9yLCBtYWNyb1JlcGxhY2VyKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInBhcnNlIEluTGluZSBMaW5lYXIgRHVyYXRpb24gZXJyb3JcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZHVyYXRpb24gPSBjb252ZXJ0VGltZVRvU2Vjb25kKGR1cmF0aW9uRWxlLnRleHRDb250ZW50KTtcbiAgICAgICAgY29uc3QgdHJhY2tpbmdzRWxlcyA9IGxpbmVhckVsZS5xdWVyeVNlbGVjdG9yQWxsKFwiOnNjb3BlPlRyYWNraW5nRXZlbnRzPlRyYWNraW5nXCIpO1xuICAgICAgICBjb25zdCB0cmFja2luZ01hcCA9IHRoaXMuY3JlYXRlVHJhY2tpbmdPYmplY3QodHJhY2tpbmdzRWxlcywgZHVyYXRpb24pO1xuICAgICAgICBjb25zdCBpY29uRWxlcyA9IGxpbmVhckVsZS5xdWVyeVNlbGVjdG9yQWxsKFwiOnNjb3BlPkljb25zPkljb25cIik7XG4gICAgICAgIGNvbnN0IGljb25zID0gY3JlYXRlSWNvbnMoaWNvbkVsZXMpO1xuICAgICAgICBjb25zdCBtZWRpYUZpbGVFbGVzID0gbGluZWFyRWxlLnF1ZXJ5U2VsZWN0b3JBbGwoXCI6c2NvcGU+TWVkaWFGaWxlcz5NZWRpYUZpbGVcIik7XG4gICAgICAgIGlmICghbWVkaWFGaWxlRWxlcykge1xuICAgICAgICAgICAgc2VuZEVycm9yKGVycm9yVXJscywgRXJyb3JDb2RlLlhNTFBhcnNlRXJyb3IsIG1hY3JvUmVwbGFjZXIpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwicGFyc2UgTWVkaWFGaWxlcyBlcnJvclwiKTtcbiAgICAgICAgfVxuICAgICAgICAvLyDjgbLjgajjgb7jgZox44Gk55uu44GuTWVkaWFGaWxl44GuVVJM44Gu44G/5Y+W5b6XXG4gICAgICAgIGNvbnN0IG1lZGlhRmlsZVVybCA9IG1lZGlhRmlsZUVsZXNbMF0/LnRleHRDb250ZW50O1xuICAgICAgICBjb25zdCB2aWRlb0NsaWNrc0VsZSA9IGxpbmVhckVsZS5xdWVyeVNlbGVjdG9yKFwiOnNjb3BlPlZpZGVvQ2xpY2tzXCIpO1xuICAgICAgICBsZXQgY2xpY2tUaHJvdWdoID0gbnVsbDtcbiAgICAgICAgbGV0IGNsaWNrVHJhY2tpbmcgPSBbXTtcbiAgICAgICAgaWYgKHZpZGVvQ2xpY2tzRWxlKSB7XG4gICAgICAgICAgICBjb25zdCBjbGlja1Rocm91Z2hFbGUgPSB2aWRlb0NsaWNrc0VsZS5xdWVyeVNlbGVjdG9yKFwiOnNjb3BlPkNsaWNrVGhyb3VnaFwiKTtcbiAgICAgICAgICAgIGlmICghY2xpY2tUaHJvdWdoRWxlIHx8ICFjbGlja1Rocm91Z2hFbGUudGV4dENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICBzZW5kRXJyb3IoZXJyb3JVcmxzLCBFcnJvckNvZGUuWE1MUGFyc2VFcnJvciwgbWFjcm9SZXBsYWNlcik7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwicGFyc2UgSW5MaW5lIExpbmVhciBDbGlja1Rocm91Z2ggZXJyb3JcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbGlja1Rocm91Z2ggPSB7XG4gICAgICAgICAgICAgICAgY29udGVudDogY2xpY2tUaHJvdWdoRWxlLnRleHRDb250ZW50XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgY2xpY2tUcmFja2luZ0VsZXMgPSB2aWRlb0NsaWNrc0VsZS5xdWVyeVNlbGVjdG9yQWxsKFwiOnNjb3BlPkNsaWNrVHJhY2tpbmdcIik7XG4gICAgICAgICAgICBmb3IgKGxldCBjbGlja1RyYWNraW5nRWxlIG9mIGNsaWNrVHJhY2tpbmdFbGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNsaWNrVHJhY2tpbmdFbGUudGV4dENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tUcmFja2luZy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNsaWNrVHJhY2tpbmdFbGUudGV4dENvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhc3RPYmplY3QuZXJyb3JVcmxzID0gdmFzdE9iamVjdC5lcnJvclVybHMuY29uY2F0KGVycm9yVXJscyk7XG4gICAgICAgIHZhc3RPYmplY3QuaW1wcmVzc2lvblVybHMucHVzaChpbXByZXNzaW9uVXJsKTtcbiAgICAgICAgdmFzdE9iamVjdC5hZFRpdGxlID0gYWRUaXRsZTtcbiAgICAgICAgdmFzdE9iamVjdC5hZERlc2MgPSBhZERlc2M7XG4gICAgICAgIHZhc3RPYmplY3QuY3JlYXRpdmVzLnB1c2goe1xuICAgICAgICAgICAgbGluZWFyOiB7XG4gICAgICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxuICAgICAgICAgICAgICAgIG1lZGlhRmlsZXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogbWVkaWFGaWxlVXJsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHRyYWNraW5nRXZlbnRzOiB0cmFja2luZ01hcCxcbiAgICAgICAgICAgICAgICBjbGlja1Rocm91Z2g6IGNsaWNrVGhyb3VnaCxcbiAgICAgICAgICAgICAgICBjbGlja1RyYWNraW5nczogY2xpY2tUcmFja2luZyxcbiAgICAgICAgICAgICAgICBpY29uczogaWNvbnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB2YXN0T2JqZWN0O1xuICAgIH1cbiAgICBjcmVhdGVUcmFja2luZ09iamVjdCh0cmFja2luZ0VsZXMsIGR1cmF0aW9uKSB7XG4gICAgICAgIGNvbnN0IHRyYWNraW5nTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB0cmFja2luZ0VsZXMuZm9yRWFjaChmdW5jdGlvbiAodHJhY2tpbmcpIHtcbiAgICAgICAgICAgIGlmICghdHJhY2tpbmcudGV4dENvbnRlbnQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgZXZlbnQgPSB0cmFja2luZy5nZXRBdHRyaWJ1dGUoXCJldmVudFwiKTtcbiAgICAgICAgICAgIGlmICghZXZlbnQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKGV2ZW50ID09PSBcInByb2dyZXNzXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvZmZzZXQgPSB0cmFja2luZy5nZXRBdHRyaWJ1dGUoXCJvZmZzZXRcIik7XG4gICAgICAgICAgICAgICAgaWYgKCFvZmZzZXQpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjb25zdCBvZmZzZXRTZWNvbmQgPSBjb252ZXJ0VGltZVRvU2Vjb25kKG9mZnNldCk7XG4gICAgICAgICAgICAgICAgdHJhY2tpbmdNYXAuc2V0KG9mZnNldFNlY29uZCwgdHJhY2tpbmcudGV4dENvbnRlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnRfcG9pbnQgPSBUUkFDS0lOR19FVkVOVF9QT0lOVC5nZXQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChldmVudF9wb2ludCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJhY2tpbmdNYXAuc2V0KGV2ZW50X3BvaW50ICogZHVyYXRpb24sIHRyYWNraW5nLnRleHRDb250ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRyYWNraW5nTWFwLnNldChldmVudCwgdHJhY2tpbmcudGV4dENvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0cmFja2luZ01hcDtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgdmFzdCA9IG5ldyBWYXN0KCk7XG4iLCJleHBvcnQgeyB2YXN0IH0gZnJvbSBcIi4vZG9tYWluL3NlcnZpY2UvdmFzdFwiO1xuZXhwb3J0IHsgc2V0QmVhY29ucyB9IGZyb20gXCIuL2RvbWFpbi9zZXJ2aWNlL2JlYWNvblwiO1xuZXhwb3J0IHsgc2V0SWNvbnMgfSBmcm9tIFwiLi9kb21haW4vc2VydmljZS9pY29uXCI7XG5leHBvcnQgeyBjcmVhdGVSZXBsYWNlciB9IGZyb20gXCIuL3V0aWwvbWFjcm9cIjtcbmV4cG9ydCB7IGdldE1lZGlhVHlwZSB9IGZyb20gXCIuL3V0aWwvdmlkZW9cIjtcbiIsImV4cG9ydCB2YXIgRXJyb3JDb2RlO1xuKGZ1bmN0aW9uIChFcnJvckNvZGUpIHtcbiAgICBFcnJvckNvZGVbRXJyb3JDb2RlW1wiWE1MUGFyc2VFcnJvclwiXSA9IDEwMF0gPSBcIlhNTFBhcnNlRXJyb3JcIjtcbiAgICBFcnJvckNvZGVbRXJyb3JDb2RlW1wiVkFTVFNjaGVtYVZhbGlkYXRpb25FcnJvclwiXSA9IDEwMV0gPSBcIlZBU1RTY2hlbWFWYWxpZGF0aW9uRXJyb3JcIjtcbiAgICBFcnJvckNvZGVbRXJyb3JDb2RlW1wiVkFTVFZlcnNpb25PZlJlc3BvbnNlTm90U3VwcG9ydGVkXCJdID0gMTAyXSA9IFwiVkFTVFZlcnNpb25PZlJlc3BvbnNlTm90U3VwcG9ydGVkXCI7XG4gICAgRXJyb3JDb2RlW0Vycm9yQ29kZVtcIk5vblBsYXlhYmxlQWRUeXBlXCJdID0gMjAwXSA9IFwiTm9uUGxheWFibGVBZFR5cGVcIjtcbiAgICBFcnJvckNvZGVbRXJyb3JDb2RlW1wiTWVkaWFQbGF5ZXJFeHBlY3RpbmdEaWZmZXJlbnRMaW5lYXJpdHlcIl0gPSAyMDFdID0gXCJNZWRpYVBsYXllckV4cGVjdGluZ0RpZmZlcmVudExpbmVhcml0eVwiO1xuICAgIEVycm9yQ29kZVtFcnJvckNvZGVbXCJNZWRpYVBsYXllckV4cGVjdGluZ0RpZmZlcmVudER1cmF0aW9uXCJdID0gMjAyXSA9IFwiTWVkaWFQbGF5ZXJFeHBlY3RpbmdEaWZmZXJlbnREdXJhdGlvblwiO1xuICAgIEVycm9yQ29kZVtFcnJvckNvZGVbXCJNZWRpYVBsYXllckV4cGVjdGluZ0RpZmZlcmVudFNpemVcIl0gPSAyMDNdID0gXCJNZWRpYVBsYXllckV4cGVjdGluZ0RpZmZlcmVudFNpemVcIjtcbiAgICBFcnJvckNvZGVbRXJyb3JDb2RlW1wiQWRDYXRlZ29yeU5vdFByb3ZpZGVkXCJdID0gMjA0XSA9IFwiQWRDYXRlZ29yeU5vdFByb3ZpZGVkXCI7XG4gICAgRXJyb3JDb2RlW0Vycm9yQ29kZVtcIklubGluZUNhdGVnb3J5VmlvbGF0ZXNXcmFwcGVyQmxvY2tlZEFkQ2F0ZWdvcmllc1wiXSA9IDIwNV0gPSBcIklubGluZUNhdGVnb3J5VmlvbGF0ZXNXcmFwcGVyQmxvY2tlZEFkQ2F0ZWdvcmllc1wiO1xuICAgIEVycm9yQ29kZVtFcnJvckNvZGVbXCJBZE5vdFNlcnZlZFwiXSA9IDIwNl0gPSBcIkFkTm90U2VydmVkXCI7XG4gICAgRXJyb3JDb2RlW0Vycm9yQ29kZVtcIkdlbmVyYWxXcmFwcGVyRXJyb3JcIl0gPSAzMDBdID0gXCJHZW5lcmFsV3JhcHBlckVycm9yXCI7XG4gICAgRXJyb3JDb2RlW0Vycm9yQ29kZVtcIlZBU1RVUklVbmF2YWlsYWJsZU9yVGltZW91dFwiXSA9IDMwMV0gPSBcIlZBU1RVUklVbmF2YWlsYWJsZU9yVGltZW91dFwiO1xuICAgIEVycm9yQ29kZVtFcnJvckNvZGVbXCJXcmFwcGVyTGltaXRSZWFjaGVkXCJdID0gMzAyXSA9IFwiV3JhcHBlckxpbWl0UmVhY2hlZFwiO1xuICAgIEVycm9yQ29kZVtFcnJvckNvZGVbXCJOb1ZBU1RSZXNwb25zZUFmdGVyV3JhcHBlclwiXSA9IDMwM10gPSBcIk5vVkFTVFJlc3BvbnNlQWZ0ZXJXcmFwcGVyXCI7XG4gICAgRXJyb3JDb2RlW0Vycm9yQ29kZVtcIkFkVW5pdE5vdERpc3BsYXllZFwiXSA9IDMwNF0gPSBcIkFkVW5pdE5vdERpc3BsYXllZFwiO1xuICAgIEVycm9yQ29kZVtFcnJvckNvZGVbXCJHZW5lcmFsTGluZWFyRXJyb3JcIl0gPSA0MDBdID0gXCJHZW5lcmFsTGluZWFyRXJyb3JcIjtcbiAgICBFcnJvckNvZGVbRXJyb3JDb2RlW1wiRmlsZU5vdEZvdW5kXCJdID0gNDAxXSA9IFwiRmlsZU5vdEZvdW5kXCI7XG4gICAgRXJyb3JDb2RlW0Vycm9yQ29kZVtcIk1lZGlhRmlsZVVSSVRpbWVvdXRcIl0gPSA0MDJdID0gXCJNZWRpYUZpbGVVUklUaW1lb3V0XCI7XG4gICAgRXJyb3JDb2RlW0Vycm9yQ29kZVtcIlN1cHBvcnRlZE1lZGlhRmlsZU5vdEZvdW5kXCJdID0gNDAzXSA9IFwiU3VwcG9ydGVkTWVkaWFGaWxlTm90Rm91bmRcIjtcbiAgICBFcnJvckNvZGVbRXJyb3JDb2RlW1wiUHJvYmxlbURpc3BsYXlpbmdNZWRpYUZpbGVcIl0gPSA0MDVdID0gXCJQcm9ibGVtRGlzcGxheWluZ01lZGlhRmlsZVwiO1xuICAgIEVycm9yQ29kZVtFcnJvckNvZGVbXCJNZXp6YW5pbmVOb3RQcm92aWRlZFwiXSA9IDQwNl0gPSBcIk1lenphbmluZU5vdFByb3ZpZGVkXCI7XG4gICAgRXJyb3JDb2RlW0Vycm9yQ29kZVtcIk1lenphbmluZURvd25sb2FkaW5nXCJdID0gNDA3XSA9IFwiTWV6emFuaW5lRG93bmxvYWRpbmdcIjtcbiAgICBFcnJvckNvZGVbRXJyb3JDb2RlW1wiQ29uZGl0aW9uYWxBZFJlamVjdGVkXCJdID0gNDA4XSA9IFwiQ29uZGl0aW9uYWxBZFJlamVjdGVkXCI7XG4gICAgRXJyb3JDb2RlW0Vycm9yQ29kZVtcIkludGVyYWN0aXZlVW5pdE5vdEV4ZWN1dGVkXCJdID0gNDA5XSA9IFwiSW50ZXJhY3RpdmVVbml0Tm90RXhlY3V0ZWRcIjtcbiAgICBFcnJvckNvZGVbRXJyb3JDb2RlW1wiVmVyaWZpY2F0aW9uVW5pdE5vdEV4ZWN1dGVkXCJdID0gNDEwXSA9IFwiVmVyaWZpY2F0aW9uVW5pdE5vdEV4ZWN1dGVkXCI7XG4gICAgRXJyb3JDb2RlW0Vycm9yQ29kZVtcIk5vdFJlcXVpcmVkU3BlY2lmaWNhdGlvbk9mTWV6emFuaW5lXCJdID0gNDExXSA9IFwiTm90UmVxdWlyZWRTcGVjaWZpY2F0aW9uT2ZNZXp6YW5pbmVcIjtcbiAgICBFcnJvckNvZGVbRXJyb3JDb2RlW1wiR2VuZXJhbE5vbkxpbmVhckFkc0Vycm9yXCJdID0gNTAwXSA9IFwiR2VuZXJhbE5vbkxpbmVhckFkc0Vycm9yXCI7XG4gICAgRXJyb3JDb2RlW0Vycm9yQ29kZVtcIk5vbkxpbmVhckFkTm9uRGlzcGxheWFibGVcIl0gPSA1MDFdID0gXCJOb25MaW5lYXJBZE5vbkRpc3BsYXlhYmxlXCI7XG4gICAgRXJyb3JDb2RlW0Vycm9yQ29kZVtcIlVuYWJsZVRvRmV0Y2hOb25MaW5lYXJSZXNvdXJjZVwiXSA9IDUwMl0gPSBcIlVuYWJsZVRvRmV0Y2hOb25MaW5lYXJSZXNvdXJjZVwiO1xuICAgIEVycm9yQ29kZVtFcnJvckNvZGVbXCJTdXBwb3J0ZWROb25MaW5lYXJSZXNvdXJjZU5vdEZvdW5kXCJdID0gNTAzXSA9IFwiU3VwcG9ydGVkTm9uTGluZWFyUmVzb3VyY2VOb3RGb3VuZFwiO1xuICAgIEVycm9yQ29kZVtFcnJvckNvZGVbXCJHZW5lcmFsQ29tcGFuaW9uQWRzRXJyb3JcIl0gPSA2MDBdID0gXCJHZW5lcmFsQ29tcGFuaW9uQWRzRXJyb3JcIjtcbiAgICBFcnJvckNvZGVbRXJyb3JDb2RlW1wiQ29tcGFuaW9uTm9uRGlzcGxheWFibGVCeURpbWVtc2lvbkVycm9yXCJdID0gNjAxXSA9IFwiQ29tcGFuaW9uTm9uRGlzcGxheWFibGVCeURpbWVtc2lvbkVycm9yXCI7XG4gICAgRXJyb3JDb2RlW0Vycm9yQ29kZVtcIlJlcXVpcmVkQ29tcGFuaW9uTm9uRGlzcGxheWFibGVcIl0gPSA2MDJdID0gXCJSZXF1aXJlZENvbXBhbmlvbk5vbkRpc3BsYXlhYmxlXCI7XG4gICAgRXJyb3JDb2RlW0Vycm9yQ29kZVtcIlVuYWJsZVRvRmV0Y2hOb25Db21wYW5pb25SZXNvdXJjZVwiXSA9IDYwM10gPSBcIlVuYWJsZVRvRmV0Y2hOb25Db21wYW5pb25SZXNvdXJjZVwiO1xuICAgIEVycm9yQ29kZVtFcnJvckNvZGVbXCJTdXBwb3J0ZWRDb21wYW5pb25SZXNvdXJjZU5vdEZvdW5kXCJdID0gNjA0XSA9IFwiU3VwcG9ydGVkQ29tcGFuaW9uUmVzb3VyY2VOb3RGb3VuZFwiO1xuICAgIEVycm9yQ29kZVtFcnJvckNvZGVbXCJVbmRlZmluZWRFcnJvclwiXSA9IDkwMF0gPSBcIlVuZGVmaW5lZEVycm9yXCI7XG4gICAgRXJyb3JDb2RlW0Vycm9yQ29kZVtcIkdlbmVyYWxWUEFJREVycm9yXCJdID0gOTAxXSA9IFwiR2VuZXJhbFZQQUlERXJyb3JcIjtcbiAgICBFcnJvckNvZGVbRXJyb3JDb2RlW1wiR2VuZXJhbEludGVyYWN0aXZlQ3JlYXRpdmVGaWxlRXJyb3JcIl0gPSA5MDJdID0gXCJHZW5lcmFsSW50ZXJhY3RpdmVDcmVhdGl2ZUZpbGVFcnJvclwiO1xufSkoRXJyb3JDb2RlIHx8IChFcnJvckNvZGUgPSB7fSkpO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlcGxhY2VyKHZpZGVvUGFyZW50KSB7XG4gICAgbGV0IHJlcGxhY2VNYXAgPSBuZXcgTWFwKCk7XG4gICAgLy8gdGltZSBzdGFtcFxuICAgIHJlcGxhY2VNYXAuc2V0KFwiW1RJTUVTVEFNUF1cIiwgZ2V0VGltZXN0YW1wKCkpO1xuICAgIC8vIGludmlldyByYXRpb1xuICAgIGNvbnN0IGludmlld1JhdGlvTWdyID0ge1xuICAgICAgICByYXRpbzogMFxuICAgIH07XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgcm9vdE1hcmdpbjogXCIwcHhcIixcbiAgICAgICAgdGhyZXNob2xkOiBbMCwgMC4xLCAwLjIsIDAuMywgMC40LCAwLjUsIDAuNiwgMC43LCAwLjgsIDAuOSwgMV1cbiAgICB9O1xuICAgIGZ1bmN0aW9uIGNhbGxiYWNrKGVudHJpZXMpIHtcbiAgICAgICAgZW50cmllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICAgICAgY29uc3QgcmF0aW8gPSBNYXRoLmZsb29yKGVudHJ5LmludGVyc2VjdGlvblJhdGlvICogMTAwKSAvIDEwMDtcbiAgICAgICAgICAgIGludmlld1JhdGlvTWdyLnJhdGlvID0gcmF0aW87XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcihjYWxsYmFjaywgb3B0aW9ucyk7XG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZSh2aWRlb1BhcmVudCk7XG4gICAgcmVwbGFjZU1hcC5zZXQoXCJbSU5WSUVXX1JBVElPXVwiLCBnZXRJbnZpZXdSYXRpbyhpbnZpZXdSYXRpb01ncikpO1xuICAgIHJldHVybiAodGFyZ2V0LCBlcnJvckNvZGUpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJSRVBMQUNFIE1BUDpcIik7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcGxhY2VNYXApO1xuICAgICAgICBpZiAoZXJyb3JDb2RlKSB7XG4gICAgICAgICAgICByZXBsYWNlTWFwLnNldChcIltFUlJPUkNPREVdXCIsIGVycm9yQ29kZS50b1N0cmluZygpKTtcbiAgICAgICAgfVxuICAgICAgICByZXBsYWNlTWFwLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUkVQTEFDRVIgS0VZOiBcIiArIGtleSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlJFUExBQ0VSIFZBTFVFOiBcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh2YWx1ZSk7XG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucmVwbGFjZShrZXksIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gdmFsdWUoKSA6IHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGdldFRpbWVzdGFtcCgpIHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHJldHVybiBkYXRlLnRvSVNPU3RyaW5nKCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGdldEludmlld1JhdGlvKGludmlld1JhdGlvTWdyKSB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGludmlld1JhdGlvTWdyLnJhdGlvLnRvRml4ZWQoMik7XG4gICAgfTtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0VGltZVRvU2Vjb25kKGR1cmF0aW9uU3RyKSB7XG4gICAgbGV0IHJlc3VsdCA9IGR1cmF0aW9uU3RyLm1hdGNoKC8oXFxkezJ9KTooXFxkezJ9KTooXFxkezJ9KS8pO1xuICAgIGlmICghcmVzdWx0IHx8IHJlc3VsdC5sZW5ndGggPCA0IHx8IHBhcnNlSW50KHJlc3VsdFsxXSkgPT09IE5hTiB8fCBwYXJzZUludChyZXN1bHRbMl0pID09PSBOYU4gfHwgcGFyc2VJbnQocmVzdWx0WzNdKSA9PT0gTmFOKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNvbnZlcnRkdXJhdGlvblRvU2Vjb25kIGVycm9yOiBcIiArIGR1cmF0aW9uU3RyKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlSW50KHJlc3VsdFsxXSkgKiA2MCAqIDYwICsgcGFyc2VJbnQocmVzdWx0WzJdKSAqIDYwICsgcGFyc2VGbG9hdChyZXN1bHRbM10pO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGdldE1lZGlhVHlwZSh1cmwpIHtcbiAgICBpZiAoL1xcLm1wNCQvLnRlc3QodXJsKSkge1xuICAgICAgICByZXR1cm4gXCJ2aWRlby9tcDRcIjtcbiAgICB9XG4gICAgZWxzZSBpZiAoL1xcLm1vdiQvLnRlc3QodXJsKSkge1xuICAgICAgICByZXR1cm4gXCJ2aWRlby9xdWlja3RpbWVcIjtcbiAgICB9XG4gICAgZWxzZSBpZiAoL1xcLm1wZyQvLnRlc3QodXJsKSB8fCAvXFwubXBlZyQvLnRlc3QodXJsKSkge1xuICAgICAgICByZXR1cm4gXCJ2aWRlby9tcGVnXCI7XG4gICAgfVxuICAgIGVsc2UgaWYgKC9cXC53ZWJtJC8udGVzdCh1cmwpKSB7XG4gICAgICAgIHJldHVybiBcInZpZGVvL3dlYm1cIjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0ICogYXMgbGliIGZyb20gXCIuLi9saWIvaW5kZXhcIjtcbmNvbnN0IGNvbnRhaW5lciA9IGBcbjwhRE9DVFlQRSBodG1sPlxuPGh0bWw+XG4gICAgPGhlYWQ+XG4gICAgPC9oZWFkPlxuICAgIDxib2R5IHN0eWxlPVwibWFyZ2luOjA7XCI+XG4gICAgICAgIDxkaXYgaWQ9XCJ2YXN0X3ZpZGVvX2NvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGRpdiBpZD1cInZhc3RfdmlkZW9cIiBzdHlsZT1cIndpZHRoOjMwMHB4O2hlaWdodDoxNjguNzVweDtcIj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgaWQ9XCJwcm9ncmVzc19iYXJcIiBzdHlsZT1cIndpZHRoOjUwJTtoZWlnaHQ6M3B4O2JhY2tncm91bmQtY29sb3I6Z3JheTtcIj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgaWQ9XCJhZF90ZXh0XCIgc3R5bGU9XCJtYXJnaW46MDt3aWR0aDozMDBweDtoZWlnaHQ6NzguMjVweDtiYWNrZ3JvdW5kLWNvbG9yOiNkY2RjZGM7XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBpZD1cImFkX3RpdGxlXCIgc3R5bGU9XCJmb250LXNpemU6MTVweDtmb250LXdlaWdodDpib2xkO1wiPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9XCJhZF9kZXNjXCIgc3R5bGU9XCJmb250LXNpemU6MTBweDtcIj48L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2JvZHk+XG48L2h0bWw+XG5gO1xuY29uc3QgaW5saW5lVmFzdFNhbXBsZSA9IGBcbjxWQVNUIHZlcnNpb249XCI0LjJcIj5cbiAgPEVycm9yPlxuICAgIDwhW0NEQVRBW2h0dHA6Ly90ZXN0LmV4YW1wbGUvZXJyb3I/Y29kZT1bRVJST1JDT0RFXSZjbGllbnRUaW1lPVtUSU1FU1RBTVBdXV0+XG4gIDwvRXJyb3I+XG4gIDxBZCBpZD1cIjFiMzMwZTU5LTNhNjItNDAwMC1iOWZiLWFjOTcyNmU5OGM1MlwiIHNlcXVlbmNlPVwiMVwiPlxuICAgIDxXcmFwcGVyPlxuICAgICAgPEltcHJlc3Npb24+PCFbQ0RBVEFbaHR0cHM6Ly93cmFwcGVyLnRlc3QuZXhhbXBsZS9pbXByZXNzaW9uP2NsaWVudFRpbWU9W1RJTUVTVEFNUF0maW52aWV3X3JhdGlvPVtJTlZJRVdfUkFUSU9dXV0+PC9JbXByZXNzaW9uPlxuICAgICAgPFZBU1RBZFRhZ1VSST5cbiAgICAgICAgPCFbQ0RBVEFbaHR0cDovL2xvY2FsaG9zdDo4MDgwL3NhbXBsZS9pbmxpbmUuaHRtbF1dPlxuICAgICAgPC9WQVNUQWRUYWdVUkk+XG4gICAgPC9XcmFwcGVyPlxuICA8L0FkPlxuPC9WQVNUPlxuYDtcbmNsYXNzIFZhc3RFeGVjdXRvciB7XG4gICAgYXN5bmMgc3RhcnRQbGF5ZXIoc291cmNlVmFzdCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNldFBsYXllciBzdGFydGVkLi4uXCIpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIik7XG4gICAgICAgICAgICBpZnJhbWUud2lkdGggPSBcIjMwMHB4XCI7XG4gICAgICAgICAgICBpZnJhbWUuaGVpZ2h0ID0gXCIyNTBweFwiO1xuICAgICAgICAgICAgaWZyYW1lLnN0eWxlLmJvcmRlciA9IFwibm9uZVwiO1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbGF5ZXJib3hcIik/LmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gICAgICAgICAgICBsZXQgaURvYyA9IGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICAgICAgICAgICAgaURvYy5vcGVuKCk7XG4gICAgICAgICAgICBpRG9jLndyaXRlKGNvbnRhaW5lcik7XG4gICAgICAgICAgICBpRG9jLmNsb3NlKCk7XG4gICAgICAgICAgICBpRG9jLmRvY3VtZW50RWxlbWVudC5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7XG4gICAgICAgICAgICBsZXQgdmFzdFZpZGVvRGl2ID0gaURvYy5nZXRFbGVtZW50QnlJZChcInZhc3RfdmlkZW9cIik7XG4gICAgICAgICAgICBjb25zdCBtYWNyb1JlcGxhY2VyID0gbGliLmNyZWF0ZVJlcGxhY2VyKHZhc3RWaWRlb0Rpdik7XG4gICAgICAgICAgICBzb3VyY2VWYXN0ID0gaW5saW5lVmFzdFNhbXBsZTtcbiAgICAgICAgICAgIGNvbnN0IHZhc3RPYmplY3QgPSBhd2FpdCBsaWIudmFzdC5wYXJzZVZhc3Qoc291cmNlVmFzdCwgbWFjcm9SZXBsYWNlcik7XG4gICAgICAgICAgICBpZiAoIXZhc3RPYmplY3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgYWRUaXRsZURpdiA9IGlEb2MuZ2V0RWxlbWVudEJ5SWQoXCJhZF90aXRsZVwiKTtcbiAgICAgICAgICAgIGFkVGl0bGVEaXYudGV4dENvbnRlbnQgPSB2YXN0T2JqZWN0LmFkVGl0bGU7XG4gICAgICAgICAgICBsZXQgYWREZXNjRGl2ID0gaURvYy5nZXRFbGVtZW50QnlJZChcImFkX2Rlc2NcIik7XG4gICAgICAgICAgICBpZiAodmFzdE9iamVjdC5hZERlc2MpIHtcbiAgICAgICAgICAgICAgICBhZERlc2NEaXYudGV4dENvbnRlbnQgPSB2YXN0T2JqZWN0LmFkRGVzYztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB2aWRlbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ2aWRlb1wiKTtcbiAgICAgICAgICAgIGZvciAobGV0IGNyZWF0aXZlIG9mIHZhc3RPYmplY3QuY3JlYXRpdmVzKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbWVkaWFGaWxlIG9mIGNyZWF0aXZlLmxpbmVhci5tZWRpYUZpbGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzb3VyY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic291cmNlXCIpO1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2Uuc3JjID0gbWVkaWFGaWxlLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtZWRpYVR5cGUgPSBsaWIuZ2V0TWVkaWFUeXBlKG1lZGlhRmlsZS5jb250ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1lZGlhVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlLnR5cGUgPSBtZWRpYVR5cGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmlkZW8uYXBwZW5kQ2hpbGQoc291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL3ZpZGVvLnNyYyA9IHZhc3RPYmplY3QubWVkaWFGaWxlVXJsO1xuICAgICAgICAgICAgdmlkZW8uc3R5bGUud2lkdGggPSBcIjEwMCVcIjtcbiAgICAgICAgICAgIHZpZGVvLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuICAgICAgICAgICAgdmlkZW8ubXV0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdmlkZW8uYXV0b3BsYXkgPSB0cnVlO1xuICAgICAgICAgICAgLy8gbG9hZGVkbWV0YWRhdGHjgqTjg5njg7Pjg4jlvozjgafjgarjgYTjgahkdXJhdGlvbuOBjOWPluOCjOOBquOBhFxuICAgICAgICAgICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRlZG1ldGFkYXRhXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHByb2dyZXNzYmFyID0gaURvYy5nZXRFbGVtZW50QnlJZChcInByb2dyZXNzX2JhclwiKTtcbiAgICAgICAgICAgICAgICBsZXQgYmFyQW5pbWF0aW9uTG9vcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByb2dyZXNzUG9pbnQgPSB2aWRlby5jdXJyZW50VGltZSAvIHZpZGVvLmR1cmF0aW9uICogMTAwO1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc2Jhci5zdHlsZS53aWR0aCA9IHByb2dyZXNzUG9pbnQgKyBcIiVcIjtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGJhckFuaW1hdGlvbkxvb3ApO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGJhckFuaW1hdGlvbkxvb3ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsaWIuc2V0QmVhY29ucyh2aWRlbywgdmFzdE9iamVjdCwgbWFjcm9SZXBsYWNlcik7XG4gICAgICAgICAgICBsaWIuc2V0SWNvbnModmlkZW8sIHZhc3RWaWRlb0RpdiwgdmFzdE9iamVjdCwgbWFjcm9SZXBsYWNlcik7XG4gICAgICAgICAgICAvLyBJbnRlcnNlY3Rpb25PYnNlcnZlclxuICAgICAgICAgICAgLy8gNTAl55S76Z2i5YaF44Gr5YWl44Gj44Gf44KJ5YaN55Sf44CB5Ye644Gf44KJ5YGc5q2iXG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIHJvb3RNYXJnaW46IFwiMHB4XCIsXG4gICAgICAgICAgICAgICAgdGhyZXNob2xkOiAwLjVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmdW5jdGlvbiBjYWxsYmFjayhlbnRyaWVzKSB7XG4gICAgICAgICAgICAgICAgZW50cmllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZW50cnkuaXNJbnRlcnNlY3RpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvLnBsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvLnBhdXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IEludGVyc2VjdGlvbk9ic2VydmVyKGNhbGxiYWNrLCBvcHRpb25zKTtcbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUodmlkZW8pO1xuICAgICAgICAgICAgdmFzdFZpZGVvRGl2LmFwcGVuZENoaWxkKHZpZGVvKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJjYW5ub3Qgc3RhcnQgUGxheWVyOiBcIiArIGUpO1xuICAgICAgICB9XG4gICAgfVxufVxuY29uc3QgdmFzdEV4ZWN1dG9yID0gbmV3IFZhc3RFeGVjdXRvcigpO1xud2luZG93LnZhc3RFeGVjdXRvciA9IHdpbmRvdy52YXN0RXhlY3V0b3IgfHwgdmFzdEV4ZWN1dG9yO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9