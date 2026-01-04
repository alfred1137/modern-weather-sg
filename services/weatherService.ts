
import { NowcastData, Forecast24h, Forecast4Day, FloodAlert } from '../types';

const BASE_URL = 'https://api-open.data.gov.sg/v2/real-time/api';

export const fetchNowcast = async (): Promise<NowcastData> => {
  const res = await fetch(`${BASE_URL}/two-hr-forecast`);
  if (!res.ok) throw new Error('Failed to fetch nowcast');
  const json = await res.json();
  const item = json.data.items[0];
  return {
    updateTimestamp: item.update_timestamp,
    validPeriod: {
      start: item.valid_period.start,
      end: item.valid_period.end
    },
    items: item.forecasts
  };
};

export const fetch24hForecast = async (): Promise<Forecast24h> => {
  const res = await fetch(`${BASE_URL}/twenty-four-hr-forecast`);
  if (!res.ok) throw new Error('Failed to fetch 24h forecast');
  const json = await res.json();
  const record = json.data.records[0];
  return {
    updateTimestamp: record.updatedTimestamp,
    validPeriod: {
      start: record.general.validPeriod.start,
      end: record.general.validPeriod.end
    },
    general: {
      forecast: record.general.forecast.text,
      relative_humidity: {
        low: record.general.relativeHumidity.low,
        high: record.general.relativeHumidity.high
      },
      temperature: {
        low: record.general.temperature.low,
        high: record.general.temperature.high
      },
      wind: {
        speed: {
          low: record.general.wind.speed.low,
          high: record.general.wind.speed.high
        },
        direction: record.general.wind.direction
      }
    },
    periods: record.periods.map((p: any) => ({
      time: {
        start: p.timePeriod.start,
        end: p.timePeriod.end
      },
      regions: {
        west: p.regions.west.text,
        east: p.regions.east.text,
        central: p.regions.central.text,
        south: p.regions.south.text,
        north: p.regions.north.text
      }
    }))
  };
};

export const fetch4DayForecast = async (): Promise<Forecast4Day> => {
  const res = await fetch(`${BASE_URL}/four-day-outlook`);
  if (!res.ok) throw new Error('Failed to fetch 4-day forecast');
  const json = await res.json();
  const record = json.data.records[0];
  return {
    updateTimestamp: record.updatedTimestamp,
    items: record.forecasts.map((f: any) => ({
      date: f.timestamp,
      forecast: f.forecast.text,
      relative_humidity: {
        low: f.relativeHumidity.low,
        high: f.relativeHumidity.high
      },
      temperature: {
        low: f.temperature.low,
        high: f.temperature.high
      },
      wind: {
        speed: {
          low: f.wind.speed.low,
          high: f.wind.speed.high
        },
        direction: f.wind.direction
      }
    }))
  };
};

export const fetchFloodAlerts = async (): Promise<FloodAlert[]> => {
  const res = await fetch(`${BASE_URL}/weather/flood-alerts`);
  if (!res.ok) throw new Error('Failed to fetch flood alerts');
  const json = await res.json();
  const alerts: FloodAlert[] = [];
  
  if (json.data && json.data.records) {
    json.data.records.forEach((record: any) => {
      const { datetime, updatedTimestamp, item } = record;
      if (item && item.readings) {
        item.readings.forEach((reading: any) => {
          alerts.push({
            datetime,
            updatedTimestamp,
            msgType: item.msgType,
            headline: reading.headline,
            description: reading.description,
            instruction: reading.instruction,
            severity: reading.severity,
            areaDesc: reading.area?.areaDesc || ''
          });
        });
      }
    });
  }
  return alerts;
};
