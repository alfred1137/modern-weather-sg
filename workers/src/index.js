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
// Route:  GET /mycmaq/latest                     ->  { cycle, displayUrl, manifestUrl }
// Route:  GET /mycmaq/frames?cycle=&var=&domain= ->  { cycle, variable, domain, count, frames[] }
// Route:  GET /mycmaq/image/<cycle>/<file>       ->  proxied forecast PNG (6h cache)
//
// MyCMAQ (Malaysian Meteorological Department) publishes NO JSON API — only
// static PNGs + a viewer page + manifest.json per daily cycle. The browser
// cannot reliably scrape those (CORS + no `latest` alias), so this worker
// resolves a usable cycle, filters the manifest to PM2.5 / Domain 02
// (Malaysia), and serves cacheable JSON + image bytes to the PWA.
//
// Cycle selection: a cycle's frame window is a function of its DATE — cycle
// `D` covers [D+1 08:00, D+6 07:00] LST (120 hourly frames; verified across
// 5 consecutive cycles). The newest cycle in the viewer index therefore
// usually starts in the FUTURE, so picking it blindly made the PWA open on a
// frame hours ahead of "now" (the 17 Oct 06:00 bug: newest cycle
// `20261016_00` begins 17 Oct 08:00). We instead pick the newest cycle whose
// window has already STARTED (first frame <= now), which is the last date's
// cycle until the next window opens.
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

const UPSTREAM = 'https://api-open.data.gov.sg/v2/real-time/api'
const TTL_SEC = 300 // 5 minutes — matches App.tsx auto-refresh + NEA data cadence

// MyCMAQ (MetMalaysia) — daily forecast cycles, hourly PNG frames.
// 6h cache: cycles refresh ~daily, frames are immutable once published.
const MYCMAQ_BASE = 'https://mycmaq.met.gov.my'
const MYCMAQ_TTL_SEC = 21600
const MYCMAQ_DEFAULT_VAR = 'PM25_TOT' // PM2.5 filenames carry a _TOT suffix
const MYCMAQ_DEFAULT_DOMAIN = 'd02' // d01 = Southeast Asia, d02 = Malaysia
const MYCMAQ_FILE_RE = /^([A-Za-z0-9_]+)_d0[12]_\d{8}_\d{2}LST\.png$/
const MYCMAQ_FRAME_RE = /_(\d{8})_(\d{2})LST\.png$/

// CORS: we reply `Access-Control-Allow-Origin: *` for ALL origins, not an exact
// echo. Reasons:
//  1. The data is PUBLIC (anyone can fetch it anonymously from data.gov.sg), so
//     `*` exposes nothing. The API key stays server-side as a Worker secret.
//  2. Exact-origin echo is racy here: Cloudflare's edge serves cached worker
//     responses WITHOUT re-running the worker, freezing the ACAO of whichever
//     origin hit first for up to TTL_SEC. `*` makes every origin work regardless
//     of cache state (prod GH-Pages site, localhost vite dev 5173 / preview 4173).
//  3. The app's fetch is a simple no-credential GET, so `*` satisfies CORS.
const CORS_ORIGIN = '*'

// Plain-object headers used for every browser-facing response (CORS + no store).
function browserHeaders(extra = {}) {
  return {
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Headers': 'x-api-key, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'no-store, max-age=0',
    ...extra,
  }
}

// Upstream (data.gov.sg is CDN-served) sends its own CORS headers
// (e.g. `Access-Control-Allow-Origin: *`). If we forward those AND add ours,
// the response carries a comma-joined ACAO like `*, https://alfred1137.github.io`,
// which browsers reject (it matches neither `*` nor the exact origin).
// So we strip ALL upstream CORS headers and emit only our own.
const UPSTREAM_CORS_KEYS = new Set([
  'access-control-allow-origin',
  'access-control-allow-credentials',
  'access-control-allow-headers',
  'access-control-allow-methods',
  'access-control-max-age',
  'access-control-expose-headers',
])

