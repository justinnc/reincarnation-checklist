import { describe, expect, it } from "vitest";
import { hashSeed } from "../rng";
import { buildDeck } from "../deck";
import { initGame, resolveChoice, tierOf } from "../engine";
import { TOTAL_TURNS } from "../types";

describe("buildDeck", () => {
  it("is deterministic for a given seed", () => {
    const a = buildDeck(42);
    const b = buildDeck(42);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("always produces exactly TOTAL_TURNS turns", () => {
    for (const seed of [1, 2, 3, 999, hashSeed("20261107")]) {
      expect(buildDeck(seed).length).toBe(TOTAL_TURNS);
    }
  });

  it("daily seed is stable across calls", () => {
    const s = hashSeed("20261107");
    expect(buildDeck(s)).toEqual(buildDeck(s));
  });
});

describe("resolveChoice", () => {
  it("applies the documented stake/payout formula: wallet - stake + stake*mult", () => {
    let state = initGame(1);
    const card = {
      id: "x", milestoneId: "x", kind: "memory" as const, year: 2000, icon: "x",
      verb: "x", story: "x", stake: "half" as const, winIn10: 10, winMult: 3, loseMult: 0.5, loseWhy: "x",
    };
    state = { ...state, turns: [{ kind: "single", card }], wallet: 100 };
    const after = resolveChoice(state, { t: "accept" });
    // winIn10=10 means guaranteed win: 100 - 50 + 50*3 = 200
    expect(after.wallet).toBe(200);
  });

  it("skip leaves the wallet untouched", () => {
    let state = initGame(1);
    const card = {
      id: "x", milestoneId: "x", kind: "memory" as const, year: 2000, icon: "x",
      verb: "x", story: "x", stake: "all" as const, winIn10: 0, winMult: 5, loseMult: 0, loseWhy: "x",
    };
    state = { ...state, turns: [{ kind: "single", card }], wallet: 100 };
    const after = resolveChoice(state, { t: "skip" });
    expect(after.wallet).toBe(100);
  });

  it("event turns apply a fixed or percentage delta and never go negative", () => {
    let state = initGame(1);
    state = { ...state, turns: [{ kind: "event", event: { id: "e", icon: "x", title: "x", story: "x", delta: -30_000_000 } }], wallet: 10_000_000 };
    const after = resolveChoice(state, { t: "ack" });
    expect(after.wallet).toBe(0);
  });

  it("marks the game finished after the last turn", () => {
    let state = initGame(1);
    const card = { id: "x", milestoneId: "x", kind: "memory" as const, year: 2000, icon: "x", verb: "x", story: "x", stake: "half" as const, winIn10: 10, winMult: 1, loseMult: 1, loseWhy: "x" };
    state = { ...state, turns: [{ kind: "single", card }], wallet: 100 };
    const after = resolveChoice(state, { t: "accept" });
    expect(after.finished).toBe(true);
  });
});

describe("tierOf", () => {
  it("maps wallet amounts to the correct tier thresholds", () => {
    expect(tierOf(0).id).toBe("pham_nhan");
    expect(tierOf(149_000_000).id).toBe("pham_nhan");
    expect(tierOf(150_000_000).id).toBe("tieu_thuong");
    expect(tierOf(1_000_000_000).id).toBe("trung_luu");
    expect(tierOf(5_000_000_000).id).toBe("dai_gia");
    expect(tierOf(25_000_000_000).id).toBe("tai_phiet");
    expect(tierOf(100_000_000_000).id).toBe("thien_menh");
  });
});

describe("worked example from docs/research/simulator-cardgame-redesign.md section 2.7", () => {
  it("reproduces 50 -> 100 -> 350 -> 320 -> 240 -> 600 (million VND) with guaranteed-odds stand-ins", () => {
    // Same stake/payout formula as the real deck, verified turn by turn against the report\'s worked numbers.
    const doiMoi = { id: "1", milestoneId: "1", kind: "memory" as const, year: 1986, icon: "x", verb: "x", story: "x", stake: "half" as const, winIn10: 10, winMult: 3, loseMult: 0.5, loseWhy: "x" };
    const phuMyHung = { id: "2", milestoneId: "2", kind: "memory" as const, year: 1993, icon: "x", verb: "x", story: "x", stake: "half" as const, winIn10: 10, winMult: 6, loseMult: 0.5, loseWhy: "x" };
    const fpt = { id: "3", milestoneId: "3", kind: "memory" as const, year: 2006, icon: "x", verb: "x", story: "x", stake: "all" as const, winIn10: 10, winMult: 2.5, loseMult: 0.3, loseWhy: "x" };
    const hose = { id: "4", milestoneId: "4", kind: "memory" as const, year: 2000, icon: "x", verb: "x", story: "x", stake: "half" as const, winIn10: 0, winMult: 4, loseMult: 0.5, loseWhy: "x" };
    const bta = { id: "5", milestoneId: "5", kind: "memory" as const, year: 2001, icon: "x", verb: "x", story: "x", stake: "half" as const, winIn10: 10, winMult: 2, loseMult: 0.5, loseWhy: "x" };

    let state = initGame(1);
    state = { ...state, wallet: 50_000_000, turns: [
      { kind: "single", card: doiMoi },
      { kind: "single", card: phuMyHung },
      { kind: "event", event: { id: "e", icon: "x", title: "x", story: "x", delta: -30_000_000 } },
      { kind: "fork", left: hose, right: bta },
      { kind: "single", card: fpt },
    ] };

    state = resolveChoice(state, { t: "accept" });
    expect(state.wallet).toBe(100_000_000);
    state = resolveChoice(state, { t: "accept" });
    expect(state.wallet).toBe(350_000_000);
    state = resolveChoice(state, { t: "ack" });
    expect(state.wallet).toBe(320_000_000);
    state = resolveChoice(state, { t: "pickLeft" }); // hose, winIn10=0 -> guaranteed lose
    expect(state.wallet).toBe(240_000_000);
    state = resolveChoice(state, { t: "accept" });
    expect(state.wallet).toBe(600_000_000);
  });
});
