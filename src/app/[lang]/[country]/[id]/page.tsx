import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, locales, t } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { allMilestones, getCountry, getMilestone, getMilestones } from "@/lib/data";
import { formatDate, formatMoney, formatMultiple } from "@/lib/format";
import { MultipleBadge, RiskBadge, UnverifiedBadge } from "@/components/Badges";
import CheckButton from "@/components/CheckButton";

export async function generateStaticParams() {
  return locales.flatMap((lang) => allMilestones.map((m) => ({ lang, country: m.country, id: m.id })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[country]/[id]">): Promise<Metadata> {
  const { lang, country, id } = await params;
  const m = getMilestone(country, id);
  if (!hasLocale(lang) || !m) return {};
  return { title: t(m.title, lang), description: t(m.summary ?? m.description, lang) };
}

function Block({ title, children, tone = "default" }: { title: string; children: React.ReactNode; tone?: "default" | "gold" | "danger" }) {
  const border = tone === "gold" ? "border-gold/50" : tone === "danger" ? "border-danger/40" : "border-line";
  const head = tone === "gold" ? "text-gold" : tone === "danger" ? "text-danger" : "text-faint";
  return (
    <section className={`rounded-2xl border ${border} bg-surface p-6`}>
      <h2 className={`text-xs font-semibold uppercase tracking-wider ${head}`}>{title}</h2>
      <div className="mt-3 text-[17px] leading-relaxed">{children}</div>
    </section>
  );
}

export default async function MilestonePage({ params }: PageProps<"/[lang]/[country]/[id]">) {
  const { lang, country, id } = await params;
  if (!hasLocale(lang)) notFound();
  const c = getCountry(country);
  const m = getMilestone(country, id);
  if (!c || !m) notFound();
  const dict = await getDictionary(lang);
  const d = dict.detail;
  const tl = dict.timeline;
  const o = m.opportunity;
  const list = getMilestones(country);
  const i = list.findIndex((x) => x.id === m.id);
  const prev = list[i - 1];
  const next = list[i + 1];
  const cur = o.priceCurrency ?? (country === "us" ? "USD" : undefined);
  const price = (v: number) =>
    cur && cur !== "points" ? formatMoney(v, cur, lang) : new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US").format(v);

  return (
    <article className="space-y-10">
      <Link href={`/${lang}/${country}`} className="inline-block text-sm text-muted hover:text-gold">
        ← {d.back}
      </Link>

      <header className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span>{c.flag}</span>
            <time className="font-mono tabular text-gold">{formatDate(m.date, lang)}</time>
            <span className="text-muted">{tl.categories[m.category]}</span>
            {m.verified ? (
              <span className="rounded-md border border-gain/40 px-2 py-0.5 text-xs text-gain">{tl.verified}</span>
            ) : (
              <UnverifiedBadge label={tl.unverified} />
            )}
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            {t(m.title, lang)}
          </h1>
          {m.summary && <p className="mt-4 max-w-2xl text-xl text-muted">{t(m.summary, lang)}</p>}
        </div>
        <div className="flex flex-col items-start gap-3 lg:items-end">
          {o.returnMultiple ? <MultipleBadge text={formatMultiple(o.returnMultiple, lang)} large /> : null}
          <CheckButton id={m.id} label={tl.add} labelOn={tl.added} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Block title={d.story}>{t(m.description, lang)}</Block>
          {m.insiderTip && (
            <Block title={d.insider} tone="gold">
              {t(m.insiderTip, lang)}
            </Block>
          )}
          {m.pitfalls && (
            <Block title={d.pitfalls} tone="danger">
              {t(m.pitfalls, lang)}
            </Block>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-faint">{tl.opportunity}</h2>
            {o.asset && <div className="mt-3 font-mono text-sm text-gold">{o.asset}</div>}
            <p className="mt-2 text-lg">{t(o.action, lang)}</p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-t border-line pt-3">
                <dt className="shrink-0 whitespace-nowrap text-faint">{tl.buyWhen}</dt>
                <dd className="text-right">{t(o.buyWhen, lang)}</dd>
              </div>
              {o.sellWhen && (
                <div className="flex justify-between gap-4 border-t border-line pt-3">
                  <dt className="shrink-0 whitespace-nowrap text-faint">{tl.sellWhen}</dt>
                  <dd className="text-right">{t(o.sellWhen, lang)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 border-t border-line pt-3">
                <dt className="shrink-0 whitespace-nowrap text-faint">{tl.estimatedReturn}</dt>
                <dd className="text-right font-semibold text-gain">{t(o.estimatedReturn, lang)}</dd>
              </div>
              {o.entryPrice != null && (
                <div className="flex justify-between gap-4 border-t border-line pt-3 font-mono tabular">
                  <dt className="shrink-0 whitespace-nowrap font-sans text-faint">{d.entry}</dt>
                  <dd>{price(o.entryPrice)}</dd>
                </div>
              )}
              {o.exitPrice != null && (
                <div className="flex justify-between gap-4 border-t border-line pt-3 font-mono tabular">
                  <dt className="shrink-0 whitespace-nowrap font-sans text-faint">
                    {d.exit} {o.exitDate && <span className="text-xs">({o.exitDate})</span>}
                  </dt>
                  <dd>{price(o.exitPrice)}</dd>
                </div>
              )}
            </dl>
            {o.returnMultiple ? (
              <div className="mt-5 rounded-xl bg-raised p-4 text-sm">
                <span className="text-muted">
                  {formatMoney(c.stake.amount, c.stake.currency, lang)} {tl.whatIf} {tl.becomes}
                </span>
                <div className="mt-1 font-mono text-2xl font-semibold tabular text-gain">
                  {formatMoney(c.stake.amount * o.returnMultiple, c.stake.currency, lang)}
                </div>
              </div>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              {o.risk && <RiskBadge level={o.risk} label={tl.risk} levelLabel={tl.levels[o.risk]} />}
              {o.capital && <RiskBadge level={o.capital} label={tl.capital} levelLabel={tl.levels[o.capital]} />}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-6 text-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-faint">{tl.sources}</h2>
            <ul className="mt-3 space-y-2">
              {m.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-muted underline decoration-line-strong underline-offset-4 hover:text-gold">
                    {s.title} ↗
                  </a>
                </li>
              ))}
            </ul>
            {m.verifiedNote && (
              <p className="mt-4 border-t border-line pt-3 text-xs text-faint">
                {d.note}: {m.verifiedNote}
              </p>
            )}
          </section>

          {m.quiz && (
            <Link
              href={`/${lang}/quiz`}
              className="block rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-gold"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-gold">{d.test}</div>
              <p className="mt-2 font-medium">{t(m.quiz.question, lang)}</p>
            </Link>
          )}
        </aside>
      </div>

      <nav className="grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
        {prev ? (
          <Link href={`/${lang}/${country}/${prev.id}`} className="rounded-2xl border border-line p-5 hover:border-gold">
            <div className="text-xs text-faint">← {d.prev} · <span className="font-mono">{prev.date.slice(0, 4)}</span></div>
            <div className="mt-1 font-medium">{t(prev.title, lang)}</div>
          </Link>
        ) : <span />}
        {next && (
          <Link href={`/${lang}/${country}/${next.id}`} className="rounded-2xl border border-line p-5 text-right hover:border-gold">
            <div className="text-xs text-faint"><span className="font-mono">{next.date.slice(0, 4)}</span> · {d.next} →</div>
            <div className="mt-1 font-medium">{t(next.title, lang)}</div>
          </Link>
        )}
      </nav>
    </article>
  );
}
