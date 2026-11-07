import { intlLocale, type Locale } from "./i18n";

export function formatMoney(value: number, currency: string, lang: Locale) {
  const loc = intlLocale(lang);
  if (value >= 1_000_000) {
    // Compact with words ("10 triệu", "1.2 million") reads better than "10 Tr ₫".
    const n = new Intl.NumberFormat(loc, { notation: "compact", compactDisplay: "long", maximumFractionDigits: 1 }).format(value);
    const symbols: Record<string, [string, string]> = {
      USD: ["$", ""], VND: ["", " ₫"], EUR: ["€", ""], GBP: ["£", ""], JPY: ["¥", ""], CNY: ["¥", ""],
      INR: ["₹", ""], CAD: ["C$", ""], BRL: ["R$", ""],
    };
    const [pre, post] = symbols[currency] ?? ["", ` ${currency}`];
    return `${pre}${n}${post}`;
  }
  return new Intl.NumberFormat(loc, { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export function formatMultiple(x: number, lang: Locale) {
  const digits = x < 10 ? 1 : 0;
  return `${new Intl.NumberFormat(intlLocale(lang), { maximumFractionDigits: digits }).format(x)}×`;
}

export function formatDate(date: string, lang: Locale) {
  const [y, m, d] = date.split("-").map(Number);
  if (!m) return String(y);
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
