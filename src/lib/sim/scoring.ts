import { getAsset, vnAssets, vnPrices } from "./data";
import { toNominal, toReal } from "./engine";
import type { GameConfig, Rank } from "./types";
import { RANKS } from "./types";

/** Baseline: all capital sits in savings every year (the "Phàm nhân" floor). */
export function baselineFinalReal(config: GameConfig, endYear: number): number {
  let nominal = toNominal(config.capitalReal, config.startYear);
  for (let y = config.startYear; y < endYear; y++) {
    const r = vnPrices.returns.vn_savings?.[y] ?? 0.05;
    nominal *= 1 + r;
  }
  return toReal(nominal, endYear);
}

/**
 * Optimal: greedy "all-in on the best available asset" per year under the same
 * availability constraints (a simple upper-bound proxy for the true DP optimum).
 */
export function optimalFinalReal(config: GameConfig, endYear: number): number {
  let nominal = toNominal(config.capitalReal, config.startYear);
  for (let y = config.startYear; y < endYear; y++) {
    const options = vnAssets.filter((a) => a.availableFrom <= y);
    let best = 0;
    for (const a of options) {
      const r = vnPrices.returns[a.id]?.[y];
      if (r != null) best = Math.max(best, r);
    }
    nominal *= 1 + Math.max(best, vnPrices.returns.vn_savings?.[y] ?? 0.05);
  }
  return toReal(nominal, endYear);
}

/** 0-100 "Rebirth Score": log-scaled position between baseline and optimal. */
export function rebirthScore(finalReal: number, baseline: number, optimal: number): number {
  if (optimal <= baseline) return 50;
  const clampedFinal = Math.max(finalReal, 1);
  const score = (100 * (Math.log(clampedFinal) - Math.log(baseline))) / (Math.log(optimal) - Math.log(baseline));
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function rankForScore(score: number): Rank {
  const idx = Math.min(RANKS.length - 1, Math.floor(score / (100 / RANKS.length)));
  return RANKS[idx];
}

export { getAsset };
