---
version: alpha
name: Modern Weather.sg
description: >-
  Catppuccin-based data-front for the Singapore weather PWA. Calm,
  low-contrast, data-first instrument panel with glassmorphic chrome and flat
  color-encoded icons. Dual-theme (Macchiato default, Latte light). Tokens
  carry the DESIRED Macchiato values; Latte values and the legibility contract
  are documented in prose. This file is the target state, not an inventory of
  the current code.
colors:
  primary: '#8AADF4'
  on-primary: '#1E2030'
  secondary: '#CAD3F5'
  neutral: '#24273A'
  surface: '#363A4F'
  subtle: '#A5ADCB'
  overlay0: '#6E738D'
  overlay1: '#8087A2'
  status-green: '#A6DA95'
  status-yellow: '#EED49F'
  status-peach: '#F5A97F'
  status-red: '#ED8796'
  status-mauve: '#C6A0F6'
  status-sky: '#91D7E3'
  status-teal: '#8BD5CA'
  status-sapphire: '#7DC4E4'
typography:
  display:
    fontFamily: Onest
    fontSize: 48px
    fontWeight: 900
    lineHeight: 1
    letterSpacing: -0.05em
  headline-lg:
    fontFamily: Onest
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.2
  headline-md:
    fontFamily: Onest
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.3
  body-md:
    fontFamily: Onest
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
  body-sm:
    fontFamily: Onest
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.5
  label-xs:
    fontFamily: Onest
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.4
  label-deco:
    fontFamily: Onest
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.4
  label-caps:
    fontFamily: Onest
    fontSize: 11px
    fontWeight: 900
    lineHeight: 1.4
    letterSpacing: 0.2em
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  3xl: 48px
  4xl: 64px
rounded:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.md}'
    padding: 16px
  button-primary-hover:
    backgroundColor: '{colors.status-sky}'
  nav-tab-active:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.md}'
  nav-tab-idle:
    backgroundColor: '{colors.neutral}'
    textColor: '{colors.subtle}'
    typography: '{typography.body-sm}'
  card-surface:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.secondary}'
    rounded: '{rounded.lg}'
    padding: 16px
  segmented-toggle-active:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.xs}'
    padding: 8px
  chip-badge:
    backgroundColor: '{colors.on-primary}'
    textColor: '{colors.primary}'
    rounded: '{rounded.full}'
    padding: 4px
  input-search:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.secondary}'
    rounded: '{rounded.md}'
    padding: 12px
  map-marker:
    backgroundColor: '{colors.on-primary}'
    textColor: '{colors.subtle}'
    rounded: '{rounded.full}'
  band-dot-good:
    backgroundColor: '{colors.status-green}'
    rounded: '{rounded.full}'
    size: 12px
  band-dot-moderate:
    backgroundColor: '{colors.status-yellow}'
    rounded: '{rounded.full}'
    size: 12px
  band-dot-unhealthy:
    backgroundColor: '{colors.status-peach}'
    rounded: '{rounded.full}'
    size: 12px
  band-dot-very-unhealthy:
    backgroundColor: '{colors.status-red}'
    rounded: '{rounded.full}'
    size: 12px
  band-dot-hazardous:
    backgroundColor: '{colors.status-mauve}'
    rounded: '{rounded.full}'
    size: 12px
  weather-glyph-windy:
    textColor: '{colors.status-teal}'
  weather-glyph-heavy-rain:
    textColor: '{colors.status-sapphire}'
  input-placeholder:
    textColor: '{colors.overlay0}'
  icon-decorative:
    textColor: '{colors.overlay1}'
---

# DESIGN.md — Modern Weather.sg

## Overview

A calm, data-first instrument panel for tropical weather. The UI reads like a
well-kept gauge cluster: every element earns its place by carrying or framing
data, and nothing decorative is allowed to fight the numbers. Personality
comes from the Catppuccin palette — soft, low-contrast matte tones — plus
glassmorphic chrome (frosted mantle panels over a tonal background).

