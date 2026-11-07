import { describe, expect, it } from "vitest";
import { decodeShare, encodeShare, todaySeedString } from "../share";
import type { GameConfig, Action } from "../types";

describe("encodeShare / decodeShare", () => {
  const config: GameConfig = { country: "vn", startYear: 1995, startAge: 18, capitalReal: 10_000_000, difficulty: "normal" };
  const actions: Action[] = [
    { t: "buy", asset: "vn_gold", amount: 1_000_000 },
    { t: "endYear" },
    { t: "sell", asset: "vn_gold", amount: 500_000 },
  ];

  it("round-trips a payload", () => {
    const encoded = encodeShare({ v: 1, seed: 777, config, actions });
    const decoded = decodeShare(encoded);
    expect(decoded).toEqual({ v: 1, seed: 777, config, actions });
  });

  it("is URL-safe (no +, /, or = characters)", () => {
    const encoded = encodeShare({ v: 1, seed: 777, config, actions });
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it("returns null for garbage input", () => {
    expect(decodeShare("not-valid-base64!!!")).toBeNull();
  });
});

describe("todaySeedString", () => {
  it("formats as YYYYMMDD", () => {
    const d = new Date(2026, 10, 7); // Nov 7 2026 (month is 0-indexed)
    expect(todaySeedString(d)).toBe("20261107");
  });
});
