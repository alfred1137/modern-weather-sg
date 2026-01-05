import React, { useState, useEffect, useCallback } from 'react';
import { AppTab, WeatherUIState } from './types';
import Navigation from './components/Navigation';
import NowcastView from './components/NowcastView';
import RainAreasView from './components/RainAreasView';
import FloodWarningView from './components/FloodWarningView';
import Forecast24hView from './components/Forecast24hView';
import Forecast4DayView from './components/Forecast4DayView';
import { fetchNowcast, fetch24hForecast, fetch4DayForecast, fetchFloodAlerts } from './services/weatherService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.NOWCAST);
  const [state, setState] = useState<WeatherUIState>({
    nowcast: null,
    forecast24h: null,
    forecast4d: null,
    floodAlerts: null,
    loading: true,
    error: null,
  });

  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const [nowcast, f24h, f4d, flood] = await Promise.all([
        fetchNowcast(),
        fetch24hForecast(),
        fetch4DayForecast(),
        fetchFloodAlerts()
      ]);
      setState({
        nowcast,
        forecast24h: f24h,
        forecast4d: f4d,
        floodAlerts: flood,
        loading: false,
        error: null
      });
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, loading: false, error: 'Failed to synchronize with NEA/PUB weather services. Please check your connection.' }));
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto refresh every 5 minutes
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, [loadData]);

  const renderContent = () => {
    if (state.loading && !state.nowcast) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-medium">Fetching real-time data...</p>
        </div>
      );
    }

    if (state.error && !state.nowcast) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <i className="fas fa-triangle-exclamation text-red-500 text-5xl mb-4"></i>
          <h2 className="text-xl font-bold mb-2 uppercase tracking-tighter">Sync Error</h2>
          <p className="text-slate-400 max-w-md text-sm">{state.error}</p>
          <button 
            onClick={loadData}
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all shadow-lg shadow-blue-500/20"
          >
            Retry Connection
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case AppTab.NOWCAST:
        return <NowcastView data={state.nowcast} />;
      case AppTab.RAIN_AREAS:
        return <RainAreasView />;
      case AppTab.FLOOD_WARNING:
        return <FloodWarningView alerts={state.floodAlerts} />;
      case AppTab.FORECAST_24H:
        return <Forecast24hView data={state.forecast24h} />;
      case AppTab.FORECAST_4DAY:
        return <Forecast4DayView data={state.forecast4d} />;
      default:
        return <NowcastView data={state.nowcast} />;
    }
  };

  return (
    <div className="min-h-screen pb-32 md:pb-12 md:pt-24 lg:pt-28">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[120px]"></div>
      </div>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Container with specified margins: 16px Mobile, 32px Tablet, 138px Desktop */}
      <main className="mx-auto px-4 md:px-8 xl:px-[138px] w-full max-w-[1920px]">
        {renderContent()}
      </main>

      <footer className="text-center text-slate-500 text-[9px] md:text-[10px] py-16 px-6 max-w-4xl mx-auto uppercase tracking-[0.15em] font-bold opacity-40 leading-relaxed">
        Data provided by the National Environment Agency & PUB, Singapore via Singapore Open Data (<a href="https://data.gov.sg/open-data-licence" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors underline decoration-slate-500/30 underline-offset-2">data.gov.sg</a>). Developed with vibe referring to modern web standards for the modern local weather experience. <span className="text-slate-400">v1.13</span>
      </footer>
    </div>
  );
};

export default App;