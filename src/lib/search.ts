import type { Locale } from "./i18n";
import { t } from "./i18n";
import type { Milestone } from "./types";

/** Site-wide free-text search across every milestone in every country. */
export function searchMilestones(milestones: Milestone[], lang: Locale, query: string): Milestone[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  const haystackOf = (m: Milestone) =>
    [
      t(m.title, lang),
      t(m.summary, lang),
      t(m.description, lang),
      t(m.opportunity.asset, lang),
      t(m.opportunity.action, lang),
      m.insiderTip ? t(m.insiderTip, lang) : "",
      m.pitfalls ? t(m.pitfalls, lang) : "",
      m.date,
    ]
      .join(" ")
      .toLowerCase();

  return milestones
    .map((m) => {
      const hay = haystackOf(m);
      if (!terms.every((term) => hay.includes(term))) return null;
      // Rank title matches above body matches.
      const titleHay = t(m.title, lang).toLowerCase();
      const score = terms.reduce((acc, term) => acc + (titleHay.includes(term) ? 2 : 1), 0);
      return { m, score };
    })
    .filter((x): x is { m: Milestone; score: number } => x !== null)
    .sort((a, b) => b.score - a.score || a.m.date.localeCompare(b.m.date))
    .map((x) => x.m);
}
