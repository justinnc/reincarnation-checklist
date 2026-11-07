import type { LocalizedText } from "./i18n";
import vn from "@/data/almanac/vn.json";

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
  series: AlmanacPoint[];
  sources: { title: string; url: string }[];
}

const all = vn as AlmanacItem[];

export const getAlmanacItems = (country: string) => all.filter((i) => i.country === country);
export const getAlmanacItem = (id: string) => all.find((i) => i.id === id);
export const almanacCountries = [...new Set(all.map((i) => i.country))];

export const pointYear = (p: AlmanacPoint) => p.year ?? Number((p.date ?? "0").slice(0, 4));
export const pointValue = (p: AlmanacPoint) => p.value ?? (p.min != null && p.max != null ? (p.min + p.max) / 2 : undefined);
