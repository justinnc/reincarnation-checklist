import { describe, expect, it, vi } from "vitest";
import sitemap from "@/app/sitemap";
import { SITE_URL, localeAlternates, ogHeadline } from "../seo";

describe("SITE_URL", () => {
  it("uses the default URL when the environment variable is empty", async () => {
    const previous = process.env.NEXT_PUBLIC_SITE_URL;
    try {
      process.env.NEXT_PUBLIC_SITE_URL = "";
      vi.resetModules();
      const { SITE_URL: url } = await import("../seo");
      expect(url).toBe("https://reincarnation-checklist-justinncs-projects.vercel.app");
      expect(() => new URL(url)).not.toThrow();
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
      else process.env.NEXT_PUBLIC_SITE_URL = previous;
      vi.resetModules();
    }
  });

  it("is an absolute https URL without a trailing slash", () => {
    expect(SITE_URL).toMatch(/^https:\/\/[^/]+$/);
  });
});

describe("localeAlternates", () => {
  it("emits en, vi and x-default pointing at the locale-prefixed path", () => {
    const alts = localeAlternates("/vn/doi-moi-1986");
    expect(Object.keys(alts).sort()).toEqual(["en", "vi", "x-default"]);
    expect(alts.en).toBe(`${SITE_URL}/en/vn/doi-moi-1986`);
    expect(alts.vi).toBe(`${SITE_URL}/vi/vn/doi-moi-1986`);
    expect(alts["x-default"]).toBe(alts.en);
  });

  it("maps the empty path to the locale roots", () => {
    expect(localeAlternates("")).toEqual({
      en: `${SITE_URL}/en`,
      vi: `${SITE_URL}/vi`,
      "x-default": `${SITE_URL}/en`,
    });
  });

  it("adds a leading slash when the path lacks one", () => {
    expect(localeAlternates("vn").en).toBe(`${SITE_URL}/en/vn`);
  });
});

describe("ogHeadline", () => {
  it("is written in the page's language and carries the live counts", () => {
    const en = ogHeadline("en", 328, 15);
    const vi = ogHeadline("vi", 328, 15);
    expect(en).toContain("328 historical milestones, 15 countries");
    expect(en).not.toMatch(/[ạảấầẩậắằẳặẹẻếềểệịọỏốồổộớờởợụủứừửựỳỵỷđ]/i);
    expect(vi).toContain("328 mốc lịch sử, 15 quốc gia");
  });
});

describe("sitemap", () => {
  it("lists every public top-level page in both languages, once", () => {
    const urls = sitemap().map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const lang of ["en", "vi"]) {
      for (const page of ["", "/survival", "/almanac", "/whatif", "/world", "/quiz", "/methodology", "/disclaimer"]) {
        expect(urls, `${lang}${page}`).toContain(`${SITE_URL}/${lang}${page}`);
      }
    }
  });
});
