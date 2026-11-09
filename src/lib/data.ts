import type { Country, Milestone } from "./types";
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

export const allMilestones: Milestone[] = raw.flat().sort((a, b) => a.date.localeCompare(b.date));

/** Ordered: Vietnam first, then the world's 10 largest economies by nominal GDP (IMF). */
const allCountries: Country[] = [
  { code: "vn", name: { vi: "Việt Nam", en: "Vietnam" }, flag: "🇻🇳", stake: { amount: 10_000_000, currency: "VND" } },
  { code: "us", name: { vi: "Mỹ", en: "United States" }, flag: "🇺🇸", stake: { amount: 1_000, currency: "USD" } },
  { code: "cn", name: { vi: "Trung Quốc", en: "China" }, flag: "🇨🇳", stake: { amount: 10_000, currency: "CNY" } },
  { code: "de", name: { vi: "Đức", en: "Germany" }, flag: "🇩🇪", stake: { amount: 1_000, currency: "EUR" } },
  { code: "jp", name: { vi: "Nhật Bản", en: "Japan" }, flag: "🇯🇵", stake: { amount: 100_000, currency: "JPY" } },
  { code: "in", name: { vi: "Ấn Độ", en: "India" }, flag: "🇮🇳", stake: { amount: 100_000, currency: "INR" } },
  { code: "gb", name: { vi: "Anh", en: "United Kingdom" }, flag: "🇬🇧", stake: { amount: 1_000, currency: "GBP" } },
  { code: "fr", name: { vi: "Pháp", en: "France" }, flag: "🇫🇷", stake: { amount: 1_000, currency: "EUR" } },
  { code: "it", name: { vi: "Ý", en: "Italy" }, flag: "🇮🇹", stake: { amount: 1_000, currency: "EUR" } },
  { code: "ca", name: { vi: "Canada", en: "Canada" }, flag: "🇨🇦", stake: { amount: 1_000, currency: "CAD" } },
  { code: "br", name: { vi: "Brazil", en: "Brazil" }, flag: "🇧🇷", stake: { amount: 5_000, currency: "BRL" } },
  { code: "kr", name: { vi: "Hàn Quốc", en: "South Korea" }, flag: "🇰🇷", stake: { amount: 1_000_000, currency: "KRW" } },
  { code: "au", name: { vi: "Úc", en: "Australia" }, flag: "🇦🇺", stake: { amount: 1_000, currency: "AUD" } },
  { code: "sg", name: { vi: "Singapore", en: "Singapore" }, flag: "🇸🇬", stake: { amount: 1_000, currency: "SGD" } },
  { code: "th", name: { vi: "Thái Lan", en: "Thailand" }, flag: "🇹🇭", stake: { amount: 30_000, currency: "THB" } },
];

/** Only countries that have data are shown. */
export const countries: Country[] = allCountries.filter((c) => allMilestones.some((m) => m.country === c.code));

export const getCountry = (code: string) => countries.find((c) => c.code === code);

export const getMilestones = (country: string): Milestone[] =>
  allMilestones.filter((m) => m.country === country);

export const getMilestone = (country: string, id: string) =>
  allMilestones.find((m) => m.country === country && m.id === id);

export const yearOf = (m: Milestone) => Number(m.date.slice(0, 4));

export function countryStats(country: string) {
  const list = getMilestones(country);
  const years = list.map(yearOf);
  const best = list.filter((m) => (m.opportunity.returnMultiple ?? 0) > 1).sort((a, b) => (b.opportunity.returnMultiple ?? 0) - (a.opportunity.returnMultiple ?? 0))[0];
  return {
    count: list.length,
    from: Math.min(...years),
    to: Math.max(...years),
    verified: list.filter((m) => m.verified).length,
    best,
  };
}
