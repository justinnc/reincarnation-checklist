import { intlLocale, type Locale } from "./i18n";

export function formatMoney(value: number, currency: string, lang: Locale) {
  const compact = value >= 1_000_000;
  return new Intl.NumberFormat(intlLocale(lang), {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    compactDisplay: lang === "vi" ? "long" : "short",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value);
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
