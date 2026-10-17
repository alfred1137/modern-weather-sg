export interface NowcastArea {
  area: string
  forecast: string
}

export interface NowcastData {
  updateTimestamp: string
  validPeriod: { start: string; end: string }
  items: NowcastArea[]
}

export interface Forecast24h {
  updateTimestamp: string
  validPeriod: { start: string; end: string }
  general: {
    forecast: string
    relative_humidity: { low: number; high: number }
    temperature: { low: number; high: number }
    wind: { speed: { low: number; high: number }; direction: string }
  }
  periods: Array<{
    time: { start: string; end: string }
    regions: {
      west: string
      east: string
      central: string
      south: string
      north: string
    }
  }>
}

export interface Forecast4Day {
  updateTimestamp: string
  items: Array<{
    date: string
    forecast: string
    summary: string
    relative_humidity: { low: number; high: number }
    temperature: { low: number; high: number }
    wind: { speed: { low: number; high: number }; direction: string }
  }>
}

export type RegionKey = 'west' | 'east' | 'central' | 'south' | 'north'

export interface PSIRegionReadings {
  psi_twenty_four_hourly: number
  pm25_sub_index: number
  pm10_sub_index: number
  so2_sub_index: number
  o3_sub_index: number
  co_sub_index: number
  no2_one_hour_max: number
}

export interface PSIData {
  updateTimestamp: string
  readings: Record<RegionKey, PSIRegionReadings>
}

export interface PM25Data {
  updateTimestamp: string
  readings: Record<RegionKey, number>
}

export interface AirQualityData {
  psi: PSIData
  pm25: PM25Data
}

export interface MycmaqFrame {
  file: string
  /** e.g. 20261016_08LST — forecast valid time in Malaysia LST (UTC+8). */
  validKey: string
  /** e.g. 2026-10-16 08:00 LST — display label for the playback timeline. */
  label: string
  /** UTC instant of the valid time (LST minus 8h). */
  iso: string
  /** Direct MetMalaysia PNG URL. */
  url: string
  /** Worker-relative image proxy path, e.g. /mycmaq/image/<cycle>/<file>. */
  proxyPath: string
}

export interface MycmaqForecast {
  cycle: string
  variable: string
  domain: string
  displayUrl: string
  count: number
  /**
   * ISO instant when MetMalaysia published this cycle's imagery (the frame
   * PNG's own Last-Modified, read by the worker). Null/absent when unknown, in
   * which case the source footer is omitted rather than guessing.
   */
  publishedAt?: string | null
  frames: MycmaqFrame[]
}

export enum AppTab {
  NOWCAST = 'nowcast',
  RAIN_AREAS = 'rain-areas',
  AIR_QUALITY = 'air-quality',
  FORECAST_24H = 'forecast-24h',
  FORECAST_4DAY = 'forecast-4day',
}

export interface WeatherUIState {
  nowcast: NowcastData | null
  forecast24h: Forecast24h | null
  forecast4d: Forecast4Day | null
  airQuality: AirQualityData | null
  loading: boolean
  error: string | null
}
