import { describe, expect, it } from "vitest";
import { allMilestones } from "../data";
import { describePriceBasis } from "../priceBasis";
import type { Opportunity } from "../types";

const base = { action: { en: "a", vi: "a" }, buyWhen: { en: "b", vi: "b" }, estimatedReturn: { en: "c", vi: "c" } };

describe("describePriceBasis", () => {
  it("states the split multiplier in the formula when shares changed", () => {
    const o = { ...base, entryPrice: 12, exitPrice: 230, splitFactor: 480, returnMultiple: 9200 } as Opportunity;
    expect(describePriceBasis(o, "en")).toContain("Multiple = exit price × 480 shares");
    expect(describePriceBasis(o, "vi")).toContain("Hệ số = giá bán × 480 cổ phiếu");
  });

  it("uses a plain ratio when there is no split", () => {
    const o = { ...base, entryPrice: 2, exitPrice: 20, returnMultiple: 10 } as Opportunity;
    expect(describePriceBasis(o, "en")).toContain("Multiple = exit price ÷ entry price");
  });

  it("admits when no exit price is recorded", () => {
    const o = { ...base, entryPrice: 2, returnMultiple: 10 } as Opportunity;
    expect(describePriceBasis(o, "en")).toContain("no exit price recorded");
  });

  it("says nothing for historical-only cases", () => {
    expect(describePriceBasis({ ...base, historicalOnly: true } as Opportunity, "en")).toBeNull();
  });
});

describe("one price rule for all data", () => {
  it("every priced milestone satisfies multiple = exit × splitFactor ÷ entry (±2%)", () => {
    for (const m of allMilestones) {
      const o = m.opportunity;
      if (o.historicalOnly || !o.entryPrice || !o.exitPrice || !o.returnMultiple) continue;
      const implied = (o.exitPrice * (o.splitFactor ?? 1)) / o.entryPrice;
      expect(Math.abs(implied - o.returnMultiple) / o.returnMultiple, m.id).toBeLessThanOrEqual(0.02);
    }
  });
});
