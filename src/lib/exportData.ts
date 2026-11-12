import { pointYear, type AlmanacItem } from "./almanac";
import { t, type Locale } from "./i18n";
import type { PlaybookResult } from "./whatif/playbook";

type Cell = string | number | boolean | null | undefined;

/** RFC 4180 cell. Text starting with = + - @ gets a leading apostrophe so spreadsheets
 *  don't run it as a formula; numbers are written as-is. */
function csvCell(v: Cell): string {
  if (v == null) return "";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "";
  if (typeof v === "boolean") return v ? "true" : "false";
  const s = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(header: string[], rows: Cell[][]): string {
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

export interface ExportFile {
  /** File name without extension. */
  name: string;
  csv: string;
  json: string;
}

/** The recorded observations of one almanac item, exactly as stored (no interpolation). */
export function almanacExport(item: AlmanacItem, lang: Locale): ExportFile {
  const unit = t(item.unit, lang);
  const sources = item.sources.map((s) => s.url).join(" | ");
  const rows = item.series.map((p) => [pointYear(p), p.date, p.value, p.min, p.max, unit, item.currency, item.valueMultiplier, item.quality, p.note, sources]);
  return {
    name: `almanac-${item.id}`,
    csv: toCsv(["year", "date", "value", "min", "max", "unit", "currency", "value_multiplier", "quality", "note", "sources"], rows),
    json: JSON.stringify(
      {
        id: item.id,
        country: item.country,
        name: t(item.name, lang),
        unit,
        currency: item.currency,
        valueMultiplier: item.valueMultiplier,
        quality: item.quality,
        note: t(item.note, lang),
        series: item.series,
        sources: item.sources,
      },
      null,
      2,
    ),
  };
}

export interface PlaybookExportMeta {
  country: string;
  currency: string;
  realistic: boolean;
  /** Absolute site origin used to build milestone links. */
  origin: string;
}

/** The compounding ledger currently shown in the Playbook Builder. */
export function playbookExport(result: PlaybookResult, meta: PlaybookExportMeta, lang: Locale): ExportFile {
  const note =
    lang === "vi"
      ? "Mô phỏng từ số liệu lịch sử, mang tính xấp xỉ. Không phải lời khuyên đầu tư."
      : "Simulation from historical, approximate figures. Not investment advice.";
  const steps = result.steps.map((s, i) => {
    const m = s.candidate.milestone;
    return {
      step: i + 1,
      id: m.id,
      title: t(m.title, lang),
      periodStart: s.candidate.periodStart,
      periodEnd: s.candidate.periodEnd,
      multiple: s.candidate.multiple,
      capitalBefore: s.capitalBefore,
      deployedCapital: s.deployedCapital,
      capitalAfter: s.capitalAfter,
      cumulativeMultiple: s.cumulativeMultiple,
      cappedByLiquidity: s.cappedByLiquidity,
      speculative: s.candidate.speculative,
      url: `${meta.origin}/${lang}/${m.country}/${m.id}`,
    };
  });
  return {
    name: `playbook-${meta.country}`,
    csv: toCsv(
      ["step", "milestone_id", "title", "period_start", "period_end", "multiple", "capital_before", "deployed_capital", "capital_after", "cumulative_multiple", "currency", "liquidity_capped", "speculative", "url"],
      steps.map((s) => [s.step, s.id, s.title, s.periodStart, s.periodEnd, s.multiple, s.capitalBefore, s.deployedCapital, s.capitalAfter, s.cumulativeMultiple, meta.currency, s.cappedByLiquidity, s.speculative, s.url]),
    ),
    json: JSON.stringify(
      {
        note,
        country: meta.country,
        currency: meta.currency,
        mode: meta.realistic ? "realistic" : "theoretical-max",
        initialCapital: result.initialCapital,
        finalCapital: result.finalCapital,
        totalMultiple: result.totalMultiple,
        steps,
        excludedOverlaps: result.skippedOverlaps.map((c) => c.milestone.id),
      },
      null,
      2,
    ),
  };
}
