import type { Level } from "@/lib/types";

const riskColor: Record<Level, string> = {
  low: "text-gain border-gain/40",
  medium: "text-warning border-warning/40",
  high: "text-danger border-danger/40",
};

export function RiskBadge({ level, label, levelLabel }: { level: Level; label: string; levelLabel: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs ${riskColor[level]}`}>
      <span className="opacity-70">{label}</span> {levelLabel}
    </span>
  );
}

export function MultipleBadge({ text, large = false }: { text: string; large?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-md bg-gain font-mono font-semibold tabular text-on-gain ${
        large ? "px-3 py-1 text-2xl" : "px-2 py-0.5 text-sm"
      }`}
    >
      {text}
    </span>
  );
}

export function UnverifiedBadge({ label }: { label: string }) {
  return <span className="rounded-md border border-danger/40 px-2 py-0.5 text-xs text-danger">{label}</span>;
}

export function DropBadge({ text, label, large = false }: { text: string; label: string; large?: boolean }) {
  return (
    <span
      title={label}
      className={`inline-flex items-center gap-1.5 rounded-md bg-danger font-mono font-semibold tabular text-[#2a0606] ${
        large ? "px-3 py-1 text-2xl" : "px-2 py-0.5 text-sm"
      }`}
    >
      ↓ {text}
    </span>
  );
}
