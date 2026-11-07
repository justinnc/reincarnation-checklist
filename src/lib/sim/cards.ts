import type { Category, Milestone } from "../types";
import type { OpportunityCard } from "./types";

const ALLOWED_CATEGORIES: Category[] = ["stocks", "crypto", "business", "commodities", "macro"];

/** Build opportunity cards from Vietnam milestones that have a numeric, verifiable payoff. */
export function cardsFromMilestones(milestones: Milestone[]): OpportunityCard[] {
  return milestones
    .filter((m) => m.country === "vn" && m.verified && m.opportunity.returnMultiple && m.opportunity.returnMultiple > 1)
    .filter((m) => ALLOWED_CATEGORIES.includes(m.category))
    .map((m) => ({
      id: m.id,
      year: Number(m.date.slice(0, 4)),
      // A modest, playable stake — real milestones often imply far larger sums.
      costReal: m.opportunity.capital === "high" ? 30_000_000 : m.opportunity.capital === "low" ? 3_000_000 : 10_000_000,
      lockYears: Math.max(1, Math.min(8, Math.round(Math.log2(m.opportunity.returnMultiple!)))),
      payoffMultiple: m.opportunity.returnMultiple!,
      risk: m.opportunity.risk ?? "medium",
      titleKey: m.title,
      milestoneHref: `/vn/${m.id}`,
    }));
}

export function cardsForYear(cards: OpportunityCard[], year: number, count: number, pick: (n: number) => number): OpportunityCard[] {
  const available = cards.filter((c) => c.year <= year + 1 && c.year >= year - 2);
  const pool = [...available];
  const chosen: OpportunityCard[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(pick(i) * pool.length);
    chosen.push(pool.splice(idx, 1)[0]);
  }
  return chosen;
}
