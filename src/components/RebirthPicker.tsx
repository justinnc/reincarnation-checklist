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
    <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-5 sm:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
      />
      <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <label className="relative inline-flex items-center">
            <span className="sr-only">Country</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="appearance-none rounded-full border border-line-strong bg-raised py-2 pl-4 pr-10 text-base font-medium text-ink hover:border-gold focus:border-gold focus:outline-none"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {t(c.name, lang)}
                </option>
              ))}
            </select>
            <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute right-4 h-4 w-4 text-muted">
              <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </label>
          <label htmlFor="year" className="mt-8 block text-lg text-muted">
            {dict.wakeUp}
          </label>
          <output
            htmlFor="year"
            className="block font-display text-[5.5rem] font-extrabold leading-none tracking-tighter text-gold tabular sm:text-9xl"
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
          <p className="mt-6 text-base sm:text-lg">
            <span className="font-mono text-3xl font-semibold tabular text-ink">{ahead.length}</span>{" "}
            <span className="text-muted">{dict.ahead}</span>
          </p>
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-medium uppercase tracking-wider text-faint">{dict.topAhead}</h2>
          <ol className="mt-4 space-y-3">
            {top.map((m, i) => (
              <li key={m.id}>
                <Link
                  href={`/${lang}/${m.country}/${m.id}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-raised p-3 transition-colors hover:border-gold sm:gap-4 sm:p-4"
                >
                  <span className="w-6 shrink-0 text-center font-display text-2xl font-extrabold text-faint sm:text-3xl">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-xs tabular text-gold">{m.date.slice(0, 4)}</span>
                    <span className="line-clamp-2 block font-medium leading-snug">{t(m.title, lang)}</span>
                  </span>
                  {(m.opportunity.returnMultiple ?? 0) > 1 ? (
                    <span className="shrink-0 rounded-md bg-gain px-2 py-0.5 font-mono text-sm font-semibold tabular text-on-gain">
                      {formatMultiple(m.opportunity.returnMultiple!, lang)}
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
