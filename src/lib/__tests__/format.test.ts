import { describe, expect, it } from "vitest";
import { formatDate, formatDrop, formatMoney, formatMultiple } from "../format";

describe("formatMoney", () => {
  it("formats VND with a trailing ₫ and locale grouping", () => {
    expect(formatMoney(10_000, "VND", "en")).toBe("10,000 ₫");
    expect(formatMoney(10_000, "VND", "vi")).toBe("10.000 ₫");
  });

  it("prefixes USD, JPY, GBP, EUR symbols", () => {
    expect(formatMoney(1_000, "USD", "en")).toBe("$1,000");
    expect(formatMoney(100_000, "JPY", "en")).toBe("¥100,000");
    expect(formatMoney(1_000, "GBP", "en")).toBe("£1,000");
    expect(formatMoney(1_000, "EUR", "vi")).toBe("€1.000");
  });

  it("uses compact long words from one million upward in both locales", () => {
    expect(formatMoney(5_100_000, "VND", "en")).toBe("5.1 million ₫");
    expect(formatMoney(5_100_000, "VND", "vi")).toBe("5,1 triệu ₫");
    expect(formatMoney(2_500_000_000, "USD", "en")).toBe("$2.5 billion");
    expect(formatMoney(2_500_000_000, "VND", "vi")).toBe("2,5 tỷ ₫");
    expect(formatMoney(1_000_000, "USD", "en")).toBe("$1 million");
  });

  it("stays non-compact just below one million", () => {
    expect(formatMoney(999_999, "VND", "en")).toBe("999,999 ₫");
  });

  it("keeps two decimals for small values and none for values >= 10", () => {
    expect(formatMoney(2.345, "USD", "en")).toBe("$2.35");
    expect(formatMoney(1234.6, "USD", "en")).toBe("$1,235");
  });

  it("falls back to a trailing ISO code for unknown currencies", () => {
    expect(formatMoney(500, "XYZ", "en")).toBe("500 XYZ");
  });

  it("handles zero and negative values", () => {
    expect(formatMoney(0, "VND", "en")).toBe("0 ₫");
    expect(formatMoney(-1500, "USD", "en")).toBe("$-1,500");
    expect(formatMoney(-1500, "VND", "vi")).toBe("-1.500 ₫");
  });

  it("documents current behaviour on degenerate inputs", () => {
    // TODO: NaN leaks through as "NaN ₫"; Infinity as "∞ ₫". Guard upstream or here.
    expect(formatMoney(NaN, "VND", "en")).toBe("NaN ₫");
    expect(formatMoney(Infinity, "VND", "en")).toBe("∞ ₫");
    // TODO: compact threshold is `value >= 1e6`, so large negatives never compact ("-5,000,000 ₫" vs "5 million ₫").
    expect(formatMoney(-5_000_000, "VND", "en")).toBe("-5,000,000 ₫");
    // TODO: 1e15 renders as "1000 trillion" rather than "1 quadrillion".
    expect(formatMoney(1e15, "USD", "en")).toBe("$1000 trillion");
  });
});

describe("formatMultiple", () => {
  it("keeps one decimal below 10× and none above", () => {
    expect(formatMultiple(2.5, "en")).toBe("2.5×");
    expect(formatMultiple(2.5, "vi")).toBe("2,5×");
    expect(formatMultiple(1234.4, "en")).toBe("1,234×");
    expect(formatMultiple(1234.4, "vi")).toBe("1.234×");
  });

  it("handles zero, negatives and degenerate inputs", () => {
    expect(formatMultiple(0, "en")).toBe("0×");
    expect(formatMultiple(-2, "en")).toBe("-2×");
    // TODO: NaN/Infinity render as "NaN×" / "∞×".
    expect(formatMultiple(NaN, "en")).toBe("NaN×");
    expect(formatMultiple(Infinity, "en")).toBe("∞×");
  });
});

describe("formatDrop", () => {
  it("renders a multiple as a signed percent change", () => {
    expect(formatDrop(0.0122, "en")).toBe("-98.8%");
    expect(formatDrop(0.0122, "vi")).toBe("-98,8%");
    expect(formatDrop(2.5, "en")).toBe("+150%");
  });

  it("renders 1× as +0% and 0× as -100%", () => {
    expect(formatDrop(1, "en")).toBe("+0%");
    expect(formatDrop(0, "en")).toBe("-100%");
  });

  it("documents NaN leaking through", () => {
    // TODO: NaN renders as "+NaN%".
    expect(formatDrop(NaN, "en")).toBe("+NaN%");
  });
});

describe("formatDate", () => {
  it("returns the bare year for YYYY input in both locales", () => {
    expect(formatDate("1986", "en")).toBe("1986");
    expect(formatDate("1986", "vi")).toBe("1986");
  });

  it("formats YYYY-MM as short month + year (en) or M/YYYY (vi)", () => {
    expect(formatDate("1986-12", "en")).toBe("Dec 1986");
    expect(formatDate("1986-12", "vi")).toBe("12/1986");
  });

  it("formats YYYY-MM-DD as full date (en) or D/M/YYYY (vi)", () => {
    expect(formatDate("2008-09-15", "en")).toBe("Sep 15, 2008");
    expect(formatDate("2008-09-15", "vi")).toBe("15/9/2008");
    expect(formatDate("2020-01-01", "en")).toBe("Jan 1, 2020");
  });

  it("documents behaviour on malformed input", () => {
    // TODO: non-date strings yield "NaN" instead of throwing or returning the input.
    expect(formatDate("garbage", "en")).toBe("NaN");
    expect(formatDate("", "vi")).toBe("0");
  });
});
