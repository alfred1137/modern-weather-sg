import React from 'react';
import { getWeatherIcon, WeatherIconMap } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const LegendModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Filter and order keys to match the requested legend categories
  const legendItems = [
    'Fair (Day)', 'Fair (Night)', 'Fair and Warm', 'Partly Cloudy (Day)', 'Partly Cloudy (Night)', 
    'Cloudy', 'Hazy', 'Slightly Hazy', 'Windy', 'Mist',
    'Light Rain', 'Moderate Rain', 'Heavy Rain', 'Passing Showers', 'Light Showers', 
    'Showers', 'Heavy Showers', 'Thundery Showers', 'Heavy Thundery Showers', 
    'Heavy Thundery Showers with Gusty Winds'
  ];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 md:px-0 bg-crust/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="glass w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col rounded-[40px] border border-surface1/10 shadow-2xl animate-in zoom-in-95 duration-300 bg-base"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-surface1/10 bg-surface0/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue rounded-2xl flex items-center justify-center shadow-lg shadow-blue/20">
              <i className="fas fa-circle-info text-mantle text-lg"></i>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-text uppercase tracking-tighter">Weather Legend</h2>
              <p className="text-overlay1 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Icon for each possible weather forecast</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-overlay1 hover:bg-surface1/10 hover:text-text transition-all"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Legend Grid */}
        <div className="flex-1 overflow-y-auto p-8 md:p-10 no-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {legendItems.map((label) => (
              <div 
                key={label}
                className="flex flex-col items-center text-center p-4 rounded-3xl bg-mantle/40 border border-surface1/10 hover:border-blue/20 transition-all group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-surface0 rounded-full flex items-center justify-center mb-4 border border-surface1/10 group-hover:scale-110 transition-transform duration-300 shadow-xl overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-surface1/20 to-transparent"></div>
                   <div className="relative scale-90 md:scale-100">
                     {getWeatherIcon(label)}
                   </div>
                </div>
                <span className="text-[9px] md:text-[10px] font-black text-text uppercase tracking-tight leading-tight min-h-[2.5rem] flex items-center">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 rounded-3xl bg-blue/5 border border-blue/10 text-center">
             <p className="text-overlay1 text-[10px] md:text-xs font-medium italic opacity-70">
               Iconography follows the Meteorological Service Singapore (MSS) standard for mobile weather reporting.
             </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-surface1/10 bg-mantle/80 flex justify-center">
          <button 
            onClick={onClose}
            className="bg-blue hover:bg-sky text-mantle px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-blue/20"
          >
            All good, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegendModal;