import { mulberry32, hashSeed } from "./rng";
import { buildBoard } from "./board";
import {
  STARTING_CAPITAL, STARTING_RECALLS, HEART_MAX, HEART_START, HEART_EXHAUSTED,
  BIG_LOSS_HEART, REST_HEART, HOSPITAL_MULT, BROKE_BELOW, TIERS,
} from "./types";
import type { CardStat, Choice, GameState } from "./types";

export function initGame(seed: number): GameState {
  return {
    v: 3,
    seed,
    nodes: buildBoard(seed),
    index: 0,
    wallet: STARTING_CAPITAL,
    heart: HEART_START,
    recallsLeft: STARTING_RECALLS,
    revealedIds: new Set(),
    history: [],
    finished: false,
    endedBy: null,
  };
}

const STAKE_FRAC: Record<CardStat["stake"], number> = { quarter: 0.25, half: 0.5, all: 1 };

function stakeAmount(wallet: number, stake: CardStat["stake"], size: "big" | "small"): number {
  const frac = STAKE_FRAC[stake] * (size === "small" ? 0.5 : 1);
  return Math.round(wallet * frac);
}

function turnRng(seed: number, index: number, salt = ""): () => number {
  return mulberry32(hashSeed(`${seed}:${index}:${salt}`) ^ seed);
}

/** Traps always resolve against their REAL hidden odds. 💡 only lets the player SEE
 * the real numbers first; it never changes what actually happens when played. */
function effectiveOdds(card: CardStat): { winIn10: number; winMult: number; loseMult: number; loseWhy: string } {
  if (card.kind === "trap" && card.real) return card.real;
  return card;
}

export function recall(state: GameState): GameState {
  const node = state.nodes[state.index];
  if (state.recallsLeft <= 0 || state.finished) return state;
  const candidate =
    node.kind === "fork"
      ? [node.left, node.right].find((c) => c.kind !== "memory" && !state.revealedIds.has(c.id))
      : node.kind === "single" && node.card.kind !== "memory" && !state.revealedIds.has(node.card.id)
        ? node.card
        : undefined;
  if (!candidate) return state;
  const revealed = new Set(state.revealedIds);
  revealed.add(candidate.id);
  return { ...state, recallsLeft: state.recallsLeft - 1, revealedIds: revealed };
}

function playCard(seed: number, index: number, wallet: number, heart: number, card: CardStat, size: "big" | "small") {
  const odds = effectiveOdds(card);
  const rng = turnRng(seed, index, "resolve");
  const win = rng() < odds.winIn10 / 10;
  const stake = stakeAmount(wallet, card.stake, size);
  const after = Math.round(wallet - stake + stake * (win ? odds.winMult : odds.loseMult));
  const heartAfter = !win && size === "big" ? Math.max(0, heart + BIG_LOSS_HEART) : heart;
  const outcome: "win" | "lose" | "trapHit" = card.kind === "trap" ? "trapHit" : win ? "win" : "lose";
  const label = `${card.verb}${win ? " — thành công" : ` — ${odds.loseWhy}`}`;
  return { after, heartAfter, outcome, label };
}

export function resolveChoice(state: GameState, choice: Choice): GameState {
  if (state.finished) return state;
  const node = state.nodes[state.index];
  const idx = state.index;
  const before = state.wallet;
  const heartBefore = state.heart;
  let after = before;
  let heartAfter = heartBefore;
  let outcome: import("./types").Outcome = "rest";
  let label = "";

  const exhausted = heartBefore <= HEART_EXHAUSTED;

  if (node.kind === "event") {
    const opt = node.event.options[choice.t === "event" ? { a: 0, b: 1, c: 2 }[choice.option] : 1];
    after = Math.abs(opt.money) < 1 ? Math.round(before * (1 + opt.money)) : Math.max(0, Math.round(before + opt.money));
    heartAfter = Math.min(HEART_MAX, Math.max(0, heartBefore + opt.heart));
    outcome = "event";
    label = `${node.event.title} — ${opt.label}`;
  } else if (node.kind === "single") {
    if (choice.t === "rest") {
      heartAfter = Math.min(HEART_MAX, heartBefore + REST_HEART);
      outcome = "rest";
      label = `${node.card.verb} — nghỉ ngơi`;
    } else {
      const size = choice.t === "big" && !exhausted ? "big" : "small";
      const r = playCard(state.seed, idx, before, heartBefore, node.card, size);
      after = r.after;
      heartAfter = r.heartAfter;
      outcome = r.outcome;
      label = r.label;
    }
  } else if (node.kind === "fork") {
    if (choice.t === "lane") {
      const card = choice.side === "left" ? node.left : node.right;
      const size = exhausted ? "small" : "big";
      const r = playCard(state.seed, idx, before, heartBefore, card, size);
      after = r.after;
      heartAfter = r.heartAfter;
      outcome = r.outcome;
      label = r.label;
    } else {
      heartAfter = Math.min(HEART_MAX, heartBefore + REST_HEART);
      outcome = "rest";
      label = "Nghỉ cả hai làn";
    }
  }

  const nextIndex = idx + 1;
  let endedBy: GameState["endedBy"] = null;
  if (heartAfter <= 0) {
    after = Math.round(after * HOSPITAL_MULT);
    endedBy = "hospital";
  } else if (after < BROKE_BELOW) {
    endedBy = "broke";
  } else if (nextIndex >= state.nodes.length) {
    endedBy = "finish";
  }

  const history = [
    ...state.history,
    { index: idx, choice, outcome, usedRecall: false, before, after, heartBefore, heartAfter, label },
  ];

  return {
    ...state,
    wallet: after,
    heart: heartAfter,
    index: nextIndex,
    finished: endedBy !== null,
    endedBy,
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

export function heartTitle(heart: number): { vi: string; icon: string } {
  if (heart >= 7) return { vi: "an nhàn", icon: "🌿" };
  if (heart >= 4) return { vi: "vất vả", icon: "😮‍💨" };
  if (heart >= 1) return { vi: "kiệt sức", icon: "🥵" };
  return { vi: "nhập viện", icon: "🏥" };
}
