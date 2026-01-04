
import React from 'react';
import { Forecast4Day } from '../types';
import { getWeatherIcon } from '../constants';

interface Props {
  data: Forecast4Day | null;
}

const Forecast4DayView: React.FC<Props> = ({ data }) => {
  if (!data) return <div className="text-center p-8">Loading outlook...</div>;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <header>
        <h1 className="text-3xl font-bold">4-Day Outlook</h1>
        <p className="text-slate-400 text-sm mt-1">Extended forecast for Singapore</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {data.items.map((day, idx) => (
          <div key={idx} className="glass p-6 rounded-3xl weather-card flex flex-col items-center text-center h-full border-t-4 border-t-blue-500/30">
            <span className="text-slate-400 font-bold mb-1">
              {new Date(day.date).toLocaleDateString('en-SG', { weekday: 'long' })}
            </span>
            <span className="text-xs text-slate-500 mb-6 uppercase">
              {new Date(day.date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
            </span>
            
            <div className="mb-6 transform scale-125">
              {getWeatherIcon(day.forecast)}
            </div>
            
            <h3 className="text-lg font-bold mb-6 min-h-[3rem] flex items-center">{day.forecast}</h3>
            
            <div className="w-full space-y-4 mt-auto">
              <div className="flex justify-between items-center text-sm p-2 bg-slate-800/30 rounded-lg">
                <span className="text-slate-500">Temp</span>
                <span className="font-bold text-slate-200">{day.temperature.low}° - {day.temperature.high}°C</span>
              </div>
              <div className="flex justify-between items-center text-sm p-2 bg-slate-800/30 rounded-lg">
                <span className="text-slate-500">Humidity</span>
                <span className="font-bold text-slate-200">{day.relative_humidity.low}% - {day.relative_humidity.high}%</span>
              </div>
              <div className="flex justify-between items-center text-sm p-2 bg-slate-800/30 rounded-lg">
                <span className="text-slate-500">Wind</span>
                <span className="font-bold text-slate-200">{day.wind.speed.low}-{day.wind.speed.high} km/h</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="glass p-8 rounded-3xl mt-6">
        <h2 className="text-xl font-bold mb-4">Weather Insights</h2>
        <div className="flex items-start gap-4">
            <div className="bg-blue-500/20 p-3 rounded-full">
                <i className="fas fa-circle-info text-blue-400"></i>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
                The 4-day outlook is based on the latest weather models. In tropical climates like Singapore, sudden changes in local convection can lead to isolated showers even when the general forecast is fair. Please stay updated via the 2-hour nowcast for real-time changes.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Forecast4DayView;
