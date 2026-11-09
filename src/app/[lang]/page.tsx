import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, t } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { allMilestones, countries, countryStats, getCountry, yearOf } from "@/lib/data";
import { formatMoney, formatMultiple } from "@/lib/format";
import RebirthPicker from "@/components/RebirthPicker";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const years = allMilestones.map(yearOf);
  const biggest = allMilestones
    .filter((m) => (m.opportunity.returnMultiple ?? 0) > 1 && m.verified)
    .sort((a, b) => b.opportunity.returnMultiple! - a.opportunity.returnMultiple!)
    .slice(0, 10);

  return (
    <div className="space-y-14 sm:space-y-20">
      <section className="space-y-8">
        <div className="max-w-3xl space-y-4">
          <div className="font-mono text-sm uppercase tracking-widest text-gold">{dict.home.kicker}</div>
          <h1 className="text-balance font-display text-[2.6rem] font-extrabold leading-[1.1] tracking-tight sm:text-7xl sm:leading-[1.05]">{dict.home.heading}</h1>
          <p className="text-lg leading-relaxed text-muted">{dict.home.intro}</p>
        </div>
        <RebirthPicker
          milestones={allMilestones}
          countries={countries}
          lang={lang}
          dict={dict.home}
          minYear={Math.min(...years)}
          maxYear={Math.max(...years)}
        />
      </section>

      {biggest.length > 0 && (
        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{dict.home.biggest}</h2>
            <p className="hidden text-sm text-faint sm:block">{dict.home.biggestNote}</p>
          </div>
          <div className="mt-6 overflow-hidden rounded-2xl border border-line">
            <table className="w-full text-left text-sm">
              <tbody>
                {biggest.map((m, i) => {
                  const c = getCountry(m.country)!;
                  return (
                    <tr key={m.id} className="border-b border-line bg-surface last:border-0 hover:bg-raised">
                      <td className="w-10 py-4 pl-4 align-top font-display text-xl font-extrabold text-faint sm:w-12 sm:pl-5 sm:align-middle">{i + 1}</td>
                      <td className="hidden w-16 py-4 font-mono tabular text-gold sm:table-cell">{m.date.slice(0, 4)}</td>
                      <td className="py-4 pr-3 sm:pr-4">
                        <Link href={`/${lang}/${m.country}/${m.id}`} className="font-medium hover:text-gold">
                          {c.flag} {t(m.title, lang)}
                        </Link>
                        <div className="mt-0.5 text-xs text-faint">
                          <span className="font-mono text-gold sm:hidden">{m.date.slice(0, 4)} · </span>
                          {t(m.opportunity.asset, lang)}
                        </div>
                      </td>
                      <td className="hidden py-4 pr-4 text-right font-mono text-xs tabular text-muted md:table-cell">
                        {formatMoney(c.stake.amount, c.stake.currency, lang)} →{" "}
                        <span className="text-gain">{formatMoney(c.stake.amount * m.opportunity.returnMultiple!, c.stake.currency, lang)}</span>
                      </td>
                      <td className="py-4 pr-4 text-right align-top sm:pr-5 sm:align-middle">
                        <span className="rounded-md bg-gain px-2 py-0.5 font-mono font-semibold tabular text-on-gain">
                          {formatMultiple(m.opportunity.returnMultiple!, lang)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section id="countries" className="scroll-mt-8">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">{dict.home.countries}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((c) => {
            const s = countryStats(c.code);
            return (
              <Link
                key={c.code}
                href={`/${lang}/${c.code}`}
                className="group rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-gold"
              >
                <div className="flex items-start justify-between">
                  <span className="text-4xl">{c.flag}</span>
                  <span className="font-mono text-sm tabular text-gold">
                    {s.from}–{s.to}
                  </span>
                </div>
                <div className="mt-4 font-display text-2xl font-bold group-hover:text-gold">{t(c.name, lang)}</div>
                <div className="mt-1 text-sm text-muted">
                  <span className="font-mono tabular text-ink">{s.count}</span> {dict.home.milestones} ·{" "}
                  <span className="font-mono tabular text-ink">{s.verified}</span> {dict.home.verified}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-8 rounded-3xl border border-line bg-surface p-6 md:grid-cols-[1fr_1.4fr] md:gap-10 md:p-12">
        <div>
          <h2 className="font-display text-3xl font-bold">{dict.home.how}</h2>
          <Link href={`/${lang}/quiz`} className="mt-6 inline-block rounded-full bg-gold px-5 py-2.5 font-semibold text-on-gold hover:brightness-110">
            {dict.home.playQuiz} →
          </Link>
        </div>
        <ol className="space-y-4">
          {dict.home.steps.map((s, i) => (
            <li key={i} className="flex gap-4">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-gold font-mono text-xs text-gold">
                {i + 1}
              </span>
              <span className="text-base sm:text-lg">{s}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
