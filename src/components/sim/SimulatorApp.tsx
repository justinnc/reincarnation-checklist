"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { advanceYear, applyActions, defaultConfig, initGame, provideData } from "@/lib/sim/engine";
import { vnAssets, vnPrices, SIM_MAX_START_YEAR, SIM_MIN_START_YEAR, SIM_END_YEAR } from "@/lib/sim/data";
import { baselineFinalReal, optimalFinalReal, rankForScore, rebirthScore } from "@/lib/sim/scoring";
import { encodeShare, todaySeedString } from "@/lib/sim/share";
import { hashSeed } from "@/lib/sim/rng";
import { cardsFromMilestones, pickCardsForState } from "@/lib/sim/cards";
import { getMilestones } from "@/lib/data";
import type { AssetId, Difficulty, GameState, OpportunityCard } from "@/lib/sim/types";

provideData(vnPrices);
const ALL_CARDS = cardsFromMilestones(getMilestones("vn"));

const RANK_LABEL: Record<string, { vi: string; en: string }> = {
  pham_nhan: { vi: "Phàm nhân", en: "Mere mortal" },
  tieu_thuong: { vi: "Tiểu thương", en: "Small trader" },
  trung_luu: { vi: "Trung lưu", en: "Middle class" },
  dai_gia: { vi: "Đại gia", en: "Tycoon" },
  tai_phiet: { vi: "Tài phiệt", en: "Magnate" },
  thien_menh: { vi: "Thiên mệnh chi tử", en: "Child of destiny" },
};

const RISK_LABEL: Record<string, { vi: string; en: string }> = {
  low: { vi: "Rủi ro thấp", en: "Low risk" },
  medium: { vi: "Rủi ro vừa", en: "Medium risk" },
  high: { vi: "Rủi ro cao", en: "High risk" },
};

function fmtVnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + " ₫";
}

