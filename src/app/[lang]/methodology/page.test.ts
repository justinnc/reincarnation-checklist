import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MethodologyPage from "./page";

async function render(lang: "en" | "vi") {
  const page = await MethodologyPage({ params: Promise.resolve({ lang }) });
  return renderToStaticMarkup(page);
}

describe("methodology page", () => {
  it("renders transparency principles and correction link in English", async () => {
    const html = await render("en");
    expect(html).toContain("Methodology &amp; Data Corrections");
    expect(html).toContain("Source-Linked");
    expect(html).toContain("Agent-Checked");
    expect(html).toContain("github.com/justindang/reincarnation-checklist/issues/new");
  });

  it("renders transparency principles and correction link in Vietnamese", async () => {
    const html = await render("vi");
    expect(html).toContain("Phương pháp tính &amp; Tiếp nhận sửa đổi");
    expect(html).toContain("Có liên kết nguồn");
    expect(html).toContain("Đã kiểm toán biên tập");
    expect(html).toContain("github.com/justindang/reincarnation-checklist/issues/new");
  });
});
