"use client";

import { useMemo, useState, type ReactNode } from "react";
import { t, type Locale } from "@/lib/i18n";
import { categories, type Category, type Level, type Milestone } from "@/lib/types";
import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  milestones: Milestone[];
  lang: Locale;
  dict: Dictionary["timeline"];
  /** Pre-rendered server cards keyed by id */
  cards: Record<string, ReactNode>;
};

const decadeOf = (m: Milestone) => Math.floor(Number(m.date.slice(0, 4)) / 10) * 10;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${
        active ? "bg-gold font-medium text-on-gold" : "bg-raised text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export default function Timeline({ milestones, lang, dict, cards }: Props) {
  const [category, setCategory] = useState<Category | "all">("all");
  const [risk, setRisk] = useState<Level | "all">("all");
  const [sort, setSort] = useState<"date" | "return">("date");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = milestones.filter((m) => {
      if (category !== "all" && m.category !== category) return false;
      if (risk !== "all" && m.opportunity.risk !== risk) return false;
      if (!q) return true;
      return [t(m.title, lang), t(m.summary, lang), t(m.description, lang), m.opportunity.asset ?? "", m.date]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
    if (sort === "return")
      return [...list].sort((a, b) => (b.opportunity.returnMultiple ?? 0) - (a.opportunity.returnMultiple ?? 0));
    return list;
  }, [milestones, category, risk, sort, query, lang]);

  const usedCats = categories.filter((c) => milestones.some((m) => m.category === c));
  const decades = [...new Set(visible.map(decadeOf))];


  const groups: { key: string; label: string | null; items: Milestone[] }[] =
    sort === "date"
      ? decades.map((d) => ({ key: String(d), label: `${d}s`, items: visible.filter((m) => decadeOf(m) === d) }))
      : [{ key: "all", label: null, items: visible }];

  return (
    <div className="space-y-8">
      <div className="z-10 -mx-4 space-y-3 md:sticky md:top-0 border-b border-line bg-bg/95 px-4 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative w-full md:w-64">
            <span className="sr-only">{dict.search}</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dict.search}
              className="w-full rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink placeholder:text-faint focus:border-gold focus:outline-none"
            />
          </label>
          <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 text-sm md:mx-0 md:px-0">
            <span className="shrink-0 text-faint">{dict.sort}</span>
            <Chip active={sort === "date"} onClick={() => setSort("date")}>{dict.sortDate}</Chip>
            <Chip active={sort === "return"} onClick={() => setSort("return")}>{dict.sortReturn}</Chip>
            <span className="mx-1 w-px shrink-0 self-stretch bg-line" />
            <span className="shrink-0 text-faint">{dict.risk}</span>
            {(["low", "medium", "high"] as const).map((r) => (
              <Chip key={r} active={risk === r} onClick={() => setRisk(risk === r ? "all" : r)}>
                {dict.levels[r]}
              </Chip>
            ))}
          </div>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          <Chip active={category === "all"} onClick={() => setCategory("all")}>{dict.all}</Chip>
          {usedCats.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {dict.categories[c]}
            </Chip>
          ))}
        </div>
        {sort === "date" && decades.length > 1 && (
          <nav className="no-scrollbar flex gap-4 overflow-x-auto font-mono text-sm tabular">
            {decades.map((d) => (
              <a key={d} href={`#d${d}`} className="text-faint hover:text-gold">
                {d}s
              </a>
            ))}
          </nav>
        )}
      </div>

      {visible.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">
          <p>{dict.empty}</p>
          <button
            type="button"
            onClick={() => {
              setCategory("all");
              setRisk("all");
              setQuery("");
            }}
            className="mt-4 rounded-full bg-gold px-4 py-2 text-sm font-medium text-on-gold"
          >
            {dict.clear}
          </button>
        </div>
      )}

      {groups.map((g) => (
        <section key={g.key} id={`d${g.key}`} className="scroll-mt-48 md:grid md:grid-cols-[160px_1fr] md:gap-8">
          {g.label && (
            <div className="mb-4 md:mb-0">
              <div className="font-display text-4xl font-extrabold tracking-tight text-gold md:sticky md:top-56 md:text-6xl">
                {g.label}
              </div>
            </div>
          )}
          <div className={`space-y-4 ${g.label ? "" : "md:col-span-2"}`}>
            {g.items.map((m) => (
              <div key={m.id}>{cards[m.id]}</div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
