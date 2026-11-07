export const locales = ["en", "vi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Text that can be translated. Missing languages fall back to English, then Vietnamese. */
export type LocalizedText = Partial<Record<Locale, string>> & { en: string };

export function t(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.en ?? text.vi ?? "";
}

