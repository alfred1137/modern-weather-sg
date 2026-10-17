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
      toolchain; preview approved; v1.5.1 bumped, committed and deployed.

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

## Review (shipped 2026-10-17)

- **Commit** `2cfc6ff` — `feat: v1.5.1 MyCMAQ cycle fix + one-day outlook, SW
v1.5.1` (16 files, +601/−137). Worker deployed separately as
  `sgw-proxy` version `bb6b61a9`.
- **Gates:** build ✓ · lint ✓ (0 warnings) · test 68/68 ✓ · design:lint ✓ —
  run twice on the final tree (before and after the version bump), on Node
  24.20.0 / npm 12.2.0.
- **Deploy:** `Deploy to GitHub Pages` success (36 s) → `pages build and
deployment` success (40 s). Raw `gh-pages` verified: `sw.js` =
  `sg-weather-v1.5.1`, bundle contains `1.5.1` + the reworded Malaysian-time
  credit. (Local and CI bundle hashes differ — expected without a lockfile.)
- **Worker:** live `/mycmaq/frames?var=PM25_TOT&domain=d02` → `20261016_00`,
  120 frames, first frame `2026-10-17 08:00 LST` ≤ now at 09:31 SGT; `/latest`
  consistent.
- **Deliberately not done:** any "compression" work — the origin publishes one
  rendition and the only free lever (transfer less) is already spent on the
  one-day window. Revisit only if Cloudflare Image Resizing becomes free/usable
  on a custom zone.
- **Leftover:** `workers/.wrangler/` stays untracked; the throwaway harness at
  `…\Temp\opencode\mycmaq-cycle-check.mjs` is not committed.

---

# v1.5.2 — PM2.5 playback smoothing + true publish time

Two user-reported defects in the Forecast (MyCMAQ) sub-tab.

## Findings

**1. Frame flash on first playback.** `MycmaqForecastView` renders the frame as
`<img key={current.file} src=…>` (line 151). The `key` remounts a brand-new
element on every frame change, and a fresh `<img>` has no decoded bitmap at its
first paint → the card background shows for a beat (the flash), even though the
preloader already reported `Buffered`. The preloader waits on `onload` only
(line 81) — i.e. _bytes_, not _decode_ — so "Buffered" oversells readiness.
`RainAreasView` gets away with the same `key` + `transition-opacity` pattern
(line 238) because its frames are transparent radar overlays drawn **on top of**
a base map: a not-yet-painted overlay simply reveals the map beneath. A MyCMAQ
frame _is_ the map, so the same idiom blanks the whole card.

**2. Footer shows the wrong timestamp.** `SyncFooter label={currentTime}` passes
the _frame's_ LST valid time, so it reads e.g. `17-Oct 10:00` — the hour the
frame is valid for, not when MetMalaysia published it. The publish instant is
available for free: the cycle manifest's HTTP `Last-Modified`. Measured on cycle
`20261016_00`:

| resource               | `Last-Modified` (GMT) | = SGT           |
| ---------------------- | --------------------- | --------------- |
| `PM25_TOT_…_08LST.png` | Fri, 16 Oct 18:42:14  | 17 Oct 02:42:14 |
| `PM25_TOT_…_13LST.png` | Fri, 16 Oct 18:42:16  | 17 Oct 02:42:16 |
| `PM25_TOT_…_20LST.png` | Fri, 16 Oct 18:42:18  | 17 Oct 02:42:18 |
| `PM25_TOT_…_22_07LST`  | Fri, 16 Oct 18:42:43  | 17 Oct 02:42:43 |
| `manifest.json`        | Fri, 16 Oct 18:43:39  | 17 Oct 02:43:39 |

A cycle is written in one run (~30 s) — so a cycle-level stamp is a fair proxy for
the whole cycle, and costs one HEAD rather than one per frame. **Superseded:** the
manifest `Last-Modified` turned out to be a housekeeping rewrite, not the write
time; see the Decision revision below for what actually ships.

## Steps

- [x] P1 — Worker: `publishedAt` on `/mycmaq/frames` + `/mycmaq/latest`, read
      from the cycle's first-frame `Last-Modified` (one HEAD per resolution,
      carried inside the cached payload); the manifest stamp is only a fallback.
      `node --check` + harness assert.
- [x] P2 — `constants.tsx`: `formatShortDateTimeUTC8(iso)` — `DD-MMM HH:MM` in
      fixed UTC+8, null for a missing/invalid stamp.
- [x] P3 — `types.ts`: `MycmaqForecast.publishedAt?: string | null`.
- [x] P4 — View: footer renders the cycle publish time (UTC+8 preformatted
      label) or nothing when unknown.
- [x] P5 — View: preloader awaits `decode()` (guarded) and the frame is drawn by
      two always-mounted alternating layers (the current frame opaque beneath,
      the previous fading out on top), so no remount can blank the card.
- [x] P6 — Tests: 68 → 72 (publish-time footer, hidden-when-unknown, decoded
      buffering, two-layer crossfade, dip-free fade direction).
- [x] P7 — Docs: `DESIGN.md` (Source footer, slider/player, motion rule),
      `AGENTS.md` (worker `publishedAt` + view description), `tasks/lessons.md`.
- [ ] P8 — Gates → preview → user confirm → bump 1.5.2 → commit → push →
      worker deploy + live verify.

## Decision revision (D3)

The confirmed D3 was "cycle-level manifest `Last-Modified`". Measurement after
implementing it showed that is **wrong**: every live manifest shares one
housekeeping stamp, rewritten in a batch, and it trails the frames badly.

