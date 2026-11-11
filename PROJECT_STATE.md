# PROJECT_STATE.md — The Reincarnation Checklist

> Handoff for a fresh agent session. **Last updated 2026-11-12, at `955649b`.** Read §0 first; §1 onward is older background and is stale where it conflicts with §0.
> Project root: `/Users/justindang/reincarnation-checklist` (macOS). Branch `main` tracks `origin/main` = `github.com/justinnc/reincarnation-checklist` (public, Issues enabled). Pushes to `main` deploy to Vercel.

---

## 0. Session handoff — READ FIRST

### 0.1 Where things stand
- **Live:** https://reincarnation-checklist-justinncs-projects.vercel.app (Vercel). `SITE_URL` = `NEXT_PUBLIC_SITE_URL` or that domain (`src/lib/seo.ts`).
- **Git:** working tree clean, `main` = `origin/main` (this docs commit, on top of `955649b`). Nothing unpushed.
- **Gates:** Gate 0 done. Gate 1 (`IMPLEMENTATION_PLAN.md` §Gate 1):
  - [x] Step 1: bilingual Methodology & Corrections page (`/[lang]/methodology`, now including §5 Analytics).
  - [ ] Step 2: real-user sessions (EN + VI). **Owner task.** Only a *simulated* persona review exists (`docs/reviews/gate1-simulated-persona-feedback.md`); all of its findings are fixed.
  - [x] Step 3: iterate on feedback, plus the second-agent claim audit (ledger: `docs/research/claim-audit-ledger.md`).
  - [~] Step 4: launch prep. Site is already public; the owner decisions in 0.4 remain.

### 0.2 Run & verify (Node 24 required)
```bash
source ~/.nvm/nvm.sh && nvm use 24     # system Node 22.5.1 does NOT match engines "24.x"
npm run test                            # 216/216 (31 files)
node scripts/validate-data.mjs          # OK: 328 milestones
npx tsc --noEmit -p tsconfig.json       # clean
npm run lint                            # 0 errors, 13 warnings (hidden Charm files)
npm run build                           # 763 static pages
npm run dev                             # :3000. Start with background=true; a killed server can leave a
                                        # next-server child on :3000 (check `lsof -ti tcp:3000`)
```
The `NODE_OPTIONS='--experimental-require-module'` prefix in the npm scripts is redundant on Node 24 but harmless.

### 0.3 What this session did (2026-11-11, oldest → newest, all pushed)
| Commit | Change |
|---|---|
| `5ea4db0` | "Submit a correction" link pointed to a 404 (`justindang/…`); now `github.com/justinnc/reincarnation-checklist/issues/new` |
| `73ae40e` | Next "`params` outside `<Suspense>`" warning on `/[lang]/[country]` and `/[lang]/[country]/[id]`: `export const instant = false`. **Don't** switch to Suspense: unknown URLs would become 200 soft-404s (`dynamicParams` isn't allowed with `cacheComponents`) |
| `74d51a8` | Pass card: seal moved off the 5th turning-point chip to the empty top-right corner; seal text curves along the ring; seal and ROI text shrink to fit (EN + VI checked from real rendered PNGs) |
| `e020f42` | Olympus/Facebook "buy the dip" copy tied to each one's sourced `buyWhen`; new `quiz-answers.test.ts` checks that every correct quiz answer's numbers appear in the milestone text |
| `0d5885b` | Home hero gets a second CTA to Survival (above the fold); `opportunity.exitAtPeak` flag (validated) shows "sold at peak / bán tại đỉnh" in Biggest wins (Luiza, Fortescue, Netflix, CSL); quiz gets an "⭐ Famous names (easy)" pool (`src/lib/quizPools.ts`) |
| `074e8be` | Survival: 189 of 326 playable milestones used to show the generic dispatch. All now have hand-written, hindsight-free dispatches in `src/data/survival-dispatches.json`, guarded by `survival-dispatches.test.ts` |
| `7d9bb12` | Methodology §5 "Analytics" (EN/VI) discloses what PostHog receives; autocapture, recordings, heatmaps, surveys and exceptions are pinned off in `src/lib/analytics.ts` |
| `48a98cc` | Primary sources added for the Yahoo-derived CP All, Olympus, Bajaj and Hansen prices (no price changed); Arab News source title corrected. Details in the ledger |
| `58c2b93` (2026-11-12) | Survival: Vietnamese oversubscription dispatches (Hermès, Zomato) now say "gấp N lần"; the test's "N lần" ban is narrowed to return multiples (allowed only straight after "đặt mua (cao) gấp") and has its own test |
| `955649b` (2026-11-12) | Bajaj Finance 5 Sep 2024 exit close confirmed from an NSE-sourced fund-house daily sheet (source added, no price changed); ledger follow-up records what is still unpinned |

