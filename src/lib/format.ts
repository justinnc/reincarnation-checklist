import { intlLocale, type Locale } from "./i18n";

export function formatMoney(value: number, currency: string, lang: Locale) {
  const loc = intlLocale(lang);
  if (value >= 1_000_000) {
    // Compact with words ("10 triệu", "1.2 million") reads better than "10 Tr ₫".
    const n = new Intl.NumberFormat(loc, { notation: "compact", compactDisplay: "long", maximumFractionDigits: 1 }).format(value);
    if (currency === "USD") return `$${n}`;
    if (currency === "VND") return `${n} ₫`;
    return `${n} ${currency}`;
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
