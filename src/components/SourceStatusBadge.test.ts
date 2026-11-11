import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SourceLinksBadge } from "./Badges";

function render(count: number, lang: "en" | "vi") {
  return renderToStaticMarkup(createElement(SourceLinksBadge, { count, lang }));
}

describe("source-links badge", () => {
  it("shows the actual count even when a record's legacy verified flag is false", () => {
    expect(render(4, "en")).toContain("4 source links");
    expect(render(4, "en")).toContain("not a claim-level check");
  });

  it("distinguishes zero links and localizes the count in Vietnamese", () => {
    expect(render(0, "en")).toContain("No source links");
    expect(render(4, "vi")).toContain("4 liên kết nguồn");
  });
});