### 0.4 Open items (priority order)
1. **Owner: PostHog "Discard client IP data"** project setting. IPs reach PostHog with every event; there's no code switch for this. PDPA-relevant.
2. **Owner, deferred:** the pass-card footer prints `REINCARNATION-CHECKLIST.COM` (`src/lib/passCard.ts` §10), a domain the project doesn't own. Owner decided to refactor it later together with the domain choice. Don't change it without asking.
3. **Owner: Gate 1 step 2** with real EN + VI users. **Gate 1 step 4:** custom domain, confirm the corrections channel (GitHub issues need an account; email/form are alternatives), rollback owner.
4. **Data:** Hansen 2 Jan 2004 and Olympus 30 Dec 2015 closes are bracketed by filings but not pinned to the day; a second search on 2026-11-12 found only aggregators (see the ledger follow-up). Bajaj's 5 Sep 2024 exit close (₹7,244.90) is now confirmed by an NSE-sourced fund-house daily sheet; the exchange's own bhavcopy is still blocked (403).
5. **Data:** still "reported, no prices": `gb-black-wednesday-1992`, `jp-softbank-alibaba-stake-2000` (private), `vn-phu-quoc-land-fever-2014`.
6. **Review, optional:** `b24f8ce` BrandLogo/icons (parallel session) was code-reviewed on 2026-11-12 and kept: self-contained, tested, OG route builds. The rendered header and OG image were not checked in a browser.
7. Roadmap ideas (§3 Sprints 2–4, Q2 monetization) are untouched and unprioritised.

### 0.5 Rules enforced by tests/validator — keep them
- **Price rule:** `returnMultiple = exitPrice × (splitFactor ?? 1) ÷ entryPrice` (±2%). Prices are nominal as quoted; `splitFactor` = shares held per original share. `src/lib/priceBasis.ts` renders the formula on detail pages.
- **Buyable entry:** retail-buyable entries must be tradable on/after the milestone date; `private: true` deals stay out of Biggest wins and Realistic playbooks.
- **`exitAtPeak`:** only where the milestone's own `sellWhen` names the peak; it must have `exitDate` + `returnMultiple`.
- **Trap framing:** loss milestones say how to avoid them; advice fields never instruct shorting, puts or CDS (`data.test.ts`).
- **Survival dispatches** (`src/data/survival-dispatches.json`): EN+VI; only facts and numbers from that milestone's own text; nothing known after the date (no later years, no outcome words, no post-entry same-day moves); every playable milestone must have a non-generic dispatch. Lookup order: `CONTEMPORARY_TRAP_DISPATCHES` → JSON → sanitiser.
- **Quiz:** numbers in every correct answer must appear in the milestone text. Wrong options may be unsourced but must not be arguably correct.
- **Analytics:** the Methodology §5 text must match what `src/lib/analytics.ts` sends. If you add an event or property, update both languages.
- **Data edits:** exact string replacement + `json.loads` validation (keeps formatting/diffs clean). Log every correction with verbatim source excerpts in `docs/research/claim-audit-ledger.md`. Public copy says "cross-checked", never "audited/kiểm toán".
- No raw `\uXXXX` in JSX; internal provenance (`claimReview.proposedBy/checkedBy`) never rendered.

### 0.6 Hard rules (owner, non-negotiable)
1. **Không được bịa:** never fabricate names, numbers or URLs. If a source can't be found, drop it and report it.
2. `defaultLocale = "en"`.
3. Card game `/simulator` is Vietnam-only.
4. Survival inflation = 3%/year game assumption, not CPI; shown on the Skip choice and in Rules.
5. No database: static JSON only.
6. Don't commit/push unless asked; small topical commits (`feat:`/`fix:`/`docs:`); update this file in its own `docs:` commit.

### 0.7 Agent environment notes
- Skills: `nextjs-app-maintenance` (repo workflow, pitfalls) and `grounded-citations` (data/claims work; `references/derived-copy-authoring.md` for generated copy).
- `delegate_task` subagents work now (the old "broken" note in §4 is stale). Use them for parallel research or copy drafting, then verify their output yourself.
- Screenshots: the browser tool attaches them directly; inject `*{opacity:1!important;transform:none!important}` before capturing scroll-revealed sections.

---

## 1. Executive Summary

**The Reincarnation Checklist** is a bilingual (English default, Vietnamese) Next.js 16 website that lists historical financial milestones across 15 countries (328 milestones, 315 verified) and lets visitors explore "what if you were reborn in year X" wealth-building scenarios.

