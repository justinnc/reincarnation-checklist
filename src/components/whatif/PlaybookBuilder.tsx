"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { t, type Locale, defaultCountry } from "@/lib/i18n";
import type { Country, MilestoneLite } from "@/lib/types";
import { formatMoney, formatMultiple } from "@/lib/format";
import { SourceLinksBadge } from "@/components/Badges";
import { formatAmountInput, parseAmountInput } from "@/lib/whatif/amountInput";
import {
  findOptimalChainIncluding,
  findOptimalNonOverlappingChain,
  formatPeriodLabel,
  getPlaybookCandidates,
  simulatePlaybook,
  type PlaybookCandidate,
} from "@/lib/whatif/playbook";

type Props = {
  lang: Locale;
  countries: Country[];
  milestones: MilestoneLite[];
};

const LABELS = {
  vi: {
    country: "1. Chọn quốc gia trọng sinh",
    capital: "2. Vốn khởi đầu & Chế độ thanh khoản",
    realisticOn: "🛡️ Thực tế (Chỉ tài sản đại chúng, có giới hạn thanh khoản)",
    realisticOff: "🚀 Tối đa lý thuyết (Mọi thương vụ, không giới hạn thanh khoản)",
    pickTitle: "3. Chọn các mốc nối tiếp nhau",
    pickSub: "Tích chọn nhiều mốc để lãi kép nối tiếp từ thương vụ này sang thương vụ khác.",
    autoOptimal: "⚡ Tự chọn chuỗi tối ưu (không trùng tháng)",
    clearAll: "Bỏ chọn hết",
    ledgerTitle: "Lộ trình Lãi Kép Trọng Sinh",
    emptyLedger: "Hãy tích chọn ít nhất 1 mốc bên dưới (hoặc bấm nút Tự chọn chuỗi tối ưu).",
    overlapWarn:
      "⚠️ Các mốc trùng thời gian nắm giữ đã bị loại khỏi phép tính. Chọn chuỗi không trùng tháng để mô phỏng đầu tư nối tiếp.",
    capWarn:
      "🛡️ Một số bước đã bị áp giới hạn thanh khoản (phần vốn vượt giới hạn được giữ nguyên tiền mặt) để tránh con số ảo vượt quy mô thị trường.",
    overlapStep: "⚠️ Trùng thời gian với bước trước",
    cappedStep: "🛡️ Chạm giới hạn thanh khoản",
    speculativeBadge: "Đầu cơ / thị trường ngách",
    initial: "Vốn ban đầu",
    final: "Tổng tài sản cuối",
    totalMult: "Số lần nhân vốn",
    copyLink: "🔗 Sao chép link chuỗi này",
    copied: "✓ Đã sao chép link!",
    viewDetail: "Chi tiết",
    fromYearNote: "Đang lọc từ năm",
    resetFromYear: "Xem mọi năm",
  },
  en: {
    country: "1. Choose reincarnation country",
    capital: "2. Starting capital & Liquidity mode",
    realisticOn: "🛡️ Realistic (Public liquid assets + liquidity caps)",
    realisticOff: "🚀 Theoretical Max (All trades, uncapped)",
    pickTitle: "3. Chain your milestones",
    pickSub: "Check multiple milestones to roll and compound your capital from one trade into the next.",
    autoOptimal: "⚡ Auto-pick optimal non-overlapping chain",
    clearAll: "Clear all",
    ledgerTitle: "Compounding Playbook Ledger",
    emptyLedger: "Select at least 1 milestone below (or click Auto-pick optimal chain).",
    overlapWarn:
      "⚠️ Overlapping holdings were excluded from this calculation. Choose non-overlapping months to model sequential investment.",
    capWarn:
      "🛡️ Liquidity caps were applied on one or more steps (excess capital held in cash) to prevent fantasy numbers exceeding market depth.",
    overlapStep: "⚠️ Overlaps previous holding period",
    cappedStep: "🛡️ Liquidity capped",
    speculativeBadge: "Speculative / Private deal",
    initial: "Starting capital",
    final: "Final net worth",
    totalMult: "Cumulative multiple",
    copyLink: "🔗 Copy shareable playbook link",
    copied: "✓ Link copied!",
    viewDetail: "Details",
    fromYearNote: "Filtering from year",
    resetFromYear: "Show all years",
  },
};

