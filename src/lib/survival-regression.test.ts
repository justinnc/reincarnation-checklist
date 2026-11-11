import { describe, expect, it } from "vitest";
import { generateSurvivalRun } from "./survival";
import { mulberry32 } from "./cardgame/rng";

describe("survival user journeys", () => {
  it("keeps the requested start year even if the first event comes later", () => {
    const run = generateSurvivalRun("vn", 1995, mulberry32(42));
    expect(run.startYear).toBe(1995);
    expect(run.rounds[0].year).toBeGreaterThanOrEqual(1995);
  });

  it("does not offer an unaudited peak-trading win on the TGG manipulated-stock event", () => {
    for (let seed = 0; seed < 500; seed++) {
      const run = generateSurvivalRun("vn", 2020, mulberry32(seed));
      expect(run.rounds.map((r) => r.milestone.id)).not.toContain("vn-louis-holdings-tgg-manipulation-2021");
    }
  });
});
