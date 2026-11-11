"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { t, type Locale } from "@/lib/i18n";
import type { Country, Milestone } from "@/lib/types";
import { searchMilestones } from "@/lib/search";
import { formatDate, formatDrop, formatMultiple } from "@/lib/format";

const COPY = {
  vi: {
    placeholder: "Tìm theo sự kiện, tài sản, từ khóa… (vd: ngân hàng, miền Bắc, 1997)",
    hint: "Tìm xuyên suốt tất cả 15 quốc gia và 328 mốc lịch sử — khớp tiêu đề, mô tả, mẹo người biết trước và cạm bẫy.",
    results: (n: number) => `${n} kết quả`,
    empty: "Chưa gõ gì — hãy thử một từ khóa.",
    noMatch: "Không tìm thấy mốc nào khớp. Thử từ khóa khác hoặc ngắn hơn.",
  },
  en: {
    placeholder: "Search events, assets, keywords… (e.g. banking, embargo, 1997)",
    hint: "Searches across all 15 countries and 328 milestones — matches titles, descriptions, insider tips and pitfalls.",
    results: (n: number) => `${n} results`,
    empty: "Nothing typed yet — try a keyword.",
    noMatch: "No milestones matched. Try a different or shorter keyword.",
  },
};

export default function GlobalSearch({
  milestones,
  countries,
  lang,
}: {
  milestones: Milestone[];
  countries: Country[];
  lang: Locale;
}) {
  const search = useSearchParams();
  const [query, setQuery] = useState(search.get("q") ?? "");
  const copy = COPY[lang];
  const countryMap = useMemo(() => new Map(countries.map((c) => [c.code, c])), [countries]);

  // Vietnamese readers mostly look for Vietnamese events: rank those first among equal matches.
  const results = useMemo(
    () => searchMilestones(milestones, lang, query, { preferCountry: lang === "vi" ? "vn" : undefined }),
    [milestones, lang, query],
  );

  const onChange = (value: string) => {
    setQuery(value);
    const params = new URLSearchParams(window.location.search);
    if (value) params.set("q", value);
    else params.delete("q");
    window.history.replaceState(null, "", params.toString() ? `?${params.toString()}` : window.location.pathname);
  };

  return (
    <div className="space-y-6">
      <div>
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={copy.placeholder}
          className="w-full rounded-2xl border border-line-strong bg-raised px-5 py-4 text-lg focus:border-gold focus:outline-none"
        />
        <p className="mt-2 text-xs text-faint">{copy.hint}</p>
      </div>

      {query.trim() === "" ? (
        <p className="text-muted">{copy.empty}</p>
      ) : results.length === 0 ? (
        <p className="text-muted">{copy.noMatch}</p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-faint">{copy.results(results.length)}</p>
          <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
            {results.map((m) => {
              const c = countryMap.get(m.country);
              return (
                <Link
                  key={m.id}
                  href={`/${lang}/${m.country}/${m.id}`}
                  className="flex items-start gap-3 p-4 transition-colors hover:bg-raised sm:p-5"
                >
                  <span className="mt-0.5 shrink-0 text-xl">{c?.flag}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono tabular text-gold">{formatDate(m.date, lang)}</span>
                      {c && <span className="text-faint">· {t(c.name, lang)}</span>}
                    </div>
                    <div className="mt-0.5 font-display font-bold leading-snug">{t(m.title, lang)}</div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{t(m.summary ?? m.description, lang)}</p>
                  </div>
                  {(m.opportunity.returnMultiple ?? 0) > 1 ? (
                    <span className="mt-0.5 shrink-0 rounded-md bg-gain px-2 py-0.5 font-mono text-xs font-bold text-on-gain">
                      {formatMultiple(m.opportunity.returnMultiple!, lang)}
                    </span>
                  ) : (m.opportunity.returnMultiple ?? 1) < 1 ? (
                    <span className="mt-0.5 shrink-0 rounded-md bg-danger px-2 py-0.5 font-mono text-xs font-bold text-[#2a0606]">
                      ↓ {formatDrop(m.opportunity.returnMultiple!, lang)}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