// Build a brand-new Response from a plain-object headers map (copying the
// source's non-CORS headers into a plain object, never mutating .headers).
function fromResponse(resp, extra = {}) {
  const headers = {}
  if (resp && resp.headers) {
    resp.headers.forEach((value, key) => {
      if (!UPSTREAM_CORS_KEYS.has(key.toLowerCase())) {
        headers[key] = value
      }
    })
  }
  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: { ...headers, ...extra },
  })
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // CORS preflight — answer immediately, no upstream call.
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: browserHeaders(),
      })
    }

    // MyCMAQ routes — no API key needed (MetMalaysia static files are public).
    if (url.pathname.startsWith('/mycmaq/')) {
      return handleMycmaq(request, url, ctx)
    }

    // Accept only /api/<endpoint>.
    if (!url.pathname.startsWith('/api/')) {
      return new Response('Not found', {
        status: 404,
        headers: browserHeaders(),
      })
    }

    const endpoint = url.pathname.replace(/^\/api\//, '')
    const target = `${UPSTREAM}/${endpoint}${url.search}`
    const cacheKey = new Request(target, { method: 'GET' })
    const cache = caches.default

    // 1) Cache lookup (Cache API). Manual TTL via the x-sgw-cached-at header.
    let cached
    try {
      cached = await cache.match(cacheKey)
    } catch {
      cached = null
    }

    if (cached) {
      const ts = Number(cached.headers.get('x-sgw-cached-at') || '0')
      const age = Date.now() / 1000 - ts

      if (age < TTL_SEC) {
        // Fresh: serve it (rebuilt with browser headers).
        return fromResponse(cached, browserHeaders())
      }

      // Stale: serve the cached copy immediately (no upstream hit) and refresh
      // the cache in the background so the next caller is fresh.
      ctx.waitUntil(fetchAndCache(target, cacheKey, env, cache).catch(() => {}))
      return fromResponse(cached, browserHeaders())
    }

    // 2) Cache miss: fetch now with the key, cache it, return to browser.
    const upstream = await fetchAndCache(target, cacheKey, env, cache)
    return fromResponse(upstream, browserHeaders())
  },
}

// Fetches the real API with the key, stores it in the Cache API (with a
// timestamp header so we can enforce TTL), and returns the response.
// On failure it returns a Response (never throws). Forwards upstream status
// codes such as 429 to the caller so the frontend can apply its stale fallback.
async function fetchAndCache(target, cacheKey, env, cache) {
  if (!env.WEATHER_API_KEY) {
    return new Response('WEATHER_API_KEY secret not set', { status: 500 })
  }

  let upstream
  try {
    upstream = await fetch(target, {
      headers: { 'x-api-key': env.WEATHER_API_KEY },
    })
  } catch {
    return new Response('Upstream unreachable', { status: 502 })
  }

  if (!upstream.ok) {
    try {
      await cache.delete(cacheKey)
    } catch {}
    return upstream // caller wraps with browserHeaders()
  }

  // Build a storable copy stamped with the fetch time (fresh, mutable headers).
  // CORS is included so even a direct edge-cache serve of this copy allows any
  // origin (the edge can serve cache.put() entries without running the worker).
  const stamped = fromResponse(upstream, {
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'x-sgw-cached-at': String(Date.now() / 1000),
  })
  try {
    // put() consumes the clone; stamped's own body stays readable for the caller.
    await cache.put(cacheKey, stamped.clone())
  } catch {}

  return stamped // caller wraps with browserHeaders() and serves to browser
}

// ---- MyCMAQ (MetMalaysia) ----
// No API key: upstream files are public static PNGs + manifest.json.
// All three routes share the 6h stale-while-revalidate cache pattern.

function mycmaqJson(data, extra = {}, cacheControl = 'public, max-age=21600, immutable') {
  // Frames + images are immutable per cycle (never re-rendered), so browsers
  // may cache them for the full worker TTL. This keeps repeat views (and the
  // view's frame preloader) off the worker's request count. /latest is the
  // only mutable route — callers pass a short max-age for it.
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: browserHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': cacheControl,
      ...extra,
    }),
  })
}

// Browser-facing headers for proxied PNGs: immutable per cycle, same
// reasoning as mycmaqJson. Overrides the default no-store (which exists for
// the rapidly-changing data.gov.sg endpoints, not for static forecast art).
function mycmaqImageHeaders() {
  return { ...browserHeaders(), 'Cache-Control': 'public, max-age=21600, immutable' }
}

function mycmaqError(message, status = 502) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: browserHeaders({ 'Content-Type': 'application/json' }),
  })
}

