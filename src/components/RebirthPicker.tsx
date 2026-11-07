"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { t, type Locale } from "@/lib/i18n";
import type { Country, Milestone } from "@/lib/types";
import { formatMultiple } from "@/lib/format";

type Props = {
  milestones: Milestone[];
  countries: Country[];
  lang: Locale;
  dict: { wakeUp: string; ahead: string; topAhead: string; seeAll: string };
  minYear: number;
  maxYear: number;
};

export default function RebirthPicker({ milestones, countries, lang, dict, minYear, maxYear }: Props) {
  const [year, setYear] = useState(Math.max(minYear, 1990));
  const [country, setCountry] = useState(countries[0].code);

  const ahead = useMemo(
    () => milestones.filter((m) => m.country === country && Number(m.date.slice(0, 4)) >= year),
    [milestones, country, year],
  );
  const top = useMemo(
    () =>
      [...ahead]
        .sort((a, b) => (b.opportunity.returnMultiple ?? 0) - (a.opportunity.returnMultiple ?? 0))
        .slice(0, 3),
    [ahead],
  );

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
      />
      <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="flex gap-2">
            {countries.map((c) => (
              <button
                key={c.code}
                type="button"
                aria-pressed={country === c.code}
                onClick={() => setCountry(c.code)}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  country === c.code ? "bg-ink font-medium text-bg" : "bg-raised text-muted hover:text-ink"
                }`}
              >
                {c.flag} {t(c.name, lang)}
              </button>
            ))}
          </div>
          <label htmlFor="year" className="mt-8 block text-lg text-muted">
            {dict.wakeUp}
          </label>
          <output
            htmlFor="year"
            className="block font-display text-8xl font-extrabold leading-none tracking-tighter text-gold tabular sm:text-9xl"
          >
            {year}
          </output>
          <input
            id="year"
            type="range"
            min={minYear}
            max={maxYear}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="mt-6 w-full accent-[#f4b740]"
          />
          <div className="mt-1 flex justify-between font-mono text-xs tabular text-faint">
            <span>{minYear}</span>
            <span>{maxYear}</span>
          </div>
          <p className="mt-6 text-lg">
            <span className="font-mono text-3xl font-semibold tabular text-ink">{ahead.length}</span>{" "}
            <span className="text-muted">{dict.ahead}</span>
          </p>
        </div>

        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-faint">{dict.topAhead}</h2>
          <ol className="mt-4 space-y-3">
            {top.map((m, i) => (
              <li key={m.id}>
                <Link
                  href={`/${lang}/${m.country}/${m.id}`}
                  className="flex items-center gap-4 rounded-xl border border-line bg-raised p-4 transition-colors hover:border-gold"
                >
                  <span className="font-display text-3xl font-extrabold text-faint">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-xs tabular text-gold">{m.date.slice(0, 4)}</span>
                    <span className="block truncate font-medium">{t(m.title, lang)}</span>
                  </span>
                  {m.opportunity.returnMultiple ? (
                    <span className="rounded-md bg-gain px-2 py-0.5 font-mono text-sm font-semibold tabular text-on-gain">
                      {formatMultiple(m.opportunity.returnMultiple, lang)}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ol>
          <Link href={`/${lang}/${country}`} className="mt-5 inline-block text-sm font-medium text-gold hover:underline">
            {dict.seeAll} →
          </Link>
        </div>
      </div>
    </div>
  );
}
