import type { Locale } from "./i18n";
import { t } from "./i18n";
import type { Milestone } from "./types";

/** Lowercase, strip diacritics (incl. Vietnamese đ) so "hoa phat" finds "Hòa Phát". */
export function foldText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

/** Also drop spaces/punctuation so "vnindex", "vn-index" and "vn index" are the same term. */
const compact = (s: string) => s.replace(/[^a-z0-9]/g, "");

export interface SearchOptions {
  /** Rank this country's milestones first among equal scores (e.g. "vn" for Vietnamese readers). */
  preferCountry?: string;
}

/** Site-wide free-text search across every milestone in every country. */
export function searchMilestones(milestones: Milestone[], lang: Locale, query: string, opts: SearchOptions = {}): Milestone[] {
  const q = foldText(query.trim());
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const compactQuery = compact(q);

  const haystackOf = (m: Milestone) =>
    foldText(
      [
        t(m.title, lang),
        t(m.summary, lang),
        t(m.description, lang),
        t(m.opportunity.asset, lang),
        t(m.opportunity.action, lang),
        m.insiderTip ? t(m.insiderTip, lang) : "",
        m.pitfalls ? t(m.pitfalls, lang) : "",
        m.date,
      ].join(" "),
    );

  return milestones
    .map((m) => {
      const hay = haystackOf(m);
      const compactHay = compact(hay);
      const termHit = (term: string) => hay.includes(term) || (compact(term).length > 0 && compactHay.includes(compact(term)));
      // Every term must match; a multi-word query may also match as one run ("vn index" -> "vnindex").
      const matched = terms.every(termHit) || (terms.length > 1 && compactQuery.length > 2 && compactHay.includes(compactQuery));
      if (!matched) return null;
      // Rank title matches above body matches.
      const titleHay = foldText(t(m.title, lang));
      const compactTitle = compact(titleHay);
      let score = terms.reduce((acc, term) => acc + (titleHay.includes(term) || compactTitle.includes(compact(term)) ? 2 : 1), 0);
      // Whole-phrase hits ("hoa phat" as written) beat scattered word hits once accents are folded.
      if (terms.length > 1) {
        if (titleHay.includes(q) || compactTitle.includes(compactQuery)) score += 6;
        else if (hay.includes(q)) score += 3;
      }
      return { m, score, preferred: opts.preferCountry != null && m.country === opts.preferCountry };
    })
    .filter((x): x is { m: Milestone; score: number; preferred: boolean } => x !== null)
    .sort((a, b) => b.score - a.score || Number(b.preferred) - Number(a.preferred) || a.m.date.localeCompare(b.m.date))
    .map((x) => x.m);
}
