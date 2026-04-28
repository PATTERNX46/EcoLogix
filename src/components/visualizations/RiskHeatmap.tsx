import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe2, ShieldAlert, AlertTriangle, AlertOctagon, 
  ShieldCheck, RefreshCw, Map as MapIcon, Crosshair,
  Activity, Target
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "PASTE_YOUR_API_KEY_HERE";

interface Region {
  id: string;
  name: string;
  type: 'Choke Point' | 'Port Hub' | 'Transit Corridor';
  x: string; // Left %
  y: string; // Top %
}

interface RiskReport {
  level: 'SAFE' | 'WARNING' | 'DANGER' | 'EXTREME RISK';
  riskScore: number; // 0-100
  aiAnalysis: string;
  mitigation: string;
}

// Global strategic nodes
const REGIONS: Region[] = [
  { id: 'REG-SUEZ', name: 'Suez Canal', type: 'Choke Point', x: '55%', y: '40%' },
  { id: 'REG-REDSEA', name: 'Red Sea Corridor', type: 'Transit Corridor', x: '58%', y: '48%' },
  { id: 'REG-PANAMA', name: 'Panama Canal', type: 'Choke Point', x: '25%', y: '50%' },
  { id: 'REG-MALACCA', name: 'Strait of Malacca', type: 'Choke Point', x: '78%', y: '55%' },
  { id: 'REG-ROTTERDAM', name: 'Port of Rotterdam', type: 'Port Hub', x: '50%', y: '25%' },
  { id: 'REG-LA', name: 'Port of Los Angeles', type: 'Port Hub', x: '15%', y: '35%' },
];

