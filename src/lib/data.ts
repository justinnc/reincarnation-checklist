import type { Country, Milestone } from "./types";
import us from "@/data/milestones/us.json";
import vn from "@/data/milestones/vn.json";

export const countries: Country[] = [
  { code: "vn", name: { vi: "Việt Nam", en: "Vietnam" }, flag: "🇻🇳", stake: { amount: 10_000_000, currency: "VND" } },
  { code: "us", name: { vi: "Mỹ", en: "United States" }, flag: "🇺🇸", stake: { amount: 1_000, currency: "USD" } },
];

export const allMilestones: Milestone[] = [...(us as Milestone[]), ...(vn as Milestone[])].sort((a, b) =>
  a.date.localeCompare(b.date),
);

export const getCountry = (code: string) => countries.find((c) => c.code === code);

export const getMilestones = (country: string): Milestone[] =>
  allMilestones.filter((m) => m.country === country);

export const getMilestone = (country: string, id: string) =>
  allMilestones.find((m) => m.country === country && m.id === id);

export const yearOf = (m: Milestone) => Number(m.date.slice(0, 4));

export function countryStats(country: string) {
  const list = getMilestones(country);
  const years = list.map(yearOf);
  const best = [...list].sort((a, b) => (b.opportunity.returnMultiple ?? 0) - (a.opportunity.returnMultiple ?? 0))[0];
  return {
    count: list.length,
    from: Math.min(...years),
    to: Math.max(...years),
    verified: list.filter((m) => m.verified).length,
    best,
  };
}
