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
    async startPlayer(sourceVast: string) {
        console.log("setPlayer started...");

        try {
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

          let vastVideoDiv = iDoc.getElementById("vast_video")!;
          const macroReplacer = lib.createReplacer(vastVideoDiv);

          sourceVast = inlineVastSample;
          const vastObject = await lib.vast.parseVast(sourceVast, macroReplacer);
          if (!vastObject) {
              return;
          }

          let adTitleDiv = iDoc.getElementById("ad_title")!;
          adTitleDiv.textContent = vastObject.adTitle;
          let adDescDiv = iDoc.getElementById("ad_desc")!;
          if (vastObject.adDesc) {
              adDescDiv.textContent = vastObject.adDesc;
          }

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

          lib.setBeacons(video, vastObject, macroReplacer);
          lib.setIcons(video, vastVideoDiv, vastObject, macroReplacer);

          vastVideoDiv.appendChild(video);

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

        } catch (e) {
          console.log("cannot start Player: " + e);
        }
    }
}

const vastExecutor = new VastExecutor();

window.vastExecutor = window.vastExecutor || vastExecutor;
