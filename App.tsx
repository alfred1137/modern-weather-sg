
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
          <h2 className="text-xl font-bold mb-2">Sync Error</h2>
          <p className="text-slate-400 max-w-md">{state.error}</p>
          <button 
            onClick={loadData}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors"
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
    <div className="min-h-screen pb-24 lg:pb-12 lg:pt-20">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {renderContent()}
      </main>

      <footer className="text-center text-slate-500 text-[10px] pb-8 px-4 max-w-2xl mx-auto">
        Data provided by the National Environment Agency & PUB, Singapore. 
        Developed with modern web standards for the ultimate local weather experience.
      </footer>
    </div>
  );
};

export default App;
