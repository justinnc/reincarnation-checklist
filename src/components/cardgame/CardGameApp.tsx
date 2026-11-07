"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { hashSeed } from "@/lib/cardgame/rng";
import { initGame, recall, resolveChoice, tierOf, nextTier } from "@/lib/cardgame/engine";
import { todaySeedString, encodeShare } from "@/lib/cardgame/share";
import { STARTING_CAPITAL, TOTAL_TURNS } from "@/lib/cardgame/types";
import type { GameState } from "@/lib/cardgame/types";
import { fmtVnd } from "./format";
import { GameCard } from "./GameCard";

type Flash = { label: string; before: number; after: number } | null;

export default function CardGameApp() {
  const [state, setState] = useState<GameState | null>(null);
  const [flash, setFlash] = useState<Flash>(null);

  const tier = state ? tierOf(state.wallet) : null;
  const nTier = state ? nextTier(state.wallet) : null;

  const progressPct = useMemo(() => {
    if (!state || !tier) return 0;
    const next = nTier;
    if (!next) return 100;
    const span = next.min - tier.min;
    return span > 0 ? Math.min(100, ((state.wallet - tier.min) / span) * 100) : 100;
  }, [state, tier, nTier]);

  const start = (daily: boolean) => {
    const seed = daily ? hashSeed(todaySeedString()) : Math.floor(Math.random() * 2 ** 31);
    setFlash(null);
    setState(initGame(seed));
  };

  const act = (choice: Parameters<typeof resolveChoice>[1]) => {
    if (!state) return;
    const before = state.wallet;
    const next = resolveChoice(state, choice);
    const rec = next.history[next.history.length - 1];
    setFlash({ label: rec.label, before, after: next.wallet });
    setState(next);
  };

  const onRecall = () => setState((s) => (s ? recall(s) : s));

  if (!state) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-8 text-center">
        <div className="mx-auto max-w-sm">
          <div className="font-display text-2xl font-bold">1986</div>
          <p className="mt-2 text-muted">Bạn vừa trọng sinh. Trong túi: 💰 {fmtVnd(STARTING_CAPITAL)}.</p>
          <p className="text-muted">Bạn nhớ hết 40 năm tới.</p>
        </div>
        <button
          onClick={() => start(false)}
          className="mt-6 rounded-full bg-gold px-8 py-3 font-semibold text-on-gold hover:brightness-110"
        >
          Lật lá đầu tiên →
        </button>
        <div>
          <button onClick={() => start(true)} className="mt-3 text-sm text-muted underline">
            Đề hôm nay
          </button>
        </div>
      </div>
    );
  }

  if (state.finished) {
    const finalTier = tierOf(state.wallet);
    const next = nextTier(state.wallet);
    const strip = state.history
      .map((h) => (h.outcome === "win" ? "🟩" : h.outcome === "lose" || h.outcome === "trapHit" ? "🟥" : h.outcome === "trapAvoided" ? "⛔" : h.outcome === "event" ? "⚡" : "·"))
      .join("");
    const shareCode = encodeShare(state.seed, { wallet: state.wallet, tier: finalTier.label });
    const shareText = `Sổ trọng sinh · 🏅 ${finalTier.label} · ${fmtVnd(state.wallet)}\n${strip}`;

    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-line bg-surface p-8 text-center">
          <div className="text-sm uppercase tracking-wider text-faint">Năm 2025 — chốt sổ</div>
          <div className="mt-2 font-display text-5xl font-extrabold text-gold">{fmtVnd(state.wallet)}</div>
          <div className="mt-2 font-display text-xl font-bold">🏅 {finalTier.label}</div>
          {next && <p className="mt-1 text-sm text-muted">Thiếu {fmtVnd(next.min - state.wallet)} nữa là {next.label}</p>}
          <div className="mt-4 font-mono text-lg tracking-wider">{strip}</div>
          <p className="mt-1 text-xs text-faint">🟩 thắng · 🟥 thua · ⛔ né bẫy · ⚡ biến cố</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigator.clipboard?.writeText(shareText + `\nhttps://reincarnation-checklist.vn/vi/simulator?s=${shareCode}`)}
              className="rounded-full border border-line-strong px-5 py-2 text-sm font-semibold text-muted hover:text-ink"
            >
              Chia sẻ
            </button>
            <button onClick={() => start(false)} className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-on-gold hover:brightness-110">
              Chơi lại
            </button>
            <button onClick={() => start(true)} className="rounded-full border border-line-strong px-5 py-2 text-sm font-semibold text-muted hover:text-ink">
              Đề hôm nay
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-lg font-bold">20 lá của bạn</h2>
          <ol className="mt-3 space-y-1.5 text-sm">
            {state.history.map((h, i) => (
              <li key={i} className="flex justify-between gap-3 text-muted">
                <span>{h.label}</span>
                <span className="shrink-0 font-mono">{fmtVnd(h.after)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  const turn = state.turns[state.turnIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3">
        <div>
          <div className="font-mono text-2xl font-bold tabular text-gold">💰 {fmtVnd(state.wallet)}</div>
          <div className="text-xs text-faint">Lá {state.turnIndex + 1}/{TOTAL_TURNS} · 💡×{state.recallsLeft}</div>
        </div>
        <div className="w-28 text-right">
          <div className="text-xs font-semibold">{tier?.label}</div>
          <div className="mt-1 h-1.5 rounded-full bg-raised">
            <div className="h-1.5 rounded-full bg-gold" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {flash && (
        <div
          className={`rounded-xl border p-3 text-center text-sm ${flash.after >= flash.before ? "border-gain/40 bg-gain/10" : "border-loss/40 bg-loss/10"}`}
        >
          <span className="font-medium">{flash.label}</span>
          <span className="ml-2 font-mono">{fmtVnd(flash.before)} → {fmtVnd(flash.after)}</span>
        </div>
      )}

      {turn.kind === "event" && (
        <div className="rounded-2xl border border-line bg-raised p-6 text-center">
          <div className="text-3xl">{turn.event.icon}</div>
          <div className="mt-2 font-display font-semibold">{turn.event.title}</div>
          <p className="mt-1 text-sm text-muted">{turn.event.story}</p>
          <button onClick={() => act({ t: "ack" })} className="mt-4 rounded-full bg-gold px-6 py-2 text-sm font-semibold text-on-gold">
            Tiếp →
          </button>
        </div>
      )}

      {turn.kind === "single" && (
        <div>
          <GameCard
            card={turn.card}
            wallet={state.wallet}
            revealed={state.revealedTrapIds.has(turn.card.id)}
            onReveal={onRecall}
            recallsLeft={state.recallsLeft}
          />
          <div className="mt-3 flex gap-3">
            <button onClick={() => act({ t: "skip" })} className="flex-1 rounded-full border border-line-strong py-2.5 text-sm font-semibold text-muted hover:text-ink">
              ✕ Bỏ qua
            </button>
            <button onClick={() => act({ t: "accept" })} className="flex-1 rounded-full bg-gold py-2.5 text-sm font-semibold text-on-gold hover:brightness-110">
              ✓ Nhận
            </button>
          </div>
        </div>
      )}

      {turn.kind === "fork" && (
        <div>
          <p className="mb-2 text-center text-sm text-faint">Chọn MỘT lá (hoặc bỏ cả hai)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <GameCard card={turn.left} wallet={state.wallet} revealed={state.revealedTrapIds.has(turn.left.id)} onReveal={onRecall} recallsLeft={state.recallsLeft} compact />
              <button onClick={() => act({ t: "pickLeft" })} className="mt-2 w-full rounded-full bg-gold py-2 text-sm font-semibold text-on-gold hover:brightness-110">
                Chọn lá này
              </button>
            </div>
            <div>
              <GameCard card={turn.right} wallet={state.wallet} revealed={state.revealedTrapIds.has(turn.right.id)} onReveal={onRecall} recallsLeft={state.recallsLeft} compact />
              <button onClick={() => act({ t: "pickRight" })} className="mt-2 w-full rounded-full bg-gold py-2 text-sm font-semibold text-on-gold hover:brightness-110">
                Chọn lá này
              </button>
            </div>
          </div>
          <button onClick={() => act({ t: "skipBoth" })} className="mt-3 w-full rounded-full border border-line-strong py-2 text-sm text-muted hover:text-ink">
            Bỏ cả hai
          </button>
        </div>
      )}

      <Link href="/vi/disclaimer" className="block text-center text-xs text-faint underline">
        Số làm tròn cho trò chơi, không phải khuyến nghị đầu tư
      </Link>
    </div>
  );
}
