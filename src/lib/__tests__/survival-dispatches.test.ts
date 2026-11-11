import { describe, expect, it } from "vitest";
import { allMilestones, yearOf } from "@/lib/data";
import { getContemporaryDispatch } from "@/lib/survival";
import dispatches from "@/data/survival-dispatches.json";

type Entry = Record<"headline" | "dispatch" | "sentiment", { en: string; vi: string }>;
const entries = Object.entries(dispatches as Record<string, Entry>);
const byId = new Map(allMilestones.map((m) => [m.id, m]));

// Outcome/verdict words that cannot appear in a dispatch shown BEFORE the player decides.
const BANNED_EN =
  /\b((?<!pay-)later|eventually|ultimately|subsequently|afterwards?|went on|would go on|turned out|in hindsight|became|bankrupt\w*|insolven\w*|fraud\w*|scam\w*|scandal\w*|ponzi|delist\w*|multibagger|all-time high)\b|\d+(?:\.\d+)?\s*[x×](?![a-z])|×/i;
// "N lần" is banned as a return multiple, except straight after "đặt mua (cao) gấp": an IPO's
// oversubscription ratio is known on the day.
const BANNED_VI =
  /(sau này|sau đó|về sau|cuối cùng|rốt cuộc|trở thành|phá sản|lừa đảo|bê bối|gian lận|thao túng|đến nay|hiện nay|ngày nay|tới nay|(?<![\d.,])(?<!đặt mua (?:cao )?gấp )\d+(?:[.,]\d+)?\s*lần|×)/i;

const digitTokens = (s: string) =>
  (s.match(/\d[\d.,]*/g) ?? []).map((t) => t.replace(/\D/g, "")).filter(Boolean);

describe("hand-written Survival dispatches", () => {
  it("bans Vietnamese return multiples but allows oversubscription ratios", () => {
    for (const s of ["giá tăng 34 lần", "gấp 38,25 lần vốn ban đầu", "lãi gấp 5 lần", "tăng 2.000lần"]) {
      expect(s, s).toMatch(BANNED_VI);
    }
    for (const s of ["lượng đặt mua cao gấp 34 lần lượng chào bán", "lượng đặt mua gấp 38,25 lần số cổ phiếu chào bán"]) {
      expect(s, s).not.toMatch(BANNED_VI);
    }
  });

  it("only cover real, playable milestones", () => {
    for (const [id] of entries) {
      const m = byId.get(id);
      expect(m, id).toBeDefined();
      expect(m!.opportunity.historicalOnly, id).toBeFalsy();
    }
  });

  it("are bilingual, within length limits and free of raw escapes", () => {
    const limits = { headline: 120, dispatch: 300, sentiment: 90 } as const;
    for (const [id, e] of entries) {
      for (const field of Object.keys(limits) as (keyof typeof limits)[]) {
        for (const lang of ["en", "vi"] as const) {
          const text = e[field]?.[lang] ?? "";
          expect(text.trim().length, `${id}.${field}.${lang}`).toBeGreaterThan(0);
          expect(text.length, `${id}.${field}.${lang}`).toBeLessThanOrEqual(limits[field]);
          expect(text, `${id}.${field}.${lang}`).not.toContain("\\u");
        }
      }
    }
  });

  it("contain no hindsight: no outcome words and no year after the event", () => {
    for (const [id, e] of entries) {
      const year = yearOf(byId.get(id)!);
      for (const field of ["headline", "dispatch", "sentiment"] as const) {
        for (const lang of ["en", "vi"] as const) {
          const text = e[field][lang];
          expect(text, `${id}.${field}.${lang}`).not.toMatch(lang === "vi" ? BANNED_VI : BANNED_EN);
          for (const y of text.match(/\b(1[89]\d{2}|20\d{2})\b/g) ?? []) {
            expect(Number(y), `${id}.${field}.${lang} mentions ${y}`).toBeLessThanOrEqual(year);
          }
        }
      }
    }
  });

  it("use only numbers that appear in the milestone's own sourced text", () => {
    for (const [id, e] of entries) {
      const m = byId.get(id)!;
      const source = new Set(
        digitTokens(JSON.stringify([m.title, m.summary, m.description, m.opportunity.asset, m.opportunity.entryPrice, m.date]))
      );
      for (const field of ["headline", "dispatch", "sentiment"] as const) {
        for (const lang of ["en", "vi"] as const) {
          for (const d of digitTokens(e[field][lang])) {
            const known = source.has(d) || [...source].some((s) => s.includes(d));
            expect(known, `${id}.${field}.${lang}: number ${d} is not in the milestone text`).toBe(true);
          }
        }
      }
    }
  });

  it("leave no playable milestone on the generic fallback template", () => {
    const generic = allMilestones
      .filter((m) => !m.opportunity.historicalOnly)
      .filter((m) => {
        const d = getContemporaryDispatch({ milestone: m, year: yearOf(m) } as never);
        return (
          d.headline.en.startsWith("Financial Wire:") ||
          d.headline.vi.startsWith("Bản tin tài chính:") ||
          d.dispatch.en.startsWith("Markets are closely watching") ||
          d.dispatch.vi.startsWith("Thị trường ghi nhận nhiều biến chuyển")
        );
      })
      .map((m) => m.id);
    expect(generic).toEqual([]);
  });
});
