import { mulberry32, seededShuffle } from "./rng";
import { MEMORY_CARDS, TRAP_CARDS, EVENTS } from "./deckData";
import type { Turn } from "./types";
import { TOTAL_TURNS } from "./types";

const SINGLES = 13;
const FORKS = 4;
const TURN_EVENTS = 3;

/** Deterministic 20-turn deck for a given seed. Same seed -> identical deck, forever. */
export function buildDeck(seed: number): Turn[] {
  const rng = mulberry32(seed ^ 0x9e3779b9);

  const memoryPool = seededShuffle(MEMORY_CARDS, rng);
  const trapPool = seededShuffle(TRAP_CARDS, rng);
  const eventPool = seededShuffle(EVENTS, rng);

  const usedForForks = memoryPool.slice(0, FORKS);
  const singles = memoryPool.slice(FORKS, FORKS + SINGLES);
  const traps = trapPool.slice(0, FORKS);
  const pickedEvents = eventPool.slice(0, TURN_EVENTS);

  const forkTurns: Turn[] = traps.map((trap, i) => {
    const partner = usedForForks[i];
    // Keep the chronologically earlier card on the left.
    const [left, right] = trap.year <= partner.year ? [trap, partner] : [partner, trap];
    return { kind: "fork", left, right } as Turn;
  });

  const singleTurns: Turn[] = singles
    .slice()
    .sort((a, b) => a.year - b.year)
    .map((card) => ({ kind: "single", card }) as Turn);

  const eventTurns: Turn[] = pickedEvents.map((event) => ({ kind: "event", event }) as Turn);

  // Interleave: singles carry the chronological backbone; forks and events are
  // dropped in at evenly spaced slots so the deck still reads start-to-finish
  // in roughly increasing years.
  const combined: Turn[] = [...singleTurns].sort((a, b) => {
    const ay = a.kind === "single" ? a.card.year : 0;
    const by = b.kind === "single" ? b.card.year : 0;
    return ay - by;
  });

  const extras = seededShuffle([...forkTurns, ...eventTurns], rng);
  const result: Turn[] = [];
  const gap = combined.length / (extras.length + 1);
  let extraIdx = 0;
  let nextInsertAt = gap;
  for (let i = 0; i < combined.length; i++) {
    result.push(combined[i]);
    while (extraIdx < extras.length && i + 1 >= nextInsertAt) {
      result.push(extras[extraIdx]);
      extraIdx++;
      nextInsertAt += gap;
    }
  }
  while (extraIdx < extras.length) {
    result.push(extras[extraIdx]);
    extraIdx++;
  }

  return result.slice(0, TOTAL_TURNS);
}
