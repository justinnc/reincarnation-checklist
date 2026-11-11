import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { getAllAlmanacItems } from "@/lib/almanac-data";
import { countries, getMilestones } from "@/lib/data";
import { localeAlternates, SITE_URL } from "@/lib/seo";
import AlmanacExplorer, { type AlmanacMilestone } from "@/components/AlmanacExplorer";

const COPY = {
  vi: {
    kicker: "Vật giá qua từng năm",
    heading: "Bảng giá theo năm",
    intro:
      "Giá cả qua từng năm ở nhiều quốc gia, có nguồn trích dẫn — để viết đúng số liệu khi nhân vật của bạn trọng sinh về một năm, một đất nước cụ thể. Xếp hạng chất lượng A/B/C cho biết độ tin cậy của từng chuỗi dữ liệu.",
    selectLabel: "Chọn mặt hàng",
    countryLabel: "Quốc gia",
    quality: "Chất lượng",
    sources: "Nguồn",
    disclaimer:
      "Dữ liệu tổng hợp từ các nguồn công khai (xem mục Nguồn ở mỗi mục). Một số chuỗi (xếp hạng C) chỉ có vài mốc rời rạc, chưa phải số liệu liên tục theo năm — dùng để tham khảo, không phải số liệu thống kê chính thức. Năm không có số liệu được nội suy (đánh dấu ~).",
  },
  en: {
    kicker: "What things cost, year by year",
    heading: "Price Almanac",
    intro:
      "Prices year by year across many countries, with sources — so your reborn character spends the right amount of money for the year and country they land in. A/B/C quality ratings show how reliable each series is.",
    selectLabel: "Select item",
    countryLabel: "Country",
    quality: "Quality",
    sources: "Sources",
    disclaimer:
      "Data compiled from public sources (see Sources on each item). Some series (quality C) only have a few scattered data points, not a continuous year-by-year series — treat them as reference, not official statistics. Years without data are interpolated (marked ~).",
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
  const items = getAllAlmanacItems();
  const withData = new Set(items.map((i) => i.country));
  const almanacCountries = countries
    .filter((c) => withData.has(c.code))
    .map((c) => ({ code: c.code, name: c.name, flag: c.flag, stake: c.stake }));
  // Slim milestone payload: only what the explorer renders.
  const milestones: AlmanacMilestone[] = almanacCountries.flatMap((c) =>
    getMilestones(c.code).map((m) => ({
      id: m.id,
      country: m.country,
      date: m.date,
      title: m.title,
      returnMultiple: m.opportunity.returnMultiple,
    })),
  );

  return (
    <div className="space-y-8">
      <header className="max-w-2xl space-y-3">
        <div className="font-mono text-sm uppercase tracking-widest text-gold">{copy.kicker}</div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{copy.heading}</h1>
        <p className="text-lg text-muted">{copy.intro}</p>
      </header>
      <Suspense>
        <AlmanacExplorer items={items} countries={almanacCountries} milestones={milestones} lang={lang} dict={copy} />
      </Suspense>
      <p className="max-w-2xl text-xs text-faint">{copy.disclaimer}</p>
    </div>
  );
}
