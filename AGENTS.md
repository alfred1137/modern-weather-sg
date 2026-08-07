# AGENTS.md — modern-weather-sg

Hobbyist React PWA (Vite + TypeScript) reimagining Singapore weather data.
**No tests, no lint, no formatter.** `npm run build` is the only quality gate
(`tsc` typecheck with `noEmit: true`, then `vite build` → `dist/`).

## Commands

| Command           | What                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------- |
| `npm install`     | Install deps. **No lockfile is checked in** → resolves fresh each time (CI relies on this). |
| `npm run dev`     | Vite dev server with HMR.                                                                   |
| `npm run build`   | `tsc && vite build` — typecheck + bundle → `dist/`. **This is the gate.**                   |
| `npm run preview` | Serve `dist/` locally.                                                                      |
| `npm run deploy`  | `gh-pages -d dist` — manual deploy to `gh-pages` branch.                                    |

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
  Radar/map image filters differ per theme (see `RainAreasView`/`NowcastView`).
- **PWA/SW version string** — the version number in `index.html` appears in 3
  spots and **must be bumped together**: the manifest link `?v=N`, the SW register
  `./sw.js?v=N&t=...`, and the console log `Service Worker active (vN)`. Source
  assets are `public/sw.js` and `public/manifest.json`.
- **External images are not in the repo.** Radar base map, rain overlays, MRT map,
  and the Singapore background map load from `weather.gov.sg`. A broken image is
  an upstream outage, not a code bug.
- **`vite.config.ts` sets `base: './'`** for GitHub Pages subfolder deploy.
  Do not change it to a root path.
- **Data refresh timing**: `App.tsx` refetches all data every `300000` ms (5 min);
  `RainAreasView` regenerates the radar history grid every `60000` ms (60 s).
- **Dead dependency**: `@google/genai` is in `package.json` but never imported.
  Ignore it; it is harmless.
- **`index.html` has an `<script type="importmap">`** mapping `react`/`react-dom`/
  `vite` to `esm.sh` CDN URLs. This is vestigial — Vite intercepts bare imports
  in dev and bundles in build, so it has no runtime effect. Leave it unless you are
  removing it intentionally.

## Conventions

- TypeScript strict mode (`tsconfig.json`, `strict: true`).
- Tailwind tokens use Catppuccin names (`text-blue`, `bg-surface0`, `text-overlay1`,
  `text-subtext0`, …) mapped to `--{token}-rgb` vars — prefer existing tokens.
- Components are default-exported `React.FC`s with a `Props` interface.
- The 47 area names in `AREA_COORDINATES` (`constants.tsx`) must match the keys
  used in forecasts; adding an area to a view also requires its coordinate entry.

## Verification

- Type-level: `npx tsc --noEmit` (same as the `tsc` step in `npm run build`).
- Build: `npm run build` then `npm run preview` to sanity-check the served output.
