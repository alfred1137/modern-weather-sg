
import React from 'react';
import { Forecast4Day, AppTab } from '../types';
import { getWeatherIcon } from '../constants';

interface Props {
  data: Forecast4Day | null;
  onNavigate: (tab: AppTab) => void;
}

const Forecast4DayView: React.FC<Props> = ({ data, onNavigate }) => {
  if (!data) return <div className="text-center p-8">Loading outlook...</div>;

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fadeIn">
      <header className="flex flex-col gap-1 pr-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-slate-100 leading-none">4-Day Outlook</h1>
        <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-2">Extended Forecast Timeline</p>
      </header>

      <div className="grid grid-cols-4 md:grid-cols-8 xl:grid-cols-12 gap-[10px] md:gap-4">
        {data.items.map((day, idx) => (
          <div 
            key={idx} 
            className="col-span-4 md:col-span-4 xl:col-span-3 glass p-8 rounded-[40px] weather-card flex flex-col items-center text-center border border-white/5 hover:border-blue-500/20 transition-all"
          >
            <span className="text-blue-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
              {new Date(day.date).toLocaleDateString('en-SG', { weekday: 'long' })}
            </span>
            <span className="text-[9px] text-slate-500 mb-8 font-black uppercase tracking-[0.2em]">
              {new Date(day.date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
            </span>
            
            <div className="mb-8 transform scale-150 drop-shadow-2xl">
              {getWeatherIcon(day.forecast)}
            </div>
            
            <h3 className="text-lg font-black uppercase tracking-tighter mb-8 min-h-[3rem] flex items-center leading-tight text-slate-100">
              {day.summary}
            </h3>
            
            <div className="w-full space-y-2">
              <div className="flex justify-between items-center px-4 py-3 bg-slate-800/40 rounded-2xl border border-white/5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Temp</span>
                <span className="font-black text-slate-100 text-sm tracking-tighter">{day.temperature.low}° - {day.temperature.high}°C</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-slate-800/40 rounded-2xl border border-white/5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Humidity</span>
                <span className="font-black text-slate-100 text-sm tracking-tighter">{day.relative_humidity.low}% - {day.relative_humidity.high}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="glass p-10 rounded-[40px] border border-white/5 bg-blue-600/[0.03]">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-4 flex items-center gap-3">
          <i className="fas fa-circle-info"></i> Meteorological Insights
        </h2>
        <div className="flex items-start gap-6">
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
                National Environment Agency (NEA) Meteorological Service Singapore (MSS) provides extended 4-day outlook, leveraging on advanced multi-model ensemble forecasting. In Singapore's tropical microclimate, localized heating can trigger isolated thundery showers. Consulting the <button onClick={() => onNavigate(AppTab.NOWCAST)} className="text-slate-200 hover:text-blue-400 font-bold underline decoration-blue-500/30 underline-offset-4 transition-all decoration-2">2-Hour Nowcast</button> for immediate, high-resolution precision before outdoor engagements is recommended.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Forecast4DayView;
