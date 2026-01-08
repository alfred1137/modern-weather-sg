import React from 'react';
import { FloodAlert } from '../types';
import SyncFooter from './SyncFooter';

interface Props {
  alerts: FloodAlert[] | null;
  syncTimestamp?: string;
}

const FloodWarningView: React.FC<Props> = ({ alerts, syncTimestamp }) => {
  if (!alerts) return <div className="text-center p-8 text-overlay1">Loading alerts...</div>;

  const activeAlerts = alerts.filter(a => a.msgType === 'Alert');
  
  // Use passed timestamp or fallback to the one from alerts if available
  const displayTimestamp = syncTimestamp || (alerts.length > 0 ? alerts[0].updatedTimestamp : undefined);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'extreme': return 'bg-red text-mantle';
      case 'severe': return 'bg-peach text-mantle';
      case 'moderate': return 'bg-yellow text-mantle';
      case 'minor': return 'bg-blue text-mantle';
      default: return 'bg-surface2 text-text';
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fadeIn">
      <header className="flex flex-col gap-1 pr-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-text leading-none">Flood Alert</h1>
        <p className="text-overlay1 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-2">Real-time alerts from PUB Singapore</p>
      </header>

      {activeAlerts.length === 0 ? (
        <div className="glass p-12 rounded-[40px] flex flex-col items-center justify-center text-center border border-surface1/20 bg-surface0/20">
          <div className="w-20 h-20 bg-green/10 rounded-full flex items-center justify-center mb-6 border border-green/20">
            <i className="fas fa-check text-green text-3xl"></i>
          </div>
          <h2 className="text-2xl font-black text-text mb-2 uppercase tracking-tighter">No Active Alerts</h2>
          <p className="text-overlay1 max-w-sm text-xs font-medium leading-relaxed">
            Everything looks clear! There are currently no flash flood observations reported by PUB.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activeAlerts.map((alert, idx) => (
            <div key={idx} className="glass p-8 rounded-[40px] border-l-4 border-l-peach flex flex-col md:flex-row gap-8 weather-card border border-surface1/20 bg-surface0/20">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="text-overlay1 text-[10px] font-black uppercase tracking-widest">
                    <i className="fas fa-clock mr-1 text-blue/50"></i>
                    {new Date(alert.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <h3 className="text-xl md:text-2xl font-black mb-3 text-text tracking-tighter uppercase">{alert.headline}</h3>
                <p className="text-overlay1 mb-6 leading-relaxed text-sm font-medium">{alert.description}</p>
                
                <div className="bg-mantle/40 p-5 rounded-2xl border border-surface1/20">
                  <h4 className="text-[10px] font-black text-blue uppercase tracking-widest mb-2 flex items-center gap-2">
                    <i className="fas fa-shield-halved"></i>
                    Response Instructions
                  </h4>
                  <p className="text-text text-xs font-bold leading-relaxed">{alert.instruction}</p>
                </div>
              </div>
              
              <div className="md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-surface1/20 pt-6 md:pt-0 md:pl-8">
                 <span className="text-[10px] text-overlay1 uppercase font-black tracking-widest mb-3">Location Context</span>
                 <p className="text-subtext0 text-xs font-bold uppercase tracking-tight leading-tight">
                    {alert.areaDesc || 'Specific area details in description.'}
                 </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass p-8 rounded-[40px] border border-surface1/20 bg-blue/5">
        <h3 className="text-[10px] font-black text-blue uppercase tracking-widest flex items-center gap-2 mb-4">
          <i className="fas fa-circle-info"></i>
          About Flash Flood Alerts
        </h3>
        <p className="text-overlay1 text-xs font-medium leading-relaxed">
          PUB issue flash flood alerts to provide early warning of heavy rain and rising water levels in drains. 
          When a flash flood occurs, it typically subsides within 30 to 60 minutes. 
          Users are advised to exercise caution and avoid affected areas during heavy rainfall.
        </p>
      </div>

      <SyncFooter timestamp={displayTimestamp} />
    </div>
  );
};

export default FloodWarningView;