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
export type Level = "low" | "medium" | "high";

export interface Source {
  title: string;
  url: string;
}

export interface Opportunity {
  asset?: LocalizedText;
  action: LocalizedText;
  buyWhen: LocalizedText;
  sellWhen?: LocalizedText;
  estimatedReturn: LocalizedText;
  returnMultiple?: number;
  entryPrice?: number;
  exitPrice?: number;
  priceCurrency?: string;
  exitDate?: string;
  risk?: Level;
  capital?: Level;
}

export interface Quiz {
  question: LocalizedText;
  choices: LocalizedText[];
  answer: number;
  explanation?: LocalizedText;
}

export interface Milestone {
  id: string;
  country: string;
  /** YYYY, YYYY-MM or YYYY-MM-DD */
  date: string;
  category: Category;
  title: LocalizedText;
  summary?: LocalizedText;
  description: LocalizedText;
  opportunity: Opportunity;
  insiderTip?: LocalizedText;
  pitfalls?: LocalizedText;
  quiz?: Quiz;
  sources: Source[];
  verified: boolean;
  verifiedNote?: string;
}

export interface Country {
  code: string;
  name: LocalizedText;
  flag: string;
  /** Hypothetical stake for the "what if" calculator */
  stake: { amount: number; currency: string };
}
