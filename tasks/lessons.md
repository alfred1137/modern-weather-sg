# Lessons & future-session improvements

Captured during the v1.0.0 release + sgw-proxy Cloudflare Worker migration.
These are **room for improvement notes** — do not implement yet; review at the
start of the next session.

## Near-misses / mistakes we caught (and why they stayed caught)

- **SW cache version drift** — the `v14`→`v15` bump touches **4 places**
  (`index.html` x3 + `public/sw.js`). Missing any one leaves a stale cache purge
  and users keep the old bundle. Caught by grep-verify; should not rely on
  manual grep.
- **Footer-vs-package version mismatch** — `App.tsx` footer showed `v0.9.1`
  while `package.json` was already `1.0.0`. Caught during the release build.
- **No lockfile** — local `dist/` hash differed from the GitHub Pages bundle
  because CI resolved deps fresh (no lockfile checked in). Verification against
  `raw.githubusercontent.com/.../gh-pages/index.html` was required to confirm.
- **"Sync error" is silent** — the frontend stale-fallback hides API failures
  (shows last-known data). Only explicit worker endpoint verification revealed
  the key binding state.
- **CORS `*` is intentional** — public weather data; the key never leaves the
  worker. A future pass that "tightens" CORS to one origin is an anti-pattern
  here (and breaks the GH Pages deployment origin). Tag in code comments.

## Room for improvement (future session)

### 1. Single source of truth for the SW cache version (kills the 4-spot drift)

Today the integer is hand-echoed into `index.html` (manifest `?v=`, SW register
`?v=`, console log) + `public/sw.js` `CACHE_NAME`.

Improvement: one constant drives all of them.

- Put the SW version in a build-time define and inject into `index.html` via
  the Vite template (not the current inline-JS string concat).
- Have `sw.js` read the same define.
- Candidate tool: `vite-plugin-pwa` / `vite-plugin-workbox` to generate `sw.js`
  from a `src/` entry — removes the standalone `public/sw.js` and the 4 spots.
- Trade-off to weigh: `public/sw.js` is plain browser JS with zero config
  (current). Switching to a generated SW adds a plugin dep + a tiny build
  pipeline. Keep simple for a hobby PWA, but the drift class is real.

### 2. Derive the footer version from package.json (kills footer/package drift)

`App.tsx` duplicates the version as a string. Wire it via Vite:
`define: { 'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version) }`
so the footer reads `v${import.meta.env.VITE_APP_VERSION}` and can never drift
from `package.json`.

### 3. Scripted version bump (kills the 7-edit release)

A `scripts/bump-version.mjs` taking `<appVersion> <swVersion>` args, rewriting
`package.json`, `App.tsx`, `README.md`, `index.html` (3 spots), and
`public/sw.js`, then running `npm run build`. Expose as `npm run bump-version`.

- Must still leave the human to run `npm run build` and push — the script just
  removes transcription errors.
- Watch out: auto-formatter churn on edited lines is cosmetic noise only.

### 4. API-key expiry tracking (currently manual)

Expiry lives only as prose in `sg-api-key-rotation/SKILL.md` ("07 Aug 2027").

Improvement: machine-trackable expiry so it can't silently lapse.

- Add `WEATHER_API_KEY_EXPIRY=2027-08-07` to the worker (non-secret config or a
  `docs/api-key-expiry.md`), and a GitHub Action / cron (`on.schedule`) that
  opens an issue or fails 1 month before expiry.
- Or a tiny `scripts/check-api-key-expiry.mjs` run in CI.

### 5. Commit a lockfile (reproducible CI deploys)

No lockfile is checked in by convention, causing the local-vs-CI hash gap.
Evaluate committing `package-lock.json` (or migrating to `pnpm-lock.yaml`) for
deterministic builds and a trustworthy `dist/`. Trade-off: repo size, but for a
deployed PWA the determinism is worth it.

### 6. Pre-commit formatting (cosmetic diff noise)

Workspace auto-formats (quote style, trailing commas) on each edit, producing
noisy diffs. Add `.editorconfig` + a formatter config so version-bump script
edits match house style in one pass. Low priority.

### 7. Remove the dead `@google/genai` dependency

`@google/genai` (package.json line 9, pinned to `"latest"`) is **never imported**
anywhere in `src/` — confirmed via grep. It is vestigial from the early
AI-fuse experiment. Future session: `npm uninstall @google/genai` and rebuild.
Risk: `"latest"` is a moving target (major bumps publish without notice), so it
silently pulls unrelated package versions into CI installs. Low lift, worth
doing.

### 8. Automated SW cache-purge verification (optional)

Today we verify cache purge by manual DevTools inspection. A future session
could add a small playwright/`@openfga` script that loads the deployed page in
a fresh context and asserts no pre-bump cache entries remain. Overkill for
hobby scale; leave as an explicit manual check for now.

## De-slop session (2026-08) — caught during the kill-ai-slop pass

- **Editor save-hook reformats on every save** — this repo's workspace runs
  prettier on save (semicolon stripping, quote normalization, line wrapping).
  Editing a file twice with `edit` breaks on the second oldString because the
  hook rewrote the file between saves. Fix: write the FULL file in one pass
  (`write`), in prettier-canonical style, instead of many small edits. Expect
  the hook's normalization in the diff — it is repo-style, not damage.
- **Tests assert on UI copy** — `test/NowcastView.test.tsx` matches exact
  strings ("Tap Icons", "SEARCH AREA..."). Changing copy without updating
  tests fails CI. When de-slopping copy, grep `test/` for the old string.
- **Catppuccin is the design system here, not slop** — `rounded-2xl`, `bg-blue`
  accent, `.glass` on chrome, and the signature `font-black uppercase` h1s are
  deliberate app identity. The kill-ai-slop scanner still flags them; triage
  with the taxonomy (functional circle = fine; decorative glow = kill) instead
  of mechanically applying the skill.
- **Data sublines are semantic, not kickers** — "2-hour nowcast: 14:00 ~ 16:00",
  "Latest observation: …", and the PSI/F4D kicker lines (the latter two were
  empty filler and removed) differ. Verify a subline carries data before
  deleting it.

## Files that encode these gotchas (update when you act)

- `.agents/skills/version-bump/SKILL.md` — 4-spot SW constraint, CDN cache.
- `.agents/skills/sg-api-key-rotation/SKILL.md` — secret name, TTL, silent
  "Sync error" failure mode, CORS-wildcard rationale.
