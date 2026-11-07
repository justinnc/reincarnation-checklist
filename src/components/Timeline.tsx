"use client";

import { useMemo, useState } from "react";
import { t, type Locale } from "@/lib/i18n";
import { categories, type Category, type Milestone } from "@/lib/types";
import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  milestones: Milestone[];
  lang: Locale;
  dict: Dictionary["timeline"];
};

export default function Timeline({ milestones, lang, dict }: Props) {
  const [category, setCategory] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return milestones.filter((m) => {
      if (category !== "all" && m.category !== category) return false;
      if (!q) return true;
      return [t(m.title, lang), t(m.description, lang), t(m.opportunity.action, lang), m.date]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [milestones, category, query, lang]);

  const used = categories.filter((c) => milestones.some((m) => m.category === c));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.search}
          className="mr-2 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-amber-400 sm:w-64"
        />
        {(["all", ...used] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1 text-sm ${
              category === c ? "bg-amber-400 text-black" : "bg-white/5 opacity-70 hover:opacity-100"
            }`}
          >
            {c === "all" ? dict.all : dict.categories[c]}
          </button>
        ))}
      </div>

      {visible.length === 0 && <p className="opacity-60">{dict.empty}</p>}

      <ol className="relative space-y-6 border-l border-white/15 pl-6">
        {visible.map((m) => (
          <li key={m.id} className="relative">
            <span className="absolute -left-[31px] top-2 h-3 w-3 rounded-full bg-amber-400" />
            <article className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <time className="font-mono text-amber-300">{m.date}</time>
                <span className="rounded bg-white/10 px-2 py-0.5">{dict.categories[m.category]}</span>
                {!m.verified && (
                  <span className="rounded bg-red-500/20 px-2 py-0.5 text-red-300">{dict.unverified}</span>
                )}
              </div>
              <h3 className="mt-2 text-lg font-semibold">{t(m.title, lang)}</h3>
              <p className="mt-1 text-sm opacity-80">{t(m.description, lang)}</p>

              <dl className="mt-4 grid gap-2 rounded-lg bg-emerald-500/10 p-4 text-sm sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase opacity-60">💰 {dict.opportunity}</dt>
                  <dd>{t(m.opportunity.action, lang)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase opacity-60">{dict.buyWhen}</dt>
                  <dd>{t(m.opportunity.buyWhen, lang)}</dd>
                </div>
                {m.opportunity.sellWhen && (
                  <div>
                    <dt className="text-xs uppercase opacity-60">{dict.sellWhen}</dt>
                    <dd>{t(m.opportunity.sellWhen, lang)}</dd>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase opacity-60">{dict.estimatedReturn}</dt>
                  <dd className="font-semibold text-emerald-300">{t(m.opportunity.estimatedReturn, lang)}</dd>
                </div>
              </dl>

              {m.sources.length > 0 && (
                <div className="mt-3 text-xs opacity-70">
                  {dict.sources}:{" "}
                  {m.sources.map((s, i) => (
                    <span key={s.url}>
                      {i > 0 && " · "}
                      <a href={s.url} target="_blank" rel="noreferrer" className="underline hover:text-amber-300">
                        {s.title}
                      </a>
                    </span>
                  ))}
                </div>
              )}
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}

