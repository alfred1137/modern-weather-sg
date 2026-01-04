
import React, { useState } from 'react';
import { Forecast24h } from '../types';
import { getWeatherIcon, SG_REGIONS } from '../constants';

interface Props {
  data: Forecast24h | null;
}

const Forecast24hView: React.FC<Props> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [activePeriodIdx, setActivePeriodIdx] = useState(0);

  if (!data) return <div className="text-center p-8">Loading 24h forecast...</div>;

  const getPeriodLabel = (startStr: string) => {
    const hour = new Date(startStr).getHours();
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 18) return 'Afternoon';
    if (hour >= 18 && hour < 23) return 'Evening';
    return 'Night';
  };

  const getPeriodTimeRange = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    return `${start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase()} to ${end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase()}`;
  };

  const currentPeriod = data.periods[activePeriodIdx];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-24 lg:pb-0">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold">24-Hour Forecast</h1>
          <p className="text-slate-400 text-sm mt-1">
            Singapore Overview & Regional Outlook
          </p>
        </div>

        {/* View Toggler */}
        <div className="glass p-1 rounded-xl flex border border-white/5 self-start lg:self-auto">
          <button 
            onClick={() => setViewMode('map')}
            className={`px-6 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <i className="fas fa-map"></i> Map
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`px-6 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <i className="fas fa-list"></i> List
          </button>
        </div>
      </header>

      {/* General Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="glass p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium">Temperature</span>
            <i className="fas fa-temperature-half text-orange-400"></i>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{data.general.temperature.low}°</span>
            <span className="text-slate-500">to</span>
            <span className="text-4xl font-bold">{data.general.temperature.high}°C</span>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium">Humidity</span>
            <i className="fas fa-droplet text-blue-400"></i>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{data.general.relative_humidity.low}%</span>
            <span className="text-slate-500">-</span>
            <span className="text-4xl font-bold">{data.general.relative_humidity.high}%</span>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium">Wind</span>
            <i className="fas fa-wind text-teal-400"></i>
          </div>
          <div>
            <span className="text-2xl font-bold">{data.general.wind.direction}</span>
            <p className="text-slate-400 text-sm">{data.general.wind.speed.low} - {data.general.wind.speed.high} km/h</p>
          </div>
        </div>
      </div>

      <div className="glass p-1 rounded-[32px] border border-white/5 overflow-hidden">
        {viewMode === 'map' ? (
          <div className="flex flex-col">
            {/* Period Tabs */}
            <div className="flex border-b border-white/5 bg-slate-800/50 overflow-x-auto no-scrollbar">
              {data.periods.map((period, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePeriodIdx(idx)}
                  className={`flex-1 min-w-[100px] py-4 text-center transition-all relative ${
                    activePeriodIdx === idx ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="text-sm font-bold uppercase tracking-wider block">
                    {getPeriodLabel(period.time.start)}
                  </span>
                  {activePeriodIdx === idx && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Map Container - Increased vertical height on mobile (aspect-[4/5]) */}
            <div className="relative w-full bg-[#0f172a] overflow-hidden rounded-b-[30px] aspect-[4/5] sm:aspect-[1.6/1]">
              
              {/* Layer 1 (Ambient): Blurred Background to fill gaps */}
              <img 
                src="https://www.weather.gov.sg/mobile/wp-content/themes/wiptheme/assets/img/rain-lighting_map_988.jpg"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
                alt=""
              />

              {/* Layer 2 (Main): Background Map - object-contain on mobile to prevent cropping, object-cover on desktop for fill */}
              <img 
                src="https://www.weather.gov.sg/mobile/wp-content/themes/wiptheme/assets/img/rain-lighting_map_988.jpg"
                className="absolute inset-0 w-full h-full object-contain sm:object-cover opacity-30 contrast-125 brightness-100 mix-blend-screen pointer-events-none"
                style={{ objectPosition: 'center' }}
                alt="Singapore Background"
              />
              
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                 <rect width="100%" height="100%" fill="none" />
              </svg>

              {/* Time Label Overlay */}
               <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full flex justify-center pointer-events-none">
                 <div className="bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg flex items-center gap-2 pointer-events-auto">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Valid:</span>
                    <span className="text-white text-xs font-bold">
                      {getPeriodTimeRange(currentPeriod.time.start, currentPeriod.time.end)}
                    </span>
                 </div>
               </div>

              {/* Region Icons */}
              <div className="absolute inset-0 z-10">
                {SG_REGIONS.map((region) => {
                   const forecast = currentPeriod.regions[region.id as keyof typeof currentPeriod.regions];
                   return (
                     <div 
                       key={region.id}
                       className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-all duration-500"
                       style={{ left: region.x, top: region.y }}
                     >
                        <div className="relative mb-1 sm:mb-2">
                           <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl scale-0 group-hover:scale-150 transition-transform duration-500"></div>
                           <div className="bg-slate-800/80 p-2 sm:p-3 rounded-full border border-white/10 shadow-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                             <div className="scale-100 sm:scale-125">
                               {getWeatherIcon(forecast as string)}
                             </div>
                           </div>
                        </div>
                        <div className="bg-slate-900/60 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/5">
                           <span className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest block text-center mb-0.5">
                             {region.name}
                           </span>
                           <span className="text-[9px] sm:text-[10px] text-blue-400 font-bold block text-center whitespace-nowrap leading-tight">
                             {forecast}
                           </span>
                        </div>
                     </div>
                   );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <i className="fas fa-list text-blue-400"></i>
              Forecast Timeline
            </h2>
            <div className="space-y-6">
              {data.periods.map((period, idx) => (
                <div key={idx} className="bg-slate-800/30 rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-blue-400 font-bold text-lg block">
                        {getPeriodLabel(period.time.start)}
                      </span>
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                        {new Date(period.time.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(period.time.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(period.regions).map(([region, forecast]) => (
                      <div key={region} className="bg-slate-900/50 p-3 rounded-xl flex flex-col items-center text-center border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase font-bold mb-2">{region}</span>
                        <div className="mb-2 scale-90">{getWeatherIcon(forecast as string)}</div>
                        <span className="text-xs text-slate-300 leading-tight font-medium">{forecast as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forecast24hView;
