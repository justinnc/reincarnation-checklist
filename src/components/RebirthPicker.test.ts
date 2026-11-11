import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RebirthPicker, { pickerEmptyMessage } from "./RebirthPicker";
import { allMilestonesLite, countries } from "@/lib/data";
import en from "@/dictionaries/en.json";

function render(milestones = allMilestonesLite.filter((m) => m.country === "us" && Number(m.date.slice(0, 4)) < 2024)) {
  return renderToStaticMarkup(createElement(RebirthPicker, {
    milestones,
    countries,
    lang: "en",
    dict: en.home,
    minYear: 2024,
    maxYear: 2024,
  }));
}

describe("RebirthPicker empty states", () => {
  it("keeps the slider inside the country's data instead of showing an empty future year", async () => {
    const html = await render();
    // US data in this fixture ends in 2023, so a requested 2024 is clamped to 2023.
    expect(html).toContain('max="2023"');
    expect(html).not.toContain("No milestones from 2024");
    expect(html).not.toContain("Context milestones are still");
    expect(html).toContain("1</span> <span class=\"text-muted\">milestone from this year onward");
  });

  it("hides the compounding CTA when nothing can be chained", async () => {
    const html = await render();
    expect(html).not.toContain("Build compounding chain");
    expect(html).toContain("try an earlier year");
  });

  it("still words the no-milestones message for an empty year", () => {
    expect(pickerEmptyMessage("en", "gain", 2024, 0, 0)).toContain("No milestones from 2024");
  });

  it("mentions remaining context only when unpriced milestones exist from the selected year", async () => {
    const past = allMilestonesLite.find((m) => m.country === "us")!;
    const html = await render([{ ...past, date: "2024-01", opportunity: { ...past.opportunity, returnMultiple: undefined } }]);
    expect(html).toContain("Context milestones from 2024");
  });

  it("does not invent context when the trap tab is empty but only gains remain", () => {
    const message = pickerEmptyMessage("en", "trap", 2024, 1, 0);
    expect(message).toContain("No listed trap multiples from 2024");
    expect(message).not.toContain("Context milestones");
    expect(message).not.toContain("priced traps");
  });

  it("uses truthful Vietnamese copy for an empty tab without future context", () => {
    const message = pickerEmptyMessage("vi", "trap", 2024, 1, 0);
    expect(message).toContain("không có hệ số");
    expect(message).not.toContain("Các mốc bối cảnh");
  });
});
