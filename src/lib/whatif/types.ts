export type Scope = "local" | "universal";

export interface LocalCountryData {
  country: string;
  dataVersion: string;
  years: number[];
  cpiIndex: Record<string, number>;
  fxPerUsd?: Record<string, number>;
  riskFree?: Record<string, number>;
  returns: Record<string, Record<string, number>>;
  closes: Record<string, Record<string, number>>;
  dataQuality: Record<string, "official" | "secondary" | "proxy" | "estimate">;
}

export interface UniversalData {
  dataVersion: string;
  closes: Record<string, Record<string, number>>;
  dataQuality: Record<string, "official" | "secondary" | "proxy" | "estimate">;
}

export interface AssetDef {
  id: string;
  scope: Scope;
  countryCode?: string;
  /** Display + input currency for this asset. Local assets use the country's own
   * currency; universal (cross-border) assets are always priced in USD. */
  currency: string;
  icon: string;
  label: { vi: string; en: string };
  minYear: number;
  caveat?: { vi: string; en: string };
  /** Only show the caveat when the chosen start year is at or before this year. */
  caveatUntilYear?: number;
}

export interface WhatIfResult {
  asset: string;
  startYear: number;
  endYear: number;
  amount: number;
  finalValue: number;
  multiple: number;
  currency: string;
  caveat?: string;
}
