import { ShieldAlert, Activity, ArrowUpRight } from "lucide-react";
import DisruptionRadar from "../../components/visualizations/DisruptionRadar";

export default function RadarPage() {
  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-8rem)] gap-6">
      
      {/* Sleek Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            Global Threat Radar
          </h1>
          <p className="text-gray-400 mt-2 text-sm max-w-2xl">
            Live AI prediction and root-cause analysis across all supply chain nodes. 
            Powered by Resilio.OS Neural Engine.
          </p>
        </div>
        
        {/* Quick Stats for the header */}
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 flex flex-col items-end">
            <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Critical Risks</span>
            <span className="text-xl font-black text-white">03</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex flex-col items-end">
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">AI Interventions</span>
            <span className="text-xl font-black text-white flex items-center gap-1">14 <ArrowUpRight className="w-4 h-4 text-emerald-400"/></span>
          </div>
        </div>
      </div>

      {/* The Component gets the rest of the screen! */}
      <div className="flex-1 rounded-2xl border border-white/10 bg-[#111113]/80 backdrop-blur-md p-6 shadow-2xl overflow-hidden flex flex-col">
        {/* We pass a custom height class if needed, or let it fill the flex container */}
        <DisruptionRadar />
      </div>

    </div>
  );
}