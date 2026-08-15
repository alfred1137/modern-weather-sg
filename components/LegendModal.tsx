import React from 'react'
import { getWeatherIcon } from '../constants'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const LegendModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  // Filter and order keys to match the requested legend categories
  const legendItems = [
    'Fair (Day)',
    'Fair (Night)',
    'Fair and Warm',
    'Partly Cloudy (Day)',
    'Partly Cloudy (Night)',
    'Cloudy',
    'Hazy',
    'Slightly Hazy',
    'Windy',
    'Mist',
    'Light Rain',
    'Moderate Rain',
    'Heavy Rain',
    'Passing Showers',
    'Light Showers',
    'Showers',
    'Heavy Showers',
    'Thundery Showers',
    'Heavy Thundery Showers',
    'Heavy Thundery Showers with Gusty Winds',
  ]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 md:px-0 bg-crust/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="glass bg-base w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col rounded-2xl border border-surface1/10 shadow-xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface1/10 bg-surface0/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue rounded-xl flex items-center justify-center">
              <i className="fas fa-circle-info text-mantle text-lg"></i>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-text">Weather Legend</h2>
              <p className="text-overlay1 text-xs font-medium">
                Icon for each possible weather forecast
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-overlay1 hover:bg-surface1/10 hover:text-text transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Legend Grid */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {legendItems.map((label) => (
              <div
                key={label}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-surface0/50 border border-surface1/10 hover:border-blue/20 transition-colors group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-surface0 rounded-full flex items-center justify-center mb-4 border border-surface1/10 overflow-hidden relative">
                  <div className="scale-90 md:scale-100">{getWeatherIcon(label)}</div>
                </div>
                <span className="text-[10px] md:text-xs font-semibold text-text leading-tight min-h-[2.5rem] flex items-center">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 rounded-xl bg-surface0/40 border border-surface1/10 text-center">
            <p className="text-overlay1 text-xs font-medium">
              Iconography follows the Meteorological Service Singapore (MSS) standard for mobile
              weather reporting.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface1/10 bg-surface0/40 flex justify-center">
          <button
            onClick={onClose}
            className="bg-blue hover:bg-sky text-mantle px-6 py-2.5 rounded-xl font-bold text-sm transition-colors"
          >
            All good, thanks!
          </button>
        </div>
      </div>
    </div>
  )
}

export default LegendModal
