"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import type { Country, Milestone } from "@/lib/types";
import WhatIfCalculator from "./WhatIfCalculator";
import PlaybookBuilder from "./PlaybookBuilder";

type Props = {
  lang: Locale;
  countries: Country[];
  milestones: Milestone[];
};

export default function WhatIfTabs({ lang, countries, milestones }: Props) {
  const search = useSearchParams();
  const initialMode = search.get("mode") === "playbook" || search.get("chain") || search.get("pin") || search.get("from") ? "playbook" : "single";
  const [mode, setMode] = useState<"single" | "playbook">(initialMode);

  const tabSingle = lang === "vi" ? "Một tài sản (15 nước)" : "Single Asset (15 countries)";
  const tabPlaybook =
    lang === "vi" ? "⚡ Chuỗi Trọng Sinh Liên Hoàn (15 nước)" : "⚡ Compounding Playbook (15 countries)";

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-full border border-line bg-surface p-1">
        <button
          type="button"
          onClick={() => setMode("single")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            mode === "single" ? "bg-gold text-on-gold" : "text-muted hover:text-ink"
          }`}
        >
          {tabSingle}
        </button>
        <button
          type="button"
          onClick={() => setMode("playbook")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            mode === "playbook" ? "bg-gold text-on-gold" : "text-muted hover:text-ink"
          }`}
        >
          {tabPlaybook}
        </button>
      </div>

      {mode === "single" ? <WhatIfCalculator lang={lang} /> : <PlaybookBuilder lang={lang} countries={countries} milestones={milestones} />}
    </div>
  );
}
