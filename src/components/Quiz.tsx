"use client";

import Link from "next/link";
import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";
import type { Country, Milestone } from "@/lib/types";
import type { Dictionary } from "@/lib/dictionaries";

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

  const start = () => {
    const src = questions.filter((q) => pool === "all" || q.country === pool);
    setRound(shuffle(src).slice(0, ROUND));
    setIndex(0);
    setPicked(null);
    setScore(0);
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
              {o.label} <span className="font-mono tabular opacity-60">({questions.filter((q) => o.code === "all" || q.country === o.code).length})</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={start} className="mt-8 rounded-full bg-gold px-6 py-3 font-semibold text-on-gold hover:brightness-110">
          {dict.start} →
        </button>
      </div>
    );
  }

  const done = index >= round.length;
  if (done) {
    const pct = score / round.length;
    const rank = dict.ranks[Math.min(dict.ranks.length - 1, Math.floor(pct * dict.ranks.length))];
    return (
      <div className="rounded-3xl border border-line bg-surface p-10 text-center">
        <div className="text-sm uppercase tracking-wider text-faint">{dict.score}</div>
        <div className="mt-2 font-display text-8xl font-extrabold tabular text-gold">
          {score}/{round.length}
        </div>
        <div className="mt-3 font-display text-2xl font-bold">{rank}</div>
        <button type="button" onClick={start} className="mt-8 rounded-full bg-gold px-6 py-3 font-semibold text-on-gold hover:brightness-110">
          {dict.again}
        </button>
      </div>
    );
  }

  const q = round[index];
  const answered = picked !== null;
  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (i === q.quiz.answer) setScore((s) => s + 1);
  };

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 sm:p-10">
      <div className="flex items-center justify-between font-mono text-sm tabular text-faint">
        <span>
          {dict.question} {index + 1} {dict.of} {round.length}
        </span>
        <span className="text-gold">{score} ✓</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-raised">
        <div className="h-full bg-gold transition-[width]" style={{ width: `${(index / round.length) * 100}%` }} />
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
        <div className="mt-6 rounded-xl bg-raised p-5" role="status">
          <div className={`font-semibold ${picked === q.quiz.answer ? "text-gain" : "text-danger"}`}>
            {picked === q.quiz.answer ? dict.correct : dict.wrong}
          </div>
          {q.quiz.explanation && <p className="mt-2 text-muted">{t(q.quiz.explanation, lang)}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => {
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
