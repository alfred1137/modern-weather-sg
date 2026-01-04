
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
    <div className="flex flex-col gap-6 animate-fadeIn">
      <header>
        <h1 className="text-3xl font-bold">Flood Warning</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time alerts from PUB Singapore</p>
      </header>

      {activeAlerts.length === 0 ? (
        <div className="glass p-12 rounded-3xl flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <i className="fas fa-check text-green-400 text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">No Active Flood Alerts</h2>
          <p className="text-slate-400 max-w-sm">
            Everything looks clear! There are currently no flash flood observations reported by PUB.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activeAlerts.map((alert, idx) => (
            <div key={idx} className="glass p-6 rounded-3xl border-l-4 border-l-orange-500 flex flex-col md:flex-row gap-6 weather-card">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="text-slate-500 text-xs font-medium">
                    <i className="fas fa-clock mr-1"></i>
                    {new Date(alert.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-orange-400">{alert.headline}</h3>
                <p className="text-slate-300 mb-4 leading-relaxed">{alert.description}</p>
                
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                    <i className="fas fa-hand-pointer"></i>
                    Instructions
                  </h4>
                  <p className="text-slate-200 text-sm">{alert.instruction}</p>
                </div>
              </div>
              
              <div className="md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-700 pt-6 md:pt-0 md:pl-6">
                 <span className="text-xs text-slate-500 uppercase font-bold mb-2">Location Context</span>
                 <p className="text-slate-400 text-sm italic">
                    {alert.areaDesc || 'Specific area details in description.'}
                 </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass p-6 rounded-3xl mt-4 bg-blue-500/5">
        <h3 className="font-bold flex items-center gap-2 mb-2">
          <i className="fas fa-info-circle text-blue-400"></i>
          About Flash Flood Alerts
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          PUB issue flash flood alerts to provide early warning of heavy rain and rising water levels in drains. 
          When a flash flood occurs, it typically subsides within 30 to 60 minutes. 
          Users are advised to exercise caution and avoid affected areas during heavy rainfall.
        </p>
      </div>
    </div>
  );
};

export default FloodWarningView;
