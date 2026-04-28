import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Activity, ShieldAlert, Zap, Globe, Cpu, Radio, 
  Package, AlertCircle, DollarSign, Leaf, Warehouse, 
  ShieldCheck, Truck, MapPin, Navigation
} from "lucide-react";
import GlobeMap from "../../components/visualizations/GlobeMap";
import DataFusionTerminal from "../../components/visualizations/DataFusionTerminal";
import { useLiveTelemetry } from "../../store/useLiveTelemetry";

// Internal Component for animated KPI widgets
const StatCard = ({ label, value, icon: Icon, color, delay, trend }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col justify-center gap-3 group hover:border-white/20 transition-all cursor-default"
  >
    <div className="flex justify-between items-start">
      <div className={`p-2.5 rounded-xl bg-white/5 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <span className={`text-[10px] font-bold px-2 py-1 rounded bg-white/5 ${trend.startsWith('+') || trend === 'Stable' ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">{label}</p>
    </div>
  </motion.div>
);

export default function Dashboard() {
  // 1. Pull the live data from our Firebase connection
  const { healthScore, activeShipments, fuelEfficiency, co2Saved, connectToBackend } = useLiveTelemetry();

  // 2. Start listening when the dashboard loads
  useEffect(() => {
    const disconnect: any = connectToBackend();
    return () => {
      if (typeof disconnect === 'function') disconnect(); 
    }; 
  }, [connectToBackend]);

  return (
    // Removed max-h-screen and overflow constraints to allow scrolling for the new widgets
    <div className="flex flex-col gap-6 min-h-full pb-12">
      
      {/* 1. EXPANDED KPI STATS ROW (Top-Level Health & AI Impact) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 shrink-0">
        <StatCard label="Supply Health" value={`${healthScore || 96.4}%`} icon={Activity} color="text-emerald-400" delay={0.1} trend="Stable" />
        <StatCard label="Active Shipments" value={activeShipments?.toLocaleString() || "1,402"} icon={Package} color="text-blue-400" delay={0.15} trend="+12" />
        <StatCard label="Delayed Transit" value="12" icon={AlertCircle} color="text-orange-400" delay={0.2} trend="-3" />
        <StatCard label="Predicted Risks" value="03" icon={ShieldAlert} color="text-red-400" delay={0.25} />
        <StatCard label="AI Revenue Saved" value="$2.1M" icon={DollarSign} color="text-emerald-400" delay={0.3} trend="+12.5%" />
        <StatCard label="Emissions Cut" value={`${co2Saved ? (co2Saved / 1000).toFixed(1) : 14.2}k t`} icon={Leaf} color="text-emerald-400" delay={0.35} trend="-15%" />
      </div>

      {/* 2. MAIN INTELLIGENCE GRID (Map & Radar) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 shrink-0 min-h-[600px]">
        
        {/* Left Section: Map & Data Fusion (2/3 width) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          
          {/* Main Map Area */}
          <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden flex flex-col shadow-2xl relative min-h-[400px]">
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
              <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg pointer-events-auto">
                <h2 className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-2">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> 
                  Global Network Visualization
                </h2>
              </div>
              <div className="flex gap-2 pointer-events-auto">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-md border border-blue-500/30 uppercase tracking-tighter">
                  v4.2-Resilio
                </span>
              </div>
            </div>
            
            <div className="flex-1 relative bg-[#050507]">
              <GlobeMap />
            </div>
          </div>

          {/* Bottom Feed: NEW Data Fusion Layer */}
          <div className="shrink-0 h-48">
            <DataFusionTerminal />
          </div>
        </div>

        {/* Right Section: AI Radar & Insights (1/3 width) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col gap-6 shadow-2xl overflow-y-auto scrollbar-hide">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-white tracking-widest uppercase">Disruption Radar</h2>
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          
          <div className="space-y-4">
            {/* Critical Alert */}
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors border-l-4 border-l-red-500">
              <div className="text-red-400 text-xs font-bold mb-1 flex justify-between">
                <span>PORT CONGESTION</span>
                <span>94% CONF.</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed mb-2">
                Shanghai hub showing severe throughput degradation. 3 active shipments affected.
              </p>
              <div className="text-[10px] font-mono text-red-300/50 uppercase">Impact: High | Est. Delay: 48h</div>
            </div>
            
            {/* Warning Alert */}
            <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors border-l-4 border-l-yellow-500">
              <div className="text-yellow-400 text-xs font-bold mb-1 flex justify-between">
                <span>METEOROLOGICAL ANOMALY</span>
                <span className="text-orange-400">RISK: 14/100</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Typhoon trajectory intersects route ID-7734. Manual intervention suggested.
              </p>
            </div>

            {/* Gemini Copilot Panel */}
            <div className="mt-4 p-5 rounded-xl border border-blue-500/30 bg-blue-500/10 relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/40 transition-all" />
               <div className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Gemini Intelligent Copilot</div>
               <div className="text-gray-200 text-xs leading-relaxed italic border-l-2 border-blue-500/50 pl-3">
                 "I've identified a 'Self-Healing' route via rail. Switching now will bypass the Shanghai bottleneck and save $14,200 in storage fees."
               </div>
               <button className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                 Authorize Auto-Reroute
               </button>
            </div>

            {/* Network Load */}
            <div className="mt-2 p-4 rounded-xl border border-white/5 bg-black/20">
               <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold mb-3">
                 <span>Network Load</span>
                 <span className="text-emerald-400">Stable</span>
               </div>
               <div className="flex items-end gap-1 h-12">
                 {[40, 70, 45, 90, 65, 80, 30, 50, 40, 85].map((h, i) => (
                   <motion.div 
                     key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }}
                     className="flex-1 bg-white/10 rounded-t-sm"
                   />
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. NEW OPERATIONS MATRIX (Infrastructure, Logistics, ETA Tracking) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        
        {/* Fleet & Fuel Analytics */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#111113] backdrop-blur-md flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Truck className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-white uppercase tracking-wider text-sm">Fleet & Fuel Analytics</h2>
          </div>
          <div className="space-y-5">
            <div>
               <div className="flex justify-between text-xs mb-2">
                 <span className="text-gray-400 font-bold uppercase">Fleet Health</span>
                 <span className="text-emerald-400 font-black text-lg">{healthScore || 92}%</span>
               </div>
               <div className="w-full bg-white/10 rounded-full h-1.5">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${healthScore || 92}%` }} 
                    className="bg-emerald-400 h-1.5 rounded-full" 
                  />
               </div>
            </div>
            <div>
               <div className="flex justify-between text-xs mb-2">
                 <span className="text-gray-400 font-bold uppercase">Avg Fuel Efficiency</span>
                 <span className="text-blue-400 font-black text-lg">{fuelEfficiency?.toFixed(1) || 8.4} <span className="text-xs font-normal text-gray-500">MPG</span></span>
               </div>
               <div className="w-full bg-white/10 rounded-full h-1.5">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(fuelEfficiency || 8.4) * 10}%` }} 
                    className="bg-blue-400 h-1.5 rounded-full" 
                  />
               </div>
            </div>
          </div>
        </div>

        {/* Hub Occupancy & Supplier Reliability */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#111113] backdrop-blur-md flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Warehouse className="w-5 h-5 text-orange-400" />
            <h2 className="font-bold text-white uppercase tracking-wider text-sm">Infrastructure Index</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="text-gray-300">Shanghai Hub (Occupancy)</span><span className="text-red-400 font-bold">98% (Crit)</span></div>
              <div className="w-full bg-white/10 rounded-full h-1.5"><div className="bg-red-500 h-1.5 rounded-full w-[98%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="text-gray-300">Rotterdam Hub (Occupancy)</span><span className="text-emerald-400 font-bold">64%</span></div>
              <div className="w-full bg-white/10 rounded-full h-1.5"><div className="bg-emerald-400 h-1.5 rounded-full w-[64%]"></div></div>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-white/5">
              <span className="text-xs text-gray-400 font-bold uppercase flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-purple-400"/> Supplier Reliability</span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-black rounded border border-purple-500/30">Grade: A+</span>
            </div>
          </div>
        </div>

        {/* Live ETA & Route Confidence Table */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#111113] backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Navigation className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-white uppercase tracking-wider text-sm">Live Transit ETAs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] text-gray-400">
              <thead className="uppercase text-gray-500 bg-white/5">
                <tr>
                  <th className="px-3 py-2 rounded-l-md">Route</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 rounded-r-md">Confidence</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                <tr className="hover:bg-white/5 transition-colors border-b border-white/5">
                  <td className="px-3 py-3 flex items-center gap-2"><MapPin className="w-3 h-3 text-blue-500"/> Shenzhen ➔ LA</td>
                  <td className="px-3 py-3 text-emerald-400 font-bold">On Time (2d)</td>
                  <td className="px-3 py-3"><span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">98%</span></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors border-b border-white/5">
                  <td className="px-3 py-3 flex items-center gap-2"><MapPin className="w-3 h-3 text-blue-500"/> Hamburg ➔ NY</td>
                  <td className="px-3 py-3 text-orange-400 font-bold">Delayed (14h)</td>
                  <td className="px-3 py-3"><span className="text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">65%</span></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-3 py-3 flex items-center gap-2"><MapPin className="w-3 h-3 text-blue-500"/> Mumbai ➔ Dubai</td>
                  <td className="px-3 py-3 text-red-400 font-bold">Rerouting...</td>
                  <td className="px-3 py-3"><span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">AI Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}