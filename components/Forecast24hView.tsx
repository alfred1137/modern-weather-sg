import React, { useState } from 'react'
import { Forecast24h } from '../types'
import { getWeatherIcon, SG_REGIONS } from '../constants'
import SyncFooter from './SyncFooter'
import { useTheme } from '../context/ThemeContext'

interface Props {
  data: Forecast24h | null
}

const Forecast24hView: React.FC<Props> = ({ data }) => {
  const [activePeriodIdx, setActivePeriodIdx] = useState(0)
  const { theme } = useTheme()

  if (!data)
    return <div className="text-center p-8 text-sm text-subtext0">Synchronizing forecast...</div>

  const getPeriodLabel = (startStr: string) => {
    const hour = new Date(startStr).getHours()
    if (hour >= 5 && hour < 12) return 'Morning'
    if (hour >= 12 && hour < 18) return 'Afternoon'
    if (hour >= 18 && hour < 23) return 'Evening'
    return 'Night'
  }

  const currentPeriod = data.periods[activePeriodIdx]

  const mapImageStyle =
    theme === 'latte'
      ? {
          opacity: 0.6,
          filter: 'contrast(0.4) brightness(1.5) grayscale(1)',
          mixBlendMode: 'multiply' as const,
        }
      : {
          opacity: 0.2,
          filter: 'contrast(1.25) brightness(1.0) grayscale(1)',
          mixBlendMode: 'screen' as const,
        }

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fadeIn">
      <div className="flex flex-col gap-4">
        <header className="flex justify-between items-start gap-2">
          <div className="flex flex-col gap-1 pr-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-text leading-none">
              24-Hour Forecast
            </h1>
          </div>

          <div className="hidden sm:flex flex-col items-end shrink-0">
            <div className="glass p-1 rounded-xl flex flex-row border border-surface1/20 w-auto bg-surface0/30">
              {data.periods.map((period, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePeriodIdx(idx)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                    activePeriodIdx === idx
                      ? 'bg-blue text-mantle'
                      : 'text-overlay1 hover:text-text'
                  }`}
                >
                  {getPeriodLabel(period.time.start)}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="sm:hidden w-full glass p-1 rounded-xl border border-surface1/20 overflow-hidden bg-surface0/30">
          <div className="flex flex-row w-full gap-1">
            {data.periods.map((period, idx) => (
              <button
                key={idx}
                onClick={() => setActivePeriodIdx(idx)}
                className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  activePeriodIdx === idx ? 'bg-blue text-mantle' : 'text-overlay1 hover:text-text'
                }`}
              >
                {getPeriodLabel(period.time.start)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex flex-col gap-4">
        <div className="glass rounded-none sm:rounded-3xl overflow-visible sm:overflow-hidden relative aspect-[1.6/1] w-auto -mx-4 sm:mx-auto sm:w-full max-w-5xl border sm:border-surface1/20 shadow-md bg-base transition-colors duration-300">
          <img
            src="https://www.weather.gov.sg/mobile/wp-content/themes/wiptheme/assets/img/rain-lighting_map_988.jpg"
            style={mapImageStyle}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300"
            alt="Singapore Background"
          />
          <div className="absolute inset-0 z-10">
            {SG_REGIONS.map((region) => {
              const forecast =
                currentPeriod.regions[region.id as keyof typeof currentPeriod.regions]
              return (
                <div
                  key={region.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer origin-center scale-[0.8] sm:scale-100 transition-transform"
                  style={{ left: region.x, top: region.y }}
                >
                  <div className="relative mb-1 sm:mb-2">
                    <div className="bg-mantle/60 p-2 md:p-3 rounded-full border border-surface1/20 backdrop-blur-md group-hover:scale-110 transition-transform flex items-center justify-center shadow-sm">
                      <div className="scale-[0.7] md:scale-100">
                        {getWeatherIcon(forecast as string)}
                      </div>
                    </div>
                  </div>
                  <div className="bg-crust/40 backdrop-blur-sm px-3 md:px-5 py-1 md:py-2 rounded-lg border border-surface1/10 text-center">
                    <span className="text-[13px] md:text-xs font-semibold text-subtext0 block mb-0.5">
                      {region.name}
                    </span>
                    <span className="text-[13px] md:text-sm text-blue font-semibold block whitespace-normal leading-tight">
                      {forecast}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto w-full items-stretch">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <div className="bg-surface0/60 px-6 md:px-8 py-5 md:py-6 rounded-2xl border border-surface1/20 flex flex-col justify-between flex-1 min-h-[150px] transition-colors hover:border-peach/20 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm font-semibold text-subtext0">Temperature</span>
              <i className="fas fa-temperature-half text-peach text-xl md:text-2xl"></i>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-text flex items-center gap-4">
                {data.general.temperature.low}°
                <span className="text-overlay0 font-bold opacity-40 text-2xl md:text-3xl lg:text-4xl">
                  ~
                </span>
                {data.general.temperature.high}°C
              </span>
            </div>
            <div className="h-0 md:h-2"></div>
          </div>

          <div className="bg-surface0/60 px-6 md:px-8 py-5 md:py-6 rounded-2xl border border-surface1/20 flex flex-col justify-between flex-1 min-h-[150px] transition-colors hover:border-blue/20 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm font-semibold text-subtext0">Humidity</span>
              <i className="fas fa-droplet text-blue text-xl md:text-2xl"></i>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-text flex items-center gap-4">
                {data.general.relative_humidity.low}%
                <span className="text-overlay0 font-bold opacity-40 text-2xl md:text-3xl lg:text-4xl">
                  -
                </span>
                {data.general.relative_humidity.high}%
              </span>
            </div>
            <div className="h-0 md:h-2"></div>
          </div>
        </div>

        <div className="lg:col-span-2 flex">
          <div className="bg-surface0/60 p-6 md:p-8 rounded-2xl border border-surface1/20 flex flex-col items-center justify-between w-full transition-colors hover:border-teal/20 shadow-sm">
            <div className="w-full text-left">
              <span className="text-xs md:text-sm font-semibold text-subtext0">Wind</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6">
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-text tracking-tighter uppercase leading-none">
                {data.general.wind.direction}
              </h2>
              <p className="text-subtext0 text-xs md:text-sm font-semibold">
                {data.general.wind.speed.low} - {data.general.wind.speed.high} km/h
              </p>
            </div>
          </div>
        </div>
      </div>

      <SyncFooter timestamp={data.updateTimestamp} className="max-w-6xl mx-auto mb-12" />
    </div>
  )
}

export default Forecast24hView
