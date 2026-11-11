import { describe, expect, it } from "vitest";
import { defaultCountry, defaultLocale, hasLocale, intlLocale, locales, t } from "../i18n";
import en from "../../dictionaries/en.json";
import vi from "../../dictionaries/vi.json";

describe("milestone source labels", () => {
  it("describes source count rather than claiming independent verification", () => {
    expect(en.timeline.verified).toBe("2+ sources listed");
    expect(vi.timeline.verified).toBe("Có từ 2 nguồn");
    expect(en.timeline.verifiedMeaning).toContain("Listed source links");
    expect(en.timeline.verifiedMeaning).toContain("not been independently fact-checked");
    expect(vi.timeline.verifiedMeaning).toContain("Liên kết nguồn được liệt kê");
    expect(vi.timeline.verifiedMeaning).toContain("chưa được kiểm chứng độc lập");
    expect(en.timeline.unverified).toBe("Source status unconfirmed");
    expect(vi.timeline.unverified).toBe("Chưa xác nhận nguồn");
  });
});

describe("homepage onboarding", () => {
  it("does not promise a save-to-Cheat-Sheet flow while Charm is hidden", () => {
    expect(en.home.steps.join(" ")).not.toMatch(/save.*cheat sheet/i);
    expect(vi.home.steps.join(" ")).not.toMatch(/lưu.*bùa/i);
  });
});

describe("t", () => {
  it("returns the requested locale when present", () => {
    expect(t({ en: "Hello", vi: "Xin chào" }, "vi")).toBe("Xin chào");
    expect(t({ en: "Hello", vi: "Xin chào" }, "en")).toBe("Hello");
  });

  it("falls back to en when vi is missing", () => {
    expect(t({ en: "Hello" }, "vi")).toBe("Hello");
  });

  it("returns empty string for undefined text", () => {
    expect(t(undefined, "en")).toBe("");
  });

  it("falls back to vi when en is somehow empty", () => {
    expect(t({ en: "", vi: "Chào" } as never, "en")).toBe("");
    expect(t({ vi: "Chào" } as never, "en")).toBe("Chào");
  });
});

describe("hasLocale", () => {
  it("accepts only the supported locales", () => {
    expect(locales).toEqual(["en", "vi"]);
    expect(hasLocale("en")).toBe(true);
    expect(hasLocale("vi")).toBe(true);
    expect(hasLocale("fr")).toBe(false);
    expect(hasLocale("EN")).toBe(false);
    expect(hasLocale("")).toBe(false);
  });

  it("defaults to en", () => {
    expect(defaultLocale).toBe("en");
  });
});

describe("intlLocale / defaultCountry", () => {
  it("maps locale to BCP-47 tag", () => {
    expect(intlLocale("en")).toBe("en-US");
    expect(intlLocale("vi")).toBe("vi-VN");
  });

  it("picks the home market per locale", () => {
    expect(defaultCountry("en")).toBe("us");
    expect(defaultCountry("vi")).toBe("vn");
  });
});
