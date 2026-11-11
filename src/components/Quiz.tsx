"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { t, type Locale } from "@/lib/i18n";
import type { Country, Milestone } from "@/lib/types";
import type { Dictionary } from "@/lib/dictionaries";
import { addCharmIds } from "@/lib/charm";
import { trackEvent } from "@/lib/analytics";

type Q = Pick<Milestone, "id" | "country" | "date" | "title"> & { quiz: NonNullable<Milestone["quiz"]> };
const ROUND = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Quiz({ questions, countries, lang, dict }: { questions: Q[]; countries: Country[]; lang: Locale; dict: Dictionary["quiz"] }) {
  const [pool, setPool] = useState<string>("all");
  const [round, setRound] = useState<Q[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<Q[]>([]);
  const [shared, setShared] = useState(false);
  const [savedMissed, setSavedMissed] = useState(false);
  const [shareFailed, setShareFailed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // On phones the question, feedback and Next button don't fit one screen: keep the
  // relevant part in view instead of making players hunt for it.
  useEffect(() => {
    if (round) cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [round, index]);
  useEffect(() => {
    if (picked !== null) feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [picked]);

  const start = () => {
    const src = questions.filter((q) => pool === "all" || q.country === pool);
    // Shuffle answer order each round so the correct answer is not always in the same slot.
    setRound(
      shuffle(src)
        .slice(0, ROUND)
        .map((q) => {
          const order = shuffle(q.quiz.choices.map((_, i) => i));
          return { ...q, quiz: { ...q.quiz, choices: order.map((i) => q.quiz.choices[i]), answer: order.indexOf(q.quiz.answer) } };
        }),
    );
    setIndex(0);
    setPicked(null);
    setScore(0);
    setMissed([]);
    setShared(false);
    setShareFailed(false);
    setSavedMissed(false);
    trackEvent("quiz_started", { pool, lang });
  };

  if (!round) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-8">
        <h2 className="text-sm font-medium uppercase tracking-wider text-faint">{dict.choose}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[{ code: "all", label: dict.allCountries }, ...countries.map((c) => ({ code: c.code, label: `${c.flag} ${t(c.name, lang)}` }))].map((o) => (
            <button
              key={o.code}
              type="button"
              aria-pressed={pool === o.code}
              onClick={() => setPool(o.code)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${pool === o.code ? "bg-ink font-medium text-bg" : "bg-raised text-muted hover:text-ink"}`}
            >
              {o.label} <span className="font-mono tabular font-normal">({questions.filter((q) => o.code === "all" || q.country === o.code).length})</span>
            </button>
          ))}
        </div>
        {/* Sticky on phones so Start stays reachable below the long country list. */}
        <div className="sticky bottom-4 z-10 mt-8">
          <button type="button" onClick={start} className="rounded-full bg-gold px-6 py-3 font-semibold text-on-gold shadow-lg hover:brightness-110">
            {dict.start} →
          </button>
        </div>
      </div>
    );
  }

  const done = index >= round.length;
  if (done) {
    const pct = score / round.length;
    const rank = dict.ranks[Math.min(dict.ranks.length - 1, Math.floor(pct * dict.ranks.length))];
    const share = async () => {
      const text = dict.shareText.replace("{score}", String(score)).replace("{total}", String(round.length)).replace("{rank}", rank);
      const url = window.location.href;
      // Native share sheet only on touch devices; on desktop a copied link is faster than the OS sheet.
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        try {
          await navigator.share({ text, url });
          trackEvent("quiz_shared", { pool, score, total: round.length, lang });
          return;
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") return; // user closed the share sheet
        }
      }
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        trackEvent("quiz_shared", { pool, score, total: round.length, lang });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        // Clipboard can be blocked (permissions, unfocused document): say so instead of failing silently.
        setShareFailed(true);
      }
    };
    const saveMissed = () => {
      addCharmIds(missed.map((m) => m.id));
      setSavedMissed(true);
    };
    return (
      <div ref={cardRef} className="scroll-mt-4 rounded-3xl border border-line bg-surface p-6 sm:p-10">
        <div className="text-center">
          <div className="text-sm uppercase tracking-wider text-faint">{dict.score}</div>
          <div className="mt-2 font-display text-8xl font-extrabold tabular text-gold">
            {score}/{round.length}
          </div>
          <div className="mt-3 font-display text-2xl font-bold">{rank}</div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={share} className="rounded-full bg-gold px-6 py-3 font-semibold text-on-gold hover:brightness-110">
              {shared ? dict.shared : dict.share}
            </button>
            <button type="button" onClick={start} className="rounded-full border border-line-strong px-6 py-3 font-semibold text-muted hover:text-ink">
              {dict.again}
            </button>
          </div>
          {shareFailed && (
            <p className="mt-3 text-sm text-muted" role="status">
              {lang === "vi" ? "Không sao chép được. Hãy chụp màn hình để chia sẻ kết quả." : "Couldn't copy the link. Take a screenshot to share your result."}
            </p>
          )}
        </div>

        <div className="mt-10 border-t border-line pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">{dict.missed}</h3>
            {/* Save missed to charm temporarily hidden */}
            {false && missed.length > 0 && (
              <button type="button" onClick={saveMissed} disabled={savedMissed} className="text-xs font-medium text-gold hover:brightness-110 disabled:opacity-70">
                {savedMissed ? dict.savedMissed : dict.saveMissed}
              </button>
            )}
          </div>
          {missed.length === 0 ? (
            <p className="mt-3 text-gain">{dict.perfect}</p>
          ) : (
            <ol className="mt-3 space-y-2">
              {missed.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/${lang}/${m.country}/${m.id}`}
                    className="flex items-center gap-3 rounded-xl border border-line bg-raised p-3 transition-colors hover:border-gold"
                  >
                    <span className="shrink-0 font-mono text-xs tabular text-gold">{m.date.slice(0, 4)}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{t(m.title, lang)}</span>
                    <span className="shrink-0 text-xs text-faint">{dict.learn} →</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    );
  }

  const q = round[index];
  const answered = picked !== null;
  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (i === q.quiz.answer) setScore((s) => s + 1);
    else setMissed((list) => [...list, q]);
  };

  return (
    <div ref={cardRef} className="scroll-mt-4 rounded-3xl border border-line bg-surface p-6 sm:p-10">
      <div className="flex items-center justify-between font-mono text-sm tabular text-faint">
        <span>
          {dict.question} {index + 1} {dict.of} {round.length}
        </span>
        <span className="text-gold">{score} ✓</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-raised">
        <div className="h-full origin-left bg-gold transition-transform" style={{ transform: `scaleX(${index / round.length})` }} />
      </div>
      <h2 className="mt-8 font-display text-2xl font-bold leading-snug sm:text-3xl">{t(q.quiz.question, lang)}</h2>
      <div className="mt-6 grid gap-3">
        {q.quiz.choices.map((c, i) => {
          const isAnswer = i === q.quiz.answer;
          const state = !answered ? "idle" : isAnswer ? "right" : i === picked ? "wrong" : "dim";
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => choose(i)}
              className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
                state === "idle"
                  ? "border-line bg-raised hover:border-gold"
                  : state === "right"
                    ? "border-gain bg-gain/10"
                    : state === "wrong"
                      ? "border-danger bg-danger/10"
                      : "border-line bg-raised opacity-50"
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line-strong font-mono text-sm">
                {"ABCD"[i]}
              </span>
              <span>{t(c, lang)}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div ref={feedbackRef} className="mt-6 scroll-mb-4 rounded-xl bg-raised p-5" role="status">
          <div className={`font-semibold ${picked === q.quiz.answer ? "text-gain" : "text-danger"}`}>
            {picked === q.quiz.answer ? dict.correct : dict.wrong}
          </div>
          {q.quiz.explanation && <p className="mt-2 text-muted">{t(q.quiz.explanation, lang)}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (index + 1 === round.length) {
                  trackEvent("quiz_completed", { pool, score, total: round.length, lang });
                }
                setIndex((n) => n + 1);
                setPicked(null);
              }}
              className="rounded-full bg-gold px-5 py-2.5 font-semibold text-on-gold hover:brightness-110"
            >
              {index + 1 === round.length ? dict.finish : dict.next} →
            </button>
            <Link href={`/${lang}/${q.country}/${q.id}`} className="text-sm text-muted hover:text-gold">
              {dict.learn}: {t(q.title, lang)}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
