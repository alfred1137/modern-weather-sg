import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import App from '../App'
import * as weatherService from '../services/weatherService'

const mockData = vi.hoisted(() => ({
  nowcast: {
    updateTimestamp: '2024-01-01T10:00:00',
    validPeriod: { start: '2024-01-01T06:00:00', end: '2024-01-01T12:00:00' },
    items: [{ area: 'Ang Mo Kio', forecast: 'Cloudy' }],
  },
  forecast24h: {
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
    ],
  },
  forecast4d: {
    updateTimestamp: '2024-01-01T10:00:00',
    items: [
      {
        date: '2024-01-02T00:00:00',
        forecast: 'Fair (Day)',
        summary: 'Fair and Warm',
        relative_humidity: { low: 50, high: 85 },
        temperature: { low: 25, high: 33 },
        wind: { speed: { low: 10, high: 20 }, direction: 'SW' },
      },
    ],
  },
  airQuality: {
    psi: {
      updateTimestamp: '2024-01-01T10:00:00',
      readings: {
        north: {
          psi_twenty_four_hourly: 55,
          pm25_sub_index: 20,
          pm10_sub_index: 30,
          so2_sub_index: 10,
          o3_sub_index: 40,
          co_sub_index: 8,
          no2_one_hour_max: 12,
        },
        south: {
          psi_twenty_four_hourly: 55,
          pm25_sub_index: 20,
          pm10_sub_index: 30,
          so2_sub_index: 10,
          o3_sub_index: 40,
          co_sub_index: 8,
          no2_one_hour_max: 12,
        },
        east: {
          psi_twenty_four_hourly: 55,
          pm25_sub_index: 20,
          pm10_sub_index: 30,
          so2_sub_index: 10,
          o3_sub_index: 40,
          co_sub_index: 8,
          no2_one_hour_max: 12,
        },
        west: {
          psi_twenty_four_hourly: 55,
          pm25_sub_index: 20,
          pm10_sub_index: 30,
          so2_sub_index: 10,
          o3_sub_index: 40,
          co_sub_index: 8,
          no2_one_hour_max: 12,
        },
        central: {
          psi_twenty_four_hourly: 55,
          pm25_sub_index: 20,
          pm10_sub_index: 30,
          so2_sub_index: 10,
          o3_sub_index: 40,
          co_sub_index: 8,
          no2_one_hour_max: 12,
        },
      },
    },
    pm25: {
      updateTimestamp: '2024-01-01T10:00:00',
      readings: { north: 15, south: 16, east: 14, west: 18, central: 17 },
    },
  },
}))

vi.mock('../services/weatherService', () => ({
  fetchNowcast: vi.fn(),
  fetch24hForecast: vi.fn(),
  fetch4DayForecast: vi.fn(),
  fetchAirQuality: vi.fn(),
}))

beforeEach(() => {
  localStorage.clear()
  window.scrollTo = vi.fn()
  vi.mocked(weatherService.fetchNowcast).mockResolvedValue(mockData.nowcast)
  vi.mocked(weatherService.fetch24hForecast).mockResolvedValue(mockData.forecast24h)
  vi.mocked(weatherService.fetch4DayForecast).mockResolvedValue(mockData.forecast4d)
  vi.mocked(weatherService.fetchAirQuality).mockResolvedValue(mockData.airQuality)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('App', () => {
  it('fetches data and renders the nowcast tab', async () => {
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Nowcast' })).toBeInTheDocument()

    // Map view is default; grid mode lists area names.
    fireEvent.click(screen.getAllByText('Grid')[0])
    expect(await screen.findByText('Ang Mo Kio')).toBeInTheDocument()
  })

  it('switches to the rain areas tab', async () => {
    render(<App />)
    await screen.findByRole('heading', { name: 'Nowcast' })

    fireEvent.click(screen.getByText('Rain Areas'))
    expect(await screen.findByText('Live')).toBeInTheDocument()
  })

  it('opens the legend modal from the footer', async () => {
    render(<App />)
    await screen.findByRole('heading', { name: 'Nowcast' })

    fireEvent.click(screen.getByText('Weather legend'))
    expect(await screen.findByText('Weather Legend')).toBeInTheDocument()
  })

  it('renders the version footer', async () => {
    render(<App />)
    expect(await screen.findByText(/v1\.4\.5/)).toBeInTheDocument()
  })

  it('shows the sync error screen when services fail with no cache', async () => {
    vi.mocked(weatherService.fetchNowcast).mockRejectedValue(new Error('network down'))
    vi.mocked(weatherService.fetch24hForecast).mockRejectedValue(new Error('network down'))
    vi.mocked(weatherService.fetch4DayForecast).mockRejectedValue(new Error('network down'))
    vi.mocked(weatherService.fetchAirQuality).mockRejectedValue(new Error('network down'))

    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Sync error' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Retry connection/ })).toBeInTheDocument()
  })
})
