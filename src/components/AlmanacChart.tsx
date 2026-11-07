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
      <div className="flex items-end gap-1 overflow-x-auto rounded-xl border border-line bg-raised p-4 sm:gap-2">
        {pts.map((p, i) => {
          const label = p.year ?? p.date;
          const v = pointValue(p)!;
          const barMin = ((( p.min ?? v) - min) / span) * 100;
          const barMax = (((p.max ?? v) - min) / span) * 100;
          return (
            <div key={i} className="group relative flex w-9 shrink-0 flex-col items-center gap-2 sm:w-12">
              <div className="relative h-32 w-3 overflow-hidden rounded-full bg-line sm:w-4">
                <div
                  className="absolute bottom-0 w-full rounded-full bg-gold transition-all group-hover:bg-gain"
                  style={{ height: `${barMax}%`, top: "auto" }}
                />
                {p.min != null && (
                  <div className="absolute w-full rounded-full bg-gold/40" style={{ bottom: `${barMin}%`, height: `${Math.max(2, barMax - barMin)}%` }} />
                )}
              </div>
              <span className="font-mono text-[10px] tabular text-faint sm:text-xs">{label}</span>
              <div className="pointer-events-none absolute bottom-full mb-2 hidden whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-bg group-hover:block">
                {p.min != null ? `${fmt(p.min, lang)}–${fmt(p.max!, lang)}` : fmt(v, lang)} {t(item.unit, lang)}
                {p.note && <div className="max-w-[200px] whitespace-normal text-[10px] opacity-80">{p.note}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-faint">{lang === "vi" ? "Di chuột vào từng cột để xem chi tiết." : "Hover a bar for details."}</p>
    </div>
  );
}
