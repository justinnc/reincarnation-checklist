import { describe, expect, it } from "vitest";
import { allMilestones } from "@/lib/data";

/** Numbers in a string, e.g. "HK$1,800.50" → [1800.5]; "4.7%" → [4.7]. Thousands commas are dropped. */
function numbers(text: string): { value: number; decimals: number }[] {
  return (text.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map((raw) => {
    const clean = raw.replace(/,(?=\d{3}\b)/g, "").replace(/,/g, "");
    const decimals = clean.includes(".") ? clean.split(".")[1].length : 0;
    return { value: Number(clean), decimals };
  });
}

describe("quiz correct answers are backed by the milestone's own text", () => {
  it("every number in a correct (English) answer appears in the milestone, allowing for rounding", () => {
    const problems: string[] = [];
    for (const m of allMilestones) {
      if (!m.quiz) continue;
      const answer = m.quiz.choices[m.quiz.answer]?.en ?? "";
      const context = JSON.stringify([
        m.title.en,
        m.summary?.en,
        m.description.en,
        m.opportunity,
        m.insiderTip?.en,
        m.pitfalls?.en,
        m.quiz.explanation?.en,
        m.sources,
        m.date,
      ]);
      const known = numbers(context).map((n) => n.value);
      for (const n of numbers(answer)) {
        // "~49%" may round 49.3; "4.7%" may round 4.67; "HK$8.00" may restate 8.
        const tolerance = 0.5 * 10 ** -n.decimals + 1e-9;
        if (!known.some((k) => Math.abs(k - n.value) <= tolerance)) {
          problems.push(`${m.id}: "${answer}" — ${n.value} not found in the milestone text`);
        }
      }
    }
    expect(problems).toEqual([]);
  });
});
