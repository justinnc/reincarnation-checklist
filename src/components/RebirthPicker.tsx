"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { t, type Locale } from "@/lib/i18n";
import type { Country, Milestone } from "@/lib/types";
import { formatDrop, formatMultiple } from "@/lib/format";
import { addCharmIds } from "@/lib/charm";

type Props = {
  milestones: Milestone[];
  countries: Country[];
  lang: Locale;
  dict: { wakeUp: string; ahead: string; topAhead: string; seeAll: string };
  minYear: number;
  maxYear: number;
};

const LOW_DATA_THRESHOLD = 15;

export default function RebirthPicker({ milestones, countries, lang, dict, minYear, maxYear }: Props) {
  const [year, setYear] = useState(Math.max(minYear, 1995));
  const [country, setCountry] = useState(() => (lang === "en" ? "us" : countries[0].code));
  const [tab, setTab] = useState<"gain" | "trap">("gain");
  const [savedToast, setSavedToast] = useState(false);
  const reduceMotion = useReducedMotion();

  const countByCountry = useMemo(() => {
    const m = new Map<string, number>();
    for (const item of milestones) m.set(item.country, (m.get(item.country) ?? 0) + 1);
    return m;
  }, [milestones]);
  const activeCountryCount = countByCountry.get(country) ?? 0;

  const ahead = useMemo(
    () => milestones.filter((m) => m.country === country && Number(m.date.slice(0, 4)) >= year),
    [milestones, country, year],
  );

  const gainsAhead = useMemo(
    () =>
      ahead
        .filter((m) => (m.opportunity.returnMultiple ?? 0) > 1)
        .sort((a, b) => (b.opportunity.returnMultiple ?? 0) - (a.opportunity.returnMultiple ?? 0)),
    [ahead],
  );

  const trapsAhead = useMemo(
    () =>
      ahead
        .filter((m) => (m.opportunity.returnMultiple ?? 1) < 1)
        .sort((a, b) => (a.opportunity.returnMultiple ?? 1) - (b.opportunity.returnMultiple ?? 1)),
    [ahead],
  );

  const activeList = (tab === "gain" ? gainsAhead : trapsAhead).slice(0, 3);

  const handleSaveTop3 = () => {
    if (activeList.length === 0) return;
    addCharmIds(activeList.map((m) => m.id));
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

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
                  {c.flag} {t(c.name, lang)} ({countByCountry.get(c.code) ?? 0})
                </option>
              ))}
            </select>
            <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute right-4 h-4 w-4 text-muted">
              <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </label>
          {activeCountryCount < LOW_DATA_THRESHOLD && (
            <p className="mt-2 text-xs text-faint">
              ⚠️{" "}
              {lang === "vi"
                ? `Quốc gia này mới có ${activeCountryCount} mốc — phù hợp bối cảnh phụ, chưa đủ sâu cho cốt truyện chính.`
                : `This country only has ${activeCountryCount} milestones so far — fine for a side setting, not deep enough for a main plotline yet.`}
            </p>
          )}
          <label htmlFor="year" className="mt-8 block text-lg text-muted">
            {dict.wakeUp}
          </label>
          <output
            htmlFor="year"
            className="block overflow-hidden font-display text-[5.5rem] font-extrabold leading-none tracking-tighter text-gold tabular sm:text-9xl"
          >
            {reduceMotion ? (
              year
            ) : (
              <motion.span
                key={year}
                initial={{ opacity: 0.4, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="inline-block"
              >
                {year}
              </motion.span>
            )}
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
          <p className="mt-5 text-base sm:text-lg">
            <span className="font-mono text-3xl font-semibold tabular text-ink">{ahead.length}</span>{" "}
            <span className="text-muted">{dict.ahead}</span>{" "}
            <span className="text-xs text-faint">
              ({gainsAhead.length} {lang === "vi" ? "cơ hội" : "gains"} · {trapsAhead.length} {lang === "vi" ? "cạm bẫy" : "traps"})
            </span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link
              href={`/${lang}/whatif?mode=playbook&country=${country}&from=${year}`}
              className="rounded-full bg-gold px-4 py-2 text-xs font-semibold text-on-gold hover:brightness-110"
            >
              {lang === "vi" ? `⚡ Lập chuỗi lãi kép từ ${year} →` : `⚡ Build compounding chain from ${year} →`}
            </Link>
            {(
              <Link
                href={`/${lang}/almanac?country=${country}&year=${year}`}
                className="rounded-full border border-line-strong bg-raised px-4 py-2 text-xs font-semibold text-ink hover:border-gold"
              >
                {lang === "vi" ? `🍜 Vật giá năm ${year} →` : `🍜 Prices in ${year} →`}
              </Link>
            )}
            <Link
              href={`/${lang}/world?year=${year}`}
              className="rounded-full border border-line-strong bg-raised px-4 py-2 text-xs font-semibold text-ink hover:border-gold"
            >
              {lang === "vi" ? `🌍 Mốc toàn cầu năm ${year} →` : `🌍 World milestones in ${year} →`}
            </Link>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-full border border-line bg-raised p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setTab("gain")}
                className={`rounded-full px-3 py-1 font-semibold transition-colors ${
                  tab === "gain" ? "bg-gold text-on-gold" : "text-muted hover:text-ink"
                }`}
              >
                💰 {lang === "vi" ? "Top Cơ hội" : "Top Multipliers"} ({gainsAhead.length})
              </button>
              <button
                type="button"
                onClick={() => setTab("trap")}
                className={`rounded-full px-3 py-1 font-semibold transition-colors ${
                  tab === "trap" ? "bg-danger text-[#2a0606]" : "text-muted hover:text-ink"
                }`}
              >
                🚫 {lang === "vi" ? "Cạm bẫy cần né" : "Traps to Avoid"} ({trapsAhead.length})
              </button>
            </div>
            {activeList.length > 0 && (
              <motion.button
                type="button"
                onClick={handleSaveTop3}
                className="text-xs font-medium text-gold underline hover:brightness-110"
                animate={savedToast && !reduceMotion ? { scale: [1, 1.08, 1] } : undefined}
                transition={{ duration: 0.3 }}
              >
                {savedToast
                  ? lang === "vi"
                    ? "✓ Đã lưu vào Bùa"
                    : "✓ Saved to Cheat Sheet"
                  : lang === "vi"
                    ? "🧿 Lưu 3 mốc này vào Bùa"
                    : "🧿 Save top 3 to Cheat Sheet"}
              </motion.button>
            )}
          </div>

          <ol className="mt-4 space-y-3">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${tab}-${country}`}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="space-y-3"
              >
                {activeList.map((m, i) => (
                  <li key={m.id} className="list-none">
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
                      ) : (m.opportunity.returnMultiple ?? 1) < 1 ? (
                        <span className="shrink-0 rounded-md bg-danger px-2 py-0.5 font-mono text-sm font-semibold tabular text-[#2a0606]">
                          ↓ {formatDrop(m.opportunity.returnMultiple!, lang)}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </motion.div>
            </AnimatePresence>
          </ol>
          <Link href={`/${lang}/${country}`} className="mt-5 inline-block text-sm font-medium text-gold hover:underline">
            {dict.seeAll} →
          </Link>
        </div>
      </div>
    </div>
  );
}
