---
name: version-bump
description: Bump the Modern Weather.sg version across every touchpoint (package.json, README badge, and the PWA/SW cache version in public/sw.js), using the project's two-track versioning convention, then verify the build gate and prepare the release push.
---

# Version Bump — Modern Weather.sg

Bump the project version across every place it appears. There are **two
independent version tracks** — do not conflate them.

## Versioning convention

| Track                    | Format                                 | Example           | Where it lives                                     |
| ------------------------ | -------------------------------------- | ----------------- | -------------------------------------------------- |
| **App version**          | SemVer `X.Y.Z` (displayed as `vX.Y.Z`) | `1.4.5` → `1.4.6` | `package.json` (single source) + `README.md` badge |
| **PWA/SW cache version** | Integer `N` (displayed as `vN`)        | `v24` → `v25`     | `public/sw.js` `CACHE_NAME`                        |

Rules:

- **App version** follows SemVer; bump `major` for breaking/landmark releases,
  `minor` for features, `patch` for fixes.
- The app footer (`App.tsx`) reads `__APP_VERSION__`, injected by the Vite
  `define` in `vite.config.ts` from `package.json` — **never edit the footer
  by hand**. `package.json` is the single source of truth.
- **SW cache version** bumps whenever the app bundle changes. It invalidates the
  old service-worker cache (the SW `activate` handler deletes every cache whose
  name ≠ the current `CACHE_NAME`), forcing users to fetch the new bundle. A
  release that ships new assets without bumping it serves stale UI to returning
  PWA users.
- The SW cache version lives in exactly **one place**: `public/sw.js`. The
  `index.html` register URL uses only a `t=Date.now()` query (which already
  bypasses HTTP caching for `sw.js`), and the manifest link is unversioned.

## Touchpoints (exact) — 3 edits total

1. `package.json` → `"version": "X.Y.Z"` (app + injects the footer).
2. `README.md` → badge: `https://img.shields.io/badge/version-vX.Y.Z-blue`.
3. `public/sw.js` → `const CACHE_NAME = 'sg-weather-vN';` (bump when bundle
   changes; every milestone in the 1.4.Z series bumps it).

## Workflow

1. Grep for every current version to confirm all touchpoints:
   ```sh
   rg "v[0-9]+\.[0-9]+\.[0-9]+|v[0-9]+|sg-weather-v" package.json README.md public/sw.js
   ```
2. Decide the new **app version** (SemVer) and new **SW integer**.
3. Edit the 3 touchpoints above.
4. Run the quality gate — must exit 0 (`tsc` typecheck + `vite build`):
   ```sh
   npm run build
   ```
5. Grep again: no old strings remain, new ones present in all spots.
6. Stage explicitly (never `git add -A` — `package-lock.json` is gitignored):
   ```sh
   git add package.json README.md public/sw.js
   ```
7. Commit + push `main` → GH Actions deploys to GitHub Pages automatically.

## Gotchas (from experience)

- Do NOT touch `info.version` in `doc/*.json` — those are the data.gov.sg API doc
  versions (e.g. `1.0.11`), not the app version.
- The footer renders `v{__APP_VERSION__}` (Vite `define`). `vitest.config.ts`
  mirrors the same define so tests see the real version; the App footer test
  asserts the shape (`/v1\.4\./`) rather than an exact patch number.
- No lockfile is checked in (`package-lock.json` gitignored) → CI resolves deps
  fresh, so the deployed bundle hash may differ from your local `dist/`. Verify
  the deployed artifact, not just the local build.
- GitHub Pages CDN caches HTML at `max-age=600` (10 min): right after push the
  public site can serve the OLD version. Verify the deploy via the raw
  `gh-pages` branch instead:
  `https://raw.githubusercontent.com/alfred1137/modern-weather-sg/gh-pages/index.html`
- This workspace auto-formats edited files (quote style, trailing commas).
  Cosmetic churn in the diff is expected; the build gate is the real check.
