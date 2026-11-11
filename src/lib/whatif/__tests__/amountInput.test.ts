import { describe, expect, it } from "vitest";
import { formatAmountInput, parseAmountInput } from "../amountInput";

describe("amount input formatting", () => {
  it("groups thousands per locale", () => {
    expect(formatAmountInput(10_000_000, "vi")).toBe("10.000.000");
    expect(formatAmountInput(10_000_000, "en")).toBe("10,000,000");
    expect(formatAmountInput(0, "vi")).toBe("");
  });

  it("parses grouped text back to a number", () => {
    expect(parseAmountInput("10.000.000")).toBe(10_000_000);
    expect(parseAmountInput("10,000,000")).toBe(10_000_000);
    expect(parseAmountInput("1 000 ₫")).toBe(1000);
    expect(parseAmountInput("")).toBeNull();
  });

  it("round-trips", () => {
    for (const lang of ["vi", "en"] as const) expect(parseAmountInput(formatAmountInput(123_456_789, lang))).toBe(123_456_789);
  });
});
