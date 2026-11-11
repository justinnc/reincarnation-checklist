import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { allMilestones } from "@/lib/data";
import { formatPeriodLabel, getPlaybookCandidates } from "@/lib/whatif/playbook";
import { PlaybookOverlapNotice } from "./PlaybookBuilder";

const candidate = getPlaybookCandidates(allMilestones.filter((m) => m.country === "vn"))[0];

describe("playbook overlap warning", () => {
  it("names the selected trade excluded from the financial ledger", () => {
    const html = renderToStaticMarkup(createElement(PlaybookOverlapNotice, { lang: "en", skippedOverlaps: [candidate] }));
    expect(html).toContain("Excluded");
    expect(html).toContain(candidate.milestone.title.en);
    expect(html).toContain(formatPeriodLabel(candidate, "en"));
    expect(html).not.toContain(candidate.periodLabel);
  });

  it("uses Vietnamese copy for a Vietnamese playbook", () => {
    const html = renderToStaticMarkup(createElement(PlaybookOverlapNotice, { lang: "vi", skippedOverlaps: [candidate] }));
    expect(html).toContain("không được tính");
    expect(html).toContain(candidate.milestone.title.vi);
    expect(html).toContain(formatPeriodLabel(candidate, "vi"));
    expect(html).not.toContain(candidate.periodLabel);
  });
});
