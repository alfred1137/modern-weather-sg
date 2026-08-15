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
    return (
      <div className="text-center p-8 text-xs font-bold uppercase opacity-50 tracking-widest text-text">
        Synchronizing Air Quality...
      </div>
    )

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
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 md:gap-6">
        <div className="flex flex-col gap-1 pr-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-text leading-none">
            Air Quality
          </h1>
          <p className="text-overlay1 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-2">
            Pollutant Standards Index & Particulate Matter
          </p>
        </div>

        <div className="glass p-1 rounded-xl flex flex-row border border-surface1/20 w-auto bg-surface0/30 self-start lg:self-auto">
          <button
            onClick={() => setMode('pm25')}
            className={`px-4 md:px-6 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              mode === 'pm25'
                ? 'bg-blue text-mantle shadow-lg shadow-blue/20'
                : 'text-overlay1 hover:text-text'
            }`}
          >
            <i className="fas fa-microscope text-[10px]"></i> 1-hr PM2.5
          </button>
          <button
            onClick={() => setMode('psi')}
            className={`px-4 md:px-6 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              mode === 'psi'
                ? 'bg-blue text-mantle shadow-lg shadow-blue/20'
                : 'text-overlay1 hover:text-text'
            }`}
          >
            <i className="fas fa-gauge-high text-[10px]"></i> 24-hr PSI
          </button>
        </div>
      </header>

      <div className="relative w-full bg-base overflow-hidden aspect-[1.6/1] sm:aspect-[2.4/1] glass rounded-none sm:rounded-[32px] md:rounded-[40px] border sm:border-surface1/20 shadow-2xl transition-colors duration-300 -mx-4 sm:mx-auto sm:max-w-5xl">
        <img
          src="https://www.weather.gov.sg/mobile/wp-content/themes/wiptheme/assets/img/rain-lighting_map_988.jpg"
          style={mapImageStyle}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-300"
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
                  <div className="absolute inset-0 bg-blue/10 rounded-full blur-xl scale-0 group-hover:scale-150 transition-all duration-500"></div>
                  <div
                    className={`bg-mantle/60 p-2 md:p-3 rounded-full border border-surface1/20 shadow-2xl backdrop-blur-md group-hover:scale-110 transition-transform flex items-center justify-center ${colorClass}`}
                  >
                    <span className="text-xs md:text-lg font-black drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                      {value}
                    </span>
                  </div>
                </div>
                <div className="bg-crust/40 backdrop-blur-sm px-3 md:px-5 py-1 md:py-2 rounded-2xl border border-surface1/10 text-center min-w-[80px] md:min-w-[100px]">
                  <span className="text-[7px] md:text-[9px] font-black text-overlay2 uppercase tracking-[0.3em] block mb-0.5">
                    {region.name}
                  </span>
                  <span
                    className={`text-[9px] md:text-xs font-black uppercase tracking-tight block whitespace-normal leading-tight ${colorClass}`}
                  >
                    {bandFor(key)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="absolute bottom-4 right-4 pointer-events-none z-20">
          <div className="bg-mantle/80 backdrop-blur-md px-3 py-1.5 md:px-5 md:py-2 rounded-full border border-blue/30 text-[8px] md:text-[10px] font-black text-text uppercase tracking-widest flex items-center gap-2 shadow-xl ring-1 ring-blue/20">
            <i className="fas fa-hand-pointer text-blue"></i>
            <span>Tap Regions</span>
          </div>
        </div>
      </div>

      <div className="min-h-[70px] md:min-h-[80px] flex items-center justify-center max-w-5xl mx-auto w-full">
        {detailRegion && detailValue !== null ? (
          <div className="w-full glass px-4 py-4 md:px-8 md:py-6 rounded-[24px] border border-blue/30 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col items-stretch gap-3 md:gap-4 bg-surface0/30">
            <div className="flex flex-row items-stretch gap-3 md:gap-6">
              <div className="flex-1 flex flex-col justify-center text-left min-w-0">
                <span className="text-[6px] md:text-[9px] font-black text-blue/80 uppercase tracking-[0.2em] mb-1">
                  {mode === 'psi' ? '24-hr PSI' : '1-hr PM2.5'}
                </span>
                <h2 className="text-[14px] md:text-2xl font-black text-text uppercase tracking-tight leading-tight truncate">
                  {detailRegion}
                </h2>
              </div>
              <div className="flex-1 flex items-center justify-center gap-2 md:gap-3 bg-surface2/20 px-3 py-2 md:px-6 md:py-3 rounded-2xl border border-surface1/20 min-w-0">
                <span className={`text-[16px] md:text-3xl font-black ${colorFor(detailRegion)}`}>
                  {detailValue}
                </span>
                <div className="flex flex-col">
                  <span className="text-[8px] md:text-[10px] font-black text-overlay1 uppercase tracking-wider">
                    {unit}
                  </span>
                  <span
                    className={`text-[8px] md:text-[10px] font-black uppercase tracking-wider ${colorFor(detailRegion)}`}
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
                    className="flex flex-col items-center gap-0.5 bg-mantle/30 rounded-xl py-2 md:py-2.5 px-1"
                  >
                    <span className="text-[7px] md:text-[9px] font-black text-overlay1 uppercase tracking-[0.2em]">
                      {label}
                    </span>
                    <span
                      className={`text-[11px] md:text-sm font-black ${getPSIColor(detailReadings[key])}`}
                    >
                      {detailReadings[key]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full py-8 text-center border border-dashed border-surface1/50 rounded-[24px]">
            <p className="text-[9px] md:text-[11px] font-black text-overlay1 uppercase tracking-[0.4em]">
              Select a region on the map
            </p>
          </div>
        )}
      </div>

      <div className="glass rounded-[24px] md:rounded-[32px] px-5 py-5 md:px-8 md:py-6 border border-surface1/20 max-w-5xl mx-auto w-full bg-surface0/20">
        <div className="flex items-center gap-2 mb-4 md:mb-5">
          <i className="fas fa-list-ul text-blue text-xs"></i>
          <span className="text-[9px] md:text-[11px] font-black text-overlay1 uppercase tracking-[0.3em]">
            {mode === 'psi' ? 'PSI Bands' : '1-hr PM2.5 Bands'}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
          {activeBands.map((band) => (
            <div
              key={band.label}
              className="flex items-center gap-2 md:gap-2.5 bg-mantle/30 rounded-xl px-3 py-2 md:px-3.5 md:py-2.5 border border-surface1/10"
            >
              <span
                className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0 ${band.dot}`}
              ></span>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] md:text-[10px] font-black text-text uppercase tracking-wide leading-tight">
                  {band.label}
                </span>
                <span className="text-[7px] md:text-[9px] font-bold text-overlay0 uppercase tracking-wide leading-tight">
                  {band.range}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SyncFooter timestamp={activeTimestamp} className="max-w-5xl mx-auto" />
    </div>
  )
}

export default PSIView
