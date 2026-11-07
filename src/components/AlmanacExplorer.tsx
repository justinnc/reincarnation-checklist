"use client";

import { useMemo, useState } from "react";
import { t, type Locale } from "@/lib/i18n";
import type { AlmanacItem } from "@/lib/almanac";
import AlmanacChart from "./AlmanacChart";

const QUALITY_LABEL: Record<string, { vi: string; en: string }> = {
  A: { vi: "Nguồn chính xác (pháp lý/thống kê chính thức)", en: "High-confidence (legal/official statistics)" },
  B: { vi: "Nguồn tổng hợp đáng tin, có dao động", en: "Reliable aggregated source, with variance" },
  C: { vi: "Tham khảo, rời rạc — chưa phải chuỗi đầy đủ", en: "Anecdotal/sparse — not a full series yet" },
};

export default function AlmanacExplorer({ items, lang, dict }: { items: AlmanacItem[]; lang: Locale; dict: { sources: string; quality: string; selectLabel: string } }) {
  const [id, setId] = useState(items[0]?.id);
  const item = useMemo(() => items.find((i) => i.id === id) ?? items[0], [items, id]);
  if (!item) return null;

  return (
    <div className="space-y-6">
      <label className="relative inline-flex items-center">
        <span className="sr-only">{dict.selectLabel}</span>
        <select
          value={item.id}
          onChange={(e) => setId(e.target.value)}
          className="appearance-none rounded-full border border-line-strong bg-raised py-2.5 pl-4 pr-10 text-base font-medium text-ink hover:border-gold focus:border-gold focus:outline-none"
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
  );
}
