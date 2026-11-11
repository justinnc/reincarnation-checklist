import { intlLocale, type Locale } from "@/lib/i18n";

/** Group digits for a money text field: vi "10.000.000", en "10,000,000". */
export function formatAmountInput(value: number, lang: Locale): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  return new Intl.NumberFormat(intlLocale(lang), { maximumFractionDigits: 0, useGrouping: true }).format(Math.trunc(value));
}

/** Inverse of formatAmountInput: keep digits only, so either locale's separators (and pasted text) parse. */
export function parseAmountInput(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}
