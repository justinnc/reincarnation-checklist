import { describe, expect, it } from "vitest";
import {
  calculateDecisionOutcome,
  formatUsd,
  formatYears,
  generateSurvivalRun,
  getContemporaryDispatch,
  getSurvivalRank,
  getYearClampNotice,
  sanitizeDispatchHeadline,
  sanitizeDispatchText,
  skipChoiceText,
  type DecisionResult,
  type DecisionType,
  type SurvivalRound,
} from "../survival";
import { allMilestones } from "../data";
import { mulberry32 } from "../cardgame/rng";

const gainMilestone = allMilestones.find((m) => (m.opportunity.returnMultiple ?? 1) > 2)!;
const trapMilestone = allMilestones.find((m) => (m.opportunity.returnMultiple ?? 1) <= 0.2)!;

function round(isTrap: boolean, cappedMultiple = 18, yearGap = 0): SurvivalRound {
  return {
    roundIndex: 1,
    milestone: isTrap ? trapMilestone : gainMilestone,
    isTrap,
    rawMultiple: isTrap ? 0 : cappedMultiple,
    cappedMultiple: isTrap ? 0 : cappedMultiple,
    year: 2000,
    inflationRate: 0.03,
    yearGap,
  };
}

function play(steps: [boolean, DecisionType, number?][]): { results: DecisionResult[]; final: number } {
  let worth = 1000;
  const results: DecisionResult[] = [];
  for (const [isTrap, decision, mult] of steps) {
    const res = calculateDecisionOutcome(round(isTrap, mult ?? 18), decision, worth);
    results.push(res);
    worth = res.newNetWorth;
  }
  return { results, final: worth };
}

describe("survival result titles reflect actual performance", () => {
  it("never calls a run that lost 90% on a trap a flawless master", () => {
    // 3 wins + FTX-style all-in trap: ends far above 80x, but must not claim perfect foresight.
    const { results, final } = play([
      [false, "all_in", 18],
      [true, "all_in"],
      [false, "all_in", 18],
      [false, "all_in", 18],
      [false, "skip"],
    ]);
    expect(results.filter((r) => r.isSuccess).length).toBe(3);
    const rank = getSurvivalRank(final, 1000, results);
    expect(rank.title.en).not.toBe("Reincarnation Master");
    expect(rank.description.en).not.toMatch(/evaded deadly crashes|perfection/i);
    expect(rank.title.en).toBe("Comeback Whale");
    expect(rank.description.en).toMatch(/Lost 90% on 1 trap/);
    expect(rank.description.vi).toMatch(/Mất 90%/);
  });

  it("keeps the glorious copy only for flawless runs", () => {
    const { results, final } = play([
      [false, "all_in", 8],
      [false, "all_in", 8],
      [false, "cautious", 2],
      [true, "skip"],
      [false, "all_in", 2],
    ]);
    const rank = getSurvivalRank(final, 1000, results);
    expect(rank.tier).toBe("master");
    expect(rank.description.en).toMatch(/Evaded deadly crashes/);
  });

  it("gives an honest, funny, shareable title to big losses", () => {
    const { results, final } = play([
      [true, "all_in"],
      [false, "skip"],
      [true, "cautious"],
    ]);
    expect(final).toBeLessThan(300);
    const rank = getSurvivalRank(final, 1000, results);
    expect(rank.title.en).toBe("Rekt Time Traveler");
    expect(rank.title.vi).toBe("Kẻ Du Hành Cháy Túi");
    expect(rank.description.en).toMatch(/2 traps/);
    expect(rank.description.vi).toContain("1.000 USD");
  });

  it("separates small losses from break-even runs", () => {
    expect(getSurvivalRank(780).tier).toBe("singed");
    expect(getSurvivalRank(780).title.en).toBe("Singed Time Traveler");
    expect(getSurvivalRank(1000).tier).toBe("survivor");
  });

  it("only says the account is wiped when practically nothing is left", () => {
    const partial = calculateDecisionOutcome(round(true), "all_in", 1000);
    expect(partial.newNetWorth).toBe(100);
    expect(partial.headline.en).not.toMatch(/WIPED/);
    expect(partial.headline.en).toMatch(/90%/);
    const wiped = calculateDecisionOutcome(round(true), "all_in", 50);
    expect(wiped.headline.en).toMatch(/WIPED/);
  });
});

