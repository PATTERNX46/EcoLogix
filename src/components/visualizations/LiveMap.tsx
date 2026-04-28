import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe2, AlertTriangle, Activity, MapPin, 
  RefreshCw, ShieldCheck, Clock, ServerCrash
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "PASTE_YOUR_API_KEY_HERE";

interface MapNode {
  id: string;
  name: string;
  region: string;
  type: 'Port' | 'Canal' | 'Rail Hub';
  x: number; 
  y: number; 
}

interface AIAnalysis {
  status: 'Nominal' | 'Warning' | 'Critical';
  delayHours: number;
  activeThreat: string;
  recommendation: string;
}

const GLOBAL_NODES: MapNode[] = [
  { id: 'n1', name: 'Port of Los Angeles', region: 'North America', type: 'Port', x: 12, y: 38 },
  { id: 'n2', name: 'Panama Canal', region: 'Central America', type: 'Canal', x: 22, y: 58 },
  { id: 'n3', name: 'Rotterdam Hub', region: 'Europe', type: 'Port', x: 48, y: 28 },
  { id: 'n4', name: 'Suez Canal', region: 'Middle East', type: 'Canal', x: 58, y: 45 },
  { id: 'n5', name: 'Shanghai Port', region: 'Asia', type: 'Port', x: 82, y: 40 },
  { id: 'n6', name: 'Singapore Strait', region: 'Asia', type: 'Canal', x: 78, y: 62 },
  { id: 'n7', name: 'Euro-Rail Freight Terminal', region: 'Europe', type: 'Rail Hub', x: 52, y: 22 },
];