export function PlaybookOverlapNotice({ lang, skippedOverlaps }: { lang: Locale; skippedOverlaps: PlaybookCandidate[] }) {
  if (skippedOverlaps.length === 0) return null;
  return (
    <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-2.5 text-xs text-warning" role="status">
      <p>{LABELS[lang].overlapWarn}</p>
      <p className="mt-2 font-semibold">{lang === "vi" ? "Các mốc đã chọn nhưng không được tính:" : "Excluded selected milestones:"}</p>
      <ul className="mt-1 list-inside list-disc">
        {skippedOverlaps.map((c) => <li key={c.milestone.id}>{t(c.milestone.title, lang)} ({formatPeriodLabel(c, lang)})</li>)}
      </ul>
    </div>
  );
}

export default function PlaybookBuilder({ lang, countries, milestones }: Props) {
  const search = useSearchParams();
  const router = useRouter();
  const L = LABELS[lang];

  const initialCountryCode = useMemo(() => {
    const q = search.get("country");
    if (q && countries.some((c) => c.code === q)) return q;
    return defaultCountry(lang);
  }, [search, countries, lang]);

  const [countryCode, setCountryCode] = useState<string>(initialCountryCode);
  const [realistic, setRealistic] = useState<boolean>(() => search.get("real") !== "0");
  const [fromYear, setFromYear] = useState<number | undefined>(() => {
    const fy = Number(search.get("from"));
    return Number.isFinite(fy) && fy >= 1900 ? fy : undefined;
  });

  const country = useMemo(
    () => countries.find((c) => c.code === countryCode) ?? countries[0],
    [countries, countryCode],
  );

  const milestoneCountByCountry = useMemo(() => {
    const m = new Map<string, number>();
    for (const item of milestones) m.set(item.country, (m.get(item.country) ?? 0) + 1);
    return m;
  }, [milestones]);

  const allCountryCandidates = useMemo(
    () => getPlaybookCandidates(milestones.filter((m) => m.country === country.code)),
    [milestones, country.code],
  );

  const candidates = useMemo(
    () =>
      fromYear !== undefined
        ? allCountryCandidates.filter((c) => c.startYear >= fromYear)
        : allCountryCandidates,
    [allCountryCandidates, fromYear],
  );

  const [capital, setCapital] = useState<number>(() => {
    const capQ = Number(search.get("cap"));
    return Number.isFinite(capQ) && capQ > 0 ? capQ : country.stake.amount;
  });

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const valid = new Set(allCountryCandidates.map((c) => c.milestone.id));
    const pinQ = search.get("pin");
    if (pinQ && valid.has(pinQ)) {
      return findOptimalChainIncluding(allCountryCandidates, pinQ, 5, { realisticOnly: true });
    }
    const chainQ = search.get("chain");
    if (chainQ) {
      const ids = chainQ.split(",").filter((id) => valid.has(id));
      if (ids.length > 0) return ids;
    }
    return findOptimalNonOverlappingChain(candidates, 5, { realisticOnly: true, fromYear });
  });

  const [copied, setCopied] = useState(false);

  const switchCountry = (newCode: string) => {
    const nextCountry = countries.find((c) => c.code === newCode);
    if (!nextCountry) return;
    setCountryCode(newCode);
    setCapital(nextCountry.stake.amount);
    const nextCandidates = getPlaybookCandidates(milestones.filter((m) => m.country === newCode));
    setSelectedIds(findOptimalNonOverlappingChain(nextCandidates, 5, { realisticOnly: realistic, fromYear }));
  };

  const toggleRealistic = (nextVal: boolean) => {
    setRealistic(nextVal);
    setSelectedIds(findOptimalNonOverlappingChain(candidates, 5, { realisticOnly: nextVal, fromYear }));
  };

  const toggleId = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const result = useMemo(
    () =>
      simulatePlaybook(allCountryCandidates, selectedIds, capital, {
        realistic,
        stakeUnit: country.stake.amount,
      }),
    [allCountryCandidates, selectedIds, capital, realistic, country.stake.amount],
  );

  const copyShareUrl = () => {
    const params = new URLSearchParams();
    params.set("mode", "playbook");
    params.set("country", country.code);
    params.set("cap", String(capital));
    params.set("real", realistic ? "1" : "0");
    if (fromYear !== undefined) params.set("from", String(fromYear));
    if (selectedIds.length > 0) params.set("chain", selectedIds.join(","));
    const qs = params.toString();
    router.replace(`?${qs}`, { scroll: false });
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(`${window.location.origin}/${lang}/whatif?${qs}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const presetTiers = [
    { mult: 0.5, labelVi: "🌱 Tiết kiệm", labelEn: "🌱 Savings" },
    { mult: 1, labelVi: "💼 Chuẩn mốc", labelEn: "💼 Standard" },
    { mult: 5, labelVi: "🚀 Khởi nghiệp", labelEn: "🚀 Startup" },
    { mult: 10, labelVi: "👑 Cá voi", labelEn: "👑 Whale" },
  ].map((tier) => ({
    amount: Math.round(country.stake.amount * tier.mult),
    label: lang === "vi" ? tier.labelVi : tier.labelEn,
  }));

  const quickCurrencies = country.code === "vn"
    ? [10_000_000, 50_000_000, 200_000_000, 1_000_000_000]
    : [1_000, 5_000, 20_000, 100_000];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 space-y-5">
        <div>
          <label htmlFor="playbook-country" className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-faint">{L.country}</label>
          <select id="playbook-country" value={country.code} onChange={(e) => switchCountry(e.target.value)} className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-ink sm:hidden">
            {countries.map((c) => <option key={c.code} value={c.code}>{c.flag} {t(c.name, lang)} ({milestoneCountByCountry.get(c.code) ?? 0})</option>)}
          </select>
          <div className="hidden flex-wrap gap-2 sm:flex">
            {countries.map((c) => {
              const active = c.code === country.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  aria-pressed={active}
                  onClick={() => switchCountry(c.code)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-gold bg-gold text-on-gold"
                      : "border-line bg-raised text-ink hover:border-gold"
                  }`}
                >
                  {c.flag} {t(c.name, lang)}
                  <span className="ml-1 text-xs font-normal">({milestoneCountByCountry.get(c.code) ?? 0})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-faint">{L.capital}</div>
          <div className="flex flex-wrap items-center gap-2">
            {presetTiers.map((p) => (
              <button
                key={p.amount}
                type="button"
                onClick={() => setCapital(p.amount)}
                className={`rounded-full border px-3 py-1.5 font-mono text-xs transition-colors ${
                  capital === p.amount
                    ? "border-gold bg-gold font-semibold text-on-gold"
                    : "border-line bg-raised text-muted hover:border-gold"
                }`}
              >
                <span className="font-sans font-medium mr-1">{p.label}:</span>
                {formatMoney(p.amount, country.stake.currency, lang)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-xs text-faint mr-1 font-mono">{lang === "vi" ? "Mức vốn nhanh:" : "Quick amounts:"}</span>
            {quickCurrencies.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setCapital(q)}
                className={`rounded-full border px-2.5 py-1 font-mono text-xs transition-colors ${
                  capital === q
                    ? "border-gold bg-gold font-semibold text-on-gold"
                    : "border-line bg-raised text-faint hover:text-ink hover:border-gold"
                }`}
              >
                {formatMoney(q, country.stake.currency, lang)}
              </button>
            ))}
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-label={lang === "vi" ? "Vốn khởi đầu" : "Starting capital"}
              value={formatAmountInput(capital, lang)}
              onChange={(e) => setCapital(Math.max(1, parseAmountInput(e.target.value) ?? 1))}
              className="w-36 rounded-lg border border-line bg-bg px-3 py-1.5 font-mono text-xs text-ink focus:border-gold focus:outline-none"
            />
            <span className="font-mono text-xs text-faint">{country.stake.currency}</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => toggleRealistic(true)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                realistic
                  ? "border-gain bg-gain/15 text-gain"
                  : "border-line bg-raised text-muted hover:text-ink"
              }`}
            >
              {L.realisticOn}
            </button>
            <button
              type="button"
              onClick={() => toggleRealistic(false)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                !realistic
                  ? "border-warning bg-warning/15 text-warning"
                  : "border-line bg-raised text-muted hover:text-ink"
              }`}
            >
              {L.realisticOff}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/60 bg-surface p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl font-bold text-gold">{L.ledgerTitle}</h2>
          <button
            type="button"
            onClick={copyShareUrl}
            className="rounded-full border border-gold/50 bg-raised px-3.5 py-1 text-xs font-semibold text-gold hover:bg-gold hover:text-on-gold transition-colors"
          >
            {copied ? L.copied : L.copyLink}
          </button>
        </div>

        {result.steps.length === 0 ? (
          <p className="text-sm text-muted py-4">{L.emptyLedger}</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3 rounded-xl bg-raised p-4">
              <div>
                <div className="text-xs text-faint">{L.initial}</div>
                <div className="mt-0.5 font-mono text-lg font-semibold tabular">
                  {formatMoney(result.initialCapital, country.stake.currency, lang)}
                </div>
              </div>
              <div>
                <div className="text-xs text-faint">{L.final}</div>
                <div className="mt-0.5 font-mono text-2xl font-bold tabular text-gold">
                  {formatMoney(result.finalCapital, country.stake.currency, lang)}
                </div>
              </div>
              <div>
                <div className="text-xs text-faint">{L.totalMult} ({result.steps.length})</div>
                <div className="mt-0.5 font-mono text-xl font-bold tabular text-gain">
                  {formatMultiple(result.totalMultiple, lang)}
                </div>
              </div>
            </div>

            <PlaybookOverlapNotice lang={lang} skippedOverlaps={result.skippedOverlaps} />

            {result.hasLiquidityCap && (
              <div className="rounded-xl border border-gain/40 bg-gain/10 px-4 py-2.5 text-xs text-gain">
                {L.capWarn}
              </div>
            )}

            <ol className="space-y-2.5">
              {result.steps.map((s, idx) => (
                <li
                  key={s.candidate.milestone.id}
                  className="flex flex-col gap-1.5 rounded-xl border border-line bg-bg/60 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded bg-gold/20 px-1.5 py-0.5 font-mono font-semibold text-gold">
                        #{idx + 1} · {formatPeriodLabel(s.candidate, lang)}
                      </span>
                      {s.overlapsPrevious && (
                        <span className="text-warning font-medium">{L.overlapStep}</span>
                      )}
                      {s.cappedByLiquidity && (
                        <span className="text-gain font-medium">{L.cappedStep}</span>
                      )}
                    </div>
                    <Link
                      href={`/${lang}/${country.code}/${s.candidate.milestone.id}`}
                      className="mt-1 block font-medium hover:text-gold truncate"
                    >
                      {t(s.candidate.milestone.title, lang)}
                    </Link>
                  </div>
                  <div className="shrink-0 text-right font-mono text-xs tabular">
                    <div className="text-muted">
                      {formatMoney(s.capitalBefore, country.stake.currency, lang)} →{" "}
                      <span className="font-semibold text-gain">
                        {formatMoney(s.capitalAfter, country.stake.currency, lang)}
                      </span>
                    </div>
                    <div className="text-gold">
                      {formatMultiple(s.candidate.multiple, lang)}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-bold">{L.pickTitle}</h3>
            <p className="text-xs text-muted">{L.pickSub}</p>
            {fromYear !== undefined && (
              <div className="mt-1 flex items-center gap-2 text-xs text-gold">
                <span>{L.fromYearNote} {fromYear}</span>
                <button type="button" onClick={() => setFromYear(undefined)} className="underline">
                  ({L.resetFromYear})
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setSelectedIds(findOptimalNonOverlappingChain(candidates, 5, { realisticOnly: realistic, fromYear }))
              }
              className="rounded-full bg-gold px-3.5 py-1.5 text-xs font-semibold text-on-gold hover:brightness-110"
            >
              {L.autoOptimal}
            </button>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:text-ink"
              >
                {L.clearAll}
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-line">
          {candidates.map((c) => {
            const checked = selectedIds.includes(c.milestone.id);
            return (
              <label
                key={c.milestone.id}
                className={`flex cursor-pointer items-start justify-between gap-3 py-3 transition-colors ${
                  checked ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleId(c.milestone.id)}
                    className="mt-1 h-4 w-4 accent-amber-400"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono text-gold">
                        {formatPeriodLabel(c, lang)}
                      </span>
                      {c.milestone.opportunity.asset && (
                        <span className="font-mono text-faint">· {t(c.milestone.opportunity.asset, lang)}</span>
                      )}
                      {c.speculative && (
                        <span className="rounded border border-warning/40 px-1.5 py-0.2 text-xs text-warning">
                          {L.speculativeBadge}
                        </span>
                      )}
                      {c.milestone.sourceCount !== undefined && (
                        <SourceLinksBadge count={c.milestone.sourceCount} lang={lang} />
                      )}
                    </div>
                    <div className="font-medium leading-snug">{t(c.milestone.title, lang)}</div>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="rounded-md bg-gain px-2 py-0.5 font-mono text-xs font-semibold tabular text-on-gain">
                    {formatMultiple(c.multiple, lang)}
                  </span>
                  <Link
                    href={`/${lang}/${country.code}/${c.milestone.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-faint underline hover:text-gold"
                  >
                    {L.viewDetail}
                  </Link>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
