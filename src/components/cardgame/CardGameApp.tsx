"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { hashSeed } from "@/lib/cardgame/rng";
import { initGame, recall, resolveChoice, tierOf, nextTier, heartTitle } from "@/lib/cardgame/engine";
import { todaySeedString, encodeShare } from "@/lib/cardgame/share";
import { STARTING_CAPITAL, TOTAL_NODES, HEART_EXHAUSTED } from "@/lib/cardgame/types";
import type { CardStat, GameState } from "@/lib/cardgame/types";
import { fmtVnd, stakeLabel } from "./format";
import { NodeCard, OptionRow } from "./NodeCard";
import { HeartBar } from "./HeartBar";
import { BoardStrip } from "./BoardStrip";

type Flash = { label: string; before: number; after: number; heartBefore: number; heartAfter: number } | null;

const STAKE_FRAC: Record<CardStat["stake"], number> = { quarter: 0.25, half: 0.5, all: 1 };

function preview(wallet: number, card: CardStat, size: "big" | "small") {
  const frac = STAKE_FRAC[card.stake] * (size === "small" ? 0.5 : 1);
  const stake = Math.round(wallet * frac);
  return {
    stake,
    winAfter: Math.round(wallet - stake + stake * card.winMult),
    loseAfter: Math.round(wallet - stake + stake * card.loseMult),
  };
}

