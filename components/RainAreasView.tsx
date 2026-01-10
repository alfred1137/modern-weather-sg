import React, { useEffect, useState, useCallback, useRef } from 'react';
import SyncFooter from './SyncFooter';
import { useTheme } from '../context/ThemeContext';

type RadarMode = 'SG' | 'REGIONAL';

interface HistoryItem {
  value: string;
  label: string;
  date: Date;
}

interface Props {
  syncTimestamp?: string;
}

const RainAreasView: React.FC<Props> = ({ syncTimestamp }) => {
  const [mode, setMode] = useState<RadarMode>('SG');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackTimerRef = useRef<number | null>(null);
  const { theme } = useTheme();

  const generateHistory = useCallback(() => {
    const now = new Date();
    const roundInterval = mode === 'SG' ? 5 : 15;
    
    const sgtOffset = 8 * 60;
    const nowSgt = new Date(now.getTime() + (now.getTimezoneOffset() + sgtOffset) * 60000);
    
    const roundedMins = Math.floor(nowSgt.getMinutes() / roundInterval) * roundInterval;
    const baseSgt = new Date(nowSgt);
    baseSgt.setMinutes(roundedMins, 0, 0);

    const safetyBuffer = mode === 'SG' ? 10 : 15;
    const latestAvailableSgt = new Date(baseSgt.getTime() - safetyBuffer * 60000);
    
    const items: HistoryItem[] = [];
    const totalMinutes = 6 * 60; // 6 hours
    const steps = totalMinutes / roundInterval;

    for (let i = 0; i <= steps; i++) {
      const targetDate = new Date(latestAvailableSgt.getTime() - i * roundInterval * 60000);
      
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const hours = String(targetDate.getHours()).padStart(2, '0');
      const mins = String(targetDate.getMinutes()).padStart(2, '0');
      const timestampValue = `${year}${month}${day}${hours}${mins}`;

      items.push({
        value: timestampValue,
        label: `${hours}:${mins}`,
        date: targetDate
      });
    }
    
    const chronologicalHistory = items.reverse();
    setHistory(chronologicalHistory);
    
    if (selectedIndex === -1 || selectedIndex >= chronologicalHistory.length) {
      setSelectedIndex(chronologicalHistory.length - 1);
    }
  }, [mode, selectedIndex]);

  useEffect(() => {
    generateHistory();
    const interval = setInterval(generateHistory, 60000);
    return () => clearInterval(interval);
  }, [generateHistory]);

  useEffect(() => {
    if (isPlaying && history.length > 0) {
      playbackTimerRef.current = window.setInterval(() => {
        setSelectedIndex((prev) => (prev + 1) % history.length);
      }, 600);
    } else if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
    }
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, history.length]);

  const handleImageError = () => {
    console.debug("Radar frame missing:", history[selectedIndex]?.value);
  };

  const getRadarUrl = (item: HistoryItem) => {
    if (!item) return '';
    if (mode === 'SG') {
      return `https://www.weather.gov.sg/files/rainarea/50km/v2/dpsri_70km_${item.value}0000dBR.dpsri.png`;
    } else {
      return `https://www.weather.gov.sg/files/rainarea/240km/dpsri_240km_${item.value}0000dBR.dpsri.png`;
    }
  };

  const currentItem = history[selectedIndex];

  // Corrected color scale matching official NEA/MSS radar legend
  // Heavy (Pink/Purple) -> Moderate (Red/Orange/Yellow) -> Light (Green/Blue/Cyan)
  const intensityColors = [
    '#FF00FF', // Pink (Heavy)
    '#D000D0',
    '#A000A0', 
    '#800000', // Deep Red
    '#FF0000', // Red
    '#FF4500', // Orange Red
    '#FF8000', // Orange
    '#FFC000', // Golden Yellow
    '#FFFF00', // Yellow
    '#C0FF00', // Lime Yellow
    '#00FF00', // Lime Green
    '#00C000', // Green
    '#008060', // Teal Green
    '#00FFFF', // Cyan
    '#00BFFF', // Deep Sky Blue (Light)
  ];

  const isSgMode = mode === 'SG';

  // Use the latest history item's date for the footer timestamp to match the visual radar data,
  // falling back to the API sync timestamp if radar data isn't ready.
  const radarTimestamp = history.length > 0 
    ? history[history.length - 1].date.toISOString() 
    : syncTimestamp;

  // Determine Map Filters based on theme
  const baseMapStyle = theme === 'latte' 
    ? { filter: 'opacity(0.8)', mixBlendMode: 'multiply' as const } // Light theme: Dark lines on light bg
    : { filter: 'invert(1) brightness(2.5) contrast(1.2) opacity(0.35)', mixBlendMode: 'screen' as const }; // Dark theme: Light lines on dark bg

  const radarLayerStyle = theme === 'latte'
    ? { mixBlendMode: 'multiply' as const, opacity: 0.9 }
    : { mixBlendMode: 'screen' as const, opacity: 1 };

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fadeIn">
      {/* Header and Toggle Container */}
      <div className="flex flex-col gap-4">
        <header className="flex justify-between items-start gap-2">
          <div className="flex flex-col gap-1 pr-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-text leading-none">Rain Areas</h1>
              <div className="relative mt-1">
                <span className="absolute inset-0 bg-blue/40 blur-md rounded"></span>
                <span className="relative bg-blue text-[8px] md:text-[10px] font-black uppercase px-2 py-0.5 md:py-1 rounded text-mantle tracking-widest shadow-lg shadow-blue/20">Live</span>
              </div>
            </div>
            <p className="text-overlay1 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-2 whitespace-nowrap overflow-hidden text-ellipsis">
              Latest observation: <span className="text-blue font-bold">{currentItem?.label || '...'}</span>
            </p>
          </div>
          
          <div className="hidden sm:flex flex-col items-end shrink-0">
            <div className="glass p-1 rounded-xl flex flex-row border border-surface1/20 w-auto bg-surface0/30">
              <button
                onClick={() => { setMode('SG'); setSelectedIndex(-1); setIsPlaying(false); }}
                className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  mode === 'SG' ? 'bg-blue text-mantle shadow-lg shadow-blue/20' : 'text-overlay1 hover:text-text'
                }`}
              >
                <i className="fas fa-location-dot text-[10px]"></i> Singapore
              </button>
              <button
                onClick={() => { setMode('REGIONAL'); setSelectedIndex(-1); setIsPlaying(false); }}
                className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  mode === 'REGIONAL' ? 'bg-blue text-mantle shadow-lg shadow-blue/20' : 'text-overlay1 hover:text-text'
                }`}
              >
                <i className="fas fa-earth-asia text-[10px]"></i> Regional
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Toggle */}
        <div className="sm:hidden w-full glass p-1 rounded-xl border border-surface1/20 shadow-2xl overflow-hidden bg-surface0/30">
          <div className="flex flex-row w-full gap-1">
            <button
              onClick={() => { setMode('SG'); setSelectedIndex(-1); setIsPlaying(false); }}
              className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                mode === 'SG' ? 'bg-blue text-mantle shadow-lg shadow-blue/20' : 'text-overlay1 hover:text-text'
              }`}
            >
              <i className="fas fa-location-dot text-[8px]"></i> Singapore
            </button>
            <button
              onClick={() => { setMode('REGIONAL'); setSelectedIndex(-1); setIsPlaying(false); }}
              className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                mode === 'REGIONAL' ? 'bg-blue text-mantle shadow-lg shadow-blue/20' : 'text-overlay1 hover:text-text'
              }`}
            >
              <i className="fas fa-earth-asia text-[8px]"></i> Regional
            </button>
          </div>
        </div>
      </div>

      <div className="relative max-w-4xl -mx-4 sm:mx-auto w-auto sm:w-full group">
        <div className="absolute -inset-[2px] bg-blue/30 blur-sm rounded-none sm:rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        <div className="glass rounded-none sm:rounded-[32px] overflow-hidden relative aspect-[853/562] bg-base border-y sm:border-[2px] border-blue/20 sm:border-blue/40 shadow-[0_0_30px_rgba(var(--blue-rgb),0.15)] transition-all duration-500">
          
          <div className={`absolute inset-0 transition-transform duration-700 ease-out origin-center ${isSgMode ? 'scale-[1.2] sm:scale-100' : 'scale-100'}`}>
            <img
              src={mode === 'SG' 
                ? 'https://www.weather.gov.sg/mobile/wp-content/themes/wiptheme/assets/img/base-853.png'
                : 'https://www.weather.gov.sg/mobile/wp-content/themes/wiptheme/assets/img/240km-v2.png'
              }
              style={baseMapStyle}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-all duration-500"
              alt="Base Map"
            />
            {currentItem && (
              <img
                src={getRadarUrl(currentItem)}
                style={radarLayerStyle}
                className="absolute inset-0 w-full h-full object-contain z-10 transition-all duration-300"
                alt="Rain Overlay"
                onError={handleImageError}
                key={`${mode}-${currentItem.value}`}
              />
            )}
            {mode === 'SG' && (
              <img
                src="https://www.weather.gov.sg/mobile/wp-content/themes/wiptheme/assets/img/MRT.png"
                style={{ 
                  filter: theme === 'latte' 
                    ? 'hue-rotate(180deg) brightness(0.8) drop-shadow(0 0 2px rgba(255,255,255,0.8))' 
                    : 'invert(1) hue-rotate(180deg) brightness(1.2) drop-shadow(0 0 2px rgba(0,0,0,0.8))', 
                  opacity: 0.8 
                }}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20 transition-all duration-500"
                alt="MRT Overlay"
              />
            )}
          </div>
        </div>
      </div>

      <div className="glass p-5 md:p-6 rounded-[32px] border border-surface1/20 shadow-2xl mt-2 max-w-4xl mx-auto w-full bg-mantle/60 backdrop-blur-xl">
        <div className="flex items-center gap-5 md:gap-8">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-all shrink-0 ${
              isPlaying 
                ? 'bg-blue/20 text-blue border border-blue/30 shadow-[0_0_15px_rgba(var(--blue-rgb),0.2)]' 
                : 'bg-blue text-mantle shadow-xl shadow-blue/20'
            }`}
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-lg md:text-xl`}></i>
          </button>
          
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black text-overlay1 uppercase tracking-widest px-1">
              <span className="opacity-60">PAST 6 HOURS</span>
              <div className="bg-mantle/90 px-4 py-1.5 rounded-full border border-surface1/20 shadow-inner">
                <span className="text-blue font-black">{currentItem?.label}</span>
              </div>
              <span className="opacity-60">LATEST</span>
            </div>
            <div className="relative flex items-center h-4">
              <div className="absolute inset-0 bg-surface0/50 rounded-full h-1 my-auto"></div>
              <input
                type="range"
                min="0"
                max={history.length - 1}
                value={selectedIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setSelectedIndex(parseInt(e.target.value));
                }}
                className="relative w-full h-4 bg-transparent appearance-none cursor-pointer accent-blue z-10 
                  [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                  [&::-webkit-slider-thumb]:bg-blue [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:mt-[-10px]
                  [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(var(--blue-rgb),0.5)] [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-mantle"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 mb-2 max-w-4xl mx-auto w-full px-2">
        <div className="flex justify-between items-end mb-2.5 px-2">
          <div className="flex flex-col items-center">
            <span className="text-overlay1 text-[9px] font-black uppercase tracking-widest mb-1.5">Heavy</span>
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-overlay0"></div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-overlay1 text-[9px] font-black uppercase tracking-widest mb-1.5">Moderate</span>
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-overlay0"></div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-overlay1 text-[9px] font-black uppercase tracking-widest mb-1.5">Light</span>
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-overlay0"></div>
          </div>
        </div>
        <div className="relative p-[1px] bg-surface0/5 rounded-sm shadow-2xl">
          <div className="flex h-4 w-full rounded-[1px] overflow-hidden">
            {intensityColors.map((color, idx) => (
              <div key={idx} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </div>

      <SyncFooter timestamp={radarTimestamp} className="max-w-4xl mx-auto" />
    </div>
  );
};

export default RainAreasView;