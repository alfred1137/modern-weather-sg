// sgw-proxy — Cloudflare Worker that proxies the data.gov.sg real-time weather
// API for the modern-weather-sg GitHub Pages PWA.
//
// Why this worker exists:
//  The PWA's browser fetches weather from https://api-open.data.gov.sg/...  with
//  NO api key, burning through the shared anonymous quota on traffic bursts and
//  surfacing "Sync error" to visitors. This worker injects a data.gov.sg API key
//  (stored as the WEATHER_API_KEY secret) and caches each endpoint for 5 minutes,
//  so a burst of viewers costs ONE upstream request per 5-minute window.
//
// Route:  GET /api/<endpoint>  ->  https://api-open.data.gov.sg/v2/real-time/api/<endpoint>
//
// Deploy (from this dir):
//   npx wrangler login
//   npx wrangler secret put WEATHER_API_KEY   # paste your data.gov.sg key
//   npx wrangler deploy
//
// NOTE: data.gov.sg sits behind a CDN, so upstream fetch() responses can carry
// IMMUTABLE headers — calling response.headers.set() on them throws
// "Can't modify immutable headers". To stay safe we never mutate any
// Response.headers; we always build fresh responses from plain header objects.

const UPSTREAM = "https://api-open.data.gov.sg/v2/real-time/api";
const TTL_SEC = 300; // 5 minutes — matches App.tsx auto-refresh + NEA data cadence

// CORS: we reply `Access-Control-Allow-Origin: *` for ALL origins, not an exact
// echo. Reasons:
//  1. The data is PUBLIC (anyone can fetch it anonymously from data.gov.sg), so
//     `*` exposes nothing. The API key stays server-side as a Worker secret.
//  2. Exact-origin echo is racy here: Cloudflare's edge serves cached worker
//     responses WITHOUT re-running the worker, freezing the ACAO of whichever
//     origin hit first for up to TTL_SEC. `*` makes every origin work regardless
//     of cache state (prod GH-Pages site, localhost vite dev 5173 / preview 4173).
//  3. The app's fetch is a simple no-credential GET, so `*` satisfies CORS.
const CORS_ORIGIN = "*";

// Plain-object headers used for every browser-facing response (CORS + no store).
function browserHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Headers": "x-api-key, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Cache-Control": "no-store, max-age=0",
    ...extra,
  };
}

// Upstream (data.gov.sg is CDN-served) sends its own CORS headers
// (e.g. `Access-Control-Allow-Origin: *`). If we forward those AND add ours,
// the response carries a comma-joined ACAO like `*, https://alfred1137.github.io`,
// which browsers reject (it matches neither `*` nor the exact origin).
// So we strip ALL upstream CORS headers and emit only our own.
const UPSTREAM_CORS_KEYS = new Set([
  "access-control-allow-origin",
  "access-control-allow-credentials",
  "access-control-allow-headers",
  "access-control-allow-methods",
  "access-control-max-age",
  "access-control-expose-headers",
]);

// Build a brand-new Response from a plain-object headers map (copying the
// source's non-CORS headers into a plain object, never mutating .headers).
function fromResponse(resp, extra = {}) {
  const headers = {};
  if (resp && resp.headers) {
    resp.headers.forEach((value, key) => {
      if (!UPSTREAM_CORS_KEYS.has(key.toLowerCase())) {
        headers[key] = value;
      }
    });
  }
  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: { ...headers, ...extra },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight — answer immediately, no upstream call.
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: browserHeaders(),
      });
    }

    // Accept only /api/<endpoint>.
    if (!url.pathname.startsWith("/api/")) {
      return new Response("Not found", {
        status: 404,
        headers: browserHeaders(),
      });
    }

    const endpoint = url.pathname.replace(/^\/api\//, "");
    const target = `${UPSTREAM}/${endpoint}${url.search}`;
    const cacheKey = new Request(target, { method: "GET" });
    const cache = caches.default;

    // 1) Cache lookup (Cache API). Manual TTL via the x-sgw-cached-at header.
    let cached;
    try {
      cached = await cache.match(cacheKey);
    } catch {
      cached = null;
    }

    if (cached) {
      const ts = Number(cached.headers.get("x-sgw-cached-at") || "0");
      const age = Date.now() / 1000 - ts;

      if (age < TTL_SEC) {
        // Fresh: serve it (rebuilt with browser headers).
        return fromResponse(cached, browserHeaders());
      }

      // Stale: serve the cached copy immediately (no upstream hit) and refresh
      // the cache in the background so the next caller is fresh.
      ctx.waitUntil(
        fetchAndCache(target, cacheKey, env, cache).catch(() => {}),
      );
      return fromResponse(cached, browserHeaders());
    }

    // 2) Cache miss: fetch now with the key, cache it, return to browser.
    const upstream = await fetchAndCache(target, cacheKey, env, cache);
    return fromResponse(upstream, browserHeaders());
  },
};

// Fetches the real API with the key, stores it in the Cache API (with a
// timestamp header so we can enforce TTL), and returns the response.
// On failure it returns a Response (never throws). Forwards upstream status
// codes such as 429 to the caller so the frontend can apply its stale fallback.
async function fetchAndCache(target, cacheKey, env, cache) {
  if (!env.WEATHER_API_KEY) {
    return new Response("WEATHER_API_KEY secret not set", { status: 500 });
  }

  let upstream;
  try {
    upstream = await fetch(target, {
      headers: { "x-api-key": env.WEATHER_API_KEY },
    });
  } catch {
    return new Response("Upstream unreachable", { status: 502 });
  }

  if (!upstream.ok) {
    try {
      await cache.delete(cacheKey);
    } catch {}
    return upstream; // caller wraps with browserHeaders()
  }

  // Build a storable copy stamped with the fetch time (fresh, mutable headers).
  // CORS is included so even a direct edge-cache serve of this copy allows any
  // origin (the edge can serve cache.put() entries without running the worker).
  const stamped = fromResponse(upstream, {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "x-sgw-cached-at": String(Date.now() / 1000),
  });
  try {
    // put() consumes the clone; stamped's own body stays readable for the caller.
    await cache.put(cacheKey, stamped.clone());
  } catch {}

  return stamped; // caller wraps with browserHeaders() and serves to browser
}
