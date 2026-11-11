import { describe, expect, it, vi } from "vitest";
import { SITE_URL, localeAlternates } from "../seo";

describe("SITE_URL", () => {
  it("uses the default URL when the environment variable is empty", async () => {
    const previous = process.env.NEXT_PUBLIC_SITE_URL;
    try {
      process.env.NEXT_PUBLIC_SITE_URL = "";
      vi.resetModules();
      const { SITE_URL: url } = await import("../seo");
      expect(url).toBe("https://reincarnation-checklist.vn");
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
