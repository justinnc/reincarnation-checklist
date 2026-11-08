export interface VnPriceData {
  country: string;
  dataVersion: string;
  years: number[];
  cpiIndex: Record<string, number>;   // price level, base 2025 = 100
  fxPerUsd: Record<string, number>;   // VND per 1 USD
  riskFree: Record<string, number>;   // not used directly by the calculator (see `returns`)
  returns: Record<string, Record<string, number>>; // asset -> year -> annual return (decimal)
  closes: Record<string, Record<string, number>>;  // asset -> year -> year-end price level
  dataQuality: Record<string, "official" | "secondary" | "proxy" | "estimate">;
}

export type AssetId = "cash" | "vn_savings" | "vn_usd" | "vn_gold" | "vn_index" | "btc";

export interface WhatIfResult {
  asset: AssetId;
  startYear: number;
  endYear: number;
  amount: number;
  finalValue: number;
  multiple: number;
  caveat?: string;
}
