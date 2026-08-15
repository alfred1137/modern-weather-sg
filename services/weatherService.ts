import {
  NowcastData,
  Forecast24h,
  Forecast4Day,
  AirQualityData,
  PSIRegionReadings,
  RegionKey,
} from '../types'

const BASE_URL = 'https://sgw-proxy.alfred1137.workers.dev/api'

const REGIONS: RegionKey[] = ['west', 'east', 'central', 'south', 'north']

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
    periods: record.periods.map((p: any) => ({
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
    items: record.forecasts.map((f: any) => ({
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
