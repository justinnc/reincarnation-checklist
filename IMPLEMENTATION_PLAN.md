# Implementation plan for `ROADMAP.md`

> Planning document, not a claim that work below is done. Baseline checked 2026-11-11 on local `main`. No commits, deployment, analytics, domain choice, or paid services are authorized by this plan. Work in small reviewable batches; retain all existing uncommitted edits until their owner reviews them.

## Rules of execution

- Product serves **both** fiction writers/history readers and finance-curious players. Test both paths in EN and VI. The Vietnam card game stays Vietnam-only.
- A news link is evidence to inspect, not a proof stamp. One agent proposes a claim/correction; a **separate** agent verifies each exact claim against opened sources and records excerpts, dates, units, price basis, interpretation, and unresolved conflicts. The owner approves or withholds publication of the resulting batch. Call it *agent-checked*, not independent human/legal certification. If evidence or rights are unclear, qualify, omit, or keep offline.
- Static JSON stays the source of truth for now; no database, login, automatic price feed, analytics, or domain/hosting work in Gate 0. Pick domain and hosting only as the final beta-launch step. Do not assume online information is free to republish.
- For each batch: capture a baseline, write regression tests for behavior, make the smallest change, run relevant tests and `npm run test && npm run validate && npm run lint && npm run build`, check EN/VI browser flows where UI changed, record remaining caveats. Do not auto-commit or publish.

## Where we actually start

The repository has many modified files plus untracked tests and `ROADMAP.md`; **do not reset, stash, or commit the whole tree blindly**. The current local checks are 121 passing tests, 328 valid milestones (315 `verified` = source-link status, not fact-checking), lint 0 errors/10 Charm warnings, and a passing build with OG-font/metadata warnings. There is no configured remote. `PROJECT_STATE.md` and `README.md` are partly stale.

### Batch A — Review and freeze the baseline (first; prerequisite to all code changes)

- Inventory `git diff`, untracked files, and each change's provenance; separate prior user work from the recent financial-claim, gameplay, and Almanac fixes. Review user-facing EN/VI copy and data diffs before any commit. Do not include generated `.codegraph/` without a deliberate decision.
- Keep a written checklist of touched paths, intended behavior, and open issues. Confirm the four local checks and a production-build smoke run; record current warnings separately from regressions. Only then update stale handoff docs to reflect the checked state.
- **Done when:** owner can approve or reject each change group without losing any existing work; baseline commands and known limitations are documented. Committing, if desired, is a separate explicit approval.

### Batch B — Data integrity guardrails (after A; can run alongside C)

- Inspect `scripts/validate-data.mjs` and `src/lib/types.ts`; add focused fixture-based validator tests. Enforce `historicalOnly` as a non-investment case: no numeric scenario return/entry/exit fields, and no selection into gain/playbook/Survival paths. Audit sibling selectors in `src/lib/whatif/playbook.ts`, `src/lib/survival.ts`, `src/components/RebirthPicker.tsx`, and milestone summaries rather than fixing one UI only.
- Add observation-date, price-basis, currency/unit, and source-evidence metadata **optionally** for reviewed claims. Check valid date ordering and arithmetic only for comparable entry/exit observations. Report legacy exceptions instead of breaking 328 records with a blanket rule. Preserve source-link status separately from the new `agent-checked` claim status; never silently upgrade all 315.
- Add tests for nominal versus inflation-adjusted cash, nonoverlapping sequential holdings, TGG/Bitcoin exclusion, and no Almanac extrapolation outside documented years (retain the existing regression tests).
- **Done when:** deliberate bad fixtures fail validation, known good records pass, all 121 existing tests and new tests pass, and the numeric UI cannot promote a historical-only case to a gain. Do not infer factual correctness from schema validation.

### Batch C — High-visibility claim audit (after A; parallel with B)

- Build a small ledger under `docs/research/` for the highest-impact numeric claims: homepage/top multiples, milestone entry/exit pairs, associated quizzes and playbook candidates. Fields: milestone ID + exact claim, research agent, independent audit agent, source URL + excerpt, source type/date, observed/as-of date, nominal or split-adjusted basis, currency/unit, liquidity/fees caveat, confidence/status, proposed EN/VI wording, and owner publish decision. Store only short quotations needed to substantiate a claim; link rather than copying full articles.
- Start with Berkshire's 2024 exit quote/basis, Bitcoin-related routes, TGG references, then other top-return cards. An auditor checks the **interpretation** as well as arithmetic; a claim with a correct price but impossible fill still fails. Resolve source disagreement in the ledger. Review public-display/redistribution terms when considering price feeds or copied material.
- Apply only audited corrections in EN and VI with targeted tests. Unresolved records get qualified labels or no scenario multiplier. Ensure quiz text and metadata do not repeat retired claims.
- **Done when:** the selected visible claims have direct evidence and a second-agent audit, the app links relevant sources, and an owner can review the batch. This is not a certification of all milestones or professional legal clearance.

