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
    <article className="group rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-line-strong sm:p-6">
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

      <div className="mt-5 rounded-xl bg-raised p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1.5 text-sm">
            {o.asset && <div className="font-mono text-xs text-gold">{o.asset}</div>}
            <div className="text-ink">{t(o.action, lang)}</div>
            <div className="text-muted">
              {dict.buyWhen}: <span className="text-ink">{t(o.buyWhen, lang)}</span>
            </div>
            {t(o.sellWhen, lang) && (
              <div className="text-muted">
                {dict.sellWhen}: <span className="text-ink">{t(o.sellWhen, lang)}</span>
              </div>
            )}
          </div>
          {o.returnMultiple ? (
            <div className="shrink-0 sm:text-right">
              {o.returnMultiple < 1 ? (
                <>
                  <DropBadge text={formatDrop(o.returnMultiple, lang)} label={dict.drop} />
                  <div className="mt-1 max-w-[14rem] text-xs text-danger">{dict.drop}</div>
                </>
              ) : (
                <>
                  <MultipleBadge text={formatMultiple(o.returnMultiple, lang)} />
                  <div className="mt-1 whitespace-nowrap font-mono text-xs tabular text-muted">
                    {formatMoney(country.stake.amount, country.stake.currency, lang)} →{" "}
                    <span className="text-gain">
                      {formatMoney(country.stake.amount * o.returnMultiple, country.stake.currency, lang)}
                    </span>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
        {!o.returnMultiple && (
          <div className="mt-3 border-t border-line pt-3 text-sm">
            <span className="text-muted">{dict.estimatedReturn}: </span>
            <span className="font-medium text-gain">{t(o.estimatedReturn, lang)}</span>
          </div>
        )}
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
