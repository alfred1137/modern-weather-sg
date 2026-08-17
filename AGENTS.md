# AGENTS.md — modern-weather-sg

Hobbyist React PWA (Vite + TypeScript) reimagining Singapore weather data.
Quality gates: `npm run build` (tsc typecheck with `noEmit: true` + `vite build`
→ `dist/`), `npm run lint` (eslint — must stay at 0 warnings), `npm run test`
(vitest + testing-library, 50 tests across 12 suites). No formatter in the
gate; `npm run format` exists for manual prettier runs.

## Commands

| Command               | What                                                                                                                                                                                                                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm install`         | Install deps. **No lockfile is checked in** (`package-lock.json` gitignored) → resolves fresh each time (CI relies on this).                                                                                                                                                           |
| `npm run dev`         | Vite dev server with HMR.                                                                                                                                                                                                                                                              |
| `npm run build`       | `tsc && vite build` — typecheck + bundle → `dist/`. **Primary gate.**                                                                                                                                                                                                                  |
| `npm run lint`        | `eslint .` — **gate**, must be clean.                                                                                                                                                                                                                                                  |
| `npm run test`        | `vitest run` — **gate**, must pass (50 tests / 12 suites).                                                                                                                                                                                                                             |
| `npm run format`      | `prettier --write .` — manual only, not part of the gate.                                                                                                                                                                                                                              |
| `npm run design:lint` | `designmd lint DESIGN.md` — validates the DESIGN.md design-system spec (token refs, contrast, structure). Manual only, not part of the gate. `designmd` alias is used instead of the package's `design.md` bin — the `.md` suffix collides with the Windows Markdown file association. |
| `npm run preview`     | Serve `dist/` locally.                                                                                                                                                                                                                                                                 |
| `npm run deploy`      | `gh-pages -d dist` — manual deploy to `gh-pages` branch.                                                                                                                                                                                                                               |

Deploy via CI: pushing to `main` triggers `.github/workflows/deploy.yml`
(`npm install` → `npm run build` → deploys `dist/` via `JamesIves/github-pages-deploy-action`).

## Architecture

- **Entry**: `index.tsx` → `App.tsx` (root). Data is fetched once in `App.tsx`
  via `services/weatherService.ts` and passed down as props to view components.
- **No router** — single page; tabs are an `AppTab` enum (`types.ts`) that drives
  `renderContent()` in `App.tsx`.
- **Data layer**: `services/weatherService.ts` → `https://api-open.data.gov.sg/v2/real-time/api`
  (NEA: 2-hour nowcast, 24h forecast, 4-day outlook; PUB: flood alerts).
- **Views** (`components/`): `NowcastView`, `RainAreasView`, `FloodWarningView`,
  `Forecast24hView`, `Forecast4DayView`.
- **Shared** (`components/`): `Navigation`, `ThemeToggle`, `LegendModal`, `SyncFooter`.
- **Types**: all domain types + `AppTab` enum live in `types.ts`.
- **Constants**: weather icon map (FontAwesome + Catppuccin colors), the 47
  Singapore `AREA_COORDINATES`, and `SG_REGIONS` live in `constants.tsx`.

## Critical quirks (agents miss these)

- **Tailwind runs from CDN**. `index.html` loads `https://cdn.tailwindcss.com`.
  There is **no** `tailwind.config.js` or `postcss.config.js`. The Tailwind theme
  is the **inline `tailwind.config = {...}`** block in `index.html`. To add a color
  token, edit that inline config **and** add the matching `--{name}-rgb` CSS var
  in the `:root` / `[data-theme="latte"]` blocks in `index.html`.
- **Catppuccin theming** toggles `data-theme="macchiato"|"latte"` on `<html>`,
  persisted in `localStorage` key **`catppuccin-theme`**. Logic in
  `context/ThemeContext.tsx`; the 48 color RGB vars are in `index.html <style>`.
  Radar/map image filters differ per theme: F24h/PSI/Nowcast share
  `getMapImageStyle(theme)` in `constants.tsx`; RainAreasView keeps its own.
