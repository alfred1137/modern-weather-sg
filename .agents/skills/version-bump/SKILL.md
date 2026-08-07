---
name: version-bump
description: Bump the Modern Weather.sg version across every touchpoint (package.json, App.tsx footer, README badge, and the PWA/SW cache version in index.html + public/sw.js), using the project's two-track versioning convention, then verify the build gate and prepare the release push.
---

# Version Bump — Modern Weather.sg

Bump the project version across every place it appears. There are **two
independent version tracks** — do not conflate them.

## Versioning convention

| Track                    | Format                                 | Example             | Where it lives                                      |
| ------------------------ | -------------------------------------- | ------------------- | --------------------------------------------------- |
| **App version**          | SemVer `X.Y.Z` (displayed as `vX.Y.Z`) | `v0.9.1` → `v1.0.0` | `package.json`, `App.tsx` footer, `README.md` badge |
| **PWA/SW cache version** | Integer `N` (displayed as `vN`)        | `v14` → `v15`       | `index.html` (3 spots) + `public/sw.js`             |

Rules:

- **App version** follows SemVer; bump `major` for breaking/landmark releases
  (e.g. `0.9.1` → `1.0.0`), `minor` for features, `patch` for fixes.
- **SW cache version** bumps whenever the app bundle changes. It invalidates the
  old service-worker cache (the SW `activate` handler deletes every cache whose
  name ≠ the current `CACHE_NAME`), forcing users to fetch the new bundle. A
  release that ships new assets without bumping it serves stale UI to returning
  PWA users.
- The SW cache version appears in **4 places that MUST change together**:
  3 in `index.html` + 1 in `public/sw.js`.

## Touchpoints (exact)

### App version (SemVer) — 3 files

1. `package.json` → `"version": "X.Y.Z"`
2. `App.tsx` → footer: `<span className="text-overlay0">vX.Y.Z</span>`
3. `README.md` → badge: `https://img.shields.io/badge/version-vX.Y.Z-blue`

### PWA/SW cache version (integer) — 4 spots

1. `index.html` → manifest link: `<link rel="manifest" href="./manifest.json?v=N">`
2. `index.html` → SW register: `navigator.serviceWorker.register('./sw.js?v=N&t=' + Date.now())`
3. `index.html` → console log: `console.log('PWA: Service Worker active (vN)');`
4. `public/sw.js` → `const CACHE_NAME = 'sg-weather-vN';`

## Workflow

1. Grep for every current version to confirm all touchpoints:
   ```sh
   rg "v[0-9]+\.[0-9]+\.[0-9]+|v[0-9]+|sg-weather-v" package.json App.tsx README.md index.html public/sw.js
   ```
2. Decide the new **app version** (SemVer) and new **SW integer**.
3. Edit all touchpoints (7 edits total: 3 app + 4 SW).
4. Run the quality gate — must exit 0 (`tsc` typecheck + `vite build`):
   ```sh
   npm run build
   ```
5. Grep again: no old strings remain, new ones present in all spots.
6. Stage explicitly (never `git add -A` — the repo intentionally has no lockfile,
   and `package-lock.json` may exist from a local `npm install`; exclude it):
   ```sh
   git add package.json App.tsx README.md index.html public/sw.js
   ```
7. Commit + push `main` → GH Actions deploys to GitHub Pages automatically.

## Gotchas (from experience)

- The 3 `index.html` spots + `public/sw.js` **must bump together** (documented in
  `AGENTS.md`). Missing one = mixed SW version → cache purge fails, users keep
  the old bundle.
- Do NOT touch `info.version` in `doc/*.json` — those are the data.gov.sg API doc
  versions (e.g. `1.0.11`), not the app version.
- `package.json` is already at `1.0.0`; the app display version was `v0.9.1`
  (mismatch) until the v1.0.0 release — always check BOTH tracks independently.
- No lockfile is checked in → CI resolves deps fresh, so the deployed bundle
  hash may differ from your local `dist/`. Verify the deployed artifact, not
  just the local build.
- GitHub Pages CDN caches HTML at `max-age=600` (10 min): right after push the
  public site can serve the OLD version. Verify the deploy via the raw
  `gh-pages` branch instead:
  `https://raw.githubusercontent.com/alfred1137/modern-weather-sg/gh-pages/index.html`
- This workspace auto-formats edited files (quote style, trailing commas).
  Cosmetic churn in the diff is expected; the build gate is the real check.
