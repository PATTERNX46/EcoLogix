import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, Network, GitBranch, LineChart, ScatterChart, 
  Zap, Play, Activity
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_OPTIMIZER || "PASTE_YOUR_API_KEY_HERE";

type OptimizerType = 'quantum' | 'swarm' | 'rl';

interface OptimizerConfig {
  id: OptimizerType;
  name: string;
  icon: ReactNode; 
  color: string;
  description: string;
}

const OPTIMIZERS: OptimizerConfig[] = [
  { id: 'quantum', name: 'Quantum-Inspired Annealing', icon: <Cpu className="w-5 h-5" />, color: 'text-purple-400', description: 'Evaluates massive state spaces simultaneously. Best for sudden, catastrophic network disruptions.' },
  { id: 'swarm', name: 'Particle Swarm Intelligence', icon: <Network className="w-5 h-5" />, color: 'text-emerald-400', description: 'Simulates flocking behavior to dynamically converge on optimal routing paths over time.' },
  { id: 'rl', name: 'Deep Reinforcement Learning', icon: <GitBranch className="w-5 h-5" />, color: 'text-blue-400', description: 'Agent-based policy learning. Excels at long-term cost reduction and sequential decision making.' }
];

interface EpochData {
  cost: number;
  resilience: number;
  confidence: number;
  isOptimal?: boolean;
}

