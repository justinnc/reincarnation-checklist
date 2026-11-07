import { notFound } from "next/navigation";
import { hasLocale, locales, t } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { countries, getCountry, getMilestones } from "@/lib/data";
import Timeline from "@/components/Timeline";

export async function generateStaticParams() {
  return locales.flatMap((lang) => countries.map((c) => ({ lang, country: c.code })));
}

export default async function CountryPage({ params }: PageProps<"/[lang]/[country]">) {
  const { lang, country } = await params;
  if (!hasLocale(lang)) notFound();
  const c = getCountry(country);
  if (!c) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {c.flag} {t(c.name, lang)}
      </h1>
      <Timeline milestones={getMilestones(country)} lang={lang} dict={dict.timeline} />
    </div>
  );
}

