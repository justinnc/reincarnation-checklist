"use client";

import { useChecklist } from "@/lib/checklist";

export default function ChecklistProgress({ ids, label }: { ids: string[]; label: string }) {
  const checked = useChecklist();
  const done = ids.filter((id) => checked.has(id)).length;
  const pct = ids.length ? Math.round((done / ids.length) * 100) : 0;
  return (
    <div className="flex w-full max-w-xs items-center gap-3">
      <div className="h-1.5 min-w-12 flex-1 overflow-hidden rounded-full bg-raised">
        <div className="h-full rounded-full bg-gold transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <span className="shrink-0 whitespace-nowrap text-sm text-muted">
        <span className="font-mono tabular text-ink">{done}/{ids.length}</span> {label}
      </span>
    </div>
  );
}
