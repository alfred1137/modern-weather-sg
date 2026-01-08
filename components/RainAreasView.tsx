import React, { useEffect, useState, useCallback, useRef } from 'react';
import SyncFooter from './SyncFooter';

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

  const intensityColors = [
    '#ff00ff', '#f500f5', '#cc00cc', '#9b009b',
    '#ff0000', '#ff3300', '#ff6600', '#ff9900',
    '#ffcc00', '#ffff00', '#ccff00', '#99ff00',
    '#33ff00', '#00ff00', '#00ff33', '#00ff66',
    '#00ff99', '#00ffcc', '#00ffff', '#00ccff',
    '#0099ff', '#0066ff', '#0033ff', '#1a00ff'
  ];

  const isSgMode = mode === 'SG';

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fadeIn">
      {/* Header and Toggle Container */}
      <div className="flex flex-col gap-4">
        <header className="flex justify-between items-start gap-2">
          <div className="flex flex-col gap-1 pr-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-slate-100 leading-none">Rain Areas</h1>
              <div className="relative mt-1">
                <span className="absolute inset-0 bg-blue-500/40 blur-md rounded"></span>
                <span className="relative bg-blue-600 text-[8px] md:text-[10px] font-black uppercase px-2 py-0.5 md:py-1 rounded text-white tracking-widest shadow-lg shadow-blue-500/20">Live</span>
              </div>
            </div>
            <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-2 whitespace-nowrap overflow-hidden text-ellipsis">
              Latest observation: <span className="text-blue-400 font-bold">{currentItem?.label || '...'}</span>
            </p>
          </div>
          
          <div className="hidden sm:flex flex-col items-end shrink-0">
            <div className="glass p-1 rounded-xl flex flex-row border border-white/5 w-auto">
              <button
                onClick={() => { setMode('SG'); setSelectedIndex(-1); setIsPlaying(false); }}
                className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  mode === 'SG' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <i className="fas fa-location-dot text-[10px]"></i> Singapore
              </button>
              <button
                onClick={() => { setMode('REGIONAL'); setSelectedIndex(-1); setIsPlaying(false); }}
                className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  mode === 'REGIONAL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <i className="fas fa-earth-asia text-[10px]"></i> Regional
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Toggle */}
        <div className="sm:hidden w-full glass p-1 rounded-xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="flex flex-row w-full gap-1">
            <button
              onClick={() => { setMode('SG'); setSelectedIndex(-1); setIsPlaying(false); }}
              className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                mode === 'SG' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <i className="fas fa-location-dot text-[8px]"></i> Singapore
            </button>
            <button
              onClick={() => { setMode('REGIONAL'); setSelectedIndex(-1); setIsPlaying(false); }}
              className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                mode === 'REGIONAL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <i className="fas fa-earth-asia text-[8px]"></i> Regional
            </button>
          </div>
        </div>
      </div>

      <div className="relative max-w-4xl -mx-4 sm:mx-auto w-auto sm:w-full group">
        <div className="absolute -inset-[2px] bg-blue-500/30 blur-sm rounded-none sm:rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        <div className="glass rounded-none sm:rounded-[32px] overflow-hidden relative aspect-[853/562] bg-[#0b1221] border-y sm:border-[2px] border-blue-400/20 sm:border-blue-400/40 shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500">
          
          <div className={`absolute inset-0 transition-transform duration-700 ease-out origin-center ${isSgMode ? 'scale-[1.2] sm:scale-100' : 'scale-100'}`}>
            <img
              src={mode === 'SG' 
                ? 'https://www.weather.gov.sg/mobile/wp-content/themes/wiptheme/assets/img/base-853.png'
                : 'https://www.weather.gov.sg/mobile/wp-content/themes/wiptheme/assets/img/240km-v2.png'
              }
              style={{ filter: 'invert(1) brightness(2.5) contrast(1.2) opacity(0.35)', mixBlendMode: 'screen' }}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              alt="Base Map"
            />
            {currentItem && (
              <img
                src={getRadarUrl(currentItem)}
                className="absolute inset-0 w-full h-full object-contain mix-blend-screen opacity-100 z-10"
                alt="Rain Overlay"
                onError={handleImageError}
                key={`${mode}-${currentItem.value}`}
              />
            )}
            {mode === 'SG' && (
              <img
                src="https://www.weather.gov.sg/mobile/wp-content/themes/wiptheme/assets/img/MRT.png"
                style={{ filter: 'invert(1) hue-rotate(180deg) brightness(1.2) drop-shadow(0 0 2px rgba(0,0,0,0.8))', opacity: 0.8 }}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20"
                alt="MRT Overlay"
              />
            )}
          </div>
        </div>
      </div>

      <div className="glass p-5 md:p-6 rounded-[32px] border border-white/5 shadow-2xl mt-2 max-w-4xl mx-auto w-full bg-slate-900/40 backdrop-blur-xl">
        <div className="flex items-center gap-5 md:gap-8">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-all shrink-0 ${
              isPlaying 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                : 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
            }`}
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-lg md:text-xl`}></i>
          </button>
          
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
              <span className="opacity-60">PAST 6 HOURS</span>
              <div className="bg-slate-800/90 px-4 py-1.5 rounded-full border border-white/5 shadow-inner">
                <span className="text-blue-400 font-black">{currentItem?.label}</span>
              </div>
              <span className="opacity-60">LATEST</span>
            </div>
            <div className="relative flex items-center h-4">
              <div className="absolute inset-0 bg-slate-800/50 rounded-full h-1 my-auto"></div>
              <input
                type="range"
                min="0"
                max={history.length - 1}
                value={selectedIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setSelectedIndex(parseInt(e.target.value));
                }}
                className="relative w-full h-4 bg-transparent appearance-none cursor-pointer accent-blue-500 z-10 
                  [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                  [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:mt-[-10px]
                  [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(37,99,235,0.5)] [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-slate-900"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 mb-2 max-w-4xl mx-auto w-full px-2">
        <div className="flex justify-between items-end mb-2.5 px-2">
          <div className="flex flex-col items-center">
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1.5">Heavy</span>
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-slate-600"></div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1.5">Moderate</span>
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-slate-600"></div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1.5">Light</span>
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-slate-600"></div>
          </div>
        </div>
        <div className="relative p-[1px] bg-white/5 rounded-sm shadow-2xl">
          <div className="flex h-4 w-full rounded-[1px] overflow-hidden">
            {intensityColors.map((color, idx) => (
              <div key={idx} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </div>

      <SyncFooter timestamp={syncTimestamp} className="max-w-4xl mx-auto" />
    </div>
  );
};

export default RainAreasView;