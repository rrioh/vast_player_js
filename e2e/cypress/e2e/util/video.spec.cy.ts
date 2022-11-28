import { getMediaType } from "../../../../lib/util/video";

describe("util/video.ts - getMediaType", () => {
  it("getMediaType", () => {
    // video/mp4
    let url = "https://test.com/test.mp4";
    const mp4 = getMediaType(url);
    expect(mp4).to.equal("video/mp4");

    // video/quicktime
    url = "https://test.com/test.mov";
    const quicktime = getMediaType(url);
    expect(quicktime).to.equal("video/quicktime");

    // video/mpeg
    url = "https://test.com/test.mpg";
    const mpeg = getMediaType(url);
    expect(mpeg).to.equal("video/mpeg");

    // webm
    url = "https://test.com/test.webm";
    const webm = getMediaType(url);
    expect(webm).to.equal("video/webm");

    // other
    url = "https://test.com/test.other";
    const other = getMediaType(url);
    expect(other).to.not.equal("video/mp4");
    expect(other).to.equal("");
  });
});
