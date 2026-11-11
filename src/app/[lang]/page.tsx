import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, t } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { allMilestones, countries, countryStats, getCountry, yearOf, allMilestonesLite, rankListedReturns } from "@/lib/data";
import { formatMoney, formatMultiple } from "@/lib/format";
import RebirthPicker from "@/components/RebirthPicker";
import { Reveal } from "@/components/Reveal";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const years = allMilestones.map(yearOf);
  const biggest = rankListedReturns(allMilestones);

  return (
    <div className="space-y-14 sm:space-y-20">
      <section className="space-y-8">
        <div className="max-w-3xl space-y-4">
          <div className="animate-fade-up animate-fade-up-1 font-mono text-sm uppercase tracking-widest text-gold">{dict.home.kicker}</div>
          <h1 className="animate-fade-up animate-fade-up-2 text-balance font-display text-[2.6rem] font-extrabold leading-[1.1] tracking-tight sm:text-7xl sm:leading-[1.05]">{dict.home.heading}</h1>
          <p className="animate-fade-up animate-fade-up-3 text-lg leading-relaxed text-muted">{dict.home.intro}</p>
          <div className="animate-fade-up animate-fade-up-3 flex flex-wrap items-center gap-3">
            <a
              href="#rebirth-picker"
              className="inline-flex items-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-on-gold transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              {lang === "vi" ? "Chọn năm bắt đầu ↓" : "Choose your starting year ↓"}
            </a>
            <Link
              href={`/${lang}/survival`}
              data-testid="hero-survival-link"
              className="inline-flex items-center gap-2 rounded-full border border-gold/60 px-5 py-3 text-sm font-semibold text-gold transition hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <span aria-hidden>🎲</span>
              {lang === "vi" ? "Chơi Thử Thách Sống Sót (60s)" : "Play the Survival game (60s)"}
            </Link>
          </div>
        </div>
        <div id="rebirth-picker" className="animate-fade-up animate-fade-up-3 scroll-mt-20">
          <RebirthPicker
            milestones={allMilestonesLite}
            countries={countries}
            lang={lang}
            dict={dict.home}
            minYear={Math.min(...years)}
            maxYear={Math.max(...years)}
          />
        </div>
      </section>

      {/* Minigame Survival Callout */}
      <section className="rounded-3xl border border-gold/30 bg-gradient-to-r from-surface via-surface to-raised p-6 shadow-xl sm:p-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-gold">
              <span>🎲</span>
              <span>{lang === "vi" ? "MINIGAME MỚI" : "NEW MINIGAME"}</span>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {lang === "vi"
                ? "Thử Thách Sống Sót Kiếp Trọng Sinh"
                : "Reincarnation Survival Challenge"}
            </h2>
            <p className="max-w-xl text-sm text-muted">
              {lang === "vi"
                ? "Bốc thăm ngẫu nhiên một kiếp sống với $1.000. Bạn phải vượt qua 5 ngã rẽ lịch sử: đâu là mỏ vàng để tất tay, đâu là cạm bẫy huỷ diệt tài sản?"
                : "Roll a random life with $1,000. Can you navigate 5 historical turning points — knowing when to go all-in and when to dodge deadly crashes?"}
            </p>
          </div>
          <Link
            href={`/${lang}/survival`}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gold bg-gold px-6 py-3.5 text-sm font-bold text-on-gold shadow-lg shadow-gold/20 transition hover:brightness-110"
          >
            <span>🎲</span>
            <span>{lang === "vi" ? "Chơi thử ngay (60s) →" : "Play Run Now (60s) →"}</span>
          </Link>
        </div>
      </section>

      {biggest.length > 0 && (
        <section>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{dict.home.biggest}</h2>
            <p className="text-sm text-faint">{dict.home.biggestNote}</p>
          </div>
          <div className="mt-6 overflow-hidden rounded-2xl border border-line">
            <table className="w-full text-left text-sm">
              <tbody>
                {biggest.map((m, i) => {
                  const c = getCountry(m.country)!;
                  const span = `${m.date.slice(0, 4)}→${m.opportunity.exitDate?.slice(0, 4) ?? "?"}`;
                  return (
                    <Reveal key={m.id} as="tr" index={i} className="border-b border-line bg-surface last:border-0 hover:bg-raised">
                      <td className="w-10 py-4 pl-4 align-top font-display text-xl font-extrabold text-faint sm:w-12 sm:pl-5 sm:align-middle">{i + 1}</td>
                      <td className="hidden w-28 py-4 font-mono text-sm tabular text-gold sm:table-cell">{span}</td>
                      <td className="py-4 pr-3 sm:pr-4">
                        <Link href={`/${lang}/${m.country}/${m.id}`} className="font-medium hover:text-gold">
                          {c.flag} {t(m.title, lang)}
                        </Link>
                        <div className="mt-0.5 text-xs text-faint">
                          <span className="font-mono text-gold sm:hidden">{span} · </span>
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
                        {m.opportunity.exitAtPeak && (
                          <div className="mt-1 whitespace-nowrap text-[11px] text-warning" data-testid="exit-at-peak">
                            {lang === "vi" ? "bán tại đỉnh" : "sold at peak"}
                          </div>
                        )}
                      </td>
                    </Reveal>
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
          {countries.map((c, i) => {
            const s = countryStats(c.code);
            return (
              <Reveal key={c.code} index={i}>
                <Link
                  href={`/${lang}/${c.code}`}
                  className="group block rounded-2xl border border-line bg-surface p-6 transition-all duration-200 hover:-translate-y-1 hover:border-gold"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-4xl transition-transform duration-200 group-hover:scale-110">{c.flag}</span>
                    <span className="font-mono text-sm tabular text-gold">
                      {s.from}–{s.to}
                    </span>
                  </div>
                  <div className="mt-4 font-display text-2xl font-bold group-hover:text-gold">{t(c.name, lang)}</div>
                  <div className="mt-1 text-sm text-muted">
                    <span className="font-mono tabular text-ink">{s.count}</span> {dict.home.milestones} ·{" "}
                    <span className="font-mono tabular text-ink">{s.sourceLinked}</span> {dict.home.verified}
                  </div>
                </Link>
              </Reveal>
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
