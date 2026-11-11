import { describe, expect, it } from "vitest";
import { quantityLabel } from "../almanacUnits";

describe("quantityLabel", () => {
  it("names the thing you can buy, pluralised in English", () => {
    expect(quantityLabel("USD/gallon", 671, "en")).toBe("gallons");
    expect(quantityLabel("AUD/burger", 1, "en")).toBe("burger");
    expect(quantityLabel("AUD/house", 0.01, "en")).toBe("house");
    expect(quantityLabel("AUD/gram (pure 24k gold)", 3.5, "en")).toBe("grams (pure 24k gold)");
    expect(quantityLabel("GBP per troy ounce", 2, "en")).toBe("troy ounces");
    expect(quantityLabel("cents/litre", 40, "en")).toBe("litres");
  });
  it("keeps currency codes, areas and Vietnamese as-is", () => {
    expect(quantityLabel("AUD per USD", 700, "en")).toBe("USD");
    expect(quantityLabel("BRL/m²", 12, "en")).toBe("m²");
    expect(quantityLabel("AUD/căn", 0.01, "vi")).toBe("căn");
  });
  it("returns empty when the unit has no 'per' part", () => {
    expect(quantityLabel("BRL each", 5, "en")).toBe("");
  });
});
