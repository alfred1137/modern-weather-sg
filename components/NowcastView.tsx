import React, { useState } from 'react'
import { NowcastArea, NowcastData } from '../types'
import { getWeatherIcon, AREA_COORDINATES } from '../constants'
import SyncFooter from './SyncFooter'
import { useTheme } from '../context/ThemeContext'

interface Props {
  data: NowcastData | null
}

const NowcastView: React.FC<Props> = ({ data }) => {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('map')
  const [hoveredArea, setHoveredArea] = useState<NowcastArea | null>(null)
  const { theme } = useTheme()

  if (!data) return <div className="text-center p-8 text-overlay1">Loading nowcast...</div>

  const filtered = data.items.filter((i) => i.area.toLowerCase().includes(search.toLowerCase()))

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const MapMarker: React.FC<{ item: NowcastArea }> = ({ item }) => {
    const coords = AREA_COORDINATES[item.area]
    if (!coords) return null

    const isActive = hoveredArea?.area === item.area

    return (
      <div
        className={`absolute transition-transform duration-300 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group ${isActive ? 'z-30' : 'z-10'}`}
        style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
        onMouseEnter={() => setHoveredArea(item)}
        onMouseLeave={() => setHoveredArea(null)}
        onClick={() => setHoveredArea(item)}
      >
        <div
          className={`relative flex items-center justify-center p-0.5 rounded-full transition-transform duration-300 ${isActive ? 'sm:scale-150' : 'sm:group-hover:scale-125'}`}
        >
          <div
            className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} scale-[0.5] sm:scale-85 md:scale-100`}
          >
            {getWeatherIcon(item.forecast)}
          </div>
        </div>
      </div>
    )
  }

  // Theme-aware styles for the map image
  const mapImageStyle =
    theme === 'latte'
      ? {
          opacity: 0.6,
          filter: 'contrast(0.4) brightness(1.5) grayscale(1)',
          mixBlendMode: 'multiply' as const,
        }
      : {
          opacity: 0.2,
          filter: 'contrast(1.25) brightness(0.75) grayscale(1)',
          mixBlendMode: 'screen' as const,
        }

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fadeIn">
      <div className="flex flex-col gap-4">
        <header className="flex justify-between items-start gap-2">
          <div className="flex flex-col gap-1 pr-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-text leading-none">
              Nowcast
            </h1>
            <p className="text-overlay1 text-xs md:text-sm font-medium mt-2 whitespace-nowrap overflow-hidden text-ellipsis">
              2-hour nowcast:{' '}
              <span className="text-subtext1 font-semibold">
                {formatTime(data.validPeriod.start)} ~ {formatTime(data.validPeriod.end)}
              </span>
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end shrink-0">
            <div className="glass p-1 rounded-xl flex flex-row border border-surface1/20 w-auto bg-surface0/30">
              <button
                onClick={() => setViewMode('map')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${viewMode === 'map' ? 'bg-blue text-mantle' : 'text-overlay1 hover:text-text'}`}
              >
                <i className="fas fa-map text-xs"></i> Map
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${viewMode === 'grid' ? 'bg-blue text-mantle' : 'text-overlay1 hover:text-text'}`}
              >
                <i className="fas fa-grip text-xs"></i> Grid
              </button>
            </div>
          </div>
        </header>

        <div className="sm:hidden w-full glass p-1 rounded-xl border border-surface1/20 overflow-hidden bg-surface0/30">
          <div className="flex flex-row w-full gap-1">
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${viewMode === 'map' ? 'bg-blue text-mantle' : 'text-overlay1 hover:text-text'}`}
            >
              <i className="fas fa-map text-xs"></i> Map
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${viewMode === 'grid' ? 'bg-blue text-mantle' : 'text-overlay1 hover:text-text'}`}
            >
              <i className="fas fa-grip text-xs"></i> Grid
            </button>
          </div>
        </div>

        {viewMode === 'grid' && (
          <div className="relative group w-full animate-in slide-in-from-top-2 duration-300">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-overlay1 group-focus-within:text-blue text-xs transition-colors"></i>
            <input
              type="text"
              placeholder="Search area..."
              className="w-full bg-surface0/40 border border-surface1/50 rounded-xl py-3 md:py-3.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue/30 transition-colors placeholder:text-overlay0 text-text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {viewMode === 'map' ? (
        <div className="relative flex flex-col gap-4">
          <div className="glass rounded-none sm:rounded-3xl overflow-hidden relative aspect-[1.6/1] w-auto -mx-4 sm:mx-auto sm:w-full max-w-5xl border sm:border-surface1/20 shadow-md bg-base transition-colors duration-300">
            <img
              src="https://www.weather.gov.sg/mobile/wp-content/themes/wiptheme/assets/img/rain-lighting_map_988.jpg"
              style={mapImageStyle}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-300"
              alt="Singapore Background"
            />

            <div className="absolute inset-0">
              {data.items.map((item, idx) => (
                <MapMarker key={idx} item={item} />
              ))}
            </div>

            <div className="absolute bottom-4 right-4 pointer-events-none z-20">
              <div className="bg-mantle/90 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-surface1/20 text-xs font-semibold text-text flex items-center gap-2">
                <i className="fas fa-hand-pointer text-blue"></i>
                <span>Tap icons</span>
              </div>
            </div>
          </div>

          <div className="min-h-[70px] md:min-h-[80px] flex items-center justify-center max-w-5xl mx-auto w-full">
            {hoveredArea ? (
              <div className="w-full bg-surface0/80 px-4 py-4 md:px-6 md:py-5 rounded-2xl border border-blue/20 animate-in fade-in zoom-in-95 duration-200 flex flex-row items-stretch gap-3 md:gap-6">
                <div className="flex-1 flex flex-col justify-center text-left min-w-0">
                  <span className="text-[10px] md:text-xs font-semibold text-blue/80 mb-1">
                    Forecast
                  </span>
                  <h2 className="text-lg md:text-2xl font-bold text-text leading-tight truncate">
                    {hoveredArea.area}
                  </h2>
                </div>

                <div className="flex-1 flex items-center justify-center gap-2 md:gap-5 bg-surface2/20 px-3 py-2 md:px-4 md:py-2.5 rounded-xl border border-surface1/20 min-w-0">
                  <div className="scale-[0.55] sm:scale-75 md:scale-110 flex-shrink-0 origin-center">
                    {getWeatherIcon(hoveredArea.forecast)}
                  </div>
                  <span className="text-sm md:text-lg font-bold text-blue whitespace-normal leading-tight text-center">
                    {hoveredArea.forecast}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full py-8 text-center border border-dashed border-surface1/50 rounded-xl">
                <p className="text-xs md:text-sm font-medium text-overlay1">
                  Select an area on the map
                </p>
              </div>
            )}
          </div>

          <SyncFooter timestamp={data.updateTimestamp} className="max-w-5xl mx-auto" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-4 md:grid-cols-8 xl:grid-cols-12 gap-[10px] md:gap-4 animate-fadeIn">
            {filtered.map((item, idx) => (
              <div
                key={idx}
                className="col-span-2 md:col-span-2 xl:col-span-3 bg-surface0/60 p-4 rounded-xl flex flex-col items-center text-center justify-center weather-card border border-surface1/20 hover:border-blue/30 transition-colors"
              >
                <div className="mb-2 md:mb-3 opacity-90 scale-90 md:scale-100">
                  {getWeatherIcon(item.forecast)}
                </div>
                <h3 className="font-bold text-text text-xs mb-1 leading-tight">{item.area}</h3>
                <p className="text-overlay1 text-xs opacity-60">{item.forecast}</p>
              </div>
            ))}
          </div>
          <SyncFooter timestamp={data.updateTimestamp} />
        </div>
      )}
    </div>
  )
}

export default NowcastView