Target audience is a returning mobile user checking conditions in a glance,
often outdoors. That makes **legibility the primary design virtue**: type
must resolve at a glance under sunlight, in motion, at thumb distance.

Two operating modes, identical tokens:

- **Macchiato (default, dark)** — deep indigo surfaces, high-luminance text.
- **Latte (light)** — pale surfaces; every muted text token must be swapped
  per the contrast table in Colors.

Interaction color is a single blue. Weather state is encoded by flat Font
Awesome glyphs: hue = condition family, opacity = intensity (no glows, no
animation — decoration would fight the data).

## Colors

The palette is Catppuccin (Macchiato flavor primary, Latte secondary) mapped
onto semantic roles.

| Token        | Role                                                                                      | Macchiato            | Latte            |
| ------------ | ----------------------------------------------------------------------------------------- | -------------------- | ---------------- |
| `primary`    | sole interaction accent (active tab, primary button, links, focus)                        | #8AADF4              | #1E66F5          |
| `on-primary` | text/icons on `primary`                                                                   | #1E2030              | #EFF1F5          |
| `secondary`  | primary text (headlines, data values)                                                     | #CAD3F5              | #4C4F69          |
| `neutral`    | page background                                                                           | #24273A              | #EFF1F5          |
| `surface`    | card/input background                                                                     | #363A4F              | #CCD0DA          |
| `subtle`     | secondary/informational text — the contrast floor                                         | #A5ADCB              | #5C5F77          |
| `overlay0`   | placeholders, disabled, decorative only                                                   | #6E738D              | #9CA0B0          |
| `overlay1`   | icons, decorative only — never informational text                                         | #8087A2              | #8C8FA1          |
| `status-*`   | data glyphs, PSI/PM2.5 bands, radar ramp (green/yellow/peach/red/mauve/sky/teal/sapphire) | Catppuccin macchiato | Catppuccin latte |

**Contrast tiers (WCAG AA):**

| Text color  | On `neutral` (macchiato) | On `neutral` (latte) | Use                                                       |
| ----------- | ------------------------ | -------------------- | --------------------------------------------------------- |
| `secondary` | 9.4:1                    | 6.9:1                | headlines, values                                         |
| `subtle`    | 6.6:1                    | 5.5:1                | secondary text — **the floor for any informational text** |
| `overlay0`  | 4.1:1                    | 2.4:1                | placeholders, disabled — banned for text                  |
| `overlay1`  | 3.1:1                    | 2.9:1                | icons/graphics — banned for text                          |

The bands are data encoding, not decoration: PSI/PM2.5 band tables
(green→yellow→peach→red→mauve), the radar intensity ramp, and weather icon
hues are all semantic and must never be re-themed for aesthetics.

## Typography

One family — **Onest** (400–900), designed for small-size legibility with
strong 1/l/I and O/0 disambiguation. No display/body split: the same family
scales from decorative micro-labels to display headlines, with weight and
spacing doing the hierarchy work.

| Token         | Size               | Weight    | Use                                                                    |
| ------------- | ------------------ | --------- | ---------------------------------------------------------------------- |
| `display`     | 48px (36px mobile) | 900 black | view h1, uppercase, `tracking-tighter`, leading 1                      |
| `headline-lg` | 24px               | 700       | detail-panel titles, modal titles                                      |
| `headline-md` | 18px               | 700       | hovered-area cards                                                     |
| `body-md`     | 14px               | 500       | running data text — **the reading floor**                              |
| `body-sm`     | 12px               | 500       | informational labels — **the informational floor**                     |
| `label-xs`    | 11px               | 600       | data-carrying micro-labels (region names, band labels, unit values)    |
| `label-deco`  | 11px               | 600       | bottom-nav labels, sync metadata — **absolute floor; nothing smaller** |
| `label-caps`  | 11px               | 900       | period tabs (Morning/Afternoon/Evening/Night), `tracking 0.2em`        |

