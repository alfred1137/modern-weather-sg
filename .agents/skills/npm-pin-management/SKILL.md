---
name: npm-pin-management
description: Keep the npm toolchain working for this lockfile-less project — pin the CI npm version in .github/workflows/deploy.yml, keep the dev machine's Node + npm on the same major, and verify a candidate npm against the real dependency tree before pinning. Load when CI fails with "Cannot read properties of null (reading 'edgesOut')", when bumping the npm pin, or when the dev Node/npm drift from CI.
---

# npm Pin Management — Modern Weather.sg

This project deliberately checks in **no lockfile** (`package-lock.json` is
gitignored, see `AGENTS.md`) so every install resolves the dependency tree
fresh. That makes the **npm version part of the build's contract**: some npm
releases crash on lockfile-less resolves.

## The failure this exists for

```text
npm error Cannot read properties of null (reading 'edgesOut')
```

- **Cause**: the GitHub runner's default npm (11.x at the time) crashes
  resolving this tree without a lockfile. It is **not** a dependency problem —
  the same `package.json` builds fine on the dev machine.
- **Symptom shape**: the failure happens in the `Install and Build` step's
  `npm install`, before `vite build` runs. Nothing in `src/` is involved.
- **Wrong fixes**: adding a lockfile (changes the project's install model),
  or downgrading deps to appease the resolver (treats a symptom).

## Current pin

`.github/workflows/deploy.yml`:

```yaml
- name: Install and Build 🔧
  run: |
    # Track npm current-major (12): runner-default npm 11 crashes
    # lockfile-less resolves with "Cannot read properties of null
    # (reading 'edgesOut')". sudo needed: runner npm lives in /usr/local.
    sudo npm install -g npm@12.2.0
    npm install
    npm run build
```

Two non-obvious requirements:

1. **`sudo` is mandatory.** The runner's npm lives under `/usr/local`. Without
   sudo the step dies with `EACCES: permission denied, mkdir
'/usr/local/share/man/man5'` — which looks like a workflow bug but is just a
   permissions error.
2. **Install the pin in the same step as the build.** Each `run:` block is a
   fresh shell but shares the job's filesystem, so a separate step also works —
   keep it adjacent so the pin and the install that depends on it are read
   together.

## Verify a candidate pin BEFORE shipping it

Reproduce CI's resolve locally against the real tree (nothing is written):

```sh
npm view npm version                       # current latest
npx -p npm@<version> npm install --dry-run # resolve the real dep tree
```

`--dry-run` must complete without the `edgesOut` crash, and should print the
usual "packages are looking for funding" summary. If it crashes, that npm is
not a valid pin for this project.

## Node compatibility (check before matching the dev machine)

npm releases require specific Node majors. npm 12.2.0 needs:

```text
^22.22.2 || ^24.15.0 || >=26.0.0
```

Attempting `npm i -g npm@12` on an older Node prints
`npm warn cli npm v12.2.0 does not support Node.js v24.4.1` — it runs, but is
unsupported. **Upgrade Node first, then npm**, so the dev machine matches CI:

```powershell
winget upgrade OpenJS.NodeJS.LTS      # or the MSI installer; needs admin (UAC)
node -v; npm -v
npm install -g npm@<pin>
```

There is **no version manager** on the dev machine (no nvm/fnm/volta); Node is
a system install at `C:\Program Files\nodejs`, so upgrades need elevation.

## Changing the pin (workflow)

1. `npm view npm version` — decide the new target (current major, not latest
   blindly; prefer a release whose Node range covers the dev machine).
2. `npx -p npm@<v> npm install --dry-run` — prove it resolves this tree.
3. Edit the single line in `.github/workflows/deploy.yml`, keeping `sudo` and
   the explanatory comment (update the comment if the reasoning changed).
4. Match the dev machine: upgrade Node if the range requires it, then
   `npm install -g npm@<v>`.
5. Push `main` and confirm the `Deploy to GitHub Pages` run reaches **success**
   (`gh run list --limit 3`). A pin that still crashes fails in ~15 s with the
   same `edgesOut` message.
6. Record the pin + reasoning in `AGENTS.md` (Commands/Deploy section) so the
   next agent does not "fix" it back.

## Gotchas

- **npm 12 blocks unapproved install scripts.** A fresh `npm install` prints
  `npm warn install-scripts … esbuild@0.25.12 (postinstall: node install.js)
blocked because they are not covered by allowScripts`, and suggests
  `npm install-scripts approve <pkg>`. Treat it as noise here: esbuild's binary
  arrives via the platform optional dependency, and `build` + `test` pass
  without approving anything. Do **not** reflexively approve scripts or add an
  `allowScripts` entry to satisfy the warning.
- Pushing the _same_ commit again re-runs CI (`gh run rerun <id>`), so a
  transitive-only failure can be retried once before concluding it is
  deterministic. If a rerun fails identically, it is the toolchain, not flake.
- Upgrading Node **while a dev/preview server is running kills it** (the MSI
  replaces the executable). Restart `npm run preview` afterwards; a
  `cmd /c npm run preview` wrapper can be left stuck at a
  `Terminate batch job (Y/N)?` prompt holding the port — kill that cmd, then
  relaunch.
- `npm install -g` output is noisy on Windows/PowerShell; judge success by
  `node --check`-style exit codes and `npm -v`, not by piped text.
- A green `npm install` is not proof the pin is right; the gate is
  `npm run build` **and** `npm run test` on the same toolchain.
