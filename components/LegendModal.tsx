
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
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 md:px-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="glass w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col rounded-[40px] border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <i className="fas fa-circle-info text-white text-lg"></i>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-100 uppercase tracking-tighter">Weather Legend</h2>
              <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Icon for each possible weather forecast</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"
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
                className="flex flex-col items-center text-center p-4 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-blue-500/20 transition-all group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 transition-transform duration-300 shadow-xl overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-transparent"></div>
                   <div className="relative scale-90 md:scale-100">
                     {getWeatherIcon(label)}
                   </div>
                </div>
                <span className="text-[9px] md:text-[10px] font-black text-slate-100 uppercase tracking-tight leading-tight min-h-[2.5rem] flex items-center">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 rounded-3xl bg-blue-600/5 border border-blue-500/10 text-center">
             <p className="text-slate-400 text-[10px] md:text-xs font-medium italic opacity-70">
               Iconography follows the Meteorological Service Singapore (MSS) standard for mobile weather reporting.
             </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-white/5 bg-slate-900/80 flex justify-center">
          <button 
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-blue-500/20"
          >
            All good, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegendModal;
