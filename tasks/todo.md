# TODO — data.gov.sg API key via Cloudflare Worker proxy

Goal: stop the "Sync error / quota exhausted" failure on the GitHub-Pages
deployment by routing API calls through a Cloudflare Worker that holds a
`data.gov.sg` API key and caches responses for 5 minutes (one upstream call
per key per 5 min regardless of viewer count).

## Decisions (locked)

- Worker: `sgw-proxy.alfred1137.workers.dev` (created, hello-world).
- Key: stored as Worker secret `WEATHER_API_KEY` (never in source).
- Deploy: `npx wrangler` CLI (on-demand v4, no global install).
- TTL: 300s. Stale-while-revalidate on cache miss/expiry.
- CORS: `Access-Control-Allow-Origin: *` (public data; edge-cache freeze makes
  exact-origin echo racy, so `*` is race-proof and allows prod + localhost
  dev 5173/4173).
- Stale-fallback: YES — last-good data in `localStorage`, served on fetch failure.
- PWA impact: none (SW at `public/sw.js:55` never cached the API anyway).

## Steps

- [x] S1 — Investigate root cause + API key mechanism (docs in `doc/*.json`).
- [x] S2 — Document plan + confirm arrangement with user.
- [x] S3 — Write plan to `tasks/todo.md`.
- [x] S4 — Create worker source: `workers/wrangler.toml` + `workers/src/index.js` (syntax-checked; `npm run build` gate still green).
- [x] S5 — Worker deployed + verified: all 4 endpoints 200 with live data; CORS
      fixed to `Access-Control-Allow-Origin: *` (race-proof; prod + localhost work);
      cache HIT confirmed. (Fixed three worker bugs: immutable-headers 1101,
      duplicate ACAO, edge-cache ACAO freeze.)
- [x] S6 — Repoint `services/weatherService.ts` `BASE_URL` to worker `/api`.
- [x] S7 — Add `localStorage` stale-fallback in `App.tsx` (hydrate on init, persist on success, keep stale data instead of error screen on failure).
- [x] S8 — `npm run build` — gate green (exit 0). Bundle verified: worker URL present, old data.gov.sg URL gone, cache key present.
- [ ] S9 — User: verify live site loads weather, no Sync error on refresh.

## Why this works

- Before: each viewer's browser hit `api-open.data.gov.sg` anonymously → shared
  anonymous quota exhausted under traffic → 429 → "Sync error".
- After: all viewers hit the worker; the worker fetches upstream once per 5 min
  with the key (higher quota), caches, and serves cached JSON to everyone.

---

# De-slop pass (kill-ai-slop skill) — DONE

Goal: strip AI-default decoration from the UI while keeping Catppuccin theming,
data semantics, and functionality intact. Scope: plan groups A1–A6, B1–B3.

## What changed

- **A1** README.md — emojis stripped from ToC + section headings.
- **A2** Deleted AI-style kicker sublines: App, F24h, F4D, PSIView.
- **A3** Hover transforms removed (ThemeToggle, LegendModal, App legend
  button, github link); `transition-all` → `transition-colors` on ~25
  color-only spots.
- **A4** Killed glows/pings: Nowcast pings (x2), RainAreas "Live" halo,
  F24h active-tab glow + marker halo + icon/text drop-shadows, F4D icon/text
  glows, PSI marker halo + value glow.
- **A5** App background blobs removed; LegendModal icon-tile gradient removed.
- **A6** `constants.tsx` — all ~20 weather icons flattened (no drop-shadow /
  animate-pulse / animate-bounce).
- **B1** Glass→solid + radius/shadow scale-down on data cards (F4D, Nowcast
  grid/detail, PSI map/bands, RainAreas controls/legend, LegendModal items);
  kept `glass` on chrome (nav bars, segmented toggles, map containers, modal
  panel).
- **B2** Sentence-case micro-labels/buttons ("Search area...", "Tap icons",
  "2-hour nowcast:", "Past 6 hours", toggle labels).
- **B3** `index.html` — font Inter → **Onest** (Google Fonts link, Tailwind
  `fontFamily.sans`, body rule). Version string untouched.
- Tests updated: `test/NowcastView.test.tsx` copy assertions
  ("Tap icons", "Search area...").

## Verification

- `npm run build` — green (tsc + vite).
- `npm run lint` — 0 errors, 4 pre-existing `any` warnings (untouched).
- `npm run test` — 21/21 pass.
- `node scripts/scan.mjs` — 12 groups/220 hits → 9 groups/88 hits; remainder
  are intentional keeps (signature `font-black uppercase` h1s, functional
  marker circles/pills, map-image crossfade transitions).

## Notes

- Editor save-hook prettier-normalized edited component files (semicolons
  stripped) — cosmetic diff noise, consistent with repo style. F24h was
  auto-reformatted mid-session before the rest were handled.
- Untouched by design: h1s stay `font-black uppercase`, weather-icon colors/
  opacity stay semantic, marker scale hovers stay functional, data sublines
  (nowcast period, latest observation) stay, `weather-card` lift stays.

