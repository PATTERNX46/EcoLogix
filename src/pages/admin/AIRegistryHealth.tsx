import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, KeyRound, ServerCrash, CheckCircle2, RefreshCw, Cpu, Database } from 'lucide-react';
import { EngineName } from '../../lib/aiRegistry';
import { geminiRequest, GeminiResponse } from '../../lib/geminiRequest';

const ENGINES: EngineName[] = [
  "copilot", "alerting", "optimizer", "warehouse", 
  "supplier", "risk", "carbon", "fleet", 
  "fraud", "blockchain", "route", "coldchain", 
  "disaster", "digitalTwin", "government", "analytics", "livemap"
];

export default function AIRegistryHealth() {
  const [healthState, setHealthState] = useState<Record<string, GeminiResponse & { isPinging: boolean, latency: number }>>({});
  const [isGlobalRefresh, setIsGlobalRefresh] = useState(false);

  const pingEngine = async (engine: EngineName) => {
    setHealthState(prev => ({ ...prev, [engine]: { ...prev[engine], isPinging: true } }));
    
    const start = performance.now();
    const response = await geminiRequest(engine, "System health check. Reply with the word 'OK'.", 0); 
    const end = performance.now();

    setHealthState(prev => ({
      ...prev,
      [engine]: { ...response, isPinging: false, latency: Math.round(end - start) }
    }));
  };

  const pingAll = async () => {
    setIsGlobalRefresh(true);
    for (const engine of ENGINES) {
      await pingEngine(engine);
      await new Promise(r => setTimeout(r, 200)); // Stagger requests to avoid rapid spikes
    }
    setIsGlobalRefresh(false);
  };

  useEffect(() => { pingAll(); }, []);

  const getStatusConfig = (engineData: any) => {
    if (!engineData) return { label: "Untested", color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/30", icon: Activity };
    if (engineData.isPinging) return { label: "Pinging...", color: "text-blue-400", bg: "bg-blue-500/10 animate-pulse", border: "border-blue-500/30", icon: RefreshCw };
    
    if (engineData.success) return { label: "Healthy", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: CheckCircle2 };
    
    switch (engineData.errorType) {
      case "MISSING_KEY": return { label: "Missing Key", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", icon: KeyRound };
      case "FORBIDDEN": return { label: "Forbidden (403)", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", icon: ShieldAlert };
      case "RATE_LIMITED": return { label: "Rate Limited (429)", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: Activity };
      case "MODEL_MISSING": return { label: "Model Missing", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: Database };
      default: return { label: "Network/Server Err", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: ServerCrash };
    }
  };

  const healthyCount = Object.values(healthState).filter(s => s.success).length;
  const rateLimitCount = Object.values(healthState).filter(s => s.errorType === "RATE_LIMITED").length;
  const criticalCount = Object.values(healthState).filter(s => s.errorType === "FORBIDDEN" || s.errorType === "MISSING_KEY").length;

  return (
    <div className="min-h-screen bg-[#050507] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-widest uppercase flex items-center gap-3">
              <Cpu className="w-8 h-8 text-blue-500" /> Resilio.OS Neural Grid
            </h1>
            <p className="text-gray-500 font-mono text-sm mt-2">Centralized Gemini API Engine Monitoring</p>
          </div>
          <button 
            onClick={pingAll} disabled={isGlobalRefresh}
            className="px-6 py-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isGlobalRefresh ? 'animate-spin' : ''}`} />
            Sync Grid
          </button>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#0a0a0c] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
            <div className="p-4 bg-blue-500/10 rounded-xl"><Cpu className="w-6 h-6 text-blue-400" /></div>
            <div><p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Engines</p><p className="text-2xl font-black">{ENGINES.length}</p></div>
          </div>
          <div className="bg-[#0a0a0c] border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)] p-6 rounded-2xl flex items-center gap-4">
            <div className="p-4 bg-emerald-500/10 rounded-xl"><CheckCircle2 className="w-6 h-6 text-emerald-400" /></div>
            <div><p className="text-[10px] text-emerald-500/70 uppercase tracking-widest font-bold">Operational</p><p className="text-2xl font-black text-emerald-400">{healthyCount}</p></div>
          </div>
          <div className="bg-[#0a0a0c] border border-amber-500/20 p-6 rounded-2xl flex items-center gap-4">
            <div className="p-4 bg-amber-500/10 rounded-xl"><Activity className="w-6 h-6 text-amber-400" /></div>
            <div><p className="text-[10px] text-amber-500/70 uppercase tracking-widest font-bold">Rate Limited</p><p className="text-2xl font-black text-amber-400">{rateLimitCount}</p></div>
          </div>
          <div className="bg-[#0a0a0c] border border-red-500/20 p-6 rounded-2xl flex items-center gap-4">
            <div className="p-4 bg-red-500/10 rounded-xl"><ShieldAlert className="w-6 h-6 text-red-400" /></div>
            <div><p className="text-[10px] text-red-500/70 uppercase tracking-widest font-bold">Key/Auth Errors</p><p className="text-2xl font-black text-red-400">{criticalCount}</p></div>
          </div>
        </div>

        {/* Registry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ENGINES.map((engine) => {
            const data = healthState[engine];
            const status = getStatusConfig(data);
            const Icon = status.icon;

            return (
              <div key={engine} className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${status.bg.split(' ')[0].replace('/10', '')}`} />
                <div className="flex justify-between items-start mb-4 pl-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">{engine}</h3>
                </div>
                <div className="pl-3 space-y-3">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-black uppercase tracking-widest ${status.bg} ${status.border} ${status.color}`}>
                    <Icon className="w-3 h-3" /> {status.label}
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono border-t border-white/5 pt-3">
                    <span className="text-gray-500">Model:</span>
                    <span className="text-gray-300">{data?.modelUsed || '---'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-gray-500">Latency:</span>
                    <span className={data?.latency > 3000 ? 'text-amber-400' : 'text-emerald-400'}>
                      {data?.latency ? `${data.latency}ms` : '---'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}