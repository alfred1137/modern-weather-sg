import {
  NowcastData,
  Forecast24h,
  Forecast4Day,
  AirQualityData,
  PSIRegionReadings,
  RegionKey,
  MycmaqForecast,
} from '../types'

const BASE_URL = 'https://sgw-proxy.alfred1137.workers.dev/api'
const MYCMAQ_URL = 'https://sgw-proxy.alfred1137.workers.dev/mycmaq'

export const MYCMAQ_DEFAULT_VAR = 'PM25_TOT'
export const MYCMAQ_DEFAULT_DOMAIN = 'd02'

const REGIONS: RegionKey[] = ['west', 'east', 'central', 'south', 'north']

// Minimal shapes of the data.gov.sg API records consumed below (the full API
// payload is large; only the fields the app uses are typed).
interface Api24hPeriod {
  timePeriod: { start: string; end: string }
  regions: {
    west: { text: string }
    east: { text: string }
    central: { text: string }
    south: { text: string }
    north: { text: string }
  }
}

interface Api4DayForecast {
  timestamp: string
  forecast: { text: string; summary: string }
  relativeHumidity: { low: number; high: number }
  temperature: { low: number; high: number }
  wind: { speed: { low: number; high: number }; direction: string }
}

export const fetchNowcast = async (): Promise<NowcastData> => {
  const res = await fetch(`${BASE_URL}/two-hr-forecast`)
  if (!res.ok) throw new Error('Failed to fetch nowcast')
  const json = await res.json()
  const item = json.data.items[0]
  return {
    updateTimestamp: item.update_timestamp,
    validPeriod: {
      start: item.valid_period.start,
      end: item.valid_period.end,
    },
    items: item.forecasts,
  }
}

export const fetch24hForecast = async (): Promise<Forecast24h> => {
  const res = await fetch(`${BASE_URL}/twenty-four-hr-forecast`)
  if (!res.ok) throw new Error('Failed to fetch 24h forecast')
  const json = await res.json()
  const record = json.data.records[0]
  return {
    updateTimestamp: record.updatedTimestamp,
    validPeriod: {
      start: record.general.validPeriod.start,
      end: record.general.validPeriod.end,
    },
    general: {
      forecast: record.general.forecast.text,
      relative_humidity: {
        low: record.general.relativeHumidity.low,
        high: record.general.relativeHumidity.high,
      },
      temperature: {
        low: record.general.temperature.low,
        high: record.general.temperature.high,
      },
      wind: {
        speed: {
          low: record.general.wind.speed.low,
          high: record.general.wind.speed.high,
        },
        direction: record.general.wind.direction,
      },
    },
    periods: record.periods.map((p: Api24hPeriod) => ({
      time: {
        start: p.timePeriod.start,
        end: p.timePeriod.end,
      },
      regions: {
        west: p.regions.west.text,
        east: p.regions.east.text,
        central: p.regions.central.text,
        south: p.regions.south.text,
        north: p.regions.north.text,
      },
    })),
  }
}

export const fetch4DayForecast = async (): Promise<Forecast4Day> => {
  const res = await fetch(`${BASE_URL}/four-day-outlook`)
  if (!res.ok) throw new Error('Failed to fetch 4-day forecast')
  const json = await res.json()
  const record = json.data.records[0]
  return {
    updateTimestamp: record.updatedTimestamp,
    items: record.forecasts.map((f: Api4DayForecast) => ({
      date: f.timestamp,
      forecast: f.forecast.text,
      summary: f.forecast.summary,
      relative_humidity: {
        low: f.relativeHumidity.low,
        high: f.relativeHumidity.high,
      },
      temperature: {
        low: f.temperature.low,
        high: f.temperature.high,
      },
      wind: {
        speed: {
          low: f.wind.speed.low,
          high: f.wind.speed.high,
        },
        direction: f.wind.direction,
      },
    })),
  }
}

export const fetchAirQuality = async (): Promise<AirQualityData> => {
  const [psiRes, pm25Res] = await Promise.all([fetch(`${BASE_URL}/psi`), fetch(`${BASE_URL}/pm25`)])
  if (!psiRes.ok) throw new Error('Failed to fetch PSI')
  if (!pm25Res.ok) throw new Error('Failed to fetch PM2.5')
  const [psiJson, pm25Json] = await Promise.all([psiRes.json(), pm25Res.json()])
  const psiItem = psiJson.data.items[0]
  const pm25Item = pm25Json.data.items[0]

  const psiReadings = {} as Record<RegionKey, PSIRegionReadings>
  const pm25Readings = {} as Record<RegionKey, number>
  for (const region of REGIONS) {
    psiReadings[region] = {
      psi_twenty_four_hourly: psiItem.readings.psi_twenty_four_hourly[region],
      pm25_sub_index: psiItem.readings.pm25_sub_index[region],
      pm10_sub_index: psiItem.readings.pm10_sub_index[region],
      so2_sub_index: psiItem.readings.so2_sub_index[region],
      o3_sub_index: psiItem.readings.o3_sub_index[region],
      co_sub_index: psiItem.readings.co_sub_index[region],
      no2_one_hour_max: psiItem.readings.no2_one_hour_max[region],
    }
    pm25Readings[region] = pm25Item.readings.pm25_one_hourly[region]
  }

  return {
    psi: {
      updateTimestamp: psiItem.updatedTimestamp,
      readings: psiReadings,
    },
    pm25: {
      updateTimestamp: pm25Item.updatedTimestamp,
      readings: pm25Readings,
    },
  }
}

export const fetchMycmaqLatestCycle = async (): Promise<string> => {
  const res = await fetch(`${MYCMAQ_URL}/latest`)
  if (!res.ok) throw new Error('Failed to fetch MyCMAQ cycle')
  const json = await res.json()
  if (!json.cycle) throw new Error('Failed to fetch MyCMAQ cycle')
  return json.cycle as string
}

// PM2.5 forecast over Domain 02 (Malaysia) via the sgw-proxy MyCMAQ
// passthrough (MetMalaysia publishes PNGs + manifest.json only — no API).
// Frames are hourly (~120 per daily cycle); each carries its LST valid time.
export const fetchMycmaqForecast = async (
  cycle?: string,
  variable: string = MYCMAQ_DEFAULT_VAR,
  domain: string = MYCMAQ_DEFAULT_DOMAIN,
): Promise<MycmaqForecast> => {
  const params = new URLSearchParams({ var: variable, domain })
  if (cycle) params.set('cycle', cycle)
  const res = await fetch(`${MYCMAQ_URL}/frames?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch MyCMAQ forecast')
  const json = (await res.json()) as MycmaqForecast
  if (!Array.isArray(json.frames) || json.frames.length === 0) {
    throw new Error('Failed to fetch MyCMAQ forecast')
  }
  return json
}

// Worker-proxied PNG URL for a frame (6h edge cache, avoids hotlink issues).
export const mycmaqImageUrl = (frame: { proxyPath: string }): string =>
  `https://sgw-proxy.alfred1137.workers.dev${frame.proxyPath}`
