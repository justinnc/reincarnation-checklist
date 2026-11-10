import { describe, expect, it } from "vitest";
import type { Milestone } from "../types";
import { searchMilestones } from "../search";

const mk = (id: string, title: { en: string; vi?: string }, extra: Partial<Milestone> = {}): Milestone => ({
  id,
  country: "vn",
  date: "2000",
  category: "macro",
  title,
  description: { en: "" },
  opportunity: { action: { en: "" }, buyWhen: { en: "" }, estimatedReturn: { en: "" } },
  sources: [],
  verified: true,
  ...extra,
});

const doiMoi = mk("doi-moi", { en: "Đổi Mới opens the economy", vi: "Đổi Mới mở cửa kinh tế" }, { date: "1986-12-18" });
const bitcoin = mk("btc", { en: "Bitcoin hits $1" }, { date: "2011-02", description: { en: "Early crypto adoption" } });
const land = mk("land", { en: "Land boom" }, { date: "2007", insiderTip: { en: "Buy in Hanoi suburbs" }, pitfalls: { en: "Bubble risk" } });
const all = [doiMoi, bitcoin, land];

describe("searchMilestones", () => {
  it("returns nothing for an empty or whitespace query", () => {
    expect(searchMilestones(all, "en", "")).toEqual([]);
    expect(searchMilestones(all, "en", "   ")).toEqual([]);
  });

  it("returns nothing when no field matches", () => {
    expect(searchMilestones(all, "en", "unicorn")).toEqual([]);
  });

  it("matches case-insensitively against the title", () => {
    expect(searchMilestones(all, "en", "BITCOIN")).toEqual([bitcoin]);
  });

  it("matches Vietnamese text with diacritics when searching in vi", () => {
    expect(searchMilestones(all, "vi", "kinh tế")).toEqual([doiMoi]);
    expect(searchMilestones(all, "vi", "KINH TẾ")).toEqual([doiMoi]);
  });

  it("does not strip diacritics, so an ASCII-only query misses accented text", () => {
    // TODO: "kinh te" should arguably match "kinh tế" — no diacritic folding today.
    expect(searchMilestones(all, "vi", "kinh te")).toEqual([]);
  });

  it("requires every term to match (AND semantics)", () => {
    expect(searchMilestones(all, "en", "land boom")).toEqual([land]);
    expect(searchMilestones(all, "en", "land bitcoin")).toEqual([]);
  });

  it("searches description, insiderTip, pitfalls and date", () => {
    expect(searchMilestones(all, "en", "crypto")).toEqual([bitcoin]);
    expect(searchMilestones(all, "en", "hanoi")).toEqual([land]);
    expect(searchMilestones(all, "en", "bubble")).toEqual([land]);
    expect(searchMilestones(all, "en", "1986")).toEqual([doiMoi]);
  });

  it("falls back to English text when searching vi on a milestone with no vi title", () => {
    expect(searchMilestones(all, "vi", "bitcoin")).toEqual([bitcoin]);
  });

  it("ranks title matches above body matches, then by date ascending", () => {
    const bodyOnly = mk("body", { en: "Something else" }, { date: "1990", description: { en: "bitcoin mention" } });
    const titleLater = mk("title2", { en: "Bitcoin ETF" }, { date: "2024" });
    const results = searchMilestones([bodyOnly, titleLater, bitcoin], "en", "bitcoin").map((m) => m.id);
    expect(results).toEqual(["btc", "title2", "body"]);
  });

  it("does not mutate the input array", () => {
    const input = [land, bitcoin, doiMoi];
    const copy = [...input];
    searchMilestones(input, "en", "o");
    expect(input).toEqual(copy);
  });
});
