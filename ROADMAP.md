# The Reincarnation Checklist — long-range roadmap

> Planning baseline: 2026-11-11. This is a prioritization proposal, not a release commitment. Revisit after each gate. `PROJECT_STATE.md` and parts of `README.md` contain stale counts and future-work claims; use current code, checks, and this plan rather than their old “immediate next action.”

## Product direction

Build a trustworthy, bilingual **historical-finance explorer for the “reborn in the past” thought experiment** for **both fiction writers/history readers and finance-curious players**. Serve them through two clear journeys using the same sourced history: research an era and its prices, or play and compare hindsight scenarios. The differentiator is source-aware storytelling across countries, a practical price Almanac, and playable hindsight scenarios—not a live trading recommender. Separate three things everywhere: (1) documented historical events, (2) an illustrative calculation under stated assumptions, and (3) an executable trade. Do not imply (2) proves (3). Keep English and Vietnamese first-class and the card game Vietnam-only unless user research changes that direction.

**North-star question:** Can a first-time visitor pick a country/year, understand one sourced event and its limitations, then voluntarily explore a second relevant surface (Almanac, What If, quiz, or game)? Do not optimize for spectacular return figures at the cost of trust.

## Current baseline (checked locally)

- Next.js 16/React 19/TypeScript, static JSON data, no account, backend, database, or configured git remote. Not deployed; `SITE_URL` falls back to an unconfirmed domain. There is no `.github` workflow directory. Local working tree has many uncommitted changes; preserve and review them before any commit or release.
- Routes checked in a local browser: EN home, country timeline, milestone detail, Almanac, What If/playbook, quiz, Survival, World, Search; VI simulator also rendered. The year picker, mobile menu, playbook and Almanac handoff were exercised in earlier local checks. This is a spot check, **not** a full device or content audit.
- `npm run test`: 121/121 pass; `npm run validate`: 328 milestones, 315 flagged `verified`; `npm run lint`: 0 errors, 10 warnings in soft-hidden Charm files; `npm run build`: succeeds, with OG dynamic-font/metadata-base warnings. `verified` currently means source links exist, **not** independent human verification. Dev console reported Next.js instant-navigation URL-data warnings on country and detail routes, while those pages rendered.
- Recent local corrections distinguish nominal cash from purchasing power, prevent overlapping playbook compounding, fix Survival balance/start-year display, remove TGG's reward path, reframe Berkshire/Bitcoin/TGG claims, and stop out-of-range Almanac wage backfill. These are **uncommitted** and not a public-release sign-off.

## Sequence and release gates

### Gate 0 — Stabilize the working MVP (now; roughly 1–2 weeks)

**Why first:** A public finance-facing launch would amplify uncertain source claims and unreviewed local changes.

1. Review the current diff by feature and data change; keep a rollback path, remove only accidental artifacts, and get user sign-off before committing. Do not treat passing tests as a historical audit. Update the stale handoff/README *after* review so the next contributor does not revive old P0 tasks.
2. Establish repeatable local checks first: test, lint, build, data validation, diff check, dependency/security checks, and a small EN/VI mobile/desktop browser smoke suite. Add remote CI when a repository is chosen later; do not make a remote or hosting account a prerequisite for local quality work. Keep image/font build warnings visible; diagnose OG-font fallback and metadata-base behavior before launch.
3. Audit the most-visible numeric claims and quizzes first (top gain cards, homepage/SEO snippets, quoted entries, multi-asset chains). Use separate research and audit agents: one proposes a claim/correction, another opens the cited sources and checks that each exact date, number, interpretation, and return assumption follows from the source. Record source URL and relevant excerpt, observation date, price basis (intraday/close, adjusted/unadjusted), currency, units, liquidity/fees assumptions, agent reviewer, and unresolved caveats. Link the relevant source on the public milestone; a news link by itself is not proof the claim is correct. Correct, qualify, or omit a claim if the evidence cannot be established. Specifically recheck the 2024 Berkshire exit basis, remaining Bitcoin-related routes, and TGG references after the recent edits.
4. Strengthen `scripts/validate-data.mjs` and tests for coherent entry/exit units, date order, multiple arithmetic when comparable, required source/basis metadata, no out-of-range Almanac extrapolation, and no `historicalOnly` case entering gains, playbooks, or Survival. Avoid hard-requiring fields on all legacy entries until they have been triaged.
5. Reproduce the reported slow Almanac→playbook handoff and reload hydration issues on actual mobile and desktop, with network timing and console logs. The earlier successful handoff/reload spot checks do **not** close those reports. Triage country/detail instant-navigation warnings using the installed Next 16 guide rather than assuming older framework behavior. Verify 2024 picker/empty-state, mobile navigation, and quiz question quality in both languages.