### Batch D — First-run and navigation QA (after A; can overlap B/C)

- Reproduce the intermittently slow Almanac→playbook link and reload hydration report in a production build on mobile and desktop. Time click-to-interactive, capture network/console evidence; distinguish an unrendered streamed shell from a genuinely broken page. Inspect installed Next 16 docs before changing country/detail navigation in response to instant-shell warnings.
- Exercise both journeys: year/country → milestone → sources/caveat → Almanac or What If → quiz/game; cover EN/VI, a 2024 empty-state, one low-data country, and one historical-only record. Include keyboard/focus and reduced-motion spot checks. Fix only reproducible defects; add tests before code changes where feasible.
- **Done when:** a repeatable smoke script/checklist records route, viewport, expected state, measured time, and console errors; outstanding intermittent reports are either reproduced and fixed or explicitly remain open with repro attempts.

### Batch E — Local release candidate (after B–D)

- Run all checks from a clean test invocation, inspect `git diff --check`, and test the production build in a fresh server process. Resolve or document OG-font/metadata-base warnings. Review high-visibility landing copy, disclaimers, SEO metadata, and source links for claims changed in C.
- Owner reviews the diff and agent ledger together. Do **not** claim a public release or complete audit. If approved, update `PROJECT_STATE.md` and `README.md` to the checked baseline; commit only the reviewed path groups if the owner explicitly requests it.
- **Gate 0 exit:** four commands pass (lint warnings can be documented, no new errors), both journeys have recorded EN/VI mobile/desktop smoke evidence, and there is no known misleading high-visibility numeric claim in the release candidate.

## Gate 1 — Beta preparation (only after Gate 0)

1. Build bilingual methodology/corrections pages and a simple feedback mechanism; describe source-linked versus separately agent-checked claims, as-of/basis, simulation limitations, and how corrections are handled. No professional-review claim.
2. Conduct low-cost qualitative sessions with real users from **both** audiences in EN and VI. Ask them to explain a return, find the source, and complete a second-surface journey. Keep observations anonymized and manual; do not invent conversion rates or install analytics.
3. Iterate onboarding, loading/empty states, quiz placement, and the two journeys based on observed misunderstandings. Obtain second-agent audit of newly highlighted claims and owner publish/withhold decision.
4. **Final launch preparation:** owner selects remote repository, domain, host, feedback channel and rollback owner; only then add remote CI and configure the owned `NEXT_PUBLIC_SITE_URL`. Verify production routes, SEO/OG assets, accessibility, EN/VI mobile/desktop, and rollback. Omit a feed/claim or defer launch if rights or accuracy cannot be established without a paid review.
5. **Gate 1 exit:** owner-approved beta, published limitations/correction path, documented source/terms checks, production smoke and rollback evidence. No claim of professional legal certification.

## Gates 2–4 — Conditional backlog, not concurrent commitments

- **Gate 2 (after beta evidence):** sourced low-capital/skill case studies and Almanac depth; evaluate Survival currency/inflation comprehension, VN card-game balance, quiz reasoning, and whether a rebuilt Charm save flow has a real return-use case. Accept only with reviewed source records and EN/VI user comprehension checks.
- **Gate 3 (if maintenance and demand justify it):** optional provenance/as-of metadata rollout, link-staleness reporting, manual approval of price changes; only test a refresh provider after confirming display rights. Choose privacy-respecting analytics **later**, after specifying the actual questions to measure and privacy requirements. Test one distribution channel at a time.
- **Gate 4 (explicit new approval):** accounts, sync, API, leaderboards, paid tools or more markets only if user demand, rights, maintenance cost and privacy review warrant them. No default database migration or revenue projection.

## Immediate next working session

Batch A inventory and grouping are recorded in `docs/reviews/gate0-baseline.md`. The owner chose to retain A1–A7 for continued review and exclude A8 (`.codegraph/`) from the product change set; no commit, publication, or deletion was authorized. Batch B historical-only, source-count, optional claim/price-evidence validation, and year-picker empty-state guardrails are locally implemented and tested; `docs/reviews/batch-b-guardrails.md` records the independent review findings, local fixes, and remaining limits. **Zero** records are marked agent-checked or carry comparable price observations: populating and auditing those records belongs to Batch C, not an automatic migration. Continue C/D without overwriting retained work; the owner remains the publication decision-maker after claim-level agent checks.
