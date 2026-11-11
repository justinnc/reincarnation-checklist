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

/** Optional editorial record; legacy `verified` only describes listed links. */
export type ClaimReview =
  | { status: "pending" }
  | { status: "agent-checked"; claim: LocalizedText; proposedBy: string; checkedBy: string; evidence: { url: string; excerpt: string; observedOn: string }[] };

export interface PriceObservation {
  date: string;
  basis: "open" | "close" | "intraday" | "average" | "estimate" | "other";
  currency: string;
  /** Identical unit on both sides, e.g. "share" or "5kg bag". */
  unit: string;
  sourceUrl: string;
}

interface OpportunityBase {
  asset?: LocalizedText;
  action: LocalizedText;
  buyWhen: LocalizedText;
  sellWhen?: LocalizedText;
  estimatedReturn: LocalizedText;
  priceCurrency?: string;
  exitDate?: string;
  risk?: Level;
  capital?: Level;
}

/** Historical comparisons cannot carry executable prices or scenario returns. */
export type Opportunity = OpportunityBase & (
  | { historicalOnly: true; returnMultiple?: never; entryPrice?: never; exitPrice?: never; priceObservations?: never }
  | {
      historicalOnly?: false;
      returnMultiple?: number;
      entryPrice?: number;
      exitPrice?: number;
      /** Opt-in comparable evidence; legacy pairs have no assumed unit/basis. */
      priceObservations?: { entry: PriceObservation; exit: PriceObservation };
    }
);

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
  claimReview?: ClaimReview;
  /** Deal was not buyable by a retail investor (VC/private stake, insider deal, hedge-fund trade). Excluded from "Realistic" playbooks. */
  private?: boolean;
}

/** The slice of a milestone the client-side explorers (homepage, world, playbook) need. */
export type MilestoneLite = Pick<Milestone, "id" | "country" | "date" | "title" | "verified" | "private"> & {
  /** Filled by toMilestoneLite; optional for older callers passing a full Milestone. */
  sourceCount?: number;
  opportunity: Pick<Opportunity, "historicalOnly" | "returnMultiple" | "exitDate" | "capital" | "asset">;
};

export interface Country {
  code: string;
  name: LocalizedText;
  flag: string;
  /** Hypothetical stake for the "what if" calculator */
  stake: { amount: number; currency: string };
}
