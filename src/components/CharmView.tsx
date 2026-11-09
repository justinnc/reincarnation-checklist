"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { t, type Locale } from "@/lib/i18n";
import type { Country, Milestone } from "@/lib/types";
import { formatDate, formatDrop, formatMultiple } from "@/lib/format";
import { clearCharmIds, setAllCharmIds, toggleCharmId, useCharmIds } from "@/lib/charm";

type Props = {
  lang: Locale;
  milestones: Milestone[];
  countries: Country[];
};

const STARTER_VN = [
  "vn-phu-my-hung-land",
  "vn-vinamilk-listing-2006",
  "vn-vnindex-bottom-2009",
  "vn-acb-bau-kien-arrest-2012",
  "vn-mwg-listing-2014",
  "vn-covid-bottom-2020",
  "vn-flc-trinh-van-quyet-manipulation-2022",
  "vn-sjc-gold-premium-collapse-2024",
];

const STARTER_US = [
  "us-microsoft-ipo-1986",
  "us-amazon-ipo-1997",
  "us-enron-collapse-2001",
  "us-lehman-crash-2008",
  "us-march-2009-bottom",
  "us-ftx-collapse-2022",
  "us-svb-bank-run-2023",
];

const COPY = {
  vi: {
    empty: "Bùa Trọng Sinh của bạn đang trống. Hãy bấm '+ Lưu vào Bùa' trên bất kỳ cột mốc nào, hoặc nạp nhanh bộ Bùa mẫu bên dưới:",
    loadVn: "⚡ Nạp Bùa mẫu Việt Nam (8 mốc)",
    loadUs: "⚡ Nạp Bùa mẫu Mỹ (7 mốc)",
    printBtn: "🖨️ In Bùa 1 Trang (PDF/Giấy)",
    shareBtn: "🔗 Sao chép link Bùa",
    copied: "✓ Đã chép link!",
    clearBtn: "Xóa hết",
    saveShared: "💾 Lưu bộ Bùa đang xem vào máy",
    gainsTitle: "💰 Lịch Mua – Bán (Cơ hội nhân tài sản)",
    trapsTitle: "🚫 Cạm bẫy & Phốt Phải Né (Bán khống / Rút trước khi sập)",
    buy: "Mua/Vào:",
    sell: "Bán/Thoát:",
    tip: "Mẹo người biết trước:",
    remove: "Bỏ",
  },
  en: {
    empty: "Your Pocket Cheat Sheet is empty. Click '+ Save to Cheat Sheet' on any milestone, or load a starter pack below:",
    loadVn: "⚡ Load Vietnam Starter Pack (8 milestones)",
    loadUs: "⚡ Load US Starter Pack (7 milestones)",
    printBtn: "🖨️ Print 1-Page Cheat Sheet (PDF)",
    shareBtn: "🔗 Copy shareable link",
    copied: "✓ Copied!",
    clearBtn: "Clear all",
    saveShared: "💾 Save shared cheat sheet to my device",
    gainsTitle: "💰 Buy & Sell Schedule (Wealth Multipliers)",
    trapsTitle: "🚫 Traps & Scandals to Avoid (Exit / Short Before Crash)",
    buy: "Buy/Enter:",
    sell: "Sell/Exit:",
    tip: "Time-traveler tip:",
    remove: "Remove",
  },
};

