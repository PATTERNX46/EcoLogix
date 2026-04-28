import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ThermometerSnowflake, Droplets, Activity, Zap, 
  ShieldCheck, AlertOctagon, RefreshCw, Box, AlertTriangle 
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "PASTE_YOUR_API_KEY_HERE";

interface ColdChainAsset {
  id: string;
  cargo: string;
  origin: string;
  destination: string;
  status: 'Nominal' | 'Warning' | 'Critical';
  sensors: {
    temp: number;      // Celsius
    humidity: number;  // Percentage
    shock: number;     // G-force
    vibration: number; // Hz
  };
}

interface IntegrityReport {
  spoilageRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMINENT';
  integrityScore: number;
  aiAnalysis: string;
  mitigation: string[];
}

const ASSETS: ColdChainAsset[] = [
  {
    id: 'CC-VAX-01',
    cargo: 'Covishield Vaccines (10k Doses)',
    origin: 'Serum Inst. Pune',
    destination: 'Delhi AIIMS',
    status: 'Nominal',
    sensors: { temp: 4.2, humidity: 45, shock: 0.1, vibration: 12 }
  },
  {
    id: 'CC-BIO-44',
    cargo: 'Insulin Analogues',
    origin: 'Mumbai Pharma',
    destination: 'Kolkata Central',
    status: 'Critical',
    sensors: { temp: 9.8, humidity: 65, shock: 2.4, vibration: 45 } // Temp spiking, hit a bump
  },
  {
    id: 'CC-FOOD-92',
    cargo: 'Export-Grade Seafood',
    origin: 'Kochi Port',
    destination: 'Bangalore Hub',
    status: 'Warning',
    sensors: { temp: -15.5, humidity: 88, shock: 0.2, vibration: 15 } // Target is -18C
  }
];

