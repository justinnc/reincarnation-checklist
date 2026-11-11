import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import en from "@/dictionaries/en.json";
import vi from "@/dictionaries/vi.json";
import { getCountry, getMilestone } from "@/lib/data";
import MilestoneCard from "./MilestoneCard";

const milestone = getMilestone("us", "us-martha-stewart-imclone-insider-trading-2001")!;
const country = getCountry("us")!;

describe("milestone source status", () => {
  it("shows four listed links even when the legacy flag is false", () => {
    expect(milestone.verified).toBe(false);
    const html = renderToStaticMarkup(createElement(MilestoneCard, { m: milestone, country, lang: "en", dict: en.timeline }));
    expect(html).toContain("4 source links");
    expect(html).not.toContain("Source status unconfirmed");
  });

  it("localizes the factual count without marking a claim checked", () => {
    const html = renderToStaticMarkup(createElement(MilestoneCard, { m: milestone, country, lang: "vi", dict: vi.timeline }));
    expect(html).toContain("4 liên kết nguồn");
    expect(html).not.toContain("Có từ 2 nguồn");
  });
});
