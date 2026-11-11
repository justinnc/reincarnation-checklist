import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { allMilestones, countries, countryStats, getCountry, getMilestone, getMilestones, rankListedReturns, sanitizeHistoricalMilestone, toMilestoneLite, yearOf } from "../data";
import { categories, type Milestone } from "../types";

const MILESTONE_DIR = path.resolve(__dirname, "../../data/milestones");
const DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

describe("allMilestones", () => {
  it("has globally unique ids", () => {
    const ids = allMilestones.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("is sorted by date ascending", () => {
    for (let i = 1; i < allMilestones.length; i++) {
      expect(allMilestones[i].date >= allMilestones[i - 1].date).toBe(true);
    }
  });

  it("only contains well-formed dates, known categories and known countries", () => {
    const codes = new Set(countries.map((c) => c.code));
    for (const m of allMilestones) {
      expect(m.date).toMatch(DATE_RE);
      expect(categories).toContain(m.category);
      expect(codes.has(m.country)).toBe(true);
      expect(m.title.en).toBeTruthy();
    }
  });
});

describe("homepage listed-return ranking", () => {
  it("uses listed links rather than the legacy flag and excludes historical-only figures", () => {
    const base = allMilestones[0];
    const linked = { ...base, id: "linked", verified: false, sources: [base.sources[0], base.sources[0]], opportunity: { ...base.opportunity, returnMultiple: 10, historicalOnly: false } } as Milestone;
    const legacy = { ...linked, id: "legacy", verified: true, sources: [base.sources[0]], opportunity: { ...linked.opportunity, returnMultiple: 20 } } as Milestone;
    const historical = { ...linked, id: "historical", verified: true, opportunity: { ...linked.opportunity, returnMultiple: 30, historicalOnly: true } } as unknown as Milestone;
    expect(rankListedReturns([linked, legacy, historical]).map((m) => m.id)).toEqual(["linked"]);
  });
  it("excludes private deals a retail buyer could not have entered", () => {
    const base = allMilestones[0];
    const linked = { ...base, id: "linked", private: false, sources: [base.sources[0], base.sources[0]], opportunity: { ...base.opportunity, returnMultiple: 10, historicalOnly: false } } as Milestone;
    const privateDeal = { ...linked, id: "private", private: true, opportunity: { ...linked.opportunity, returnMultiple: 50 } } as Milestone;
    expect(rankListedReturns([linked, privateDeal]).map((m) => m.id)).toEqual(["linked"]);
    expect(rankListedReturns(allMilestones).some((m) => m.private)).toBe(false);
  });
  it("ranks Ethereum from its first exchange price, not the 2014 presale", () => {
    const eth = allMilestones.find((m) => m.id === "us-ethereum-launch-2015")!;
    expect(eth.opportunity.entryPrice).toBe(2.77);
    expect(eth.opportunity.priceObservations!.entry.date >= eth.date).toBe(true);
  });
});

describe("Vietnam market framing", () => {
  it("never recommends short-selling, which retail investors cannot do on HOSE/HNX", () => {
    const SHORT = /bán khống|\bshort(?:ed|ing)?\b(?!-)/i;
    for (const m of allMilestones.filter((x) => x.country === "vn")) {
      const o = m.opportunity;
      const advice = [o.action, o.buyWhen, o.sellWhen, o.estimatedReturn, m.insiderTip].flatMap((x) => (x ? [x.en, x.vi] : []));
      expect(advice.filter((s) => SHORT.test(s ?? "")), m.id).toEqual([]);
    }
  });
});

describe("historical price corrections", () => {
  it("does not send a historical-only numeric return to client-side gain lists", () => {
    const base = allMilestones[0];
    const malformed = { ...base, opportunity: { ...base.opportunity, historicalOnly: true, returnMultiple: 99 } } as unknown as Milestone;
    expect(toMilestoneLite(malformed).opportunity.returnMultiple).toBeUndefined();
  });
  it("suppresses accidental historical-only prices before a full milestone reaches the UI", () => {
    const base = allMilestones[0];
    const malformed = { ...base, opportunity: { ...base.opportunity, historicalOnly: true, returnMultiple: 99, entryPrice: 1, exitPrice: 99 } } as unknown as Milestone;
    const safe = sanitizeHistoricalMilestone(malformed);
    expect(safe.opportunity.historicalOnly).toBe(true);
    expect(safe.opportunity.returnMultiple).toBeUndefined();
    expect(safe.opportunity.entryPrice).toBeUndefined();
    expect(safe.opportunity.exitPrice).toBeUndefined();
    expect(sanitizeHistoricalMilestone(base)).toBe(base);
  });
  it("does not describe Berkshire's March 1980 quote as a Sunday IPO", () => {
    const m = getMilestone("us", "us-berkshire-hathaway-1980")!;
    for (const lang of ["en", "vi"] as const) {
      expect(m.opportunity.buyWhen[lang]).not.toMatch(/March 16|16\/3\/1980/);
      expect(m.quiz!.question[lang]).not.toMatch(/IPO/i);
      expect(m.quiz!.explanation![lang]).not.toMatch(/offered|chào bán|March 16|16\/3\/1980/i);
    }
    expect(m.opportunity.entryPrice).toBe(290);
  });

  it("does not offer a pizza valuation as an executable Bitcoin return", () => {
    const m = getMilestone("us", "us-bitcoin-pizza-day-2010")!;
    expect(m.opportunity.returnMultiple).toBeUndefined();
    expect(m.opportunity.entryPrice).toBeUndefined();
    expect(m.opportunity.historicalOnly).toBe(true);
    expect(m.description.en).toContain("$41");
    expect(m.description.en).toContain("$0.0041");
  });

  it("frames manipulated TGG prices as history, not a realizable trade", () => {
    const m = getMilestone("vn", "vn-louis-holdings-tgg-manipulation-2021")!;
    expect(m.opportunity.returnMultiple).toBeUndefined();
    expect(m.opportunity.entryPrice).toBeUndefined();
    expect(m.opportunity.exitPrice).toBeUndefined();
    expect(m.opportunity.historicalOnly).toBe(true);
    for (const lang of ["en", "vi"] as const) {
      expect(m.opportunity.action[lang]).not.toMatch(/buy|mua/i);
      expect(m.description[lang]).toMatch(/BII/);
    }
  });

  it("uses Nubank's Dec 9, 2021 closing price, not its intraday $11.91 quote", () => {
    // CNBC reported the $10.33 close; S&P Global reported $11.91 during the session.
    const m = getMilestone("br", "br-nubank-ipo-2021");
    expect(m).toBeDefined();
    expect(m!.opportunity.entryPrice).toBe(9);
    expect(m!.opportunity.exitPrice).toBe(10.33);
    expect(m!.opportunity.returnMultiple).toBeCloseTo(10.33 / 9, 2);
    expect(m!.summary?.en).toContain("15%");
    expect(m!.description.en).toContain("closed its first session at $10.33");
    for (const lang of ["en", "vi"] as const) {
      expect(m!.title[lang]).toMatch(/open|mở cửa/i);
      expect(m!.description[lang]).toMatch(/52/);
      expect(m!.description[lang]).toMatch(/50/);
    }
    expect(m!.description.en).toMatch(/opened at \$11\.25.*\$52 billion/i);
    expect(m!.description.en).toMatch(/closed its first session at \$10\.33.*\$50 billion/i);
  });
});

describe("countries", () => {
  it("has a milestone JSON file for every listed country and vice versa", () => {
    const files = readdirSync(MILESTONE_DIR).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")).sort();
    expect(countries.map((c) => c.code).sort()).toEqual(files);
  });

  it("puts Vietnam first and every country has at least one milestone", () => {
    expect(countries[0].code).toBe("vn");
    for (const c of countries) expect(getMilestones(c.code).length).toBeGreaterThan(0);
  });

  it("has unique codes and a positive stake", () => {
    expect(new Set(countries.map((c) => c.code)).size).toBe(countries.length);
    for (const c of countries) expect(c.stake.amount).toBeGreaterThan(0);
  });
});

describe("getCountry / getMilestones / getMilestone", () => {
  it("finds a country by code and returns undefined otherwise", () => {
    expect(getCountry("vn")?.name.en).toBe("Vietnam");
    expect(getCountry("zz")).toBeUndefined();
    expect(getCountry("VN")).toBeUndefined();
  });

  it("filters milestones to a single country", () => {
    const vn = getMilestones("vn");
    expect(vn.length).toBeGreaterThan(0);
    expect(vn.every((m) => m.country === "vn")).toBe(true);
    expect(getMilestones("zz")).toEqual([]);
  });

  it("looks up a milestone by country + id and rejects a mismatched country", () => {
    const first = allMilestones[0];
    expect(getMilestone(first.country, first.id)).toBe(first);
    expect(getMilestone("zz", first.id)).toBeUndefined();
  });
});

describe("yearOf", () => {
  it("extracts the year from every date shape", () => {
    const base = allMilestones[0];
    expect(yearOf({ ...base, date: "1986" })).toBe(1986);
    expect(yearOf({ ...base, date: "1986-12" })).toBe(1986);
    expect(yearOf({ ...base, date: "1986-12-18" })).toBe(1986);
  });
});

describe("countryStats", () => {
  it("reports count, year range and verified count consistent with the milestone list", () => {
    const list = getMilestones("vn");
    const stats = countryStats("vn");
    expect(stats.count).toBe(list.length);
    expect(stats.from).toBe(Math.min(...list.map(yearOf)));
    expect(stats.to).toBe(Math.max(...list.map(yearOf)));
    expect(stats.from).toBeLessThanOrEqual(stats.to);
    expect(stats.verified).toBe(list.filter((m) => m.verified).length);
    expect(stats.verified).toBeLessThanOrEqual(stats.count);
    expect(stats.sourceLinked).toBe(list.filter((m) => m.sources.length >= 2).length);
  });

  it("counts links independently of the legacy verified flag", () => {
    const m = getMilestone("us", "us-martha-stewart-imclone-insider-trading-2001")!;
    expect(m.verified).toBe(false);
    expect(m.sources.length).toBe(4);
    expect(toMilestoneLite(m).sourceCount).toBe(4);
    expect(countryStats("us").sourceLinked).toBe(getMilestones("us").filter((item) => item.sources.length >= 2).length);
  });

  it("picks the milestone with the highest returnMultiple as best, for every country", () => {
    for (const c of countries) {
      const max = Math.max(...getMilestones(c.code).map((m) => m.opportunity.returnMultiple ?? 0));
      const { best } = countryStats(c.code);
      if (max > 1) expect(best?.opportunity.returnMultiple).toBe(max);
      else expect(best).toBeUndefined();
    }
  });

  it("documents behaviour for an unknown country", () => {
    const stats = countryStats("zz");
    expect(stats.count).toBe(0);
    expect(stats.best).toBeUndefined();
    // TODO: Math.min/max over an empty list yield ±Infinity rather than undefined.
    expect(stats.from).toBe(Infinity);
    expect(stats.to).toBe(-Infinity);
  });
});
