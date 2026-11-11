import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

describe("BrandLogo", () => {
  it("renders the approved hourglass artwork shared by the browser icon", async () => {
    const iconPath = resolve("src/app/icon.svg");
    expect(existsSync(iconPath), "The approved SVG browser icon must exist").toBe(true);
    const { default: BrandLogo } = await import("./BrandLogo");
    const markup = renderToStaticMarkup(createElement(BrandLogo, { size: 32 }));
    const icon = readFileSync(iconPath, "utf8");
    const paths = [...icon.matchAll(/<path d="([^"]+)"/g)].map((match) => match[1]);
    expect(paths).toHaveLength(5);
    for (const path of paths) expect(markup).toContain(`d="${path}"`);
    expect(markup).toContain('width="32"');
    expect(markup).toContain('height="32"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('focusable="false"');
    expect(markup).toContain("#F4B740");
  });
});
