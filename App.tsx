import React, { useState, useEffect, useCallback } from 'react';
import { AppTab, WeatherUIState } from './types';
import Navigation from './components/Navigation';
import NowcastView from './components/NowcastView';
import RainAreasView from './components/RainAreasView';
import FloodWarningView from './components/FloodWarningView';
import Forecast24hView from './components/Forecast24hView';
import Forecast4DayView from './components/Forecast4DayView';
import LegendModal from './components/LegendModal';
import { fetchNowcast, fetch24hForecast, fetch4DayForecast, fetchFloodAlerts } from './services/weatherService';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.NOWCAST);
  const [showLegend, setShowLegend] = useState(false);
  const [state, setState] = useState<WeatherUIState>({
    nowcast: null,
    forecast24h: null,
    forecast4d: null,
    floodAlerts: null,
    loading: true,
    error: null,
  });

  // Automatically scroll to top when changing tabs
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

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
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, [loadData]);

  const renderContent = () => {
    if (state.loading && !state.nowcast) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-overlay1 font-medium">Fetching real-time data...</p>
        </div>
      );
    }

    if (state.error && !state.nowcast) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <i className="fas fa-triangle-exclamation text-red text-5xl mb-4"></i>
          <h2 className="text-xl font-bold mb-2 uppercase tracking-tighter text-text">Sync error</h2>
          <p className="text-overlay1 max-w-md text-sm">{state.error}</p>
          <button 
            onClick={loadData}
            className="mt-8 bg-blue hover:bg-sky text-mantle px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all shadow-lg shadow-blue/20"
          >
            Retry connection
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case AppTab.NOWCAST:
        return <NowcastView data={state.nowcast} />;
      case AppTab.RAIN_AREAS:
        return <RainAreasView syncTimestamp={state.nowcast?.updateTimestamp} />;
      case AppTab.FLOOD_WARNING:
        return <FloodWarningView alerts={state.floodAlerts} syncTimestamp={state.nowcast?.updateTimestamp} />;
      case AppTab.FORECAST_24H:
        return <Forecast24hView data={state.forecast24h} />;
      case AppTab.FORECAST_4DAY:
        return <Forecast4DayView data={state.forecast4d} onNavigate={setActiveTab} />;
      default:
        return <NowcastView data={state.nowcast} />;
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-32 md:pb-12 md:pt-24 lg:pt-36 bg-base transition-colors duration-300">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-mauve/5 rounded-full blur-[120px]"></div>
      </div>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="mx-auto px-4 md:px-8 xl:px-[138px] w-full max-w-[1920px]">
        {renderContent()}
      </main>

      <footer className="mt-32 mb-6 px-6 flex flex-col items-center gap-6">
        <button 
          onClick={() => setShowLegend(true)}
          className="bg-surface0/60 hover:bg-surface0 border border-surface1/10 px-6 py-2.5 rounded-full transition-all text-subtext0 hover:text-blue flex items-center gap-2 shadow-lg"
        >
          <i className="fas fa-circle-info text-xs"></i>
          <span className="text-[11px] font-bold tracking-wide uppercase">Weather legend</span>
        </button>

        <div className="max-w-4xl w-full glass border border-surface1/5 rounded-[32px] p-8 md:p-10 flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden bg-surface0/20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-blue/30 rounded-full"></div>
          
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="space-y-4 text-overlay1 text-[11px] md:text-xs font-medium leading-relaxed max-w-2xl">
              <p>
                Data provided by the National Environment Agency & PUB, Singapore via Singapore Open Data (<a href="https://data.gov.sg/open-data-licence" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">data.gov.sg</a>). 
                The official weather site is available at <a href="https://www.weather.gov.sg/mobile/home/" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">weather.gov.sg/mobile</a>.
              </p>
              <p>
                Developed with vibe to create a clear and modern weather forecasting experience for those in Singapore.<br />
                <span className="text-overlay0">v0.9.1</span>
              </p>
            </div>

            <a 
              href="https://github.com/alfred1137/modern-weather-sg" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-surface0/40 hover:bg-surface0/80 border border-surface1/5 px-6 py-3 rounded-2xl transition-all text-overlay1 hover:text-text flex items-center gap-3 group"
            >
              <i className="fab fa-github text-[18px] group-hover:scale-110 transition-transform"></i>
              <div className="text-left">
                <span className="block text-[10px] font-black uppercase tracking-widest leading-none">Source code</span>
                <span className="block text-[8px] font-bold text-overlay0 group-hover:text-blue transition-colors uppercase tracking-tighter mt-1">alfred1137 / modern-weather-sg</span>
              </div>
            </a>
          </div>
        </div>
      </footer>

      <LegendModal isOpen={showLegend} onClose={() => setShowLegend(false)} />
      <ThemeToggle />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;