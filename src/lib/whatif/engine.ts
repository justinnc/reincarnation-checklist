import vnData from "@/data/whatif/vn.json";
import usData from "@/data/whatif/us.json";
import universalData from "@/data/whatif/universal.json";
import type { AssetDef, LocalCountryData, UniversalData, WhatIfResult } from "./types";

const LOCAL: Record<string, LocalCountryData> = {
  vn: vnData as unknown as LocalCountryData,
  us: usData as unknown as LocalCountryData,
};
const UNIVERSAL = universalData as unknown as UniversalData;

export const LATEST_YEAR = Math.max(
  ...Object.values(LOCAL).flatMap((d) => d.years),
  ...Object.values(UNIVERSAL.closes).flatMap((c) => Object.keys(c).map(Number)),
);

/** Countries that have their own local-market dataset beyond the universal cross-border assets. */
export const COUNTRIES_WITH_LOCAL_DATA = Object.keys(LOCAL);

function num(rec: Record<string, number> | undefined, year: number): number | undefined {
  return rec ? rec[String(year)] : undefined;
}

function seriesYearRange(rec: Record<string, number>): [number, number] {
  const yrs = Object.keys(rec).map(Number);
  return [Math.min(...yrs), Math.max(...yrs)];
}

const UNIVERSAL_ASSETS: AssetDef[] = [
  {
    id: "gold_usd_oz",
    scope: "universal",
    currency: "USD",
    icon: "🪙",
    label: { vi: "Vàng thế giới (USD/oz)", en: "World gold (USD/oz)" },
    minYear: seriesYearRange(UNIVERSAL.closes.gold_usd_oz)[0],
  },
  {
    id: "btc_usd",
    scope: "universal",
    currency: "USD",
    icon: "₿",
    label: { vi: "Bitcoin", en: "Bitcoin" },
    minYear: seriesYearRange(UNIVERSAL.closes.btc_usd)[0],
    caveat: {
      vi: "Giá năm 2010-2011 từ giai đoạn thị trường còn rất mỏng, độ tin cậy thấp hơn các năm sau.",
      en: "2010-2011 prices come from a very thin early market and are less reliable than later years.",
    },
  },
  {
    id: "sp500_usd",
    scope: "universal",
    currency: "USD",
    icon: "📊",
    label: { vi: "Cổ phiếu Mỹ (S&P 500)", en: "US stocks (S&P 500)" },
    minYear: seriesYearRange(UNIVERSAL.closes.sp500_usd)[0],
    caveat: {
      vi: "Chỉ tính mức điểm, không cộng cổ tức tái đầu tư — lợi nhuận thật của người giữ cổ phiếu dài hạn sẽ cao hơn số này.",
      en: "Price index only, dividends not reinvested — real long-term holder returns would be higher than this.",
    },
  },
];

function localAssetsFor(countryCode: string): AssetDef[] {
  if (countryCode === "vn") {
    return [
      { id: "vn_cash", scope: "local", countryCode: "vn", currency: "VND", icon: "💵", label: { vi: "Giữ tiền mặt (không làm gì)", en: "Hold cash (do nothing)" }, minYear: 1980 },
      {
        id: "vn_savings", scope: "local", countryCode: "vn", currency: "VND", icon: "🏦",
        label: { vi: "Gửi tiết kiệm VND", en: "VND savings deposit" }, minYear: 1993,
        caveat: { vi: "Thiếu lãi suất chính thức một số năm; những năm đó tạm tính lãi 0%.", en: "Some years have no official rate on record; those years are treated as 0%." },
      },
      { id: "vn_hold_usd", scope: "local", countryCode: "vn", currency: "VND", icon: "💴", label: { vi: "Giữ đô la Mỹ", en: "Hold US dollars" }, minYear: 1986 },
      {
        id: "vn_gold", scope: "local", countryCode: "vn", currency: "VND", icon: "🪙", label: { vi: "Vàng SJC (trong nước)", en: "SJC gold (domestic)" }, minYear: 2000,
        caveat: { vi: "Giá trước 2000 bị lệch nặng do dùng tỷ giá chính thức thời bao cấp nên máy tính chỉ cho chọn từ năm 2000.", en: "Pre-2000 prices are badly distorted by the era's official exchange rate, so only 2000+ is selectable." },
      },
      { id: "vn_index", scope: "local", countryCode: "vn", currency: "VND", icon: "📈", label: { vi: "Cổ phiếu Việt Nam (VN-Index)", en: "Vietnam stocks (VN-Index)" }, minYear: 2000 },
    ];
  }
  if (countryCode === "us") {
    return [
      { id: "us_cash", scope: "local", countryCode: "us", currency: "USD", icon: "💵", label: { vi: "Giữ tiền mặt (không làm gì)", en: "Hold cash (do nothing)" }, minYear: 1980 },
      { id: "us_savings", scope: "local", countryCode: "us", currency: "USD", icon: "🏦", label: { vi: "Gửi tiết kiệm USD (tín phiếu kho bạc 1 năm)", en: "USD savings (1-year T-bill)" }, minYear: 1980 },
    ];
  }
  return [];
}

