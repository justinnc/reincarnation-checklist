import { describe, it, expect } from "vitest";
import {
  generateSurvivalRun,
  calculateDecisionOutcome,
  getSurvivalRank,
  generateShareText,
  type SurvivalRound,
} from "./survival";
import { allMilestones } from "./data";

describe("survival minigame mechanics", () => {
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
    expect(dodgeResult.newNetWorth).toBe(1150); // +15% safety premium
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
    expect(textVi).toContain("5.000");

    const textEn = generateShareText(run, results, 5000, "en");
    expect(textEn).toContain("Reincarnation Survival Run");
  });
});
