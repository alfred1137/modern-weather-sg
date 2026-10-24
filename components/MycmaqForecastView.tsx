import React, { useEffect, useMemo, useRef, useState } from 'react'
import SyncFooter from './SyncFooter'
import { MycmaqForecast, MycmaqFrame } from '../types'
import { mycmaqImageUrl } from '../services/weatherService'
import { useTheme } from '../context/ThemeContext'
import { formatShortDateTime, formatShortDateTimeUTC8, frameValidKeyToDate } from '../constants'

interface Props {
  forecast: MycmaqForecast | null
  loading: boolean
  error: string | null
  onRetry: () => void
  /** Wall-clock ms captured when the forecast was fetched — window boundary. */
  asOf: number
}

/** The two alternating frame layers; `aIncoming` holds the current frame. */
interface FrameLayers {
  a: MycmaqFrame
  b: MycmaqFrame
  aIncoming: boolean
}

// Timeline window: a ONE-DAY outlook anchored on now. Frames from before the
// current hour step are dropped (no stale scrub trap), and frames past +24h are
// dropped too: a full MyCMAQ cycle is 5 days of 1024² PNGs (~30 MB), which is
// far too heavy for mobile to preload. Trimming is client-side so worker
// responses stay time-invariant (immutable, cacheable).
const WINDOW_BACK_MS = 30 * 60 * 1000
const WINDOW_FORWARD_MS = 24 * 60 * 60 * 1000

// Singapore centre on the 1024×1024 Domain 02 MyCMAQ frame (px).
const SG_CENTER_X = 315
const SG_CENTER_Y = 562
// Zoom window: 245 px left of Singapore centre, square → 490×490 region.
// Scale factor to blow that region up to fill the 1024×1024 container.
const ZOOM_HALF_SIZE = 245
const ZOOM_SIZE = ZOOM_HALF_SIZE * 2
const ZOOM_SCALE = 1024 / ZOOM_SIZE
const SG_X_PCT = (SG_CENTER_X / 1024) * 100
const SG_Y_PCT = (SG_CENTER_Y / 1024) * 100

const trimFrames = (frames: MycmaqFrame[], nowMs: number): MycmaqFrame[] => {
  const windowed = frames.filter((f) => {
    const t = Date.parse(f.iso)
    return t >= nowMs - WINDOW_BACK_MS && t <= nowMs + WINDOW_FORWARD_MS
  })
  if (windowed.length > 0) return windowed
  // Degenerate cycle (entirely past or entirely future): show the single frame
  // closest to now instead of a misleading first/last pick.
  if (frames.length === 0) return []
  const closest = frames.reduce((best, f) =>
    Math.abs(Date.parse(f.iso) - nowMs) < Math.abs(Date.parse(best.iso) - nowMs) ? f : best,
  )
  return [closest]
}

