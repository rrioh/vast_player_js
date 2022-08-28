import * as lib from "../lib/index";

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
    <InLine>
      <AdSystem version="2.0">nend</AdSystem>
      <AdTitle><![CDATA[スマートフォンアドネットワーク「nend」]]></AdTitle>
      <Description><![CDATA[静止画バナーから動画リワード/動画インターステイシャル/動画ネイティブに対応しています]]></Description>
      <Advertiser><![CDATA[株式会社ファンコミュニケーションズ]]></Advertiser>
      <Error><![CDATA[https://inline.test.example/error?code=[ERRORCODE]&clientTime=[TIMESTAMP]&inview_ratio=[INVIEW_RATIO]]]></Error>
      <Impression id="nend"><![CDATA[https://inline.test.example/impression?clientTime=[TIMESTAMP]&inview_ratio=[INVIEW_RATIO]]]></Impression>
      <Creatives>
        <Creative adId="7245" sequence="1">
          <Linear>
            <Duration>00:00:15</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="1920" height="1080"><![CDATA[https://static-image-hmr.s3.ap-northeast-1.amazonaws.com/exmo.mp4]]></MediaFile>
            </MediaFiles>
            <VideoClicks>
              <ClickThrough><![CDATA[https://mt.united.jp?is=test]]></ClickThrough>
              <ClickTracking><![CDATA[https://inline.test.example/videoclicktracking?clientTime=[TIMESTAMP]&inview_ratio=[INVIEW_RATIO]]]></ClickTracking>
            </VideoClicks>
            <Icons>
              <Icon program="nend" width="10" height="10" xPosition="right" yPosition="top" offset="00:00:05" duration="00:00:06">
                <StaticResource creativeType="image/png"><![CDATA[https://static-image-hmr.s3.ap-northeast-1.amazonaws.com/i.png]]></StaticResource>
                <IconClicks>
                  <IconClickThrough><![CDATA[https://ja.ad-stir.com/sp/optout.html]]></IconClickThrough>
                </IconClicks>
              </Icon>
            </Icons>
            <TrackingEvents>
              <Tracking event="pause"><![CDATA[https://inline.test.example/pause?clientTime=[TIMESTAMP]&inview_ratio=[INVIEW_RATIO]]]></Tracking>
              <Tracking event="skip"><![CDATA[https://inline.test.example/skip?clientTime=[TIMESTAMP]&inview_ratio=[INVIEW_RATIO]]]></Tracking>
              <Tracking event="start"><![CDATA[https://inline.test.example/start?clientTime=[TIMESTAMP]&inview_ratio=[INVIEW_RATIO]]]></Tracking>
              <Tracking event="firstQuartile"><![CDATA[https://inline.test.example/firstQuartile?clientTime=[TIMESTAMP]&inview_ratio=[INVIEW_RATIO]]]></Tracking>
              <Tracking event="midpoint"><![CDATA[https://inline.test.example/midpoint?clientTime=[TIMESTAMP]&inview_ratio=[INVIEW_RATIO]]]></Tracking>
              <Tracking event="thirdQuartile"><![CDATA[https://inline.test.example/thirdQuartile?clientTime=[TIMESTAMP]&inview_ratio=[INVIEW_RATIO]]]></Tracking>
              <Tracking event="complete"><![CDATA[https://inline.test.example/complete?clientTime=[TIMESTAMP]&inview_ratio=[INVIEW_RATIO]]]></Tracking>
              <Tracking event="complete"><![CDATA[https://inline.test.example/complete2?clientTime=[TIMESTAMP]&inview_ratio=[INVIEW_RATIO]]]></Tracking>
            </TrackingEvents>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>
`

interface Executor {
    startPlayer: (sourceVast: string) => void;
}

declare global {
    interface Window {
        vastExecutor: Executor;
    }
}

class VastExecutor implements Executor {
    startPlayer(sourceVast: string) {
        console.log("setPlayer started...");
        sourceVast = inlineVastSample;
        const vastObject = lib.vast.parseVast(sourceVast);
        if (!vastObject) {
            return;
        }

        let iframe = document.createElement("iframe");
        iframe.width = "300px";
        iframe.height = "250px";
        iframe.style.border = "none";

        document.getElementById("playerbox")?.appendChild(iframe);
        let iDoc = iframe.contentWindow!.document;
        iDoc.open();
        iDoc.write(container);
        iDoc.close();
        iDoc.documentElement.style.overflow = "hidden";

        let adTitleDiv = iDoc.getElementById("ad_title")!;
        adTitleDiv.textContent = vastObject.adTitle;
        let adDescDiv = iDoc.getElementById("ad_desc")!;
        if (vastObject.adDesc) {
            adDescDiv.textContent = vastObject.adDesc;
        }

        let vastVideoDiv = iDoc.getElementById("vast_video")!;
        let video = document.createElement("video");
        for (let creative of vastObject.creatives) {
          for (let mediaFile of creative.linear.mediaFiles) {
            let source = document.createElement("source");
            source.src = mediaFile.content;
            let mediaType = lib.getMediaType(mediaFile.content);
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
        video.addEventListener("loadedmetadata", function(e) {
            let progressbar = iDoc.getElementById("progress_bar")!;
            let barAnimationLoop = function() {
                let progressPoint = video.currentTime / video.duration * 100;
                progressbar.style.width = progressPoint + "%";
                requestAnimationFrame(barAnimationLoop);
            }
            requestAnimationFrame(barAnimationLoop);
        });

        const macroReplacer = lib.createReplacer(vastVideoDiv);
        lib.setBeacons(video, vastObject, macroReplacer);
        lib.setIcons(video, vastVideoDiv, vastObject, macroReplacer);

        // IntersectionObserver
        // 50%画面内に入ったら再生、出たら停止
        const options = {
            rootMargin: "0px",
            threshold: 0.5
        }
        function callback(entries: IntersectionObserverEntry[]) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    video.play();
                } else {
                    video.pause();
                }
            });
        }
        const observer = new IntersectionObserver(callback, options);
        observer.observe(video);

        vastVideoDiv.appendChild(video);
    }
}

const vastExecutor = new VastExecutor();

window.vastExecutor = window.vastExecutor || vastExecutor;
