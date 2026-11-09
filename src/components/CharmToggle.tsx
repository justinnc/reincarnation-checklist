"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { toggleCharmId, useCharmIds } from "@/lib/charm";

export function CharmToggle({ id, lang }: { id: string; lang: Locale }) {
  const ids = useCharmIds();
  const saved = ids.includes(id);
  const label =
    lang === "vi"
      ? saved
        ? "🧿 Đã lưu Bùa"
        : "+ Lưu vào Bùa"
      : saved
        ? "🧿 Saved to Cheat Sheet"
        : "+ Save to Cheat Sheet";

  return (
    <button
      type="button"
      onClick={() => toggleCharmId(id)}
      aria-pressed={saved}
      className={`rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors print:hidden ${
        saved
          ? "border-gold bg-gold/20 text-gold"
          : "border-line bg-raised text-muted hover:border-gold hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

export function CharmNavBadge({ lang }: { lang: Locale }) {
  const ids = useCharmIds();
  const text = lang === "vi" ? "Bùa" : "Cheat Sheet";
  return (
    <Link
      href={`/${lang}/charm`}
      className="shrink-0 inline-flex items-center gap-1 rounded-full border border-gold/40 bg-raised px-2.5 py-1 text-xs font-semibold text-gold hover:bg-gold hover:text-on-gold transition-colors"
    >
      <span>🧿 {text}</span>
      {ids.length > 0 && (
        <span className="rounded-full bg-gold px-1.5 py-0.2 font-mono text-[11px] text-on-gold">
          {ids.length}
        </span>
      )}
    </Link>
  );
}
