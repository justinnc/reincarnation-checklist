"use client";

import { heartColor, heartStatusLabel } from "./format";

export function HeartBar({ heart }: { heart: number }) {
  const color = heartColor(heart);
  const colorClass = color === "green" ? "text-gain" : color === "yellow" ? "text-gold" : "text-loss";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={i < heart ? colorClass : "text-faint/30"}>
            {i < heart ? "❤️" : "🤍"}
          </span>
        ))}
      </div>
      <span className={`text-xs font-semibold ${colorClass}`}>
        {heart}/10 · {heartStatusLabel(heart)}
      </span>
    </div>
  );
}
