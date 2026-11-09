"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { t, type Locale } from "@/lib/i18n";
import type { Country, Milestone } from "@/lib/types";
import { formatDate, formatDrop, formatMultiple } from "@/lib/format";

const COPY = {
  vi: {
    sliderSub: "Kéo thanh trượt để xem chuyện gì xảy ra ở TẤT CẢ 15 quốc gia quanh năm đó cùng lúc.",
    toleranceLabel: "Phạm vi",
    exact: "Đúng năm",
    near: "±1 năm",
    wide: "±2 năm",
    empty: "Không có mốc nào trong phạm vi năm này. Thử mở rộng phạm vi hoặc đổi năm.",
    milestonesIn: (n: number) => `${n} mốc trên toàn thế giới`,
  },
  en: {
    sliderSub: "Slide across years to see what happened in ALL 15 countries at the same time.",
    toleranceLabel: "Range",
    exact: "Exact year",
    near: "±1 year",
    wide: "±2 years",
    empty: "No milestones in this range. Try widening the range or a different year.",
    milestonesIn: (n: number) => `${n} milestones worldwide`,
  },
};

const MIN_YEAR = 1978;
const MAX_YEAR = 2026;

export default function WorldYearExplorer({
  milestones,
  countries,
  lang,
}: {
  milestones: Milestone[];
  countries: Country[];
  lang: Locale;
}) {
  const search = useSearchParams();
  const initialYear = useMemo(() => {
    const q = Number(search.get("year"));
    return Number.isFinite(q) && q >= MIN_YEAR && q <= MAX_YEAR ? q : 2008;
  }, [search]);

  // `year` drives the big number + the slider thumb and must update on every
  // tick with zero lag. `committedYear` drives the (expensive) filter/group
  // + the animated grid, and is only allowed to change once per animation
  // frame via rAF throttling below — that's what stops a flood of pointer
  // events from each queuing its own React render + Motion layout pass.
  const [year, setYear] = useState(initialYear);
  const [committedYear, setCommittedYear] = useState(initialYear);
  const [tolerance, setTolerance] = useState<0 | 1 | 2>(0);
  const copy = COPY[lang];

  const rafRef = useRef<number | null>(null);
  const pendingYearRef = useRef(initialYear);

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
  }, []);

  const onSliderChange = (y: number) => {
    setYear(y);
    pendingYearRef.current = y;
    if (rafRef.current != null) return; // a commit is already scheduled for the next frame
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setCommittedYear(pendingYearRef.current);
    });
  };

  // Only touch the URL once the user lets go, not on every intermediate tick
  // (replaceState on every pixel of drag is itself a source of jank).
  const commitUrl = () => {
    const params = new URLSearchParams(window.location.search);
    params.set("year", String(pendingYearRef.current));
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  const inRange = useMemo(
    () => milestones.filter((m) => Math.abs(Number(m.date.slice(0, 4)) - committedYear) <= tolerance),
    [milestones, committedYear, tolerance],
  );

  const byCountry = useMemo(() => {
    const groups = new Map<string, Milestone[]>();
    for (const m of inRange) {
      const list = groups.get(m.country) ?? [];
      list.push(m);
      groups.set(m.country, list);
    }
    // Keep the global country order (vn first, then by GDP).
    return countries
      .map((c) => ({ country: c, items: (groups.get(c.code) ?? []).sort((a, b) => a.date.localeCompare(b.date)) }))
      .filter((g) => g.items.length > 0);
  }, [inRange, countries]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-gold/50 bg-surface p-5 sm:p-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-sm text-muted">{copy.sliderSub}</p>
          <div className="font-display text-5xl font-extrabold tracking-tight text-gold tabular sm:text-6xl">
            {year}
          </div>
        </div>

        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={year}
          onChange={(e) => onSliderChange(Number(e.target.value))}
          onPointerUp={commitUrl}
          onKeyUp={commitUrl}
          onBlur={commitUrl}
          className="w-full accent-[#f4b740]"
        />
        <div className="flex justify-between font-mono text-xs text-faint tabular">
          <span>{MIN_YEAR}</span>
          <span>{MAX_YEAR}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-faint">{copy.toleranceLabel}</span>
          <div className="inline-flex rounded-full border border-line bg-raised p-0.5 text-xs">
            {([0, 1, 2] as const).map((tol) => (
              <button
                key={tol}
                type="button"
                onClick={() => setTolerance(tol)}
                className={`rounded-full px-3 py-1 font-semibold transition-colors ${
                  tolerance === tol ? "bg-gold text-on-gold" : "text-muted hover:text-ink"
                }`}
              >
                {tol === 0 ? copy.exact : tol === 1 ? copy.near : copy.wide}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm font-semibold text-faint">{copy.milestonesIn(inRange.length)}</p>
      </section>

      {byCountry.length === 0 ? (
        <p className="text-muted">{copy.empty}</p>
      ) : (
        // Keyed on the committed (rAF-throttled) year+tolerance so a single
        // lightweight crossfade plays once per settled frame, instead of
        // animating every card's mount/unmount on every intermediate tick.
        <motion.div
          key={`${committedYear}-${tolerance}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className="grid gap-6 sm:grid-cols-2"
        >
          {byCountry.map(({ country, items }) => (
            <div key={country.code} className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{country.flag}</span>
                <span className="font-display text-lg font-bold">{t(country.name, lang)}</span>
                <span className="ml-auto font-mono text-xs text-faint">{items.length}</span>
              </div>
              <ul className="mt-3 space-y-2">
                {items.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/${lang}/${m.country}/${m.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-line bg-raised p-3 hover:border-gold transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-gold">{formatDate(m.date, lang)}</div>
                        <div className="truncate text-sm font-medium">{t(m.title, lang)}</div>
                      </div>
                      {(m.opportunity.returnMultiple ?? 0) > 1 ? (
                        <span className="shrink-0 rounded bg-gain px-2 py-0.5 font-mono text-xs font-bold text-on-gain">
                          {formatMultiple(m.opportunity.returnMultiple!, lang)}
                        </span>
                      ) : (m.opportunity.returnMultiple ?? 1) < 1 ? (
                        <span className="shrink-0 rounded bg-danger px-2 py-0.5 font-mono text-xs font-bold text-[#2a0606]">
                          ↓ {formatDrop(m.opportunity.returnMultiple!, lang)}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