describe("survival copy formatting", () => {
  it("pluralises years and hides zero-length holds", () => {
    expect(formatYears(1, "en")).toBe("1 year");
    expect(formatYears(4, "en")).toBe("4 years");
    expect(formatYears(1, "vi")).toBe("1 năm");
    expect(skipChoiceText(1, "en")).toContain("for 1 year until");
    expect(skipChoiceText(0, "en")).not.toMatch(/0 years?/);
    expect(skipChoiceText(0, "vi")).not.toMatch(/0 năm/);
  });

  it("formats money with locale separators", () => {
    expect(formatUsd(1000, "en")).toBe("$1,000");
    expect(formatUsd(1000, "vi")).toBe("1.000 USD");
    expect(formatUsd(1234567, "vi")).toBe("1.234.567 USD");
  });

  it("formats skip feedback as currency and avoids article/plural bugs", () => {
    const skip = calculateDecisionOutcome({ ...round(false), yearGap: 300 }, "skip", 1_000_000);
    expect(skip.feedback.en).toMatch(/falls by \$\d{1,3}(,\d{3})+/);
    expect(skip.feedback.vi).toMatch(/\d{1,3}(\.\d{3})+ USD/);
    const oneYear = calculateDecisionOutcome({ ...round(false), yearGap: 1 }, "skip", 1000);
    expect(oneYear.feedback.en).toContain("1 year;");
    const zero = calculateDecisionOutcome({ ...round(false), yearGap: 0 }, "skip", 1000);
    expect(zero.feedback.en).not.toMatch(/0 years/);
    const win = calculateDecisionOutcome(round(false, 18), "all_in", 1000);
    expect(win.feedback.en).not.toMatch(/\ba 18×/);
    expect(win.feedback.en).toContain("18×");
  });
});

describe("start year clamping", () => {
  it("shows a notice when the requested year is moved", () => {
    const run = generateSurvivalRun("us", 2024, mulberry32(1));
    expect(run.startYear).toBeLessThan(2024);
    expect(run.requestedYear).toBe(2024);
    const en = getYearClampNotice(run, "en")!;
    expect(en).toContain("2024");
    expect(en).toContain(`starting in ${run.startYear}`);
    expect(getYearClampNotice(run, "vi")).toContain(`bắt đầu từ năm ${run.startYear}`);
  });

  it("stays silent when the requested year is honoured or absent", () => {
    expect(getYearClampNotice(generateSurvivalRun("vn", 1995, mulberry32(42)), "en")).toBeNull();
    expect(getYearClampNotice(generateSurvivalRun("vn", undefined, mulberry32(42)), "en")).toBeNull();
  });
});

describe("Fog of War dispatch has no hindsight", () => {
  it("strips outcome clauses and later years", () => {
    expect(
      sanitizeDispatchText(
        "The $38 IPO was initially a disaster — the stock fell over 50% in its first year before becoming the trillion-dollar Meta.",
        false,
        2012
      )
    ).toBe("");
    expect(
      sanitizeDispatchText(
        "On May 18, 2012, Facebook IPO'd at $38 per share, raising about $16 billion. The stock fell by more than half by September.",
        false,
        2012
      )
    ).toBe("On May 18, 2012, Facebook IPO'd at $38 per share, raising about $16 billion.");
    expect(sanitizeDispatchText("Shares listed in 1997. By 2021 they were worth 33x more.", false, 1997)).toBe("Shares listed in 1997.");
    expect(sanitizeDispatchText("IPO 38 USD từng là thảm họa — cổ phiếu giảm hơn 50% trước khi trở thành Meta.", true, 2012)).toBe("");
  });

  it("trims spoiler headlines", () => {
    expect(sanitizeDispatchHeadline("Infosys IPO 1993 — the Ultimate Tech Multibagger", false, 1993)).toBe("Infosys IPO 1993");
    expect(sanitizeDispatchHeadline("Daewoo Group Collapses", false, 1999)).toBe("");
  });

  it("the Facebook IPO dispatch does not spoil Meta's future", () => {
    const fb = allMilestones.find((m) => m.id === "us-facebook-ipo-2012")!;
    const d = getContemporaryDispatch({ ...round(false), milestone: fb, year: 2012 });
    expect(d.dispatch.en).not.toMatch(/Meta|trillion|fell|before becoming/i);
    expect(d.sentiment.en).not.toMatch(/Meta/);
    expect(d.dispatch.vi).not.toMatch(/Meta|nghìn tỷ|giảm|trước khi/i);
    expect(d.dispatch.en).toContain("$38");
  });

  it("no generated dispatch mentions a year after its event", () => {
    for (const m of allMilestones) {
      if (m.opportunity.historicalOnly) continue;
      const eventYear = Number(m.date.slice(0, 4));
      const d = getContemporaryDispatch({ ...round(false), milestone: m, year: eventYear });
      for (const text of [d.headline.en, d.dispatch.en, d.headline.vi, d.dispatch.vi]) {
        for (const y of text.match(/\b(1[89]\d{2}|20\d{2})\b/g) ?? []) {
          expect(Number(y), `${m.id}: ${text}`).toBeLessThanOrEqual(eventYear);
        }
      }
    }
  });
});
