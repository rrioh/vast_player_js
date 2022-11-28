import { convertTimeToSecond } from "../../../../lib/util/time";

describe("util/time.ts - convertTimeToSecond", () => {
  it("convertTimeToSecond", () => {
    let durationStr = "02:34:56.789";
    let second = convertTimeToSecond(durationStr);
    expect(second).to.equal(9296.789);

    durationStr = "10:34:56.789";
    second = convertTimeToSecond(durationStr);
    expect(second).to.equal(38096.789);

    durationStr = "02:34:56";
    second = convertTimeToSecond(durationStr);
    expect(second).to.equal(9296);
  });

  it("convertTimeToSecond - 少数点3位orなし以外は無視", () => {
    let durationStr = "02:34:56.78";
    let second = convertTimeToSecond(durationStr);
    expect(second).to.equal(9296);

    durationStr = "02:34:56.7";
    second = convertTimeToSecond(durationStr);
    expect(second).to.equal(9296);
  });

  it("convertTimeToSecond - エラー", () => {
    // 全て文字列
    let durationStr = "functionerror";
    expect(() => convertTimeToSecond(durationStr)).to.throw(
      "convertdurationToSecond error: " + durationStr
    );

    // 数値部分が文字列
    durationStr = "02:err:56.78";
    expect(() => convertTimeToSecond(durationStr)).to.throw(
      "convertdurationToSecond error: " + durationStr
    );

    // マッチ部分が足りない
    durationStr = "02:34";
    expect(() => convertTimeToSecond(durationStr)).to.throw(
      "convertdurationToSecond error: " + durationStr
    );
  });
});
