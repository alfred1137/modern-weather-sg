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
(package.json, App.tsx footer, README badge) and SW cache integer `v19`→`v25`
(index.html x3 + public/sw.js).

## Milestones

- [x] M1.4.0 — Commit current de-slop pass (15 files) + bump (app 1.4.0, SW v19), push.
- [x] M1.4.1 — Fix 4 `any` lint warnings (App.tsx:89,92; weatherService.ts:58,81), bump (1.4.1, v20), push.
- [x] M1.4.2 — Humanize F4D insights copy ("leveraging on advanced multi-model
      ensemble forecasting…"), bump (1.4.2, v21), push.
- [x] M1.4.3 — Dead `@google/genai` dep: already removed from package.json; cleared
      stale AGENTS.md/lessons.md references, bump (1.4.3, v22), push.
- [ ] M1.4.4 — Residual scan micro-cleanup (LegendModal shadow-xl, image
      transition-all, stray gap-4), bump (1.4.4, v23), push.
- [ ] M1.4.5 — Expand test coverage (PSIView, RainAreasView, F4D/F24h,
      LegendModal, SyncFooter, ThemeToggle, App root), bump (1.4.5, v24), push.
- [ ] M1.4.6 — Release hygiene: footer version via Vite define, SW version
      single-source, lockfile decision, bump (1.4.6, v25), push.

## Per-milestone procedure

1. Implement work item.
2. Bump app version + SW integer (7 edits: 3 app + 4 SW).
3. Gate: `npm run build`, `npm run lint`, `npm run test`.
4. Grep: no old `vX.Y.Z` / `vN` strings remain.
5. Stage explicitly (never `git add -A`; exclude untracked `package-lock.json`),
   commit folded work+bump, push (CI deploys; verify via raw `gh-pages` branch,
   HTML CDN cache 10 min).
