import { beforeAll, describe, expect, it } from "vitest";
import { advanceYear, defaultConfig, initGame, provideData, toNominal, toReal } from "../engine";
import type { YearlyPrices } from "../types";

const fakeData: YearlyPrices = {
  country: "vn",
  dataVersion: "test",
  years: [2000, 2001, 2002, 2003, 2004, 2005],
  cpiIndex: { 2000: 50, 2001: 55, 2002: 60, 2003: 65, 2004: 70, 2005: 100 },
  fxPerUsd: { 2000: 14000, 2001: 14500, 2002: 15000, 2003: 15500, 2004: 16000, 2005: 16500 },
  riskFree: { 2000: 0.06, 2001: 0.06, 2002: 0.06, 2003: 0.06, 2004: 0.06, 2005: 0.06 },
  returns: {
    vn_savings: { 2000: 0.06, 2001: 0.06, 2002: 0.06, 2003: 0.06, 2004: 0.06 },
    vn_index: { 2000: 0.2, 2001: -0.1, 2002: 0.15, 2003: 0.05, 2004: 0.3 },
  },
  closes: {
    vn_index: { 2000: 100, 2001: 120, 2002: 108, 2003: 124, 2004: 130 },
  },
  provenance: [],
  dataQuality: {},
};

beforeAll(() => {
  provideData(fakeData);
});

describe("toNominal / toReal", () => {
  it("round-trips through CPI conversion", () => {
    const nominal = toNominal(1_000_000, 2002);
    const real = toReal(nominal, 2002);
    expect(real).toBeCloseTo(1_000_000, 5);
  });

  it("gives a smaller nominal amount for an earlier (lower-CPI) year", () => {
    const n2000 = toNominal(1_000_000, 2000);
    const n2005 = toNominal(1_000_000, 2005);
    expect(n2000).toBeLessThan(n2005);
  });
});

describe("initGame", () => {
  it("seeds starting cash from capitalReal via CPI", () => {
    const config = defaultConfig({ startYear: 2000, capitalReal: 10_000_000, difficulty: "normal" });
    const state = initGame(123, config);
    expect(state.year).toBe(2000);
    expect(state.cashNominal).toBeCloseTo(toNominal(10_000_000, 2000), 5);
    expect(state.finished).toBe(false);
  });
});

describe("advanceYear", () => {
  it("is deterministic for the same seed and state", () => {
    const config = defaultConfig({ startYear: 2000, capitalReal: 10_000_000, difficulty: "normal" });
    const s0 = initGame(999, config);
    const a = advanceYear(structuredClone(s0));
    const b = advanceYear(structuredClone(s0));
    expect(a).toEqual(b);
  });

  it("advances year and age by exactly one", () => {
    const config = defaultConfig({ startYear: 2000, startAge: 20 });
    const s0 = initGame(1, config);
    const s1 = advanceYear(s0);
    expect(s1.year).toBe(2001);
    expect(s1.age).toBe(21);
  });

  it("never produces negative or NaN net worth in history", () => {
    const config = defaultConfig({ startYear: 2000, capitalReal: 10_000_000 });
    let s = initGame(42, config);
    for (let i = 0; i < 4; i++) s = advanceYear(s);
    for (const h of s.history) {
      expect(Number.isFinite(h.netWorthNominal)).toBe(true);
      expect(Number.isFinite(h.netWorthReal)).toBe(true);
      expect(h.netWorthNominal).toBeGreaterThanOrEqual(0);
    }
  });
});
