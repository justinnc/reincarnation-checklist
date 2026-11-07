import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, locales, t } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { countries, countryStats, getCountry, getMilestones } from "@/lib/data";
import { formatMultiple } from "@/lib/format";
import Timeline from "@/components/Timeline";
import MilestoneCard from "@/components/MilestoneCard";
import ChecklistProgress from "@/components/ChecklistProgress";

export async function generateStaticParams() {
  return locales.flatMap((lang) => countries.map((c) => ({ lang, country: c.code })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[country]">): Promise<Metadata> {
  const { lang, country } = await params;
  const c = getCountry(country);
  if (!hasLocale(lang) || !c) return {};
  return { title: t(c.name, lang) };
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
          <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight sm:text-6xl">{t(c.name, lang)}</h1>
          <div className="mt-4">
            <ChecklistProgress ids={list.map((m) => m.id)} label={dict.timeline.progress} />
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-6 rounded-2xl border border-line bg-surface p-5 font-mono tabular">
          <div>
            <dt className="font-sans text-xs text-faint">{dict.timeline.count}</dt>
            <dd className="mt-1 text-2xl font-semibold">{s.count}</dd>
          </div>
          <div>
            <dt className="font-sans text-xs text-faint">{dict.timeline.range}</dt>
            <dd className="mt-1 text-xl font-semibold text-gold sm:text-2xl">
              {s.from}–{s.to}
            </dd>
          </div>
          <div>
            <dt className="font-sans text-xs text-faint">{dict.timeline.best}</dt>
            <dd className="mt-1 text-2xl font-semibold text-gain">
              {s.best?.opportunity.returnMultiple ? formatMultiple(s.best.opportunity.returnMultiple, lang) : "—"}
            </dd>
          </div>
        </dl>
      </header>
      <Timeline milestones={list} lang={lang} dict={dict.timeline} cards={cards} />
    </div>
  );
}
