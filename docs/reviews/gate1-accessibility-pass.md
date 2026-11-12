# Gate 1 step 4 — Automated accessibility pass (2026-11-12)

> axe-core 4.14.0 run by an agent in headless Chrome against a local production build of the code now on `main`, rule sets WCAG 2.0/2.1/2.2 A + AA. Automated rules catch only part of WCAG. This is **not** a manual audit: no screen reader, keyboard-only walkthrough, zoom/reflow or real-device test was done.

## Coverage

- **Viewports:** phone 390×844 and laptop 1366×768.
- **Pages (19 per viewport, 38 runs):** home EN/VI, country EN/VI, two milestone detail pages, Survival EN/VI, Almanac EN/VI, What-If (single asset EN, Playbook VI), World, Quiz EN/VI, Search with a query, Methodology, Disclaimer, the Vietnam card game.
- **In-game states (phone):** Survival first event, after a choice, and the result screen, in EN and VI; Quiz with a question shown and after answering (VI).

## Result

| Run | Violations |
|---|---|
| First pass, 38 page runs | 32 clean; 6 runs with the 2 problems below |
| After fixes: home EN/VI and World, both viewports | 0 |
| Survival and Quiz in-game states | 0 |

## Found and fixed

1. **Home "rebirth picker" list was invalid markup** (EN and VI, both viewports): an `<ol>` whose direct child was an animation `<div>` wrapping the `<li>` items, so assistive tech did not get a proper list. The animated element is now the `<ol>` itself and the empty-state message is a paragraph.
2. **World page year slider had no accessible name** (critical). It now has a label ("Year (1978-2026)" / "Năm (…)"). The Almanac slider got the same fix earlier the same day.

## Not covered

- Keyboard-only use, focus order and visible focus; screen-reader reading order; 200% zoom and reflow; reduced-motion behaviour; the generated pass-card image (a canvas PNG has no text alternative beyond the result screen itself).
- States not reached: Playbook with warnings, card-game play, search with no results, the mobile navigation drawer when open.
