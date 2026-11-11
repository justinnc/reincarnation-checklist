import { describe, it, expect } from "vitest";
import {
  generateSurvivalRun,
  calculateDecisionOutcome,
  getSurvivalRank,
  generateShareText,
  getContemporaryDispatch,
  type SurvivalRound,
} from "./survival";
import { allMilestones } from "./data";
import type { Milestone } from "./types";
import { mulberry32 } from "./cardgame/rng";

describe("survival minigame mechanics", () => {
  it("never picks a historical-only case, even with an invalid numeric return", () => {
    const base = allMilestones.find((m) => m.country === "vn" && (m.opportunity.returnMultiple ?? 0) > 1)!;
    const malformed = {
      ...base,
      id: "fixture-historical-only",
      date: "2021-01",
      opportunity: { ...base.opportunity, historicalOnly: true, returnMultiple: 999 },
    } as unknown as Milestone;
    allMilestones.push(malformed);
    try {
      for (let seed = 0; seed < 100; seed++) {
        const run = generateSurvivalRun("vn", 2021, mulberry32(seed));
        expect(run.rounds.map((r) => r.milestone.id)).not.toContain(malformed.id);
      }
    } finally {
      allMilestones.pop();
    }
  });
  it("replays the same initial country, year and rounds from a seeded RNG", () => {
    const first = generateSurvivalRun(undefined, undefined, mulberry32(42));
    const second = generateSurvivalRun(undefined, undefined, mulberry32(42));
    expect([first.country.code, first.startYear, ...first.rounds.map((r) => r.milestone.id)])
      .toEqual([second.country.code, second.startYear, ...second.rounds.map((r) => r.milestone.id)]);
  });
  it("generates a valid 5-round run sorted chronologically", () => {
    const run = generateSurvivalRun("vn", 1990);
    expect(run.country.code).toBe("vn");
    expect(run.rounds.length).toBe(5);
    expect(run.initialCapital).toBe(1000);

    for (let i = 0; i < run.rounds.length - 1; i++) {
      expect(run.rounds[i].milestone.date <= run.rounds[i + 1].milestone.date).toBe(true);
    }
  });

  it("generates runs for any country safely", () => {
    const countries = ["us", "jp", "cn", "de", "gb"];
    for (const code of countries) {
      const run = generateSurvivalRun(code);
      expect(run.rounds.length).toBe(5);
      expect(run.country.code).toBe(code);
    }
  });

  it("handles All-in on a gain vs trap accurately", () => {
    const gainMilestone = allMilestones.find((m) => (m.opportunity.returnMultiple ?? 1) > 2)!;
    const gainRound: SurvivalRound = {
      roundIndex: 1,
      milestone: gainMilestone,
      isTrap: false,
      rawMultiple: 5,
      cappedMultiple: 5,
      year: 2000,
    };

    const winResult = calculateDecisionOutcome(gainRound, "all_in", 1000);
    expect(winResult.isSuccess).toBe(true);
    expect(winResult.newNetWorth).toBe(5000);

    const trapMilestone = allMilestones.find((m) => (m.opportunity.returnMultiple ?? 1) <= 0.2)!;
    const trapRound: SurvivalRound = {
      roundIndex: 2,
      milestone: trapMilestone,
      isTrap: true,
      rawMultiple: 0,
      cappedMultiple: 0,
      year: 2008,
    };

    const lossResult = calculateDecisionOutcome(trapRound, "all_in", 5000);
    expect(lossResult.isSuccess).toBe(false);
    expect(lossResult.newNetWorth).toBe(500); // 90% lost
  });

  it("rewards dodging a trap with skip", () => {
    const trapMilestone = allMilestones.find((m) => (m.opportunity.returnMultiple ?? 1) <= 0.2)!;
    const trapRound: SurvivalRound = {
      roundIndex: 1,
      milestone: trapMilestone,
      isTrap: true,
      rawMultiple: 0,
      cappedMultiple: 0,
      year: 2008,
    };

    const dodgeResult = calculateDecisionOutcome(trapRound, "skip", 1000);
    expect(dodgeResult.isSuccess).toBe(true);
    expect(dodgeResult.newNetWorth).toBe(1000); // No free bonus without elapsed years
  });

  it("applies assumed compounded erosion to Skip, without bonuses", () => {
    const base = generateSurvivalRun("vn").rounds[0];
    for (const isTrap of [true, false]) {
      const round = { ...base, isTrap, inflationRate: 0.03, yearGap: 5 };
      const result = calculateDecisionOutcome(round, "skip", 1000);
      expect(result.newNetWorth).toBe(Math.round(1000 / 1.03 ** 5));
      expect(result.inflationLoss).toBe(1000 - result.newNetWorth);
      expect(result.isSuccess).toBe(isTrap);
    }
    for (const yearGap of [0, 1000]) {
      const result = calculateDecisionOutcome({ ...base, yearGap, inflationRate: 0.03 }, "skip", 1000);
      expect(result.newNetWorth).toBeGreaterThanOrEqual(0);
      expect(result.newNetWorth).toBeLessThanOrEqual(1000);
      if (yearGap === 0) expect(result.newNetWorth).toBe(1000);
    }
  });

  it("assigns gaps to the next event, with no invented final holding period", () => {
    const run = generateSurvivalRun("vn");
    run.rounds.forEach((round, i) => {
      expect(round.inflationRate).toBe(0.03);
      expect(round.yearGap).toBe(i + 1 < run.rounds.length ? run.rounds[i + 1].year - round.year : 0);
    });
  });

  it("computes correct ranks across wealth brackets", () => {
    expect(getSurvivalRank(100).tier).toBe("broke");
    expect(getSurvivalRank(1200).tier).toBe("survivor");
    expect(getSurvivalRank(5000).tier).toBe("merchant");
    expect(getSurvivalRank(50000).tier).toBe("tycoon");
    expect(getSurvivalRank(250000).tier).toBe("master");
    expect(getSurvivalRank(1500000).tier).toBe("god");
  });

  it("generates share text with emoji trail", () => {
    const run = generateSurvivalRun("vn");
    const dummyRound = run.rounds[0];
    const results = [
      calculateDecisionOutcome(dummyRound, "all_in", 1000),
    ];
    const textVi = generateShareText(run, results, 5000, "vi");
    expect(textVi).toContain("Thử Thách Trọng Sinh");
    expect(textVi).toContain("5.0×");

    const textEn = generateShareText(run, results, 5000, "en");
    expect(textEn).toContain("Reincarnation Survival Run");
  });

  it("masks hindsight spoilers in Fog of War contemporary dispatches", () => {
    const breXMilestone = allMilestones.find((m) => m.id === "ca-bre-x-gold-fraud-1997")!;
    const trapRound: SurvivalRound = {
      roundIndex: 1,
      milestone: breXMilestone,
      isTrap: true,
      rawMultiple: 0,
      cappedMultiple: 0,
      year: 1996,
    };
    const dispatch = getContemporaryDispatch(trapRound);
    expect(dispatch.headline.vi).not.toContain("lừa đảo");
    expect(dispatch.headline.en.toLowerCase()).not.toContain("fraud");
    expect(dispatch.headline.vi).toContain("Bre-X Minerals");
    expect(dispatch.sentiment.vi.length).toBeGreaterThan(0);
  });
});
