import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, locales, t } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { countries, countryStats, getCountry, getMilestones } from "@/lib/data";
import { formatMultiple } from "@/lib/format";
import { localeAlternates, SITE_URL } from "@/lib/seo";
import Timeline from "@/components/Timeline";
import MilestoneCard from "@/components/MilestoneCard";

export async function generateStaticParams() {
  return locales.flatMap((lang) => countries.map((c) => ({ lang, country: c.code })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[country]">): Promise<Metadata> {
  const { lang, country } = await params;
  const c = getCountry(country);
  if (!hasLocale(lang) || !c) return {};
  const s = countryStats(country);
  const name = t(c.name, lang);
  const description =
    lang === "vi"
      ? `${s.count} mốc lịch sử tài chính của ${name} từ ${s.from} đến ${s.to} — cơ hội làm giàu nếu bạn trọng sinh và biết trước.`
      : `${s.count} real financial milestones in ${name} from ${s.from} to ${s.to} — opportunities you'd know about if reincarnated.`;
  return {
    title: name,
    description,
    alternates: { canonical: `${SITE_URL}/${lang}/${country}`, languages: localeAlternates(`/${country}`) },
    openGraph: { images: ["/opengraph-image"], title: name, description, url: `/${lang}/${country}` },
  };
}

export default async function CountryPage({ params }: PageProps<"/[lang]/[country]">) {
  const { lang, country } = await params;
  if (!hasLocale(lang)) notFound();
  const c = getCountry(country);
  if (!c) notFound();
  const dict = await getDictionary(lang);
  const list = getMilestones(country);
  const s = countryStats(country);
  const cards = Object.fromEntries(list.map((m) => [m.id, <MilestoneCard key={m.id} m={m} lang={lang} dict={dict.timeline} country={c} />]));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-6xl">{c.flag}</div>
          <h1 className="mt-3 font-display text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">{t(c.name, lang)}</h1>
        </div>
        <dl className="grid min-w-0 grid-cols-3 gap-4 rounded-2xl border border-line bg-surface p-4 font-mono tabular sm:gap-6 sm:p-5">
          <div>
            <dt className="font-sans text-xs text-faint">{dict.timeline.count}</dt>
            <dd className="mt-1 text-xl font-semibold sm:text-2xl">{s.count}</dd>
          </div>
          <div>
            <dt className="font-sans text-xs text-faint">{dict.timeline.range}</dt>
            <dd className="mt-1 text-xl font-semibold text-gold sm:text-2xl">
              {s.from}–{s.to}
            </dd>
          </div>
          <div>
            <dt className="font-sans text-xs text-faint">{dict.timeline.best}</dt>
            <dd className="mt-1 min-w-0 truncate text-xl font-semibold text-gain sm:text-2xl">
              {s.best?.opportunity.returnMultiple ? formatMultiple(s.best.opportunity.returnMultiple, lang) : "—"}
            </dd>
          </div>
        </dl>
      </header>
      <Timeline milestones={list} lang={lang} dict={dict.timeline} cards={cards} />
    </div>
  );
}
