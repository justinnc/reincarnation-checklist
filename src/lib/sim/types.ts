import type { LocalizedText } from "../i18n";

export type CountryCode = "vn";
export type AssetId = "vn_cash" | "vn_savings" | "vn_usd" | "vn_gold" | "vn_index" | "btc";
export type Level = "low" | "medium" | "high";
export type Difficulty = "easy" | "normal" | "hard";
export type DataQuality = "official" | "secondary" | "proxy" | "estimate";

export interface Asset {
  id: AssetId;
  name: LocalizedText;
  currency: "VND" | "USD";
  availableFrom: number;
  requiresFlag?: string;
  feeBuy: number;
  feeSell: number;
  taxOnSell?: number;
  lockYears?: number;
  dataQuality: DataQuality;
}

export interface YearlyPrices {
  country: CountryCode;
  dataVersion: string;
  years: number[];
  cpiIndex: Record<number, number>;
  fxPerUsd: Record<number, number>;
  riskFree: Record<number, number>;
  returns: Partial<Record<AssetId, Record<number, number>>>;
  closes: Partial<Record<AssetId, Record<number, number>>>;
  provenance: { seriesId: string; url: string; fetchedAt: string; license?: string; note?: string }[];
  dataQuality: Partial<Record<AssetId, DataQuality>>;
}

export type Action =
  | { t: "buy"; asset: AssetId; amount: number }
  | { t: "sell"; asset: AssetId; amount: number }
  | { t: "setSavingRate"; pct: number }
  | { t: "takeCard"; cardId: string }
  | { t: "skipCard"; cardId: string }
  | { t: "endYear" };

export interface GameEvent {
  id: string;
  kind: "life" | "market" | "karma";
  title: LocalizedText;
  text: LocalizedText;
  when: { minYear?: number; maxYear?: number; minAge?: number; maxAge?: number; minHeat?: number };
  weight: number;
  effect:
    | { type: "cashDelta"; pctOfNetWorth?: number; fixedReal?: number }
    | { type: "assetLoss"; asset: AssetId; pct: number }
    | { type: "heatDelta"; delta: number };
}

export interface OpportunityCard {
  id: string;
  year: number;
  costReal: number;
  lockYears: number;
  payoffMultiple: number;
  risk: Level;
  titleKey: LocalizedText;
  milestoneHref: string;
}

export interface Holding {
  asset: AssetId;
  units: number;
  boughtYear: number;
  costBasisNominal: number;
}

export interface ActiveCard {
  card: OpportunityCard;
  maturesYear: number;
  investedNominal: number;
}

export interface GameConfig {
  country: CountryCode;
  startYear: number;
  startAge: number;
  capitalReal: number;
  difficulty: Difficulty;
  daily?: string;
}

export interface LogLine {
  year: number;
  lines: { vi: string; en: string }[];
}

export interface GameState {
  v: 1;
  seed: number;
  rngState: number;
  config: GameConfig;
  year: number;
  age: number;
  cashNominal: number;
  savingRatePct: number;
  holdings: Holding[];
  pendingCards: OpportunityCard[];
  activeCards: ActiveCard[];
  flags: Record<string, number>;
  heat: number;
  log: LogLine[];
  history: { year: number; netWorthNominal: number; netWorthReal: number }[];
  finished: boolean;
}

export const RANKS = ["pham_nhan", "tieu_thuong", "trung_luu", "dai_gia", "tai_phiet", "thien_menh"] as const;
export type Rank = (typeof RANKS)[number];