export function assetsForCountry(countryCode: string): AssetDef[] {
  return [...localAssetsFor(countryCode), ...UNIVERSAL_ASSETS];
}

export function assetMaxYear(asset: AssetDef): number {
  if (asset.scope === "universal") return seriesYearRange(UNIVERSAL.closes[asset.id])[1];
  const data = LOCAL[asset.countryCode!];
  if (asset.id.endsWith("_cash")) return Math.max(...data.years);
  if (asset.id.endsWith("_savings")) return Math.max(...Object.keys(data.returns[`${asset.countryCode}_savings`] ?? data.riskFree ?? {}).map(Number));
  if (asset.id === "vn_hold_usd") return Math.max(...Object.keys(data.fxPerUsd ?? {}).map(Number));
  const closes = data.closes[asset.id];
  return closes ? seriesYearRange(closes)[1] : Math.max(...data.years);
}

export function computeWhatIf(asset: AssetDef, startYear: number, amount: number, endYear = LATEST_YEAR): WhatIfResult {
  let finalValue = amount;

  if (asset.scope === "universal") {
    const closes = UNIVERSAL.closes[asset.id];
    const p0 = num(closes, startYear);
    const p1 = num(closes, endYear);
    finalValue = p0 && p1 ? (amount / p0) * p1 : amount;
  } else {
    const data = LOCAL[asset.countryCode!];
    if (asset.id.endsWith("_cash")) {
      const p0 = num(data.cpiIndex, startYear) ?? 1;
      const p1 = num(data.cpiIndex, endYear) ?? 100;
      finalValue = amount * (p0 / p1);
    } else if (asset.id.endsWith("_savings")) {
      const rates = data.returns[asset.id] ?? data.riskFree ?? {};
      let factor = 1;
      for (let y = startYear + 1; y <= endYear; y++) factor *= 1 + (num(rates, y) ?? 0);
      finalValue = amount * factor;
    } else if (asset.id === "vn_hold_usd") {
      const fx0 = num(data.fxPerUsd, startYear) ?? 1;
      const fx1 = num(data.fxPerUsd, endYear) ?? fx0;
      finalValue = (amount / fx0) * fx1;
    } else {
      const closes = data.closes[asset.id];
      const p0 = closes ? num(closes, startYear) : undefined;
      const p1 = closes ? num(closes, endYear) : undefined;
      finalValue = p0 && p1 ? (amount / p0) * p1 : amount;
    }
  }

  return {
    asset: asset.id,
    startYear,
    endYear,
    amount,
    finalValue: Math.round(finalValue),
    multiple: finalValue / amount,
    currency: asset.currency,
    caveat: asset.caveat?.vi,
  };
}

/** The "do nothing" cash-erosion baseline for a country, used as a comparison anchor.
 * Returns null for countries with no local CPI/inflation data (no honest baseline to show). */
export function cashBaseline(countryCode: string, startYear: number, amount: number, endYear = LATEST_YEAR): WhatIfResult | null {
  const cashId = `${countryCode}_cash`;
  const asset = localAssetsFor(countryCode).find((a) => a.id === cashId);
  return asset ? computeWhatIf(asset, startYear, amount, endYear) : null;
}