// PM2.5 forecast playback (MetMalaysia MyCMAQ, Domain 02 Malaysia).
// Frames are pre-rendered hourly PNGs with their own base map + colorbar
// baked in. Light theme shows them on a white card as published; dark theme
// recolours via invert+hue-rotate (hue-rotate restores the data hues that
// invert flips) plus a bg-base lighten overlay — lighten takes the per-channel
// max, so the inverted pure-black background lands exactly on the Macchiato
// base (#24273a) instead of true black, while brighter data colours pass
// through untouched.
const MycmaqForecastView: React.FC<Props> = ({ forecast, loading, error, onRetry, asOf }) => {
  // Frozen per fetch on purpose: the trim boundary must not drift
  // mid-session (which would yank the playhead / shrink the slider).
  const frames = useMemo(() => trimFrames(forecast?.frames ?? [], asOf), [forecast, asOf])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [bufferedCount, setBufferedCount] = useState(0)
  // The frame the incoming layer has actually PAINTED. Until it matches the
  // incoming frame's url the outgoing layer stays opaque, so a frame that has
  // not decoded yet can never reveal the layer background (see the render
  // block): that backdrop is theme-coloured, so an unpainted frame flashed a
  // dark map in the dark theme and went unnoticed in the light one.
  const [paintedSrc, setPaintedSrc] = useState<string | null>(null)
  const playbackTimerRef = useRef<number | null>(null)
  const { theme } = useTheme()
  const isLatte = theme === 'latte'

  const current = frames[selectedIndex] ?? frames[0]

  // Two always-mounted layers alternate the frame (see the render below). The
  // layer that is currently OFF takes the incoming frame: its src swaps while
  // fully transparent, so no decode is ever watched, and the frame on screen
  // only ever fades. Reconciled during render rather than in an effect so the
  // incoming layer flips in the same commit as the playhead — no frame of lag
  // behind the pill. `aIncoming` marks the layer holding the CURRENT frame: it
  // sits underneath and is fully opaque, while the previous frame fades out
  // above it (see the render block for why that order matters).
  const [layers, setLayers] = useState<FrameLayers | null>(null)
  if (current && current !== (layers ? (layers.aIncoming ? layers.a : layers.b) : null)) {
    setLayers((prev) =>
      prev
        ? prev.aIncoming
          ? { a: prev.a, b: current, aIncoming: false }
          : { a: current, b: prev.b, aIncoming: true }
        : { a: current, b: current, aIncoming: true },
    )
  }

  useEffect(() => {
    setSelectedIndex(0)
    setIsPlaying(false)
  }, [forecast])

  // Preload frames into the browser cache in display order (4 at a time, so
  // the first viewer of a cycle doesn't slam the worker with 120 concurrent
  // origin fetches). Without this the animation flashes: each frame swap
  // waits on network + PNG decode. A frame only counts as buffered once it is
  // DECODED, not merely downloaded — a cached PNG still costs a decode on its
  // first paint, which is exactly the blank beat this pill promises is over.
  useEffect(() => {
    let cancelled = false
    setBufferedCount(0)
    if (frames.length === 0) return
    const urls = frames.map(mycmaqImageUrl)
    let cursor = 0
    let done = 0
    const pump = async () => {
      while (!cancelled && cursor < urls.length) {
        const url = urls[cursor++]
        await new Promise<void>((resolve) => {
          const img = new Image()
          const settle = () => {
            // `decode()` is absent in jsdom, so it is opt-in, never assumed.
            const decoding = typeof img.decode === 'function' ? img.decode() : null
            if (decoding) decoding.then(resolve, resolve)
            else resolve()
          }
          img.onload = settle
          img.onerror = () => resolve()
          img.src = url
        })
        if (!cancelled) {
          done += 1
          setBufferedCount(done)
        }
      }
    }
    const lanes = Math.min(4, urls.length)
    for (let i = 0; i < lanes; i++) pump()
    return () => {
      cancelled = true
    }
  }, [frames])

  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      playbackTimerRef.current = window.setInterval(() => {
        setSelectedIndex((prev) => (prev + 1) % frames.length)
      }, 600)
    } else if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current)
    }
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current)
    }
  }, [isPlaying, frames.length])

  if (loading) {
    return <div className="text-center p-8 text-sm text-subtext0">Loading PM2.5 forecast...</div>
  }

  if (error || !forecast || frames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-4 py-12 px-4">
        <i className="fas fa-cloud-sun text-overlay0 text-4xl"></i>
        <p className="text-subtext0 text-sm max-w-md">
          {error ?? 'PM2.5 forecast is unavailable right now.'}
        </p>
        <button
          onClick={onRetry}
          className="bg-blue hover:bg-sky text-mantle px-6 py-2.5 rounded-xl font-bold text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const buffering = bufferedCount < frames.length
  // LST wall-clock of the current frame — from the frame's own valid key so it
  // is timezone-proof (the PNG's baked-in labels are LST).
  const currentTime = formatShortDateTime(frameValidKeyToDate(current.validKey))
  // The footer reports when MetMalaysia PUBLISHED the imagery (the cycle's frame
  // Last-Modified), not which hour the frame is valid for — that is the pill's
  // job. Fixed UTC+8: the publish instant is Malaysian time regardless of where
  // the viewer is. Absent stamp → no footer rather than a wrong time.
  const publishedLabel = formatShortDateTimeUTC8(forecast.publishedAt) ?? undefined
  // Recolour is identical on both layers, so the crossfade never shifts hue.
  const mapStyle = isLatte ? undefined : { filter: 'invert(1) hue-rotate(180deg)' }
  // Left tick: "Now" only when the timeline really starts at ~now; a genuine
  // lead (a cycle whose window opens later) is shown as an offset instead of a
  // label that lies. Nothing is shown when the only frame is stale.
  const leadMs = Date.parse(frames[0].iso) - asOf
  const startsNow = Math.abs(leadMs) <= 90 * 60 * 1000
  const leftTick = startsNow ? 'Now' : leadMs > 0 ? `+${Math.round(leadMs / 3600000)}h` : ' '
  // The reconciled pair. The fallbacks only cover the throwaway render pass the
  // reconcile above discards, so they can never reach the screen; they exist so
  // the JSX is typed without asserting non-null.
  const layerA = layers?.a ?? current
  const layerB = layers?.b ?? current
  const aIncoming = layers?.aIncoming ?? true
  // The frame the incoming layer is showing, and whether it has painted. The
  // outgoing layer only starts fading once it has.
  const incomingSrc = mycmaqImageUrl(aIncoming ? layerA : layerB)
  const incomingPainted = paintedSrc === incomingSrc

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`glass rounded-none sm:rounded-3xl overflow-hidden relative w-auto -mx-4 sm:mx-auto sm:w-full max-w-5xl border sm:border-surface1/20 shadow-md transition-colors duration-300 ${
          isLatte ? 'bg-white' : 'bg-base'
        }`}
      >
        {/* Two layers, both always mounted, alternating the frame. The layer
            that is currently OFF receives the incoming PNG — its src swaps
            while it is transparent, so the decode is never watched. That kills
            the old flash: a keyed <img> remounts a fresh element per frame and
            a fresh element has no decoded bitmap at its first paint, so the card
            went blank. (The radar view keeps the single keyed layer because its
            frames are transparent overlays drawn on a base map — a blank overlay
            just reveals the map.)
            Fade direction matters: the CURRENT frame is fully opaque UNDERNEATH
            and the PREVIOUS frame fades out ON TOP. A symmetric dissolve (old
            fading out while the new fades in, both partly transparent) lets the
            card show through mid-fade, so the map visibly dims then brightens.
            Here the two weights always sum to 1, so on-screen brightness is
            constant.
            The dark-theme treatments live INSIDE each layer, and each layer is
            `isolate`d. Both are load-bearing. The inverted map is clamped back
            onto `base` with `lighten`, and `max` is convex: clamping the MIXTURE
            of two frames is always darker than clamping each frame and mixing
            (Jensen), so a single overlay over the pair dimmed the map mid-fade
            while the light theme, which has no clamp, was untouched. Per-layer
            clamping makes the fade a plain weighted average again.
            The fade also waits for the incoming frame to PAINT (`paintedSrc`).
            Each layer keeps the layer background solid, which is theme-coloured
            — `base` in dark mode, white in light. Fading to a frame whose bytes
            have not decoded yet showed that backdrop where the plumes should be:
            a dark flash in the dark theme and an invisible one in the light one.
            Square container: the d02 frames are a fixed 1024×1024. */}
        {/* Zoom: tap (mobile) / hover (desktop) on Singapore. The layer div
            scales from Singapore's centre so the point under your finger stays
            put while the 490×490 region around it blows up to fill the card. */}
        <div
          className={`relative w-full aspect-square${isZoomed ? ' overflow-hidden' : ''}`}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onClick={() => setIsZoomed((prev) => !prev)}
        >
          {[layerA, layerB].map((frame, slot) => {
            const incoming = (slot === 0) === aIncoming
            const src = mycmaqImageUrl(frame)
            return (
              <div
                key={slot}
                className={`absolute inset-0 bg-base isolate transition-transform duration-300${
                  incoming ? '' : ' transition-opacity duration-200'
                }`}
                style={{
                  // The outgoing layer holds its frame until the incoming one is
                  // painted, then fades out over it.
                  opacity: incoming || !incomingPainted ? 1 : 0,
                  zIndex: incoming ? 0 : 10,
                  ...(isZoomed
                    ? {
                        transform: `scale(${ZOOM_SCALE})`,
                        transformOrigin: `${SG_X_PCT}% ${SG_Y_PCT}%`,
                      }
                    : { transform: 'none' }),
                }}
              >
                <img
                  src={src}
                  style={mapStyle}
                  className={`w-full h-full object-contain pointer-events-none${
                    isLatte ? '' : ' mix-blend-lighten'
                  }`}
                  decoding="async"
                  alt={incoming ? `PM2.5 forecast for ${frame.label}` : ''}
                  aria-hidden={incoming ? undefined : true}
                  onLoad={incoming ? () => setPaintedSrc(src) : undefined}
                  onError={
                    incoming ? () => console.debug('MyCMAQ frame missing:', frame.file) : undefined
                  }
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-surface0/60 p-5 md:p-6 rounded-2xl border border-surface1/20 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-5 md:gap-8">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause forecast playback' : 'Play forecast playback'}
            className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-colors shrink-0 ${
              isPlaying ? 'bg-blue/20 text-blue border border-blue/30' : 'bg-blue text-mantle'
            }`}
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-lg md:text-xl`}></i>
          </button>

          <div className="flex-1 flex flex-col gap-4">
            <div className="flex justify-between items-center text-[11px] md:text-xs font-semibold text-subtext0 px-1">
              <span className="opacity-60">{leftTick}</span>
              <div className="bg-mantle px-4 py-1.5 rounded-full border border-surface1/20 text-center">
                <span className="text-blue font-semibold">{currentTime}</span>
              </div>
              <span className="opacity-60">
                {selectedIndex + 1}/{frames.length}
              </span>
            </div>
            <div className="relative flex items-center h-4">
              <div className="absolute inset-0 bg-surface0/50 rounded-full h-1 my-auto"></div>
              <input
                type="range"
                min="0"
                max={frames.length - 1}
                value={selectedIndex}
                aria-label="Forecast hour"
                onChange={(e) => {
                  setIsPlaying(false)
                  setSelectedIndex(parseInt(e.target.value))
                }}
                className="relative w-full h-4 bg-transparent appearance-none cursor-pointer accent-blue z-10
                  [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:bg-blue [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:mt-[-10px]
                  [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-mantle"
              />
            </div>
            <div className="flex justify-end px-1">
              <span
                className={`text-[11px] md:text-xs font-semibold ${buffering ? 'text-subtext0 animate-pulse' : 'text-green'}`}
              >
                {buffering ? `Buffering ${bufferedCount}/${frames.length}…` : 'Buffered'}
              </span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-[11px] md:text-xs text-subtext0 leading-relaxed">
          PM2.5 forecast imagery: Malaysian Meteorological Department (MetMalaysia) MyCMAQ, Domain
          02 (Malaysia), cycle {forecast.cycle}. Times are Malaysian local time (UTC+8).{' '}
          <a
            href={forecast.displayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue hover:underline"
          >
            View source
          </a>
          .
        </p>
      </div>

      <SyncFooter label={publishedLabel} className="max-w-5xl mx-auto" />
    </div>
  )
}

export default MycmaqForecastView
