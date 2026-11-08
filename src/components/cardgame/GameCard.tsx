"use client";

import Link from "next/link";
import type { CardStat } from "@/lib/cardgame/types";
import { fmtVnd, stakeLabel } from "./format";

/** Every pip pairs a color AND a face AND is grouped under a plain-word label —
 * never color alone, so colorblind players and kids both get it instantly. */
function OddsFaces({ winIn10 }: { winIn10: number }) {
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
            i < winIn10 ? "bg-gain/20" : "bg-loss/20"
          }`}
          aria-hidden
        >
          {i < winIn10 ? "😄" : "😢"}
        </span>
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
  const loseCount = 10 - odds.winIn10;

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

      <div className="mt-3 border-t border-line pt-3 text-sm">
        <p className="text-center text-faint">
          Bạn bỏ ra <span className="font-mono font-semibold text-ink">{fmtVnd(stakeAmt)}</span> ({stakeLabel(card.stake)})
        </p>

        <p className="mt-3 text-center text-xs text-faint">Nếu chơi 10 lần giống vầy thì thường:</p>
        <div className="mt-1.5">
          <OddsFaces winIn10={odds.winIn10} />
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-gain/10 px-2.5 py-1.5">
            <span className="font-medium text-gain">😄 {odds.winIn10} lần MAY MẮN</span>
            <span className="font-mono font-semibold text-gain">
              → có {fmtVnd(winAmt)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-loss/10 px-2.5 py-1.5">
            <span className="font-medium text-loss">😢 {loseCount} lần XUI</span>
            <span className="font-mono font-semibold text-loss">→ còn {fmtVnd(loseAmt)}</span>
          </div>
        </div>
        {!showReal && <p className="mt-1.5 text-center text-xs text-faint">Lý do xui: {odds.loseWhy}</p>}
      </div>

      {card.kind === "trap" && !revealed && onReveal && recallsLeft > 0 && (
        <button
          onClick={onReveal}
          className="mt-3 w-full rounded-lg border border-gold/50 py-1.5 text-xs font-medium text-gold hover:bg-gold/10"
        >
          💡 Nhớ lại xem có đúng không ({recallsLeft} lần)
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