**Exit gate:** Reviewed diff; all four checks green; documented EN/VI mobile/desktop critical-path runs; no known misleading high-visibility gain or broken first-run flow; open content claims carry explicit uncertainty rather than an unsupported `verified` interpretation. Not yet a legal or complete 328-record certification.

### Gate 1 — Validate both journeys locally, then prepare a public beta (next; roughly 2–6 weeks after Gate 0)

1. Validate and polish both entry paths—writer/history research and finance-curious play—on local/staging builds first. **Choose the domain and hosting account as the final launch preparation step**, after the content and product gates. Configure `NEXT_PUBLIC_SITE_URL` only for a domain the owner controls; then run production smoke, sitemap/canonical/hreflang/OG checks, accessibility and performance checks, and a rollback rehearsal. A successful local build does not imply launch readiness.
2. Add a bilingual **methodology + corrections** page: what “source linked” versus “checked by separate agents” means, and that neither implies human/professional certification; as-of dates; nominal vs real money; price-only vs total return; split/FX treatment; estimated vs exact prices; fees, liquidity, taxes and survivorship bias. Link it from claims and the disclaimer. Make a straightforward data-error report path before advertising finance credibility.
3. Define a claim-level queue with evidence and status. The proposing agent and a separate auditing agent must record the exact source link/excerpt and check numbers, timing, units, price basis, and whether the source supports the *interpretation*; mark unresolved contradictions explicitly. Prefer primary documents, then reputable contemporary reporting, and link the evidence on each public milestone. An agent audit is a documented editorial check, **not** independent human or professional verification; the site must say so. The owner makes the final publish/withhold decision on agent-reviewed claims and accepts residual risk, without personally rechecking every record. A prior 25-record audit contained a mistaken Nubank correction; do not reuse its original error-rate estimate as a current statistic (`docs/research/data-quality.md`). **There is no budget for professional legal or paid data review:** review source terms before reuse, avoid unlicensed bulk market-data feeds, and qualify or omit uncertain claims. An online news article does not automatically grant rights to republish its text or data.
4. Make the main journey legible: year/country selection → event → source and caveat → context/comparison/game. Label theoretical vs realistic playbooks in plain language; use loading and empty states where streamed routes can appear blank. Consider moving the quiz closer to a milestone as an optional comprehension step, rather than forcing a separate top-level journey; validate with users first.
5. Conduct low-cost sessions with real EN and VI users from **both** audiences (writers/history readers and finance-curious players); previous agent personas were simulated QA, not customer evidence. Take voluntary notes on misunderstood figures, drop-off points, and return intent. **Defer analytics instrumentation**; do not claim usage rates from these small sessions.

**Exit gate:** Both journeys pass user comprehension checks and a documented two-agent source/terms review; correction channel and published limitations page are ready. Then select domain/host, run production smoke across both locales and representative devices, and obtain owner approval for beta. This is not independent human verification or professional legal certification; if a material rights or legal issue cannot be resolved, omit the affected content/feed or defer public launch. Publish only after Gate 0.

### Gate 2 — Evidence-led depth and retention (1–3 months after beta)

- **Content quality over volume:** expand Almanac only where original source, units, geography, dates and interpolation bounds are defensible. Add low-capital work/skill stories from `docs/research/content-expansion.md` as *historical case studies* first; do not attach an investment multiple without a comparable, executable instrument. Deepen underserved countries only where sourcing is feasible.
- **Game design:** test whether Survival's fixed 3% skip-only penalty and USD-denominated starting score are understood in a Vietnam run; consider a clearer game currency/score model or genuinely sourced country-year CPI. Keep manipulated assets as risk-recognition rounds unless scoring is redesigned. Balance the VN-only card game from observed completion and decision patterns, not just simulated Monte Carlo.
- **Return visits:** try lightweight local progress or challenge replay only if beta users ask for it. Charm/Cheat Sheet is soft-hidden; decide whether to rebuild it around a concrete save-and-revisit job or retire it. Do not promise sync or persistence beyond the browser.
- **Discovery:** test onboarding/tutorial and cross-links; improve quiz questions from exact-number recall toward causal reasoning. Add accessible keyboard/focus/reduced-motion regression and resource-budget checks where they solve observed friction.

