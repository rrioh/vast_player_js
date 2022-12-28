(function () {
    'use strict';

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
                            if (video.currentTime < video.duration) {
                                createBeacon(video, url, macroReplacer);
                            }
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

    function convertTimeToSecond(durationStr) {
        let result = durationStr.match(/(\d{2}):(\d{2}):(\d{2})\.?(\d{3})?/);
        if (!result ||
            result.length < 4 ||
            isNaN(parseInt(result[1])) ||
            isNaN(parseInt(result[2])) ||
            isNaN(parseInt(result[3]))) {
            throw new Error("convertdurationToSecond error: " + durationStr);
        }
        if (result.length == 5 && !isNaN(parseInt(result[4]))) {
            return (parseInt(result[1]) * 60 * 60 +
                parseInt(result[2]) * 60 +
                parseFloat(result[3] + "." + result[4]));
        }
        return (parseInt(result[1]) * 60 * 60 +
            parseInt(result[2]) * 60 +
            parseFloat(result[3]));
    }

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
                start = convertTimeToSecond(offset);
            let duration = iconEle.getAttribute("duration");
            let end = null;
            if (duration)
                end = convertTimeToSecond(duration) + start;
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
                    video.addEventListener("ended", function (e) {
                        if (iconParent.contains(icon)) {
                            iconParent.removeChild(icon);
                        }
                    });
                }
            }
        }
    }

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
            ratio: 0,
        };
        const options = {
            rootMargin: "0px",
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
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
            if (errorCode) {
                replaceMap.set("[ERRORCODE]", errorCode.toString());
            }
            replaceMap.forEach((value, key) => {
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
                sendError(errorUrls, ErrorCode.NoVASTResponseAfterWrapper, macroReplacer);
                throw new Error("parse Wrapper error");
            }
            const errorEle = wrapperEle.querySelector(":scope>Error");
            if (errorEle && errorEle.textContent)
                errorUrls.push(errorEle.textContent);
            const impEle = wrapperEle.querySelector(":scope>Impression");
            if (!impEle || !impEle.textContent) {
                sendError(errorUrls, ErrorCode.XMLParseError, macroReplacer);
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
                sendError(errorUrls, ErrorCode.XMLParseError, macroReplacer);
                throw new Error("parse Wrapper Linear Duration error");
            }
            const duration = convertTimeToSecond(durationEle.textContent);
            const trackingsEles = linearEle.querySelectorAll(":scope>TrackingEvents>Tracking");
            const trackingMap = this.createTrackingObject(trackingsEles, duration);
            const iconEles = linearEle.querySelectorAll(":scope>Icons>Icon");
            const icons = createIcons(iconEles);
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
                sendError(errorUrls, ErrorCode.NoVASTResponseAfterWrapper, macroReplacer);
                throw new Error("parse InLine error");
            }
            const errorEle = inlineEle.querySelector(":scope>Error");
            if (errorEle && errorEle.textContent)
                errorUrls.push(errorEle.textContent);
            const impEle = inlineEle.querySelector(":scope>Impression");
            if (!impEle || !impEle.textContent) {
                sendError(errorUrls, ErrorCode.XMLParseError, macroReplacer);
                throw new Error("parse InLine Impression error");
            }
            const impressionUrl = impEle.textContent;
            const adTitleEle = inlineEle.querySelector(":scope>AdTitle");
            if (!adTitleEle || !adTitleEle.textContent) {
                sendError(errorUrls, ErrorCode.XMLParseError, macroReplacer);
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
                sendError(errorUrls, ErrorCode.XMLParseError, macroReplacer);
                throw new Error("parse InLine Linear error");
            }
            const durationEle = linearEle.querySelector(":scope>Duration");
            if (!durationEle || !durationEle.textContent) {
                sendError(errorUrls, ErrorCode.XMLParseError, macroReplacer);
                throw new Error("parse InLine Linear Duration error");
            }
            const duration = convertTimeToSecond(durationEle.textContent);
            const trackingsEles = linearEle.querySelectorAll(":scope>TrackingEvents>Tracking");
            const trackingMap = this.createTrackingObject(trackingsEles, duration);
            const iconEles = linearEle.querySelectorAll(":scope>Icons>Icon");
            const icons = createIcons(iconEles);
            const mediaFileEles = linearEle.querySelectorAll(":scope>MediaFiles>MediaFile");
            if (!mediaFileEles) {
                sendError(errorUrls, ErrorCode.XMLParseError, macroReplacer);
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
                    sendError(errorUrls, ErrorCode.XMLParseError, macroReplacer);
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
                    const offsetSecond = convertTimeToSecond(offset);
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
      <Creatives>
        <Creative adId="7245" sequence="1">
          <Linear>
            <Duration>00:00:14.014</Duration>
            <TrackingEvents>
              <Tracking event="start"><![CDATA[https://wrapper.test.example/start?clientTime=[TIMESTAMP]&inview_ratio=[INVIEW_RATIO]]]></Tracking>
              <Tracking event="firstQuartile"><![CDATA[https://wrapper.test.example/firstQuartile?clientTime=[TIMESTAMP]&inview_ratio=[INVIEW_RATIO]]]></Tracking>
              <Tracking event="complete"><![CDATA[https://wrapper.test.example/complete?clientTime=[TIMESTAMP]&inview_ratio=[INVIEW_RATIO]]]></Tracking>
            </TrackingEvents>
          </Linear>
        </Creative>
      </Creatives>
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
                const macroReplacer = createReplacer(vastVideoDiv);
                sourceVast = inlineVastSample;
                const vastObject = await vast.parseVast(sourceVast, macroReplacer);
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
                        let mediaType = getMediaType(mediaFile.content);
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
                setBeacons(video, vastObject, macroReplacer);
                setIcons(video, vastVideoDiv, vastObject, macroReplacer);
                vastVideoDiv.appendChild(video);
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
            }
            catch (e) {
                console.log("cannot start Player: " + e);
            }
        }
    }
    const vastExecutor = new VastExecutor();
    window.vastExecutor = window.vastExecutor || vastExecutor;

})();
