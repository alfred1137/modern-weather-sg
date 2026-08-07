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
