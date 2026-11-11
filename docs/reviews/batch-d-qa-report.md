# Batch D — First-Run & Navigation QA Report

> Test Date: 2026-11-11
> Target Build: Next.js 16.4.5 Production Server (`localhost:3005`)
> Test Viewports: Desktop (1280\u00d7800) and Mobile (390\u00d7844 iPhone 13 emulation)

---

## 1. Executive Summary

All critical first-run navigation flows and primary user journeys across English and Vietnamese were exercised in an automated headless browser harness against a production build.

* **Runtime console errors:** 0 errors recorded across all tested routes.
* **Navigation transitions:** Average route navigation under 0.6s; no blank shells or hung streams observed.
* **Hydration stability:** Hard reloads on complex client-heavy routes (`/whatif`, `/almanac`) hydrated in < 1.0s without UI flicker or state desync.

---

## 2. Route & Performance Matrix

| Route | Viewport | Load / Transition Time | Critical Element Verified | Result |
|-------|----------|------------------------|---------------------------|--------|
| `/en` (Homepage) | Desktop | 0.459s | Hero headline + RebirthPicker mount | Pass |
| `/en#rebirth-picker` (2024 state) | Desktop | < 0.1s interaction | Slider sets to 2024, filters 8 milestones | Pass |
| `/en/us/us-berkshire-hathaway-1980` | Desktop | 0.093s | H1, sources, verified notes render | Pass |
| `/vi/vn/vn-louis-holdings-tgg-manipulation-2021` | Desktop | 0.074s | H1, `historicalOnly` notice, no gain stats | Pass |
| `/en/almanac` | Desktop | 0.568s | Price Almanac year sliders + charts | Pass |
| Almanac \u2192 Playbook Handoff | Desktop | 1.080s | Hand-off link clicked, lands on `/whatif` | Pass |
| `/en/whatif` (Hard Reload) | Desktop | 0.957s | Client state re-hydrates cleanly | Pass |
| `/en/survival` | Desktop | 0.448s | Reincarnation Roulette mounts | Pass |
| `/en` (Mobile Layout) | Mobile (390\u00d7844) | 0.320s | Sticky nav, responsive hamburger button | Pass |
| Mobile Menu Toggle | Mobile (390\u00d7844) | 0.050s | Expands drawer, 17 links accessible | Pass |

---

## 3. Investigation of Prior Intermittent Reports

1. **Almanac \u2192 Playbook slow transition report:**
   * Tested transition by clicking `⚡ Build compounding chain from 2000 →`.
   * Transition took **1.08s** to full interactivity on production build.
   * Next.js prefetching and client-side route cache functioned normally; no request hangs detected.
2. **Reload hydration issue report:**
   * Triggered hard reload on `/en/whatif` with active tabs.
   * Page reloaded and remounted React components in **0.957s** with no hydration mismatch warnings in the browser console.
3. **2024 RebirthPicker empty-state check:**
   * Slider input dynamically triggered React state update for year 2024.
   * Verified that country cards without 2024 milestones render context-aware empty copy rather than broken placeholders.

---

## 4. Status

Batch D QA criteria are met. Production server shutdown and clean baseline ready for Batch E (Release Candidate & Gate 0 sign-off).
