// Validates src/data/milestones/*.json against the Milestone schema.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] ?? "src/data/milestones";
const CATS = ["stocks", "crypto", "real-estate", "technology", "business", "macro", "commodities"];
const LEVELS = ["low", "medium", "high"];
const errors = [];
const DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/;
const TODAY = new Date().toISOString().slice(0, 10);
const ids = new Set();
const lt = (v, path) => {
  if (!v || typeof v.en !== "string" || typeof v.vi !== "string" || !v.en || !v.vi) errors.push(`${path}: needs non-empty vi + en`);
};
const validSourceUrl = (value) => {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
};

// A partial date is an interval; only reject an exit definitively before entry.
const dateRange = (value) => {
  if (typeof value !== "string" || !DATE_RE.test(value)) return null;
  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText ?? "01");
  if (year < 1 || month < 1 || month > 12) return null;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const lastDay = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  if (dayText !== undefined && (Number(dayText) < 1 || Number(dayText) > lastDay)) return null;
  const from = `${yearText}-${monthText ?? "01"}-${dayText ?? "01"}`;
  const to = dayText !== undefined ? from : `${yearText}-${monthText ?? "12"}-${monthText === undefined ? "31" : String(lastDay).padStart(2, "0")}`;
  return { from, to };
};

let total = 0;
let verified = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const list = JSON.parse(readFileSync(join(dir, file), "utf8"));
  for (const m of list) {
    total++;
    if (m.verified) verified++;
    const p = `${file}#${m.id}`;
    if (ids.has(m.id)) errors.push(`${p}: duplicate id`);
    ids.add(m.id);
    const entryDate = dateRange(m.date);
    if (!entryDate) errors.push(`${p}: bad date ${m.date}`);
    if (!CATS.includes(m.category)) errors.push(`${p}: bad category ${m.category}`);
    lt(m.title, `${p}.title`);
    lt(m.description, `${p}.description`);
    const listedUrls = new Set(Array.isArray(m.sources) ? m.sources.filter((s) => s && validSourceUrl(s.url)).map((s) => s.url) : []);
    const o = m.opportunity ?? {};
    if (o.historicalOnly !== undefined && typeof o.historicalOnly !== "boolean") errors.push(`${p}: historicalOnly must be boolean`);
    if (o.historicalOnly === true) {
      for (const k of ["returnMultiple", "entryPrice", "exitPrice", "priceObservations", "splitFactor"])
        if (o[k] != null) errors.push(`${p}: historicalOnly cannot have ${k}`);
    }
    lt(o.action, `${p}.opportunity.action`);
    lt(o.buyWhen, `${p}.opportunity.buyWhen`);
    lt(o.estimatedReturn, `${p}.opportunity.estimatedReturn`);
    for (const k of ["risk", "capital"]) if (o[k] && !LEVELS.includes(o[k])) errors.push(`${p}: bad ${k}`);
    if (o.returnMultiple != null && (typeof o.returnMultiple !== "number" || !Number.isFinite(o.returnMultiple) || o.returnMultiple <= 0)) errors.push(`${p}: bad returnMultiple`);
    for (const k of ["entryPrice", "exitPrice", "splitFactor"])
      if (o[k] != null && (typeof o[k] !== "number" || !Number.isFinite(o[k]) || o[k] <= 0)) errors.push(`${p}: bad ${k}`);
    if (o.splitFactor != null && (o.entryPrice == null || o.exitPrice == null))
      errors.push(`${p}: splitFactor needs both entryPrice and exitPrice`);
    // One rule for every priced milestone: multiple = exitPrice x splitFactor / entryPrice (nominal prices).
    if (o.entryPrice > 0 && o.exitPrice > 0 && o.returnMultiple > 0) {
      const implied = (o.exitPrice * (o.splitFactor ?? 1)) / o.entryPrice;
      if (Math.abs(implied - o.returnMultiple) / o.returnMultiple > 0.02)
        errors.push(`${p}: prices contradict returnMultiple (${implied.toPrecision(4)} vs ${o.returnMultiple})`);
    }
    if (o.priceObservations !== undefined) {
      const observations = o.priceObservations;
      const complete = observations && typeof observations === "object" && o.entryPrice > 0 && o.exitPrice > 0 && o.returnMultiple > 0 && observations.entry && observations.exit;
      if (!complete) errors.push(`${p}: priceObservations need positive entry/exit prices, returnMultiple and both observations`);
      else {
        const { entry, exit } = observations;
        for (const [side, item] of [["entry", entry], ["exit", exit]]) {
          if (!item || !dateRange(item.date) || dateRange(item.date).from > TODAY || typeof item.unit !== "string" || !item.unit.trim() || !/^([A-Z]{3}|points)$/.test(item.currency) || !["open", "close", "intraday", "average", "estimate", "other"].includes(item.basis) || !listedUrls.has(item.sourceUrl))
            errors.push(`${p}: bad priceObservations.${side} (date, unit, currency, basis, listed source required)`);
        }
        const entryRange = dateRange(entry.date);
        const exitRange = dateRange(exit.date);
        if (entryRange && exitRange && exitRange.to < entryRange.from) errors.push(`${p}: priceObservations exit before entry`);
        if (entry.unit !== exit.unit || entry.currency !== exit.currency || (o.priceCurrency && o.priceCurrency !== entry.currency))
          errors.push(`${p}: priceObservations units/currencies are not comparable`);
      }
    }
    if (o.exitAtPeak !== undefined && (o.exitAtPeak !== true || o.exitDate == null || !(o.returnMultiple > 0) || o.historicalOnly))
      errors.push(`${p}: exitAtPeak must be true and needs exitDate and returnMultiple`);
    if (o.exitDate != null) {
      const exitDate = dateRange(o.exitDate);
      if (!exitDate) errors.push(`${p}: bad exitDate ${o.exitDate}`);
      else if (entryDate && exitDate.to < entryDate.from) errors.push(`${p}: exitDate ${o.exitDate} before date ${m.date}`);
      else if (exitDate.from > TODAY) errors.push(`${p}: exitDate ${o.exitDate} is in the future`);
    }
    // ISO 4217 code, or "points" for index levels (S&P, Nikkei, VN-Index...) which have no currency.
    if (o.priceCurrency != null && !/^([A-Z]{3}|points)$/.test(o.priceCurrency)) errors.push(`${p}: bad priceCurrency ${o.priceCurrency}`);
    if (m.private != null && typeof m.private !== "boolean") errors.push(`${p}: private must be boolean`);
    if (m.verified === true && (m.sources?.length ?? 0) < 2) errors.push(`${p}: verified needs >=2 sources`);
    if (m.quiz) {
      lt(m.quiz.question, `${p}.quiz.question`);
      if (!Array.isArray(m.quiz.choices) || m.quiz.choices.length < 2) errors.push(`${p}: quiz needs choices`);
      else m.quiz.choices.forEach((c, i) => lt(c, `${p}.quiz.choices[${i}]`));
      if (!(m.quiz.answer >= 0 && m.quiz.answer < (m.quiz.choices?.length ?? 0))) errors.push(`${p}: bad quiz.answer`);
    }
    if (!Array.isArray(m.sources) || m.sources.some((s) => !s || !validSourceUrl(s.url))) errors.push(`${p}: bad sources`);
    if (typeof m.verified !== "boolean") errors.push(`${p}: verified must be boolean`);
    if (m.claimReview !== undefined) {
      const r = m.claimReview;
      if (!r || !["pending", "agent-checked"].includes(r.status)) errors.push(`${p}: bad claimReview.status`);
      else if (r.status === "agent-checked") {
        lt(r.claim, `${p}.claimReview.claim`);
        if (typeof r.proposedBy !== "string" || !r.proposedBy.trim() || typeof r.checkedBy !== "string" || !r.checkedBy.trim() || r.proposedBy.trim().toLowerCase() === r.checkedBy.trim().toLowerCase())
          errors.push(`${p}: claimReview needs distinct proposing and checking agents`);
        if (!Array.isArray(r.evidence) || !r.evidence.length) errors.push(`${p}: claimReview needs cited evidence`);
        else for (const e of r.evidence) {
          if (!e || !listedUrls.has(e.url) || typeof e.excerpt !== "string" || !e.excerpt.trim() || !dateRange(e.observedOn) || e.observedOn.length !== 10 || e.observedOn > TODAY)
            errors.push(`${p}: bad claimReview evidence (listed URL, excerpt and past observation date required)`);
        }
      }
    }
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`OK: ${total} milestones (${verified} legacy verified flags; not claim checks)`);
