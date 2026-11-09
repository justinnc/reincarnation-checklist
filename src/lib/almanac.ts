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