export default function ColdChainGuardian() {
  const [selectedAsset, setSelectedAsset] = useState<ColdChainAsset>(ASSETS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reports, setReports] = useState<Record<string, IntegrityReport>>({});
  const [systemError, setSystemError] = useState<string | null>(null);

  const activeFetches = useRef<Set<string>>(new Set());

  const analyzeIntegrity = async (asset: ColdChainAsset) => {
    setSelectedAsset(asset);
    
    if (reports[asset.id] || activeFetches.current.has(asset.id)) return;

    activeFetches.current.add(asset.id);
    setIsAnalyzing(true);
    setSystemError(null);

    const prompt = `You are a Cold Chain Logistics AI. 
    Analyze the live telemetry for this highly sensitive cargo:
    Cargo: ${asset.cargo}
    Current Sensors: Temperature: ${asset.sensors.temp}°C, Humidity: ${asset.sensors.humidity}%, Shock: ${asset.sensors.shock}G, Vibration: ${asset.sensors.vibration}Hz.

    Evaluate the vaccine/perishable integrity based on these exact sensor readings.
    Return EXACTLY a raw JSON object (no markdown) with this structure:
    {
      "spoilageRisk": "LOW" | "MEDIUM" | "HIGH" | "IMMINENT",
      "integrityScore": <number 0-100 based on how close sensors are to safe limits>,
      "aiAnalysis": "2 sentences explaining the exact risk based on the sensor data.",
      "mitigation": [ "Action 1", "Action 2" ]
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
        
        setReports(prev => ({ ...prev, [asset.id]: parsedData }));
        success = true;

      } catch (error) {
        attempt++;
        await new Promise(r => setTimeout(r, baseDelay));
        baseDelay *= 2;
      }
    }

    if (!success) {
      setSystemError(`Connection failed (HTTP ${lastErrorStatus || 'Unknown'}). The Gemini engine is currently experiencing heavy load. Please retry.`);
    }
    
    activeFetches.current.delete(asset.id);
    setIsAnalyzing(false);
  };

  const activeReport = reports[selectedAsset.id];

  const getStatusColor = (status: string) => {
    if (status === 'Nominal') return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    if (status === 'Warning') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'LOW') return 'text-cyan-400';
    if (risk === 'MEDIUM') return 'text-amber-400';
    return 'text-red-500 animate-pulse';
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[700px] pb-8">
      
      {/* LEFT COLUMN: Active Assets */}
      <div className="w-full xl:w-[400px] flex flex-col gap-6 shrink-0">
        <div className="bg-[#050507] border border-white/5 rounded-2xl shadow-2xl p-6 relative overflow-hidden flex flex-col h-full">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-600" />
          
          <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-3 mt-2 mb-6 border-b border-white/5 pb-4">
            <ThermometerSnowflake className="w-6 h-6 text-cyan-400" /> Cold Chain Fleet
          </h2>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {ASSETS.map(asset => {
              const isActive = selectedAsset.id === asset.id;
              return (
                <motion.button
                  key={asset.id}
                  whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
                  whileTap={{ scale: isAnalyzing ? 1 : 0.98 }}
                  onClick={() => analyzeIntegrity(asset)}
                  disabled={isAnalyzing}
                  className={`w-full p-4 rounded-xl border flex flex-col items-start gap-3 transition-all text-left ${
                    isActive ? 'bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'bg-[#0a0a0c] border-white/5 hover:border-white/10'
                  } ${isAnalyzing && !isActive ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="w-full flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-white">{asset.cargo}</h3>
                      <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">{asset.id}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getStatusColor(asset.status)}`}>
                      {asset.status}
                    </span>
                  </div>
                  <div className="w-full flex items-center justify-between text-[10px] text-gray-400 border-t border-white/5 pt-2">
                    <span>{asset.origin}</span>
                    <span>→</span>
                    <span>{asset.destination}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Telemetry & AI Report */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* SENSOR DASHBOARD */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#050507] border border-cyan-500/20 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <ThermometerSnowflake className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Temperature</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{selectedAsset.sensors.temp}</span>
              <span className="text-xs text-cyan-500">°C</span>
            </div>
          </div>
          
          <div className="bg-[#050507] border border-blue-500/20 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Humidity</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{selectedAsset.sensors.humidity}</span>
              <span className="text-xs text-blue-500">%</span>
            </div>
          </div>

          <div className="bg-[#050507] border border-amber-500/20 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Impact Shock</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{selectedAsset.sensors.shock}</span>
              <span className="text-xs text-amber-500">G</span>
            </div>
          </div>

          <div className="bg-[#050507] border border-purple-500/20 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vibration</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{selectedAsset.sensors.vibration}</span>
              <span className="text-xs text-purple-500">Hz</span>
            </div>
          </div>
        </div>

        {/* AI INTEGRITY TRACKER */}
        <div className="bg-[#050507] border border-white/5 rounded-2xl shadow-xl p-6 relative overflow-hidden flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" /> Vaccine & Spoilage Tracker
            </h3>
            {!isAnalyzing && !activeReport && (
               <button 
                 onClick={() => analyzeIntegrity(selectedAsset)}
                 className="px-4 py-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-600/30 transition-colors"
               >
                 Run Integrity Check
               </button>
            )}
          </div>

          {isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-cyan-500">
              <RefreshCw className="w-10 h-10 animate-spin mb-4" />
              <p className="font-mono text-[10px] uppercase tracking-widest animate-pulse">Running live sensor heuristics...</p>
            </div>
          )}

          {!isAnalyzing && systemError && (
            <div className="flex-1 flex flex-col items-center justify-center text-red-500">
              <AlertTriangle className="w-10 h-10 mb-4 opacity-80" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-center px-4 leading-relaxed opacity-80 max-w-sm">
                {systemError}
              </p>
              <button 
                onClick={() => analyzeIntegrity(selectedAsset)}
                className="mt-6 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-colors"
              >
                Retry Scan
              </button>
            </div>
          )}

          {!isAnalyzing && !systemError && !activeReport && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 opacity-50">
              <Box className="w-16 h-16 mb-4" />
              <p className="font-mono text-[10px] uppercase tracking-widest">Awaiting AI execution for {selectedAsset.id}</p>
            </div>
          )}

          {!isAnalyzing && !systemError && activeReport && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0a0a0c] border border-white/5 p-5 rounded-2xl">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Spoilage Risk Level</span>
                    <div className="flex items-center gap-2">
                      {activeReport.spoilageRisk === 'IMMINENT' && <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse" />}
                      <span className={`text-2xl font-black ${getRiskColor(activeReport.spoilageRisk)}`}>
                        {activeReport.spoilageRisk}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-[#0a0a0c] border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-400 to-blue-600" />
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Integrity Score</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">{activeReport.integrityScore}</span>
                      <span className="text-xs text-gray-500">/ 100</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-5">
                  <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3">AI Diagnostic</h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-mono">
                    {activeReport.aiAnalysis}
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Recommended Mitigation</h4>
                  <div className="space-y-2">
                    {activeReport.mitigation.map((action, i) => (
                      <div key={i} className="bg-[#0a0a0c] border border-white/5 p-3 rounded-lg flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                        <span className="text-xs text-gray-300 font-mono">{action}</span>
                      </div>
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