import type { Country, Milestone } from "./types";
import us from "@/data/milestones/us.json";
import vn from "@/data/milestones/vn.json";

export const countries: Country[] = [
  { code: "vn", name: { vi: "Việt Nam", en: "Vietnam" }, flag: "🇻🇳" },
  { code: "us", name: { vi: "Mỹ", en: "United States" }, flag: "🇺🇸" },
];

const all: Milestone[] = [...(us as Milestone[]), ...(vn as Milestone[])];

export const getCountry = (code: string) => countries.find((c) => c.code === code);

export const getMilestones = (country: string): Milestone[] =>
  all.filter((m) => m.country === country).sort((a, b) => a.date.localeCompare(b.date));

export const countMilestones = (country: string) => getMilestones(country).length;

