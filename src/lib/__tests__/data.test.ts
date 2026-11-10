import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { allMilestones, countries, countryStats, getCountry, getMilestone, getMilestones, yearOf } from "../data";
import { categories } from "../types";

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