**Legibility rules (normative):**

- Nothing renders below **11px**. Period.
- Informational text (region names, band names, units, timestamps, card
  labels) never goes below **11px**; reading text below **12px**.
- Muted text never dips below the `subtle` token in either theme — `overlay*`
  tokens carry no information.
- Never stack `opacity-*` on a muted text color; encode de-emphasis in the
  token, not the alpha channel.
- Uppercase is reserved for `display` headlines and `label-caps` period tabs.
- Big data numerals (temp ranges, wind direction, PSI values) use `display`
  weight 900 with `tracking-tighter` — the numbers are the hero.

## Layout

Mobile-first. One column; content never exceeds `max-w-[1920px]` with
`xl:px-[138px]` gutters. Page top padding steps with breakpoint
(`pt-8` / `md:pt-24` / `lg:pt-36`) to clear the fixed nav; generous
`pb-32` bottom clearance above the mobile nav.

Strict **8px spacing scale** (`spacing` tokens: 4/8/12/16/24/32/48/64).
Vertical rhythm is `gap-6 md:gap-8` between sections and `gap-4` within a
section. Cards group related data with `p-4`–`p-8` internal padding.

Chrome pattern: **fixed glass nav** — bottom bar on mobile, top bar on
desktop (`md+`). Map/canvas views bleed edge-to-edge on mobile
(`-mx-4`, `rounded-none`) and become framed cards (`rounded-xl`, bordered)
on `sm+`. Controls repeat as a compact mobile variant under the header
when the desktop segmented toggle hides (`sm:hidden`).

## Elevation & Depth

Depth is **tonal**, not shadowy. Hierarchy flows from surface color steps —
`neutral` page → `surface` cards (`bg-surface0/60`) → `mantle` glass chrome —
plus 1px `surface1/10–20` borders. `glass` = mantle 70% + `backdrop-blur(12px)`

- hairline border; reserved for chrome (nav, toggles, modals), never data cards.

Shadows are restrained: `shadow-sm` on markers and stat cards, `shadow-md` on
framed maps, `shadow-lg` only on the theme toggle and modal sheet. The sole
motion hint for cards is a 4px hover lift (`.weather-card`); maps fade
layers on theme switch. No glows, no gradients, no floating animations —
they fight data density.

## Shapes

Radius follows the 8px rhythm: `xs 4` / `sm 8` / `md 12` / `lg 16` / `xl 24`
plus `full`. Cards and inputs use `md` (12px); map frames step up to `xl`
(24px) on desktop. Pills, chips, markers, dots, and the play button use
`full`. Micro-details stay sharp (`xs` on sub-index chips, radar ramp track).
A map view may be `rounded-none` on mobile (edge-to-edge bleed) but must
regain its radius on `sm+` — never a permanently square card.

## Layout contract (map views)

All map-based views (Nowcast, Air Quality, 24-Hour Forecast) share the same
vertical hierarchy:

```
[header block]  →  [toggle / tabs]  →  [map]  →  [detail]  →  [footer]
```

- The **header block** is wrapped in `flex flex-col gap-4`. It contains a
  `<header>` with `flex justify-between items-start gap-2`: h1 + subtitle on
  the left, segmented toggle (or period tabs) on the right.
- The **toggle/tabs** use the `segmented-toggle` component: desktop = `hidden
sm:flex` inside the header right; mobile = `sm:hidden` full-width glass
  control below the header. Button sizing: `px-6 py-2.5` (desktop),
  `py-3` (mobile).
- The **map** is a standalone glass container: `glass rounded-none sm:rounded-3xl
overflow-hidden aspect-[1.6/1] w-auto -mx-4 sm:mx-auto sm:w-full max-w-5xl
border sm:border-surface1/20 shadow-md bg-base`. It includes an
  `absolute bottom-4 right-4` helper pill ("Tap regions" / "Tap icons").
