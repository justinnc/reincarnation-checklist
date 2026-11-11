import { describe, expect, it } from "vitest";
import { allMilestones } from "@/lib/data";
import type { MilestoneLite } from "@/lib/types";
import {
  findOptimalNonOverlappingChain,
  getPlaybookCandidates,
  isSpeculativeOrPrivate,
  simulatePlaybook,
} from "../playbook";

describe("playbook compounding engine", () => {
  it("excludes historical-only cases even when passed a bad numeric multiple", () => {
    const base = allMilestones.find((m) => (m.opportunity.returnMultiple ?? 0) > 1)!;
    const malformed = { ...base, opportunity: { ...base.opportunity, historicalOnly: true, returnMultiple: 99 } } as MilestoneLite;
    expect(getPlaybookCandidates([malformed])).toEqual([]);
  });
  const vnCandidates = getPlaybookCandidates(allMilestones.filter((m) => m.country === "vn"));

  it("extracts gain candidates sorted chronologically", () => {
    expect(vnCandidates.length).toBeGreaterThanOrEqual(8);
    for (let i = 1; i < vnCandidates.length; i++) {
      expect(vnCandidates[i].startYear).toBeGreaterThanOrEqual(vnCandidates[i - 1].startYear);
    }
  });

  it("finds a non-overlapping optimal chain with totalMultiple > 100", () => {
    const chain = findOptimalNonOverlappingChain(vnCandidates, 5);
    expect(chain.length).toBeGreaterThanOrEqual(2);
    const sim = simulatePlaybook(vnCandidates, chain, 10_000_000);
    expect(sim.hasOverlap).toBe(false);
    expect(sim.totalMultiple).toBeGreaterThan(100);
    expect(sim.finalCapital).toBeCloseTo(10_000_000 * sim.totalMultiple, -2);
  });

  it("flags overlapping holding periods when two overlapping milestones are selected", () => {
    const overlappingPair = vnCandidates.slice(0, 2).map((c) => c.milestone.id);
    const sim = simulatePlaybook(vnCandidates, overlappingPair, 1_000_000);
    expect(sim.hasOverlap).toBe(true);
    expect(sim.steps).toHaveLength(1);
    expect(sim.skippedOverlaps.map((c) => c.milestone.id)).toEqual([overlappingPair[1]]);
  });

  it("never reinvests Berkshire 2024 proceeds into a Dell trade starting in 1988", () => {
    const us = getPlaybookCandidates(allMilestones.filter((m) => m.country === "us"));
    const ids = ["us-berkshire-hathaway-1980", "us-dell-ipo-1988"];
    for (const realistic of [false, true]) {
      const result = simulatePlaybook(us, ids, 1000, { realistic });
      expect(result.hasOverlap).toBe(true);
      expect(result.steps.map((s) => s.candidate.milestone.id)).toEqual([ids[0]]);
      expect(result.finalCapital).toBe(result.steps[0].capitalAfter);
    }
  });

  it("flags a private: true milestone as speculative regardless of id", () => {
    const base = allMilestones.find((m) => !isSpeculativeOrPrivate(m))!;
    expect(isSpeculativeOrPrivate({ ...base, private: true })).toBe(true);
  });
});
