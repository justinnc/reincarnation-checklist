# PROJECT_STATE.md — The Reincarnation Checklist

> Handoff document for a fresh agent session. Generated 2026-11-10.
> Project root: `/Users/justindang/reincarnation-checklist` (macOS, local git only, branch `main`, **no remote**).

---

## 1. Executive Summary

**The Reincarnation Checklist** is a bilingual (English default, Vietnamese) Next.js 16 website that lists historical financial milestones across 15 countries (328 milestones, 315 verified) and lets visitors explore "what if you were reborn in year X" wealth-building scenarios.

**Core value proposition:** historical financial data + gamification (survival minigame, card game, shareable "Reincarnation Pass" PNG cards) + what-if calculators.

**Architecture:** Static JSON data (no database) + Next.js App Router with `[lang]` locale segment + client-side interactivity (Canvas card generation, Web Audio SFX, localStorage). Fully static-exportable; currently deployed nowhere (local only).

**Current state:** Feature-complete MVP with 105/105 tests passing, build green. Three P0 UX bugs found in live audit (Quiz, Simulator, WhatIf presets). Five files with uncommitted changes awaiting review/commit.

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
3085886 feat(survival): Mount and verify 3:4 live Pass Card preview in game summary DOM
4a945f0 feat(survival): Luxury 3:4 portrait Reincarnation Pass Card with gold chip, guilloche waves, red wax seal, barcode and in-game live preview
f58ef0c refactor: Redesign luxury Reincarnation Pass Card with gold chip, guilloche security pattern, official red stamp, and in-game live preview
ada7acb feat: Add Web Audio SFX, animated net worth counter, quick capital presets and Reincarnation Pass PNG card
77fe6b4 Polish survival game: wire into NavLinks, clean lint warnings, pass all 57 tests
6b9f35a Integrate Survival challenge into nav, homepage, fix yearOf typing and remove canvas-confetti dep
3d10b98 Add Reincarnation Survival minigame combining Roulette & 5 Turning Points decisions
1814962 test: cover format, data, search, seo, i18n and charm; fix test script
57e7e7b feat: responsive nav, mobile overflow fixes, shareable quiz, lighter pages
8705467 fix(data): correct milestone facts, add validator rules and private flag
57a085e Fix /whatif Single Asset tab stuck at ~40% width, left-aligned
6404126 Unify "selected pill" style across whatif tabs + Almanac
```

---

## 3. Remaining Reincarnation Checklist

### 🔴 P0 — Core loops (Audit & Verification)

- [x] **`/en/quiz` Start button** — Verified live via headless browser: button renders properly (`Start →`), clicks through to questions seamlessly.
- [x] **`/vi/simulator` load** — Verified live via headless browser: loads cleanly (`Bước vào trạm trọng sinh →`), round 1 interactive, no hydration issues.
- [x] **WhatIf Single Asset presets** — Verified live: 4 presets render ($500, $2,000, $10,000, $50,000) and update calculations on click.

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
- [ ] **Data trust:** 315/328 milestones are AI-agent self-reported "verified" — no independent human cross-check yet. Biggest content risk.
- [ ] **Domain:** `reincarnation-checklist.vn` used as `SITE_URL` placeholder — unverified ownership.

---

## 4. Known Bugs & Technical Debt

### Active bugs

| Severity | Bug | Location | Status |
|----------|-----|----------|--------|
| P1 | Survival rule text `missing` on first load (SSR timing) | `SurvivalGame.tsx` `data-testid="inflation-rule"` | Open |
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

**Commit the 5 reviewed uncommitted files, then start Sprint 1 (fix the 3 P0 bugs).**

Concrete sequence:

1. **Get user sign-off** on the NavLinks hamburger menu + mobile drawer change (user was reviewing it when this session ended: *"yup, implement xong hãy để tôi review trước khi commit"*).
2. **Commit** all 5 modified files together (they are independent but all reviewed/tested):
   ```
   git add src/components/NavLinks.tsx src/lib/passCard.ts \
           src/lib/survival.ts src/lib/survival.test.ts \
           src/components/survival/SurvivalGame.tsx
   git commit -m "feat: mobile hamburger nav, pass card text clamping, survival inflation mechanic"
   ```
3. **Sprint 1 — fix 3 P0 bugs** (audit findings, all confirmed live on `localhost:3000`):
   - `src/components/Quiz.tsx` → add Start button on `/en/quiz` (check VI works too)
   - `src/components/cardgame/CardGameApp.tsx` → fix `/vi/simulator` blank mount
   - `src/components/whatif/SingleAssetSim.tsx` → render the 4 capital presets (🌱💼🚀👑)
   - Verify each with `browser_exec` at mobile (390×844) and desktop (1440×900) before committing.

**Verification baseline before starting:** `npm test` → 105/105 pass; `npm run build` → green; dev server on `:3000` returns 200.
