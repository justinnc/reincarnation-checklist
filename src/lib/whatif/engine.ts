import vnData from "@/data/whatif/vn.json";
import usData from "@/data/whatif/us.json";
import cnData from "@/data/whatif/cn.json";
import jpData from "@/data/whatif/jp.json";
import deData from "@/data/whatif/de.json";
import inData from "@/data/whatif/in.json";
import gbData from "@/data/whatif/gb.json";
import frData from "@/data/whatif/fr.json";
import itData from "@/data/whatif/it.json";
import caData from "@/data/whatif/ca.json";
import brData from "@/data/whatif/br.json";
import universalData from "@/data/whatif/universal.json";
import type { AssetDef, LocalCountryData, UniversalData, WhatIfResult } from "./types";

const LOCAL: Record<string, LocalCountryData> = {
  vn: vnData as unknown as LocalCountryData,
  us: usData as unknown as LocalCountryData,
  cn: cnData as unknown as LocalCountryData,
  jp: jpData as unknown as LocalCountryData,
  de: deData as unknown as LocalCountryData,
  in: inData as unknown as LocalCountryData,
  gb: gbData as unknown as LocalCountryData,
  fr: frData as unknown as LocalCountryData,
  it: itData as unknown as LocalCountryData,
  ca: caData as unknown as LocalCountryData,
  br: brData as unknown as LocalCountryData,
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
    caveatUntilYear: 2011,
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

const EUR_CAVEAT = {
  vi: "Khu vực đồng Euro — máy tính chỉ cho chọn từ năm 1999 (năm Euro trở thành tiền tệ chính thức), tránh lẫn với tiền tệ cũ (Mark Đức/Franc Pháp/Lira Ý).",
  en: "Eurozone — selectable only from 1999 (when the Euro became the official currency), to avoid mixing with the old national currency.",
};

const SIMPLE_COUNTRY_CONFIG: Record<
  string,
  { currency: string; minYear: number; stockLabel: { vi: string; en: string }; caveat?: { vi: string; en: string } }
> = {
  cn: { currency: "CNY", minYear: 1980, stockLabel: { vi: "Cổ phiếu Trung Quốc (SSE Composite)", en: "China stocks (SSE Composite)" } },
  jp: {
    currency: "JPY", minYear: 1980, stockLabel: { vi: "Cổ phiếu Nhật Bản (Nikkei 225)", en: "Japan stocks (Nikkei 225)" },
    caveat: { vi: "Lãi suất tiết kiệm dùng lãi suất chính sách của Ngân hàng Trung ương Nhật, từng ở mức âm (2016-2024).", en: "Savings rate uses the Bank of Japan's policy rate, which went negative from 2016-2024." },
  },
  de: { currency: "EUR", minYear: 1999, stockLabel: { vi: "Cổ phiếu Đức (DAX)", en: "Germany stocks (DAX)" }, caveat: EUR_CAVEAT },
  in: { currency: "INR", minYear: 1980, stockLabel: { vi: "Cổ phiếu Ấn Độ (BSE SENSEX)", en: "India stocks (BSE SENSEX)" } },
  gb: { currency: "GBP", minYear: 1980, stockLabel: { vi: "Cổ phiếu Anh (FTSE 100)", en: "UK stocks (FTSE 100)" } },
  fr: { currency: "EUR", minYear: 1999, stockLabel: { vi: "Cổ phiếu Pháp (CAC 40)", en: "France stocks (CAC 40)" }, caveat: EUR_CAVEAT },
  it: { currency: "EUR", minYear: 1999, stockLabel: { vi: "Cổ phiếu Ý (FTSE MIB)", en: "Italy stocks (FTSE MIB)" }, caveat: EUR_CAVEAT },
  ca: { currency: "CAD", minYear: 1980, stockLabel: { vi: "Cổ phiếu Canada (S&P/TSX)", en: "Canada stocks (S&P/TSX)" } },
  br: {
    currency: "BRL", minYear: 1994, stockLabel: { vi: "Cổ phiếu Brazil (Ibovespa)", en: "Brazil stocks (Ibovespa)" },
    caveat: { vi: "Brazil đổi tiền tệ nhiều lần do siêu lạm phát; máy tính chỉ cho chọn từ 1994 (năm ra đời đồng Real hiện tại).", en: "Brazil changed currency several times due to hyperinflation; selectable only from 1994 (when the current Real was introduced)." },
  },
};

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

  const simple = SIMPLE_COUNTRY_CONFIG[countryCode];
  if (simple) {
    const data = LOCAL[countryCode];
    const stockMinYear = data.closes[`${countryCode}_stock`] ? seriesYearRange(data.closes[`${countryCode}_stock`])[0] : simple.minYear;
    return [
      { id: `${countryCode}_cash`, scope: "local", countryCode, currency: simple.currency, icon: "💵", label: { vi: "Giữ tiền mặt (không làm gì)", en: "Hold cash (do nothing)" }, minYear: simple.minYear },
      {
        id: `${countryCode}_savings`, scope: "local", countryCode, currency: simple.currency, icon: "🏦",
        label: { vi: `Gửi tiết kiệm ${simple.currency}`, en: `${simple.currency} savings deposit` }, minYear: simple.minYear,
        caveat: simple.caveat,
      },
      { id: `${countryCode}_stock`, scope: "local", countryCode, currency: simple.currency, icon: "📈", label: simple.stockLabel, minYear: stockMinYear },
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
      finalValue = amount;
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
    multiple: amount > 0 ? finalValue / amount : 0,
    currency: asset.currency,
    caveat: asset.caveat?.vi,
  };
}

/** Cash's purchasing-power equivalent in starting-year currency units, not a nominal balance. */
export function cashBaseline(countryCode: string, startYear: number, amount: number, endYear = LATEST_YEAR): WhatIfResult | null {
  const cashId = `${countryCode}_cash`;
  const asset = localAssetsFor(countryCode).find((a) => a.id === cashId);
  if (!asset) return null;
  const data = LOCAL[countryCode];
  const p0 = num(data.cpiIndex, startYear);
  const p1 = num(data.cpiIndex, endYear);
  if (!p0 || !p1) return null;
  const finalValue = amount * p0 / p1;
  return {
    ...computeWhatIf(asset, startYear, amount, endYear),
    finalValue: Math.round(finalValue),
    multiple: amount > 0 ? finalValue / amount : 0,
  };
}

/** Only compare equal units; a USD investment is not the same stake as local-currency cash. */
export function comparableCashBaseline(countryCode: string, asset: AssetDef, startYear: number, amount: number): WhatIfResult | null {
  const cash = localAssetsFor(countryCode).find((a) => a.id === `${countryCode}_cash`);
  return cash?.currency === asset.currency ? cashBaseline(countryCode, startYear, amount) : null;
}

/** The asset's caveat, if it applies to the chosen start year. */
export function caveatFor(asset: AssetDef, startYear: number): AssetDef["caveat"] {
  if (!asset.caveat) return undefined;
  if (asset.caveatUntilYear !== undefined && startYear > asset.caveatUntilYear) return undefined;
  return asset.caveat;
}

/** For countries whose local series only start after a currency changeover, the single
 * best-documented real historical opportunity is usually the window BEFORE that boundary
 * (e.g. the 1995-1998 Euro-convergence bond trade, or betting on Brazil's hyperinflation
 * ending) — which this calculator can't model with a simple "hold currency X" asset.
 * Point people at the detailed milestone entry instead of letting them think data is missing. */
export const PRE_BOUNDARY_NOTE: Record<string, { milestoneId: string; text: { vi: string; en: string } }> = {
  de: {
    milestoneId: "de-euro-cash-launch-2002",
    text: {
      vi: "Cơ hội lớn nhất ở Đức thực ra nằm ở giai đoạn trước 1999 — biết trước tỷ giá Mark/Euro cố định giúp định giá chính xác tài sản DM.",
      en: "Germany's biggest documented opportunity is actually the pre-1999 window — knowing the fixed DM/Euro rate in advance let you value DM assets with certainty.",
    },
  },
  fr: {
    milestoneId: "fr-euro-introduction-1999",
    text: {
      vi: "Cơ hội lớn nhất ở Pháp nằm ở giai đoạn 1995-1998: mua trái phiếu franc lãi suất cao, ăn chênh lệch khi lợi suất hội tụ về mức Đức trước khi vào khối Euro.",
      en: "France's biggest documented opportunity is 1995-1998: buying high-yield franc bonds and profiting as yields converged toward Germany's ahead of the Euro.",
    },
  },
  it: {
    milestoneId: "it-euro-conversion-1999",
    text: {
      vi: "Cơ hội lớn nhất ở Ý nằm ở giai đoạn 1995-1998: mua trái phiếu BTP lira lãi suất cao, ăn chênh lệch gần như không rủi ro khi lợi suất hội tụ về mức Đức.",
      en: "Italy's biggest documented opportunity is 1995-1998: buying high-yield lira BTP bonds and capturing a near-riskless gain as yields converged toward Germany's.",
    },
  },
  br: {
    milestoneId: "br-plano-real-1994",
    text: {
      vi: "Cơ hội lớn nhất ở Brazil nằm ở chính giai đoạn siêu lạm phát 1986-1994 — biết trước ngày Plano Real thành công giúp giữ tài sản đúng lúc, tránh các lần đổi tiền thất bại trước đó.",
      en: "Brazil's biggest documented opportunity is the 1986-1994 hyperinflation era itself — knowing in advance that Plano Real would succeed let you hold assets through it, unlike the earlier failed currency plans.",
    },
  },
};
