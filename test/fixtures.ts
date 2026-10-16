import { NowcastData, Forecast24h, Forecast4Day, AirQualityData, MycmaqForecast } from '../types'

// Shared mock builders for component tests. Each call returns a fresh object
// so suites can never mutate a fixture and leak state across tests.
// See the component-tests skill for usage conventions.

export const nowcastData = (): NowcastData => ({
  updateTimestamp: '2024-01-01T10:00:00',
  validPeriod: { start: '2024-01-01T10:00:00', end: '2024-01-01T12:00:00' },
  items: [
    { area: 'Ang Mo Kio', forecast: 'Light Rain' },
    { area: 'Bedok', forecast: 'Cloudy' },
    { area: 'Changi', forecast: 'Fair (Day)' },
  ],
})

export const forecast24hData = (): Forecast24h => ({
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
})

export const forecast4DayData = (): Forecast4Day => ({
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
    {
      date: '2024-01-03T00:00:00',
      forecast: 'Thundery Showers',
      summary: 'Afternoon Thundery Showers',
      relative_humidity: { low: 55, high: 90 },
      temperature: { low: 24, high: 32 },
      wind: { speed: { low: 5, high: 15 }, direction: 'S' },
    },
  ],
})

export const airQualityData = (): AirQualityData => {
  const region = {
    psi_twenty_four_hourly: 55,
    pm25_sub_index: 20,
    pm10_sub_index: 30,
    so2_sub_index: 10,
    o3_sub_index: 40,
    co_sub_index: 8,
    no2_one_hour_max: 12,
  }
  return {
    psi: {
      updateTimestamp: '2024-01-01T10:00:00',
      readings: {
        north: { ...region },
        south: { ...region },
        east: { ...region },
        west: { ...region },
        central: { ...region },
      },
    },
    pm25: {
      updateTimestamp: '2024-01-01T10:00:00',
      readings: { north: 15, south: 16, east: 14, west: 18, central: 17 },
    },
  }
}

export const mycmaqForecast = (): MycmaqForecast => ({
  cycle: '20261015_12',
  variable: 'PM25_TOT',
  domain: 'd02',
  displayUrl: 'https://mycmaq.met.gov.my/display_20261015_12.html',
  count: 3,
  frames: [
    {
      file: 'PM25_TOT_d02_20261016_08LST.png',
      validKey: '20261016_08LST',
      label: '2026-10-16 08:00 LST',
      iso: '2026-10-16T00:00:00.000Z',
      url: 'https://mycmaq.met.gov.my/20261015_12/PM25_TOT_d02_20261016_08LST.png',
      proxyPath: '/mycmaq/image/20261015_12/PM25_TOT_d02_20261016_08LST.png',
    },
    {
      file: 'PM25_TOT_d02_20261016_09LST.png',
      validKey: '20261016_09LST',
      label: '2026-10-16 09:00 LST',
      iso: '2026-10-16T01:00:00.000Z',
      url: 'https://mycmaq.met.gov.my/20261015_12/PM25_TOT_d02_20261016_09LST.png',
      proxyPath: '/mycmaq/image/20261015_12/PM25_TOT_d02_20261016_09LST.png',
    },
    {
      file: 'PM25_TOT_d02_20261016_10LST.png',
      validKey: '20261016_10LST',
      label: '2026-10-16 10:00 LST',
      iso: '2026-10-16T02:00:00.000Z',
      url: 'https://mycmaq.met.gov.my/20261015_12/PM25_TOT_d02_20261016_10LST.png',
      proxyPath: '/mycmaq/image/20261015_12/PM25_TOT_d02_20261016_10LST.png',
    },
  ],
})
