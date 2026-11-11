export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://reincarnation-checklist.vn";

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