export default function CharmView({ lang, milestones, countries }: Props) {
  const localIds = useCharmIds();
  const search = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const L = COPY[lang];

  const sharedIds = useMemo(() => {
    const q = search.get("ids");
    if (!q) return null;
    return q.split(",").filter(Boolean);
  }, [search]);

  const activeIds = sharedIds && sharedIds.length > 0 ? sharedIds : localIds;

  const items = useMemo(() => {
    const set = new Set(activeIds);
    return milestones
      .filter((m) => set.has(m.id))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [milestones, activeIds]);

  const gains = items.filter((m) => (m.opportunity.returnMultiple ?? 1) >= 1);
  const traps = items.filter((m) => (m.opportunity.returnMultiple ?? 1) < 1);

  const countryMap = useMemo(() => new Map(countries.map((c) => [c.code, c])), [countries]);

  const handleShare = () => {
    if (items.length === 0) return;
    const qs = `ids=${items.map((m) => m.id).join(",")}`;
    router.replace(`?${qs}`, { scroll: false });
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(`${window.location.origin}/${lang}/charm?${qs}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center space-y-5">
        <p className="text-muted max-w-xl mx-auto">{L.empty}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setAllCharmIds(STARTER_VN)}
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-on-gold hover:brightness-110"
          >
            {L.loadVn}
          </button>
          <button
            type="button"
            onClick={() => setAllCharmIds(STARTER_US)}
            className="rounded-full border border-line-strong bg-raised px-5 py-2.5 text-sm font-semibold text-ink hover:border-gold"
          >
            {L.loadUs}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <button
          type="button"
          onClick={() => typeof window !== "undefined" && window.print()}
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-on-gold hover:brightness-110"
        >
          {L.printBtn}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="rounded-full border border-gold/50 bg-raised px-4 py-2 text-sm font-semibold text-gold hover:bg-gold hover:text-on-gold transition-colors"
        >
          {copied ? L.copied : L.shareBtn}
        </button>
        {sharedIds ? (
          <button
            type="button"
            onClick={() => {
              setAllCharmIds(sharedIds);
              router.replace(`/${lang}/charm`);
            }}
            className="rounded-full border border-line-strong px-4 py-2 text-xs text-ink hover:border-gold"
          >
            {L.saveShared}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => clearCharmIds()}
            className="rounded-full border border-line px-4 py-2 text-xs text-muted hover:text-danger"
          >
            {L.clearBtn}
          </button>
        )}
      </div>

      {gains.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-gain">{L.gainsTitle}</h2>
          <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
            {gains.map((m) => {
              const c = countryMap.get(m.country);
              const o = m.opportunity;
              return (
                <div key={m.id} className="p-4 sm:p-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span>{c?.flag}</span>
                      <span className="font-mono font-semibold text-gold">{formatDate(m.date, lang)}</span>
                      {o.exitDate && <span className="font-mono text-faint">→ {o.exitDate}</span>}
                      {t(o.asset, lang) && <span className="font-mono text-muted">· {t(o.asset, lang)}</span>}
                    </div>
                    <Link href={`/${lang}/${m.country}/${m.id}`} className="font-display text-lg font-bold hover:text-gold block">
                      {t(m.title, lang)}
                    </Link>
                    <div className="text-xs text-muted">
                      <strong className="text-ink">{L.buy}</strong> {t(o.buyWhen, lang)}
                      {t(o.sellWhen, lang) && (
                        <>
                          {" · "}
                          <strong className="text-ink">{L.sell}</strong> {t(o.sellWhen, lang)}
                        </>
                      )}
                    </div>
                    {m.insiderTip && (
                      <div className="text-xs text-faint">
                        <strong className="text-gold">{L.tip}</strong> {t(m.insiderTip, lang)}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {o.returnMultiple && (
                      <span className="rounded-md bg-gain px-2.5 py-0.5 font-mono text-sm font-bold text-on-gain">
                        {formatMultiple(o.returnMultiple, lang)}
                      </span>
                    )}
                    {!sharedIds && (
                      <button
                        type="button"
                        onClick={() => toggleCharmId(m.id)}
                        className="text-xs text-faint underline hover:text-danger print:hidden"
                      >
                        {L.remove}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {traps.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-danger">{L.trapsTitle}</h2>
          <div className="divide-y divide-line rounded-2xl border border-danger/40 bg-surface">
            {traps.map((m) => {
              const c = countryMap.get(m.country);
              const o = m.opportunity;
              return (
                <div key={m.id} className="p-4 sm:p-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span>{c?.flag}</span>
                      <span className="font-mono font-semibold text-danger">{formatDate(m.date, lang)}</span>
                      {t(o.asset, lang) && <span className="font-mono text-muted">· {t(o.asset, lang)}</span>}
                    </div>
                    <Link href={`/${lang}/${m.country}/${m.id}`} className="font-display text-lg font-bold hover:text-gold block">
                      {t(m.title, lang)}
                    </Link>
                    <div className="text-xs text-muted">
                      <strong className="text-ink">{L.sell}</strong> {t(o.sellWhen, lang) || t(o.action, lang)}
                    </div>
                    {m.insiderTip && (
                      <div className="text-xs text-faint">
                        <strong className="text-gold">{L.tip}</strong> {t(m.insiderTip, lang)}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {o.returnMultiple && (
                      <span className="rounded-md bg-danger px-2.5 py-0.5 font-mono text-sm font-bold text-[#2a0606]">
                        ↓ {formatDrop(o.returnMultiple, lang)}
                      </span>
                    )}
                    {!sharedIds && (
                      <button
                        type="button"
                        onClick={() => toggleCharmId(m.id)}
                        className="text-xs text-faint underline hover:text-danger print:hidden"
                      >
                        {L.remove}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
