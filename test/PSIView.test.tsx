import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import PSIView from '../components/PSIView'
import { ThemeProvider } from '../context/ThemeContext'
import { AirQualityData } from '../types'

const regionReadings = {
  psi_twenty_four_hourly: 55,
  pm25_sub_index: 20,
  pm10_sub_index: 30,
  so2_sub_index: 10,
  o3_sub_index: 40,
  co_sub_index: 8,
  no2_one_hour_max: 12,
}

const mockData: AirQualityData = {
  psi: {
    updateTimestamp: '2024-01-01T10:00:00',
    readings: {
      north: regionReadings,
      south: regionReadings,
      east: regionReadings,
      west: regionReadings,
      central: regionReadings,
    },
  },
  pm25: {
    updateTimestamp: '2024-01-01T10:00:00',
    readings: { north: 15, south: 16, east: 14, west: 18, central: 17 },
  },
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

describe('PSIView', () => {
  it('shows loading state when data is null', () => {
    renderWithTheme(<PSIView data={null} />)
    expect(screen.getByText('Synchronizing air quality...')).toBeInTheDocument()
  })

  it('renders the map with mode toggles', () => {
    renderWithTheme(<PSIView data={mockData} />)
    expect(screen.getByText('Air Quality')).toBeInTheDocument()
    expect(screen.getAllByText('24-hr PSI').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('1-hr PM2.5').length).toBeGreaterThanOrEqual(1)
  })

  it('shows placeholder until a region is selected', () => {
    renderWithTheme(<PSIView data={mockData} />)
    expect(screen.getByText('Select a region on the map')).toBeInTheDocument()
  })

  it('switches mode to PM2.5 and updates the bands card', () => {
    renderWithTheme(<PSIView data={mockData} />)
    expect(screen.getByText('PSI bands')).toBeInTheDocument()

    fireEvent.click(screen.getAllByText('1-hr PM2.5')[0])
    expect(screen.getByText('1-hr PM2.5 bands')).toBeInTheDocument()
  })

  it('renders band legend chips', () => {
    renderWithTheme(<PSIView data={mockData} />)
    expect(screen.getAllByText('Good').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Moderate').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Unhealthy').length).toBeGreaterThanOrEqual(1)
  })
})
