// Validates src/data/milestones/*.json against the Milestone schema.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = "src/data/milestones";
const CATS = ["stocks", "crypto", "real-estate", "technology", "business", "macro", "commodities"];
const LEVELS = ["low", "medium", "high"];
const errors = [];
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
    if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(m.date)) errors.push(`${p}: bad date ${m.date}`);
    if (!CATS.includes(m.category)) errors.push(`${p}: bad category ${m.category}`);
    lt(m.title, `${p}.title`);
    lt(m.description, `${p}.description`);
    const o = m.opportunity ?? {};
    lt(o.action, `${p}.opportunity.action`);
    lt(o.buyWhen, `${p}.opportunity.buyWhen`);
    lt(o.estimatedReturn, `${p}.opportunity.estimatedReturn`);
    for (const k of ["risk", "capital"]) if (o[k] && !LEVELS.includes(o[k])) errors.push(`${p}: bad ${k}`);
    if (o.returnMultiple != null && !(o.returnMultiple > 0)) errors.push(`${p}: bad returnMultiple`);
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
