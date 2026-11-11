# Batch B — local guardrail status

This is a schema and UI safeguard, not a historical claim audit or release approval. No records were marked agent-checked, and no legacy `verified` flags were upgraded.

- `historicalOnly` records cannot contain numeric scenario prices/returns or price-observation metadata; the existing data boundary and selectors keep them out of gain paths.
- Public source badges report actual linked-source counts rather than the legacy flag. Links do not establish claim accuracy or reuse rights.
- The optional `claimReview` field distinguishes `pending` from `agent-checked`. The latter requires a bilingual exact claim, distinct proposing/checking agent identifiers, and short evidence excerpts with observation dates and URLs already listed on that milestone. Schema checks cannot prove that the excerpt supports the interpretation; Batch C's separate checking agent must do that before the owner decides publication.
- The optional `opportunity.priceObservations` pair requires dated, linked entry/exit prices with basis, currency, and unit. Its validator compares arithmetic only when the two observations have matching units and currency; it rejects incompatible pairs and a deviation above 2% from `returnMultiple`. A partial date is treated as a time interval for ordering. Legacy pairs without this metadata are **not** inferred comparable or claim-checked. Positive numeric prices and returns are required even on legacy records.
- The 2024 year-picker empty state no longer promises future context when a country has no milestones from that year; both no-future and unpriced-context states have regression tests.

At this local checkpoint: 328 milestones pass validation; 315 have the *legacy* `verified` flag; 166 have both numeric entry and exit prices; **zero** records carry `claimReview` or `priceObservations`. The 166 legacy pairs remain a review queue, not a validated price series. Future Batch C entries should add evidence metadata only after exact source checks, not by bulk migration.

An independent read-only review found four follow-ups: whitespace variants bypassed the distinct-agent check; malformed source entries crashed validation; a source URL without a hostname passed; and the empty trap tab could claim context existed when only gains remained. These were addressed with normalized agent identifiers, URL parsing and null-safe source matching, and tab-specific/context-conditional EN/VI copy. New fixtures reproduce the validator failures; the picker has a pure-copy test for the empty trap tab. The fixes have **not** had a second independent review.

After those follow-ups: 166/166 tests pass, the 328-record validator passes, lint reports 0 errors/10 existing Charm warnings, production build succeeds with the existing metadata-base/OG dynamic-font warnings, and `git diff --check` passes. A fresh production server on port 3004 served the EN home and GB timeline with stylesheet HTTP 200. The interactive 2024 picker flow on actual EN/VI devices is still Batch D QA; server-rendered copy and pure-message tests alone do not prove a hydrated slider journey.

Gate 0, claim audits, EN/VI production journey QA, and the owner's publish-or-withhold decision remain open. The local production server must be restarted after rebuilding `.next` to avoid stale stylesheet requests.
