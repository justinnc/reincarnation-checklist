import type { LocalizedText } from "./i18n";

export type AlmanacQuality = "A" | "B" | "C";

export interface AlmanacPoint {
  year?: number;
  date?: string;
  value?: number;
  min?: number;
  max?: number;
  note?: string;
}

export interface AlmanacItem {
  id: string;
  country: string;
  name: LocalizedText;
  unit: LocalizedText;
  quality: AlmanacQuality;
  note: LocalizedText;
  kind: "point" | "range" | "event";
  /** ISO currency of the price once multiplied by valueMultiplier. */
  currency?: string;
  /** value * valueMultiplier = local-currency price of ONE unit (e.g. 1e6 for "million VND"). */
  valueMultiplier?: number;
  /** false = rate/index that can't be "bought" with the stake. Defaults to true. */
  purchasable?: boolean;
  series: AlmanacPoint[];
  sources: { title: string; url: string }[];
}

export const pointYear = (p: AlmanacPoint) => p.year ?? Number((p.date ?? "0").slice(0, 4));
export const pointValue = (p: AlmanacPoint) => p.value ?? (p.min != null && p.max != null ? (p.min + p.max) / 2 : undefined);

/** Interpolate between observations only; never present an out-of-range price as a quote for another year. */
export function interpolateAlmanacValue(series: AlmanacPoint[], targetYear: number): { value: number; exact: boolean } | null {
  const valid = series
    .map((p) => ({ year: pointYear(p), val: pointValue(p) }))
    .filter((x): x is { year: number; val: number } => Number.isFinite(x.year) && x.year > 0 && x.val !== undefined && x.val > 0)
    .sort((a, b) => a.year - b.year);
  if (valid.length === 0 || targetYear < valid[0].year || targetYear > valid[valid.length - 1].year) return null;
  for (let i = 0; i < valid.length; i++) {
    const a = valid[i];
    if (targetYear === a.year) return { value: a.val, exact: true };
    const b = valid[i + 1];
    if (b && targetYear < b.year) {
      const ratio = (targetYear - a.year) / (b.year - a.year);
      const logVal = Math.log(a.val) + ratio * (Math.log(b.val) - Math.log(a.val));
      return { value: Math.round(Math.exp(logVal)), exact: false };
    }
  }
  return null;
}
