import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Route, Anchor, Train, Truck, Plane, Package,
  DollarSign, Clock, Leaf, ShieldCheck, AlertTriangle, Fuel,
  BrainCircuit, CheckCircle2, XCircle, ArrowRight, Activity,
  RefreshCw // <-- FIX 1: Added missing icon
} from 'lucide-react';

// --- DATA MODELS ---
type Mode = 'sea' | 'rail' | 'truck' | 'air' | 'drone' | 'micro-hub';

interface RouteNode {
  mode: Mode;
  location: string;
  status: 'ok' | 'delayed' | 'blocked';
}

interface RouteOption {
  id: string;
  name: string;
  type: 'original' | 'alternate';
  isRecommended?: boolean;
  nodes: RouteNode[];
  metrics: {
    cost: number; // in USD
    eta: number; // in hours
    carbon: number; // in tons
    reliability: number; // percentage
    risk: 'Low' | 'Medium' | 'Critical';
    fuel: number; // in liters
  };
}

// --- MOCK DATA ENGINE ---
const ROUTES: RouteOption[] = [
  {
    id: 'r-orig',
    name: 'Original Path (Convoy 7)',
    type: 'original',
    nodes: [
      { mode: 'sea', location: 'Shanghai Port', status: 'ok' },
      { mode: 'sea', location: 'Pacific Transit', status: 'delayed' },
      { mode: 'truck', location: 'Port of LA', status: 'blocked' }, // The disruption!
      { mode: 'truck', location: 'Texas Fulfillment', status: 'ok' }
    ],
    metrics: { cost: 12500, eta: 480, carbon: 42, reliability: 35, risk: 'Critical', fuel: 8500 }
  },
  {
    id: 'r-alt-a',
    name: 'Alternate A: Multi-Modal Rail',
    type: 'alternate',
    isRecommended: true, // The AI's choice!
    nodes: [
      { mode: 'sea', location: 'Shanghai Port', status: 'ok' },
      { mode: 'sea', location: 'Seattle Port', status: 'ok' },
      { mode: 'rail', location: 'Northern Rail Corridor', status: 'ok' },
      { mode: 'micro-hub', location: 'Dallas Micro-Hub', status: 'ok' },
      { mode: 'truck', location: 'Texas Fulfillment', status: 'ok' }
    ],
    metrics: { cost: 14200, eta: 510, carbon: 28, reliability: 94, risk: 'Low', fuel: 4100 }
  },
  {
    id: 'r-alt-b',
    name: 'Alternate B: Expedited Air & Drone',
    type: 'alternate',
    nodes: [
      { mode: 'sea', location: 'Shanghai Port', status: 'ok' },
      { mode: 'air', location: 'Air Freight (SFO)', status: 'ok' },
      { mode: 'micro-hub', location: 'Austin Micro-Hub', status: 'ok' },
      { mode: 'drone', location: 'Last-Mile Drone', status: 'ok' }
    ],
    metrics: { cost: 38500, eta: 120, carbon: 85, reliability: 88, risk: 'Medium', fuel: 12000 }
  }
];

// Helper to render the right icon for the transport mode
const ModeIcon = ({ mode, className }: { mode: Mode, className?: string }) => {
  switch (mode) {
    case 'sea': return <Anchor className={className} />;
    case 'rail': return <Train className={className} />;
    case 'truck': return <Truck className={className} />;
    case 'air': return <Plane className={className} />;
    case 'drone': return <Plane className={className} />; 
    case 'micro-hub': return <Package className={className} />;
    default: return <Route className={className} />;
  }
};

