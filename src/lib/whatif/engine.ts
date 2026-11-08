import vn from "@/data/whatif/vn.json";
import type { AssetId, VnPriceData, WhatIfResult } from "./types";

const DATA = vn as unknown as VnPriceData;
export const LATEST_YEAR = Math.max(...DATA.years);

export const ASSETS: {
  id: AssetId;
  icon: string;
  label: { vi: string; en: string };
  minYear: number;
  caveat?: { vi: string; en: string };
}[] = [
  {
    id: "cash",
    icon: "💵",
    label: { vi: "Giữ tiền mặt (không làm gì)", en: "Hold cash (do nothing)" },
    minYear: 1980,
  },
  {
    id: "vn_savings",
    icon: "🏦",
    label: { vi: "Gửi tiết kiệm VND", en: "VND savings deposit" },
    minYear: 1993,
    caveat: {
      vi: "Thiếu lãi suất chính thức một số năm (1994-1996, 2024-2025); những năm đó tạm tính lãi 0%.",
      en: "Some years (1994-1996, 2024-2025) have no official rate on record; those years are treated as 0% for this estimate.",
    },
  },
  {
    id: "vn_usd",
    icon: "💴",
    label: { vi: "Giữ đô la Mỹ", en: "Hold US dollars" },
    minYear: 1986,
  },
  {
    id: "vn_gold",
    icon: "🪙",
    label: { vi: "Vàng SJC", en: "SJC gold" },
    minYear: 2000,
    caveat: {
      vi: "Giá vàng trước năm 2000 dùng tỷ giá chính thức thời bao cấp, lệch nặng so với giá chợ đen thật — vì vậy máy tính chỉ cho chọn từ năm 2000.",
      en: "Pre-2000 gold prices are reconstructed from the official exchange rate of that era and diverge sharply from real black-market prices, so this calculator only allows start years from 2000.",
    },
  },
  {
    id: "vn_index",
    icon: "📈",
    label: { vi: "Cổ phiếu (VN-Index)", en: "Stocks (VN-Index)" },
    minYear: 2000,
    caveat: {
      vi: "Dùng mức điểm VN-Index làm giá tham chiếu, không tính cổ tức hay phí giao dịch.",
      en: "Uses the VN-Index level as a reference price; does not include dividends or trading fees.",
    },
  },
  {
    id: "btc",
    icon: "₿",
    label: { vi: "Bitcoin", en: "Bitcoin" },
    minYear: 2011,
  },
];

export function assetMaxYear(id: AssetId): number {
  if (id === "cash" || id === "vn_usd") return Math.max(...Object.keys(DATA.fxPerUsd).map(Number));
  if (id === "vn_savings") return LATEST_YEAR;
  const closes = DATA.closes[id];
  return closes ? Math.max(...Object.keys(closes).map(Number)) : LATEST_YEAR;
}

function num(rec: Record<string, number> | undefined, year: number): number | undefined {
  return rec ? rec[String(year)] : undefined;
}

/** Compounds vn_savings using whatever official annual rates exist; missing years count as 0%. */
function compoundSavings(startYear: number, endYear: number): number {
  let factor = 1;
  for (let y = startYear + 1; y <= endYear; y++) {
    const r = num(DATA.returns.vn_savings, y) ?? 0;
    factor *= 1 + r;
  }
  return factor;
}

export function computeWhatIf(asset: AssetId, startYear: number, amount: number, endYear = LATEST_YEAR): WhatIfResult {
  const def = ASSETS.find((a) => a.id === asset)!;
  let finalValue = amount;

  if (asset === "cash") {
    const p0 = num(DATA.cpiIndex, startYear) ?? 1;
    const p1 = num(DATA.cpiIndex, endYear) ?? 100;
    finalValue = amount * (p0 / p1);
  } else if (asset === "vn_savings") {
    finalValue = amount * compoundSavings(startYear, endYear);
  } else if (asset === "vn_usd") {
    const fx0 = num(DATA.fxPerUsd, startYear) ?? 1;
    const fx1 = num(DATA.fxPerUsd, endYear) ?? fx0;
    finalValue = (amount / fx0) * fx1;
  } else if (asset === "vn_gold" || asset === "vn_index") {
    const p0 = num(DATA.closes[asset], startYear);
    const p1 = num(DATA.closes[asset], endYear);
    finalValue = p0 && p1 ? (amount / p0) * p1 : amount;
  } else if (asset === "btc") {
    const fx0 = num(DATA.fxPerUsd, startYear) ?? 1;
    const fx1 = num(DATA.fxPerUsd, endYear) ?? fx0;
    const usd0 = num(DATA.closes.btc, startYear);
    const usd1 = num(DATA.closes.btc, endYear);
    if (usd0 && usd1) {
      const usdAmount = amount / fx0;
      const units = usdAmount / usd0;
      finalValue = units * usd1 * fx1;
    }
  }

  return {
    asset,
    startYear,
    endYear,
    amount,
    finalValue: Math.round(finalValue),
    multiple: finalValue / amount,
    caveat: def.caveat?.vi,
  };
}