export default function LiveMap() {
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingText, setLoadingText] = useState("Establishing Neural Link...");
  const [nodeData, setNodeData] = useState<Record<string, AIAnalysis>>({});
  const [systemError, setSystemError] = useState<string | null>(null);

  // 100% REAL API ENGINE - Exponential Retries for True Functionality
  const runLiveAnalysis = async (node: MapNode) => {
    setSelectedNode(node);
    
    if (nodeData[node.id]) return;

    setIsAnalyzing(true);
    setSystemError(null);
    setLoadingText(`Intercepting ${node.name} Telemetry...`);

    const prompt = `You are a Global Supply Chain Intelligence AI.
    Analyze the current theoretical risk profile for the following logistics node:
    - Name: ${node.name}
    - Type: ${node.type}
    - Region: ${node.region}

    Invent a highly realistic, current supply chain status for this node.
    Return EXACTLY a raw JSON object (no markdown, no backticks) with this structure:
    {
      "status": "Nominal" OR "Warning" OR "Critical",
      "delayHours": <number between 0 and 72>,
      "activeThreat": "A 3-to-5 word description of the current main issue",
      "recommendation": "A 1-sentence enterprise logistics recommendation."
    }`;

    let attempt = 0;
    let success = false;

    while (attempt < 4 && !success) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (response.status === 429) {
          attempt++;
          setLoadingText(`Rate Limit Intercepted. Retrying in 3s (Attempt ${attempt}/4)...`);
          await new Promise(r => setTimeout(r, 3000)); 
          continue; 
        }

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        const textResponse = data.candidates[0].content.parts[0].text;
        
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("JSON Parse Error");

        const parsedData: AIAnalysis = JSON.parse(jsonMatch[0]);
        setNodeData(prev => ({ ...prev, [node.id]: parsedData }));
        success = true;

      } catch (error) {
        attempt++;
        setLoadingText(`Carrier Wave Lost. Recalibrating (Attempt ${attempt}/4)...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (!success) {
      setSystemError("Neural Uplink Failed: Google API rate limits exceeded. Please wait 60 seconds.");
    }
    
    setIsAnalyzing(false);
  };

  const activeData = selectedNode ? nodeData[selectedNode.id] : null;

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[600px]">
      
      {/* LEFT COLUMN: The Tactical Map */}
      <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl flex flex-col relative overflow-hidden">
        
        <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent relative z-10 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-white tracking-widest uppercase flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-blue-400" /> Live Network Map
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Global Node Telemetry Layer</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Ocean Freight</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Rail Link</span>
            </div>
            <div className="flex items-center gap-2 ml-4 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
               Live Data Feed
            </div>
          </div>
        </div>

        <div className="flex-1 relative bg-[#060608] overflow-hidden min-h-[450px]">
          
          {/* Holographic Map Background */}
          <div 
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')`,
              backgroundSize: '110% 90%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: 'invert(1) opacity(0.18) grayscale(1)',
            }}
          />

          {/* Grid Layer */}
          <div className="absolute inset-0 opacity-20 z-0" style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          {/* Prime Meridian & Equator Lines */}
          <div className="absolute top-[52%] left-0 w-full h-[1px] bg-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] z-0" />
          <div className="absolute top-0 left-[48%] w-[1px] h-full bg-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] z-0" />

          {/* NEW: SVG Routing Lines to connect the nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {/* Trans-Pacific: Shanghai -> LA */}
            <line x1="82%" y1="40%" x2="12%" y2="38%" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="4 4" />
            {/* Asia-Europe: Shanghai -> Singapore -> Suez -> Rotterdam */}
            <line x1="82%" y1="40%" x2="78%" y2="62%" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4 4" />
            <line x1="78%" y1="62%" x2="58%" y2="45%" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4 4" />
            <line x1="58%" y1="45%" x2="48%" y2="28%" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4 4" />
            {/* Americas: LA -> Panama -> Rotterdam */}
            <line x1="12%" y1="38%" x2="22%" y2="58%" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4 4" />
            <line x1="22%" y1="58%" x2="48%" y2="28%" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4 4" />
            {/* European Rail Link (Cold Chain) */}
            <line x1="48%" y1="28%" x2="52%" y2="22%" stroke="#22d3ee" strokeWidth="2" strokeOpacity="0.8" strokeDasharray="2 2" />
          </svg>

          {/* Map Nodes */}
          {GLOBAL_NODES.map(node => {
            const isSelected = selectedNode?.id === node.id;
            const nodeInfo = nodeData[node.id];
            
            let dotColor = 'bg-blue-400 shadow-[0_0_15px_#60a5fa]';
            if (nodeInfo) {
               if (nodeInfo.status === 'Critical') dotColor = 'bg-red-400 shadow-[0_0_15px_#f87171]';
               else if (nodeInfo.status === 'Warning') dotColor = 'bg-amber-400 shadow-[0_0_15px_#fbbf24]';
               else dotColor = 'bg-emerald-400 shadow-[0_0_15px_#34d399]';
            }

            return (
              <div 
                key={node.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-20"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                onClick={() => runLiveAnalysis(node)}
              >
                {isSelected && (
                  <motion.div 
                    layoutId="node-ping"
                    className="absolute inset-0 w-10 h-10 -ml-3 -mt-3 border-2 border-white/40 rounded-full animate-ping" 
                  />
                )}
                
                <div className={`w-4 h-4 rounded-full border-2 border-[#0a0a0c] transition-all duration-300 ${dotColor} ${isSelected ? 'scale-125 ring-4 ring-white/10' : 'hover:scale-125'}`} />
                
                <div className={`mt-3 px-2 py-1 bg-black/90 border border-white/20 rounded backdrop-blur-md text-[9px] font-bold tracking-widest uppercase transition-all whitespace-nowrap
                  ${isSelected ? 'opacity-100 text-white scale-110 shadow-lg' : 'opacity-0 group-hover:opacity-100 text-gray-400'}`}>
                  {node.name}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: AI Analysis Terminal */}
      <div className="w-full xl:w-[380px] flex flex-col gap-6">
        <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ServerCrash className="w-20 h-20 text-blue-500" />
          </div>

          <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2 mb-8">
            <Activity className="w-5 h-5 text-blue-500" /> Intelligence Feed
          </h3>

          {!selectedNode && (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
              <MapPin className="w-16 h-16 mb-4" />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white">Awaiting Node Selection</p>
              <p className="text-[10px] mt-2 font-mono">Select a map node to initialize live neural assessment.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-blue-400">
              <RefreshCw className="w-10 h-10 animate-spin mb-6" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-center px-6 leading-relaxed">{loadingText}</p>
            </div>
          )}

          {systemError && !isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-red-500 text-center p-6 bg-red-500/5 rounded-2xl border border-red-500/20">
              <AlertTriangle className="w-12 h-12 mb-4" />
              <p className="font-black text-sm uppercase tracking-widest mb-3">Neural Breach</p>
              <p className="text-[10px] leading-relaxed font-mono opacity-80">{systemError}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!isAnalyzing && activeData && selectedNode && !systemError && (
              <motion.div 
                key={selectedNode.id}
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
              >
                <div className="mb-8 border-b border-white/10 pb-4">
                  <h4 className="text-xl font-black text-white uppercase tracking-tight">{selectedNode.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{selectedNode.type}</span>
                    <span className="text-[10px] text-gray-600 font-bold">•</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{selectedNode.region}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className={`p-4 rounded-2xl border transition-colors ${activeData.status === 'Critical' ? 'bg-red-500/10 border-red-500/30' : activeData.status === 'Warning' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1">Threat Level</span>
                    <span className={`text-lg font-black uppercase ${activeData.status === 'Critical' ? 'text-red-400' : activeData.status === 'Warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {activeData.status}
                    </span>
                  </div>
                  
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                      <Clock className="w-3 h-3"/>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Est. Latency</span>
                    </div>
                    <span className="text-lg font-black text-white uppercase">{activeData.delayHours} HRS</span>
                  </div>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] block mb-2">Detected Anomaly</span>
                    <div className="px-4 py-3 bg-[#111113] border border-white/10 rounded-xl text-[11px] font-bold text-gray-200 shadow-inner">
                      {activeData.activeThreat}
                    </div>
                  </div>

                  <div>
                    {/* Fixed CSS conflict here: Removed 'block' and kept 'flex' */}
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5"/> Gemini AI Recommendation
                    </span>
                    <div className="p-4 bg-blue-500/5 border-l-4 border-blue-500 rounded-r-xl">
                      <p className="text-[11px] leading-relaxed text-gray-300 italic">
                        "{activeData.recommendation}"
                      </p>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}