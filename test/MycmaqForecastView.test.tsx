import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import MycmaqForecastView from '../components/MycmaqForecastView'
import { ThemeProvider } from '../context/ThemeContext'
import { mycmaqForecast } from './fixtures'

function renderWithTheme(ui: React.ReactNode) {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

const noop = () => {}

// "Now" for trim purposes: 2026-10-16 09:30 LST. The 1h trim keeps the 09:00 +
// 10:00 LST fixture frames and drops 08:00, so the playhead opens at 09:00.
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

  it('opens on the near-current frame with LST label and raw valid key', () => {
    renderWithTheme(
      <MycmaqForecastView
        forecast={mycmaqForecast()}
        loading={false}
        error={null}
        onRetry={noop}
        asOf={AS_OF}
      />,
    )
    expect(screen.getByText('2026-10-16 09:00 LST')).toBeInTheDocument()
    expect(screen.getByText('(20261016_09LST)')).toBeInTheDocument()
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('drops frames older than ~1h from the timeline', () => {
    renderWithTheme(
      <MycmaqForecastView
        forecast={mycmaqForecast()}
        loading={false}
        error={null}
        onRetry={noop}
        asOf={AS_OF}
      />,
    )
    expect(screen.queryByText('2026-10-16 08:00 LST')).not.toBeInTheDocument()
    expect(screen.queryByText('(20261016_08LST)')).not.toBeInTheDocument()
  })

  it('falls back to the latest frame when the whole cycle is stale', () => {
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
    expect(screen.getByText('2026-10-16 10:00 LST')).toBeInTheDocument()
    expect(screen.getByText('1/1')).toBeInTheDocument()
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
    expect(screen.getByText('2026-10-16 10:00 LST')).toBeInTheDocument()
    expect(screen.getByText('2/2')).toBeInTheDocument()
    expect(screen.getByText(/Malaysian Meteorological Department/)).toBeInTheDocument()
    expect(screen.getByText('View source')).toBeInTheDocument()
  })
})
