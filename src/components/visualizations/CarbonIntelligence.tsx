import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, Wind, Globe2, TreePine, Map, Activity, 
  RefreshCw, AlertTriangle, ArrowRight, Target, ShieldCheck
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_CARBON || "PASTE_YOUR_API_KEY_HERE";

interface TransitRoute {
  id: string;
  origin: string;
  destination: string;
  distance: string;
  currentMode: 'Diesel Fleet' | 'Air Freight' | 'Maritime Cargo';
  cargoWeight: string;
}

interface CarbonReport {
  currentCO2: string;      // e.g., "14.2 Tons"
  optimizedCO2: string;    // e.g., "4.8 Tons"
  savedEmissions: string;  // e.g., "9.4 Tons"
  treeEquivalent: number;  // e.g., 420
  esgScore: number;        // e.g., 88
  greenRoute: string;      // 2-sentence explanation of the multimodal swap
  sdgImpact: string[];     // Array of 3 SDG goals hit
}

const ROUTES: TransitRoute[] = [
  { id: 'RT-IND-01', origin: 'Delhi NCR', destination: 'Mumbai Port', distance: '1,420 km', currentMode: 'Diesel Fleet', cargoWeight: '24 Tons' },
  { id: 'RT-GLB-88', origin: 'Shenzhen, CN', destination: 'Rotterdam, DE', distance: '8,500 nm', currentMode: 'Maritime Cargo', cargoWeight: '450 TEU' },
  { id: 'RT-AIR-12', origin: 'Bangalore Hub', destination: 'Singapore', distance: '3,400 km', currentMode: 'Air Freight', cargoWeight: '5.2 Tons' },
];

