import { describe, it, expect, beforeEach, afterEach } from 'vitest'
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
    // Pill + source footer both render the compact LST time.
    expect(screen.getAllByText('16-Oct 09:00').length).toBe(2)
    // The long label + raw valid key are gone from the player.
    expect(screen.queryByText('(20261016_09LST)')).not.toBeInTheDocument()
    expect(screen.queryByText('2026-10-16 09:00 LST')).not.toBeInTheDocument()
    expect(screen.getByText('Now')).toBeInTheDocument()
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('dates the source footer', () => {
    renderWithTheme(
      <MycmaqForecastView
        forecast={mycmaqForecast()}
        loading={false}
        error={null}
        onRetry={noop}
        asOf={AS_OF}
      />,
    )
    expect(screen.getByText(/Source data last updated at/)).toHaveTextContent('16-Oct 09:00')
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
    expect(screen.getAllByText('17-Oct 09:00').length).toBe(2)
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
    expect(screen.getAllByText('16-Oct 10:00').length).toBe(2)
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
    expect(screen.getAllByText('16-Oct 10:00').length).toBe(2)
    expect(screen.getByText('2/2')).toBeInTheDocument()
    expect(screen.getByText(/Malaysian Meteorological Department/)).toBeInTheDocument()
    expect(screen.getByText('View source')).toBeInTheDocument()
  })
})
