import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const script = path.resolve(__dirname, "../../../scripts/validate-data.mjs");

const valid = {
  id: "fixture-history",
  country: "us",
  date: "2010-05-22",
  category: "crypto",
  title: { en: "Historical transaction", vi: "Giao dịch lịch sử" },
  description: { en: "Context only", vi: "Chỉ là bối cảnh" },
  opportunity: {
    historicalOnly: true,
    action: { en: "Read the record", vi: "Đọc tư liệu" },
    buyWhen: { en: "Not applicable", vi: "Không áp dụng" },
    estimatedReturn: { en: "Not a trade", vi: "Không phải giao dịch" },
  },
  sources: [{ title: "Contemporary record", url: "https://example.org/record" }],
  verified: false,
};

function checkFixture(opportunity: Record<string, unknown>, overrides: Record<string, unknown> = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), "milestone-validation-"));
  try {
    writeFileSync(path.join(dir, "fixture.json"), JSON.stringify([{ ...valid, ...overrides, opportunity }]));
    return spawnSync(process.execPath, [script, dir], { encoding: "utf8" });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("milestone validator fixtures", () => {
  it("accepts historical-only context without executable prices", () => {
    const result = checkFixture(valid.opportunity);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("1 milestones");
    expect(result.stdout).toContain("legacy verified flags");
  });

  it.each(["returnMultiple", "entryPrice", "exitPrice"])("rejects historicalOnly with %s", (field) => {
    const result = checkFixture({ ...valid.opportunity, [field]: 2 });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("fixture-history");
    expect(result.stderr).toContain(field);
  });

  it.each([null, "true", 1])("rejects non-boolean historicalOnly value %s", (value) => {
    const result = checkFixture({ ...valid.opportunity, historicalOnly: value });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("historicalOnly must be boolean");
  });

  it("rejects an agent-checked claim without two distinct reviewers and cited evidence", () => {
    const result = checkFixture(valid.opportunity, { claimReview: { status: "agent-checked", proposedBy: "agent-a", checkedBy: "agent-a", claim: valid.title, evidence: [] } });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("claimReview");
  });

  it("accepts an opt-in agent-checked claim with separate agents and linked evidence", () => {
    const result = checkFixture(valid.opportunity, { claimReview: { status: "agent-checked", proposedBy: "agent-a", checkedBy: "agent-b", claim: valid.title, evidence: [{ url: valid.sources[0].url, excerpt: "A short relevant passage", observedOn: "2024-01-10" }] } });
    expect(result.status).toBe(0);
  });

  it("rejects agent identifiers that differ only by whitespace", () => {
    const result = checkFixture(valid.opportunity, { claimReview: { status: "agent-checked", proposedBy: "agent-a", checkedBy: " agent-a ", claim: valid.title, evidence: [{ url: valid.sources[0].url, excerpt: "Passage", observedOn: "2024-01-10" }] } });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("distinct proposing and checking agents");
  });

  it("reports malformed source entries without crashing in linked evidence paths", () => {
    const evidence = { url: valid.sources[0].url, excerpt: "Passage", observedOn: "2024-01-10" };
    const result = checkFixture({ ...valid.opportunity, historicalOnly: false, entryPrice: 10, exitPrice: 20, returnMultiple: 2, priceObservations: { entry: { date: "2010-05-22", unit: "share", currency: "USD", basis: "close", sourceUrl: evidence.url }, exit: { date: "2011-05-22", unit: "share", currency: "USD", basis: "close", sourceUrl: evidence.url } } }, { sources: [null, valid.sources[0]], claimReview: { status: "agent-checked", claim: valid.title, proposedBy: "agent-a", checkedBy: "agent-b", evidence: [evidence] } });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("bad sources");
    expect(result.stderr).not.toContain("TypeError");
  });

  it("rejects a source URL with no hostname even if the evidence cites it", () => {
    const result = checkFixture(valid.opportunity, { sources: [{ title: "Broken", url: "https://" }], claimReview: { status: "agent-checked", proposedBy: "agent-a", checkedBy: "agent-b", claim: valid.title, evidence: [{ url: "https://", excerpt: "Passage", observedOn: "2024-01-10" }] } });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("bad sources");
  });

  it.each(["2010-13", "2010-02-30", "2010-02-29"])("rejects impossible calendar date %s", (date) => {
    const result = checkFixture({ ...valid.opportunity, exitDate: date });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("bad exitDate");
  });

  it("rejects an exit definitively before a partially specified entry date", () => {
    const result = checkFixture({ ...valid.opportunity, historicalOnly: false, exitDate: "2009-12" }, { date: "2010" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("before date");
  });

  const observation = (date: string, unit = "share", currency = "USD") => ({ date, unit, currency, basis: "close", sourceUrl: valid.sources[0].url });
  const priced = { ...valid.opportunity, historicalOnly: false, entryPrice: 10, exitPrice: 20, returnMultiple: 2 };

  it("validates comparable sourced observations and their return ratio", () => {
    const withEvidence = { ...priced, priceObservations: { entry: observation("2010-05-22"), exit: observation("2011-05-22") } };
    expect(checkFixture(withEvidence).status).toBe(0);
    const wrongRatio = checkFixture({ ...withEvidence, returnMultiple: 3 });
    expect(wrongRatio.status).toBe(1);
    expect(wrongRatio.stderr).toContain("prices contradict returnMultiple");
    expect(checkFixture({ ...withEvidence, returnMultiple: 2.1 }).stderr).toContain("prices contradict returnMultiple");
  });

  it("applies one price rule to every entry/exit pair: multiple = exit × splitFactor ÷ entry", () => {
    expect(checkFixture({ ...priced, returnMultiple: 3 }).stderr).toContain("prices contradict returnMultiple");
    expect(checkFixture({ ...priced, splitFactor: 1.5, returnMultiple: 3 }).status).toBe(0);
    expect(checkFixture({ ...priced, splitFactor: 0 }).stderr).toContain("bad splitFactor");
    expect(checkFixture({ ...priced, exitPrice: undefined, splitFactor: 2 }).stderr).toContain("splitFactor needs both");
  });

  it("rejects incomplete, unlinked or incomparable observation metadata", () => {
    const entry = observation("2010-05-22");
    for (const priceObservations of [
      { entry },
      { entry, exit: observation("2011-05-22", "coin") },
      { entry, exit: observation("2011-05-22", "share", "EUR") },
      { entry, exit: { ...observation("2011-05-22"), sourceUrl: "https://example.org/not-listed" } },
      { entry, exit: observation("2009-12-31") },
      { entry, exit: { ...observation("2011-05-22"), basis: "not-a-basis" } },
      { entry, exit: observation("2011-02-30") },
    ]) {
      const result = checkFixture({ ...priced, priceObservations });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("priceObservations");
    }
  });

  it("does not permit price observations on historical-only cases", () => {
    const result = checkFixture({ ...valid.opportunity, priceObservations: { entry: observation("2010-05-22"), exit: observation("2011-05-22") } });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("historicalOnly cannot have priceObservations");
  });

  it.each(["entryPrice", "exitPrice", "returnMultiple"])("rejects a non-positive %s even on a legacy record", (field) => {
    const result = checkFixture({ ...priced, [field]: 0 });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(`bad ${field}`);
  });

  it("rejects a string return multiple rather than coercing it into arithmetic", () => {
    const result = checkFixture({ ...priced, returnMultiple: "2" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("bad returnMultiple");
  });

  it("rejects agent-check evidence that is not listed or dated in the future", () => {
    const review = { status: "agent-checked", proposedBy: "agent-a", checkedBy: "agent-b", claim: valid.title };
    for (const evidence of [
      { url: "https://example.org/unlisted", excerpt: "Passage", observedOn: "2024-01-10" },
      { url: valid.sources[0].url, excerpt: "Passage", observedOn: "2999-01-10" },
    ]) {
      const result = checkFixture(valid.opportunity, { claimReview: { ...review, evidence: [evidence] } });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("claimReview evidence");
    }
  });
});
