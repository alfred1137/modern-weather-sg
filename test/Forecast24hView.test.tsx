import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import Forecast24hView from '../components/Forecast24hView'
import { ThemeProvider } from '../context/ThemeContext'
import { Forecast24h } from '../types'

const mockData: Forecast24h = {
  updateTimestamp: '2024-01-01T10:00:00',
  validPeriod: { start: '2024-01-01T06:00:00', end: '2024-01-01T20:00:00' },
  general: {
    forecast: 'Fair and Warm',
    relative_humidity: { low: 50, high: 85 },
    temperature: { low: 25, high: 33 },
    wind: { speed: { low: 10, high: 20 }, direction: 'SW' },
  },
  periods: [
    {
      time: { start: '2024-01-01T06:00:00', end: '2024-01-01T12:00:00' },
      regions: {
        west: 'Cloudy',
        east: 'Fair (Day)',
        central: 'Fair (Day)',
        south: 'Cloudy',
        north: 'Fair (Day)',
      },
    },
    {
      time: { start: '2024-01-01T14:00:00', end: '2024-01-01T20:00:00' },
      regions: {
        west: 'Thundery Showers',
        east: 'Cloudy',
        central: 'Cloudy',
        south: 'Cloudy',
        north: 'Thundery Showers',
      },
    },
  ],
}

function renderWithTheme(ui: React.ReactNode) {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
})

describe('Forecast24hView', () => {
  it('shows loading state when data is null', () => {
    renderWithTheme(<Forecast24hView data={null} />)
    expect(screen.getByText('Synchronizing forecast...')).toBeInTheDocument()
  })

  it('renders general forecast and period tabs', () => {
    renderWithTheme(<Forecast24hView data={mockData} />)
    expect(screen.getByText('24-Hour Forecast')).toBeInTheDocument()
    expect(screen.getByText('Morning')).toBeInTheDocument()
    expect(screen.getByText('Afternoon')).toBeInTheDocument()
  })

  it('shows first period region forecasts by default', () => {
    renderWithTheme(<Forecast24hView data={mockData} />)
    expect(screen.getAllByText('Cloudy').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Fair (Day)').length).toBeGreaterThanOrEqual(1)
  })

  it('switches to the next period on tab click', () => {
    renderWithTheme(<Forecast24hView data={mockData} />)
    expect(screen.queryByText('Thundery Showers')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Afternoon'))
    expect(screen.getAllByText('Thundery Showers').length).toBeGreaterThanOrEqual(1)
  })
})
