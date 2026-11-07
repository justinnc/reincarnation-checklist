import { mulberry32, hashSeed } from "./rng";
import { buildDeck } from "./deck";
import { STARTING_CAPITAL, STARTING_RECALLS, TIERS } from "./types";
import type { CardStat, Choice, GameState } from "./types";

export function initGame(seed: number): GameState {
  return {
    v: 2,
    seed,
    turns: buildDeck(seed),
    turnIndex: 0,
    wallet: STARTING_CAPITAL,
    recallsLeft: STARTING_RECALLS,
    revealedTrapIds: new Set(),
    history: [],
    finished: false,
  };
}

function stakeAmount(wallet: number, stake: CardStat["stake"]): number {
  if (stake === "quarter") return Math.round(wallet * 0.25);
  if (stake === "half") return Math.round(wallet * 0.5);
  return wallet;
}

/** Deterministic per-(seed,turn) coin flip, independent across turns/replays. */
function turnRng(seed: number, turnIndex: number, salt = ""): () => number {
  return mulberry32(hashSeed(`${seed}:${turnIndex}:${salt}`) ^ seed);
}

export function recall(state: GameState): GameState {
  const turn = state.turns[state.turnIndex];
  if (state.recallsLeft <= 0 || state.finished) return state;
  const trapId =
    turn.kind === "fork"
      ? [turn.left, turn.right].find((c) => c.kind === "trap" && !state.revealedTrapIds.has(c.id))?.id
      : turn.kind === "single" && turn.card.kind === "trap" && !state.revealedTrapIds.has(turn.card.id)
        ? turn.card.id
        : undefined;
  if (!trapId) return state;
  const revealed = new Set(state.revealedTrapIds);
  revealed.add(trapId);
  return { ...state, recallsLeft: state.recallsLeft - 1, revealedTrapIds: revealed };
}

function effectiveOdds(card: CardStat): { winIn10: number; winMult: number; loseMult: number; loseWhy: string } {
  // Traps always resolve against their REAL hidden odds — the printed numbers are
  // just what the card claims. 💡 only lets the player SEE the real numbers first;
  // it never changes what actually happens when the card is played.
  if (card.kind === "trap" && card.real) return card.real;
  return card;
}

export function resolveChoice(state: GameState, choice: Choice): GameState {
  if (state.finished) return state;
  const turn = state.turns[state.turnIndex];
  const idx = state.turnIndex;
  const before = state.wallet;
  let after = before;
  let outcome: "win" | "lose" | "skip" | "event" | "trapAvoided" | "trapHit" = "skip";
  let label = "";

  const playCard = (card: CardStat, salt: string) => {
    const odds = effectiveOdds(card);
    const rng = turnRng(state.seed, idx, salt);
    const win = rng() < odds.winIn10 / 10;
    const stake = stakeAmount(before, card.stake);
    after = Math.round(before - stake + stake * (win ? odds.winMult : odds.loseMult));
    outcome = card.kind === "trap" ? "trapHit" : win ? "win" : "lose";
    label = `${card.verb}${win ? " — thành công" : ` — ${odds.loseWhy}`}`;
  };

  if (turn.kind === "event") {
    const w = turn.event.delta;
    after = Math.round(Math.abs(w) < 1 ? before + before * w : before + w);
    after = Math.max(0, after);
    outcome = "event";
    label = turn.event.title;
  } else if (turn.kind === "single") {
    if (choice.t === "accept") {
      playCard(turn.card, "resolve");
    } else {
      outcome = turn.card.kind === "trap" ? "trapAvoided" : "skip";
      label = `${turn.card.verb} — bỏ qua`;
    }
  } else if (turn.kind === "fork") {
    if (choice.t === "pickLeft" || choice.t === "pickRight") {
      const card = choice.t === "pickLeft" ? turn.left : turn.right;
      playCard(card, "resolve");
    } else {
      outcome = "skip";
      label = "Bỏ cả hai lá";
    }
  }

  const history = [...state.history, { turnIndex: idx, outcome, usedRecall: false, before, after, label }];
  const nextIndex = idx + 1;
  return {
    ...state,
    wallet: after,
    turnIndex: nextIndex,
    finished: nextIndex >= state.turns.length,
    history,
  };
}

export function tierOf(wallet: number): (typeof TIERS)[number] {
  let current: (typeof TIERS)[number] = TIERS[0];
  for (const t of TIERS) if (wallet >= t.min) current = t;
  return current;
}

export function nextTier(wallet: number) {
  const idx = TIERS.findIndex((t) => t.id === tierOf(wallet).id);
  return idx + 1 < TIERS.length ? TIERS[idx + 1] : null;
}