| cycle         | frames `Last-Modified`     | manifest `Last-Modified` |
| ------------- | -------------------------- | ------------------------ |
| `20261016_00` | 16 Oct 18:42:14 – 18:42:43 | 16 Oct 18:43:39          |
| `20261015_12` | 16 Oct 02:43:03 – 02:43:32 | 16 Oct 18:43:39 (+16h!)  |

Both manifests carried the _same_ stamp to the second, while their frames differ
by 16h. So `publishedAt` now comes from the served cycle's **first frame**
`Last-Modified` — still cycle-level (a cycle is written in one ~30s run, frames
never rewritten), still one request per resolution, but actually honest. The
manifest stamp survives only as the fallback when the HEAD fails.

## Also found (P1)

Cache-invalidation trap: the `/frames` + `/latest` payloads live for 6h, so the
deploy-time shape change kept serving pre-change bodies (no `publishedAt`) until
the TTL expired — the footer would have stayed hidden for hours. Fixed the way
the SW does it: `MYCMAQ_PAYLOAD_VERSION` (`v2`) is now part of both cache keys,
so a shape change abandons stale entries instead of reusing them.

## Decisions (locked)

- **D1** — 200ms fade between two alternating layers (`duration-200`, the existing
  scale). Direction revised after review: the current frame stays opaque beneath
  and the previous frame fades out on top, so a symmetric dissolve's dim-then-
  brighten dip can't happen. Documented as a data transition, not decoration.
- **D2** — footer copy stays "Source data last updated at"; the time it shows is
  now the cycle publish instant (UTC+8).
- **D3** — cycle-level publish instant, revised to the frame's own stamp (above).

## Review iteration (post-preview)

User reported the first two-layer build still felt wrong: on playback the map
_dims then brightens_. Correct diagnosis, wrong mechanism — the two layers were
cross-fading symmetrically (old `1→0`, new `0→1`), so their weights summed to less
than 1 mid-fade and the card showed through.

Fixed by inverting the fade instead of tuning its duration: the current frame is
opaque **beneath** (`zIndex` by role) and the previous frame fades out **on top**,
with the transition class only on the outgoing layer (the after-change
`transition-property` governs, so class + value can change in one commit).

Verified in headless Chrome (CDP, throwaway profile — no manual debug toggle),
sampling `getComputedStyle(img).opacity` per `requestAnimationFrame`:

- single step: outgoing `1 → 0.54 → 0.22 → 0.04 → 0` over ~200ms, incoming pinned
  at exactly `1` for every one of 27 samples;
- 8-step scrub at 90ms (faster than the fade): incoming `1` at all 56 samples,
  coverage never below 1;
- 20s of real playback: 24 frames, each fully decoded (`naturalWidth 1024`) at
  every sample — no blank beat.

Live preview also confirmed the footer reads `Source data last updated at
17-Oct 02:42` (publish instant) while the pill shows the frame hour `17-Oct 10:00`.
Gates after the change: build ✓, lint ✓ 0 warnings, **72/72** tests, `design:lint`
0 errors. Version still 1.5.1 — bump/commit/push await the confirmation.

## Review iteration 2 (dark theme)

Second report: light mode "looks GREAT", dark mode "still flashing a bit — the
backdrop behind the PNG is too dark and shows between frames".

The clamp behaves differently from every other part of the fade, and that is the
whole story. Dark theme clamps the inverted frame back onto `base` with
`mix-blend-mode: lighten`; light theme has no clamp. `max` is convex, so
`max(avg(A,B)) ≤ avg(max(A),max(B))` — clamping a _mixture_ of two frames is
always darker than clamping each frame and mixing:

| mid-fade composite (real frames, computed per pixel) | luma              |
| ---------------------------------------------------- | ----------------- |
| frame A clamped                                      | 62.23             |
| frame B clamped                                      | 63.73             |
| midpoint reference                                   | 62.98             |
| **one shared overlay clamping the mixture**          | **62.15 (−0.82)** |
| **per-layer clamp, then mix**                        | **62.94 (−0.04)** |

So the fix is per-layer: each frame gets its own `bg-base` + `isolate`d wrapper
with the `lighten` clamp inside it, and the crossfade averages already-clamped
frames. The shared overlay was the only thing making the dark theme dim.

Second, smaller hole, same symptom: a layer background is theme-coloured, so
fading toward a frame whose bytes have not decoded yet showed that backdrop where
the plumes belong — a dark flash in dark mode, invisible against white in light
mode (which is exactly why light mode looked fine). The fade now waits for the
incoming frame's `onLoad` (`paintedSrc`), so no frame is revealed before it has
painted; the outgoing frame just holds longer.

Verified in headless Chrome, both themes, real unperturbed transitions during
playback (opacity read from the live element, screenshot back-to-back, luma
bucketed by opacity — a _frozen_ transition lies, see lessons):

- dark: 186 samples, 169 mid-fade, p spans `0…1`, luma spread 0.59, no sample
  below median−1;
- light: 144 samples, 132 mid-fade, luma spread 0.64, same;
- zero samples fading (p<0.98) while the incoming frame was unpainted.

Tests 72 → 73 (the outgoing layer must hold at opacity 1 until the incoming image
fires `load`, then fade). Gates: build ✓, lint ✓, **73/73**, `design:lint` ✓.
Note for verification: the service worker served the _previous_ bundle in
preview until `CACHE_NAME` moves — check the running bundle hash before
believing a screenshot.
