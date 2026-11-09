import { describe, expect, it } from "vitest";
import { decodeShare, encodeShare } from "../share";

describe("encodeShare / decodeShare", () => {
  it("round-trips seed, wallet, heart, tier, and emoji strip", () => {
    const code = encodeShare(123456, {
      wallet: 98_500_000_000,
      heart: 7,
      tier: "Đại gia",
      strip: "🟩🟩🛌🟥",
    });
    const decoded = decodeShare(code);
    expect(decoded).toEqual({
      v: 3,
      seed: 123456,
      w: 98_500_000_000,
      h: 7,
      t: "Đại gia",
      s: "🟩🟩🛌🟥",
    });
  });

  it("returns null on malformed codes", () => {
    expect(decodeShare("")).toBeNull();
    expect(decodeShare("not-valid-base64-json")).toBeNull();
  });
});
