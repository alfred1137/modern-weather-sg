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
