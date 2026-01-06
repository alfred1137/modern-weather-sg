import React, { useState } from 'react';
import { Forecast24h } from '../types';
import { getWeatherIcon, SG_REGIONS } from '../constants';

interface Props {
  data: Forecast24h | null;
}

const Forecast24hView: React.FC<Props> = ({ data }) => {
  const [activePeriodIdx, setActivePeriodIdx] = useState(0);

  if (!data) return <div className="text-center p-8 text-xs font-bold uppercase opacity-50 tracking-widest">Synchronizing Forecast...</div>;

  const getPeriodLabel = (startStr: string) => {
    const hour = new Date(startStr).getHours();
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 18) return 'Afternoon';
    if (hour >= 18 && hour < 23) return 'Evening';
    return 'Night';
  };

  const currentPeriod = data.periods[activePeriodIdx];

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fadeIn">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 md:gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-slate-100">24-Hour Forecast</h1>
          <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Regional Outlook & Core Metrics</p>
        </div>
      </header>

      {/* Map Section - Now at the Top */}
      <div className="flex flex-col gap-6">
        <div className="glass overflow-hidden shadow-2xl rounded-none sm:rounded-[48px] border-x-0 sm:border-x border-y border-white/5 -mx-4 sm:mx-0">
          <div className="flex flex-col">
            <div className="flex border-b border-white/5 bg-slate-800/30 overflow-x-auto no-scrollbar">
              {data.periods.map((period, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePeriodIdx(idx)}
                  className={`flex-1 min-w-[120px] py-5 md:py-6 text-center transition-all relative ${
                    activePeriodIdx === idx ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
                    {getPeriodLabel(period.time.start)}
                  </span>
                  {activePeriodIdx === idx && (
                    <div className="absolute bottom-0 left-1/4 w-1/2 h-1 bg-blue-500 rounded-full shadow-[0_-2px_15px_rgba(59,130,246,0.6)]"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Shorter Map aspect ratio, referencing the NowcastView map proportions */}
            <div className="relative w-full bg-[#0f172a] overflow-hidden aspect-[1.6/1] sm:aspect-[2.4/1]">
              <img 
                src="https://www.weather.gov.sg/mobile/wp-content/themes/wiptheme/assets/img/rain-lighting_map_988.jpg"
                className="absolute inset-0 w-full h-full object-cover opacity-20 contrast-125 brightness-100 mix-blend-screen pointer-events-none"
                alt="Singapore Background"
              />
              <div className="absolute inset-0 z-10">
                {SG_REGIONS.map((region) => {
                   const forecast = currentPeriod.regions[region.id as keyof typeof currentPeriod.regions];
                   return (
                     <div key={region.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer" style={{ left: region.x, top: region.y }}>
                        <div className="relative mb-1 sm:mb-2">
                           <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl scale-0 group-hover:scale-150 transition-all duration-500"></div>
                           <div className="bg-slate-800/80 p-1.5 md:p-3 rounded-full border border-white/10 shadow-2xl backdrop-blur-md group-hover:scale-110 transition-transform">
                             <div className="scale-[0.7] md:scale-100">{getWeatherIcon(forecast as string)}</div>
                           </div>
                        </div>
                        <div className="bg-slate-900/60 backdrop-blur-sm px-2 md:px-4 py-0.5 md:py-1.5 rounded-full border border-white/5 text-center">
                           <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{region.name}</span>
                           <span className="text-[8px] md:text-[10px] text-blue-400 font-black uppercase tracking-tighter block whitespace-nowrap">{forecast}</span>
                        </div>
                     </div>
                   );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid - Now below the Map */}
      <div className="grid grid-cols-4 md:grid-cols-8 xl:grid-cols-12 gap-[10px] md:gap-4">
        <div className="col-span-4 md:col-span-4 xl:col-span-4 glass p-8 rounded-[40px] flex flex-col justify-between border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Temperature</span>
            <i className="fas fa-temperature-half text-orange-400 opacity-50"></i>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tighter">{data.general.temperature.low}°</span>
            <span className="text-slate-600 font-bold">~</span>
            <span className="text-5xl font-black tracking-tighter">{data.general.temperature.high}°C</span>
          </div>
        </div>

        <div className="col-span-4 md:col-span-4 xl:col-span-4 glass p-8 rounded-[40px] flex flex-col justify-between border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Humidity</span>
            <i className="fas fa-droplet text-blue-400 opacity-50"></i>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tighter">{data.general.relative_humidity.low}%</span>
            <span className="text-slate-600 font-bold">-</span>
            <span className="text-5xl font-black tracking-tighter">{data.general.relative_humidity.high}%</span>
          </div>
        </div>

        <div className="col-span-4 md:col-span-8 xl:col-span-4 glass p-8 rounded-[40px] flex flex-col justify-between border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Wind Dynamics</span>
            <i className="fas fa-wind text-teal-400 opacity-50"></i>
          </div>
          <div>
            <span className="text-2xl font-black uppercase tracking-tighter">{data.general.wind.direction}</span>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">
              {data.general.wind.speed.low} - {data.general.wind.speed.high} KM/H
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forecast24hView;