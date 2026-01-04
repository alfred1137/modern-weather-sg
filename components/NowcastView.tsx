
import React, { useState } from 'react';
import { NowcastData, NowcastArea } from '../types';
import { getWeatherIcon, AREA_COORDINATES } from '../constants';

interface Props {
  data: NowcastData | null;
}

const NowcastView: React.FC<Props> = ({ data }) => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('map');
  const [hoveredArea, setHoveredArea] = useState<NowcastArea | null>(null);

  if (!data) return <div className="text-center p-8">Loading nowcast...</div>;

  const filtered = data.items.filter(i => 
    i.area.toLowerCase().includes(search.toLowerCase())
  );

  // Use React.FC to include standard React props like 'key' in the type definition for internal component
  const MapMarker: React.FC<{ item: NowcastArea }> = ({ item }) => {
    const coords = AREA_COORDINATES[item.area];
    if (!coords) return null;

    return (
      <div 
        className="absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
        style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
        onMouseEnter={() => setHoveredArea(item)}
        onMouseLeave={() => setHoveredArea(null)}
        onClick={() => setHoveredArea(item)}
      >
        <div className="relative flex items-center justify-center p-1 rounded-full group-hover:scale-125 transition-transform">
          {/* Pulsing indicator behind icon for active/clickable feel */}
          <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping group-hover:bg-blue-500/20"></div>
          <div className="scale-50 sm:scale-75 md:scale-100 opacity-90 group-hover:opacity-100 drop-shadow-lg">
            {getWeatherIcon(item.forecast)}
          </div>
        </div>

        {/* Localized Tooltip for mobile tapping or specific desktop hover */}
        {hoveredArea?.area === item.area && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
            <div className="glass px-3 py-2 rounded-xl border border-white/10 shadow-2xl whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">{item.area}</p>
              <p className="text-xs font-medium text-slate-100">{item.forecast}</p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800/80"></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
             <h1 className="text-4xl font-black tracking-tight">Nowcast</h1>
             <span className="bg-blue-600 text-[10px] font-black uppercase px-2 py-0.5 rounded text-white tracking-widest">Live</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            Next 2 Hours • {new Date(data.validPeriod.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(data.validPeriod.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* View Toggler */}
          <div className="glass p-1 rounded-xl flex border border-white/5">
            <button 
              onClick={() => setViewMode('map')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <i className="fas fa-map"></i> Map
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <i className="fas fa-grip"></i> Grid
            </button>
          </div>

          <div className="relative group">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 text-xs"></i>
            <input
              type="text"
              placeholder="Filter area..."
              className="w-full sm:w-48 bg-slate-800/50 border border-slate-700/50 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      {viewMode === 'map' ? (
        <div className="relative flex flex-col gap-4">
          <div className="glass rounded-[40px] overflow-hidden relative aspect-[1.6/1] w-full border border-white/5 shadow-2xl bg-[#0f172a]">
            {/* Dark Styled Background Map */}
            <img 
              src="https://www.weather.gov.sg/mobile/wp-content/themes/wiptheme/assets/img/rain-lighting_map_988.jpg"
              className="absolute inset-0 w-full h-full object-cover opacity-20 contrast-125 brightness-75 mix-blend-screen pointer-events-none"
              alt="Singapore Background"
            />
            
            {/* SVG Overlay for a more modern, crisp vector feel */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
               <rect width="100%" height="100%" fill="none" />
            </svg>

            {/* Interactive Markers */}
            <div className="absolute inset-0">
               {data.items.map((item, idx) => (
                 <MapMarker key={idx} item={item} />
               ))}
            </div>

            {/* Tap Instruction Overlay (Matches User Screenshot hint) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
               <div className="bg-slate-900/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <i className="fas fa-hand-pointer text-blue-500"></i>
                 Tap icons to view area names
               </div>
            </div>

            {/* Active Hover Detail (Desktop primarily) */}
            {hoveredArea && (
              <div className="absolute top-6 left-6 glass p-4 rounded-2xl border border-blue-500/20 shadow-2xl hidden md:block w-48 animate-in fade-in duration-300">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 block">Selected Area</span>
                <h3 className="text-lg font-bold text-white mb-2">{hoveredArea.area}</h3>
                <div className="flex items-center gap-3">
                   <div className="scale-75 origin-left">
                    {getWeatherIcon(hoveredArea.forecast)}
                   </div>
                   <p className="text-sm text-slate-400 font-medium leading-tight">{hoveredArea.forecast}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end items-center px-4">
             <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
               Updated at {new Date(data.updateTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
          {filtered.map((item, idx) => (
            <div key={idx} className="glass p-4 rounded-2xl flex items-center justify-between weather-card border border-white/5">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">{item.area}</h3>
                <p className="text-slate-400 text-xs mt-0.5">{item.forecast}</p>
              </div>
              <div className="ml-4 opacity-80 scale-90">
                {getWeatherIcon(item.forecast)}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              <i className="fas fa-magnifying-glass mb-2 text-xl block"></i>
              No areas found matching "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NowcastView;
