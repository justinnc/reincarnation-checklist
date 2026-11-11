import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { allMilestones, countries } from "@/lib/data";
import { localeAlternates, SITE_URL } from "@/lib/seo";
import GlobalSearch from "@/components/GlobalSearch";

const COPY = {
  vi: {
    kicker: "Tìm xuyên 15 quốc gia",
    heading: "Tìm kiếm",
    intro: "Gõ một sự kiện, tên tài sản hoặc năm — kết quả gộp từ mọi quốc gia, không chỉ một nước.",
  },
  en: {
    kicker: "Search across all 15 countries",
    heading: "Search",
    intro: "Type an event, an asset name or a year — results are pooled from every country, not just one.",
  },
};

export async function generateMetadata({ params }: PageProps<"/[lang]/search">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const copy = COPY[lang];
  return {
    title: copy.heading,
    description: copy.intro,
    alternates: { canonical: `${SITE_URL}/${lang}/search`, languages: localeAlternates("/search") },
    openGraph: { images: [`/${lang}/opengraph-image`], title: copy.heading, description: copy.intro, url: `/${lang}/search` },
  };
}

export default async function SearchPage({ params }: PageProps<"/[lang]/search">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const copy = COPY[lang];

  return (
    <div className="space-y-8">
      <header className="max-w-2xl space-y-3">
        <div className="font-mono text-sm uppercase tracking-widest text-gold">{copy.kicker}</div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{copy.heading}</h1>
        <p className="text-lg text-muted">{copy.intro}</p>
      </header>
      <Suspense>
        <GlobalSearch milestones={allMilestones} countries={countries} lang={lang} />
      </Suspense>
    </div>
  );
}