**Core value proposition:** historical financial data + gamification (survival minigame, card game, shareable "Reincarnation Pass" PNG cards) + what-if calculators.

**Architecture:** Static JSON data (no database) + Next.js App Router with `[lang]` locale segment + client-side interactivity (Canvas card generation, Web Audio SFX, localStorage). Fully static-exportable; currently deployed nowhere (local only).

**Current state:** Feature-complete MVP, 204/204 tests passing, build green (see §0 for the latest session). Gate 0 stabilization completed across Batches A–D (guardrails, claim audit ledger, automated navigation QA). Working tree clean on `main`.

---

## 2. Completed Features

### ✅ Fully Built & Working

| Feature | Route | Key Files | Notes |
|---------|-------|-----------|-------|
| Homepage + hero + animations | `/[lang]` | `src/app/[lang]/page.tsx`, `src/components/RebirthPicker.tsx`, `src/components/Reveal.tsx` | Hero CSS fade-up stagger, scroll-reveal, country cards, biggest-wins table |
| Timeline (milestone list) | `/[lang]#countries` | `src/components/Timeline.tsx`, `src/components/MilestoneCard.tsx` | Filterable by country/tab |
| Milestone detail | `/[lang]/[country]/[id]` | `src/app/[lang]/[country]/[id]/page.tsx`, `src/app/[lang]/[country]/page.tsx` | Sources, quality rating A/B/C |
| Price Almanac (15 countries) | `/[lang]/almanac` | `src/components/AlmanacExplorer.tsx`, `src/components/AlmanacChart.tsx`, `src/lib/almanac.ts`, `src/lib/almanac-data.ts` | Year slider, gold/petrol/USD/VND chains, quality badges |
| What-If calculator | `/[lang]/whatif` | `src/components/whatif/WhatIfTabs.tsx`, `WhatIfCalculator.tsx`, `PlaybookBuilder.tsx`, `SingleAssetSim.tsx`, `src/lib/whatif/{engine,playbook,types}.ts` | 2 tabs: Single Asset + Playbook Builder (multi-country chains, liquidity caps, presets 🌱💼🚀👑) |
| Charm collection | `/[lang]/charm` | `src/components/CharmView.tsx`, `CharmToggle.tsx`, `src/lib/charm.ts` | localStorage-backed, starter packs |
| World by Year | `/[lang]/world` | `src/components/WorldYearExplorer.tsx` | Year slider, timeline visualization, 15 countries |
| Full-text search | `/[lang]/search` | `src/components/GlobalSearch.tsx`, `src/lib/search.ts` | Indexes all milestones |
| Survival minigame | `/[lang]/survival` | `src/components/survival/SurvivalGame.tsx`, `src/lib/survival.ts`, `src/lib/survival.test.ts` | Roulette + 5 turning points, 3 choices (All-in 100% / Cautious 25% / Skip), inflation penalty, SFX, animated net worth, rank system |
| Reincarnation Pass Card | (in survival game) | `src/lib/passCard.ts` | Canvas PNG 840×1180 (3:4 portrait), guilloche, gold chip, red seal, barcode, MRZ; live preview + download |
| Sound FX | (global) | `src/lib/soundFx.ts` | Web Audio API synthesized (click/success/trap/fanfare/spin), mute toggle `localStorage["rc:muted"]` |
| Card game (VN-only) | `/[lang]/simulator` | `src/components/cardgame/CardGameApp.tsx`, `src/lib/cardgame/*` | Hidden from EN nav; **currently broken — see bugs** |
| Quiz | `/[lang]/quiz` | `src/components/Quiz.tsx` | **currently broken on EN — see bugs** |
| Share (Sprint 1) | (survival/quiz) | `src/lib/passCard.ts`, share utilities | Web Share API (mobile) + clipboard PNG (desktop) |
| Data validation | — | `scripts/validate-data.mjs` | `npm run validate` → 328 milestones (315 verified) |

### ✅ Recent commits (latest first)

```
cef48dd docs: add Batch D first-run and navigation QA report
96335a4 feat(audit): add Batch C claim audit ledger and audited milestone metadata
7e2382a feat(guardrails): implement Batch B schema validation, claim reviews, and UI safeguards
04f9744 docs: add roadmap, implementation plan, and Gate 0 review documentation
de93420 docs: document Seed Challenge Mode in PROJECT_STATE
7241407 docs: update PROJECT_STATE with Fog of War and Charm soft-hide work
7776dc3 feat(survival): implement Fog of War contemporary dispatches and reality reveal
```

---

