import { describe, expect, it } from "vitest";
import { mulberry32 } from "../rng";
import { initGame, resolveChoice } from "../engine";

type Strategy = "skipAll" | "acceptAll" | "random" | "historyAware";

function playOut(seed: number, strategy: Strategy, rng: () => number): number {
  let state = initGame(seed);
  while (!state.finished) {
    const turn = state.turns[state.turnIndex];
    if (turn.kind === "event") {
      state = resolveChoice(state, { t: "ack" });
      continue;
    }
    if (turn.kind === "single") {
      const isTrap = turn.card.kind === "trap";
      let accept: boolean;
      if (strategy === "skipAll") accept = false;
      else if (strategy === "acceptAll") accept = true;
      else if (strategy === "random") accept = rng() < 0.5;
      else accept = !isTrap; // historyAware: knows which cards are traps, skips them
      state = resolveChoice(state, accept ? { t: "accept" } : { t: "skip" });
      continue;
    }
    // fork
    const leftIsTrap = turn.left.kind === "trap";
    const rightIsTrap = turn.right.kind === "trap";
    let choice: "pickLeft" | "pickRight" | "skipBoth";
    if (strategy === "skipAll") choice = "skipBoth";
    else if (strategy === "acceptAll") choice = "pickLeft";
    else if (strategy === "random") choice = rng() < 0.33 ? "pickLeft" : rng() < 0.5 ? "pickRight" : "skipBoth";
    else choice = !leftIsTrap ? "pickLeft" : !rightIsTrap ? "pickRight" : "skipBoth";
    state = resolveChoice(state, { t: choice });
  }
  return state.wallet;
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

describe("balance: historical knowledge should beat accepting everything", () => {
  it("historyAware median > acceptAll median > random median > skipAll", () => {
    const N = 500;
    const rng = mulberry32(777);
    const results: Record<Strategy, number[]> = { skipAll: [], acceptAll: [], random: [], historyAware: [] };
    for (let i = 0; i < N; i++) {
      const seed = Math.floor(rng() * 2 ** 31);
      (Object.keys(results) as Strategy[]).forEach((strat) => {
        results[strat].push(playOut(seed, strat, rng));
      });
    }
    const med = Object.fromEntries(
      (Object.keys(results) as Strategy[]).map((k) => [k, median(results[k])])
    ) as Record<Strategy, number>;

    expect(med.historyAware).toBeGreaterThan(med.acceptAll);
    expect(med.acceptAll).toBeGreaterThan(med.random);
    expect(med.random).toBeGreaterThan(med.skipAll);
  });
});
