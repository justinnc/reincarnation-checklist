# Review v0.1 → v0.2

Skills used: `omh-frontend` (taste foundations, DESIGN.md contract, screenshot loop), `omh-design-quality-gate` (critique rubric), `web-project-scaffold`.

## 1. Product — "what is this site for?"

| Finding | Severity | Fix in v0.2 |
|---|---|---|
| No hook. The homepage was two country cards; nothing answers the premise "you wake up in year X — what now?" | Blocker | Hero "Pick your rebirth year" → instantly shows what is still ahead of you and the top wins |
| No reason to come back / no progress | High | **Rebirth checklist**: tick milestones as "planned", progress per country (localStorage, no account needed) |
| Mini game was an empty page | High | Playable quiz generated from milestone data (every milestone carries one question) |
| Returns were vague ("dozens of times") — nothing to compare | High | Numeric `entryPrice` / `exitPrice` / `returnMultiple` + "$1,000 then → now" |
| No depth per milestone | High | Detail page: story, insider tip, pitfalls, sources, quiz |

**Core loop:** pick rebirth year → browse timeline → open a milestone → tick it onto your checklist → test yourself in the quiz → share score.

## 2. Content

- v0.1 had 17 thin, unverified entries written from memory. v0.2 replaces them with ~25/country researched by agents with fetched sources; `verified` is only `true` when a fetched source confirmed the numbers.
- New fields: `summary`, `insiderTip`, `pitfalls`, `risk`, `capital`, `asset`, `entryPrice`, `exitPrice`, `exitDate`, `quiz`, `verifiedNote`.

## 3. Design (rubric axes)

| Axis | v0.1 | v0.2 |
|---|---|---|
| Hierarchy | Every card same weight; date tiny | Giant decade numerals, multiple badge leads each card |
| Color | Amber-on-black default, one accent doing everything | Two accents with roles: gold = time, green = money; semantic risk colors |
| Type | One family, all medium | Bricolage Grotesque display / Be Vietnam Pro text / JetBrains Mono figures |
| Signature | None — looked like the starter template | Rebirth year picker + checklist ticks + $1,000 calculator |
| States | Buttons had no focus-visible | Focus ring token on every control |
| Localization | Lang switch dropped you on the homepage | Switch keeps the current page |

## 4. Code

- Added data validation script (`npm run validate`).
- Known debt: unknown params render the 404 page but with HTTP 200 (Cache Components streams; `dynamicParams` is not allowed). Acceptable for now.
