"use client";

import Link from "next/link";
import type { CardStat } from "@/lib/cardgame/types";
import { fmtVnd, stakeLabel } from "./format";

function OddsBar({ winIn10 }: { winIn10: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className={`h-2 flex-1 rounded-sm ${i < winIn10 ? "bg-gain" : "bg-loss"}`} />
      ))}
    </div>
  );
}

export function GameCard({
  card,
  wallet,
  revealed,
  onReveal,
  recallsLeft,
  compact = false,
}: {
  card: CardStat;
  wallet: number;
  revealed: boolean;
  onReveal?: () => void;
  recallsLeft: number;
  compact?: boolean;
}) {
  const showReal = card.kind === "trap" && revealed && card.real;
  const odds: { winIn10: number; winMult: number; loseMult: number; loseWhy: string; explain?: string } = showReal
    ? card.real!
    : card;
  const stakeAmt = card.stake === "quarter" ? wallet * 0.25 : card.stake === "half" ? wallet * 0.5 : wallet;
  const winAmt = stakeAmt * odds.winMult;
  const loseAmt = stakeAmt * odds.loseMult;

  return (
    <div
      className={`rounded-2xl border p-4 ${
        showReal ? "border-loss bg-loss/10" : card.kind === "trap" ? "border-gold/50 bg-raised" : "border-line bg-raised"
      } ${compact ? "text-sm" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-faint">
          {showReal ? "🔎 SỰ THẬT" : card.kind === "memory" ? "🧠 KÝ ỨC" : "🗣 TIN ĐỒN"}
        </span>
        <span className="font-mono text-xs text-faint">{card.year}</span>
      </div>
      <div className="mt-2 text-center text-3xl">{card.icon}</div>
      <div className="mt-2 text-center font-display font-semibold">{card.verb}</div>
      <p className="mt-1 text-center text-xs text-muted">
        {showReal ? odds.explain ?? card.story : card.story}
      </p>
      <div className="mt-3 border-t border-line pt-2 text-sm">
        <div className="flex justify-between text-faint">
          <span>Bỏ {stakeLabel(card.stake)}</span>
          <span className="font-mono">{fmtVnd(stakeAmt)}</span>
        </div>
        <div className="mt-2">
          <OddsBar winIn10={odds.winIn10} />
        </div>
        <div className="mt-2 flex justify-between">
          <span className="text-gain">🟩 {odds.winIn10}/10</span>
          <span className="font-mono text-gain">nhận {fmtVnd(winAmt)} (×{odds.winMult})</span>
        </div>
        <div className="flex justify-between">
          <span className="text-loss">🟥 {10 - odds.winIn10}/10</span>
          <span className="font-mono text-loss">còn {fmtVnd(loseAmt)}</span>
        </div>
        {!showReal && <p className="mt-1 text-xs text-faint">{odds.loseWhy}</p>}
      </div>
      {card.kind === "trap" && !revealed && onReveal && recallsLeft > 0 && (
        <button
          onClick={onReveal}
          className="mt-3 w-full rounded-lg border border-gold/50 py-1.5 text-xs font-medium text-gold hover:bg-gold/10"
        >
          💡 Nhớ lại ({recallsLeft} lần)
        </button>
      )}
      {revealed && (
        <Link href={`/vi/vn/${card.milestoneId}`} className="mt-2 block text-center text-xs text-gold underline">
          Chuyện thật →
        </Link>
      )}
    </div>
  );
}