async function handleMycmaq(request, url, ctx) {
  const cache = caches.default
  const path = url.pathname

  if (path === '/mycmaq/latest') {
    const cacheKey = new Request(`${MYCMAQ_BASE}/__sgw_latest__`, { method: 'GET' })
    let cached = null
    try {
      cached = await cache.match(cacheKey)
    } catch {
      cached = null
    }
    if (cached) {
      const age = Date.now() / 1000 - Number(cached.headers.get('x-sgw-cached-at') || '0')
      if (age < MYCMAQ_TTL_SEC) return fromResponse(cached, browserHeaders())
      ctx.waitUntil(resolveLatestCycle(cache, cacheKey).catch(() => {}))
      return fromResponse(cached, browserHeaders())
    }
    const fresh = await resolveLatestCycle(cache, cacheKey)
    if (!fresh.ok) return mycmaqError('MyCMAQ index unreachable', fresh.status || 502)
    return mycmaqJson(
      fresh.data,
      { 'x-sgw-cached-at': String(Date.now() / 1000) },
      'public, max-age=600',
    )
  }

  if (path === '/mycmaq/frames') {
    const cycleParam = url.searchParams.get('cycle')
    const variable = url.searchParams.get('var') || MYCMAQ_DEFAULT_VAR
    const domain = url.searchParams.get('domain') || MYCMAQ_DEFAULT_DOMAIN
    if (cycleParam && !/^\d{8}_\d{2}$/.test(cycleParam)) return mycmaqError('Invalid cycle', 400)
    // Cache scope is per-cycle when pinned, else a single 'latest' slot: the
    // resolved cycle is not known until after the (cacheable) manifest scan,
    // and re-resolving on every hit would defeat the cache. The 'latest' slot's
    // cycle still covers "now" for the whole 6h TTL, so this is safe.
    const cacheKey = new Request(
      `${MYCMAQ_BASE}/__sgw_frames_${cycleParam || 'latest'}_${variable}_${domain}__`,
      { method: 'GET' },
    )
    let cached = null
    try {
      cached = await cache.match(cacheKey)
    } catch {
      cached = null
    }
    if (cached) {
      const age = Date.now() / 1000 - Number(cached.headers.get('x-sgw-cached-at') || '0')
      if (age < MYCMAQ_TTL_SEC) return fromResponse(cached, browserHeaders())
      ctx.waitUntil(resolveFrames(cycleParam, variable, domain, cache, cacheKey).catch(() => {}))
      return fromResponse(cached, browserHeaders())
    }
    const fresh = await resolveFrames(cycleParam, variable, domain, cache, cacheKey)
    if (!fresh.ok)
      return mycmaqError(fresh.error || 'MyCMAQ manifest unreachable', fresh.status || 502)
    return mycmaqJson(fresh.data, { 'x-sgw-cached-at': String(Date.now() / 1000) })
  }

  const imgMatch = path.match(/^\/mycmaq\/image\/(\d{8}_\d{2})\/([^/]+)$/)
  if (imgMatch) {
    const [, cycle, file] = imgMatch
    if (!MYCMAQ_FILE_RE.test(file)) return mycmaqError('Invalid frame file', 400)
    const target = `${MYCMAQ_BASE}/${cycle}/${file}`
    const cacheKey = new Request(target, { method: 'GET' })
    let cached = null
    try {
      cached = await cache.match(cacheKey)
    } catch {
      cached = null
    }
    if (cached) {
      const age = Date.now() / 1000 - Number(cached.headers.get('x-sgw-cached-at') || '0')
      if (age < MYCMAQ_TTL_SEC) return fromResponse(cached, mycmaqImageHeaders())
      ctx.waitUntil(fetchAndCacheImage(target, cacheKey, cache).catch(() => {}))
      return fromResponse(cached, mycmaqImageHeaders())
    }
    const fresh = await fetchAndCacheImage(target, cacheKey, cache)
    return fromResponse(fresh, mycmaqImageHeaders())
  }

  return new Response('Not found', { status: 404, headers: browserHeaders() })
}

// Scrape the MyCMAQ viewer index for published cycle ids, ascending.
async function fetchCycleList() {
  try {
    const res = await fetch(`${MYCMAQ_BASE}/`, { headers: { 'User-Agent': 'sgw-proxy' } })
    if (!res.ok) return null
    const html = await res.text()
    const cycles = [
      ...new Set([...html.matchAll(/display_(\d{8}_\d{2})\.html/g)].map((m) => m[1])),
    ].sort()
    return cycles.length > 0 ? cycles : null
  } catch {
    return null
  }
}

// Probe order for cycle resolution: newest cycle DATE first (latest run, then
// its same-window sibling). A cycle's frame window depends on its date only, so
// probing one date at a time keeps the scan to ~2 manifest fetches; the sibling
// run stays as a fallback in case one run's manifest is malformed.
function candidateCycles(cycles) {
  const runsByDate = new Map()
  for (const cycle of cycles) {
    const date = cycle.slice(0, 8)
    if (!runsByDate.has(date)) runsByDate.set(date, [])
    runsByDate.get(date).push(cycle)
  }
  return [...runsByDate.keys()]
    .sort()
    .reverse()
    .flatMap((date) => runsByDate.get(date).sort().reverse())
}

// Fetch + parse a cycle manifest's file list; null when unreachable/malformed.
async function fetchManifest(cycle) {
  try {
    const res = await fetch(`${MYCMAQ_BASE}/${cycle}/manifest.json`, {
      headers: { 'User-Agent': 'sgw-proxy' },
    })
    if (!res.ok) return null
    const manifest = await res.json()
    return Array.isArray(manifest?.files) ? manifest.files : null
  } catch {
    return null
  }
}