export default function CardGameApp() {
  const [state, setState] = useState<GameState | null>(null);
  const [flash, setFlash] = useState<Flash>(null);

  const tier = state ? tierOf(state.wallet) : null;
  const nTier = state ? nextTier(state.wallet) : null;

  const progressPct = useMemo(() => {
    if (!state || !tier) return 0;
    if (!nTier) return 100;
    const span = nTier.min - tier.min;
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
    const heartBefore = state.heart;
    const next = resolveChoice(state, choice);
    const rec = next.history[next.history.length - 1];
    setFlash({ label: rec.label, before, after: next.wallet, heartBefore, heartAfter: next.heart });
    setState(next);
  };

  const onRecall = () => setState((s) => (s ? recall(s) : s));

  if (!state) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-8 text-center">
        <div className="mx-auto max-w-sm">
          <div className="font-display text-2xl font-bold">1986</div>
          <p className="mt-2 text-muted">Bạn vừa trọng sinh. Trong túi: 💰 {fmtVnd(STARTING_CAPITAL)}, trong người: ❤️ 10/10.</p>
          <p className="text-muted">Đi dọc 20 trạm từ 1986 đến 2024 — đừng để hết tiền, đừng để kiệt sức.</p>
        </div>
        <button
          onClick={() => start(false)}
          className="mt-6 rounded-full bg-gold px-8 py-3 font-semibold text-on-gold hover:brightness-110"
        >
          Bước vào trạm đầu tiên →
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
    const title = heartTitle(state.heart);
    const strip = state.history
      .map((h) => (h.outcome === "win" ? "🟩" : h.outcome === "lose" || h.outcome === "trapHit" ? "🟥" : h.outcome === "rest" ? "🛌" : h.outcome === "event" ? "⚡" : "·"))
      .join("");
    const endLine =
      state.endedBy === "hospital" ? "🏥 Bạn kiệt sức giữa chừng, phải nhập viện — tiền còn lại bị trừ một nửa."
      : state.endedBy === "broke" ? "💸 Bạn hết sạch tiền giữa chừng."
      : "🎉 Bạn đi trọn 20 trạm tới năm 2024.";
    const shareCode = encodeShare(state.seed, { wallet: state.wallet, heart: state.heart, tier: finalTier.label });
    const shareText = `Sổ trọng sinh · 🏅 ${finalTier.label} ${title.icon} ${title.vi} · ${fmtVnd(state.wallet)}\n${strip}`;

    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-line bg-surface p-8 text-center">
          <div className="text-sm uppercase tracking-wider text-faint">Chốt sổ</div>
          <p className="mt-1 text-sm text-muted">{endLine}</p>
          <div className="mt-2 font-display text-5xl font-extrabold text-gold">{fmtVnd(state.wallet)}</div>
          <div className="mt-2 font-display text-xl font-bold">
            🏅 {finalTier.label} · {title.icon} {title.vi}
          </div>
          {next && <p className="mt-1 text-sm text-muted">Thiếu {fmtVnd(next.min - state.wallet)} nữa là {next.label}</p>}
          <div className="mt-4 font-mono text-lg tracking-wider">{strip}</div>
          <p className="mt-1 text-xs text-faint">🟩 thắng · 🟥 thua · 🛌 nghỉ · ⚡ biến cố</p>
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
          <h2 className="font-display text-lg font-bold">Hành trình của bạn</h2>
          <ol className="mt-3 space-y-1.5 text-sm">
            {state.history.map((h, i) => (
              <li key={i} className="flex justify-between gap-3 text-muted">
                <span>{h.label}</span>
                <span className="shrink-0 font-mono">{fmtVnd(h.after)} · ❤️{h.heartAfter}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  const node = state.nodes[state.index];
  const exhausted = state.heart <= HEART_EXHAUSTED;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3">
        <div>
          <div className="font-mono text-2xl font-bold tabular text-gold">💰 {fmtVnd(state.wallet)}</div>
          <div className="mt-1"><HeartBar heart={state.heart} /></div>
          <div className="mt-1 text-xs text-faint">Trạm {state.index + 1}/{TOTAL_NODES} · {node.year} · 💡×{state.recallsLeft}</div>
        </div>
        <div className="w-24 text-right">
          <div className="text-xs font-semibold">{tier?.label}</div>
          <div className="mt-1 h-1.5 rounded-full bg-raised">
            <div className="h-1.5 rounded-full bg-gold" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <BoardStrip nodes={state.nodes} index={state.index} history={state.history} />

      {flash && (
        <div
          className={`rounded-xl border p-3 text-center text-sm ${flash.after >= flash.before ? "border-gain/40 bg-gain/10" : "border-loss/40 bg-loss/10"}`}
        >
          <span className="font-medium">{flash.label}</span>
          <span className="ml-2 font-mono">{fmtVnd(flash.before)} → {fmtVnd(flash.after)}</span>
          {flash.heartAfter !== flash.heartBefore && (
            <span className="ml-2 text-loss">❤️ {flash.heartBefore} → {flash.heartAfter}</span>
          )}
        </div>
      )}

      {node.kind === "event" && (
        <div className="rounded-2xl border border-line bg-raised p-6 text-center">
          <div className="text-3xl">{node.event.icon}</div>
          <div className="mt-2 font-display font-semibold">{node.event.title}</div>
          <p className="mt-1 text-sm text-muted">{node.event.story}</p>
          <div className="mt-4 grid gap-2">
            {node.event.options.map((opt) => (
              <OptionRow
                key={opt.id}
                icon={opt.icon}
                label={opt.label}
                winText={undefined}
                loseText={undefined}
                heartText={`${opt.heart > 0 ? "+" : ""}${opt.heart === 0 ? "0" : opt.heart} ❤️`}
                stakeText={Math.abs(opt.money) < 1 ? `${opt.money >= 0 ? "+" : ""}${Math.round(opt.money * 100)}%` : fmtVnd(opt.money)}
                onClick={() => act({ t: "event", option: opt.id })}
              />
            ))}
          </div>
        </div>
      )}

      {node.kind === "single" && (
        <div>
          <NodeCard card={node.card} revealed={state.revealedIds.has(node.card.id)} onReveal={onRecall} recallsLeft={state.recallsLeft} />
          <div className="mt-3 grid gap-2">
            {(() => {
              const big = preview(state.wallet, node.card, "big");
              const small = preview(state.wallet, node.card, "small");
              return (
                <>
                  <OptionRow
                    icon="🔥" label={`Làm lớn (${stakeLabel(node.card.stake, "big")})`}
                    winText={fmtVnd(big.winAfter)} loseText={fmtVnd(big.loseAfter)} heartText="😢 thì −2 ❤️"
                    locked={exhausted ? "Đang kiệt sức, chỉ làm nhỏ được" : undefined}
                    onClick={() => act({ t: "big" })}
                  />
                  <OptionRow
                    icon="🌱" label={`Làm nhỏ (${stakeLabel(node.card.stake, "small")})`}
                    winText={fmtVnd(small.winAfter)} loseText={fmtVnd(small.loseAfter)} heartText="không mất ❤️"
                    onClick={() => act({ t: "small" })}
                  />
                  <OptionRow icon="🛌" label="Nghỉ ngơi, bỏ qua" heartText="+1 ❤️" onClick={() => act({ t: "rest" })} />
                </>
              );
            })()}
          </div>
        </div>
      )}

      {node.kind === "fork" && (
        <div>
          <p className="mb-2 text-center text-sm text-faint">Ngã ba — chọn một làn, hoặc nghỉ cả hai</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {([["left", node.left] as const, ["right", node.right] as const]).map(([side, card]) => {
              const big = preview(state.wallet, card, exhausted ? "small" : "big");
              return (
                <div key={side}>
                  <NodeCard card={card} revealed={state.revealedIds.has(card.id)} onReveal={onRecall} recallsLeft={state.recallsLeft} />
                  <div className="mt-2">
                    <OptionRow
                      icon="➡️" label={`Đi làn này (${stakeLabel(card.stake, exhausted ? "small" : "big")})`}
                      winText={fmtVnd(big.winAfter)} loseText={fmtVnd(big.loseAfter)}
                      heartText={exhausted ? "không mất ❤️" : "😢 thì −2 ❤️"}
                      onClick={() => act({ t: "lane", side })}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => act({ t: "rest" })} className="mt-3 w-full rounded-full border border-line-strong py-2 text-sm text-muted hover:text-ink">
            🛌 Nghỉ cả hai (+1 ❤️)
          </button>
        </div>
      )}

      <Link href="/vi/disclaimer" className="block text-center text-xs text-faint underline">
        Số làm tròn cho trò chơi, không phải khuyến nghị đầu tư
      </Link>
    </div>
  );
}
