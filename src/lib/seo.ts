import type { Locale } from "@/lib/i18n";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://reincarnation-checklist-justinncs-projects.vercel.app";

/** Builds the `alternates.languages` map Next.js expects for hreflang tags,
 * given a path WITHOUT the locale prefix (e.g. "/vn/doi-moi-1986" or ""). */
export function localeAlternates(path: string): Record<string, string> {
  const suffix = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return {
    en: `${SITE_URL}/en${suffix}`,
    vi: `${SITE_URL}/vi${suffix}`,
    "x-default": `${SITE_URL}/en${suffix}`,
  };
}

/** Headline of the per-locale share (Open Graph) image. */
export function ogHeadline(lang: Locale, milestones: number, countryCount: number): string {
  return lang === "vi"
    ? `${milestones} mốc lịch sử, ${countryCount} quốc gia. Nếu được trọng sinh, cơ hội và cạm bẫy nào đang chờ bạn?`
    : `${milestones} historical milestones, ${countryCount} countries. If you were reborn, which opportunities and traps would be waiting for you?`;
}
