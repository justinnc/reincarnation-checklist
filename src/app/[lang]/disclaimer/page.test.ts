import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import DisclaimerPage from "./page";

async function render(lang: "en" | "vi") {
  const page = await DisclaimerPage({ params: Promise.resolve({ lang }) } as Parameters<typeof DisclaimerPage>[0]);
  return renderToStaticMarkup(page);
}

describe("disclaimer source-status copy", () => {
  it("describes link counts without claiming source validation in English", async () => {
    const html = await render("en");
    expect(html).toContain("source-link count");
    expect(html).not.toContain("marked &#x27;Unverified&#x27;");
  });

  it("uses the same distinction in Vietnamese", async () => {
    const html = await render("vi");
    expect(html).toContain("Số liên kết nguồn");
    expect(html).not.toContain("đánh dấu &#x27;Chưa kiểm chứng&#x27;");
  });
});
