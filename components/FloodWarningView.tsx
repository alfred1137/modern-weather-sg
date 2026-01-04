import React from 'react';
import { FloodAlert } from '../types';

interface Props {
  alerts: FloodAlert[] | null;
}

const FloodWarningView: React.FC<Props> = ({ alerts }) => {
  if (!alerts) return <div className="text-center p-8">Loading alerts...</div>;

  const activeAlerts = alerts.filter(a => a.msgType === 'Alert');

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'extreme': return 'bg-red-600 text-white';
      case 'severe': return 'bg-orange-600 text-white';
      case 'moderate': return 'bg-yellow-500 text-black';
      case 'minor': return 'bg-blue-500 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fadeIn">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-slate-100">Flood Alert</h1>
        <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Real-time alerts from PUB Singapore</p>
      </header>

      {activeAlerts.length === 0 ? (
        <div className="glass p-12 rounded-[40px] flex flex-col items-center justify-center text-center border border-white/5">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
            <i className="fas fa-check text-green-400 text-3xl"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-100 mb-2 uppercase tracking-tighter">No Active Alerts</h2>
          <p className="text-slate-400 max-w-sm text-xs font-medium leading-relaxed">
            Everything looks clear! There are currently no flash flood observations reported by PUB.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activeAlerts.map((alert, idx) => (
            <div key={idx} className="glass p-8 rounded-[40px] border-l-4 border-l-orange-500 flex flex-col md:flex-row gap-8 weather-card border border-white/5">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <i className="fas fa-clock mr-1 text-blue-500/50"></i>
                    {new Date(alert.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <h3 className="text-xl md:text-2xl font-black mb-3 text-slate-100 tracking-tighter uppercase">{alert.headline}</h3>
                <p className="text-slate-400 mb-6 leading-relaxed text-sm font-medium">{alert.description}</p>
                
                <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5">
                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <i className="fas fa-shield-halved"></i>
                    Response Instructions
                  </h4>
                  <p className="text-slate-200 text-xs font-bold leading-relaxed">{alert.instruction}</p>
                </div>
              </div>
              
              <div className="md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8">
                 <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Location Context</span>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-tight leading-tight">
                    {alert.areaDesc || 'Specific area details in description.'}
                 </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass p-8 rounded-[40px] border border-white/5 bg-blue-600/[0.03]">
        <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 mb-4">
          <i className="fas fa-circle-info"></i>
          About Flash Flood Alerts
        </h3>
        <p className="text-slate-400 text-xs font-medium leading-relaxed">
          PUB issue flash flood alerts to provide early warning of heavy rain and rising water levels in drains. 
          When a flash flood occurs, it typically subsides within 30 to 60 minutes. 
          Users are advised to exercise caution and avoid affected areas during heavy rainfall.
        </p>
      </div>
    </div>
  );
};

export default FloodWarningView;