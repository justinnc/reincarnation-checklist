import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { allMilestones, countries } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

const STATIC_PAGES = ["", "/almanac", "/whatif", "/simulator", "/quiz", "/disclaimer"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of locales) {
    for (const page of STATIC_PAGES) {
      entries.push({
        url: `${SITE_URL}/${lang}${page}`,
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1 : 0.6,
      });
    }
    for (const c of countries) {
      entries.push({ url: `${SITE_URL}/${lang}/${c.code}`, changeFrequency: "monthly", priority: 0.7 });
    }
    for (const m of allMilestones) {
      entries.push({ url: `${SITE_URL}/${lang}/${m.country}/${m.id}`, changeFrequency: "yearly", priority: 0.5 });
    }
  }

  return entries;
}
