import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import App from '../App'
import * as weatherService from '../services/weatherService'
import { nowcastData, forecast24hData, forecast4DayData, airQualityData } from './fixtures'

vi.mock('../services/weatherService', () => ({
  fetchNowcast: vi.fn(),
  fetch24hForecast: vi.fn(),
  fetch4DayForecast: vi.fn(),
  fetchAirQuality: vi.fn(),
}))

beforeEach(() => {
  localStorage.clear()
  window.scrollTo = vi.fn() // jsdom has no scrollTo
  vi.mocked(weatherService.fetchNowcast).mockResolvedValue(nowcastData())
  vi.mocked(weatherService.fetch24hForecast).mockResolvedValue(forecast24hData())
  vi.mocked(weatherService.fetch4DayForecast).mockResolvedValue(forecast4DayData())
  vi.mocked(weatherService.fetchAirQuality).mockResolvedValue(airQualityData())
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
    // __APP_VERSION__ is injected by vite.config.ts define; assert the shape
    // rather than an exact version so bumps don't break the test.
    expect(await screen.findByText(/v1\.4\./)).toBeInTheDocument()
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
