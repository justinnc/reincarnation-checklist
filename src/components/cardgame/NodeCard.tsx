"use client";

import Link from "next/link";
import type { CardStat } from "@/lib/cardgame/types";
import { fmtVnd } from "./format";

function OddsFaces({ winIn10 }: { winIn10: number }) {
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${i < winIn10 ? "bg-gain/20" : "bg-loss/20"}`}
          aria-hidden
        >
          {i < winIn10 ? "😄" : "😢"}
        </span>
      ))}
    </div>
  );
}

export function NodeCard({
  card,
  revealed,
  onReveal,
  recallsLeft,
}: {
  card: CardStat;
  revealed: boolean;
  onReveal?: () => void;
  recallsLeft: number;
}) {
  const showReal = card.kind !== "memory" && revealed && card.real;
  const odds = showReal ? card.real! : card;
  const canRecall = card.kind !== "memory" && !revealed && onReveal && recallsLeft > 0;

  return (
    <div className={`rounded-2xl border p-4 ${showReal ? "border-loss bg-loss/10" : "border-line bg-raised"}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-faint">
          {showReal ? "🔎 SỰ THẬT" : card.kind === "memory" ? "🧠 KÝ ỨC" : "🗣 TIN ĐỒN"}
        </span>
        <span className="font-mono text-xs text-faint">{card.year}</span>
      </div>
      <div className="mt-2 text-center text-3xl">{card.icon}</div>
      <div className="mt-2 text-center font-display font-semibold">{card.verb}</div>
      <p className="mt-1 text-center text-xs text-muted">{showReal && card.real ? card.real.explain : card.story}</p>
      <p className="mt-3 text-center text-xs text-faint">Nếu chơi 10 lần giống vầy thì thường:</p>
      <div className="mt-1.5">
        <OddsFaces winIn10={odds.winIn10} />
      </div>
      <p className="mt-1 text-center text-xs text-faint">
        😄 {odds.winIn10} lần MAY · 😢 {10 - odds.winIn10} lần XUI
      </p>
      {canRecall && (
        <button onClick={onReveal} className="mt-3 w-full rounded-lg border border-gold/50 py-1.5 text-xs font-medium text-gold hover:bg-gold/10">
          💡 Nhớ lại xem có đúng không ({recallsLeft} lần)
        </button>
      )}
      {revealed && card.kind !== "memory" && (
        <Link href={`/vi/vn/${card.milestoneId}`} className="mt-2 block text-center text-xs text-gold underline">
          Chuyện thật →
        </Link>
      )}
    </div>
  );
}

export function OptionRow({
  icon,
  label,
  stakeText,
  winText,
  loseText,
  heartText,
  locked,
  onClick,
}: {
  icon: string;
  label: string;
  stakeText?: string;
  winText?: string;
  loseText?: string;
  heartText?: string;
  locked?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!!locked}
      className={`w-full rounded-xl border p-3 text-left text-sm transition ${
        locked ? "cursor-not-allowed border-line bg-raised/50 opacity-50" : "border-line-strong bg-raised hover:border-gold"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">
          {icon} {label}
        </span>
        {stakeText && <span className="font-mono text-xs text-faint">{stakeText}</span>}
      </div>
      {locked ? (
        <p className="mt-1 text-xs text-loss">🔒 {locked}</p>
      ) : (
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
          {winText && <span className="text-gain">😄 → {winText}</span>}
          {loseText && <span className="text-loss">😢 → {loseText}</span>}
          {heartText && <span className="text-gold">{heartText}</span>}
        </div>
      )}
    </button>
  );
}

export function fmtWalletDelta(n: number): string {
  return fmtVnd(n);
}
