"use client";

import { useChecklist } from "@/lib/checklist";

export default function ChecklistProgress({ ids, label }: { ids: string[]; label: string }) {
  const checked = useChecklist();
  const done = ids.filter((id) => checked.has(id)).length;
  const pct = ids.length ? Math.round((done / ids.length) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-raised">
        <div className="h-full rounded-full bg-gold transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm text-muted">
        <span className="font-mono tabular text-ink">{done}/{ids.length}</span> {label}
      </span>
    </div>
  );
}
