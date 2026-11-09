import { intlLocale, type Locale } from "./i18n";

const SYMBOLS: Record<string, [string, string]> = {
  USD: ["$", ""], VND: ["", " ₫"], EUR: ["€", ""], GBP: ["£", ""], JPY: ["¥", ""], CNY: ["¥", ""],
  INR: ["₹", ""], CAD: ["C$", ""], BRL: ["R$", ""], HKD: ["HK$", ""],
  KRW: ["₩", ""], AUD: ["A$", ""], SGD: ["S$", ""], THB: ["฿", ""],
};

export function formatMoney(value: number, currency: string, lang: Locale) {
  const loc = intlLocale(lang);
  const n =
    value >= 1_000_000
      ? // Compact with words ("10 triệu", "1.2 million") reads better than "10 Tr ₫".
        new Intl.NumberFormat(loc, { notation: "compact", compactDisplay: "long", maximumFractionDigits: 1 }).format(value)
      : new Intl.NumberFormat(loc, { maximumFractionDigits: value < 10 ? 2 : 0 }).format(value);
  const [pre, post] = SYMBOLS[currency] ?? ["", ` ${currency}`];
  return `${pre}${n}${post}`;
}

export function formatMultiple(x: number, lang: Locale) {
  const digits = x < 10 ? 1 : 0;
  return `${new Intl.NumberFormat(intlLocale(lang), { maximumFractionDigits: digits }).format(x)}×`;
}

export function formatDate(date: string, lang: Locale) {
  const [y, m, d] = date.split("-").map(Number);
  if (!m) return String(y);
  if (lang === "vi") return d ? `${d}/${m}/${y}` : `${m}/${y}`;
  const opts: Intl.DateTimeFormatOptions = d
    ? { year: "numeric", month: "short", day: "numeric" }
    : { year: "numeric", month: "short" };
  return new Intl.DateTimeFormat(intlLocale(lang), { ...opts, timeZone: "UTC" }).format(
    new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1)),
  );
}

/** Percent change for a multiple, e.g. 0.0122 -> "−98.8%" */
export function formatDrop(x: number, lang: Locale) {
  return new Intl.NumberFormat(intlLocale(lang), { style: "percent", maximumFractionDigits: 1, signDisplay: "always" }).format(x - 1);
}
