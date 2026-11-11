"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { defaultCountry, t, type Locale, type LocalizedText } from "@/lib/i18n";
import { interpolateAlmanacValue, type AlmanacItem } from "@/lib/almanac";
import { formatDate, formatDrop, formatMoney, formatMultiple } from "@/lib/format";
import { quantityLabel } from "@/lib/almanacUnits";
import AlmanacChart from "./AlmanacChart";

export interface AlmanacMilestone {
  id: string;
  country: string;
  date: string;
  title: LocalizedText;
  returnMultiple?: number;
}

export interface AlmanacCountry {
  code: string;
  name: LocalizedText;
  flag: string;
  stake: { amount: number; currency: string };
}

const QUALITY_LABEL: Record<string, { vi: string; en: string }> = {
  A: { vi: "Nguồn chính xác (pháp lý/thống kê chính thức)", en: "High-confidence (legal/official statistics)" },
  B: { vi: "Nguồn tổng hợp đáng tin, có dao động", en: "Reliable aggregated source, with variance" },
  C: { vi: "Tham khảo, rời rạc — chưa phải chuỗi đầy đủ", en: "Anecdotal/sparse — not a full series yet" },
};

const SLIDER_COPY = {
  vi: {
    sliderTitle: (c: string) => `🕰️ Cỗ Máy Thời Gian Vật Giá ${c}`,
    sliderSub: (stake: string, c: string) =>
      `Kéo thanh trượt để xem sức mua của ${stake} và các mốc đầu tư tại ${c} ngay trong năm đó.`,
    stakePower: (stake: string) => `Với ${stake} trong tay năm`,
    youCouldBuy: "sức mua tương đương:",
    priceInYear: "Giá năm",
    milestonesInYear: (c: string) => `Mốc & Biến cố tại ${c} quanh năm`,
    playbookFromYear: "⚡ Lập chuỗi lãi kép từ năm",
    seriesHeading: "Biểu đồ chi tiết từng mặt hàng qua các năm",
    noSnapshot: "Chưa có số liệu mua được cho năm này.",
  },
  en: {
    sliderTitle: (c: string) => `🕰️ ${c} Historical Purchasing Power Time Machine`,
    sliderSub: (stake: string, c: string) =>
      `Slide across years to see what ${stake} could buy and which ${c} milestones unfolded around that year.`,
    stakePower: (stake: string) => `With ${stake} in`,
    youCouldBuy: "purchasing power equaled:",
    priceInYear: "Price in",
    milestonesInYear: (c: string) => `${c} milestones around`,
    playbookFromYear: "⚡ Build compounding chain from",
    seriesHeading: "Detailed year-by-year series by item",
    noSnapshot: "No purchasable price data for this year yet.",
  },
};

const MIN_YEAR = 1986;
const MAX_YEAR = 2025;

