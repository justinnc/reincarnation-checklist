import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, t } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { countries, countMilestones } from "@/lib/data";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">{dict.home.heading}</h1>
        <p className="max-w-2xl text-lg opacity-75">{dict.home.intro}</p>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-60">
          {dict.home.chooseCountry}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {countries.map((c) => (
            <Link
              key={c.code}
              href={`/${lang}/${c.code}`}
              className="rounded-xl border border-white/10 bg-white/5 p-6 transition hover:border-amber-400/60 hover:bg-white/10"
            >
              <div className="text-4xl">{c.flag}</div>
              <div className="mt-3 text-xl font-semibold">{t(c.name, lang)}</div>
              <div className="text-sm opacity-60">
                {countMilestones(c.code)} {dict.home.milestones}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

