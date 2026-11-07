import Link from "next/link";
import { t, type Locale } from "@/lib/i18n";
import type { Country, Milestone } from "@/lib/types";
import type { Dictionary } from "@/lib/dictionaries";
import { formatDate, formatDrop, formatMoney, formatMultiple } from "@/lib/format";
import { DropBadge, MultipleBadge, RiskBadge, UnverifiedBadge } from "./Badges";
import CheckButton from "./CheckButton";

type Props = { m: Milestone; lang: Locale; dict: Dictionary["timeline"]; country: Country };

export default function MilestoneCard({ m, lang, dict, country }: Props) {
  const o = m.opportunity;
  const href = `/${lang}/${m.country}/${m.id}`;
  return (
    <article className="group rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong sm:p-6">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <time className="font-mono tabular text-gold">{formatDate(m.date, lang)}</time>
            <span className="text-faint">·</span>
            <span className="text-muted">{dict.categories[m.category]}</span>
            {!m.verified && <UnverifiedBadge label={dict.unverified} />}
          </div>
          <h3 className="mt-2 font-display text-xl font-bold leading-snug sm:text-2xl">
            <Link href={href} className="hover:text-gold">
              {t(m.title, lang)}
            </Link>
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{t(m.summary ?? m.description, lang)}</p>
        </div>
        <CheckButton id={m.id} label={dict.add} labelOn={dict.added} compact />
      </div>

      <div className="mt-5 grid gap-4 rounded-xl bg-raised p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)] sm:items-center">
        <div className="space-y-1 text-sm">
          {o.asset && <div className="font-mono text-xs uppercase tracking-wide text-faint">{o.asset}</div>}
          <div className="text-ink">{t(o.action, lang)}</div>
          <div className="text-muted">
            {dict.buyWhen}: <span className="text-ink">{t(o.buyWhen, lang)}</span>
            {o.sellWhen && (
              <>
                {" "}→ {dict.sellWhen}: <span className="text-ink">{t(o.sellWhen, lang)}</span>
              </>
            )}
          </div>
        </div>
        <div className="sm:text-right">
          {o.returnMultiple && o.returnMultiple < 1 ? (
            <>
              <DropBadge text={formatDrop(o.returnMultiple, lang)} label={dict.drop} />
              <div className="mt-1 text-xs text-danger">{dict.drop}</div>
            </>
          ) : o.returnMultiple ? (
            <>
              <MultipleBadge text={formatMultiple(o.returnMultiple, lang)} />
              <div className="mt-1 font-mono text-xs tabular text-muted">
                {formatMoney(country.stake.amount, country.stake.currency, lang)} →{" "}
                <span className="text-gain">
                  {formatMoney(country.stake.amount * o.returnMultiple, country.stake.currency, lang)}
                </span>
              </div>
            </>
          ) : (
            <div className="text-sm font-semibold leading-snug text-gain">{t(o.estimatedReturn, lang)}</div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {o.risk && <RiskBadge level={o.risk} label={dict.risk} levelLabel={dict.levels[o.risk]} />}
        {o.capital && <RiskBadge level={o.capital} label={dict.capital} levelLabel={dict.levels[o.capital]} />}
        <Link href={href} className="ml-auto text-sm font-medium text-muted hover:text-gold">
          {dict.readMore} →
        </Link>
      </div>
    </article>
  );
}
