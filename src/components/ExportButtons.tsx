"use client";

import type { ExportFile } from "@/lib/exportData";
import type { Locale } from "@/lib/i18n";

function download(filename: string, text: string, mime: string) {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Two small download buttons. `build` runs on click, so nothing is serialised until asked. */
export default function ExportButtons({ build, lang }: { build: () => ExportFile; lang: Locale }) {
  const label = lang === "vi" ? "Tải dữ liệu" : "Download data";
  const cls = "rounded-full border border-line bg-raised px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-gold hover:text-gold";
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="text-xs text-faint">{label}:</span>
      <button
        type="button"
        className={cls}
        onClick={() => {
          const f = build();
          // BOM so Excel opens Vietnamese text as UTF-8.
          download(`${f.name}.csv`, String.fromCharCode(0xfeff) + f.csv, "text/csv");
        }}
      >
        CSV
      </button>
      <button
        type="button"
        className={cls}
        onClick={() => {
          const f = build();
          download(`${f.name}.json`, f.json, "application/json");
        }}
      >
        JSON
      </button>
    </div>
  );
}
