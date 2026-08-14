import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchNowcast, fetch24hForecast, fetch4DayForecast } from '../services/weatherService'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

function jsonResponse(data: unknown) {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  } as Response
}

describe('fetchNowcast', () => {
  it('maps API response to NowcastData', async () => {
    const apiResponse = {
      data: {
        items: [
          {
            update_timestamp: '2024-01-01T10:00:00',
            valid_period: { start: '2024-01-01T10:00:00', end: '2024-01-01T12:00:00' },
            forecasts: [
              { area: 'Ang Mo Kio', forecast: 'Light Rain' },
              { area: 'Bedok', forecast: 'Cloudy' },
            ],
          },
        ],
      },
    }
    mockFetch.mockResolvedValue(jsonResponse(apiResponse))

    const result = await fetchNowcast()

    expect(result.updateTimestamp).toBe('2024-01-01T10:00:00')
    expect(result.validPeriod).toEqual({
      start: '2024-01-01T10:00:00',
      end: '2024-01-01T12:00:00',
    })
    expect(result.items).toHaveLength(2)
    expect(result.items[0]).toEqual({ area: 'Ang Mo Kio', forecast: 'Light Rain' })
  })

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false })
    await expect(fetchNowcast()).rejects.toThrow('Failed to fetch nowcast')
  })
})

describe('fetch24hForecast', () => {
  it('maps API response to Forecast24h', async () => {
    const apiResponse = {
      data: {
        records: [
          {
            updatedTimestamp: '2024-01-01T10:00:00',
            general: {
              forecast: { text: 'Partly Cloudy' },
              relativeHumidity: { low: 60, high: 90 },
              temperature: { low: 24, high: 32 },
              wind: { speed: { low: 5, high: 15 }, direction: 'NE' },
              validPeriod: { start: '2024-01-01T10:00:00', end: '2024-01-02T10:00:00' },
            },
            periods: [
              {
                timePeriod: { start: '2024-01-01T10:00:00', end: '2024-01-01T16:00:00' },
                regions: {
                  west: { text: 'Showers' },
                  east: { text: 'Cloudy' },
                  central: { text: 'Partly Cloudy' },
                  south: { text: 'Rain' },
                  north: { text: 'Fair' },
                },
              },
            ],
          },
        ],
      },
    }
    mockFetch.mockResolvedValue(jsonResponse(apiResponse))

    const result = await fetch24hForecast()

    expect(result.general.forecast).toBe('Partly Cloudy')
    expect(result.general.temperature).toEqual({ low: 24, high: 32 })
    expect(result.periods).toHaveLength(1)
    expect(result.periods[0].regions.west).toBe('Showers')
  })

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false })
    await expect(fetch24hForecast()).rejects.toThrow('Failed to fetch 24h forecast')
  })
})

describe('fetch4DayForecast', () => {
  it('maps API response to Forecast4Day', async () => {
    const apiResponse = {
      data: {
        records: [
          {
            updatedTimestamp: '2024-01-01T10:00:00',
            forecasts: [
              {
                timestamp: '2024-01-01',
                forecast: { text: 'Fair', summary: 'Sunny' },
                relativeHumidity: { low: 50, high: 80 },
                temperature: { low: 23, high: 33 },
                wind: { speed: { low: 5, high: 20 }, direction: 'S' },
              },
            ],
          },
        ],
      },
    }
    mockFetch.mockResolvedValue(jsonResponse(apiResponse))

    const result = await fetch4DayForecast()

    expect(result.items).toHaveLength(1)
    expect(result.items[0].date).toBe('2024-01-01')
    expect(result.items[0].forecast).toBe('Fair')
  })

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false })
    await expect(fetch4DayForecast()).rejects.toThrow('Failed to fetch 4-day forecast')
  })
})
