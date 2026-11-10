import type { Country } from "./types";

/** Ordered: Vietnam first, then the world's 10 largest economies by nominal GDP (IMF). */
export const allCountries: Country[] = [
  { code: "vn", name: { vi: "Việt Nam", en: "Vietnam" }, flag: "🇻🇳", stake: { amount: 10_000_000, currency: "VND" } },
  { code: "us", name: { vi: "Mỹ", en: "United States" }, flag: "🇺🇸", stake: { amount: 1_000, currency: "USD" } },
  { code: "cn", name: { vi: "Trung Quốc", en: "China" }, flag: "🇨🇳", stake: { amount: 10_000, currency: "CNY" } },
  { code: "de", name: { vi: "Đức", en: "Germany" }, flag: "🇩🇪", stake: { amount: 1_000, currency: "EUR" } },
  { code: "jp", name: { vi: "Nhật Bản", en: "Japan" }, flag: "🇯🇵", stake: { amount: 100_000, currency: "JPY" } },
  { code: "in", name: { vi: "Ấn Độ", en: "India" }, flag: "🇮🇳", stake: { amount: 100_000, currency: "INR" } },
  { code: "gb", name: { vi: "Anh", en: "United Kingdom" }, flag: "🇬🇧", stake: { amount: 1_000, currency: "GBP" } },
  { code: "fr", name: { vi: "Pháp", en: "France" }, flag: "🇫🇷", stake: { amount: 1_000, currency: "EUR" } },
  { code: "it", name: { vi: "Ý", en: "Italy" }, flag: "🇮🇹", stake: { amount: 1_000, currency: "EUR" } },
  { code: "ca", name: { vi: "Canada", en: "Canada" }, flag: "🇨🇦", stake: { amount: 1_000, currency: "CAD" } },
  { code: "br", name: { vi: "Brazil", en: "Brazil" }, flag: "🇧🇷", stake: { amount: 5_000, currency: "BRL" } },
  { code: "kr", name: { vi: "Hàn Quốc", en: "South Korea" }, flag: "🇰🇷", stake: { amount: 1_000_000, currency: "KRW" } },
  { code: "au", name: { vi: "Úc", en: "Australia" }, flag: "🇦🇺", stake: { amount: 1_000, currency: "AUD" } },
  { code: "sg", name: { vi: "Singapore", en: "Singapore" }, flag: "🇸🇬", stake: { amount: 1_000, currency: "SGD" } },
  { code: "th", name: { vi: "Thái Lan", en: "Thailand" }, flag: "🇹🇭", stake: { amount: 30_000, currency: "THB" } },
];
