import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchNowcast,
  fetch24hForecast,
  fetch4DayForecast,
  fetchAirQuality,
} from '../services/weatherService'

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

describe('fetchAirQuality', () => {
  const psiResponse = {
    data: {
      items: [
        {
          updatedTimestamp: '2024-01-01T10:00:00',
          readings: {
            psi_twenty_four_hourly: { west: 42, east: 55, central: 48, south: 40, north: 38 },
            pm25_sub_index: { west: 20, east: 26, central: 22, south: 19, north: 18 },
            pm10_sub_index: { west: 25, east: 30, central: 24, south: 22, north: 20 },
            so2_sub_index: { west: 8, east: 5, central: 6, south: 4, north: 7 },
            o3_sub_index: { west: 30, east: 35, central: 32, south: 28, north: 33 },
            co_sub_index: { west: 10, east: 12, central: 11, south: 9, north: 8 },
            no2_one_hour_max: { west: 15, east: 18, central: 16, south: 14, north: 13 },
          },
        },
      ],
    },
  }
  const pm25Response = {
    data: {
      items: [
        {
          updatedTimestamp: '2024-01-01T10:00:00',
          readings: {
            pm25_one_hourly: { west: 19, east: 28, central: 38, south: 18, north: 17 },
          },
        },
      ],
    },
  }

  it('maps API responses to AirQualityData', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(psiResponse))
      .mockResolvedValueOnce(jsonResponse(pm25Response))

    const result = await fetchAirQuality()

    expect(result.psi.updateTimestamp).toBe('2024-01-01T10:00:00')
    expect(result.psi.readings.west).toEqual({
      psi_twenty_four_hourly: 42,
      pm25_sub_index: 20,
      pm10_sub_index: 25,
      so2_sub_index: 8,
      o3_sub_index: 30,
      co_sub_index: 10,
      no2_one_hour_max: 15,
    })
    expect(result.psi.readings.central.psi_twenty_four_hourly).toBe(48)
    expect(result.pm25.updateTimestamp).toBe('2024-01-01T10:00:00')
    expect(result.pm25.readings).toEqual({
      west: 19,
      east: 28,
      central: 38,
      south: 18,
      north: 17,
    })
  })

  it('throws when PSI fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    await expect(fetchAirQuality()).rejects.toThrow('Failed to fetch PSI')
  })

  it('throws when PM2.5 fetch fails', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(psiResponse)).mockResolvedValueOnce({ ok: false })
    await expect(fetchAirQuality()).rejects.toThrow('Failed to fetch PM2.5')
  })
})
