import type { Asset, YearlyPrices } from "./types";
import vn from "@/data/sim/vn.json";

export const vnPrices = vn as unknown as YearlyPrices;

export const vnAssets: Asset[] = [
  { id: "vn_cash", name: { vi: "Tiền mặt (VND)", en: "Cash (VND)" }, currency: "VND", availableFrom: 1980, feeBuy: 0, feeSell: 0, dataQuality: "official" },
  { id: "vn_savings", name: { vi: "Gửi tiết kiệm 12 tháng", en: "12-month savings deposit" }, currency: "VND", availableFrom: 1993, feeBuy: 0, feeSell: 0, lockYears: 1, dataQuality: "official" },
  { id: "vn_usd", name: { vi: "Giữ USD", en: "Hold USD" }, currency: "USD", availableFrom: 1986, feeBuy: 0.005, feeSell: 0.005, dataQuality: "official" },
  { id: "vn_gold", name: { vi: "Vàng SJC", en: "SJC gold" }, currency: "VND", availableFrom: 1980, feeBuy: 0.01, feeSell: 0.01, dataQuality: "proxy" },
  { id: "vn_index", name: { vi: "VN-Index", en: "VN-Index" }, currency: "VND", availableFrom: 2000, feeBuy: 0.0015, feeSell: 0.0015, taxOnSell: 0.001, dataQuality: "secondary" },
  { id: "btc", name: { vi: "Bitcoin", en: "Bitcoin" }, currency: "USD", availableFrom: 2011, feeBuy: 0.002, feeSell: 0.002, dataQuality: "official" },
];

export const getAsset = (id: string) => vnAssets.find((a) => a.id === id);

export const SIM_MIN_START_YEAR = 1990;
export const SIM_MAX_START_YEAR = 2020;
export const SIM_END_YEAR = Math.max(...vnPrices.years);