// Newest cycle whose frame window has already started; else the newest cycle
// that has frames at all (an all-future or all-past index still renders).
async function resolveCoveringFrames(variable, domain) {
  const cycles = await fetchCycleList()
  if (!cycles) return null
  let fallback = null
  for (const cycle of candidateCycles(cycles)) {
    const files = await fetchManifest(cycle)
    if (!files) continue
    const frames = buildFrames(files, cycle, variable, domain)
    if (frames.length === 0) continue
    if (!fallback) fallback = { cycle, frames }
    if (Date.parse(frames[0].iso) <= Date.now()) return { cycle, frames }
  }
  return fallback
}

async function resolveLatestCycle(cache, cacheKey) {
  const resolved = await resolveCoveringFrames(MYCMAQ_DEFAULT_VAR, MYCMAQ_DEFAULT_DOMAIN)
  if (!resolved) return { ok: false, status: 502 }
  const { cycle } = resolved
  const data = {
    cycle,
    displayPage: `display_${cycle}.html`,
    displayUrl: `${MYCMAQ_BASE}/display_${cycle}.html`,
    manifestUrl: `${MYCMAQ_BASE}/${cycle}/manifest.json`,
  }
  try {
    const stamped = new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': CORS_ORIGIN,
        'x-sgw-cached-at': String(Date.now() / 1000),
      },
    })
    await cache.put(cacheKey, stamped.clone())
  } catch {}
  return { ok: true, data }
}

function frameLabel(dateStr, hourStr) {
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)} ${hourStr}:00 LST`
}

function frameIso(dateStr, hourStr) {
  // LST = MYT = UTC+8 → subtract 8h for the UTC instant.
  const utc = new Date(
    Date.UTC(
      Number(dateStr.slice(0, 4)),
      Number(dateStr.slice(4, 6)) - 1,
      Number(dateStr.slice(6, 8)),
      Number(hourStr) - 8,
      0,
      0,
    ),
  )
  return utc.toISOString()
}

// Filter a manifest's file list down to the requested variable/domain frames,
// chronologically ordered, with LST labels + UTC instants.
function buildFrames(files, cycle, variable, domain) {
  return files
    .filter(
      (f) => f.startsWith(`${variable}_`) && f.includes(`_${domain}_`) && MYCMAQ_FRAME_RE.test(f),
    )
    .sort((a, b) => {
      const ma = a.match(MYCMAQ_FRAME_RE)
      const mb = b.match(MYCMAQ_FRAME_RE)
      return `${ma[1]}_${ma[2]}`.localeCompare(`${mb[1]}_${mb[2]}`)
    })
    .map((file) => {
      const m = file.match(MYCMAQ_FRAME_RE)
      const validKey = `${m[1]}_${m[2]}LST`
      return {
        file,
        validKey,
        label: frameLabel(m[1], m[2]),
        iso: frameIso(m[1], m[2]),
        url: `${MYCMAQ_BASE}/${cycle}/${file}`,
        proxyPath: `/mycmaq/image/${cycle}/${file}`,
      }
    })
}

// `cycle` null → resolve the newest cycle that already covers now (see the
// header comment); a pinned cycle is used as given.
async function resolveFrames(cycle, variable, domain, cache, cacheKey) {
  let chosen = cycle
  let frames
  if (cycle) {
    const files = await fetchManifest(cycle)
    if (!files) return { ok: false, status: 502, error: 'MyCMAQ manifest unreachable' }
    frames = buildFrames(files, cycle, variable, domain)
  } else {
    const resolved = await resolveCoveringFrames(variable, domain)
    if (!resolved) return { ok: false, status: 502, error: 'MyCMAQ index unreachable' }
    chosen = resolved.cycle
    frames = resolved.frames
  }
  const data = {
    cycle: chosen,
    variable,
    domain,
    count: frames.length,
    displayUrl: `${MYCMAQ_BASE}/display_${chosen}.html`,
    frames,
  }
  try {
    const stamped = new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': CORS_ORIGIN,
        'x-sgw-cached-at': String(Date.now() / 1000),
      },
    })
    await cache.put(cacheKey, stamped.clone())
  } catch {}
  return { ok: true, data }
}

async function fetchAndCacheImage(target, cacheKey, cache) {
  let upstream
  try {
    upstream = await fetch(target, { headers: { 'User-Agent': 'sgw-proxy' } })
  } catch {
    return new Response('Upstream unreachable', { status: 502 })
  }
  if (!upstream.ok) {
    try {
      await cache.delete(cacheKey)
    } catch {}
    return upstream
  }
  const stamped = fromResponse(upstream, {
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'x-sgw-cached-at': String(Date.now() / 1000),
  })
  try {
    await cache.put(cacheKey, stamped.clone())
  } catch {}
  return stamped
}
