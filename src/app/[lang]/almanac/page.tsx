import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { getAlmanacItems } from "@/lib/almanac";
import { localeAlternates, SITE_URL } from "@/lib/seo";
import AlmanacExplorer from "@/components/AlmanacExplorer";

const COPY = {
  vi: {
    kicker: "Dành cho người viết truyện trọng sinh",
    heading: "Bảng giá theo năm",
    intro:
      "Giá cả Việt Nam qua từng năm, có nguồn trích dẫn — để viết đúng số liệu khi nhân vật của bạn trọng sinh về một năm cụ thể. Xếp hạng chất lượng A/B/C cho biết độ tin cậy của từng chuỗi dữ liệu.",
    selectLabel: "Chọn mặt hàng",
    quality: "Chất lượng",
    sources: "Nguồn",
    disclaimer:
      "Dữ liệu tổng hợp từ các nguồn công khai (xem mục Nguồn ở mỗi mục). Một số chuỗi (xếp hạng C) chỉ có vài mốc rời rạc, chưa phải số liệu liên tục theo năm — dùng để tham khảo, không phải số liệu thống kê chính thức.",
  },
  en: {
    kicker: "For trọng sinh (reborn-in-the-past) novel writers",
    heading: "Price Almanac",
    intro:
      "Vietnam prices year by year, with sources — so your reborn character spends the right amount of money for the year they land in. A/B/C quality ratings show how reliable each series is.",
    selectLabel: "Select item",
    quality: "Quality",
    sources: "Sources",
    disclaimer:
      "Data compiled from public sources (see Sources on each item). Some series (quality C) only have a few scattered data points, not a continuous year-by-year series — treat them as reference, not official statistics.",
  },
};

export async function generateMetadata({ params }: PageProps<"/[lang]/almanac">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const copy = COPY[lang];
  return {
    title: copy.heading,
    description: copy.intro,
    alternates: { canonical: `${SITE_URL}/${lang}/almanac`, languages: localeAlternates("/almanac") },
    openGraph: { images: ["/opengraph-image"], title: copy.heading, description: copy.intro, url: `/${lang}/almanac` },
  };
}

export default async function AlmanacPage({ params }: PageProps<"/[lang]/almanac">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const copy = COPY[lang];
  const items = getAlmanacItems("vn");

  return (
    <div className="space-y-8">
      <header className="max-w-2xl space-y-3">
        <div className="font-mono text-sm uppercase tracking-widest text-gold">{copy.kicker}</div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{copy.heading}</h1>
        <p className="text-lg text-muted">{copy.intro}</p>
      </header>
      <AlmanacExplorer items={items} lang={lang} dict={copy} />
      <p className="max-w-2xl text-xs text-faint">{copy.disclaimer}</p>
    </div>
  );
}
