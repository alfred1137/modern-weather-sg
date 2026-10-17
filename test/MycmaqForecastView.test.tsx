import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import MycmaqForecastView from '../components/MycmaqForecastView'
import { ThemeProvider } from '../context/ThemeContext'
import { mycmaqForecast, mycmaqForecastOutlook } from './fixtures'

function renderWithTheme(ui: React.ReactNode) {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

const noop = () => {}

// "Now" for windowing purposes: 2026-10-16 09:30 LST. The one-day-outlook window
// keeps the 09:00 + 10:00 LST fixture frames and drops 08:00, so the playhead
// opens at 09:00.
const AS_OF = new Date('2026-10-16T01:30:00Z').getTime()

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('MycmaqForecastView', () => {
  it('shows loading state', () => {
    renderWithTheme(
      <MycmaqForecastView
        forecast={null}
        loading={true}
        error={null}
        onRetry={noop}
        asOf={AS_OF}
      />,
    )
    expect(screen.getByText('Loading PM2.5 forecast...')).toBeInTheDocument()
  })

  it('shows error state with retry', () => {
    renderWithTheme(
      <MycmaqForecastView
        forecast={null}
        loading={false}
        error="boom"
        onRetry={noop}
        asOf={AS_OF}
      />,
    )
    expect(screen.getByText('boom')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('opens on the near-current frame with a compact time pill', () => {
    renderWithTheme(
      <MycmaqForecastView
        forecast={mycmaqForecast()}
        loading={false}
        error={null}
        onRetry={noop}
        asOf={AS_OF}
      />,
    )
    // The pill is the only place the frame's valid hour appears now — the footer
    // reports publication instead (asserted separately).
    expect(screen.getAllByText('16-Oct 09:00').length).toBe(1)
    // The long label + raw valid key are gone from the player.
    expect(screen.queryByText('(20261016_09LST)')).not.toBeInTheDocument()
    expect(screen.queryByText('2026-10-16 09:00 LST')).not.toBeInTheDocument()
    expect(screen.getByText('Now')).toBeInTheDocument()
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('dates the source footer with the cycle publish time, not the frame hour', () => {
    renderWithTheme(
      <MycmaqForecastView
        forecast={mycmaqForecast()}
        loading={false}
        error={null}
        onRetry={noop}
        asOf={AS_OF}
      />,
    )
    // Fixture publishes 2026-10-15T22:40Z = 16 Oct 06:40 in MYT/SGT (UTC+8),
    // distinct from the 09:00 frame hour — so an echo of the frame time fails.
    const footer = screen.getByText(/Source data last updated at/)
    expect(footer).toHaveTextContent('16-Oct 06:40')
    expect(footer).not.toHaveTextContent('16-Oct 09:00')
  })

  it('hides the source footer when the publish instant is unknown', () => {
    const undated = { ...mycmaqForecast(), publishedAt: null }
    renderWithTheme(
      <MycmaqForecastView
        forecast={undated}
        loading={false}
        error={null}
        onRetry={noop}
        asOf={AS_OF}
      />,
    )
    expect(screen.queryByText(/Source data last updated at/)).not.toBeInTheDocument()
  })

  it('drops frames before the current hour step', () => {
    renderWithTheme(
      <MycmaqForecastView
        forecast={mycmaqForecast()}
        loading={false}
        error={null}
        onRetry={noop}
        asOf={AS_OF}
      />,
    )
    expect(screen.queryByText('16-Oct 08:00')).not.toBeInTheDocument()
  })

  it('caps the timeline at a one-day outlook', () => {
    renderWithTheme(
      <MycmaqForecastView
        forecast={mycmaqForecastOutlook()}
        loading={false}
        error={null}
        onRetry={noop}
        asOf={AS_OF}
      />,
    )
    // 5 frames in → 3 inside [09:00, +24h]: 16 Oct 09:00 & 12:00, 17 Oct 09:00.
    expect(screen.getByText('1/3')).toBeInTheDocument()
    const slider = screen.getByLabelText('Forecast hour')
    expect(slider).toHaveAttribute('max', '2')
    // Scrubbing to the end lands on 17 Oct 09:00 — one hour short of the
    // excluded 10:00 frame.
    fireEvent.change(slider, { target: { value: '2' } })
    expect(screen.getAllByText('17-Oct 09:00').length).toBe(1)
    expect(screen.getByText('3/3')).toBeInTheDocument()
    // Behind and past +24h are both dropped.
    expect(screen.queryByText('16-Oct 08:00')).not.toBeInTheDocument()
    expect(screen.queryByText('17-Oct 10:00')).not.toBeInTheDocument()
  })

  it('shows a lead offset instead of "Now" when the cycle starts later', () => {
    // 16 Oct 06:00 LST: the fixture's first frame (08:00) is two hours ahead.
    renderWithTheme(
      <MycmaqForecastView
        forecast={mycmaqForecast()}
        loading={false}
        error={null}
        onRetry={noop}
        asOf={new Date('2026-10-15T22:00:00Z').getTime()}
      />,
    )
    expect(screen.getByText('+2h')).toBeInTheDocument()
    expect(screen.queryByText('Now')).not.toBeInTheDocument()
    expect(screen.getByText('1/3')).toBeInTheDocument()
  })

  it('falls back to the frame closest to now when the whole cycle is stale', () => {
    const staleAsOf = new Date('2026-10-30T00:00:00Z').getTime()
    renderWithTheme(
      <MycmaqForecastView
        forecast={mycmaqForecast()}
        loading={false}
        error={null}
        onRetry={noop}
        asOf={staleAsOf}
      />,
    )
    expect(screen.getAllByText('16-Oct 10:00').length).toBe(1)
    expect(screen.getByText('1/1')).toBeInTheDocument()
    expect(screen.queryByText('Now')).not.toBeInTheDocument()
  })

  it('shows buffering progress until frames preload', () => {
    renderWithTheme(
      <MycmaqForecastView
        forecast={mycmaqForecast()}
        loading={false}
        error={null}
        onRetry={noop}
        asOf={AS_OF}
      />,
    )
    // jsdom never fires Image onload, so the preloader stays at 0/2.
    expect(screen.getByText('Buffering 0/2…')).toBeInTheDocument()
  })

  it('recolours the chart for dark theme', () => {
    const { container } = renderWithTheme(
      <MycmaqForecastView
        forecast={mycmaqForecast()}
        loading={false}
        error={null}
        onRetry={noop}
        asOf={AS_OF}
      />,
    )
    // Default theme is macchiato → invert+hue-rotate recolour expected.
    const img = screen.getByAltText('PM2.5 forecast for 2026-10-16 09:00 LST')
    expect(img.getAttribute('style')).toContain('invert(1)')
    expect(img.getAttribute('style')).toContain('hue-rotate(180deg)')
    // bg-base lighten overlay lifts the inverted background onto Macchiato base.
    expect(container.querySelector('.mix-blend-lighten')).not.toBeNull()
  })

  it('advances frame via slider and credits MetMalaysia', () => {
    renderWithTheme(
      <MycmaqForecastView
        forecast={mycmaqForecast()}
        loading={false}
        error={null}
        onRetry={noop}
        asOf={AS_OF}
      />,
    )
    const slider = screen.getByLabelText('Forecast hour')
    fireEvent.change(slider, { target: { value: '1' } })
    expect(screen.getAllByText('16-Oct 10:00').length).toBe(1)
    expect(screen.getByText('2/2')).toBeInTheDocument()
    expect(screen.getByText(/Malaysian Meteorological Department/)).toBeInTheDocument()
    expect(screen.getByText('View source')).toBeInTheDocument()
  })

  it('reports Buffered only once the frames decode', async () => {
    // jsdom ships no decode() and never fires onload, so the preloader is stubbed
    // to complete: this is the only way to assert the buffered transition at all.
    class FakeImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      decode() {
        return Promise.resolve()
      }
      set src(_value: string) {
        queueMicrotask(() => this.onload?.())
      }
    }
    vi.stubGlobal('Image', FakeImage)
    renderWithTheme(
      <MycmaqForecastView
        forecast={mycmaqForecast()}
        loading={false}
        error={null}
        onRetry={noop}
        asOf={AS_OF}
      />,
    )
    expect(await screen.findByText('Buffered')).toBeInTheDocument()
    expect(screen.queryByText(/Buffering/)).not.toBeInTheDocument()
  })

  it('cross-fades over the previous frame instead of remounting blind', () => {
    const { container } = renderWithTheme(
      <MycmaqForecastView
        forecast={mycmaqForecast()}
        loading={false}
        error={null}
        onRetry={noop}
        asOf={AS_OF}
      />,
    )
    // Two layers are always mounted; on open both hold the same frame.
    const srcs = () => [...container.querySelectorAll('img')].map((img) => img.getAttribute('src'))
    expect(srcs().length).toBe(2)
    expect(srcs().every((src) => src?.includes('20261016_09LST.png'))).toBe(true)

    fireEvent.change(screen.getByLabelText('Forecast hour'), { target: { value: '1' } })
    // The outgoing layer keeps its bitmap (card never empties) while the incoming
    // one cross-fades in.
    expect(srcs().some((src) => src?.includes('20261016_09LST.png'))).toBe(true)
    expect(srcs().some((src) => src?.includes('20261016_10LST.png'))).toBe(true)
    // Only the current frame is described to assistive tech.
    expect(screen.getByAltText('PM2.5 forecast for 2026-10-16 10:00 LST')).toBeInTheDocument()
    expect(screen.queryByAltText('PM2.5 forecast for 2026-10-16 09:00 LST')).not.toBeInTheDocument()
  })

  it('fades the outgoing frame out on top so brightness never dips', () => {
    const { container } = renderWithTheme(
      <MycmaqForecastView
        forecast={mycmaqForecast()}
        loading={false}
        error={null}
        onRetry={noop}
        asOf={AS_OF}
      />,
    )
    fireEvent.change(screen.getByLabelText('Forecast hour'), { target: { value: '1' } })
    const imgs = [...container.querySelectorAll('img')]
    const incomingImg = imgs.find((img) => img.getAttribute('src')?.includes('20261016_10LST.png'))
    const outgoingImg = imgs.find((img) => img.getAttribute('src')?.includes('20261016_09LST.png'))
    if (!incomingImg || !outgoingImg) throw new Error('expected both frame layers mounted')
    const incoming = incomingImg.parentElement as HTMLElement
    const outgoing = outgoingImg.parentElement as HTMLElement
    // The current frame is opaque and sits UNDER the outgoing one...
    expect(incoming.style.opacity).toBe('1')
    expect(Number(incoming.style.zIndex ?? 0)).toBeLessThan(Number(outgoing.style.zIndex ?? 0))
    // ...but the outgoing layer holds its frame until the incoming one has
    // actually painted: fading over an undecoded frame shows the layer backdrop
    // (theme-coloured) where the data should be.
    expect(outgoing.style.opacity).toBe('1')
    fireEvent.load(incomingImg)
    // Now it fades 1 -> 0 over it. A symmetric dissolve would leave a partly
    // transparent composite for the card to show through mid-fade (the dimming).
    expect(outgoing.style.opacity).toBe('0')
    expect(outgoing.className).toContain('transition-opacity')
    // The incoming layer must appear instantly, never ramp: it is revealed by the
    // fade above it, so a transition on it would double up the fade.
    expect(incoming.className).not.toContain('transition-opacity')
  })

  it('clamps each layer to base separately so the dark-theme fade cannot dim', () => {
    const { container } = renderWithTheme(
      <MycmaqForecastView
        forecast={mycmaqForecast()}
        loading={false}
        error={null}
        onRetry={noop}
        asOf={AS_OF}
      />,
    )
    for (const img of container.querySelectorAll('img')) {
      const layer = img.parentElement as HTMLElement
      // Each frame is clamped onto `base` on its own, inside an isolated group.
      // One shared overlay would clamp the MIXTURE of two frames instead, and
      // max() is convex, so the mid-fade mixture always came out darker.
      expect(layer.className).toContain('isolate')
      expect(layer.className).toContain('bg-base')
      expect(img.className).toContain('mix-blend-lighten')
      expect(img.style.filter).toContain('invert(1)')
    }
  })
})
