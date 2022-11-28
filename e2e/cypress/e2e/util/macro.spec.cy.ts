import { createReplacer } from "../../../../lib/util/macro";

describe("util/macro.ts - createReplacer", () => {
  it("createReplacer", () => {
    const videoParent: HTMLElement = document.createElement("div");
    const macroReplacer = createReplacer(videoParent);
    assert.isFunction(macroReplacer);
  });
});