## 3. Gate 0 Stabilization & Verification Status

### 🟢 Gate 0 Completed Batches

- [x] **Batch A — Baseline Review & Freeze**: Working tree inventory, baseline lock, and Gate 0 baseline documentation (`docs/reviews/gate0-baseline.md`).
- [x] **Batch B — Data Integrity Guardrails**: Added `claimReview`, `priceObservations`, and `historicalOnly` schema safeguards to `src/lib/types.ts` and `scripts/validate-data.mjs`. UI guardrails across `SurvivalGame`, `PlaybookBuilder`, `WhatIfCalculator`, and `RebirthPicker`. Expanded tests to 166 passing (`7e2382a`).
- [x] **Batch C — High-Visibility Claim Audit**: Built independent two-agent claim audit ledger (`docs/research/claim-audit-ledger.md`) covering BRK.A, Bitcoin Pizza Day, TGG, Ethereum, Nvidia, and Peter Thiel seed round. Attached verified `claimReview` metadata (`96335a4`).
- [x] **Batch D — First-Run & Navigation QA**: Automated browser test suites in headless Chrome across Desktop (1280×800) and Mobile (390×844) viewports for both EN and VI routes. Verified sub-second loads, 0 console errors, clean hydration on hard reloads, and mobile navigation drawer (`docs/reviews/batch-d-qa-report.md`, `cef48dd`).
- [x] **Batch E — Local Release Candidate & Gate 0 Sign-Off**: Verification of all Gate 0 criteria, surface/copy audit, and handoff documentation sync.

### 🟡 Recently Committed work

- [x] **Seed Challenge Mode (?seed=...) in Survival** (`src/lib/survival.ts`, `src/components/survival/SurvivalGame.tsx`, `survival.test.ts`) — Deterministic Mulberry32 PRNG seed engine, challenge mode banner on arrival, copy challenge link & auto-embedded seed in share text (`f095e2c`).
- [x] **Fog of War (Tin tức đương thời) in Survival** (`src/lib/survival.ts`, `src/components/survival/SurvivalGame.tsx`, `survival.test.ts`) — Masked hindsight spoiler titles with contemporary headlines, sentiment indicators, and post-round reality reveals (`7776dc3`).
- [x] **Charm soft-hide from UI** (`src/app/[lang]/charm/page.tsx`, `src/components/CharmToggle.tsx`, `src/components/NavLinks.tsx`) — Hidden from navbar, cards and pages without deleting underlying logic (`dd5c8f6`).
- [x] **NavLinks hamburger menu + mobile drawer** (`src/components/NavLinks.tsx`) — Committed in `e7a078a`.
- [x] **Pass Card text overflow clamping** (`src/lib/passCard.ts`) — Committed in `e7a078a`.
- [x] **Sprint 2 inflation mechanic** (`src/lib/survival.ts`, `survival.test.ts`, `src/components/survival/SurvivalGame.tsx`) — Committed in `e7a078a`.
- [x] **SurvivalGame Lint Cleanups** — Resolved set-state-in-effect and refactor number animation ref in `47afdc5` (0 errors, 0 warnings).

### 🟢 Roadmap (Next Sprints)

- [ ] **Sprint 2 — Viral features:** Web Share 1-click (native share sheet), embed code (iframe/JS snippet) for pass card, CSV/JSON export for almanac & whatif results.
- [ ] **Sprint 3 — Retention:** achievement system (5+ badges), localStorage save progress for survival, advanced mode with real historical CPI per country/year.
- [ ] **Sprint 4 — Polish:** 30s first-visit tutorial, dark/light toggle, almanac year-jump input, SFX variety, larger fonts on small laptops.
- [ ] **Q2 — Monetization:** public API (tRPC + Postgres + Prisma + Upstash Redis + NextAuth OAuth), Premium $10/month tier (advanced mode, CSV/API key, achievement profile, custom card themes). Break-even at 5 paid users; target 10k MAU → $3k MRR month 6.
- [x] **Data trust & schema validation:** Strict validation in `scripts/validate-data.mjs`. 328 milestones verified; public badges reflect linked source counts. High-visibility claims audited via two-agent review ledger (`docs/research/claim-audit-ledger.md`).
- [ ] **Domain:** `reincarnation-checklist.vn` used as `SITE_URL` placeholder — unverified ownership.

---

## 4. Known Bugs & Technical Debt

### Active bugs

