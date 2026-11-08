import { mulberry32, seededShuffle } from "./rng";
import { MEMORY_CARDS, TRAP_CARDS, EVENTS } from "./deckData";
import type { BoardNode, CardStat } from "./types";
import { TOTAL_NODES } from "./types";

// Fixed backbone 1986-2005: only 8 cards exist for this span in the data, so every
// seed shares this opening (only dice results and events differ). Documented tradeoff.
const BACKBONE_SINGLE_IDS = ["c-doi-moi-1986", "c-phu-my-hung-1993", "c-us-embargo-1994", "c-us-normalize-1995", "c-coffee-1996", "c-hnx-2005"];
const BACKBONE_FORK: [string, string] = ["c-hose-2000", "c-bta-2001"];
const GENUINE_FORK_CANDIDATES = ["c-ecommerce-2010", "c-grab-2014", "c-crypto-2021"];

function byId(id: string): CardStat {
  const card = [...MEMORY_CARDS, ...TRAP_CARDS].find((c) => c.id === id);
  if (!card) throw new Error(`Unknown card id: ${id}`);
  return card;
}

/** Deterministic 20-node board for a given seed. Same seed -> identical board, forever.
 * Invariants (tested): years never decrease; fork-pair years differ by at most 2. */
export function buildBoard(seed: number): BoardNode[] {
  const rng = mulberry32(seed ^ 0x9e3779b9);

  // A. Fixed backbone, 1986-2005.
  const backbone: BoardNode[] = [
    ...BACKBONE_SINGLE_IDS.slice(0, 5).map((id) => ({ kind: "single" as const, year: byId(id).year, card: byId(id) })),
    { kind: "fork" as const, year: byId(BACKBONE_FORK[0]).year, left: byId(BACKBONE_FORK[0]), right: byId(BACKBONE_FORK[1]) },
    ...BACKBONE_SINGLE_IDS.slice(5).map((id) => ({ kind: "single" as const, year: byId(id).year, card: byId(id) })),
  ];
  const backboneIds = new Set([...BACKBONE_SINGLE_IDS, ...BACKBONE_FORK]);

  // B. 2006-2024, randomized per seed.
  const remainingMemory = MEMORY_CARDS.filter((c) => !backboneIds.has(c.id) && c.year >= 2006);
  const remainingTraps = seededShuffle(TRAP_CARDS, rng);
  const traps = remainingTraps.slice(0, 4);

  const usedMemoryIds = new Set<string>();
  function nearestPartner(year: number): CardStat {
    const candidates = remainingMemory
      .filter((c) => !usedMemoryIds.has(c.id) && Math.abs(c.year - year) <= 2)
      .sort((a, b) => Math.abs(a.year - year) - Math.abs(b.year - year));
    const picked = candidates[0] ?? remainingMemory.find((c) => !usedMemoryIds.has(c.id))!;
    usedMemoryIds.add(picked.id);
    return picked;
  }

  const trapForks: BoardNode[] = traps.slice(0, 2).map((trap) => {
    const partner = nearestPartner(trap.year);
    const [left, right] = trap.year <= partner.year ? [trap, partner] : [partner, trap];
    return { kind: "fork", year: left.year, left, right };
  });

  const genuineRumorId = seededShuffle(GENUINE_FORK_CANDIDATES, rng)[0];
  const genuineRumor = byId(genuineRumorId);
  usedMemoryIds.add(genuineRumor.id); // it's in MEMORY_CARDS (kind "rumor"), reserve it
  const genuinePartner = nearestPartner(genuineRumor.year);
  const genuineFork: BoardNode = (() => {
    const [left, right] = genuineRumor.year <= genuinePartner.year ? [genuineRumor, genuinePartner] : [genuinePartner, genuineRumor];
    return { kind: "fork", year: left.year, left, right };
  })();

  const soloTraps: BoardNode[] = traps.slice(2, 4).map((trap) => ({ kind: "single", year: trap.year, card: trap }));

  const leftoverSingles = remainingMemory.filter((c) => !usedMemoryIds.has(c.id));
  const soloCount = Math.max(0, 10 - (trapForks.length + 1) - soloTraps.length);
  const fillerSingles: BoardNode[] = seededShuffle(leftoverSingles, rng)
    .slice(0, soloCount)
    .map((card) => ({ kind: "single", year: card.year, card }));

  const stageB: BoardNode[] = [...trapForks, genuineFork, ...soloTraps, ...fillerSingles].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.kind === "single" ? -1 : b.kind === "single" ? 1 : 0;
  });

  // C. Merge backbone + stageB, strictly non-decreasing by year.
  let merged = [...backbone, ...stageB];

  // D. Insert 3 events into the 3 largest year-gaps (earlier gap wins ties).
  const events = seededShuffle(EVENTS, rng).slice(0, 3);
  const gaps = merged.slice(0, -1).map((node, i) => ({ i, size: merged[i + 1].year - node.year }));
  gaps.sort((a, b) => b.size - a.size || a.i - b.i);
  const insertAt = gaps.slice(0, 3).map((g) => g.i).sort((a, b) => b - a); // descending so inserts don't shift earlier indices
  events.forEach((event, k) => {
    const i = insertAt[k];
    const approxYear = Math.round((merged[i].year + merged[i + 1].year) / 2);
    merged.splice(i + 1, 0, { kind: "event", year: approxYear, approx: true, event });
  });

  merged = merged.slice(0, TOTAL_NODES);
  while (merged.length < TOTAL_NODES) {
    const extra = fillerSingles[merged.length % Math.max(1, fillerSingles.length)];
    if (extra) merged.push(extra);
    else break;
  }

  return merged;
}
