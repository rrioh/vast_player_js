import vast from "../lib/vast";
import { setBeacons } from "../lib/beacon";

const container = `
<!DOCTYPE html>
<html>
    <head>
    </head>
    <body style="margin:0;">
        <div id="vast_video_container">
            <div id="vast_video" style="width:300px;height:168.75px;"></div>
            <div id="progress_bar" style="width:50%;height:2px;background-color:gray;"></div>
            <div id="ad_title" style="margin:0;width:298px;height:77.25px;background-color:#dcdcdc;"></div>
        </div>
    </body>
</html>
`;

const inlineVastSample = `
<VAST version="4.2">
  <Ad id="1b330e59-3a62-4000-b9fb-ac9726e98c52" sequence="1">
    <InLine>
      <AdSystem version="2.0">nend</AdSystem>
      <AdTitle><![CDATA[スマートフォンアドネットワーク「nend」]]></AdTitle>
      <Description><![CDATA[静止画バナーから動画リワード/動画インターステイシャル/動画ネイティブに対応しています]]></Description>
      <Advertiser><![CDATA[株式会社ファンコミュニケーションズ]]></Advertiser>
      <Error><![CDATA[https://inline.test.example/error?code=[ERRORCODE]&clientTime=[TIMESTAMP]]]></Error>
      <Impression id="nend"><![CDATA[https://inline.test.example/impression?clientTime=[TIMESTAMP]]]></Impression>
      <Creatives>
        <Creative adId="7245" sequence="1">
          <Linear>
            <Duration>00:00:15</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="1920" height="1080"><![CDATA[https://s3-ap-northeast-1.amazonaws.com/adstir-stage-js/video/AdStir-MOVIE-JP-15.mp4]]></MediaFile>
            </MediaFiles>
            <VideoClicks>
              <ClickThrough><![CDATA[https://mt.united.jp?is=test]]></ClickThrough>
              <ClickTracking><![CDATA[https://inline.test.example/videoclicktracking?clientTime=[TIMESTAMP]]]></ClickTracking>
            </VideoClicks>
            <Icons>
              <Icon program="nend" width="10" height="10" xPosition="right" yPosition="top">
                <StaticResource creativeType="image/png"><![CDATA[https://s3-ap-northeast-1.amazonaws.com/adstir-stage-js/optout/i1.png]]></StaticResource>
                <IconClicks>
                  <IconClickThrough><![CDATA[https://ja.ad-stir.com/sp/optout.html]]></IconClickThrough>
                </IconClicks>
              </Icon>
            </Icons>
            <TrackingEvents>
              <Tracking event="pause"><![CDATA[https://inline.test.example/pause?clientTime=[TIMESTAMP]]]></Tracking>
              <Tracking event="skip"><![CDATA[https://inline.test.example/skip?clientTime=[TIMESTAMP]]]></Tracking>
              <Tracking event="start"><![CDATA[https://inline.test.example/start?clientTime=[TIMESTAMP]]]></Tracking>
              <Tracking event="firstQuartile"><![CDATA[https://inline.test.example/firstQuartile?clientTime=[TIMESTAMP]]]></Tracking>
              <Tracking event="midpoint"><![CDATA[https://inline.test.example/midpoint?clientTime=[TIMESTAMP]]]></Tracking>
              <Tracking event="thirdQuartile"><![CDATA[https://inline.test.example/thirdQuartile?clientTime=[TIMESTAMP]]]></Tracking>
              <Tracking event="complete"><![CDATA[https://inline.test.example/complete?clientTime=[TIMESTAMP]]]></Tracking>
              <Tracking event="complete"><![CDATA[https://inline.test.example/complete2?clientTime=[TIMESTAMP]]]></Tracking>
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
        const vastObject = vast.parseVast(sourceVast);

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

        let vastVideoDiv = iDoc.getElementById("vast_video")!;
        let video = document.createElement("video");
        video.src = vastObject.mediaFileUrl;
        video.width = 300;
        video.height = 168.75;
        video.muted = true;
        video.autoplay = true;

        video.addEventListener("loadedmetadata", function(e) {
            let progressbar = iDoc.getElementById("progress_bar")!;
            let barAnimationLoop = function() {
                let progressPoint = video.currentTime / video.duration * 100;
                progressbar.style.width = progressPoint + "%";
                requestAnimationFrame(barAnimationLoop);
            }
            requestAnimationFrame(barAnimationLoop);
        });

        setBeacons(video, vastObject);

        vastVideoDiv.appendChild(video);
    }
}

const vastExecutor = new VastExecutor();

window.vastExecutor = window.vastExecutor || vastExecutor;