| Severity | Bug | Location | Status |
|----------|-----|----------|--------|
| P1 | Survival rule text `missing` on first load (SSR timing) | `SurvivalGame.tsx` `data-testid="inflation-rule"` | **Obsolete (2026-11-11):** the rule text is now behind the "Rules" toggle by design and renders when opened; the 3%/yr assumption is shown on the Skip choice itself (hard rule #4 satisfied) |
| P2 | Pass Card text overflow on long values | `src/lib/passCard.ts` | **Fixed & Committed** |

### Technical debt

- **Lint:** Clean! 0 errors, 0 warnings across whole codebase (fixed in `47afdc5`).
- **Node version workaround:** system Node is v22.5.1 (too old for Next 16). `NODE_OPTIONS='--experimental-require-module'` is hardcoded in `package.json` scripts `dev`/`build`/`test`. Do not remove without upgrading Node (nvm default is 22.5.1; `nvm use 24` works but is not default).
- **Subagent delegation broken:** `delegate_task` fails with `Cannot resolve delegation provider 'anthropic': No Anthropic credentials found.` Available providers listed (openrouter, nous, zai, kimi-coding, minimax) but the tool exposes no provider parameter. **Do not rely on subagents until this is fixed.**
- **vision_analyze quota blocked** (~158h cooldown observed) — workaround was haiku subagents, now also broken. Analyze screenshots by direct DOM inspection or ask user for text descriptions.
- **No git remote** — all history local. `gh` CLI not installed on this Mac.

---

## 5. Core Conventions

### Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS 4** — theme tokens: `bg`, `raised`, `line`, `ink`, `muted`, `gold`, `on-gold`
- **motion** (`motion/react`) — animations; `useReducedMotion` respected everywhere
- **Vitest** — 105 tests across 12 files (`src/lib/**/__tests__/`, `src/lib/*.test.ts`)
- **No database** — all data static JSON in `data/milestones/*.json` (15 country files)
- **No runtime env vars required** — `SITE_URL` is a code constant (placeholder domain)

### Scripts

```json
{
  "dev": "NODE_OPTIONS='--experimental-require-module' next dev",
  "build": "NODE_OPTIONS='--experimental-require-module' next build",
  "start": "next start",
  "lint": "eslint",
  "validate": "node scripts/validate-data.mjs",
  "test": "NODE_OPTIONS='--experimental-require-module' vitest run"
}
```

### Commands

```bash
npm run dev       # dev server on :3000 (currently running, PIDs 51740/96562)
npm test          # 105/105 pass
npm run build     # green
npm run validate  # 328 milestones (315 verified)
npm run lint      # 3 errors + 2 warnings (pre-existing, SurvivalGame.tsx)
```

### Folder conventions

```
src/
  app/[lang]/           # locale segment: en | vi (defaultLocale = "en")
    page.tsx            # homepage
    [country]/[id]/     # milestone detail
    almanac/ whatif/ charm/ world/ search/ survival/ simulator/ quiz/
  components/           # client components (NavLinks, Reveal, CharmToggle, ...)
    whatif/ survival/ cardgame/
  lib/                  # pure logic + tests (survival, whatif, cardgame, charm, search, seo, i18n, format)
    whatif/ cardgame/ __tests__/
  dictionaries/{vi,en}.json
data/milestones/*.json  # 15 countries, 328 milestones
scripts/validate-data.mjs
```

### Hard rules (user-stated, non-negotiable)

1. **Không được bịa** — never fabricate names, numbers, or URLs. If a source can't be found, drop the item and report back.
2. **defaultLocale = "en"** — English is the default language everywhere.
3. **Card game `/simulator` is Vietnam-only** — do not expand scope.
4. **Survival inflation = 3%/year game assumption** — NOT historical CPI, NOT bank fees. UI must state this limitation.
5. **No database** — static JSON only (unless Q2 API roadmap is explicitly approved).

### Git

- Branch `main`, local only, **no remote configured**. Commit messages follow `feat:`, `fix:`, `refactor:`, `test:`, `chore:` convention.

---

## 6. Immediate Next Action

**Gate 0 Complete. Prepare for Gate 1 (Beta Preparation).**

Concrete sequence:

1. **Gate 1 Milestone 1 — Bilingual Methodology & Corrections Pages**: Build dedicated `/[lang]/methodology` documenting source-linked vs audited claims, observation dates, simulator simplifications, and feedback channels.
2. **Gate 1 Milestone 2 — Qualitative User Sessions**: Run lightweight observation sessions with real bilingual users across both journeys (research & simulation/playbook).
3. **Gate 1 Milestone 3 — Journey Iterations**: Refine onboarding, loading states, and newly highlighted milestones under two-agent review before public release.

**Verification baseline:** `npm test` → 166/166 pass across 21 test suites; `node scripts/validate-data.mjs` → 328/328 pass; `npm run build` → green.
