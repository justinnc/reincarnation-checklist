"use client";

import { toggleChecked, useChecklist } from "@/lib/checklist";

export default function CheckButton({ id, label, labelOn, compact = false }: { id: string; label: string; labelOn: string; compact?: boolean }) {
  const checked = useChecklist().has(id);
  return (
    <button
      type="button"
      aria-pressed={checked}
      title={checked ? labelOn : label}
      onClick={() => toggleChecked(id)}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border text-sm font-medium transition-colors ${
        compact ? "h-8 w-8 justify-center" : "px-3 py-1.5"
      } ${checked ? "border-gold bg-gold text-on-gold" : "border-line-strong text-muted hover:border-gold hover:text-ink"}`}
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
        {checked ? (
          <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        )}
      </svg>
      {!compact && <span>{checked ? labelOn : label}</span>}
      {compact && <span className="sr-only">{checked ? labelOn : label}</span>}
    </button>
  );
}