**Exit gate:** A reviewed content batch, clear game assumptions, repeatable user-research evidence of comprehension and return intent, and no regression in trust or core-flow completion.

### Gate 3 — Sustainable data operations and distribution (3–6 months; conditional)

- Introduce optional `asOf`, `priceBasis`, observation type, source/license, and verification-level metadata, migrating data in reviewed batches. Keep a human approval step for every financial-price update. Run link health and staleness checks separately from deploys; a dead third-party site should not silently turn a historical claim into zero or break the app.
- **Only if rights and usefulness are established:** pilot a narrow refresh source (for example one crypto series) after checking current display/redistribution terms. No paid feed is assumed. Do not scrape or use free personal-use feeds as a public commercial data backend. The older provider/price/licensing table in `docs/research/data-quality.md` is research, not a current contract or legal opinion.
- **Analytics later:** if manual feedback shows what needs measuring, choose a privacy-respecting aggregate tool and assess consent/retention obligations before collection. Until then, rely on voluntary feedback and technical error logs, not invented traffic/conversion baselines.
- Test distribution through creator/writer communities and citation-worthy historical explainers before building viral embeds, exports, or integrations. Choose one channel with measurable qualified visits rather than shipping every sharing surface.

**Exit gate:** Approved provenance pipeline, reproducible review/rollback of price changes, evidence that a chosen channel brings qualified users, and a documented ongoing editorial owner.

### Gate 4 — Optional expansion (6–12 months; explicit go/no-go)

- Consider user accounts, cross-device saves, leaderboards, API, paid features, or B2B/research tools **only** after demand, legal scope, data rights, support cost, and privacy impact are measured. Current static JSON architecture is adequate for the beta; no database or auth stack should be added by default.
- Monetization experiments require a testable user job (for example a writer needing exportable, sourced historical price context), a price/market interview, and permission to redistribute any bundled data. Do not adopt the old `PROJECT_STATE.md` MRR or break-even projections as a forecast.
- Reassess expansion to new countries or languages after editorial capacity and actual traffic justify keeping them accurate. Each additional market adds provenance, translation, and legal maintenance.

## Operating cadence and decision log

- Weekly: review feedback, broken journeys, stale/incorrect claims and CI; prioritize trust regressions above new features.
- Monthly: sample-audit records by asset and country, measure time-to-correct, review EN/VI copy and accessibility, prune features that do not support the primary journey.
- Quarterly: reassess beta evidence and the next gate. Record a named owner, scope, measurable acceptance criteria, data rights, and rollback for each new initiative.
- Track manually at first: critical-path completion in user sessions, misunderstood claims, proportion of high-visibility numeric claims source-checked by the team, age of price snapshots, confirmed claim-error rate **from a new audited sample**, correction time, and EN/VI mobile/desktop crashes and loading delays. Add second-surface engagement and traffic measures only after analytics is deliberately introduced. Establish baselines before setting numeric targets.

## Owner decisions and remaining launch choices

1. **Decided:** Serve both fiction writers/history readers and finance-curious players; test both journeys and do not assume one audience is secondary.
2. **Decided:** Domain and hosting account are chosen at the end of launch preparation, not now. Their selection and production verification still precede a public release.
3. **Decided:** Separate research and audit agents document claim-level checks and attach source links; the owner approves or withholds publication of the reviewed batch and accepts residual risk. Agent sign-off means *agent-checked*, not independently human-verified. No budget for professional legal/data review; internet accessibility does **not** guarantee accuracy or redistribution rights.
4. **Decided:** Analytics setup comes later. Gather voluntary qualitative feedback in the meantime; choose a tool and privacy policy only when measurement needs are clear.

**Not in scope now:** automatic real-time trading advice, unsupported “guaranteed” backtests, an assumed premium subscription, or a database migration without demonstrated need.
