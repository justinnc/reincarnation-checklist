"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { hashSeed, mulberry32 } from "@/lib/cardgame/rng";
import { motion, AnimatePresence } from "motion/react";
import { t, type Locale } from "@/lib/i18n";
import type { Country } from "@/lib/types";
import {
  generateSurvivalRun,
  calculateDecisionOutcome,
  getSurvivalRank,
  generateShareText,
  getContemporaryDispatch,
  getYearClampNotice,
  formatNumber,
  formatUsd,
  skipChoiceText,
  type SurvivalRun,
  type DecisionResult,
  type DecisionType,
} from "@/lib/survival";
import { addCharmIds } from "@/lib/charm";
import { soundFx } from "@/lib/soundFx";
import { generateReincarnationPassCard } from "@/lib/passCard";
import { trackEvent } from "@/lib/analytics";

export default function SurvivalGame({
  lang,
  countries,
}: {
  lang: Locale;
  countries: Country[];
}) {
  const searchParams = useSearchParams();
  const initialCountryParam = searchParams.get("country") ?? undefined;
  const initialYearParam = searchParams.get("year")
    ? Number.parseInt(searchParams.get("year"!)!, 10)
    : undefined;

  // Game state
  const [phase, setPhase] = useState<"roulette" | "playing" | "game_over">( "roulette" );
  const [run, setRun] = useState<SurvivalRun>(() =>
    generateSurvivalRun(initialCountryParam, initialYearParam, mulberry32(hashSeed(`survival:${initialCountryParam ?? ""}:${initialYearParam ?? ""}`)))
  );

  // Roulette spinning state
  const [isSpinning, setIsSpinning] = useState(false);
  // Audio is off by default; render muted on SSR/hydration and sync the stored choice after mount.
  const [isMuted, setIsMuted] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const eventCardRef = useRef<HTMLDivElement>(null);
  const [isExportingCard, setIsExportingCard] = useState(false);
  const [cardPreviewUrl, setCardPreviewUrl] = useState<string | null>(null);
  const [spinDisplay, setSpinDisplay] = useState({
    flag: run.country.flag,
    countryName: t(run.country.name, lang),
    year: run.startYear,
  });

  // Keep SSR and hydration identical, then draw a fresh run for each visit.
  useEffect(() => {
    const timer = setTimeout(() => {
      const freshRun = generateSurvivalRun(initialCountryParam, initialYearParam);
      setRun(freshRun);
      setSpinDisplay({ flag: freshRun.country.flag, countryName: t(freshRun.country.name, lang), year: freshRun.startYear });
    }, 0);
    return () => clearTimeout(timer);
    // URL parameters are only an initial preference; spinning can replace them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // No stored preference yet: persist "off" as the default.
        if (window.localStorage.getItem("rc:muted") === null && !soundFx.isMuted) soundFx.toggleMute();
      } catch {
        // Storage unavailable (private mode): keep the in-memory state.
      }
      setIsMuted(soundFx.isMuted);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleSound = () => {
    const newMuted = soundFx.toggleMute();
    setIsMuted(newMuted);
  };

  // In-game state
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [netWorth, setNetWorth] = useState(1000);
  const [results, setResults] = useState<DecisionResult[]>([]);
  const [currentRoundResult, setCurrentRoundResult] = useState<DecisionResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keep the event card (and its choices / Next button) in view after each step on small screens.
  useEffect(() => {
    if (phase !== "playing") return;
    const card = eventCardRef.current;
    if (!card || typeof window === "undefined") return;
    const rect = card.getBoundingClientRect();
    if (rect.top < 0 || rect.top > window.innerHeight * 0.5) {
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [phase, currentRoundIdx, currentRoundResult]);

  // Toast auto-clear
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Spin simulation
  const handleSpin = (targetCountry?: string) => {
    setIsSpinning(true);
    const startTime = Date.now();
    const duration = 1200;

    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount++;
      if (tickCount % 2 === 0) soundFx.play("spin");
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      const randomYear = 1980 + Math.floor(Math.random() * 35);
      setSpinDisplay({
        flag: randomCountry.flag,
        countryName: t(randomCountry.name, lang),
        year: randomYear,
      });

      if (Date.now() - startTime >= duration) {
        clearInterval(interval);
        soundFx.play("success");
        const newRun = generateSurvivalRun(targetCountry);
        setRun(newRun);
        setSpinDisplay({
          flag: newRun.country.flag,
          countryName: t(newRun.country.name, lang),
          year: newRun.startYear,
        });
        setIsSpinning(false);
      }
    }, 60);
  };

  const handleStartGame = () => {
    soundFx.play("click");
    setNetWorth(run.initialCapital);
    setCurrentRoundIdx(0);
    setResults([]);
    setCurrentRoundResult(null);
    setPhase("playing");
    trackEvent("survival_started", {
      country: run.country.code,
      start_year: run.startYear,
      lang,
    });
  };

  const handleMakeDecision = (decision: DecisionType) => {
    const round = run.rounds[currentRoundIdx];
    if (!round) return;

    const res = calculateDecisionOutcome(round, decision, netWorth);
    setCurrentRoundResult(res);
    setNetWorth(res.newNetWorth);
    setResults((prev) => [...prev, res]);
    trackEvent("survival_round_decided", {
      country: run.country.code,
      round: currentRoundIdx + 1,
      milestone_id: round.milestone.id,
      decision,
      is_success: res.isSuccess,
      lang,
    });
    if (res.isSuccess) {
      soundFx.play("success");
    } else {
      soundFx.play("trap");
    }
  };

  const handleNextRound = () => {
    soundFx.play("click");
    if (currentRoundIdx + 1 >= run.rounds.length) {
      // Game over!
      soundFx.play("fanfare");
      setPhase("game_over");
      trackEvent("survival_completed", {
        country: run.country.code,
        start_year: run.startYear,
        final_rank: finalRank.tier,
        net_worth: Math.round(netWorth),
        lang,
      });
    } else {
      setCurrentRoundIdx((prev) => prev + 1);
      setCurrentRoundResult(null);
    }
  };

  const handleDownloadPass = async () => {
    setIsExportingCard(true);
    try {
      const dataUrl = await generateReincarnationPassCard({
        run,
        results,
        finalRank,
        netWorth,
        lang,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `reincarnation-pass-${run.country.code}-${run.startYear}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      trackEvent("pass_card_downloaded", {
        country: run.country.code,
        start_year: run.startYear,
        final_rank: finalRank.tier,
        lang,
      });
      setToastMessage(
        lang === "vi"
          ? "📸 Đã tải thẻ căn cước trọng sinh (PNG)!"
          : "📸 Reincarnation Pass (PNG) downloaded!"
      );
    } catch {
      setToastMessage(lang === "vi" ? "❌ Không thể tạo ảnh thẻ" : "❌ Failed to generate card");
    } finally {
      setIsExportingCard(false);
    }
  };

  const handleCopyShare = async () => {
    const shareText = generateShareText(run, results, netWorth, lang);
    try {
      await navigator.clipboard.writeText(shareText);
      trackEvent("survival_shared", {
        country: run.country.code,
        start_year: run.startYear,
        final_rank: finalRank.tier,
        lang,
      });
      setToastMessage(
        lang === "vi"
          ? "✅ Đã sao chép kết quả vào bộ nhớ tạm!"
          : "✅ Results copied to clipboard!"
      );
    } catch {
      setToastMessage(lang === "vi" ? "❌ Không thể copy" : "❌ Failed to copy");
    }
  };

  const handleSaveToCharm = () => {
    const ids = run.rounds.map((r) => r.milestone.id);
    addCharmIds(ids);
    setToastMessage(
      lang === "vi"
        ? "📜 Đã lưu 5 mốc này vào Bùa Trọng Sinh!"
        : "📜 Saved 5 milestones to Cheat Sheet!"
    );
  };

  const currentRound = run.rounds[currentRoundIdx];
  const currentDispatch = currentRound ? getContemporaryDispatch(currentRound) : null;
  const finalRank = getSurvivalRank(netWorth, run.initialCapital, results);
  const yearClampNotice = phase === "roulette" && !isSpinning ? getYearClampNotice(run, lang) : null;
  const money = (n: number) => formatUsd(n, lang);

  // Generate Card Preview when entering game_over
  useEffect(() => {
    if (phase !== "game_over") return;
    let active = true;
    generateReincarnationPassCard({
      run,
      results,
      finalRank,
      netWorth,
      lang,
    })
      .then((url) => {
        if (active) setCardPreviewUrl(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [phase, run, results, finalRank, netWorth, lang]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Top Controls: Sound Toggle */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setShowRules((v) => !v)}
          aria-expanded={showRules}
          aria-controls="survival-rules"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-raised px-3 py-1 font-mono text-xs text-muted hover:border-gold hover:text-ink transition"
        >
          <span aria-hidden="true">ⓘ</span>
          <span>{lang === "vi" ? "Luật chơi" : "Rules"}</span>
        </button>
        <button
          type="button"
          onClick={toggleSound}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-raised px-3 py-1 font-mono text-xs text-muted hover:border-gold hover:text-ink transition"
          aria-pressed={!isMuted}
          title={isMuted ? (lang === "vi" ? "Bật âm thanh" : "Turn audio on") : (lang === "vi" ? "Tắt âm thanh" : "Turn audio off")}
        >
          <span>{isMuted ? "🔇" : "🔊"}</span>
          <span>{isMuted ? (lang === "vi" ? "Âm thanh: Tắt" : "Audio: Off") : (lang === "vi" ? "Âm thanh: Bật" : "Audio: On")}</span>
        </button>
      </div>

      {showRules && (
        <p id="survival-rules" className="rounded-xl border border-line bg-raised/50 p-3 text-xs text-muted" data-testid="inflation-rule">
        {lang === "vi"
          ? "Luật arcade: chỉ lựa chọn Né chịu hao hụt sức mua giả định 3%/năm đến mốc tiếp theo. Cùng năm và vòng cuối: không trừ. Số dư là điểm vốn quy đổi của game, không phải số dư ngân hàng hay mô phỏng CPI lịch sử; các lựa chọn khác giữ luật cũ."
          : "Arcade rule: only Skip incurs assumed 3% annual purchasing-power erosion until the next event. Same-year and final rounds: no deduction. Balance is a game capital score, not a bank balance or historical CPI simulation; other choices retain existing rules."}
        </p>
      )}
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 z-50 -translate-x-1/2 rounded-full border border-gold/40 bg-surface px-5 py-2.5 text-sm font-medium text-gold shadow-2xl backdrop-blur"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHASE 1: ROULETTE */}
      {phase === "roulette" && (
        <section className="space-y-8 text-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-gold">
              <span>🎲</span>
              <span>
                {lang === "vi"
                  ? "MINIGAME SINH TỒN TRỌNG SINH"
                  : "REINCARNATION SURVIVAL MINIGAME"}
              </span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
              {lang === "vi" ? "Vòng Quay Đầu Thai" : "Reincarnation Roulette"}
            </h1>
            <p className="mx-auto max-w-xl text-sm text-muted sm:text-base">
              {lang === "vi"
                ? "Bạn sắp bước qua cánh cổng thời gian. Bốc thăm điểm xuất phát của kiếp này: bạn có 1.000 USD và phải sống sót qua 5 biến động lịch sử!"
                : "Step through the portal of time. Roll your starting identity: start with $1,000 and navigate 5 historical market turning points!"}
            </p>
          </div>

          {/* Slot Machine Box */}
          <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border-2 border-gold/40 bg-surface p-6 shadow-2xl shadow-gold/5 sm:p-8">
            <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-raised p-4">
                <div className="text-xs uppercase tracking-wider text-muted">
                  {lang === "vi" ? "Quốc gia sinh ra" : "Awakening Country"}
                </div>
                <div className="mt-2 font-display text-4xl sm:text-5xl">
                  {spinDisplay.flag}
                </div>
                <div className="mt-1 text-sm font-semibold text-ink">
                  {spinDisplay.countryName}
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-raised p-4">
                <div className="text-xs uppercase tracking-wider text-muted">
                  {lang === "vi" ? "Năm bắt đầu" : "Start year"}
                </div>
                <div className="mt-2 font-display text-4xl font-extrabold tracking-tight text-gold sm:text-5xl">
                  {spinDisplay.year}
                </div>
                <div className="mt-1 text-xs text-muted">
                  {lang === "vi" ? "Bạn 18 tuổi" : "You start at age 18"}
                </div>
              </div>
            </div>

            {yearClampNotice && (
              <p
                role="status"
                className="mt-4 rounded-2xl border border-warning/40 bg-warning/10 p-3 text-xs text-warning"
                data-testid="year-clamp-notice"
              >
                ⚠️ {yearClampNotice}
              </p>
            )}

            <div className="mt-4 rounded-2xl border border-line bg-raised/50 p-3 text-xs text-muted">
              💰 {lang === "vi" ? "Vốn ban đầu:" : "Starting capital:"}{" "}
              <span className="font-bold text-ink">{money(run.initialCapital)}</span> · 5 {lang === "vi" ? "ngã rẽ lịch sử" : "turning points"}
            </div>

            {/* Spin Buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => handleSpin()}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-raised px-5 py-3 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-line disabled:opacity-50"
              >
                <span>🎲</span>
                <span>{lang === "vi" ? "Bốc thăm ngẫu nhiên" : "Spin Random Life"}</span>
              </button>

              <button
                type="button"
                disabled={isSpinning}
                onClick={handleStartGame}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gold bg-gold px-6 py-3 text-sm font-bold text-on-gold shadow-lg shadow-gold/20 transition hover:brightness-110 disabled:opacity-50"
              >
                <span>🚀</span>
                <span>
                  {lang === "vi" ? "Bắt đầu kiếp sống!" : "Start Survival Run!"}
                </span>
              </button>
            </div>
          </div>

          {/* Quick country selection */}
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted">
              {lang === "vi" ? "Hoặc tự chọn đất nước muốn đầu thai:" : "Or pick a country to reincarnate in:"}
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {countries.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSpin(c.code)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    run.country.code === c.code
                      ? "border-gold bg-gold text-on-gold font-semibold"
                      : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
                  }`}
                >
                  <span>{c.flag}</span> <span>{t(c.name, lang)}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PHASE 2: PLAYING */}
      {phase === "playing" && currentRound && (
        <section className="space-y-6">
          {/* Top Status HUD */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{run.country.flag}</span>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted">
                  {t(run.country.name, lang)} · {lang === "vi" ? "Năm" : "Year"} {currentRound.year}
                </div>
                <div className="text-sm font-bold text-ink">
                  {lang === "vi" ? "Ngã rẽ" : "Event"} {currentRoundIdx + 1} / {run.rounds.length}
                </div>
              </div>
            </div>

            {/* Stepper pills */}
            <div className="flex items-center gap-1.5">
              {run.rounds.map((_, i) => {
                const res = results[i];
                let stateClass = "bg-raised border-line text-muted";
                if (res) {
                  stateClass = res.isSuccess
                    ? "bg-gain/20 border-gain text-gain"
                    : "bg-trap/20 border-trap text-trap";
                } else if (i === currentRoundIdx) {
                  stateClass = "bg-gold text-on-gold border-gold font-bold scale-110";
                }
                return (
                  <div
                    key={i}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs transition ${stateClass}`}
                  >
                    {res ? (res.isSuccess ? "✓" : "✗") : i + 1}
                  </div>
                );
              })}
            </div>

            {/* Live Net Worth */}
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted">
                {lang === "vi" ? "Tài sản hiện tại" : "Net Worth"}
              </div>
              <div className="font-display text-2xl font-extrabold text-gold sm:text-3xl">
                {money(netWorth)}
              </div>
            </div>
          </div>

          {/* Main Event Card */}
          <div
            ref={eventCardRef}
            className="relative scroll-mt-4 rounded-3xl border border-line bg-surface p-6 shadow-xl sm:p-8"
          >
            <div className="space-y-4">
              {!currentRoundResult ? (
                <>
                  {/* Fog of War: Contemporary Dispatch view */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-gold">
                      📅 {currentRound.milestone.date}
                    </span>
                    <span className="rounded-full border border-line bg-raised px-2.5 py-0.5 text-xs text-muted capitalize">
                      {currentRound.milestone.category}
                    </span>
                    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400">
                      🗞️ {lang === "vi" ? "Điện tín đương thời" : "Contemporary Dispatch"}
                    </span>
                  </div>

                  <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {currentDispatch ? currentDispatch.headline[lang] : t(currentRound.milestone.title, lang)}
                  </h2>

                  <p className="text-sm leading-relaxed text-muted sm:text-base">
                    {currentDispatch ? currentDispatch.dispatch[lang] : t(currentRound.milestone.summary ?? currentRound.milestone.description, lang)}
                  </p>

                  {currentDispatch && (
                    <div className="flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/5 px-3.5 py-2 text-xs">
                      <span className="font-semibold text-gold">
                        📻 {lang === "vi" ? "Dư luận đương thời:" : "Market Sentiment:"}
                      </span>
                      <span className="text-ink">{currentDispatch.sentiment[lang]}</span>
                    </div>
                  )}

                  {/* Prompt Box */}
                  <div className="rounded-2xl border border-line-strong bg-raised/50 p-4 text-sm text-ink">
                    <div className="font-semibold text-gold">
                      ❓ {lang === "vi" ? `Bạn sẽ làm gì với ${money(netWorth)} của mình?` : `What will you do with your ${money(netWorth)}?`}
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {lang === "vi"
                        ? "Đứng trước thời khắc lịch sử này mà không biết trước kết cục: bạn chọn Tất tay đón sóng, Thăm dò thận trọng hay Giữ tiền né bão?"
                        : "Standing at this historical moment with no hindsight: will you go all-in, enter cautiously, or preserve cash?"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Historical Reality Revealed */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-gold">
                      📅 {currentRound.milestone.date}
                    </span>
                    <span className="rounded-full border border-line bg-raised px-2.5 py-0.5 text-xs text-muted capitalize">
                      {currentRound.milestone.category}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-line bg-raised/60 p-4 sm:p-5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
                      <span>📜</span>
                      <span>{lang === "vi" ? "Sự thật lịch sử đã giải mã:" : "Historical Reality Revealed:"}</span>
                    </div>
                    <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
                      {t(currentRound.milestone.title, lang)}
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
                      {t(currentRound.milestone.summary ?? currentRound.milestone.description, lang)}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Decision Choices or Feedback */}
            {!currentRoundResult ? (
              <>
              <ul className="mt-4 space-y-1 text-xs text-muted sm:hidden" data-testid="choice-legend">
                <li>🚀 {lang === "vi" ? "Tất tay: nhân mạnh vốn nếu đúng, mất 90% nếu dính bẫy." : "All-in: huge multiplier if right; lose 90% if it's a trap."}</li>
                <li>🟡 {lang === "vi" ? "Thăm dò: cược 25%, giữ 75% tiền mặt." : "Cautious: bet 25%, keep 75% in cash."}</li>
                <li>🛡️ {skipChoiceText(currentRound.yearGap ?? 0, lang)}</li>
              </ul>
              <div className="sticky bottom-2 z-10 -mx-2 mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-surface/95 p-2 backdrop-blur sm:static sm:mx-0 sm:gap-3 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                <button
                  type="button"
                  onClick={() => handleMakeDecision("all_in")}
                  className="group flex flex-col justify-between rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-left sm:p-4 transition hover:border-emerald-500 hover:bg-emerald-500/20"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-1 text-sm font-bold sm:gap-1.5 sm:text-base text-emerald-400">
                      <span>🚀</span>
                      <span>{lang === "vi" ? "Tất tay (100%)" : "All-in (100%)"}</span>
                    </div>
                    <p className="mt-1 hidden text-xs text-muted group-hover:text-ink sm:block">
                      {lang === "vi"
                        ? "Nhân mạnh vốn nếu đúng, mất 90% nếu dính bẫy."
                        : "Huge multiplier if right; lose 90% if it's a trap."}
                    </p>
                  </div>
                  <div className="mt-1.5 font-mono text-xs font-semibold sm:mt-3 text-emerald-400">
                    {money(netWorth)}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleMakeDecision("cautious")}
                  className="group flex flex-col justify-between rounded-2xl border border-amber-500/40 bg-amber-500/10 p-2.5 text-left sm:p-4 transition hover:border-amber-500 hover:bg-amber-500/20"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-1 text-sm font-bold sm:gap-1.5 sm:text-base text-amber-400">
                      <span>🟡</span>
                      <span>{lang === "vi" ? "Thăm dò (25%)" : "Cautious (25%)"}</span>
                    </div>
                    <p className="mt-1 hidden text-xs text-muted group-hover:text-ink sm:block">
                      {lang === "vi"
                        ? "Lãi vừa phải, rủi ro thấp nếu thị trường sập."
                        : "Moderate gain, keeps 75% in safe cash."}
                    </p>
                  </div>
                  <div className="mt-1.5 font-mono text-xs font-semibold sm:mt-3 text-amber-400">
                    {money(Math.round(netWorth * 0.25))}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleMakeDecision("skip")}
                  className="group flex flex-col justify-between rounded-2xl border border-line bg-raised p-2.5 text-left sm:p-4 transition hover:border-line-strong hover:bg-line"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-1 text-sm font-bold sm:gap-1.5 sm:text-base text-ink">
                      <span>🛡️</span>
                      <span>{lang === "vi" ? "Né / Giữ tiền" : "Skip / Hold Cash"}</span>
                    </div>
                    <p className="mt-1 hidden text-xs text-muted group-hover:text-ink sm:block">
                      {skipChoiceText(currentRound.yearGap ?? 0, lang)}
                    </p>
                  </div>
                  <div className="mt-1.5 font-mono text-xs font-semibold sm:mt-3 text-muted">
                    {money(0)}
                  </div>
                </button>
              </div>
              </>
            ) : (
              /* Decision Outcome Reveal */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-6 rounded-2xl border p-5 ${
                  currentRoundResult.isSuccess
                    ? "border-gain/40 bg-gain/10"
                    : "border-trap/40 bg-trap/10"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-lg font-bold">
                    {t(currentRoundResult.headline, lang)}
                  </div>
                  <div className="font-mono text-sm font-semibold">
                    {money(currentRoundResult.prevNetWorth)} ➔{" "}
                    <span
                      className={`text-base font-bold ${
                        currentRoundResult.isSuccess ? "text-gain" : "text-trap"
                      }`}
                    >
                      {money(currentRoundResult.newNetWorth)}
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-sm text-ink">
                  {t(currentRoundResult.feedback, lang)}
                  {currentRoundResult.decision === "skip" && currentRoundResult.inflationLoss > 0 && (
                    <span className="mt-2 block font-mono text-warning" data-testid="inflation-log">
                      {currentRound.year} → {currentRound.year + (currentRound.yearGap ?? 0)}
                      {" · "}{lang === "vi" ? "Giảm sức mua (game)" : "Purchasing-power loss (game)"}: −{money(currentRoundResult.inflationLoss)}
                    </span>
                  )}
                </p>

                {/* Insider tip / Pitfalls from history */}
                {(currentRound.milestone.insiderTip || currentRound.milestone.pitfalls) && (
                  <div className="mt-3 rounded-xl border border-line bg-surface/80 p-3 text-xs text-muted">
                    <span className="font-semibold text-gold">
                      {lang === "vi" ? "💡 Bài học lịch sử:" : "💡 Historical Lesson:"}{" "}
                    </span>
                    {t(currentRound.milestone.pitfalls ?? currentRound.milestone.insiderTip, lang)}
                  </div>
                )}

                <div className="sticky bottom-2 z-10 mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextRound}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold bg-gold px-5 py-2.5 text-sm font-bold text-on-gold shadow-lg shadow-black/30 transition hover:brightness-110 sm:w-auto"
                  >
                    <span>
                      {currentRoundIdx + 1 >= run.rounds.length
                        ? lang === "vi"
                          ? "Xem kết quả chung cuộc 🏆"
                          : "View Final Score 🏆"
                        : lang === "vi"
                        ? "Sang ngã rẽ tiếp theo ➔"
                        : "Next Turning Point ➔"}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* PHASE 3: GAME OVER / SUMMARY */}
      {phase === "game_over" && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 text-center"
        >
          <div className="space-y-3">
            <div className="text-6xl sm:text-7xl">{finalRank.badge}</div>
            <div className="font-mono text-xs uppercase tracking-widest text-gold">
              {lang === "vi" ? "KẾT QUẢ KIẾP TRỌNG SINH" : "REINCARNATION SUMMARY"}
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
              {t(finalRank.title, lang)}
            </h1>
            <p className="mx-auto max-w-lg text-sm text-muted sm:text-base">
              {t(finalRank.description, lang)}
            </p>
          </div>

          {/* Score Card */}
          <div className="mx-auto max-w-lg rounded-3xl border-2 border-gold/40 bg-surface p-6 shadow-2xl shadow-gold/5 sm:p-8">
            <div className="grid grid-cols-2 gap-4 border-b border-line pb-6 text-left">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted">
                  {lang === "vi" ? "Vốn ban đầu" : "Initial Capital"}
                </div>
                <div className="font-display text-2xl font-bold text-ink">
                  {money(run.initialCapital)}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted">
                  {lang === "vi" ? "Tài sản chung cuộc" : "Final Net Worth"}
                </div>
                <div className="font-display text-2xl font-extrabold text-gold sm:text-3xl">
                  {money(netWorth)}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted">
              <span>
                {lang === "vi" ? "Tăng trưởng danh mục:" : "Portfolio Multiple:"}{" "}
                <span className="font-mono font-bold text-ink">
                  {formatNumber(Number((netWorth / run.initialCapital).toFixed(1)), lang, 1)}×
                </span>
              </span>
              <span>
                {lang === "vi" ? "Quyết định đúng:" : "Wins:"}{" "}
                <span className="font-mono font-bold text-gain">
                  {results.filter((r) => r.isSuccess).length} / {results.length}
                </span>
              </span>
            </div>

            {/* Decisions Recap List */}
            <div className="mt-6 space-y-2 text-left">
              <div className="text-xs uppercase tracking-wider text-muted">
                {lang === "vi" ? "Nhật ký 5 bước đi:" : "5-Step Timeline Log:"}
              </div>
              {results.map((res, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-line bg-raised px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span>{res.isSuccess ? "🟩" : "🟥"}</span>
                    <span className="font-mono text-muted">{res.round.year}</span>
                    <span className="truncate font-medium text-ink">
                      {t(res.round.milestone.title, lang)}
                    </span>
                  </div>
                  <div className="shrink-0 font-mono font-semibold text-muted">
                    {res.decision === "all_in"
                      ? (lang === "vi" ? "Tất tay" : "All-in")
                      : res.decision === "cautious"
                      ? "25%"
                      : (lang === "vi" ? "Né" : "Skip")}
                    {res.decision === "skip" && res.inflationLoss > 0 && <span className="block text-warning">−{money(res.inflationLoss)} {lang === "vi" ? "sức mua" : "purchasing power"}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center">
              <button
                type="button"
                onClick={handleDownloadPass}
                disabled={isExportingCard}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-gold bg-gold px-5 py-2.5 text-xs font-bold text-on-gold shadow-lg shadow-gold/20 transition hover:brightness-110 disabled:opacity-50"
              >
                <span>{isExportingCard ? "⏳" : "📸"}</span>
                <span>
                  {isExportingCard
                    ? lang === "vi"
                      ? "Đang xuất thẻ..."
                      : "Exporting..."
                    : lang === "vi"
                    ? "Tải ảnh Thẻ Căn Cước Trọng Sinh (PNG)"
                    : "Download Reincarnation Pass (PNG)"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleCopyShare}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-raised px-4 py-2.5 text-xs font-semibold text-ink transition hover:border-gold hover:bg-line"
              >
                <span>📋</span>
                <span>
                  {lang === "vi" ? "Copy Text" : "Copy Text"}
                </span>
              </button>

              {/* Charm save button temporarily hidden */}
              {false && (
                <button
                  type="button"
                  onClick={handleSaveToCharm}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-raised px-5 py-2.5 text-xs font-semibold text-ink transition hover:border-line-strong hover:bg-line"
                >
                  <span>📜</span>
                  <span>
                    {lang === "vi" ? "Lưu 5 mốc vào Bùa" : "Save 5 to Cheat Sheet"}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setCardPreviewUrl(null);
                  handleSpin();
                  setPhase("roulette");
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-raised px-4 py-2.5 text-xs font-semibold text-muted transition hover:border-line-strong hover:text-ink"
              >
                <span>🔄</span>
                <span>{lang === "vi" ? "Chơi kiếp khác" : "New Run"}</span>
              </button>
            </div>

            {/* Live Reincarnation Card Preview */}
            {cardPreviewUrl && (
              <div className="mt-6 border-t border-line pt-6">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  {lang === "vi" ? "Xem trước Thẻ Căn Cước Trọng Sinh:" : "Reincarnation Pass Preview:"}
                </div>
                <div className="mx-auto max-w-xs overflow-hidden rounded-2xl border-2 border-gold/40 bg-surface shadow-2xl shadow-gold/15 transition-all hover:scale-[1.02] hover:border-gold">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cardPreviewUrl}
                    alt={lang === "vi" ? "Thẻ Căn Cước Trọng Sinh" : "Reincarnation Identity Pass"}
                    className="block h-auto w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.section>
      )}
    </div>
  );
}
