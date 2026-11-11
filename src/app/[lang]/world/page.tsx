import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { countries, allMilestonesLite } from "@/lib/data";
import { localeAlternates, SITE_URL } from "@/lib/seo";
import WorldYearExplorer from "@/components/WorldYearExplorer";

const COPY = {
  vi: {
    kicker: "Trọng sinh biết trước cả thế giới",
    heading: "Thế giới theo năm",
    intro:
      "Chọn một năm, xem TẤT CẢ mốc lịch sử ở 15 quốc gia rơi vào năm đó cùng lúc — hữu ích khi nhân vật của bạn biết trước những gì sắp xảy ra khắp nơi, không chỉ một nước.",
  },
  en: {
    kicker: "A time traveller knows the whole world",
    heading: "World by Year",
    intro:
      "Pick a year and see EVERY milestone across all 15 countries that falls in it at once — useful when your character knows what's coming everywhere, not just one country.",
  },
};

export async function generateMetadata({ params }: PageProps<"/[lang]/world">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const copy = COPY[lang];
  return {
    title: copy.heading,
    description: copy.intro,
    alternates: { canonical: `${SITE_URL}/${lang}/world`, languages: localeAlternates("/world") },
    openGraph: { images: [`/${lang}/opengraph-image`], title: copy.heading, description: copy.intro, url: `/${lang}/world` },
  };
}

export default async function WorldPage({ params }: PageProps<"/[lang]/world">) {
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
        <WorldYearExplorer milestones={allMilestonesLite} countries={countries} lang={lang} />
      </Suspense>
    </div>
  );
}