export default function AlmanacExplorer({
  items: allItems,
  countries,
  milestones: allMilestones = [],
  lang,
  dict,
}: {
  items: AlmanacItem[];
  countries: AlmanacCountry[];
  milestones?: AlmanacMilestone[];
  lang: Locale;
  dict: { sources: string; quality: string; selectLabel: string; countryLabel: string };
}) {
  const search = useSearchParams();
  const initialYear = useMemo(() => {
    const q = Number(search.get("year"));
    return Number.isFinite(q) && q >= MIN_YEAR && q <= MAX_YEAR ? q : 2000;
  }, [search]);
  const initialCountry = useMemo(() => {
    const q = search.get("country");
    return countries.find((c) => c.code === q)?.code ?? (countries.find((c) => c.code === defaultCountry(lang)) ?? countries[0])?.code;
  }, [search, countries, lang]);

  const [year, setYear] = useState<number>(initialYear);
  const [countryCode, setCountryCode] = useState(initialCountry);
  const country = countries.find((c) => c.code === countryCode) ?? countries[0];
  const items = useMemo(() => allItems.filter((i) => i.country === country?.code), [allItems, country]);
  const [id, setId] = useState<string | undefined>(items[0]?.id);
  const item = useMemo(() => items.find((i) => i.id === id) ?? items[0], [items, id]);
  const L = SLIDER_COPY[lang];

  const selectCountry = (code: string) => {
    setCountryCode(code);
    setId(undefined);
    const params = new URLSearchParams(window.location.search);
    params.set("country", code);
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  const stake = country?.stake ?? { amount: 0, currency: "USD" };
  const stakeLabel = formatMoney(stake.amount, stake.currency, lang);
  const countryName = country ? t(country.name, lang) : "";

  const snapshots = useMemo(
    () =>
      items
        .filter((it) => it.kind !== "event" && it.purchasable !== false && (it.currency ?? stake.currency) === stake.currency)
        .map((it) => {
          const interp = interpolateAlmanacValue(it.series, year);
          if (!interp) return null;
          const price = interp.value * (it.valueMultiplier ?? 1);
          const units = stake.amount / Math.max(price, 1e-9);
          return { item: it, price, exact: interp.exact, units };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [items, year, stake.amount, stake.currency],
  );

  const countryMilestones = useMemo(
    () => allMilestones.filter((m) => m.country === country?.code),
    [allMilestones, country],
  );
  const milestoneCountByCountry = useMemo(() => {
    const m = new Map<string, number>();
    for (const item of allMilestones) m.set(item.country, (m.get(item.country) ?? 0) + 1);
    return m;
  }, [allMilestones]);
  const nearbyMilestones = useMemo(() => {
    const exact = countryMilestones.filter((m) => Number(m.date.slice(0, 4)) === year);
    if (exact.length > 0) return exact;
    return countryMilestones
      .filter((m) => Math.abs(Number(m.date.slice(0, 4)) - year) <= 2)
      .sort((a, b) => Math.abs(Number(a.date.slice(0, 4)) - year) - Math.abs(Number(b.date.slice(0, 4)) - year))
      .slice(0, 4);
  }, [countryMilestones, year]);

  if (!country || !item) return null;
  const numLocale = lang === "vi" ? "vi-VN" : "en-US";

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <label htmlFor="almanac-country" className="block text-xs font-semibold uppercase tracking-wider text-faint">{dict.countryLabel}</label>
        <select id="almanac-country" value={country.code} onChange={(e) => selectCountry(e.target.value)} className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-ink sm:hidden">
          {countries.map((c) => <option key={c.code} value={c.code}>{c.flag} {t(c.name, lang)} ({milestoneCountByCountry.get(c.code) ?? 0})</option>)}
        </select>
        <div className="hidden flex-wrap gap-2 sm:flex">
          {countries.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => selectCountry(c.code)}
              aria-pressed={c.code === country.code}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                c.code === country.code ? "border-gold bg-gold text-on-gold" : "border-line text-muted hover:border-gold/50 hover:text-ink"
              }`}
            >
              <span className="mr-1.5">{c.flag}</span>
              {t(c.name, lang)}
              <span className="ml-1.5 text-xs font-normal">({milestoneCountByCountry.get(c.code) ?? 0})</span>
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-3xl border border-gold/50 bg-surface p-5 sm:p-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-gold">{L.sliderTitle(countryName)}</h2>
            <p className="mt-1 text-sm text-muted">{L.sliderSub(stakeLabel, countryName)}</p>
          </div>
          <div className="font-display text-5xl font-extrabold tracking-tight text-gold tabular sm:text-6xl">
            {year}
          </div>
        </div>

        <div>
          <input
            type="range"
            min={MIN_YEAR}
            max={MAX_YEAR}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full accent-[#f4b740]"
          />
          <div className="mt-1 flex justify-between font-mono text-xs text-faint tabular">
            {[1986, 1995, 2000, 2007, 2015, 2020, 2025].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={`hover:text-gold ${year === y ? "font-bold text-gold" : ""}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-faint">
            {L.stakePower(stakeLabel)} {year} {L.youCouldBuy}
          </div>
          {snapshots.length === 0 && <p className="text-sm text-muted">{L.noSnapshot}</p>}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {snapshots.map(({ item: it, price, exact, units }) => {
              const formattedUnits = new Intl.NumberFormat(numLocale, {
                maximumFractionDigits: units >= 100 ? 0 : units >= 1 ? 1 : 2,
              }).format(units);
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setId(it.id)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    it.id === item.id
                      ? "border-gold bg-raised"
                      : "border-line bg-bg/60 hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="font-medium">{t(it.name, lang)}</span>
                    <span className="font-mono text-xs text-faint">
                      {exact ? year : `~${year}`}
                    </span>
                  </div>
                  <div className="mt-1.5 font-mono text-xl font-bold text-gold tabular">
                    {formattedUnits}{" "}
                    <span className="text-xs font-normal text-muted">
                      {quantityLabel(t(it.unit, lang), units, lang) || `× ${t(it.unit, lang)}`}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-xs text-faint tabular">
                    {L.priceInYear} {year}: {formatMoney(price, it.currency ?? stake.currency, lang)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {nearbyMilestones.length > 0 && (
          <div className="pt-3 border-t border-line space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-faint">
                {L.milestonesInYear(countryName)} {year}
              </div>
              <Link
                href={`/${lang}/whatif?mode=playbook&country=${country.code}&from=${year}`}
                className="text-xs font-semibold text-gold hover:underline"
              >
                {L.playbookFromYear} {year} →
              </Link>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {nearbyMilestones.map((m) => (
                <Link
                  key={m.id}
                  href={`/${lang}/${m.country}/${m.id}`}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-line bg-raised p-3 hover:border-gold transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-xs text-gold">{formatDate(m.date, lang)}</div>
                    <div className="truncate text-sm font-medium">{t(m.title, lang)}</div>
                  </div>
                  {(m.returnMultiple ?? 0) > 1 ? (
                    <span className="shrink-0 rounded bg-gain px-2 py-0.5 font-mono text-xs font-bold text-on-gain">
                      {formatMultiple(m.returnMultiple!, lang)}
                    </span>
                  ) : (m.returnMultiple ?? 1) < 1 ? (
                    <span className="shrink-0 rounded bg-danger px-2 py-0.5 font-mono text-xs font-bold text-[#2a0606]">
                      ↓ {formatDrop(m.returnMultiple!, lang)}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold">{L.seriesHeading}</h3>
        <label className="relative inline-flex w-full max-w-full items-center sm:w-auto">
          <span className="sr-only">{dict.selectLabel}</span>
          <select
            value={item.id}
            onChange={(e) => setId(e.target.value)}
            className="w-full appearance-none rounded-full border border-line-strong bg-raised py-2.5 pl-4 pr-10 text-base font-medium text-ink hover:border-gold focus:border-gold focus:outline-none"
          >
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {t(i.name, lang)}
              </option>
            ))}
          </select>
          <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute right-4 h-4 w-4 text-muted">
            <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </label>

        <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold">{t(item.name, lang)}</h2>
            <span
              className={`rounded-md border px-2 py-0.5 text-xs ${
                item.quality === "A" ? "border-gain/40 text-gain" : item.quality === "B" ? "border-warning/40 text-warning" : "border-danger/40 text-danger"
              }`}
              title={QUALITY_LABEL[item.quality][lang]}
            >
              {dict.quality} {item.quality}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{t(item.unit, lang)}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t(item.note, lang)}</p>

          <div className="mt-6">
            <AlmanacChart item={item} lang={lang} />
          </div>

          <div className="mt-6 border-t border-line pt-4 text-xs text-faint">
            <span>{dict.sources}: </span>
            {item.sources.map((s, i) => (
              <span key={s.url}>
                {i > 0 && " · "}
                <a href={s.url} target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-4 hover:text-gold">
                  {s.title} ↗
                </a>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
