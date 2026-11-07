import { describe, expect, it } from "vitest";
import { rankForScore, rebirthScore } from "../scoring";
import { RANKS } from "../types";

describe("rebirthScore", () => {
  it("scores the baseline itself as 0", () => {
    expect(rebirthScore(1000, 1000, 2000)).toBe(0);
  });
  it("scores the optimal itself as 100", () => {
    expect(rebirthScore(2000, 1000, 2000)).toBe(100);
  });
  it("clamps below baseline to 0", () => {
    expect(rebirthScore(500, 1000, 2000)).toBe(0);
  });
  it("clamps above optimal to 100", () => {
    expect(rebirthScore(5000, 1000, 2000)).toBe(100);
  });
  it("falls back to 50 when optimal <= baseline (degenerate data)", () => {
    expect(rebirthScore(1234, 1000, 1000)).toBe(50);
  });
});

describe("rankForScore", () => {
  it("maps 0 to the lowest rank and 100 to the highest", () => {
    expect(rankForScore(0)).toBe(RANKS[0]);
    expect(rankForScore(100)).toBe(RANKS[RANKS.length - 1]);
  });
});
