import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { allMilestones, countries } from "@/lib/data";
import { localeAlternates, SITE_URL } from "@/lib/seo";
import CharmView from "@/components/CharmView";

const COPY = {
  vi: {
    kicker: "Tờ giấy nhớ mang về quá khứ",
    heading: "🧿 Bùa Trọng Sinh của bạn",
    intro:
      "Danh sách các cột mốc mua – bán và các phốt sập hầm bạn đã đánh dấu. Xếp theo thứ tự thời gian để in ra 1 trang giấy bỏ túi hoặc chia sẻ.",
  },
  en: {
    kicker: "Pocket Time-Travel Cheat Sheet",
    heading: "🧿 Your Reincarnation Cheat Sheet",
    intro:
      "Your personal chronological checklist of wealth multipliers to buy and market scandals to avoid. Print on one page or share via link.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const copy = COPY[lang];
  return {
    title: copy.heading,
    description: copy.intro,
    alternates: { canonical: `${SITE_URL}/${lang}/charm`, languages: localeAlternates("/charm") },
    openGraph: { images: ["/opengraph-image"], title: copy.heading, description: copy.intro, url: `/${lang}/charm` },
  };
}

export default async function CharmPage({ params }: { params: Promise<{ lang: string }> }) {
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
        <CharmView lang={lang} milestones={allMilestones} countries={countries} />
      </Suspense>
    </div>
  );
}
