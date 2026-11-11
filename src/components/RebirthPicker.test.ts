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
  it("does not promise future context when no milestones remain from the selected year", async () => {
    const html = await render();
    expect(html).toContain("No milestones from 2024");
    expect(html).not.toContain("Context milestones are still");
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