---

# 1.4.Z — Refinement Series

Series objective: strip AI-slop residue, humanize voice, and harden
build/release hygiene so the app reads hand-crafted, not vibe-coded.

Versioning: two tracks bumped every milestone — app SemVer `1.4.0`→`1.4.6`
(package.json single source → Vite-define footer, README badge) and SW cache
integer `v19`→`v25` (public/sw.js CACHE_NAME single source).

## Milestones

- [x] M1.4.0 — Commit current de-slop pass (15 files) + bump (app 1.4.0, SW v19), push.
- [x] M1.4.1 — Fix 4 `any` lint warnings (App.tsx:89,92; weatherService.ts:58,81), bump (1.4.1, v20), push.
- [x] M1.4.2 — Humanize F4D insights copy ("leveraging on advanced multi-model
      ensemble forecasting…"), bump (1.4.2, v21), push.
- [x] M1.4.3 — Dead `@google/genai` dep: already removed from package.json; cleared
      stale AGENTS.md/lessons.md references, bump (1.4.3, v22), push.
- [x] M1.4.4 — Residual scan micro-cleanup (LegendModal shadow-xl → shadow-lg,
      map-image `transition-all` → `transition-opacity`), bump (1.4.4, v23), push.
- [x] M1.4.5 — Expand test coverage (PSIView, RainAreasView, F4D/F24h,
      LegendModal, SyncFooter, ThemeToggle, App root), bump (1.4.5, v24), push.
- [x] M1.4.6 — Release hygiene: footer version via Vite define (single source
      package.json), SW version single-source (public/sw.js CACHE_NAME only,
      index.html version strings dropped), lockfile gitignored, bump (1.4.6,
      v25), push.

## Per-milestone procedure

1. Implement work item.
2. Bump app version + SW name (3 edits: package.json, README badge,
   public/sw.js CACHE_NAME — footer is Vite-define-injected).
3. Gate: `npm run build`, `npm run lint`, `npm run test`.
4. Grep: no old `vX.Y.Z` / `sg-weather-vX.Y.Z` strings remain.
5. Stage explicitly (never `git add -A`; exclude untracked `package-lock.json`),
   commit folded work+bump, push (CI deploys; verify via raw `gh-pages` branch,
   HTML CDN cache 10 min).

---

# v1.5.0 — MyCMAQ PM2.5 forecast tab

Goal: third Air Quality sub-tab (`Forecast`) playing MetMalaysia MyCMAQ 5-day
hourly PM2.5 (Domain 02 Malaysia) with LST valid-time labels, rain-radar-style
playback, theme-matched recolour, and frame buffering.

## What changed

- `workers/src/index.js` — `/mycmaq/latest|/frames|/image/...` passthrough
  (6h edge cache, immutable browser headers, no API key; static PNGs +
  manifest only, no upstream API). Fixed during preview: `_TOT` filename
  regex, absolute-URL cache key.
- `types.ts` — `MycmaqFrame` / `MycmaqForecast`.
- `services/weatherService.ts` — `fetchMycmaqLatestCycle`,
  `fetchMycmaqForecast` (defaults `PM25_TOT`/`d02`), `mycmaqImageUrl`.
- `components/MycmaqForecastView.tsx` (new) — 600ms playback + slider, LST
  pill + raw valid key, 1h trim (timeline starts at ~now), 4-lane preloader
  with buffering pill, latte white card / macchiato invert+hue-rotate +
  `bg-base` lighten overlay, MetMalaysia credit + source link, `asOf` prop
  freezes the trim boundary (keeps `react-hooks/purity` clean).
- `components/PSIView.tsx` — `Mode` extended to `psi|pm25|mycmaq`, lazy fetch
  on first switch, desktop + mobile 3-way toggles.
- `App.tsx` — footer MetMalaysia credit. `DESIGN.md` — forecast-player spec.
- `test/` — 62 tests / 13 suites (new `MycmaqForecastView` suite, service +
  PSIView additions, footer regex tracks minor).
- Docs/skills — README (feature + worker routes), AGENTS.md (counts, views,
  worker routes), fixed `version-bump` (SW tracks app SemVer, not integer)
  and `ship-milestone` (dropped hardcoded test counts) skill drift.

## Verification

- `npm run build`, `npm run lint` (0 warnings), `npm run test` (62/62),
  `npm run design:lint` (0 errors) — all green pre-push.
- Previewed locally against `wrangler dev` (120/120 frames, PNG bytes +
  immutable headers verified) before shipping.

---

# v1.5.1 — forecast correctness + UX refinement

Goal: fix the MyCMAQ "Now is not now" bug, cut mobile buffering cost, and
trim player/pill/footer over-information.

## Findings (investigated 17 Oct)

- **Item 3 — cycle selection bug (confirmed, reproducible).** Every MyCMAQ
  cycle covers a fixed window `[D+1 08:00, D+6 07:00]` LST for cycle date `D`
  (verified across 5 cycles: `20261016_00` → 17 Oct 08:00 – 22 Oct 07:00, etc.).
  The worker picks the _newest index cycle_, whose window almost always starts
  in the future. At the user's 17 Oct 06:00 test the newest cycle
  (`20261016_00`) had zero frames ≤ now, so `trimFrames` kept the whole array
  and frame 0 was 17 Oct **08:00** while labelled "Now". The cycle that actually
  covers now was `20261015_12` (window from 16 Oct 08:00).
- **Item 4 — no compression lever on free tier.** Origin publishes exactly one
  asset per frame: 1024×1024 RGB PNG (colorType 2), ~250–270 KB → ~30 MB per
  120-frame cycle. No smaller/webp rendition exists; Cloudflare Image Resizing
  needs a zone (not `workers.dev`) and is a paid add-on; WASM re-encode exceeds
  the free 10 ms CPU budget. Only free lever = transfer less (preload windowing).
- **Item 6 — `SyncFooter`** renders time only (`22:22`), no date.
- **Item 7 — band source.** `PSIView` computes `worstBand` for `mycmaq` mode
  from 1-hr PM2.5 (`PM25_BANDS` → "Elevated").
- **Env note (item 1):** dev has Node `v24.4.1` + npm `11.19.0`; npm 12 needs
  Node `>=24.15.0`. No version manager installed (Node at
  `C:\Program Files\nodejs`, winget + choco available).

## Steps

- [x] P1 — Worker: choose the newest cycle whose window covers now (scans index
      cycles, newest date first, accepts the first manifest with a frame ≤ now;
      `/latest` and `/frames` share the logic; cycle-less `/frames` caches under
      a `latest` scope so resolution runs once per TTL).
- [x] P2 — View: honest timeline start — `Now` only when the first frame is
      within 90 min of the fetch; a later-opening window shows the real lead
      (`+Nh`), a stale-only window shows nothing.
- [x] P3 — View: time pill collapsed to `DD-MMM HH:MM` (LST suffix + raw valid
      key dropped; credit line reworded to "Times are Malaysian local time").
- [x] P4 — `SyncFooter`: date + time (`DD-MMM HH:MM`), plus an optional
      preformatted `label` so MyCMAQ's fixed LST wall-clock can't shift with the
      viewer's timezone.
- [x] P5 — One-day outlook: window = current hour step → +24h (~25 frames ≈
      6 MB instead of 120 ≈ 30 MB); degenerate cycles fall back to the frame
      closest to now; frames get `decoding="async"`.
- [x] P6 — `PSIView`: MyCMAQ header band from the worst SG 24-hr PSI
      (`getPSIBand`), so the forecast tab reports "Moderate"/"Unhealthy" instead
      of the 1-hr PM2.5 "Elevated".
- [x] P7 — Tests: 62 → 68 (new outlook-cap, lead-offset, buffering/format,
      PSI-band and SyncFooter-format cases; fixtures gained a frame builder +
      `mycmaqForecastOutlook`).
- [x] P8 — Docs: `DESIGN.md` (slider/player, source footer, forecast band),
      `AGENTS.md` (test counts, view + worker cycle rule, CI npm pin),
      `README.md` (feature bullet + worker cycle note); new
      `npm-pin-management` project skill.
- [x] P9 — Worker deployed + verified; all gates green on the upgraded
      toolchain; preview live for visual approval (version bump + push pending
      that approval).

## Decisions (locked)

- **D1 (item 4):** one-day outlook — timeline capped to now → +24h.
- **D2 (item 7):** header reads `PM2.5 forecast — <band>`, band from the worst
  24-hr PSI region.
- **D3 (item 1):** upgrade Node then npm so dev matches CI.

## Verification

- Worker, driven with a stubbed clock against the live MetMalaysia index
  (throwaway harness, not committed): at 17 Oct 06:00 the scan rejects the
  future-starting newest cycle `20261016_00` and selects `20261015_12`
  (window starts 16 Oct 08:00, `first ≤ now ≤ last`); at 09:19 it selects
  `20261016_00`; `/latest` agrees. Scan cost = index + ≤2 manifests (6h cached).
- Live worker after deploy: `cycle=20261016_00`, 120 frames,
  `/mycmaq/latest` consistent.
- `npm run build`, `npm run lint` (0 warnings), `npm run test` (68/68),
  `npm run design:lint` (0 errors) — green, re-run on Node 24.20.0 / npm 12.2.0.

## Environment (item 1)

- Node 24.4.1 → **24.20.0** (`winget install OpenJS.NodeJS.LTS`, UAC), npm
  11.19.0 → **12.2.0** — dev now matches the CI pin.
- New npm 12 behaviour: install scripts are blocked unless approved
  (`npm warn install-scripts esbuild@0.25.12 … blocked`). Harmless here — the
  platform optional dep supplies esbuild's binary and build + tests pass — but
  documented in the `npm-pin-management` skill.

## Open decisions (blocking)

- None. Awaiting preview approval, then bump → commit → push.
