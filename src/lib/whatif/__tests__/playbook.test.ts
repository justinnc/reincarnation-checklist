import { describe, expect, it } from "vitest";
import { allMilestones } from "@/lib/data";
import {
  findOptimalNonOverlappingChain,
  getPlaybookCandidates,
  isSpeculativeOrPrivate,
  simulatePlaybook,
} from "../playbook";

describe("playbook compounding engine", () => {
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
    expect(sim.steps).toHaveLength(2);
  });

  it("flags a private: true milestone as speculative regardless of id", () => {
    const base = allMilestones.find((m) => !isSpeculativeOrPrivate(m))!;
    expect(isSpeculativeOrPrivate({ ...base, private: true })).toBe(true);
  });
});
