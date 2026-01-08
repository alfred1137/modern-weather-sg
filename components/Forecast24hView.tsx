import React, { useState } from 'react';
import { Forecast24h } from '../types';
import { getWeatherIcon, SG_REGIONS } from '../constants';
import SyncFooter from './SyncFooter';

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
    <div className="flex flex-col gap-6 md:gap-10 animate-fadeIn">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 md:gap-6">
        <div className="flex flex-col gap-1 pr-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-slate-100 leading-none">24-Hour Forecast</h1>
          <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-2">Regional Outlook & Core Metrics</p>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <div className="glass overflow-hidden shadow-2xl rounded-[32px] sm:rounded-[48px] border border-white/5">
          <div className="flex flex-col-reverse sm:flex-col">
            <div className="flex border-t sm:border-t-0 sm:border-b border-white/5 bg-slate-800/30 overflow-x-auto no-scrollbar">
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
                     <div 
                       key={region.id} 
                       className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer origin-center scale-[0.75] sm:scale-100 transition-transform" 
                       style={{ left: region.x, top: region.y }}
                     >
                        <div className="relative mb-0.5 sm:mb-2">
                           <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl scale-0 group-hover:scale-150 transition-all duration-500"></div>
                           <div className="bg-slate-800/80 p-2 md:p-3 rounded-full border border-white/10 shadow-2xl backdrop-blur-md group-hover:scale-110 transition-transform">
                             <div className="scale-[0.8] md:scale-100">{getWeatherIcon(forecast as string)}</div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto w-full items-stretch">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <div className="bg-[#141e30]/90 backdrop-blur-xl px-10 md:px-12 py-6 md:py-8 rounded-[48px] border border-white/5 flex flex-col justify-between flex-1 min-h-[150px] transition-all hover:border-orange-500/20 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.3em] text-slate-500">Temperature</span>
              <i className="fas fa-temperature-half text-orange-500 text-xl md:text-2xl drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]"></i>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-100 flex items-center gap-4">
                {data.general.temperature.low}° 
                <span className="text-slate-600 font-bold opacity-40 text-2xl md:text-3xl lg:text-4xl">~</span> 
                {data.general.temperature.high}°C
              </span>
            </div>
            <div className="h-0 md:h-2"></div>
          </div>

          <div className="bg-[#141e30]/90 backdrop-blur-xl px-10 md:px-12 py-6 md:py-8 rounded-[48px] border border-white/5 flex flex-col justify-between flex-1 min-h-[150px] transition-all hover:border-blue-500/20 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.3em] text-slate-500">Humidity</span>
              <i className="fas fa-droplet text-blue-500 text-xl md:text-2xl drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"></i>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-100 flex items-center gap-4">
                {data.general.relative_humidity.low}% 
                <span className="text-slate-600 font-bold opacity-40 text-2xl md:text-3xl lg:text-4xl">-</span> 
                {data.general.relative_humidity.high}%
              </span>
            </div>
            <div className="h-0 md:h-2"></div>
          </div>
        </div>

        <div className="lg:col-span-2 flex">
          <div className="bg-[#141e30]/90 backdrop-blur-xl p-10 md:p-12 rounded-[48px] border border-white/5 flex flex-col items-center justify-between w-full transition-all hover:border-teal-500/20 shadow-xl">
            <div className="w-full text-left">
              <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.3em] text-slate-500">Wind Dynamics</span>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6">
              <h2 className="text-7xl md:text-8xl lg:text-9xl font-black text-slate-100 tracking-tighter uppercase leading-none">
                {data.general.wind.direction}
              </h2>
              <p className="text-slate-400 text-sm md:text-base font-black uppercase tracking-[0.25em] opacity-60">
                {data.general.wind.speed.low} - {data.general.wind.speed.high} KM/H
              </p>
            </div>

            <div className="flex justify-center pb-2">
              <i className="fas fa-wind text-[#2dd4bf] text-6xl md:text-7xl lg:text-8xl opacity-80 drop-shadow-[0_0_25px_rgba(45,212,191,0.25)]"></i>
            </div>
          </div>
        </div>
      </div>
      
      <SyncFooter timestamp={data.updateTimestamp} className="max-w-6xl mx-auto mb-12" />
    </div>
  );
};

export default Forecast24hView;