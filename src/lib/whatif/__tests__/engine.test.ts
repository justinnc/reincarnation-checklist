import { describe, expect, it } from "vitest";
import { assetMaxYear, assetsForCountry, cashBaseline, computeWhatIf, LATEST_YEAR } from "../engine";

describe("assetsForCountry", () => {
  it("vn, us, and now 9 more countries have real local datasets plus the universal ones", () => {
    const vnIds = assetsForCountry("vn").map((a) => a.id);
    expect(vnIds).toContain("vn_gold");
    expect(vnIds).toContain("gold_usd_oz");
    const usIds = assetsForCountry("us").map((a) => a.id);
    expect(usIds).toContain("us_savings");
    expect(usIds).toContain("sp500_usd");
    for (const code of ["cn", "jp", "de", "in", "gb", "fr", "it", "ca", "br"]) {
      const ids = assetsForCountry(code).map((a) => a.id);
      expect(ids).toContain(`${code}_cash`);
      expect(ids).toContain(`${code}_savings`);
      expect(ids).toContain(`${code}_stock`);
      expect(ids).toContain("gold_usd_oz");
    }
  });

  it("countries with no dataset at all fall back to only the universal cross-border assets", () => {
    const ids = assetsForCountry("xx-nonexistent").map((a) => a.id);
    expect(ids).toEqual(["gold_usd_oz", "btc_usd", "sp500_usd"]);
  });
});

describe("computeWhatIf", () => {
  it("cash loses real value to inflation (VN)", () => {
    const asset = assetsForCountry("vn").find((a) => a.id === "vn_cash")!;
    const r = computeWhatIf(asset, 1990, 10_000_000);
    expect(r.multiple).toBeLessThan(1);
  });

  it("universal gold grows in USD regardless of selected country", () => {
    const asset = assetsForCountry("xx-nonexistent").find((a) => a.id === "gold_usd_oz")!;
    const r = computeWhatIf(asset, 2000, 1000);
    expect(r.multiple).toBeGreaterThan(1);
    expect(r.currency).toBe("USD");
  });

  it("universal btc is dramatically positive from 2011", () => {
    const asset = assetsForCountry("br").find((a) => a.id === "btc_usd")!;
    const r = computeWhatIf(asset, 2011, 100);
    expect(r.multiple).toBeGreaterThan(100);
  });

  it("us savings compounds using the T-bill rate series", () => {
    const asset = assetsForCountry("us").find((a) => a.id === "us_savings")!;
    const r = computeWhatIf(asset, 2000, 1000);
    expect(r.multiple).toBeGreaterThan(1);
  });

  it("identical start/end year returns the amount unchanged for any series-based asset", () => {
    for (const code of ["vn", "us", "jp", "br", "de"]) {
      for (const asset of assetsForCountry(code)) {
        if (asset.id.endsWith("_cash")) continue; // cash still "moves" if start===end only trivially (ratio 1 anyway)
        const maxY = assetMaxYear(asset);
        const r = computeWhatIf(asset, maxY, 5000, maxY);
        expect(r.finalValue).toBe(5000);
      }
    }
  });
});

describe("cashBaseline", () => {
  it("is available for every country with a local dataset", () => {
    for (const code of ["vn", "us", "cn", "jp", "de", "in", "gb", "fr", "it", "ca", "br"]) {
      expect(cashBaseline(code, 2000, 1000)).not.toBeNull();
    }
  });

  it("is null for countries without any local dataset", () => {
    expect(cashBaseline("xx-nonexistent", 2000, 1000)).toBeNull();
  });
});

describe("currency-boundary countries restrict their selectable start year", () => {
  it("eurozone countries (de/fr/it) only allow 1999+", () => {
    for (const code of ["de", "fr", "it"]) {
      for (const asset of assetsForCountry(code).filter((a) => a.scope === "local")) {
        expect(asset.minYear).toBeGreaterThanOrEqual(1999);
      }
    }
  });

  it("brazil only allows 1994+ (the Real's introduction)", () => {
    for (const asset of assetsForCountry("br").filter((a) => a.scope === "local")) {
      expect(asset.minYear).toBeGreaterThanOrEqual(1994);
    }
  });
});

describe("assetMaxYear", () => {
  it("never exceeds LATEST_YEAR", () => {
    for (const code of ["vn", "us", "cn"]) {
      for (const asset of assetsForCountry(code)) {
        expect(assetMaxYear(asset)).toBeLessThanOrEqual(LATEST_YEAR);
      }
    }
  });
});