export default function SelfHealingRouting() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('r-orig');

  const selectedRoute = ROUTES.find(r => r.id === selectedRouteId) || ROUTES[0];
  const originalRoute = ROUTES[0];

  const runHealingAI = () => {
    setIsAnalyzing(true);
    setHasAnalyzed(false);
    setSelectedRouteId('r-orig'); 

    setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalyzed(true);
      setSelectedRouteId('r-alt-a'); 
    }, 2500);
  };

  // FIX 2: Changed JSX.Element to ReactNode for strict TypeScript
  const renderMetricBar = (label: string, icon: ReactNode, val: number | string, origVal: number | string, unit: string, isInverseGood = false) => {
    const isNum = typeof val === 'number' && typeof origVal === 'number';
    let color = 'bg-blue-500';
    let diffText = '';

    if (isNum) {
      const diff = val - origVal;
      const percent = Math.abs(diff / origVal) * 100;
      
      if (diff < 0) {
        color = isInverseGood ? 'bg-red-500' : 'bg-emerald-500';
        diffText = `-${percent.toFixed(0)}%`;
      } else if (diff > 0) {
        color = isInverseGood ? 'bg-emerald-500' : 'bg-red-500';
        diffText = `+${percent.toFixed(0)}%`;
      } else {
        color = 'bg-gray-500';
        diffText = 'Even';
      }
    } else {
      color = val === 'Low' ? 'bg-emerald-500' : val === 'Critical' ? 'bg-red-500' : 'bg-orange-500';
    }

    return (
      <div className="space-y-1.5">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-1.5 text-gray-400">
            {icon} <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
          </div>
          <div className="flex items-end gap-2">
            {hasAnalyzed && selectedRoute.id !== 'r-orig' && diffText && (
               <span className={`text-[10px] font-black ${color.replace('bg-', 'text-')}`}>
                 {diffText}
               </span>
            )}
            <span className="text-sm font-black text-white">
              {typeof val === 'number' ? val.toLocaleString() : val} <span className="text-[10px] text-gray-500">{unit}</span>
            </span>
          </div>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: typeof val === 'number' ? '100%' : '100%' }} 
            className={`h-full ${color} opacity-80`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[500px]">
      
      {/* LEFT COLUMN: Route Options & AI Trigger */}
      <div className="w-full xl:w-[350px] flex flex-col gap-4">
        
        {/* Header */}
        <div className="p-5 bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl shrink-0">
          <h2 className="text-lg font-black text-white tracking-widest uppercase flex items-center gap-2 mb-2">
            <Route className="w-5 h-5 text-purple-400" />
            Self-Healing Routing
          </h2>
          <p className="text-xs text-gray-400">
            AI monitoring transit nodes. Injecting dynamic multimodal alternatives upon disruption detection.
          </p>

          <button 
            onClick={runHealingAI}
            disabled={isAnalyzing}
            className={`mt-4 w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-2xl
              ${isAnalyzing 
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 cursor-wait' 
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20'}`}
          >
            {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            {isAnalyzing ? 'Calculating Multimodal Paths...' : 'Run Auto-Healing AI'}
          </button>
        </div>

        {/* Route List */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
          {ROUTES.map((route) => {
            if (!hasAnalyzed && route.type === 'alternate') return null;

            const isSelected = selectedRouteId === route.id;
            
            let borderClass = 'border-white/5 hover:border-white/20';
            if (isSelected) borderClass = 'border-purple-500/50 bg-purple-500/5';
            if (route.type === 'original' && hasAnalyzed) borderClass = 'border-red-500/30 opacity-50'; 

            return (
              <div 
                key={route.id}
                // FIX 3: Changed setHasAnalyzed to hasAnalyzed
                onClick={() => hasAnalyzed ? setSelectedRouteId(route.id) : undefined}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${borderClass} relative overflow-hidden`}
              >
                {route.isRecommended && hasAnalyzed && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-bl-lg">
                    AI Choice
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-2">
                  {route.type === 'original' ? <AlertTriangle className="w-4 h-4 text-red-400"/> : <CheckCircle2 className="w-4 h-4 text-emerald-400"/>}
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                    {route.name}
                  </h3>
                </div>
                
                {/* Mini Node Preview */}
                <div className="flex items-center gap-1 opacity-70">
                  {route.nodes.map((n, i) => (
                    <div key={i} className="flex items-center">
                      <ModeIcon mode={n.mode} className="w-3 h-3 text-gray-400" />
                      {i < route.nodes.length - 1 && <ArrowRight className="w-3 h-3 text-gray-600 mx-1" />}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Visualizer & Metrics */}
      <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl flex flex-col overflow-hidden relative">
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
            >
              <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full animate-ping"></div>
                <div className="absolute inset-2 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                <BrainCircuit className="w-8 h-8 text-purple-400 animate-pulse" />
              </div>
              <p className="text-purple-400 font-mono text-xs uppercase tracking-widest animate-pulse">
                Evaluating Cost/Carbon/Risk Matrices...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Visual Route Path Header */}
        <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Path Topology</h3>
          
          <div className="flex items-center justify-between relative">
            {/* The Connecting Line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-white/10 z-0 rounded-full" />
            
            {/* The Nodes */}
            {selectedRoute.nodes.map((node, i) => {
              const isBroken = node.status === 'blocked';
              return (
                <div key={i} className="relative z-10 flex flex-col items-center gap-2 group">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 bg-[#0a0a0c] transition-all
                    ${isBroken ? 'border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                    : 'border-white/20 text-gray-300 group-hover:border-purple-500 group-hover:text-purple-400'}`}
                  >
                    {isBroken ? <XCircle className="w-5 h-5" /> : <ModeIcon mode={node.mode} className="w-5 h-5" />}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider text-center max-w-[70px]
                    ${isBroken ? 'text-red-400' : 'text-gray-500'}`}>
                    {node.location}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="p-6 flex-1 grid grid-cols-2 gap-x-8 gap-y-6 overflow-y-auto custom-scrollbar">
          {renderMetricBar('Est. Cost', <DollarSign className="w-3 h-3"/>, selectedRoute.metrics.cost, originalRoute.metrics.cost, 'USD', false)}
          {renderMetricBar('Transit Time', <Clock className="w-3 h-3"/>, selectedRoute.metrics.eta, originalRoute.metrics.eta, 'HRS', false)}
          {renderMetricBar('Carbon Footprint', <Leaf className="w-3 h-3"/>, selectedRoute.metrics.carbon, originalRoute.metrics.carbon, 'TONS', false)}
          {renderMetricBar('Fuel Consumed', <Fuel className="w-3 h-3"/>, selectedRoute.metrics.fuel, originalRoute.metrics.fuel, 'LTRS', false)}
          {renderMetricBar('Reliability Index', <ShieldCheck className="w-3 h-3"/>, selectedRoute.metrics.reliability, originalRoute.metrics.reliability, '%', true)}
          {renderMetricBar('Network Risk', <Activity className="w-3 h-3"/>, selectedRoute.metrics.risk, originalRoute.metrics.risk, '', false)}
        </div>

      </div>

    </div>
  );
}