- The **detail** area sits below the map inside the same `flex flex-col gap-4`
  wrapper, with `min-h-[70px]` for the hover/click card.
- 24-Hour Forecast uses period tabs (Morning/Afternoon/Evening/Night) in place
  of a mode toggle, but the positional structure is identical.

## Components

- **Button (primary)** — `bg-blue` (#8AADF4) fill, `text-mantle` (#1E2030)
  label, `rounded-xl`, `px-6 py-3`, `font-bold text-sm`. Hover: `bg-sky`.
  Blue is the only fill color for primary actions (retry, close legend,
  active tab).
- **Navigation** — active tab = `button-primary` treatment (`rounded-xl`);
  idle tabs = `text-subtle` on glass. Mobile: icon over a 11px `label-deco`
  caption (first word only). Desktop: icon + `body-md` label, `gap-2 px-4 py-2`.
- **Segmented toggle** — glass track (`rounded-xl p-1`), active segment =
  `button-primary` treatment at `rounded-lg`, idle = `overlay1`/`subtext0`
  at `font-bold`. Used for Map/Grid, Singapore/Regional, PSI/PM2.5, and
  period tabs (Morning/Afternoon/Evening/Night) — mobile and desktop
  variants, identical labels.
- **Card (data)** — `bg-surface0/60`, 1px `surface1/20` border, `rounded-2xl`,
  `shadow-sm`; hover lifts 4px and tints the border to its subject hue
  (peach temp, blue humidity, teal wind). Stat values are the hero: `display`
  weight at 36–60px.
- **Chip/badge** — `bg-mantle/90` pill with 1px border, 10–12px semibold
  label, `text-subtle`/`text-text`; the "Live" badge is `bg-blue text-mantle`.
- **Search input** — `bg-surface0/40`, 1px `surface1/50` border, `rounded-xl`,
  `pl-11` icon slot; placeholder is `overlay0` (non-informational by
  definition); focused ring `ring-2 ring-blue/30`.
- **Map marker (nowcast/F24h)** — `bg-mantle/60` circle + `backdrop-blur`,
  icon center, hover `scale-110`; caption chip = `bg-crust/40` with region
  name at `label-xs` in `subtle` and value in its band color. Active marker
  lifts to `z-30` and the detail card below fills.
- **Map marker (PSI)** — same chrome; the value is the label (`font-bold`,
  band color, `label-xs` minimum) and the band name rides beneath.
- **Slider (radar timeline)** — blue thumb, transparent track, custom
  `webkit-slider-*` parts; tick labels 11px `subtle`.
- **Modal (legend)** — full-screen `crust/60` + blur scrim, `glass` sheet
  `rounded-2xl`, header with blue icon tile, item grid of circular swatch +
  11px label, `label-caps`-free footer button.

## Do's and Don'ts

- Do keep every informational text ≥ 12px and reading text ≥ 12px; 11px is
  the absolute floor and only for decorative captions.
- Don't ever render below 11px, in either theme, for any reason.
- Do keep informational text at ≥ 4.5:1 (WCAG AA): `secondary` or `subtle`
  on the surface it sits on, per the contrast table. In Latte, `subtle`
  means #5C5F77, not #6C6F85.
- Don't place `overlay0`/`overlay1` text carrying data, and don't stack
  `opacity-*` on muted text — choose the correct token instead.
- Do reserve blue for interaction: active states, primary actions, links.
- Don't use blue (or any accent) to convey data severity — that is the
  status palette's job (PSI bands, radar ramp, weather icons).
- Do keep the icon language flat and hue-coded; opacity encodes intensity
  only on glyphs, never on text.
- Don't add shadows beyond `shadow-lg` on the modal sheet and theme toggle;
  tonal layers and hairline borders carry depth.
- Do keep uppercase for `display` headlines and `label-caps` period tabs only.
- Don't invent new radius or spacing values — stay on the 8px scales.
- Do keep both themes token-identical; only the mapped values differ.
