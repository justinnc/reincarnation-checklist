// Validates src/data/milestones/*.json against the Milestone schema.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = "src/data/milestones";
const CATS = ["stocks", "crypto", "real-estate", "technology", "business", "macro", "commodities"];
const LEVELS = ["low", "medium", "high"];
const errors = [];
const DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/;
const TODAY = new Date().toISOString().slice(0, 10);
const ids = new Set();
const lt = (v, path) => {
  if (!v || typeof v.en !== "string" || typeof v.vi !== "string" || !v.en || !v.vi) errors.push(`${path}: needs non-empty vi + en`);
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
    if (!DATE_RE.test(m.date)) errors.push(`${p}: bad date ${m.date}`);
    if (!CATS.includes(m.category)) errors.push(`${p}: bad category ${m.category}`);
    lt(m.title, `${p}.title`);
    lt(m.description, `${p}.description`);
    const o = m.opportunity ?? {};
    lt(o.action, `${p}.opportunity.action`);
    lt(o.buyWhen, `${p}.opportunity.buyWhen`);
    lt(o.estimatedReturn, `${p}.opportunity.estimatedReturn`);
    for (const k of ["risk", "capital"]) if (o[k] && !LEVELS.includes(o[k])) errors.push(`${p}: bad ${k}`);
    if (o.returnMultiple != null && !(o.returnMultiple > 0)) errors.push(`${p}: bad returnMultiple`);
    if (o.entryPrice != null && o.exitPrice != null && o.returnMultiple > 0) {
      const implied = o.exitPrice / o.entryPrice;
      if (Math.abs(implied - o.returnMultiple) / o.returnMultiple > 0.15)
        errors.push(`${p}: prices contradict returnMultiple (${implied.toFixed(2)} vs ${o.returnMultiple})`);
    }
    if (o.exitDate != null) {
      if (!DATE_RE.test(o.exitDate)) errors.push(`${p}: bad exitDate ${o.exitDate}`);
      else if (o.exitDate.slice(0, Math.min(o.exitDate.length, m.date.length)) < m.date.slice(0, Math.min(o.exitDate.length, m.date.length)))
        errors.push(`${p}: exitDate ${o.exitDate} before date ${m.date}`);
      else if (o.exitDate > TODAY) errors.push(`${p}: exitDate ${o.exitDate} is in the future`);
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
    if (!Array.isArray(m.sources) || m.sources.some((s) => !/^https?:\/\//.test(s.url))) errors.push(`${p}: bad sources`);
    if (typeof m.verified !== "boolean") errors.push(`${p}: verified must be boolean`);
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`OK: ${total} milestones (${verified} verified)`);
