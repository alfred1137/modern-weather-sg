import React, { useState } from 'react';
import { NowcastData, NowcastArea } from '../types';
import { getWeatherIcon, AREA_COORDINATES } from '../constants';
import SyncFooter from './SyncFooter';

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

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const MapMarker: React.FC<{ item: NowcastArea }> = ({ item }) => {
    const coords = AREA_COORDINATES[item.area];
    if (!coords) return null;

    const isActive = hoveredArea?.area === item.area;

    return (
      <div 
        className={`absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group ${isActive ? 'z-30' : 'z-10'}`}
        style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
        onMouseEnter={() => setHoveredArea(item)}
        onMouseLeave={() => setHoveredArea(null)}
        onClick={() => setHoveredArea(item)}
      >
        <div className={`relative flex items-center justify-center p-0.5 rounded-full transition-transform duration-300 ${isActive ? 'sm:scale-150' : 'sm:group-hover:scale-125'}`}>
          {isActive && (
            <div className="absolute inset-1.5 bg-blue-500/40 rounded-full animate-ping"></div>
          )}
          <div className="absolute inset-0 bg-blue-500/5 rounded-full hidden sm:block animate-ping group-hover:bg-blue-500/20"></div>
          <div className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} scale-[0.5] sm:scale-85 md:scale-100 drop-shadow-xl`}>
            {getWeatherIcon(item.forecast)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fadeIn">
      <div className="flex flex-col gap-4">
        <header className="flex justify-between items-start gap-2">
          <div className="flex flex-col gap-1 pr-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-slate-100 leading-none">Nowcast</h1>
            <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-2 whitespace-nowrap overflow-hidden text-ellipsis">
              2-hour Nowcast: <span className="text-slate-200">{formatTime(data.validPeriod.start)} ~ {formatTime(data.validPeriod.end)}</span>
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end shrink-0">
            <div className="glass p-1 rounded-xl flex flex-row border border-white/5 w-auto">
              <button 
                onClick={() => setViewMode('map')}
                className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <i className="fas fa-map text-[10px]"></i> Map
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <i className="fas fa-grip text-[10px]"></i> Grid
              </button>
            </div>
          </div>
        </header>

        <div className="sm:hidden w-full glass p-1 rounded-xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="flex flex-row w-full gap-1">
            <button 
              onClick={() => setViewMode('map')}
              className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <i className="fas fa-map text-[8px]"></i> Map
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <i className="fas fa-grip text-[8px]"></i> Grid
            </button>
          </div>
        </div>

        {viewMode === 'grid' && (
          <div className="relative group w-full animate-in slide-in-from-top-2 duration-300">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 text-xs transition-colors"></i>
            <input
              type="text"
              placeholder="SEARCH AREA..."
              className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl py-3 md:py-3.5 pl-11 pr-4 text-[10px] md:text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-slate-600 shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {viewMode === 'map' ? (
        <div className="relative flex flex-col gap-4">
          <div className="glass rounded-[24px] sm:rounded-[32px] md:rounded-[40px] overflow-hidden relative aspect-[1.6/1] w-auto -mx-4 sm:mx-auto sm:w-full max-w-5xl border sm:border-white/5 shadow-2xl bg-[#0f172a]">
            <img 
              src="https://www.weather.gov.sg/mobile/wp-content/themes/wiptheme/assets/img/rain-lighting_map_988.jpg"
              className="absolute inset-0 w-full h-full object-cover opacity-20 contrast-125 brightness-75 mix-blend-screen pointer-events-none"
              alt="Singapore Background"
            />
            
            <div className="absolute inset-0">
               {data.items.map((item, idx) => (
                 <MapMarker key={idx} item={item} />
               ))}
            </div>

            <div className="absolute bottom-4 right-4 pointer-events-none z-20">
               <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 md:px-5 md:py-2 rounded-full border border-blue-500/30 text-[8px] md:text-[10px] font-black text-slate-100 uppercase tracking-widest flex items-center gap-2 shadow-xl ring-1 ring-blue-500/20">
                 <i className="fas fa-hand-pointer text-blue-400"></i>
                 <span>Tap Icons</span>
               </div>
            </div>
          </div>

          <div className="min-h-[70px] md:min-h-[80px] flex items-center justify-center max-w-5xl mx-auto w-full">
            {hoveredArea ? (
              <div className="w-full glass px-4 py-4 md:px-8 md:py-6 rounded-[24px] border border-blue-500/30 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-row items-stretch gap-3 md:gap-6">
                <div className="flex-1 flex flex-col justify-center text-left min-w-0">
                  <span className="text-[6px] md:text-[9px] font-black text-blue-400/80 uppercase tracking-[0.2em] mb-1">Detailed Forecast</span>
                  <h2 className="text-[14px] md:text-2xl font-black text-slate-100 uppercase tracking-tight leading-tight">{hoveredArea.area}</h2>
                </div>
                
                <div className="flex-1 flex items-center justify-center gap-2 md:gap-5 bg-slate-900/40 px-3 py-2 md:px-6 md:py-3 rounded-2xl border border-white/5 min-w-0">
                  <div className="scale-[0.55] sm:scale-75 md:scale-110 flex-shrink-0 origin-center">
                    {getWeatherIcon(hoveredArea.forecast)}
                  </div>
                  <span className="text-[9px] md:text-base font-black text-slate-100 uppercase tracking-tight whitespace-normal leading-tight text-center">
                    {hoveredArea.forecast}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full py-8 text-center border border-dashed border-slate-800/80 rounded-[24px]">
                 <p className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Select an area on the map</p>
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
                className="col-span-2 md:col-span-2 xl:col-span-3 glass p-4 md:p-5 rounded-2xl flex flex-col items-center text-center justify-center weather-card border border-white/5 hover:border-blue-500/30 transition-all"
              >
                <div className="mb-2 md:mb-3 opacity-90 scale-90 md:scale-100">
                  {getWeatherIcon(item.forecast)}
                </div>
                <h3 className="font-black text-slate-100 text-[10px] md:text-[11px] uppercase tracking-tighter mb-0.5 md:mb-1 leading-tight">{item.area}</h3>
                <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase opacity-60">{item.forecast}</p>
              </div>
            ))}
          </div>
          <SyncFooter timestamp={data.updateTimestamp} />
        </div>
      )}
    </div>
  );
};

export default NowcastView;