import { describe, expect, it } from "vitest";
import { initGame, resolveChoice, tierOf, heartTitle } from "../engine";
import type { GameState } from "../types";

function synthState(overrides: Partial<GameState>): GameState {
  const base = initGame(1);
  return { ...base, ...overrides };
}

describe("resolveChoice: money formula", () => {
  it("big + guaranteed win: wallet - stake + stake*mult", () => {
    const card = { id: "x", milestoneId: "x", kind: "memory" as const, year: 2000, icon: "x", verb: "x", story: "x", stake: "half" as const, winIn10: 10, winMult: 3, loseMult: 0.5, loseWhy: "x" };
    let state = synthState({ nodes: [{ kind: "single", year: 2000, card }], wallet: 100, heart: 10 });
    state = resolveChoice(state, { t: "big" });
    expect(state.wallet).toBe(200); // 100 - 50 + 50*3
    expect(state.heart).toBe(10); // won, no heart loss
  });

  it("big + guaranteed loss costs 2 hearts", () => {
    const card = { id: "x", milestoneId: "x", kind: "memory" as const, year: 2000, icon: "x", verb: "x", story: "x", stake: "half" as const, winIn10: 0, winMult: 3, loseMult: 0.5, loseWhy: "x" };
    let state = synthState({ nodes: [{ kind: "single", year: 2000, card }], wallet: 100, heart: 10 });
    state = resolveChoice(state, { t: "big" });
    expect(state.wallet).toBe(75); // 100 - 50 + 50*0.5
    expect(state.heart).toBe(8);
  });

  it("small never costs hearts even on loss, and stakes half as much", () => {
    const card = { id: "x", milestoneId: "x", kind: "memory" as const, year: 2000, icon: "x", verb: "x", story: "x", stake: "half" as const, winIn10: 0, winMult: 3, loseMult: 0.5, loseWhy: "x" };
    let state = synthState({ nodes: [{ kind: "single", year: 2000, card }], wallet: 100, heart: 10 });
    state = resolveChoice(state, { t: "small" });
    expect(state.wallet).toBe(87.5 === 87.5 ? 88 : 0); // 100 - 25 + 25*0.5 = 87.5, rounds to 88
    expect(state.heart).toBe(10);
  });

  it("rest adds 1 heart, capped at 10, no money change", () => {
    const card = { id: "x", milestoneId: "x", kind: "memory" as const, year: 2000, icon: "x", verb: "x", story: "x", stake: "half" as const, winIn10: 5, winMult: 3, loseMult: 0.5, loseWhy: "x" };
    let state = synthState({ nodes: [{ kind: "single", year: 2000, card }], wallet: 100, heart: 10 });
    state = resolveChoice(state, { t: "rest" });
    expect(state.wallet).toBe(100);
    expect(state.heart).toBe(10);
  });

  it("heart <= 3 forces big down to small even if 'big' is chosen", () => {
    const card = { id: "x", milestoneId: "x", kind: "memory" as const, year: 2000, icon: "x", verb: "x", story: "x", stake: "half" as const, winIn10: 0, winMult: 3, loseMult: 0.5, loseWhy: "x" };
    let state = synthState({ nodes: [{ kind: "single", year: 2000, card }], wallet: 100, heart: 3 });
    state = resolveChoice(state, { t: "big" });
    // forced small: stake = 100*0.5*0.5=25, lose -> 100-25+25*0.5=87.5~88, no heart loss (small never costs hearts)
    expect(state.wallet).toBe(88);
    expect(state.heart).toBe(3);
  });
});

describe("resolveChoice: events", () => {
  it("percentage option applies a fraction of wallet and adjusts heart", () => {
    const event = {
      id: "e", icon: "x", title: "x", story: "x",
      options: [
        { id: "a" as const, icon: "x", label: "A", money: -0.1, heart: -2 },
        { id: "b" as const, icon: "x", label: "B", money: -0.03, heart: 1 },
        { id: "c" as const, icon: "x", label: "C", money: 0, heart: 0 },
      ] as [import("../types").EventOption, import("../types").EventOption, import("../types").EventOption],
    };
    let state = synthState({ nodes: [{ kind: "event", year: 2000, approx: true, event }], wallet: 1000, heart: 10 });
    state = resolveChoice(state, { t: "event", option: "a" });
    expect(state.wallet).toBe(900);
    expect(state.heart).toBe(8);
  });

  it("fixed-VND option applies an absolute delta", () => {
    const event = {
      id: "e", icon: "x", title: "x", story: "x",
      options: [
        { id: "a" as const, icon: "x", label: "A", money: -30_000_000, heart: 0 },
        { id: "b" as const, icon: "x", label: "B", money: -10_000_000, heart: -2 },
        { id: "c" as const, icon: "x", label: "C", money: 0, heart: -3 },
      ] as [import("../types").EventOption, import("../types").EventOption, import("../types").EventOption],
    };
    let state = synthState({ nodes: [{ kind: "event", year: 2000, approx: true, event }], wallet: 50_000_000, heart: 10 });
    state = resolveChoice(state, { t: "event", option: "a" });
    expect(state.wallet).toBe(20_000_000);
  });
});

