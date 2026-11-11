import type { Milestone, MilestoneLite } from "./types";
import { allCountries } from "./countries";
import us from "@/data/milestones/us.json";
import vn from "@/data/milestones/vn.json";
import cn from "@/data/milestones/cn.json";
import jp from "@/data/milestones/jp.json";
import de from "@/data/milestones/de.json";
import inData from "@/data/milestones/in.json";
import gb from "@/data/milestones/gb.json";
import fr from "@/data/milestones/fr.json";
import it from "@/data/milestones/it.json";
import ca from "@/data/milestones/ca.json";
import br from "@/data/milestones/br.json";
import kr from "@/data/milestones/kr.json";
import sg from "@/data/milestones/sg.json";
import th from "@/data/milestones/th.json";
import au from "@/data/milestones/au.json";

const raw = [vn, us, cn, jp, de, inData, gb, fr, it, ca, br, kr, au, sg, th] as unknown as Milestone[][];

/** Defensive display boundary; the validator separately rejects malformed source records. */
export function sanitizeHistoricalMilestone(m: Milestone): Milestone {
  if (!m.opportunity.historicalOnly) return m;
  return {
    ...m,
    opportunity: { ...m.opportunity, historicalOnly: true, returnMultiple: undefined, entryPrice: undefined, exitPrice: undefined },
  };
}

export const allMilestones: Milestone[] = raw.flat().map(sanitizeHistoricalMilestone).sort((a, b) => a.date.localeCompare(b.date));

/** Only countries that have data are shown. */
export const countries = allCountries.filter((c) => allMilestones.some((m) => m.country === c.code));

export const getCountry = (code: string) => countries.find((c) => c.code === code);

export const getMilestones = (country: string): Milestone[] =>
  allMilestones.filter((m) => m.country === country);

export const getMilestone = (country: string, id: string) =>
  allMilestones.find((m) => m.country === country && m.id === id);

export const yearOf = (m: Milestone) => Number(m.date.slice(0, 4));

/** Strip a milestone down to what client-side explorers need, so pages don't ship 2 MB of prose in the RSC payload. */
export const toMilestoneLite = (m: Milestone): MilestoneLite => ({
  id: m.id,
  country: m.country,
  date: m.date,
  title: m.title,
  verified: m.verified,
  private: m.private,
  sourceCount: m.sources.length,
  opportunity: {
    historicalOnly: m.opportunity.historicalOnly,
    returnMultiple: m.opportunity.historicalOnly ? undefined : m.opportunity.returnMultiple,
    exitDate: m.opportunity.exitDate,
    capital: m.opportunity.capital,
    asset: m.opportunity.asset,
  },
});

export const allMilestonesLite: MilestoneLite[] = allMilestones.map(toMilestoneLite);

/** Illustrative listed multiples, not a claim-quality or independent-review ranking. */
export function rankListedReturns(milestones: Milestone[], limit = 10): Milestone[] {
  return milestones
    .filter((m) => !m.opportunity.historicalOnly && (m.opportunity.returnMultiple ?? 0) > 1 && m.sources.length >= 2)
    .sort((a, b) => b.opportunity.returnMultiple! - a.opportunity.returnMultiple!)
    .slice(0, limit);
}

export function countryStats(country: string) {
  const list = getMilestones(country);
  const years = list.map(yearOf);
  const best = list.filter((m) => !m.opportunity.historicalOnly && (m.opportunity.returnMultiple ?? 0) > 1).sort((a, b) => (b.opportunity.returnMultiple ?? 0) - (a.opportunity.returnMultiple ?? 0))[0];
  return {
    count: list.length,
    from: Math.min(...years),
    to: Math.max(...years),
    verified: list.filter((m) => m.verified).length,
    sourceLinked: list.filter((m) => m.sources.length >= 2).length,
    best,
  };
}
