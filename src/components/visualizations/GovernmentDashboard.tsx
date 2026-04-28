import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Landmark, Syringe, Wheat, ShieldAlert, Building2, 
  Activity, Map as MapIcon, RefreshCw, ShieldCheck,
  Radio, Server, AlertTriangle
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "PASTE_YOUR_API_KEY_HERE";

interface Sector {
  id: string;
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
}

const SECTORS: Sector[] = [
  { id: 'vaccine', name: 'Vaccine Movement', icon: Syringe, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/30', description: 'Cold-chain monitoring for national immunization programs.' },
  { id: 'food', name: 'Food Security', icon: Wheat, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/30', description: 'Tracking agricultural transit to prevent spoilage and shortages.' },
  { id: 'relief', name: 'Disaster Relief', icon: ShieldAlert, color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/30', description: 'Emergency corridors for NDRF and critical supplies.' },
  { id: 'smartcity', name: 'Smart City Logistics', icon: Building2, color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/30', description: 'Urban freight optimization and emission zone tracking.' },
];

const HUBS = [
  { name: 'Delhi NCR', top: '15%', left: '35%' },
  { name: 'Mumbai', top: '55%', left: '20%' },
  { name: 'Kolkata', top: '45%', left: '75%' },
  { name: 'Bangalore', top: '75%', left: '35%' },
  { name: 'Chennai', top: '80%', left: '45%' },
];

interface IntelligenceReport {
  status: 'NOMINAL' | 'ELEVATED' | 'CRITICAL';
  activeConvoys: number;
  report: string[];
}

export default function GovernmentDashboard() {
  const userRole = localStorage.getItem('resilio_role');

  const [activeSector, setActiveSector] = useState<Sector>(SECTORS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [intelData, setIntelData] = useState<Record<string, IntelligenceReport>>({});
  const [systemError, setSystemError] = useState<string | null>(null);

  // --- NEW: Fetch Lock to prevent React StrictMode from double-firing the API ---
  const activeFetches = useRef<Set<string>>(new Set());

  const fetchNationalIntelligence = async (sector: Sector) => {
    setActiveSector(sector);
    
    // Prevent duplicate calls if data exists OR if a fetch is already running for this sector
    if (intelData[sector.id] || activeFetches.current.has(sector.id)) {
      return; 
    }

    activeFetches.current.add(sector.id);
    setIsAnalyzing(true);
    setSystemError(null);

    const prompt = `You are the Resilio National Logistics AI for the Government of India.
    Generate a live intelligence report for the "${sector.name}" sector.
    
    Return EXACTLY a raw JSON object (no markdown) with this structure:
    {
      "status": "NOMINAL" or "ELEVATED" or "CRITICAL",
      "activeConvoys": <random realistic number between 400 and 5000>,
      "report": [
        "A highly technical 1-sentence update regarding operations in Delhi/North.",
        "A 1-sentence update regarding Kolkata/East or Mumbai/West.",
        "A 1-sentence strategic autonomous action taken by the AI."
      ]
    }`;

    let success = false;
    let attempt = 0;
    let baseDelay = 1500; 
    let lastErrorStatus = null;
    
    // Expanded array: If 2.5 and 2.0 hit a rate limit, it smoothly falls back to 1.5 to save the demo.
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
          console.warn(`API returned ${response.status}. Retrying in ${baseDelay}ms...`);
          await new Promise(r => setTimeout(r, baseDelay));
          baseDelay *= 2; 
          continue;
        }

        if (!response?.ok) throw new Error(`API Error: ${response?.status}`);

        const data = await response.json();
        const jsonMatch = data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);
        const parsedData = JSON.parse(jsonMatch[0]);
        
        setIntelData(prev => ({ ...prev, [sector.id]: parsedData }));
        success = true;

      } catch (error) {
        attempt++;
        await new Promise(r => setTimeout(r, baseDelay));
        baseDelay *= 2;
      }
    }

    if (!success) {
      setSystemError(`Connection failed (HTTP ${lastErrorStatus || 'Unknown'}). The Gemini AI engine is currently experiencing heavy load or rate limits. Please retry.`);
    }
    
    // Remove the lock once finished
    activeFetches.current.delete(sector.id);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (userRole === 'government') {
      fetchNationalIntelligence(SECTORS[0]);
    }
  }, [userRole]);

  if (userRole !== 'government') {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center bg-[#050507] rounded-2xl border border-red-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-red-500/5 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="relative z-10 flex flex-col items-center"
        >
          <ShieldAlert className="w-24 h-24 text-red-500 mb-6 animate-pulse drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
          <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-4 drop-shadow-md">Clearance Denied</h1>
          <p className="text-red-400 font-mono text-sm tracking-widest uppercase text-center max-w-md leading-relaxed bg-red-500/10 p-4 rounded-lg border border-red-500/20">
            This sector requires Level 5 Government Clearance.<br/>
            <span className="text-gray-500 mt-2 block">Terminal IP logged and reported to central command.</span>
          </p>
        </motion.div>
      </div>
    );
  }

  const activeIntel = intelData[activeSector.id];

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[700px] pb-8">
      
      {/* LEFT COLUMN: Controls */}
      <div className="w-full xl:w-[400px] flex flex-col gap-6 shrink-0">
        <div className="bg-[#050507] border border-gray-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden flex flex-col h-full">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600" />
          
          <div className="flex justify-between items-start mt-2 mb-8">
            <div>
              <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                <Landmark className="w-6 h-6 text-emerald-500" /> Gov Command
              </h2>
              <p className="text-[10px] text-gray-500 font-mono mt-1 tracking-widest">MINISTRY OF LOGISTICS OVERVIEW</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-500 text-[8px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Level 5 Clearance
              </span>
              <span className="text-[8px] text-emerald-400 font-mono tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Secure Connection
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">National Oversight Sectors</h3>
            
            {SECTORS.map(sector => {
              const Icon = sector.icon;
              const isActive = activeSector.id === sector.id;
              return (
                <motion.button
                  key={sector.id}
                  whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
                  whileTap={{ scale: isAnalyzing ? 1 : 0.98 }}
                  onClick={() => fetchNationalIntelligence(sector)}
                  disabled={isAnalyzing}
                  className={`w-full p-4 rounded-xl border flex flex-col items-start gap-2 transition-all text-left ${
                    isActive ? sector.bgColor : 'bg-[#0a0a0c] border-gray-800 hover:border-gray-700'
                  } ${isAnalyzing && !isActive ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? sector.color : 'text-gray-600'}`} />
                    <span className={`text-xs font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      {sector.name}
                    </span>
                  </div>
                  <p className={`text-[10px] leading-relaxed ${isActive ? 'text-gray-300' : 'text-gray-600'}`}>
                    {sector.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Dashboard & Analysis */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* MAP VISUALIZATION */}
        <div className="bg-[#050507] border border-gray-800 rounded-2xl shadow-xl p-1 relative overflow-hidden h-[400px]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-[#050507]" />
          
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute left-0 w-full h-1 bg-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.5)] z-0"
          />

          <h3 className="absolute top-6 left-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] z-10 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" /> Live Strategic Node Radar
          </h3>

          <div className="relative w-full h-full max-w-[500px] mx-auto z-10">
            {HUBS.map((hub, i) => (
              <div key={i} className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2" style={{ top: hub.top, left: hub.left }}>
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  className={`absolute w-8 h-8 rounded-full border border-emerald-500/50`} 
                />
                <div className={`w-2 h-2 rounded-full ${activeSector.color.replace('text-', 'bg-')} shadow-[0_0_15px_currentColor]`} />
                <span className="text-[8px] font-mono text-gray-400 mt-2 tracking-widest">{hub.name}</span>
              </div>
            ))}
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <motion.path 
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity }}
                d="M175 60 L100 220 L175 300 L225 320 L375 180 Z" stroke="currentColor" strokeWidth="1" fill="none" className={activeSector.color} 
              />
              <motion.path 
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                d="M175 60 L375 180" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" fill="none" className={activeSector.color} 
              />
            </svg>
          </div>
        </div>

        {/* AI BRIEFING / ERROR STATE */}
        <div className="bg-[#050507] border border-gray-800 rounded-2xl shadow-xl p-6 relative overflow-hidden flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4 shrink-0">
            <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
              <Server className={`w-5 h-5 ${activeSector.color}`} /> AI Intelligence Brief
            </h3>
            
            {activeIntel && !isAnalyzing && !systemError && (
              <div className={`px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest border ${
                activeIntel.status === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse' :
                activeIntel.status === 'ELEVATED' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
              }`}>
                Grid Status: {activeIntel.status}
              </div>
            )}
          </div>

          {/* LOADING STATE */}
          {isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <RefreshCw className="w-8 h-8 animate-spin mb-4" />
              <p className="font-mono text-[10px] uppercase tracking-widest animate-pulse">Compiling Federal Logistics Report via Gemini API...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {!isAnalyzing && systemError && (
            <div className="flex-1 flex flex-col items-center justify-center text-red-500">
              <AlertTriangle className="w-10 h-10 mb-4 opacity-80" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-center px-4 leading-relaxed opacity-80 max-w-sm">
                {systemError}
              </p>
              <button 
                onClick={() => fetchNationalIntelligence(activeSector)}
                className="mt-6 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-colors"
              >
                Retry Analysis
              </button>
            </div>
          )}

          {/* SUCCESS STATE */}
          {!isAnalyzing && !systemError && activeIntel && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${activeSector.bgColor}`}>
                    <Activity className={`w-6 h-6 ${activeSector.color}`} />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">Active Federal Convoys</span>
                    <span className="text-2xl font-black text-white">{activeIntel.activeConvoys.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {activeIntel.report.map((item, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      key={i} 
                      className="bg-[#0a0a0c] border border-gray-800 p-4 rounded-xl flex items-start gap-3"
                    >
                      <span className={`text-[10px] font-mono mt-0.5 ${activeSector.color}`}>0{i + 1}_</span>
                      <p className="text-xs text-gray-300 leading-relaxed font-mono">{item}</p>
                    </motion.div>
                  ))}
                </div>

              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}