export default function SimulatorApp({ lang }: { lang: Locale }) {
  const [startYear, setStartYear] = useState(2000);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [state, setState] = useState<GameState | null>(null);
  const [buyAmount, setBuyAmount] = useState<Record<AssetId, string>>({} as Record<AssetId, string>);
  const [lastEvent, setLastEvent] = useState<{ vi: string; en: string } | null>(null);

  const start = (daily = false) => {
    const seed = daily ? hashSeed(todaySeedString()) : Math.floor(Math.random() * 2 ** 31);
    const config = defaultConfig({ startYear, difficulty, daily: daily ? todaySeedString() : undefined });
    setLastEvent(null);
    const fresh = initGame(seed, config);
    fresh.pendingCards = pickCardsForState(fresh, ALL_CARDS, 2);
    setState(fresh);
  };

  const netWorthReal = useMemo(() => {
    if (!state) return 0;
    let nominal = state.cashNominal;
    for (const h of state.holdings) {
      const close = vnPrices.closes[h.asset]?.[state.year];
      nominal += close != null ? h.units * close : h.costBasisNominal;
    }
    for (const c of state.activeCards) nominal += c.investedNominal;
    return nominal;
  }, [state]);

  if (!state) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-muted">{lang === "vi" ? "Năm trọng sinh" : "Rebirth year"}</span>
            <input
              type="range"
              min={SIM_MIN_START_YEAR}
              max={SIM_MAX_START_YEAR}
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              className="mt-2 w-full accent-[#f4b740]"
            />
            <div className="mt-1 font-mono text-3xl font-bold tabular text-gold">{startYear}</div>
          </label>
          <label className="block">
            <span className="text-sm text-muted">{lang === "vi" ? "Độ khó" : "Difficulty"}</span>
            <div className="mt-2 flex gap-2">
              {(["easy", "normal", "hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`rounded-full px-3 py-1.5 text-sm ${difficulty === d ? "bg-gold text-on-gold" : "bg-raised text-muted"}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </label>
        </div>
        <p className="mt-6 max-w-xl text-sm text-muted">
          {lang === "vi"
            ? "Mỗi năm bạn sẽ nhận được 1–2 \"thẻ cơ hội\" lấy từ các mốc lịch sử thật — nhận thẻ (tốn tiền, khoá vài năm, có rủi ro) hoặc bỏ qua."
            : "Each year you'll draw 1–2 \"opportunity cards\" from real historical milestones — take one (costs money, locks up for years, carries risk) or skip it."}
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={() => start(false)} className="rounded-full bg-gold px-6 py-3 font-semibold text-on-gold hover:brightness-110">
            {lang === "vi" ? "Bắt đầu" : "Start"} →
          </button>
          <button onClick={() => start(true)} className="rounded-full border border-line-strong px-6 py-3 font-semibold text-muted hover:text-ink">
            {lang === "vi" ? "Đề của ngày" : "Daily challenge"}
          </button>
        </div>
      </div>
    );
  }

  if (state.finished) {
    const baseline = baselineFinalReal(state.config, SIM_END_YEAR);
    const optimal = optimalFinalReal(state.config, SIM_END_YEAR);
    const score = rebirthScore(netWorthReal, baseline, optimal);
    const rank = rankForScore(score);
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/${lang}/simulator?s=${encodeShare({ v: 1, seed: state.seed, config: state.config, actions: [] })}`
        : "";

    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-line bg-surface p-8 text-center">
          <div className="text-sm uppercase tracking-wider text-faint">{lang === "vi" ? "Điểm Trọng sinh" : "Rebirth Score"}</div>
          <div className="mt-2 font-display text-7xl font-extrabold text-gold">{score}</div>
          <div className="mt-2 font-display text-2xl font-bold">{t(RANK_LABEL[rank], lang)}</div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-raised p-4">
              <div className="text-xs text-faint">{lang === "vi" ? "Tài sản cuối (thực)" : "Final (real)"}</div>
              <div className="mt-1 font-mono text-lg font-semibold">{fmtVnd(netWorthReal)}</div>
            </div>
            <div className="rounded-xl bg-raised p-4">
              <div className="text-xs text-faint">{lang === "vi" ? "Nếu gửi tiết kiệm" : "If you only saved"}</div>
              <div className="mt-1 font-mono text-lg">{fmtVnd(baseline)}</div>
            </div>
            <div className="rounded-xl bg-raised p-4">
              <div className="text-xs text-faint">{lang === "vi" ? "Tối ưu lý thuyết" : "Theoretical optimal"}</div>
              <div className="mt-1 font-mono text-lg text-gain">{fmtVnd(optimal)}</div>
            </div>
          </div>
          {shareUrl && <p className="mt-6 break-all rounded-lg bg-raised p-3 text-left font-mono text-xs text-faint">{shareUrl}</p>}
          <button onClick={() => setState(null)} className="mt-6 rounded-full bg-gold px-6 py-3 font-semibold text-on-gold hover:brightness-110">
            {lang === "vi" ? "Chơi lại" : "Play again"}
          </button>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-lg font-bold">{lang === "vi" ? "Nhật ký hành trình" : "Journey log"}</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {state.log.map((l, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 font-mono text-gold">{l.year}</span>
                <span className="text-muted">{t(l.lines[0], lang)}</span>
              </li>
            ))}
            {state.log.length === 0 && <li className="text-faint">{lang === "vi" ? "Một hành trình yên bình, không biến cố." : "A quiet journey, no events."}</li>}
          </ol>
        </div>
      </div>
    );
  }

  const takeCard = (card: OpportunityCard) => {
    setState((prev) => (prev ? applyActions(prev, [{ t: "takeCard", cardId: card.id }]) : prev));
  };
  const skipCard = (card: OpportunityCard) => {
    setState((prev) => (prev ? applyActions(prev, [{ t: "skipCard", cardId: card.id }]) : prev));
  };

  const goNextYear = () => {
    if (!state) return;
    let next = advanceYear(state);
    const freshEvent = next.log.find((l) => l.year === next.year);
    setLastEvent(freshEvent ? freshEvent.lines[0] : null);
    if (next.year > SIM_END_YEAR) {
      next.finished = true;
    } else if (next.pendingCards.length === 0) {
      next = { ...next, pendingCards: pickCardsForState(next, ALL_CARDS, 2) };
    }
    setState(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-5">
        <div>
          <div className="font-mono text-xs text-faint">{lang === "vi" ? "Năm" : "Year"} / {lang === "vi" ? "Tuổi" : "Age"}</div>
          <div className="font-display text-3xl font-bold text-gold">
            {state.year} <span className="text-base text-muted">· {state.age} {lang === "vi" ? "tuổi" : "yo"}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs text-faint">{lang === "vi" ? "Tài sản (danh nghĩa)" : "Net worth (nominal)"}</div>
          <div className="font-mono text-2xl font-semibold tabular">{fmtVnd(netWorthReal)}</div>
        </div>
      </div>

      {lastEvent && (
        <div className="rounded-2xl border border-gold/40 bg-gold/10 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gold">{lang === "vi" ? "Chuyện năm " : "Year "}{state.year}</div>
          <p className="mt-1 font-medium">{t(lastEvent, lang)}</p>
        </div>
      )}

      {state.pendingCards.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-faint">
            {lang === "vi" ? "Thẻ cơ hội năm nay" : "This year's opportunity cards"}
          </h2>
          {state.pendingCards.map((card) => (
            <div key={card.id} className="rounded-xl border border-gold/40 bg-raised p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">{t(card.titleKey, lang)}</div>
                  <div className="mt-0.5 text-xs text-muted">
                    {fmtVnd(card.costReal)} · {lang === "vi" ? "khoá" : "locked"} {card.lockYears} {lang === "vi" ? "năm" : "yr"} · {t(RISK_LABEL[card.risk], lang)}
                  </div>
                </div>
                <div className="rounded-md bg-gain px-2 py-1 font-mono text-sm font-semibold tabular text-on-gain">
                  ×{card.payoffMultiple.toFixed(1)} ({lang === "vi" ? "nếu đúng" : "if it pans out"})
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => takeCard(card)} className="rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-on-gold hover:brightness-110">
                  {lang === "vi" ? "Nhận thẻ" : "Take it"}
                </button>
                <button onClick={() => skipCard(card)} className="rounded-full border border-line-strong px-4 py-1.5 text-sm text-muted hover:text-ink">
                  {lang === "vi" ? "Bỏ qua" : "Skip"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-faint">{lang === "vi" ? "Đầu tư tự do" : "Freeform investing"}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {vnAssets
            .filter((a) => a.availableFrom <= state.year)
            .map((a) => {
              const holding = state.holdings.find((h) => h.asset === a.id);
              return (
                <div key={a.id} className="rounded-xl border border-line bg-raised p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t(a.name, lang)}</span>
                    <span className="rounded-md border border-line-strong px-1.5 py-0.5 text-[10px] uppercase text-faint">{a.dataQuality}</span>
                  </div>
                  {holding && <div className="mt-1 font-mono text-xs text-muted">{lang === "vi" ? "Đang giữ" : "Holding"}: {holding.units.toFixed(4)}</div>}
                  <div className="mt-2 flex gap-2">
                    <input
                      type="number"
                      placeholder="VND"
                      value={buyAmount[a.id] ?? ""}
                      onChange={(e) => setBuyAmount((b) => ({ ...b, [a.id]: e.target.value }))}
                      className="w-full rounded-lg border border-line bg-surface px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => {
                        const amount = Number(buyAmount[a.id] ?? 0);
                        if (!amount) return;
                        setState((prev) => (prev ? applyActions(prev, [{ t: "buy", asset: a.id, amount }]) : prev));
                      }}
                      className="shrink-0 rounded-lg bg-gold px-3 py-1 text-sm font-medium text-on-gold"
                    >
                      {lang === "vi" ? "Mua" : "Buy"}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <button
        onClick={goNextYear}
        className="w-full rounded-full bg-gold py-3 font-semibold text-on-gold hover:brightness-110"
      >
        {lang === "vi" ? `Qua năm ${state.year + 1} →` : `Advance to ${state.year + 1} →`}
      </button>

      {state.log.length > 0 && (
        <div className="rounded-xl border border-line bg-surface p-4 text-sm">
          <div className="text-xs uppercase tracking-wider text-faint">{lang === "vi" ? "Nhật ký" : "Log"}</div>
          <ul className="mt-2 space-y-1">
            {state.log
              .slice(-5)
              .reverse()
              .map((l, i) => (
                <li key={i} className="text-muted">
                  <span className="font-mono text-gold">{l.year}</span> — {t(l.lines[0], lang)}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