- **Versioning is single-source (two tracks).** App version: `package.json`
  `"version"` only — `vite.config.ts` `define`s `__APP_VERSION__` into the
  `App.tsx` footer, so never hand-edit the footer. The README badge is the only
  other place the app version appears. SW cache version: `public/sw.js`
  `CACHE_NAME` only (bump it whenever the bundle changes). `index.html` carries
  no version strings — the SW register uses only `t=Date.now()` to bypass HTTP
  caching, and the manifest link is unversioned.
- **Base map images are bundled in `public/`.** The `rain-lighting_map_988`,
  `base-853`, `240km-v2`, and `MRT` images ship with the project. Only the
  dynamic radar overlays (`dpsri_*`) load from `weather.gov.sg` at runtime.
- **`vite.config.ts` sets `base: './'`** for GitHub Pages subfolder deploy.
  Do not change it to a root path.
- **Data refresh timing**: `App.tsx` refetches all data every `300000` ms (5 min);
  `RainAreasView` regenerates the radar history grid every `60000` ms (60 s).
- **`index.html` has an `<script type="importmap">`** mapping `react`/`react-dom`/
  `vite` to `esm.sh` CDN URLs. This is vestigial — Vite intercepts bare imports
  in dev and bundles in build, so it has no runtime effect. Leave it unless you are
  removing it intentionally.
- **`rg` is not installed on the dev machine.** Use the grep tool (or
  `Select-String`) for content searches; shell pipelines with `rg` will fail.
- **`vitest.config.ts` mirrors the Vite `define`** (`__APP_VERSION__` from
  `package.json`) so tests see the real footer version. Keep both configs in
  sync when the define changes.
- **Component test conventions** (ThemeProvider wrapper, `data-theme` reset,
  `vi.mock` paths, fixtures) are documented in the `component-tests` skill —
  load it before writing or modifying tests.

## Conventions

- TypeScript strict mode (`tsconfig.json`, `strict: true`).
- Tailwind tokens use Catppuccin names (`text-blue`, `bg-surface0`, `text-overlay1`,
  `text-subtext0`, …) mapped to `--{token}-rgb` vars — prefer existing tokens.
- Components are default-exported `React.FC`s with a `Props` interface.
- The 47 area names in `AREA_COORDINATES` (`constants.tsx`) must match the keys
  used in forecasts; adding an area to a view also requires its coordinate entry.

## Verification

- Gates (all three must pass before commit): `npm run build`, `npm run lint`,
  `npm run test`.
- **DESIGN.md is the normative design target** (project root, Google's
  DESIGN.md format — tokens in YAML front matter, rationale in prose). The
  UI code must conform to it; `npm run design:lint` catches broken token
  refs and non-conforming component contrast. When changing UI styles,
  update DESIGN.md and the code together — never let the file become a
  snapshot of stale choices.
- Version bumps: grep for stale strings after editing (`vX.Y.Z`, `vN`,
  `sg-weather-vN`) — see the `version-bump` skill.

## Workflow: preview before push

For UI/design changes, follow this sequence before committing:

1. Edit code + DESIGN.md.
2. Run all gates: `npm run build` → `npm run lint` → `npm run test` →
   `npm run design:lint`.
3. Run `npm run preview` — serves `dist/` locally (usually `localhost:4173`).
4. User inspects at localhost. **Do not commit or push until the user
   confirms the result.**
5. Only after confirmation: version bump → commit → push.

This avoids pushing half-baked UI to GitHub Pages. The preview server
is the source of truth for visual approval; CI deploy is the formality.

- Deploy: pushing to `main` triggers CI. GitHub Pages CDN caches HTML at
  `max-age=600` (~10 min), so verify via the raw `gh-pages` branch, not the
  live URL:
  `https://raw.githubusercontent.com/alfred1137/modern-weather-sg/gh-pages/index.html`
- Manual deploy fallback: `npm run deploy` (builds first via `predeploy`).
