# PROJECT_STATE.md — The Reincarnation Checklist

> Handoff document for a fresh agent session. Last updated 2026-11-11 (see §0 first).
> Project root: `/Users/justindang/reincarnation-checklist` (macOS, branch `main` → `origin/main` = `github.com/justinnc/reincarnation-checklist`, public).

---

## 0a. Update after `6d22504` (2026-11-11 evening) — supersedes §0 where they conflict

**Now live:** deployed on Vercel at `https://reincarnation-checklist-justinncs-projects.vercel.app` (HTTP 200). Public GitHub repo `justinnc/reincarnation-checklist`, Issues enabled. Sections below that say "no remote / deployed nowhere / `gh` not installed" are stale.

**Commits since §0:** `0e99c31` PostHog analytics (`src/lib/analytics.ts`, `src/instrumentation-client.ts`; events: survival_started/round_decided/completed, pass_card_downloaded, survival_shared, quiz_started/completed/shared; no-op when `NEXT_PUBLIC_POSTHOG_KEY` unset — see `.env.example`) · `a4392bf` + `437a311` `SITE_URL` = `NEXT_PUBLIC_SITE_URL` or the vercel.app domain (`src/lib/seo.ts`; the `.vn` placeholder is gone) · `d479355` English home kicker · `dfd2591` `engines.node` = `24.x`, `@types/node` ^24.

**Node:** run everything under Node 24 (`source ~/.nvm/nvm.sh && nvm use 24`; system Node 22.5.1 no longer matches `engines`). The `NODE_OPTIONS='--experimental-require-module'` script prefix is now redundant on 24 but harmless.

**Baseline (Node 24.21):** 207/207 tests, 28 files · validate OK (328) · tsc clean · lint 0 errors / 13 warnings · build 763 routes.

**Open item 1 partially resolved:** the live "Submit a correction" link pointed to `github.com/justindang/...` (404). Repointed to `github.com/justinnc/reincarnation-checklist/issues/new` (`src/app/[lang]/methodology/page.tsx` + test). Owner can still swap to email/form; corrections arriving as public GitHub issues means submitters need a GitHub account.

**Done after §0a was written:** `73ae40e` — the "`params` accessed outside `<Suspense>`" dev warning (open item 6) fixed on `/[lang]/[country]` and `/[lang]/[country]/[id]` with `export const instant = false`. The Suspense/stream fix was tried and rejected: unknown URLs became 200 soft-404s because `notFound()` fired after streaming began; `dynamicParams` is not allowed with `cacheComponents`. Unknown country/id still return 404. · `74d51a8` — pass-card seal moved from the turning-point chips to the empty top-right of the profile row (open item 4, stamp part); seal top line now curves along the ring; seal middle line and ROI pill shrink to fit (large VI ROIs like `39.715,9× ROI` used to overflow).

**New finding (owner decision):** the pass-card footer prints `REINCARNATION-CHECKLIST.COM` (`src/lib/passCard.ts`, §10), a domain the project does not appear to own. Every shared card advertises it. **Owner decided (2026-11-11): leave it for now; it will be refactored later together with the domain.**

**Done later on 2026-11-11 (after the push of `7515170`):**
- **Survival dispatches (open item 4):** 189 of 326 playable milestones used to fall back to the generic template (not ~1/3). Every one now has a hand-written, hindsight-free dispatch in `src/data/survival-dispatches.json`. `getContemporaryDispatch` checks `CONTEMPORARY_TRAP_DISPATCHES` first, then this file, then the sanitiser. The text was drafted per country from each milestone's own sourced description only, then reviewed. Guarded by `src/lib/__tests__/survival-dispatches.test.ts`: real ids, EN+VI, length limits, banned outcome words, no year after the event, every number must appear in the milestone's own text, and no playable milestone left on the generic template. IPO dispatches stop at the pricing when the entry is the IPO price. Known nit: Vietnamese avoids "N lần" (the test bans it to catch return multiples), so oversubscription reads a bit stiffly ("gấp 34 lượng chào bán").
- **Quiz (open item 5):** all correct answers are backed by the milestone text, guarded by `src/lib/__tests__/quiz-answers.test.ts` with rounding tolerance. The wrong options in 28/39 VN quizzes are unsourced by design: they are wrong answers. None were found to be ambiguous with the right answer, so they were kept. The "buy the dip" copy that read as generic advice (Olympus `action.vi`, Facebook `pitfalls.en`) is now tied to each milestone's sourced `buyWhen`. The other "bắt đáy" hits are warnings against it, which is correct.
- **Persona items (open item 6):** home hero has a second CTA linking to Survival above the fold; new `opportunity.exitAtPeak` flag (validated) shows "sold at peak / bán tại đỉnh" in Biggest wins for Luiza, Fortescue, Netflix and CSL, whose own `sellWhen` names a peak exit, and the table note explains it; the quiz has an "⭐ Famous names (easy)" pool of 16 curated ids (`src/lib/quizPools.ts`, editorial picks only).
- **Analytics notice (`7d9bb12`):** Methodology §5 (EN/VI) discloses exactly what PostHog receives; autocapture, recordings, heatmaps, surveys and exceptions are pinned off in `src/lib/analytics.ts` (asserted in the test). **Owner action still open:** turn on "Discard client IP data" in the PostHog project; there's no code switch for it.
- **Yahoo-derived prices (open item 2):** CP All entry and exit now confirmed exactly by archived SET pages; Olympus exit, Bajaj entry and Hansen entry are bracketed by company or SEC filings; the Arab News source title is corrected. No price changed. Still Yahoo-only: Bajaj exit close (5 Sep 2024). Details in the ledger section "Yahoo-derived prices: firmer sources".

