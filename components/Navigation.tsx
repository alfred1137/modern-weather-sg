
import React from 'react';
import { AppTab } from '../types';

interface NavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Navigation: React.FC<NavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: AppTab.NOWCAST, label: 'Nowcast', icon: 'fa-location-dot' },
    { id: AppTab.RAIN_AREAS, label: 'Rain Areas', icon: 'fa-cloud-showers-heavy' },
    { id: AppTab.FLOOD_WARNING, label: 'Flood Alert', icon: 'fa-triangle-exclamation' },
    { id: AppTab.FORECAST_24H, label: '24-Hour', icon: 'fa-clock' },
    { id: AppTab.FORECAST_4DAY, label: '4-Day', icon: 'fa-calendar-days' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 px-4 pb-6 pt-3 md:hidden">
        <div className="flex justify-around items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                activeTab === tab.id ? 'text-blue-500' : 'text-slate-500'
              }`}
            >
              <i className={`fas ${tab.icon} text-lg`}></i>
              <span className="text-[9px] font-bold uppercase tracking-tighter">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 hidden md:flex justify-between items-center px-8 py-4 glass border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-cloud-sun text-white text-xs"></i>
          </div>
          <span className="text-sm font-black tracking-tighter text-slate-100 uppercase">
            Modern Weather.sg
          </span>
        </div>

        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <i className={`fas ${tab.icon} text-sm`}></i>
              <span className="text-xs font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="w-24"></div> {/* Spacer for balance */}
      </nav>
    </>
  );
};

export default Navigation;