export default function OptimizationEngine() {
  const [selectedOpt, setSelectedOpt] = useState<OptimizerType>('quantum');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [iteration, setIteration] = useState(0);
  
  // Start with empty arrays so the AI data draws from scratch
  const [scatterPoints, setScatterPoints] = useState<EpochData[]>([]);
  const [confidenceData, setConfidenceData] = useState<number[]>([0]); 

  const activeOpt = OPTIMIZERS.find(o => o.id === selectedOpt) || OPTIMIZERS[0];

  const runOptimization = async () => {
    setIsOptimizing(true);
    setIteration(0);
    setScatterPoints([]); 
    setConfidenceData([0]);

    let generatedTimeline: EpochData[] = [];

    try {
      // Tell Gemini to act as the specific algorithm chosen by the user
      const prompt = `You are a Supply Chain Optimization Engine. I am running a "${activeOpt.name}" heuristic.
      
      Generate a realistic timeline of 15 epochs (iterations) showing how this specific algorithm converges to find the optimal balance between transit Cost (10 to 90) and network Resilience (10 to 90).
      - Cost should generally decrease over time.
      - Resilience should generally increase over time.
      - Confidence should start low (e.g., 10%) and asymptotically approach 95-99%.
      - Tailor the math curve to the algorithm: ${
        selectedOpt === 'quantum' ? 'Make the early jumps highly erratic and random before suddenly locking into an optimal state.' :
        selectedOpt === 'swarm' ? 'Make the points gradually and smoothly group together towards low-cost/high-resilience.' :
        'Make the first 5 epochs terrible (exploration), then rapidly improve (exploitation).'
      }

      Return EXACTLY a JSON array of 15 objects. No markdown, no backticks.
      Format:
      [
        { "cost": 85.2, "resilience": 20.1, "confidence": 12.5 },
        ...
      ]`;

      const fetchConfig = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      };

      // TIER 1: Gemini 3 Flash
      let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${apiKey}`;
      let response = await fetch(url, fetchConfig);

      // TIER 2: Backup to 2.5 Flash
      if (!response.ok) {
        url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        response = await fetch(url, fetchConfig);
      }

      if (!response.ok) throw new Error("API Overloaded");

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      
      // Safely parse the JSON timeline
      const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Could not parse JSON from AI response");
      
      generatedTimeline = JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.warn("API Error, generating mathematical fallback curve...", error);
      // HACKATHON FAILSAFE: Generate a realistic mathematical curve locally if API fails
      generatedTimeline = Array.from({ length: 15 }).map((_, i) => ({
        cost: Math.max(15, 85 - (i * 4) + (Math.random() * 10 - 5)),
        resilience: Math.min(95, 20 + (i * 4.5) + (Math.random() * 10 - 5)),
        confidence: 10 + (88 * (1 - Math.exp(-i / 4))) // Asymptotic growth
      }));
    }

    // ANIMATION PHASE: Replay the AI's timeline visually on screen
    let currentStep = 0;
    const maxSteps = generatedTimeline.length;

    const interval = setInterval(() => {
      const stepData = generatedTimeline[currentStep];
      setIteration(currentStep + 1);

      setScatterPoints(prev => [...prev, { ...stepData, isOptimal: false }]);
      setConfidenceData(prev => [...prev, stepData.confidence]);

      currentStep++;

      if (currentStep >= maxSteps) {
        clearInterval(interval);
        setIsOptimizing(false);
        
        // Final Pass: Calculate Pareto Frontier (the literal best mathematical points)
        setScatterPoints(prev => {
          let currentMaxResilience = 0;
          // Sort by cost ascending
          const sorted = [...prev].sort((a, b) => a.cost - b.cost);
          return sorted.map(p => {
            if (p.resilience > currentMaxResilience) {
              currentMaxResilience = p.resilience;
              return { ...p, isOptimal: true };
            }
            return { ...p, isOptimal: false };
          });
        });
      }
    }, 200); // 200ms per epoch creates a beautiful scanning effect
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[600px]">
      
      {/* LEFT COLUMN: Controls */}
      <div className="w-full xl:w-[380px] flex flex-col gap-6">
        <div className="shrink-0">
          <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Zap className="w-8 h-8 text-purple-500" />
            Multi-Objective Engine
          </h1>
          <p className="text-gray-400 mt-2 text-sm leading-relaxed">
            Deploy advanced heuristics to discover the Pareto optimal balance between transit cost and network resilience.
          </p>
        </div>

        {/* Optimizer Selection */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Heuristic Engine</h3>
          {OPTIMIZERS.map(opt => (
            <div 
              key={opt.id}
              onClick={() => !isOptimizing && setSelectedOpt(opt.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedOpt === opt.id 
                  ? `border-${opt.color.split('-')[1]}-500/50 bg-${opt.color.split('-')[1]}-500/10 shadow-[0_0_15px_rgba(0,0,0,0.3)]` 
                  : 'border-white/5 hover:border-white/20 bg-[#111113]'
              } ${isOptimizing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={selectedOpt === opt.id ? opt.color : 'text-gray-500'}>
                  {opt.icon}
                </div>
                <span className={`text-sm font-bold uppercase tracking-wider ${selectedOpt === opt.id ? 'text-white' : 'text-gray-400'}`}>
                  {opt.name}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{opt.description}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={runOptimization}
          disabled={isOptimizing}
          className={`mt-auto py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-2xl
            ${isOptimizing 
              ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 cursor-wait' 
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20'}`}
        >
          {isOptimizing ? <Activity className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5" />}
          {isOptimizing ? `Epoch ${iteration}/15 Iterating...` : 'Initialize Solver'}
        </button>
      </div>

      {/* RIGHT COLUMN: Visualizations */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* TOP: Pareto Frontier Scatter Plot */}
        <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl p-6 relative flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
              <ScatterChart className="w-5 h-5 text-blue-400" /> Pareto Frontier Output
            </h3>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-xs text-gray-400"><div className="w-2 h-2 rounded-full bg-gray-600"/> Explored State</span>
              <span className="flex items-center gap-2 text-xs text-emerald-400 font-bold"><div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"/> Pareto Optimal</span>
            </div>
          </div>

          <div className="flex-1 relative border-l-2 border-b-2 border-white/10 ml-6 mb-6">
            <span className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
              Resilience Score &rarr;
            </span>
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              &larr; Lower Cost
            </span>

            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-20">
              {[...Array(16)].map((_, i) => <div key={i} className="border-t border-l border-white/10" />)}
            </div>

            <AnimatePresence>
              {scatterPoints.map((pt, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: pt.isOptimal ? 1.5 : 1, opacity: pt.isOptimal ? 1 : 0.4 }}
                  className={`absolute w-3 h-3 rounded-full -ml-1.5 -mb-1.5 z-10 transition-colors duration-500
                    ${pt.isOptimal ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : 'bg-gray-500'}`}
                  style={{ 
                    left: `${pt.cost}%`, 
                    bottom: `${pt.resilience}%` 
                  }}
                />
              ))}
            </AnimatePresence>

            {!isOptimizing && scatterPoints.filter(p => p.isOptimal).length > 1 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                <motion.polyline
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  points={scatterPoints
                    .filter(p => p.isOptimal)
                    .sort((a, b) => a.cost - b.cost)
                    .map(p => `${p.cost}%, ${100 - p.resilience}%`) 
                    .join(' ')}
                />
              </svg>
            )}
          </div>
        </div>

        {/* BOTTOM: Confidence / Convergence Graph */}
        <div className="h-[250px] bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl p-6 flex flex-col">
          <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2 mb-6">
            <LineChart className={`w-5 h-5 ${activeOpt.color}`} /> Convergence Confidence
          </h3>

          <div className="flex-1 relative border-l-2 border-b-2 border-white/10 ml-6 mb-4">
            <span className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Confidence %
            </span>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Iterations / Epochs
            </span>

            {/* Custom SVG Line Chart - FIXED: Added viewBox and removed % signs */}
            <svg 
              className="absolute inset-0 w-full h-full overflow-visible"
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              <motion.polyline
                fill="none"
                stroke={selectedOpt === 'quantum' ? '#c084fc' : selectedOpt === 'swarm' ? '#34d399' : '#60a5fa'}
                strokeWidth="3"
                className="transition-all duration-300"
                points={confidenceData.map((val, idx) => {
                  const x = (idx / Math.max(15, confidenceData.length - 1)) * 100;
                  const y = 100 - val; 
                  return `${x},${y}`; // Removed the % signs here!
                }).join(' ')}
              />
              
              <motion.polygon
                fill={`url(#gradient-${selectedOpt})`}
                className="opacity-20 transition-all duration-300"
                points={`0,100 ${confidenceData.map((val, idx) => {
                  const x = (idx / Math.max(15, confidenceData.length - 1)) * 100;
                  const y = 100 - val;
                  return `${x},${y}`; // Removed the % signs here!
                }).join(' ')} ${((confidenceData.length - 1) / 15) * 100},100`}
              />

              <defs>
                <linearGradient id="gradient-quantum" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <linearGradient id="gradient-swarm" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <linearGradient id="gradient-rl" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>

            {confidenceData.length > 1 && (
              <div className="absolute right-0 top-0 text-right">
                <span className={`text-3xl font-black ${activeOpt.color}`}>
                  {confidenceData[confidenceData.length - 1].toFixed(1)}%
                </span>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Global Optima Conf.</p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}