describe("game-ending conditions", () => {
  it("ends with endedBy='hospital' and halves the wallet when heart reaches 0 (only events can push past the exhausted floor)", () => {
    const event = {
      id: "e", icon: "x", title: "x", story: "x",
      options: [
        { id: "a" as const, icon: "x", label: "A", money: 0, heart: -3 },
        { id: "b" as const, icon: "x", label: "B", money: 0, heart: -1 },
        { id: "c" as const, icon: "x", label: "C", money: 0, heart: 0 },
      ] as [import("../types").EventOption, import("../types").EventOption, import("../types").EventOption],
    };
    let state = synthState({ nodes: [{ kind: "event", year: 2000, approx: true, event }], wallet: 100_000_000, heart: 3 });
    state = resolveChoice(state, { t: "event", option: "a" });
    expect(state.endedBy).toBe("hospital");
    expect(state.finished).toBe(true);
    expect(state.wallet).toBe(50_000_000); // halved
  });

  it("ends with endedBy='broke' when wallet drops below 1,000,000", () => {
    const card = { id: "x", milestoneId: "x", kind: "memory" as const, year: 2000, icon: "x", verb: "x", story: "x", stake: "all" as const, winIn10: 0, winMult: 1, loseMult: 0, loseWhy: "x" };
    let state = synthState({ nodes: [{ kind: "single", year: 2000, card }], wallet: 10_000_000, heart: 10 });
    state = resolveChoice(state, { t: "big" });
    expect(state.endedBy).toBe("broke");
  });

  it("ends with endedBy='finish' after the last node", () => {
    const card = { id: "x", milestoneId: "x", kind: "memory" as const, year: 2000, icon: "x", verb: "x", story: "x", stake: "half" as const, winIn10: 10, winMult: 1, loseMult: 1, loseWhy: "x" };
    let state = synthState({ nodes: [{ kind: "single", year: 2000, card }], wallet: 10_000_000, heart: 10 });
    state = resolveChoice(state, { t: "rest" });
    expect(state.endedBy).toBe("finish");
  });
});

describe("tierOf / heartTitle", () => {
  it("maps wallet amounts to the correct tier thresholds", () => {
    expect(tierOf(0).id).toBe("pham_nhan");
    expect(tierOf(150_000_000).id).toBe("tieu_thuong");
    expect(tierOf(100_000_000_000).id).toBe("thien_menh");
  });

  it("maps heart ranges to the documented titles", () => {
    expect(heartTitle(10).vi).toBe("an nhàn");
    expect(heartTitle(5).vi).toBe("vất vả");
    expect(heartTitle(2).vi).toBe("kiệt sức");
    expect(heartTitle(0).vi).toBe("nhập viện");
  });
});

describe("worked example from docs/research/simulator-roadmap-redesign.md section 5", () => {
  it("reproduces the documented money/heart trajectory with guaranteed-odds stand-ins", () => {
    // Same formula as the real nodes, verified turn by turn against the report's worked numbers.
    const doiMoi = { id: "1", milestoneId: "1", kind: "memory" as const, year: 1986, icon: "x", verb: "x", story: "x", stake: "half" as const, winIn10: 10, winMult: 3, loseMult: 0.5, loseWhy: "x" };
    const scamEvent = {
      id: "e-scam", icon: "x", title: "x", story: "x",
      options: [
        { id: "a" as const, icon: "x", label: "A", money: -0.04, heart: -3 },
        { id: "b" as const, icon: "x", label: "B", money: -0.08, heart: -1 },
        { id: "c" as const, icon: "x", label: "C", money: -0.1, heart: 0 },
      ] as [import("../types").EventOption, import("../types").EventOption, import("../types").EventOption],
    };
    const phuMyHung = { id: "2", milestoneId: "2", kind: "memory" as const, year: 1993, icon: "x", verb: "x", story: "x", stake: "half" as const, winIn10: 10, winMult: 6, loseMult: 0.5, loseWhy: "x" };

    let state = synthState({
      wallet: 50_000_000,
      heart: 10,
      nodes: [
        { kind: "single", year: 1986, card: doiMoi },
        { kind: "event", year: 1990, approx: true, event: scamEvent },
        { kind: "single", year: 1993, card: phuMyHung },
      ],
    });

    state = resolveChoice(state, { t: "big" });
    expect(state.wallet).toBe(100_000_000);
    expect(state.heart).toBe(10);

    state = resolveChoice(state, { t: "event", option: "b" }); // "coi như học phí": -8%, heart -1
    expect(state.wallet).toBe(92_000_000);
    expect(state.heart).toBe(9);

    state = resolveChoice(state, { t: "big" });
    expect(state.wallet).toBe(322_000_000); // 92 - 46 + 46*6
    expect(state.heart).toBe(9);
  });
});
