import { describe, expect, it } from "vitest";
import { computeWhatIf, assetMaxYear, LATEST_YEAR } from "../engine";

describe("computeWhatIf", () => {
  it("cash loses real value to inflation over a long span", () => {
    const r = computeWhatIf("cash", 1990, 10_000_000);
    expect(r.finalValue).toBeLessThan(10_000_000);
    expect(r.multiple).toBeLessThan(1);
  });

  it("vn_gold 2000 -> latest year multiplies price ratio", () => {
    const r = computeWhatIf("vn_gold", 2000, 10_000_000);
    expect(r.multiple).toBeGreaterThan(1);
  });

  it("btc 2011 -> latest year is dramatically positive", () => {
    const r = computeWhatIf("btc", 2011, 1_000_000);
    expect(r.multiple).toBeGreaterThan(100);
  });

  it("identical start/end year returns the amount unchanged (gold/index/btc)", () => {
    for (const asset of ["vn_gold", "vn_index", "btc"] as const) {
      const maxY = assetMaxYear(asset);
      const r = computeWhatIf(asset, maxY, 5_000_000, maxY);
      expect(r.finalValue).toBe(5_000_000);
    }
  });

  it("assetMaxYear never exceeds LATEST_YEAR", () => {
    for (const a of ["cash", "vn_savings", "vn_usd", "vn_gold", "vn_index", "btc"] as const) {
      expect(assetMaxYear(a)).toBeLessThanOrEqual(LATEST_YEAR);
    }
  });
});
