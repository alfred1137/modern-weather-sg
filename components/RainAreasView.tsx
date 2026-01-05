import React, { useEffect, useState, useCallback, useRef } from 'react';

type RadarMode = 'SG' | 'REGIONAL';

interface HistoryItem {
  value: string;
  label: string;
  date: Date;
}

const RainAreasView: React.FC = () => {
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

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fadeIn">
      <header className="flex justify-between items-start gap-2">
        <div className="flex flex-col gap-1 pr-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-slate-100 leading-none">Rain Areas</h1>
            <span className="bg-blue-600 text-[9px] md:text-[10px] font-black uppercase px-2 py-1 rounded text-white tracking-widest shadow-lg shadow-blue-500/20 mb-1">Live</span>
          </div>
          <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-2">
            Latest observation: <span className="text-blue-400">{currentItem?.label || '...'}</span>
          </p>
        </div>
        
        <div className="flex flex-col items-end shrink-0">
          <div className="glass p-1 rounded-xl flex flex-col sm:flex-row border border-white/5 w-auto shadow-2xl">
            <button
              onClick={() => { setMode('SG'); setSelectedIndex(-1); setIsPlaying(false); }}
              className={`px-4 sm:px-8 py-2.5 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                mode === 'SG' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Singapore
            </button>
            <button
              onClick={() => { setMode('REGIONAL'); setSelectedIndex(-1); setIsPlaying(false); }}
              className={`px-4 sm:px-8 py-2.5 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                mode === 'REGIONAL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Regional
            </button>
          </div>
        </div>
      </header>

      <div className="glass rounded-[32px] overflow-hidden relative aspect-[853/562] max-w-4xl mx-auto w-full bg-[#0f172a] border border-white/5 shadow-2xl">
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

      <div className="glass p-6 rounded-[32px] border border-white/5 shadow-xl mt-2 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between gap-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-14 h-14 flex items-center justify-center rounded-full transition-all ${
              isPlaying ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-600 text-white shadow-xl'
            }`}
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-xl`}></i>
          </button>
          
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
              <span>Past 6 Hours</span>
              <div className="bg-slate-800/80 px-3 py-1 rounded-lg border border-white/5">
                <span className="text-blue-400">{currentItem?.label}</span>
              </div>
              <span>Latest</span>
            </div>
            <input
              type="range"
              min="0"
              max={history.length - 1}
              value={selectedIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setSelectedIndex(parseInt(e.target.value));
              }}
              className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 mb-2 max-w-4xl mx-auto w-full px-2">
        <div className="flex justify-between items-end mb-1.5 px-1">
          <div className="flex flex-col items-center">
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Heavy</span>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-600"></div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Moderate</span>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-600"></div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Light</span>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-600"></div>
          </div>
        </div>
        <div className="flex h-4 w-full rounded-sm overflow-hidden border border-white/5 shadow-2xl">
          {intensityColors.map((color, idx) => (
            <div key={idx} className="flex-1" style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RainAreasView;