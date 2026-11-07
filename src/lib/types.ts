import type { LocalizedText } from "./i18n";

export const categories = [
  "stocks",
  "crypto",
  "real-estate",
  "technology",
  "business",
  "macro",
  "commodities",
] as const;
export type Category = (typeof categories)[number];

export interface Source {
  title: string;
  url: string;
}

export interface Opportunity {
  /** What to do: buy what, invest in what, start which business */
  action: LocalizedText;
  /** When to enter */
  buyWhen: LocalizedText;
  /** When to exit (optional) */
  sellWhen?: LocalizedText;
  /** Human-readable estimated return, e.g. ">1,000x" */
  estimatedReturn: LocalizedText;
  /** Rough return multiple used for sorting (e.g. 1000 = 1,000x). Optional. */
  returnMultiple?: number;
}

export interface Milestone {
  id: string;
  country: string; // ISO 3166-1 alpha-2, lowercase: "us", "vn"
  /** ISO date: YYYY, YYYY-MM or YYYY-MM-DD */
  date: string;
  category: Category;
  title: LocalizedText;
  description: LocalizedText;
  opportunity: Opportunity;
  sources: Source[];
  /** false = draft data, needs fact-checking */
  verified: boolean;
  tags?: string[];
}

export interface Country {
  code: string;
  name: LocalizedText;
  flag: string;
}

