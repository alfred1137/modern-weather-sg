import React, { useState } from 'react'
import { AirQualityData, RegionKey } from '../types'
import {
  SG_REGIONS,
  PSI_BANDS,
  PM25_BANDS,
  getPSIColor,
  getPSIBand,
  getPM25Color,
  getPM25Band,
} from '../constants'
import SyncFooter from './SyncFooter'
import { useTheme } from '../context/ThemeContext'

interface Props {
  data: AirQualityData | null
}

type Mode = 'psi' | 'pm25'

const SUB_INDICES: Array<{
  key: keyof NonNullable<AirQualityData['psi']['readings'][RegionKey]>
  label: string
}> = [
  { key: 'pm25_sub_index', label: 'PM2.5' },
  { key: 'pm10_sub_index', label: 'PM10' },
  { key: 'so2_sub_index', label: 'SO2' },
  { key: 'o3_sub_index', label: 'O3' },
  { key: 'co_sub_index', label: 'CO' },
  { key: 'no2_one_hour_max', label: 'NO2' },
]

const PSIView: React.FC<Props> = ({ data }) => {
  const [mode, setMode] = useState<Mode>('psi')
  const [selectedRegion, setSelectedRegion] = useState<RegionKey | null>(null)
  const { theme } = useTheme()

  if (!data)
    return <div className="text-center p-8 text-sm text-overlay1">Synchronizing air quality...</div>

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

  const valueFor = (region: RegionKey): number =>
    mode === 'psi' ? data.psi.readings[region].psi_twenty_four_hourly : data.pm25.readings[region]

  const bandFor = (region: RegionKey): string =>
    mode === 'psi' ? getPSIBand(valueFor(region)) : getPM25Band(valueFor(region))

  const colorFor = (region: RegionKey): string =>
    mode === 'psi' ? getPSIColor(valueFor(region)) : getPM25Color(valueFor(region))

  const activeTimestamp = mode === 'psi' ? data.psi.updateTimestamp : data.pm25.updateTimestamp
  const activeBands = mode === 'psi' ? PSI_BANDS : PM25_BANDS
  const unit = mode === 'psi' ? 'PSI' : 'µg/m³'

  const detailRegion = selectedRegion
  const detailValue = detailRegion ? valueFor(detailRegion) : null
  const detailReadings = mode === 'psi' && detailRegion ? data.psi.readings[detailRegion] : null

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fadeIn">
      <div className="flex flex-col gap-4">
        <header className="flex justify-between items-start gap-2">
          <div className="flex flex-col gap-1 pr-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-text leading-none">
              Air Quality
            </h1>
          </div>

          <div className="hidden sm:flex flex-col items-end shrink-0">
            <div className="glass p-1 rounded-xl flex flex-row border border-surface1/20 w-auto bg-surface0/30">
              <button
                onClick={() => setMode('pm25')}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  mode === 'pm25' ? 'bg-blue text-mantle' : 'text-overlay1 hover:text-text'
                }`}
              >
                <i className="fas fa-microscope text-[10px]"></i> 1-hr PM2.5
              </button>
              <button
                onClick={() => setMode('psi')}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  mode === 'psi' ? 'bg-blue text-mantle' : 'text-overlay1 hover:text-text'
                }`}
              >
                <i className="fas fa-gauge-high text-[10px]"></i> 24-hr PSI
              </button>
            </div>
          </div>
        </header>

        <div className="sm:hidden w-full glass p-1 rounded-xl border border-surface1/20 overflow-hidden bg-surface0/30">
          <div className="flex flex-row w-full gap-1">
            <button
              onClick={() => setMode('pm25')}
              className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                mode === 'pm25' ? 'bg-blue text-mantle' : 'text-overlay1 hover:text-text'
              }`}
            >
              <i className="fas fa-microscope text-[8px]"></i> 1-hr PM2.5
            </button>
            <button
              onClick={() => setMode('psi')}
              className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                mode === 'psi' ? 'bg-blue text-mantle' : 'text-overlay1 hover:text-text'
              }`}
            >
              <i className="fas fa-gauge-high text-[8px]"></i> 24-hr PSI
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col gap-4">
        <div className="glass rounded-none sm:rounded-3xl overflow-hidden relative aspect-[1.6/1] w-auto -mx-4 sm:mx-auto sm:w-full max-w-5xl border sm:border-surface1/20 shadow-md bg-base transition-colors duration-300">
          <img
            src="https://www.weather.gov.sg/mobile/wp-content/themes/wiptheme/assets/img/rain-lighting_map_988.jpg"
            style={mapImageStyle}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300"
            alt="Singapore Background"
          />
          <div className="absolute inset-0 z-10">
            {SG_REGIONS.map((region) => {
              const key = region.id as RegionKey
              const value = valueFor(key)
              const colorClass = colorFor(key)
              const isActive = selectedRegion === key
              return (
                <div
                  key={region.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer origin-center scale-[0.65] sm:scale-100 transition-transform ${
                    isActive ? 'z-30' : 'z-10'
                  }`}
                  style={{ left: region.x, top: region.y }}
                  onMouseEnter={() => setSelectedRegion(key)}
                  onMouseLeave={() => setSelectedRegion(null)}
                  onClick={() => setSelectedRegion(key)}
                >
                  <div className="relative mb-1 sm:mb-2">
                    <div
                      className={`bg-mantle/60 p-2 md:p-3 rounded-full border border-surface1/20 shadow-sm backdrop-blur-md group-hover:scale-110 transition-transform flex items-center justify-center ${colorClass}`}
                    >
                      <span className="text-xs md:text-lg font-bold">{value}</span>
                    </div>
                  </div>
                  <div className="bg-crust/40 backdrop-blur-sm px-3 md:px-5 py-1 md:py-2 rounded-lg border border-surface1/10 text-center min-w-[80px] md:min-w-[100px]">
                    <span className="text-[9px] md:text-[11px] font-semibold text-overlay2 block mb-0.5">
                      {region.name}
                    </span>
                    <span
                      className={`text-[10px] md:text-sm font-semibold block whitespace-normal leading-tight ${colorClass}`}
                    >
                      {bandFor(key)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="absolute bottom-4 right-4 pointer-events-none z-20">
            <div className="bg-mantle/90 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-surface1/20 text-xs font-semibold text-text flex items-center gap-2">
              <i className="fas fa-hand-pointer text-blue"></i>
              <span>Tap regions</span>
            </div>
          </div>
        </div>

        <div className="min-h-[70px] md:min-h-[80px] flex items-center justify-center max-w-5xl mx-auto w-full">
          {detailRegion && detailValue !== null ? (
            <div className="w-full bg-surface0/80 px-4 py-4 md:px-6 md:py-5 rounded-2xl border border-blue/20 animate-in fade-in zoom-in-95 duration-200 flex flex-col items-stretch gap-3 md:gap-4">
              <div className="flex flex-row items-stretch gap-3 md:gap-6">
                <div className="flex-1 flex flex-col justify-center text-left min-w-0">
                  <span className="text-[10px] md:text-xs font-semibold text-blue/80 mb-1">
                    {mode === 'psi' ? '24-hr PSI' : '1-hr PM2.5'}
                  </span>
                  <h2 className="text-lg md:text-2xl font-bold text-text leading-tight truncate">
                    {detailRegion}
                  </h2>
                </div>
                <div className="flex-1 flex items-center justify-center gap-2 md:gap-3 bg-surface2/20 px-3 py-2 md:px-4 md:py-2.5 rounded-xl border border-surface1/20 min-w-0">
                  <span className={`text-lg md:text-3xl font-bold ${colorFor(detailRegion)}`}>
                    {detailValue}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-xs font-semibold text-overlay1">
                      {unit}
                    </span>
                    <span
                      className={`text-[10px] md:text-xs font-semibold ${colorFor(detailRegion)}`}
                    >
                      {bandFor(detailRegion)}
                    </span>
                  </div>
                </div>
              </div>

              {mode === 'psi' && detailReadings && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 pt-3 border-t border-surface1/20">
                  {SUB_INDICES.map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex flex-col items-center gap-0.5 bg-surface0/50 rounded-lg py-2 px-1"
                    >
                      <span className="text-[9px] md:text-[11px] font-semibold text-overlay1">
                        {label}
                      </span>
                      <span
                        className={`text-xs md:text-sm font-semibold ${getPSIColor(detailReadings[key])}`}
                      >
                        {detailReadings[key]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full py-8 text-center border border-dashed border-surface1/50 rounded-xl">
              <p className="text-xs md:text-sm font-medium text-overlay1">
                Select a region on the map
              </p>
            </div>
          )}
        </div>

        <div className="bg-surface0/60 rounded-2xl px-5 py-5 md:px-6 md:py-6 border border-surface1/20 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-4 md:mb-5">
            <i className="fas fa-list-ul text-blue text-xs"></i>
            <span className="text-xs md:text-sm font-semibold text-overlay1">
              {mode === 'psi' ? 'PSI bands' : '1-hr PM2.5 bands'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
            {activeBands.map((band) => (
              <div
                key={band.label}
                className="flex items-center gap-2 md:gap-2.5 bg-surface0/50 rounded-lg px-3 py-2 border border-surface1/10"
              >
                <span
                  className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0 ${band.dot}`}
                ></span>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] md:text-xs font-semibold text-text leading-tight">
                    {band.label}
                  </span>
                  <span className="text-[9px] md:text-[11px] text-overlay0 leading-tight">
                    {band.range}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <SyncFooter timestamp={activeTimestamp} className="max-w-5xl mx-auto" />
      </div>
    </div>
  )
}

export default PSIView
