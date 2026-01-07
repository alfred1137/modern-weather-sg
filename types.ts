
export interface NowcastArea {
  area: string;
  forecast: string;
}

export interface NowcastData {
  updateTimestamp: string;
  validPeriod: { start: string; end: string };
  items: NowcastArea[];
}

export interface Forecast24h {
  updateTimestamp: string;
  validPeriod: { start: string; end: string };
  general: {
    forecast: string;
    relative_humidity: { low: number; high: number };
    temperature: { low: number; high: number };
    wind: { speed: { low: number; high: number }; direction: string };
  };
  periods: Array<{
    time: { start: string; end: string };
    regions: {
      west: string;
      east: string;
      central: string;
      south: string;
      north: string;
    };
  }>;
}

export interface Forecast4Day {
  updateTimestamp: string;
  items: Array<{
    date: string;
    forecast: string;
    summary: string;
    relative_humidity: { low: number; high: number };
    temperature: { low: number; high: number };
    wind: { speed: { low: number; high: number }; direction: string };
  }>;
}

export interface FloodAlert {
  datetime: string;
  updatedTimestamp: string;
  msgType: string;
  headline: string;
  description: string;
  instruction: string;
  severity: string;
  areaDesc: string;
}

export enum AppTab {
  NOWCAST = 'nowcast',
  RAIN_AREAS = 'rain-areas',
  FLOOD_WARNING = 'flood-warning',
  FORECAST_24H = 'forecast-24h',
  FORECAST_4DAY = 'forecast-4day'
}

export interface WeatherUIState {
  nowcast: NowcastData | null;
  forecast24h: Forecast24h | null;
  forecast4d: Forecast4Day | null;
  floodAlerts: FloodAlert[] | null;
  loading: boolean;
  error: string | null;
}
