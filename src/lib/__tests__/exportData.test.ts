import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { AlmanacItem } from "../almanac";
import { allMilestones } from "../data";
import { almanacExport, playbookExport, toCsv } from "../exportData";
import { findOptimalNonOverlappingChain, getPlaybookCandidates, simulatePlaybook } from "../whatif/playbook";

// almanac-data.ts is server-only, so read the same JSON files directly.
const ALMANAC_DIR = join(process.cwd(), "src/data/almanac");
const getAllAlmanacItems = () =>
  readdirSync(ALMANAC_DIR)
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) => JSON.parse(readFileSync(join(ALMANAC_DIR, f), "utf8")) as AlmanacItem[]);

/** Minimal RFC 4180 reader, used to prove the writer round-trips. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\r" && text[i + 1] === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; i++; }
    else cell += c;
  }
  return rows;
}

describe("toCsv", () => {
  it("quotes commas, quotes and line breaks and round-trips", () => {
    const rows = [["a,b", 'say "hi"', "line1\nline2", 1.5, undefined, true]];
    const parsed = parseCsv(toCsv(["x", "y", "z", "n", "u", "b"], rows));
    expect(parsed).toEqual([["x", "y", "z", "n", "u", "b"], ["a,b", 'say "hi"', "line1\nline2", "1.5", "", "true"]]);
  });

  it("neutralises text a spreadsheet would run as a formula, but keeps negative numbers", () => {
    const parsed = parseCsv(toCsv(["t", "n"], [["=SUM(A1)", -3], ["+1", 0], ["-x", 0], ["@cmd", 0]]));
    expect(parsed.slice(1).map((r) => r[0])).toEqual(["'=SUM(A1)", "'+1", "'-x", "'@cmd"]);
    expect(parsed[1][1]).toBe("-3");
  });
});

describe("almanacExport", () => {
  it("exports every stored observation of every item, unchanged, with its sources", () => {
    for (const item of getAllAlmanacItems()) {
      for (const lang of ["en", "vi"] as const) {
        const f = almanacExport(item, lang);
        const rows = parseCsv(f.csv);
        expect(rows.length, item.id).toBe(item.series.length + 1);
        expect(new Set(rows.map((r) => r.length)).size, item.id).toBe(1);
        const json = JSON.parse(f.json);
        expect(json.series, item.id).toEqual(item.series);
        expect(json.sources, item.id).toEqual(item.sources);
        item.series.forEach((p, i) => {
          if (p.value != null) expect(Number(rows[i + 1][2]), item.id).toBe(p.value);
        });
      }
    }
  });
});

describe("playbookExport", () => {
  it("matches the simulated ledger step by step", () => {
    const candidates = getPlaybookCandidates(allMilestones.filter((m) => m.country === "us"));
    const ids = findOptimalNonOverlappingChain(candidates, 5, { realisticOnly: true });
    const result = simulatePlaybook(candidates, ids, 1000, { realistic: true, stakeUnit: 1000 });
    expect(result.steps.length).toBeGreaterThan(0);
    const f = playbookExport(result, { country: "us", currency: "USD", realistic: true, origin: "https://example.test" }, "en");
    const rows = parseCsv(f.csv);
    expect(rows.length).toBe(result.steps.length + 1);
    const json = JSON.parse(f.json);
    expect(json.finalCapital).toBe(result.finalCapital);
    expect(json.mode).toBe("realistic");
    expect(json.note).toMatch(/Not investment advice/);
    result.steps.forEach((s, i) => {
      expect(rows[i + 1][1]).toBe(s.candidate.milestone.id);
      expect(Number(rows[i + 1][8])).toBe(s.capitalAfter);
      expect(json.steps[i].url).toBe(`https://example.test/en/us/${s.candidate.milestone.id}`);
    });
  });
});