export default function CarbonIntelligence() {
  const [selectedRoute, setSelectedRoute] = useState<TransitRoute>(ROUTES[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [esgData, setEsgData] = useState<Record<string, CarbonReport>>({});
  const [systemError, setSystemError] = useState<string | null>(null);

  const activeFetches = useRef<Set<string>>(new Set());

  const generateESGReport = async (route: TransitRoute) => {
    setSelectedRoute(route);
    
    // Prevent duplicate calls
    if (esgData[route.id] || activeFetches.current.has(route.id)) return;

    activeFetches.current.add(route.id);
    setIsAnalyzing(true);
    setSystemError(null);

    const prompt = `You are the Resilio Enterprise ESG & Carbon Calculator.
    Analyze the following supply chain route:
    - Route: ${route.origin} to ${route.destination}
    - Distance: ${route.distance}
    - Current Transport: ${route.currentMode}
    - Cargo Weight: ${route.cargoWeight}

    Calculate the environmental impact and suggest a greener alternative (e.g., swapping air for sea, or diesel for electric/rail).
    
    Return EXACTLY a raw JSON object (no markdown) with this structure:
    {
      "currentCO2": "Calculate realistic metric tons of CO2 for the CURRENT mode",
      "optimizedCO2": "Calculate realistic metric tons if they switch to the GREEN mode",
      "savedEmissions": "The difference between current and optimized",
      "treeEquivalent": <Number of trees needed to absorb the saved emissions in a year (integer)>,
      "esgScore": <Number 0-100 indicating the sustainability score of the new route>,
      "greenRoute": "2 precise sentences describing the recommended multimodal shift to achieve these savings.",
      "sdgImpact": [ "List exactly 3 relevant UN Sustainable Development Goals (e.g., 'SDG 13: Climate Action')" ]
    }`;

    let success = false;
    let attempt = 0;
    let baseDelay = 1500; 
    let lastErrorStatus = null;
    
    const fallbackModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    while (attempt < 3 && !success) {
      try {
        let response;
        for (const model of fallbackModels) {
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          if (response.status !== 404) break; 
        }

        lastErrorStatus = response?.status || null;

        if (response?.status === 429 || response?.status === 503) {
          attempt++;
          await new Promise(r => setTimeout(r, baseDelay));
          baseDelay *= 2; 
          continue;
        }

        if (!response?.ok) throw new Error(`API Error: ${response?.status}`);

        const data = await response.json();
        const jsonMatch = data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);
        const parsedData = JSON.parse(jsonMatch[0]);
        
        setEsgData(prev => ({ ...prev, [route.id]: parsedData }));
        success = true;

      } catch (error) {
        attempt++;
        await new Promise(r => setTimeout(r, baseDelay));
        baseDelay *= 2;
      }
    }

    if (!success) {
      setSystemError(`Connection failed (HTTP ${lastErrorStatus || 'Unknown'}). The Gemini AI engine is currently experiencing heavy load. Please retry.`);
    }
    
    activeFetches.current.delete(route.id);
    setIsAnalyzing(false);
  };

  const activeReport = esgData[selectedRoute.id];

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[700px] pb-8">
      
      {/* LEFT COLUMN: Routes */}
      <div className="w-full xl:w-[400px] flex flex-col gap-6 shrink-0">
        <div className="bg-[#050507] border border-gray-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden flex flex-col h-full">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-600" />
          
          <div className="flex justify-between items-start mt-2 mb-8 border-b border-gray-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                <Leaf className="w-6 h-6 text-emerald-400" /> Carbon Scope 3
              </h2>
              <p className="text-[10px] text-gray-500 font-mono mt-1 tracking-widest">EMISSIONS TRACKING DESK</p>
            </div>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {ROUTES.map(route => {
              const isActive = selectedRoute.id === route.id;
              return (
                <motion.button
                  key={route.id}
                  whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
                  whileTap={{ scale: isAnalyzing ? 1 : 0.98 }}
                  onClick={() => generateESGReport(route)}
                  disabled={isAnalyzing}
                  className={`w-full p-4 rounded-xl border flex flex-col items-start gap-3 transition-all text-left ${
                    isActive ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-[#0a0a0c] border-gray-800 hover:border-gray-700'
                  } ${isAnalyzing && !isActive ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="w-full flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">{route.origin} <ArrowRight className="inline w-3 h-3 text-gray-500" /> {route.destination}</h3>
                      <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1 block">{route.id}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-gray-800 text-gray-300 border border-gray-700">
                      {route.currentMode}
                    </span>
                  </div>
                  <div className="w-full flex items-center gap-4 text-[10px] text-gray-400 border-t border-gray-800 pt-2 font-mono">
                    <span>DIST: {route.distance}</span>
                    <span>VOL: {route.cargoWeight}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Dashboard & AI Report */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* TOP: ESG Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <div className="bg-[#050507] border border-gray-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <Wind className="absolute -right-4 -bottom-4 w-20 h-20 text-gray-800 opacity-50" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Current CO₂</span>
            <span className="text-2xl font-black text-gray-300 relative z-10">{activeReport ? activeReport.currentCO2 : '--'}</span>
          </div>
          
          <div className="bg-[#050507] border border-emerald-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <Leaf className="absolute -right-4 -bottom-4 w-20 h-20 text-emerald-900/30" />
            <span className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest block mb-2">Optimized CO₂</span>
            <span className="text-2xl font-black text-emerald-400 relative z-10">{activeReport ? activeReport.optimizedCO2 : '--'}</span>
          </div>

          <div className="bg-[#050507] border border-blue-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <Globe2 className="absolute -right-4 -bottom-4 w-20 h-20 text-blue-900/30" />
            <span className="text-[10px] font-bold text-blue-500/70 uppercase tracking-widest block mb-2">Emissions Saved</span>
            <span className="text-2xl font-black text-blue-400 relative z-10">{activeReport ? activeReport.savedEmissions : '--'}</span>
          </div>

          <div className="bg-[#050507] border border-emerald-500/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden flex flex-col justify-center items-center text-center">
            <div className="absolute top-0 w-full h-1 bg-emerald-500" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">ESG Score</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">{activeReport ? activeReport.esgScore : '--'}</span>
            </div>
          </div>
        </div>

        {/* BOTTOM: AI Situation Report */}
        <div className="bg-[#050507] border border-gray-800 rounded-2xl shadow-xl p-6 relative overflow-hidden flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4 shrink-0">
            <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Carbon Intelligence Engine
            </h3>
            {!isAnalyzing && !activeReport && (
               <button 
                 onClick={() => generateESGReport(selectedRoute)}
                 className="px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600/30 transition-colors"
               >
                 Run ESG Audit
               </button>
            )}
          </div>

          {isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-emerald-500">
              <RefreshCw className="w-8 h-8 animate-spin mb-4" />
              <p className="font-mono text-[10px] uppercase tracking-widest animate-pulse">Calculating Scope 3 Reduction via Gemini...</p>
            </div>
          )}

          {!isAnalyzing && systemError && (
            <div className="flex-1 flex flex-col items-center justify-center text-red-500">
              <AlertTriangle className="w-10 h-10 mb-4 opacity-80" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-center px-4 leading-relaxed opacity-80 max-w-sm">
                {systemError}
              </p>
              <button 
                onClick={() => generateESGReport(selectedRoute)}
                className="mt-6 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-colors"
              >
                Retry Audit
              </button>
            </div>
          )}

          {!isAnalyzing && !systemError && activeReport && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Visual Impact Box */}
                <div className="bg-emerald-950/20 border border-emerald-500/20 p-6 rounded-2xl flex items-center gap-6">
                  <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 shrink-0">
                    <TreePine className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Environmental Equivalent</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      The recommended green route saves enough CO₂ to equal the carbon absorption of <strong className="text-white font-black text-lg">{activeReport.treeEquivalent.toLocaleString()} mature trees</strong> over one full year.
                    </p>
                  </div>
                </div>

                {/* AI Green Route Recommendation */}
                <div className="bg-[#0a0a0c] border border-gray-800 p-6 rounded-2xl relative overflow-hidden">
                  <Map className="absolute top-4 right-4 w-24 h-24 text-gray-800/30 rotate-12" />
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" /> AI Green Route Directive
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-mono relative z-10">
                    {activeReport.greenRoute}
                  </p>
                </div>

                {/* SDG Impact */}
                <div>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4" /> UN Sustainable Development Goals (SDG) Achieved
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activeReport.sdgImpact.map((sdg, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="bg-[#0a0a0c] border border-gray-800 p-4 rounded-xl flex items-center gap-3 text-center justify-center"
                      >
                        <span className="text-xs font-bold text-gray-300">{sdg}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}