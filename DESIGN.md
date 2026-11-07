---
name: The Reincarnation Checklist
colors:
  background: "#0A0B0F"
  on-background: "#ECEEF3"
  surface: "#111319"
  on-surface: "#ECEEF3"
  surface-raised: "#181B23"
  border: "#252A35"
  border-strong: "#343B4A"
  muted: "#9AA3B5"
  faint: "#7A8396"
  primary: "#F4B740"
  on-primary: "#1A1300"
  gain: "#3DD68C"
  on-gain: "#04170D"
  danger: "#F26D6D"
  warning: "#E9A23B"
  ring: "#8AB4FF"
typography:
  display-xl: { fontFamily: Bricolage Grotesque, fontSize: 72px, fontWeight: 800, lineHeight: 0.95 }
  display-l: { fontFamily: Bricolage Grotesque, fontSize: 48px, fontWeight: 700, lineHeight: 1.05 }
  heading: { fontFamily: Bricolage Grotesque, fontSize: 24px, fontWeight: 700, lineHeight: 1.2 }
  body: { fontFamily: Be Vietnam Pro, fontSize: 16px, fontWeight: 400, lineHeight: 1.6 }
  small: { fontFamily: Be Vietnam Pro, fontSize: 14px, fontWeight: 400, lineHeight: 1.5 }
  figure: { fontFamily: JetBrains Mono, fontSize: 14px, fontWeight: 500, lineHeight: 1.4 }
spacing: { xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 40px, xxl: 64px }
rounded: { sm: 6px, md: 10px, lg: 16px, full: 9999px }
components:
  button-primary: { backgroundColor: "{colors.primary}", textColor: "{colors.on-primary}", rounded: "{rounded.full}" }
  chip: { backgroundColor: "{colors.surface-raised}", textColor: "{colors.muted}", rounded: "{rounded.full}" }
  chip-active: { backgroundColor: "{colors.primary}", textColor: "{colors.on-primary}" }
  card: { backgroundColor: "{colors.surface}", textColor: "{colors.on-surface}", rounded: "{rounded.lg}" }
  badge-gain: { backgroundColor: "{colors.gain}", textColor: "{colors.on-gain}", rounded: "{rounded.sm}" }
---

## Overview

Audience: Vietnamese and international readers who enjoy the "reborn with future knowledge" (trọng sinh) fantasy and personal-finance history. Must read as **cinematic, confident, data-honest**.
Primary direction: **Bold / expressive** (oversized year numerals, hard contrast). Borrowed from **Operational**: tabular figures and dense opportunity tables, because the payload is numbers people compare.

## Signature Element

1. **Rebirth-year picker** on the homepage: choose the year you wake up; everything still ahead of you recounts.
2. **Checklist ticks**: every milestone can be ticked onto *your* plan; progress per country. The product name is a checklist — the UI literally is one.
3. **Giant decade numerals** in the timeline (gold, display-xl) — time is the protagonist.

## Colors

Dark ground with three layers (background → surface → surface-raised). 70 / 25 / 5: neutrals / text / accents.
Two accents with fixed roles: **gold `primary` = time** (years, dates, active filters), **green `gain` = money** (returns, $1,000 calculator). Never swap them. `danger`/`warning`/`gain` double as risk high/medium/low. Contrast floor WCAG AA; `faint` only for ≥14px secondary text.

## Typography

Display: Bricolage Grotesque (condensed-feeling, expressive). Text: Be Vietnam Pro (built for Vietnamese diacritics). Figures, dates, tickers: JetBrains Mono with tabular numbers. Vietnamese body never below 14px; line-height ≥1.5 so stacked diacritics do not collide.

## Layout

Container 1120px. Base unit 4px, scale in `spacing`. Timeline = left decade rail (sticky on desktop) + card column. Cards stack at <768px; decade nav becomes horizontal scroll.

## Elevation & Depth

Flat. Depth by surface layers and borders only; no drop shadows. One exception: the hero has a subtle radial gold glow behind the year.

## Shapes

`rounded.lg` cards, `rounded.full` chips/buttons, `rounded.sm` badges.

## Components

Chip (default / hover / active / focus-visible), Card (default / hover border-strong / checked = gold left border), Checkbox (unchecked / checked / focus), Badge (gain multiple, risk), Quiz option (default / hover / correct / wrong / disabled after answer).

## Motion & Interaction

150ms ease-out for color/border; no layout animation. `prefers-reduced-motion` disables transitions.

## Do's and Don'ts

- Do show a number whenever we have one; say "≈" for estimates.
- Do show the "Unverified" badge on any `verified: false` item.
- Don't use gold for money or green for time.
- Don't add drop shadows, glassmorphism, or gradient text.

## Accessibility Constraints & Accepted Debt

Focus ring `ring` 2px on every interactive element; checkbox is a real `<button aria-pressed>`; quiz options are buttons. Debt: unknown routes render 404 content with HTTP 200 (framework constraint with Cache Components).

## Research Log

- Taste foundations / critique rubric from omh-frontend & omh-design-quality-gate.
- Font availability checked against next/font data (all three ship a `vietnamese` subset).