**Open item 7 note:** the site is already public, so Gate 1 step 4 (launch prep) is partly done de facto — remaining owner decisions: custom domain, feedback channel confirmation, rollback owner, PostHog key/privacy notice (analytics is not mentioned on the methodology page yet).

---

## 0. Latest session handoff (2026-11-11) — READ FIRST

**Where we are:** Gate 0 done. Gate 1 (Beta preparation, `IMPLEMENTATION_PLAN.md` §Gate 1) in progress:
- [x] Step 1 — bilingual Methodology & Corrections page (`/[lang]/methodology`).
- [~] Step 2 — real-user sessions (EN + VI). **Not done with real people.** A *simulated* 4-persona review was run instead: `docs/reviews/gate1-simulated-persona-feedback.md` (AI role-play, not user evidence). Its findings are now fixed (below).
- [~] Step 3 — iterate on feedback + second-agent audit of highlighted claims: done for everything in the persona report.
- [ ] Step 4 — launch prep (owner picks remote repo, domain, host, feedback channel, rollback owner).

**Baseline now:** 204/204 tests (`npm run test`), `node scripts/validate-data.mjs` OK (328 milestones), `npx tsc --noEmit -p tsconfig.json` clean, lint 0 errors (13 warnings, all in the hidden Charm files), `npm run build` 761 routes. Dev server: `npm run dev` on :3000.

**Commits this session (oldest → newest):** `80f11b6` methodology page · `a1f6c9f` trust fixes (Ethereum entry basis, private deals out of rankings, as-of ranges, methodology copy) · `1e1e058` loss milestones framed as traps, FLC rewritten · `296bd34` one price rule + `splitFactor` · `7975420` no shorting advice in any market · `dee0dcb` sourced prices for 18 milestones · `ffbc0ff` nav/search/quiz/picker/almanac UX · `f73b85e` Survival fixes · `80073bf` VI localization + VN content · `b24f8ce` BrandLogo/icons (**from a parallel session, committed separately — review or revert**).

**Rules established this session (enforced by validator/tests — keep them):**
- **Price rule:** `returnMultiple = exitPrice × (splitFactor ?? 1) ÷ entryPrice` (±2%) for every priced milestone (`scripts/validate-data.mjs`, `src/lib/__tests__/priceBasis.test.ts`). Prices are nominal as quoted; `splitFactor` = shares held per original share (splits/bonus/stock dividends, paid rights excluded). Detail pages explain the formula via `src/lib/priceBasis.ts`.
- **Buyable entry:** for retail-buyable milestones the entry must be tradable on/after the milestone date (presale/pre-listing prices are context only). `private: true` deals are excluded from home "Biggest wins" (`rankListedReturns`) and Realistic playbooks.
- **Trap framing:** loss milestones show "How to avoid it / Cách tránh bẫy" + "What happened / Diễn biến giá". Advice fields (asset/action/buyWhen/sellWhen/estimatedReturn) must never instruct shorting, puts or CDS in any market; VN milestones also not in insiderTip (`src/lib/__tests__/data.test.ts`). Professionals' shorts may be described in past tense with a risk note.
- **No raw `\uXXXX` in JSX text** — use native glyphs.
- **Internal provenance** (`claimReview.proposedBy/checkedBy`) never rendered in UI.
- All corrections and their sources are logged in `docs/research/claim-audit-ledger.md`.

**Open items / next steps:**
1. **Corrections channel (owner decision, do LAST before release):** "Submit a correction" points to `github.com/justindang/reincarnation-checklist/issues`, which may not exist (no remote). Pick email / form / public repo at launch prep.
2. Firmer sources for Yahoo-derived prices: Monster entry, Bajaj entry/exit, Olympus exit, CP All entry/exit (ledger lists them). Some research excerpts came from search snippets.
3. Still "reported, no prices": `gb-black-wednesday-1992`, `jp-softbank-alibaba-stake-2000` (private), `vn-phu-quoc-land-fever-2014` (anecdotal plot quote).
4. Survival: ~1/3 of events now show a generic dispatch because the hindsight sanitiser is strict — hand-write contemporary dispatches in `src/data`. Pass-card red stamp still overlaps the 5th chip.
5. Some new VN quiz distractors are plausible invented values (wrong answers, unsourced). A few "buy the dip" phrasings remain in non-VN tips.
6. Persona items not yet done: easy/pop-culture quiz pool; Survival callout above the fold on home; Magazine Luiza ranked at its peak; Next dev warning "`params` accessed outside `<Suspense>`" on `/[lang]/[country]/[id]`.
7. Gate 1 step 2 with **real** EN + VI users, then Gate 1 step 4 launch prep.

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
