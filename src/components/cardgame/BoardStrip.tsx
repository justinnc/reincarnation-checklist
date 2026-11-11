"use client";

import { useEffect, useRef } from "react";
import type { BoardNode, NodeRecord } from "@/lib/cardgame/types";

function nodeIcon(node: BoardNode): string {
  if (node.kind === "event") return "⚡";
  if (node.kind === "fork") return "🔀";
  return node.card.kind === "trap" ? "⚠️" : node.card.kind === "rumor" ? "🗣" : "🧠";
}

function resultIcon(rec: NodeRecord | undefined): string {
  if (!rec) return "";
  if (rec.outcome === "win") return "😄";
  if (rec.outcome === "lose" || rec.outcome === "trapHit") return "😢";
  if (rec.outcome === "rest") return "🛌";
  if (rec.outcome === "event") return "⚡";
  return "";
}

/** A roadmap that shows each stop's type but conceals its story until arrival. */
export function BoardStrip({ nodes, index, history }: { nodes: BoardNode[]; index: number; history: NodeRecord[] }) {
  const currentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [index]);

  return (
    <div className="max-h-56 overflow-y-auto rounded-2xl border border-line bg-raised/50 p-3">
      <div className="flex flex-col gap-1.5">
        {nodes.map((node, i) => {
          const rec = history[i];
          const isCurrent = i === index;
          const isDone = i < index;
          return (
            <div
              key={i}
              ref={isCurrent ? currentRef : undefined}
              className={`flex items-center gap-2 rounded-lg px-2 py-1 text-xs ${
                isCurrent ? "bg-gold/20 font-semibold ring-1 ring-gold" : isDone ? "opacity-70" : "opacity-50"
              }`}
            >
              <span className="w-8 font-mono text-faint">{node.year}</span>
              <span>{isDone ? resultIcon(rec) || nodeIcon(node) : nodeIcon(node)}</span>
              <span className="flex-1 truncate">
                {!isDone && !isCurrent
                  ? node.kind === "event" ? "Sự kiện sắp tới" : node.kind === "fork" ? "Ngã rẽ sắp tới" : "Lựa chọn sắp tới"
                  : node.kind === "event" ? node.event.title : node.kind === "fork" ? `${node.left.verb} / ${node.right.verb}` : node.card.verb}
              </span>
              {isCurrent && <span className="text-gold">👈 bạn đang ở đây</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
