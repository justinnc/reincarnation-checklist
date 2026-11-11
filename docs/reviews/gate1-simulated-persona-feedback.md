# Gate 1 — Simulated Persona Feedback (2026-11-11)

> **SIMULATED, NOT USER EVIDENCE.** Four AI subagents role-played users against the local dev server (`localhost:3000`). Use this to pre-triage issues before real EN/VI sessions (IMPLEMENTATION_PLAN Gate 1 step 2). Do not cite as user research. Fact claims from personas need source verification before data edits.

| Persona | Locale / device | Focus |
|---|---|---|
| Linh, 20, Hanoi student, never invested | `/vi`, 390×844 | First-run clarity, understanding a return |
| Mark, 38, skeptical US investor | `/en`, 1440×900 | Accuracy, sources, methodology |
| Anh Tuấn, 45, 15y VN trader | `/vi`, 1366×768 | Localization, VN facts, framing |
| Jordan, 19, Gen-Z casual | `/en`, 390×844 | Fun, game features, mobile |

## P0 — Accuracy / trust

1. **Ethereum entry basis is wrong (verified in data).** `us-ethereum-launch-2015` is dated `2015-07-30` but uses `$0.31` (2014 presale). First exchange trade ≈ $2.77 (Aug 2015) → ~1,180× not 10,570×. It is ranked #1 on home and drives the 73,990× "realistic" chain. Batch C audit (`claim-audit-ledger.md`) missed this. → Re-audit; sweep all milestones whose entry price predates their date (presales, seed rounds).
2. **Split/dividend policy contradicts itself.** `/whatif` footer: "not split/dividend-adjusted unless the milestone says so"; `/methodology`: entry prices reflect cumulative split factors. HPG (110.000 ₫, 20×), VNM, Nvidia pages don't state basis. (Linh, Mark, Tuấn) → Pick one policy, show basis + exit price/date on every milestone.
3. **Home "Biggest wins" not comparable.** No as-of date; end dates range 2022-12 → 2026-08; five currencies ranked together; Magazine Luiza "…then a crash" ranked at peak. (Mark)
4. **Manipulation page framed as profit.** FLC: "CÁCH KIẾM TIỀN: Bán khống…" / "lãi lớn nếu bán khống" while saying shorting is near-impossible in VN. (Tuấn) TGG is framed well.
5. **Trust copy.** Methodology shows internal "Gate 1 Baseline" badge, `historicalOnly` identifier, "Separately Audited"/"kiểm toán" for an AI-agent check, auto-looking "Last updated". Disclaimer corrections section has no link; GitHub-only path. (all)

## P1 — Findability / UX blockers

6. **Header nav overflows at 1366px** — "Đố vui" / "Sổ trọng sinh" hidden under EN/VI toggle; quiz unreachable from nav. (Tuấn)
7. **Search is diacritic-sensitive** — "hoa phat", "vnindex" → 0 results; "thao tung" misses TGG/FLC. (Tuấn)
8. **Survival result copy dishonest** — lost 90% on FTX yet titled "Reincarnation Master". EN share pass shows VI labels ("THẮNG", "ĐÃ XÁC THỰC"). Home year 2024 → silently starts 2012. Dispatch spoils outcome ("trillion-dollar Meta"). (Jordan)
9. **Quiz on mobile** — Start / feedback / Next below the fold, no auto-scroll; share throws unhandled `NotAllowedError` (Quiz.tsx:91); questions too niche; distractors recycled from other milestones; possible answer-position bias (Linh 10×A → 0/10, unconfirmed). (Linh, Tuấn, Jordan)
10. **`/charm` 404** but tab title/metadata still advertise it. (Mark, Tuấn, Jordan)

## P2 — Localization sweep (VI)

- English leaks: "REBORN" eyebrow, asset labels on home ("Alibaba Group (via SoftBank stake)"), source titles, "Vàng miếng SJC / SJC gold bars", "Đầu cơ / Angel hẹp", "giữa 2010s".
- ISO dates in UI ("Điểm ra (2022-09-09)", "2005-01→2007-03") → d/m/yyyy.
- Hype/betting words: "5 kèo thực tế", "cơ hội mua cả đời", footer "Đây là những gì bạn nên làm." (reads as advice).
- Terms: "Định kiến kẻ sống sót" → "Thiên kiến…"; "tăng trần 150%" misuse; missing "/m²" on real-estate prices; survival "$1,000 USD".
- Content to verify: Vinamilk 2006 exchange name/date; Quiz Q9 VIC "vốn hóa 800 tỷ"; FPT reference-price inconsistency.

## P3 — Polish

- Tap targets < 44px (lang pills, logo, chips, slider, footer links).
- Home picker 2024: "1 milestones", empty compounding CTA; slider range 1978 vs US data from 1980.
- `/whatif`: slider label 1980 but min 2000; unclear "cash purchasing power" row; no stated start-price basis.
- Almanac: "671 × USD/gallon" units; "Hover a bar" on touch; "for novel writers" eyebrow.
- Survival: rules wall above game, audio on by default, plurals ("1 years", "a 18×").
- Dev warning: `params` accessed outside `<Suspense>` on `/[lang]/[country]/[id]`.

## What worked

- Purpose clear in <10s; hero hook strong ($531M from 1978).
- Berkshire page is the trust model (entry, exit, date, 4 sources, admits fuzziness).
- TGG / Tân Hoàng Minh framed responsibly. VI financial terminology mostly natural; diacritics render well.
- Survival core loop and identity pass are share-worthy.
- No raw `\uXXXX` escapes, no horizontal overflow, no hydration errors observed.
