"use client";

import { t, type Locale } from "@/lib/i18n";
import { pointValue, type AlmanacItem } from "@/lib/almanac";

function fmt(n: number, lang: Locale) {
  return new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US", { maximumFractionDigits: n < 10 ? 1 : 0 }).format(n);
}

export default function AlmanacChart({ item, lang }: { item: AlmanacItem; lang: Locale }) {
  const pts = item.series.filter((p) => pointValue(p) != null);
  const max = Math.max(...pts.map((p) => p.max ?? pointValue(p)!));
  const min = Math.min(0, ...pts.map((p) => p.min ?? pointValue(p)!));
  const span = max - min || 1;

  return (
    <div className="space-y-4">
      {/*
        The tooltip pops up ABOVE each bar. A parent with overflow-x-auto forces
        overflow-y to auto too (CSS spec), which silently clips anything that
        renders above the box's own top edge. Fix: reserve top padding on the
        scroll container itself so the tooltip has room to render INSIDE the
        box instead of overflowing above it.
      */}
      <div className="overflow-x-auto rounded-xl border border-line bg-raised">
        <div className="flex items-end gap-1 p-4 pt-20 sm:gap-2 sm:pt-24">
          {pts.map((p, i) => {
            const label = p.year ?? p.date;
            const v = pointValue(p)!;
            const barMin = ((( p.min ?? v) - min) / span) * 100;
            const barMax = (((p.max ?? v) - min) / span) * 100;
            const edge = i === 0 ? "left-0 translate-x-0" : i === pts.length - 1 ? "right-0 left-auto translate-x-0" : "left-1/2 -translate-x-1/2";
            return (
              <div key={i} tabIndex={0} className="group relative flex w-9 shrink-0 cursor-pointer flex-col items-center gap-2 outline-none sm:w-12">
                <div className="relative h-32 w-3 overflow-hidden rounded-full bg-line sm:w-4">
                  <div
                    className="absolute bottom-0 w-full rounded-full bg-gold transition-colors group-hover:bg-gain group-focus:bg-gain"
                    style={{ height: `${barMax}%`, top: "auto" }}
                  />
                  {p.min != null && (
                    <div className="absolute w-full rounded-full bg-gold/40" style={{ bottom: `${barMin}%`, height: `${Math.max(2, barMax - barMin)}%` }} />
                  )}
                </div>
                <span className="font-mono text-xs tabular text-faint">{label}</span>
                <div
                  className={`pointer-events-none absolute bottom-full z-10 mb-2 hidden max-w-[200px] rounded-md bg-ink px-2 py-1 text-xs font-medium text-bg group-hover:block group-focus:block ${edge}`}
                >
                  <div className="whitespace-nowrap">
                    {p.min != null ? `${fmt(p.min, lang)}–${fmt(p.max!, lang)}` : fmt(v, lang)} {t(item.unit, lang)}
                  </div>
                  {p.note && <div className="mt-0.5 whitespace-normal text-xs">{p.note}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-faint">{lang === "vi" ? "Chạm hoặc di chuột vào từng cột để xem chi tiết." : "Tap or hover a bar for details."}</p>
    </div>
  );
}
