---
name: ship-milestone
description: Ship a change to Modern Weather.sg end-to-end: implement → version bump (delegates to the version-bump skill for the exact 3 touchpoints) → run all three quality gates → grep for stale version strings → stage explicit paths (never git add -A) → folded single commit → push → verify the deploy via the raw gh-pages branch. Use for every feature/fix/release milestone, including the 1.4.Z Refinement Series flow.
---

# Ship Milestone — Modern Weather.sg

Standard flow for every shippable change. Run in this order; each step gates
the next.

## 1. Implement

- Smallest diff that works. No new abstractions, no drive-by refactors.
- New tests for changed behavior → load the `component-tests` skill first.
- Anything touching versions → load the `version-bump` skill.

## 2. Bump (only when the bundle changes)

Two tracks, three manual edits (see `version-bump` skill for details):

1. `package.json` → `"version"` (injects the App footer via Vite `define`).
2. `README.md` → shields badge.
3. `public/sw.js` → `CACHE_NAME = 'sg-weather-vN'`.

App patch/minor/major per SemVer; SW integer bumps on EVERY bundle change —
missing it serves stale UI to returning PWA users.

## 3. Gates (all three must pass)

```sh
npm run build   # tsc --noEmit + vite build
npm run lint    # eslint . — 0 warnings
npm run test    # vitest run — all suites (50 tests / 12 suites)
```

## 4. Grep stale versions

After any bump, confirm no old strings linger in code:

```sh
rg "vX\.Y\.Z|vN|sg-weather-vN" package.json README.md public/sw.js
```

`rg` is NOT installed on the dev machine — use the grep tool or
`Select-String`. Old strings are allowed only in docs that intentionally
record history (`tasks/todo.md`, `tasks/lessons.md`, skill examples).

## 5. Stage explicit paths

Never `git add -A` or `git add .` — `package-lock.json` is gitignored but
untrusted staging can sweep in stray files.

```sh
git status --short   # eyeball the list first
git add <file> <file> ...   # only intended files
```

## 6. Folded commit + push

One commit per milestone — work AND bump folded together (no separate
"chore: bump" commit):

```sh
git commit -m "<type>: vX.Y.Z <milestone-name>, SW vN"   # e.g. "test: v1.4.5 refinement — expand view coverage, SW v24"
git push origin main   # CI (GH Actions) builds + deploys gh-pages
```

Commit message style: conventional commit prefix (`feat:`/`fix:`/`chore:`/
`test:`/`style:`), version in subject, milestone substance after the dash.

## 7. Verify the deploy (not the local build)

GitHub Pages CDN caches HTML at `max-age=600` (~10 min). Right after push the
live URL can serve the OLD bundle. Verify via the raw `gh-pages` branch:

```sh
# https://raw.githubusercontent.com/alfred1137/modern-weather-sg/gh-pages/index.html
# - check version string + bundle hash match the just-shipped build
# - no lockfile is checked in, so CI resolves deps fresh — local dist hash
#   may legitimately differ; trust the deployed artifact.
```

Wait ~10 min if the raw branch still shows the previous hash.

## Gotchas

- Three gates are independent — a green build does NOT imply green lint/test.
- `vi` restore/timer leaks can make tests pass in isolation but fail in suite —
  always run `npm run test` (full suite), never a single file, before commit.
- If a gate fails and the fix is out of scope, revert the smallest diff and
  report `regressed` rather than force-pushing past it.
