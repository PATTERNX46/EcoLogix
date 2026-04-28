import { Ship, Cpu, CloudLightning, MessageSquare, ShieldCheck, Satellite, Navigation, Newspaper, FileText } from 'lucide-react';
import { useDataFusion, FusionAlert } from '../../hooks/useDataFusion';

const categoryConfig = {
  gps: { icon: Navigation, color: 'text-blue-400' },
  iot: { icon: Cpu, color: 'text-emerald-400' },
  weather: { icon: CloudLightning, color: 'text-sky-400' },
  social: { icon: MessageSquare, color: 'text-purple-400' },
  customs: { icon: ShieldCheck, color: 'text-orange-400' },
  satellite: { icon: Satellite, color: 'text-indigo-400' },
  ais: { icon: Ship, color: 'text-cyan-400' },
  news: { icon: Newspaper, color: 'text-pink-400' },
  regulatory: { icon: FileText, color: 'text-gray-400' },
};

export default function DataFusionTerminal() {
  const alerts = useDataFusion();

  return (
    // Look here: Removed 'absolute'. It is now a standard flex container!
    <div className="flex flex-col w-full h-full min-h-[200px] bg-[#18181b] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <h3 className="text-[10px] font-black tracking-widest text-white uppercase flex items-center gap-2">
          <Satellite className="w-4 h-4 text-emerald-400 animate-pulse" /> 
          Omni-Channel Data Fusion Array
        </h3>
        <div className="flex gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest">Live Link</p>
        </div>
      </div>

      {/* Scrolling Feed */}
      <div className="flex-1 p-3 overflow-hidden flex flex-col justify-end gap-2 relative">
        {/* Optional CSS mask for a fade-out effect at the top */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#18181b] to-transparent z-10 pointer-events-none" />
        
        {alerts.map((alert: FusionAlert) => {
          const Icon = categoryConfig[alert.category].icon;
          const iconColor = categoryConfig[alert.category].color;
          
          let severityClass = "border-white/5 bg-white/5 text-gray-300";
          if (alert.severity === 'critical') severityClass = "border-red-500/30 bg-red-500/10 text-red-300";
          if (alert.severity === 'warning') severityClass = "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";

          return (
            <div 
              key={alert.id} 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border backdrop-blur-sm animate-in slide-in-from-bottom-2 fade-in duration-300 ${severityClass}`}
            >
              <div className="w-14 text-[10px] font-mono text-gray-500 shrink-0">{alert.timestamp}</div>
              <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
              <div className={`w-20 text-[10px] font-bold uppercase tracking-wider shrink-0 ${iconColor}`}>
                {alert.category}
              </div>
              <div className="text-xs truncate">{alert.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}