export default function RiskHeatmap() {
  const [selectedRegion, setSelectedRegion] = useState<Region>(REGIONS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reports, setReports] = useState<Record<string, RiskReport>>({});
  const [systemError, setSystemError] = useState<string | null>(null);

  const activeFetches = useRef<Set<string>>(new Set());

  const analyzeRisk = async (region: Region) => {
    setSelectedRegion(region);
    
    // Prevent duplicate calls
    if (reports[region.id] || activeFetches.current.has(region.id)) return;

    activeFetches.current.add(region.id);
    setIsAnalyzing(true);
    setSystemError(null);

    const prompt = `You are a Global Supply Chain Risk Assessment AI.
    Analyze the current geopolitical, weather, and operational risk for: ${region.name} (${region.type}).
    
    Classify the risk strictly into one of these levels based on current real-world probabilities:
    - "SAFE" (Normal operations)
    - "WARNING" (Minor delays, weather alerts)
    - "DANGER" (Strikes, severe weather, piracy)
    - "EXTREME RISK" (Warzone, total blockage, catastrophic failure)

    Return EXACTLY a raw JSON object (no markdown) with this structure:
    {
      "level": "SAFE" | "WARNING" | "DANGER" | "EXTREME RISK",
      "riskScore": <number 0-100, where 100 is total shutdown>,
      "aiAnalysis": "2 sentences explaining the exact current risk factors.",
      "mitigation": "1 sentence autonomous recommendation to reroute or manage."
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
        
        setReports(prev => ({ ...prev, [region.id]: parsedData }));
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
    
    activeFetches.current.delete(region.id);
    setIsAnalyzing(false);
  };

  // Auto-scan the first region on load
  useEffect(() => {
    analyzeRisk(REGIONS[0]);
  }, []);

  const activeReport = reports[selectedRegion.id];

  const getRiskColors = (level: string | undefined) => {
    switch (level) {
      case 'SAFE': return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', shadow: 'shadow-emerald-500/20', icon: <ShieldCheck className="w-5 h-5 text-emerald-400" /> };
      case 'WARNING': return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', shadow: 'shadow-amber-500/20', icon: <AlertTriangle className="w-5 h-5 text-amber-400" /> };
      case 'DANGER': return { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', shadow: 'shadow-red-500/20', icon: <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse" /> };
      case 'EXTREME RISK': return { text: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/50', shadow: 'shadow-purple-500/40', icon: <Target className="w-5 h-5 text-purple-400 animate-pulse" /> };
      default: return { text: 'text-gray-400', bg: 'bg-gray-800', border: 'border-gray-700', shadow: 'shadow-none', icon: <Crosshair className="w-5 h-5 text-gray-500" /> };
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[700px] pb-8">
      
      {/* LEFT COLUMN: Regions List */}
      <div className="w-full xl:w-[350px] flex flex-col gap-6 shrink-0">
        <div className="bg-[#050507] border border-gray-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden flex flex-col h-full">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-red-500 to-amber-500" />
          
          <div className="flex justify-between items-start mt-2 mb-6 border-b border-gray-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                <Globe2 className="w-6 h-6 text-purple-500" /> Global Nodes
              </h2>
              <p className="text-[10px] text-gray-500 font-mono mt-1 tracking-widest">STRATEGIC CHOKE POINTS</p>
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {REGIONS.map(region => {
              const isActive = selectedRegion.id === region.id;
              const report = reports[region.id];
              const styles = getRiskColors(report?.level);

              return (
                <motion.button
                  key={region.id}
                  whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
                  whileTap={{ scale: isAnalyzing ? 1 : 0.98 }}
                  onClick={() => analyzeRisk(region)}
                  disabled={isAnalyzing}
                  className={`w-full p-4 rounded-xl border flex flex-col items-start gap-3 transition-all text-left ${
                    isActive ? `bg-gray-900 border-white/20 shadow-lg` : 'bg-[#0a0a0c] border-gray-800 hover:border-gray-700'
                  } ${isAnalyzing && !isActive ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="w-full flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">{region.name}</h3>
                      <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-0.5 block">{region.type}</span>
                    </div>
                    {report ? (
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${styles.bg} ${styles.text} ${styles.border}`}>
                        {report.level}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-gray-800 text-gray-500 border border-gray-700">
                        Pending
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Heatmap & Briefing */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* TOP: Heatmap Radar */}
        <div className="bg-[#050507] border border-gray-800 rounded-2xl shadow-xl p-1 relative overflow-hidden h-[400px]">
          {/* Faux World Map Grid */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#050507] to-[#050507]" />
          
          {/* Radar Sweep */}
          <motion.div 
            animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -ml-[400px] -mt-[400px] rounded-full border-t border-purple-500/20 bg-gradient-to-tr from-transparent via-purple-500/5 to-transparent origin-center pointer-events-none"
          />

          <h3 className="absolute top-6 left-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] z-10 flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-purple-500" /> Global Heatmap
          </h3>

          <div className="relative w-full h-full z-10">
            {REGIONS.map((region) => {
              const isSelected = selectedRegion.id === region.id;
              const report = reports[region.id];
              const styles = getRiskColors(report?.level);
              
              return (
                <div key={region.id} className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500" style={{ top: region.y, left: region.x }}>
                  {/* Ping Ring */}
                  {report && (
                    <motion.div 
                      animate={{ scale: [1, 2.5], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute w-4 h-4 rounded-full ${styles.bg.replace('/10', '/40')} ${isSelected ? 'block' : 'hidden'}`} 
                    />
                  )}
                  {/* Node */}
                  <button 
                    onClick={() => analyzeRisk(region)}
                    disabled={isAnalyzing}
                    className={`w-3 h-3 rounded-full shadow-[0_0_15px_currentColor] transition-colors duration-500 ${report ? styles.text.replace('text-', 'bg-') : 'bg-gray-600'} ${isSelected ? 'scale-150 ring-4 ring-white/10' : 'hover:scale-125'}`} 
                  />
                  {isSelected && (
                    <span className={`text-[9px] font-bold mt-3 tracking-widest uppercase bg-[#050507] px-2 py-0.5 border rounded-sm ${styles.text} ${styles.border}`}>
                      {region.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM: AI Risk Brief */}
        <div className="bg-[#050507] border border-gray-800 rounded-2xl shadow-xl p-6 relative overflow-hidden flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4 shrink-0">
            <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-500" /> AI Risk Briefing
            </h3>
            
            {activeReport && !isAnalyzing && !systemError && (
              <div className={`px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${getRiskColors(activeReport.level).bg} ${getRiskColors(activeReport.level).text} ${getRiskColors(activeReport.level).border}`}>
                {getRiskColors(activeReport.level).icon}
                STATUS: {activeReport.level}
              </div>
            )}
          </div>

          {isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-purple-500">
              <RefreshCw className="w-8 h-8 animate-spin mb-4" />
              <p className="font-mono text-[10px] uppercase tracking-widest animate-pulse">Running Geopolitical & Climate Algorithms...</p>
            </div>
          )}

          {!isAnalyzing && systemError && (
            <div className="flex-1 flex flex-col items-center justify-center text-red-500">
              <AlertTriangle className="w-10 h-10 mb-4 opacity-80" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-center px-4 leading-relaxed opacity-80 max-w-sm">
                {systemError}
              </p>
              <button 
                onClick={() => analyzeRisk(selectedRegion)}
                className="mt-6 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-colors"
              >
                Retry Scan
              </button>
            </div>
          )}

          {!isAnalyzing && !systemError && activeReport && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                
                <div className="flex items-center gap-4">
                  <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${getRiskColors(activeReport.level).border} ${getRiskColors(activeReport.level).bg} ${getRiskColors(activeReport.level).shadow}`}>
                    <span className={`text-3xl font-black ${getRiskColors(activeReport.level).text}`}>{activeReport.riskScore}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Threat Probability Matrix</span>
                    <p className="text-xs text-gray-300 font-mono leading-relaxed max-w-lg">
                      Score reflects combined probability of severe delays, asset damage, or total route blockage within the next 48 hours.
                    </p>
                  </div>
                </div>

                <div className="bg-[#0a0a0c] border border-gray-800 rounded-2xl p-5">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" /> Deep Dive Analysis
                  </h4>
                  <p className="text-sm text-gray-200 leading-relaxed font-mono">
                    {activeReport.aiAnalysis}
                  </p>
                </div>

                <div className={`border p-5 rounded-2xl ${getRiskColors(activeReport.level).bg} ${getRiskColors(activeReport.level).border}`}>
                  <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${getRiskColors(activeReport.level).text}`}>
                    <ShieldCheck className="w-4 h-4" /> Autonomous Mitigation
                  </h4>
                  <p className="text-sm text-white leading-relaxed font-bold">
                    {activeReport.mitigation}
                  </p>
                </div>

              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}