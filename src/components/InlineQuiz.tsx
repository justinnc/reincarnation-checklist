"use client";

import Link from "next/link";
import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";
import type { Quiz } from "@/lib/types";

/** The milestone's own question, answerable in place (the old card linked away and lost it). */
export default function InlineQuiz({ quiz, lang, title }: { quiz: Quiz; lang: Locale; title: string }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const vi = lang === "vi";

  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <div className="text-xs font-semibold uppercase tracking-wider text-gold">{title}</div>
      <p className="mt-2 font-medium">{t(quiz.question, lang)}</p>
      <div className="mt-4 grid gap-2">
        {quiz.choices.map((c, i) => {
          const state = !answered ? "idle" : i === quiz.answer ? "right" : i === picked ? "wrong" : "dim";
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => setPicked(i)}
              className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                state === "idle"
                  ? "border-line bg-raised hover:border-gold"
                  : state === "right"
                    ? "border-gain bg-gain/10"
                    : state === "wrong"
                      ? "border-danger bg-danger/10"
                      : "border-line bg-raised opacity-50"
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line-strong font-mono text-xs">{"ABCD"[i]}</span>
              <span>{t(c, lang)}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-4 text-sm" role="status">
          <div className={`font-semibold ${picked === quiz.answer ? "text-gain" : "text-danger"}`}>
            {picked === quiz.answer ? (vi ? "Chính xác!" : "Correct!") : vi ? "Chưa đúng." : "Not quite."}
          </div>
          {quiz.explanation && <p className="mt-1 text-muted">{t(quiz.explanation, lang)}</p>}
          <Link href={`/${lang}/quiz`} className="mt-3 inline-block font-semibold text-gold underline underline-offset-4 hover:brightness-110">
            {vi ? "Làm thêm câu đố →" : "More questions →"}
          </Link>
        </div>
      )}
    </section>
  );
}
