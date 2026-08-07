---
name: sg-api-key-rotation
description: Rotate the data.gov.sg API key used by the sgw-proxy Cloudflare Worker. The key lives only as the WEATHER_API_KEY Worker secret (never in source). Use when the key expires, is compromised, or needs replacing.
---

# data.gov.sg API Key Rotation — sgw-proxy Worker

All production weather requests route through the `sgw-proxy` Cloudflare Worker
(`workers/`). The data.gov.sg API key is stored as the Worker **secret**
`WEATHER_API_KEY` — it is never in source code, never in the frontend bundle.

**Current key expires: 07 Aug 2027** (1-year key). Rotate before that date.

## Prerequisites

- data.gov.sg account with API-key access: https://data.gov.sg
- Cloudflare CLI auth on this machine (OAuth token; account
  "Alfred1137@hotmail.com's Account"). `npx wrangler` runs on-demand — no global
  install needed.

## Workflow

1. **Get the new key** — data.gov.sg → sign in → API keys → generate/replace.
   Copy it to your clipboard.
2. **Verify CLI auth** (run from `workers/` so the wrangler.toml is picked up):
   ```sh
   cd D:\Git\modern-weather-sg\workers
   npx wrangler whoami
   ```
   Must print a logged-in account. If not, `npx wrangler login` (browser).
3. **Update the secret** — takes effect on the running worker immediately,
   NO redeploy needed:
   ```sh
   npx wrangler secret put WEATHER_API_KEY
   ```
   Paste the new key at the prompt.
4. **Confirm the binding**:
   ```sh
   npx wrangler secret list   # expect: WEATHER_API_KEY, type secret_text
   ```
5. **Verify end-to-end** (worker fetches upstream with the key on cache miss):
   ```powershell
   (Invoke-RestMethod "https://sgw-proxy.alfred1137.workers.dev/api/two-hr-forecast").data.items[0].update_timestamp
   ```
   Expect a real timestamp. A `500` body of `WEATHER_API_KEY secret not set`
   means the secret didn't bind — re-run step 3.
6. **Optional** — check the other endpoints return 200:
   `two-hr-forecast`, `twenty-four-hr-forecast`, `four-day-outlook`,
   `weather/flood-alerts`.
7. **Update expiry bookkeeping** — change the "Current key expires" line above.

## Gotchas (from experience)

- Secret name is exact: `WEATHER_API_KEY`. A typo = 500 "secret not set".
- The worker caches upstream responses for `TTL_SEC = 300` (5 min). After
  rotation, cached data stays valid until TTL expiry; the new key is used on the
  next cache-miss upstream fetch. No cache purge is needed for a normal rotation.
- The key never goes in `workers/src/index.js`, a `.env` file, or any committed
  file — only the Worker secret.
- Do not commit `package-lock.json` (project convention: no lockfile checked in).
- If the live site shows "Sync error" after rotation: the frontend stale-fallback
  keeps showing last-known data (never a hard crash), so the failure mode is
  quiet — always run step 5's verification explicitly.
- CORS on the worker is `Access-Control-Allow-Origin: *` (public weather data;
  exact-origin echo is racy with Cloudflare's edge cache). Do not "harden" it
  back to a single origin — the data is public and the key never leaves the server.
- Verification gotcha: GitHub Pages CDN caches the site's HTML for up to 10 min;
  when checking the live site use a hard refresh (`Ctrl+Shift+R`) or the raw
  `gh-pages` branch.

## Expiry tracking

- Set a calendar reminder ~1 month before expiry (current: 07 Aug 2027).
- After each rotation, update the expiry date in this skill.
