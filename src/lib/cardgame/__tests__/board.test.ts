import { describe, expect, it } from "vitest";
import { hashSeed } from "../rng";
import { buildBoard } from "../board";
import { TOTAL_NODES } from "../types";

function nodeYears(nodes: ReturnType<typeof buildBoard>): number[] {
  return nodes.map((n) => n.year);
}

describe("buildBoard invariants", () => {
  it("always produces exactly TOTAL_NODES nodes", () => {
    for (const seed of [1, 2, 3, 999, hashSeed("20261108")]) {
      expect(buildBoard(seed).length).toBe(TOTAL_NODES);
    }
  });

  it("is deterministic for a given seed", () => {
    const a = buildBoard(42);
    const b = buildBoard(42);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("years never decrease across 1000 seeds (the bug the roadmap redesign found)", () => {
    for (let seed = 1; seed <= 1000; seed++) {
      const years = nodeYears(buildBoard(seed));
      for (let i = 1; i < years.length; i++) {
        expect(years[i]).toBeGreaterThanOrEqual(years[i - 1]);
      }
    }
  });

  it("fork-pair years never differ by more than 2 (the other bug the redesign found)", () => {
    for (let seed = 1; seed <= 1000; seed++) {
      for (const node of buildBoard(seed)) {
        if (node.kind === "fork") {
          expect(Math.abs(node.left.year - node.right.year)).toBeLessThanOrEqual(2);
        }
      }
    }
  });

  it("a rumor inside a fork is a trap roughly half the time (not always, which would leak)", () => {
    let trapCount = 0;
    let rumorForkCount = 0;
    for (let seed = 1; seed <= 2000; seed++) {
      for (const node of buildBoard(seed)) {
        if (node.kind !== "fork") continue;
        for (const card of [node.left, node.right]) {
          if (card.kind !== "memory") {
            rumorForkCount++;
            if (card.kind === "trap") trapCount++;
          }
        }
      }
    }
    const ratio = trapCount / rumorForkCount;
    expect(ratio).toBeGreaterThan(0.3);
    expect(ratio).toBeLessThan(0.7);
  });

  it("daily seed is stable across calls", () => {
    const s = hashSeed("20261108");
    expect(buildBoard(s)).toEqual(buildBoard(s));
  });
});
