import React, { useEffect, useMemo, useRef, useState } from 'react'
import SyncFooter from './SyncFooter'
import { MycmaqForecast, MycmaqFrame } from '../types'
import { mycmaqImageUrl } from '../services/weatherService'
import { useTheme } from '../context/ThemeContext'

interface Props {
  forecast: MycmaqForecast | null
  loading: boolean
  error: string | null
  onRetry: () => void
  /** Wall-clock ms captured when the forecast was fetched — trim boundary. */
  asOf: number
}

// Drop frames valid more than an hour before now: scrubbing back into
// half-day-old forecast steps disorients (no way back to "now"), so the
// timeline always starts at near-current conditions. Falls back to the single
// latest frame when a stale cycle has nothing fresh left. Trimming is
// client-side so worker responses stay time-invariant (immutable, cacheable).
const trimFrames = (frames: MycmaqFrame[], nowMs: number): MycmaqFrame[] => {
  const cutoff = nowMs - 60 * 60 * 1000
  const fresh = frames.filter((f) => new Date(f.iso).getTime() >= cutoff)
  if (fresh.length > 0) return fresh
  return frames.length > 0 ? [frames[frames.length - 1]] : []
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
  const [bufferedCount, setBufferedCount] = useState(0)
  const playbackTimerRef = useRef<number | null>(null)
  const { theme } = useTheme()
  const isLatte = theme === 'latte'

  useEffect(() => {
    setSelectedIndex(0)
    setIsPlaying(false)
  }, [forecast])

  // Preload frames into the browser cache in display order (4 at a time, so
  // the first viewer of a cycle doesn't slam the worker with 120 concurrent
  // origin fetches). Without this the animation flashes: each frame swap
  // waits on network + PNG decode. Preloaded frames swap instantly, on any
  // worker location (edge cache HITs still cost decode-on-swap otherwise).
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
          img.onload = () => resolve()
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

  const current = frames[selectedIndex] ?? frames[0]
  const buffering = bufferedCount < frames.length

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`glass rounded-none sm:rounded-3xl overflow-hidden relative w-auto -mx-4 sm:mx-auto sm:w-full max-w-5xl border sm:border-surface1/20 shadow-md transition-colors duration-300 ${
          isLatte ? 'bg-white' : 'bg-base'
        }`}
      >
        <img
          key={current.file}
          src={mycmaqImageUrl(current)}
          style={isLatte ? undefined : { filter: 'invert(1) hue-rotate(180deg)' }}
          className="w-full h-auto object-contain pointer-events-none"
          alt={`PM2.5 forecast for ${current.label}`}
          onError={() => console.debug('MyCMAQ frame missing:', current.file)}
        />
        {!isLatte && (
          <div className="absolute inset-0 bg-base mix-blend-lighten pointer-events-none" />
        )}
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
              <span className="opacity-60">Now</span>
              <div className="bg-mantle px-4 py-1.5 rounded-full border border-surface1/20 text-center">
                <span className="text-blue font-semibold">{current.label}</span>{' '}
                <span className="text-subtext0 font-mono">({current.validKey})</span>
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
          02 (Malaysia), cycle {forecast.cycle}. LST is Malaysian local standard time (UTC+8).{' '}
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

      <SyncFooter timestamp={current.iso} className="max-w-5xl mx-auto" />
    </div>
  )
}

export default MycmaqForecastView
