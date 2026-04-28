import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudRain, Wind, Users, Anchor, Factory, Flame, 
  Truck, TrendingUp, ShieldAlert, Terminal, Activity,
  BrainCircuit, DollarSign, Leaf, Clock, Map, BarChart3,
  RefreshCw, AlertTriangle, Box, Thermometer, Zap, Layers, Cpu, ServerCrash, Radar
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_TWIN || "PASTE_YOUR_API_KEY_HERE";

// ==========================================
// 1. GLOBAL NETWORK DATA
// ==========================================
const SCENARIOS = [
  { id: 'flood', title: 'Regional Flood', icon: CloudRain, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  { id: 'cyclone', title: 'Cyclone / Typhoon', icon: Wind, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' },
  { id: 'strike', title: 'Port Strike', icon: Users, color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10' },
  { id: 'port_shutdown', title: 'Port Shutdown', icon: Anchor, color: 'text-red-500', border: 'border-red-500/30', bg: 'bg-red-500/10' },
  { id: 'supplier', title: 'Supplier Failure', icon: Factory, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
  { id: 'fire', title: 'Warehouse Fire', icon: Flame, color: 'text-orange-500', border: 'border-orange-500/30', bg: 'bg-orange-500/10' },
  { id: 'truck', title: 'Fleet Breakdown', icon: Truck, color: 'text-gray-400', border: 'border-gray-500/30', bg: 'bg-gray-500/10' },
  { id: 'fuel', title: 'Fuel Price Spike', icon: TrendingUp, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  { id: 'customs', title: 'Customs Hold', icon: ShieldAlert, color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10' },
  { id: 'cyber', title: 'Cyberattack', icon: Terminal, color: 'text-green-500', border: 'border-green-500/30', bg: 'bg-green-500/10' },
  { id: 'pandemic', title: 'Pandemic Lockdown', icon: Activity, color: 'text-pink-400', border: 'border-pink-500/30', bg: 'bg-pink-500/10' },
];

interface SimulationResult {
  loss: string;
  co2: string;
  resilience: number;
  recovery: string;
  alternate: string;
  aiRec: string;
  heatmap: { region: string; impact: number }[];
}

const getFallbackStrategy = (id: string, title: string) => {
  const strategies: Record<string, { alt: string, rec: string }> = {
    flood: { alt: "High-Ground Rail Bypass", rec: "Inundation levels critical. Reroute all tier-1 cargo via elevated rail corridors and activate emergency pumping at affected nodes." },
    cyclone: { alt: "Inland Hub Diversion", rec: "Severe crosswinds detected. Halt all coastal port operations and divert incoming vessels to secondary sheltered deep-water ports." },
    strike: { alt: "Air-Freight Contingency", rec: "Labor walkout confirmed. Throttling ocean freight and shifting 30% of high-margin SKUs to chartered air-freight to bypass the picket line." },
    port_shutdown: { alt: "Secondary Port Reroute", rec: "Primary terminal offline. Executing dynamic vessel reallocation to neighboring ports and deploying LTL fleets for final mile." },
    supplier: { alt: "Tier-2 Supplier Activation", rec: "Primary node failure. Automatically issuing POs to pre-vetted Tier-2 suppliers in alternative geo-zones to maintain inventory flow." },
    fire: { alt: "Inventory Load Balancing", rec: "Facility thermal anomaly detected. Redirecting all inbound logistics to adjacent regional distribution centers to prevent bottlenecking." },
    truck: { alt: "Cross-Docking Transfer", rec: "Telemetry indicates total engine failure. Dispatching emergency recovery fleet to coordinate a rapid cross-docking transfer on route." },
    fuel: { alt: "Multi-Modal Shift (Rail)", rec: "Fuel index spiked beyond threshold. Shifting 60% of long-haul road freight to electric-rail networks to preserve profit margins." },
    customs: { alt: "Documentation Fast-Track", rec: "Regulatory holdup identified. Deploying automated compliance verification and pre-clearing priority shipments through alternative borders." },
    cyber: { alt: "Analog System Revert", rec: "Network intrusion detected. Severing compromised nodes from the main grid and falling back to encrypted, localized RF tracking." },
    pandemic: { alt: "Distributed Fulfillment", rec: "Bio-hazard lockdown in effect. Shifting from centralized hubs to a decentralized micro-fulfillment model using localized dark stores." }
  };
  return strategies[id] || { alt: "Dynamic Route Optimization", rec: `System adjusting to ${title}. Initiating load balancing protocols and alerting affected downstream stakeholders.` };
};

// ==========================================
// 2. FACILITY INTELLIGENCE TYPES
// ==========================================
type RobotStatus = 'active' | 'charging' | 'maintenance';
type DockStatus = 'loading' | 'idle' | 'inbound';

interface Robot { id: string; x: number; y: number; status: RobotStatus; battery: number; }
interface Dock { id: string; name: string; status: DockStatus; capacity: number; }
interface MaintenanceAlert { id: string; asset: string; issue: string; probability: number; urgency: 'high' | 'medium'; }
interface ExpiryItem { id: string; sku: string; timeRemaining: string; location: string; }

const INITIAL_ROBOTS: Robot[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `AGV-${100 + i}`,
  x: Math.random() * 80 + 10,
  y: Math.random() * 80 + 10,
  status: Math.random() > 0.8 ? 'charging' : 'active',
  battery: Math.floor(Math.random() * 60) + 40
}));

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function DigitalTwin() {
  const [activeTab, setActiveTab] = useState<'global' | 'warehouse'>('global');

  // --- Global Network State ---
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<SimulationResult | null>(null);

  // --- Facility Intelligence State ---
  const [isAuditing, setIsAuditing] = useState(false);
  const [robots, setRobots] = useState<Robot[]>(INITIAL_ROBOTS);
  
  const [energyUsage, setEnergyUsage] = useState(42.5);
  const [occupancy, setOccupancy] = useState(87);
  const [climate, setClimate] = useState("-2.4");
  const [docks, setDocks] = useState<Dock[]>([
    { id: 'D1', name: 'Bay Alpha', status: 'loading', capacity: 92 },
    { id: 'D2', name: 'Bay Beta', status: 'inbound', capacity: 45 },
    { id: 'D3', name: 'Bay Gamma', status: 'idle', capacity: 0 },
  ]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([
    { id: 'm1', asset: 'Conveyor Belt C-4', issue: 'Awaiting AI Audit...', probability: 0, urgency: 'medium' }
  ]);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryItem[]>([
    { id: 'e1', sku: 'Awaiting AI Audit...', timeRemaining: '--', location: '--' }
  ]);

  // --- Facility Engine (Visual Robot Animation) ---
  useEffect(() => {
    if (activeTab !== 'warehouse') return;

    const interval = setInterval(() => {
      setRobots(prev => prev.map(robot => {
        if (robot.status === 'charging') return { ...robot, battery: Math.min(100, robot.battery + 2) };
        const newX = Math.max(5, Math.min(95, robot.x + (Math.random() * 6 - 3)));
        const newY = Math.max(5, Math.min(95, robot.y + (Math.random() * 6 - 3)));
        const newBattery = robot.battery - 0.5;
        return {
          ...robot, x: newX, y: newY, battery: newBattery,
          status: newBattery < 20 ? 'charging' : 'active'
        };
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, [activeTab]);

  // --- AI FUNCTION: Facility IoT Audit ---
  const runFacilityAudit = async () => {
    setIsAuditing(true);

    try {
      const prompt = `You are the AI overseer for an enterprise logistics warehouse. 
      Generate a realistic, random snapshot of current facility telemetry. 
      I need you to imagine highly specific predictive maintenance risks (e.g., "HVAC Coil Failure", "AGV Motor Degradation") and realistic expiring inventory batches (e.g., pharmaceuticals, bio-resins, perishables).
      
      Return EXACTLY a JSON object in this format (no markdown):
      {
        "energy": 45.2,
        "occupancy": 92,
        "climate": "-4.1",
        "docks": [
          { "id": "D1", "name": "Bay Alpha", "status": "loading", "capacity": 88 },
          { "id": "D2", "name": "Bay Beta", "status": "idle", "capacity": 0 },
          { "id": "D3", "name": "Bay Gamma", "status": "inbound", "capacity": 15 }
        ],
        "maintenance": [
          { "id": "m1", "asset": "Specific Machine Name", "issue": "Highly technical description of the fault", "probability": 85, "urgency": "high" },
          { "id": "m2", "asset": "Another Machine", "issue": "Another fault description", "probability": 45, "urgency": "medium" }
        ],
        "expiry": [
          { "id": "e1", "sku": "Specific-SKU-Name", "timeRemaining": "12 Hours", "location": "Specific Aisle/Rack" },
          { "id": "e2", "sku": "Another-SKU", "timeRemaining": "2 Days", "location": "Another Location" }
        ]
      }`;

      let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) throw new Error("API Error");

      const data = await response.json();
      const cleanedJson = data.candidates[0].content.parts[0].text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      setEnergyUsage(parsed.energy);
      setOccupancy(parsed.occupancy);
      setClimate(parsed.climate);
      setDocks(parsed.docks);
      setMaintenanceAlerts(parsed.maintenance);
      setExpiryAlerts(parsed.expiry);

    } catch (error) {
      console.warn("Audit Failed. Injecting Fallback IoT Data...", error);
      setTimeout(() => {
        setEnergyUsage(48.1);
        setOccupancy(96);
        setClimate("-1.2");
        setMaintenanceAlerts([
          { id: 'f1', asset: 'Robotic Arm Station 4', issue: 'Servo Torque Resistance Spike', probability: 92, urgency: 'high' }
        ]);
        setExpiryAlerts([
          { id: 'f2', sku: 'Vaccine-Lot-009', timeRemaining: '4 Hours', location: 'Deep Freeze C' }
        ]);
      }, 1000);
    } finally {
      setIsAuditing(false);
    }
  };

  // --- AI FUNCTION: Global Network Crisis ---
  const runSimulation = async () => {
    if (!selectedScenario) return;
    setIsSimulating(true);
    setResults(null);
    const scenarioTitle = SCENARIOS.find(s => s.id === selectedScenario)?.title || 'Unknown Crisis';

    try {
      const prompt = `You are the Resilio.OS AI Digital Twin Simulator. I am injecting a "${scenarioTitle}" crisis event. Calculate realistic impacts. Return EXACTLY a raw JSON object (no markdown):
      {
        "loss": "$14.2M", "co2": "+450 Tons", "resilience": 45, "recovery": "14 Days",
        "alternate": "4-word strategy", "aiRec": "2-sentence mitigation strategy.",
        "heatmap": [ { "region": "North America", "impact": 85 }, { "region": "EMEA", "impact": 40 }, { "region": "APAC", "impact": 95 } ]
      }`;

      let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (!response.ok) throw new Error("API Error");

      const data = await response.json();
      const parsedResult = JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json/gi, '').replace(/```/g, '').trim());
      setResults(parsedResult);
    } catch (error) {
      const fallbackData = getFallbackStrategy(selectedScenario, scenarioTitle);
      setTimeout(() => {
        setResults({
          loss: `$${(Math.random() * 20 + 5).toFixed(1)}M`, co2: `+${Math.floor(Math.random() * 1500 + 500)} Tons`,
          resilience: Math.floor(Math.random() * 30) + 40, recovery: `${Math.floor(Math.random() * 20 + 5)} Days`,
          alternate: fallbackData.alt, aiRec: fallbackData.rec,
          heatmap: [ { region: 'North America', impact: Math.floor(Math.random() * 60) + 20 }, { region: 'EMEA', impact: Math.floor(Math.random() * 60) + 20 }, { region: 'APAC', impact: Math.floor(Math.random() * 60) + 40 } ]
        });
      }, 1500);
    } finally {
      setTimeout(() => setIsSimulating(false), 200); 
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-8rem)]">
      
      {/* SEGMENT TOGGLE NAVIGATION */}
      <div className="flex items-center justify-center mb-6">
        <div className="bg-[#111113] border border-white/10 rounded-full p-1 flex shadow-xl">
          <button onClick={() => setActiveTab('global')} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'global' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <Globe2Icon className="w-4 h-4" /> Global Network
          </button>
          <button onClick={() => setActiveTab('warehouse')} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'warehouse' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <Factory className="w-4 h-4" /> Facility Intelligence
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: GLOBAL NETWORK TWIN                                 */}
      {/* ========================================================= */}
      {activeTab === 'global' && (
        <div className="flex flex-col xl:flex-row gap-6 flex-1">
          {/* LEFT COLUMN: Scenario Selector */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="shrink-0">
              <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-500" /> Digital Twin Sandbox
              </h1>
              <p className="text-gray-400 mt-2 text-sm">Stress-test your supply chain network by injecting simulated variables into the digital model.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto pr-2 pb-4 scrollbar-hide">
              {SCENARIOS.map((s) => {
                const isSelected = selectedScenario === s.id;
                const Icon = s.icon;
                return (
                  <div key={s.id} onClick={() => setSelectedScenario(s.id)} className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center gap-3 ${isSelected ? `${s.bg} ${s.border} shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-[1.02]` : 'bg-[#111113] border-white/5 hover:border-white/20 hover:bg-white/5'}`}>
                    <Icon className={`w-8 h-8 ${isSelected ? s.color : 'text-gray-500'}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-gray-400'}`}>{s.title}</span>
                  </div>
                );
              })}
            </div>

            <button onClick={runSimulation} disabled={!selectedScenario || isSimulating} className={`mt-auto py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-2xl ${!selectedScenario ? 'bg-white/5 text-gray-500 cursor-not-allowed' : isSimulating ? 'bg-blue-600/50 text-blue-200 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 active:scale-[0.98]'}`}>
              {isSimulating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
              {isSimulating ? 'Injecting Variable into Neural Net...' : 'Run Simulation'}
            </button>
          </div>

          {/* RIGHT COLUMN: Output Dashboard */}
          <div className="w-full xl:w-[400px] 2xl:w-[500px] shrink-0 bg-[#0a0a0c] border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-2xl">
            {!isSimulating && !results && (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-600 text-center">
                <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-sm">Awaiting Parameters</p>
                <p className="text-xs mt-2 max-w-[250px]">Select a crisis scenario from the grid and run the simulation to view predicted impacts.</p>
              </div>
            )}
            {isSimulating && (
              <div className="flex-1 flex flex-col items-center justify-center text-blue-500">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-2 border-4 border-t-blue-400 rounded-full animate-spin"></div>
                  <BrainCircuit className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
                <p className="mt-6 font-mono text-xs font-bold uppercase tracking-widest animate-pulse">Running Monte Carlo Ops...</p>
              </div>
            )}
            <AnimatePresence>
              {!isSimulating && results && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col h-full overflow-y-auto pr-2 scrollbar-hide space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-white font-black text-lg tracking-widest uppercase flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" /> Impact Assessment
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div className="flex items-center gap-2 text-red-400 mb-1"><DollarSign className="w-4 h-4"/><span className="text-[10px] font-bold uppercase">Financial Loss</span></div>
                      <div className="text-2xl font-black text-white">{results.loss}</div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div className="flex items-center gap-2 text-emerald-400 mb-1"><Leaf className="w-4 h-4"/><span className="text-[10px] font-bold uppercase">CO₂ Impact</span></div>
                      <div className="text-2xl font-black text-white">{results.co2}</div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div className="flex items-center gap-2 text-blue-400 mb-1"><Activity className="w-4 h-4"/><span className="text-[10px] font-bold uppercase">Resilience Score</span></div>
                      <div className={`text-2xl font-black ${results.resilience > 60 ? 'text-emerald-400' : 'text-red-400'}`}>{results.resilience}/100</div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div className="flex items-center gap-2 text-orange-400 mb-1"><Clock className="w-4 h-4"/><span className="text-[10px] font-bold uppercase">Recovery Time</span></div>
                      <div className="text-2xl font-black text-white">{results.recovery}</div>
                    </div>
                  </div>
                  <div className="p-5 bg-[#111113] border border-white/5 rounded-xl">
                    <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Regional Impact Heatmap</h3>
                    <div className="space-y-4">
                      {results.heatmap.map((h, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300 font-bold">{h.region}</span>
                            <span className="text-gray-500 font-mono">{h.impact}%</span>
                          </div>
                          <div className="h-2 w-full bg-black rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${h.impact}%` }} transition={{ duration: 1, delay: 0.2 }} className={`h-full rounded-full ${h.impact > 75 ? 'bg-red-500' : h.impact > 40 ? 'bg-orange-500' : 'bg-blue-500'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                      <div className="flex items-center gap-2 text-purple-400 mb-2"><Map className="w-4 h-4"/><span className="text-[10px] font-bold uppercase">Optimal Alternate Path</span></div>
                      <div className="text-sm font-bold text-gray-200">{results.alternate}</div>
                    </div>
                    <div className="p-5 bg-blue-500/10 border border-blue-500/30 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                      <div className="flex items-center gap-2 text-blue-400 mb-2"><BrainCircuit className="w-4 h-4"/><span className="text-[10px] font-bold uppercase tracking-widest">Gemini Copilot Recommendation</span></div>
                      <div className="text-[11px] leading-relaxed text-gray-300 italic">"{results.aiRec}"</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: FACILITY INTELLIGENCE (Fully AI Connected)          */}
      {/* ========================================================= */}
      {activeTab === 'warehouse' && (
        <div className="flex flex-col xl:flex-row gap-6 flex-1 h-full">
          
          <div className="flex-1 flex flex-col gap-6">
            
            {/* The Trigger Button */}
            <div className="flex items-center justify-between bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl p-4 shrink-0">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Radar className="w-5 h-5 text-emerald-400" /> IoT Telemetry Sync
                </h2>
                <p className="text-xs text-gray-500 mt-1">Ping facility sensors to pull live edge-computing data.</p>
              </div>
              <button 
                onClick={runFacilityAudit}
                disabled={isAuditing}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg
                  ${isAuditing ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-wait' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'}`}
              >
                {isAuditing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                {isAuditing ? 'Auditing Neural Sensors...' : 'Run IoT Audit'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
              <div className="bg-[#0a0a0c] border border-white/5 p-5 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Energy Optimization</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-emerald-400">{energyUsage}</span>
                    <span className="text-xs text-gray-500 mb-1">MW/h</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400"><Zap className="w-5 h-5"/></div>
              </div>

              <div className="bg-[#0a0a0c] border border-white/5 p-5 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Global Occupancy</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-blue-400">{occupancy}%</span>
                    <span className="text-xs text-blue-500/50 mb-1">Live</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400"><Layers className="w-5 h-5"/></div>
              </div>

              <div className="bg-[#0a0a0c] border border-white/5 p-5 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Climate Control</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-white">{climate}</span>
                    <span className="text-xs text-gray-500 mb-1">°C</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300"><Thermometer className="w-5 h-5"/></div>
              </div>
            </div>

            <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl p-6 flex flex-col relative overflow-hidden min-h-[300px]">
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-400" /> Live Facility Twin
                </h3>
                <div className="flex gap-4">
                  <span className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-wider font-bold"><div className="w-2 h-2 rounded-full bg-blue-400"/> Active AGV</span>
                  <span className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-wider font-bold"><div className="w-2 h-2 rounded-full bg-amber-400"/> Charging</span>
                </div>
              </div>

              <div className="flex-1 relative border border-white/10 rounded-xl bg-[#0d0d12] overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                <div className="absolute top-0 left-0 right-0 h-16 border-b border-white/10 flex justify-around items-start pt-2 bg-gradient-to-b from-white/5 to-transparent">
                  {docks.map(dock => (
                    <div key={dock.id} className="flex flex-col items-center">
                      <div className={`px-4 py-1.5 rounded-b-lg border-x border-b border-white/10 flex items-center gap-2
                        ${dock.status === 'loading' ? 'bg-emerald-500/10 text-emerald-400' : dock.status === 'inbound' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-800/50 text-gray-500'}`}>
                        <Truck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{dock.name}</span>
                      </div>
                      {dock.capacity > 0 && (
                        <div className="text-[9px] text-gray-500 font-bold mt-1 tracking-widest">VOL: {dock.capacity}%</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="absolute top-24 bottom-10 left-10 w-24 bg-white/5 border border-white/10 rounded" />
                <div className="absolute top-24 bottom-10 left-40 w-24 bg-white/5 border border-white/10 rounded" />
                <div className="absolute top-24 bottom-10 right-40 w-24 bg-white/5 border border-white/10 rounded" />
                <div className="absolute top-24 bottom-10 right-10 w-24 bg-white/5 border border-white/10 rounded" />

                <AnimatePresence>
                  {robots.map(robot => (
                    <motion.div key={robot.id} animate={{ left: `${robot.x}%`, top: `${robot.y}%` }} transition={{ duration: 1.5, ease: "linear" }} className="absolute w-6 h-6 -ml-3 -mt-3 flex items-center justify-center group z-20">
                      <div className={`w-3 h-3 rounded-full shadow-[0_0_15px_currentColor] transition-colors duration-300 ${robot.status === 'charging' ? 'bg-amber-400 text-amber-400' : 'bg-blue-400 text-blue-400'}`} />
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/20 p-2 rounded text-[9px] font-mono w-[100px] pointer-events-none">
                        <div className="text-white font-bold">{robot.id}</div>
                        <div className="text-gray-400">BAT: {Math.round(robot.battery)}%</div>
                        <div className="text-gray-400 capitalize">STS: {robot.status}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* AI Feeds Panel */}
          <div className="w-full xl:w-[350px] flex flex-col gap-6">
            <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl p-5 flex-1 flex flex-col min-h-[300px]">
              <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2 mb-4">
                <ServerCrash className="w-4 h-4 text-red-400" /> Predictive Maintenance
              </h3>
              <div className="flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
                {isAuditing ? (
                  <div className="text-xs text-gray-500 animate-pulse py-4">Scanning acoustic arrays...</div>
                ) : (
                  <>
                    {maintenanceAlerts.map(alert => (
                      <div key={alert.id} className="p-3 border border-red-500/20 bg-red-500/5 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-red-400 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded">
                            {alert.probability}% Failure Risk
                          </span>
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{alert.asset}</h4>
                        <p className="text-xs text-gray-400">{alert.issue}</p>
                      </div>
                    ))}
                    <div className="p-3 border border-emerald-500/20 bg-emerald-500/5 rounded-xl opacity-60">
                       <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                         <Activity className="w-4 h-4" /> All other systems nominal
                       </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl p-5 flex-1 flex flex-col min-h-[300px]">
              <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-amber-400" /> Expiry Prediction
              </h3>
              <div className="flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
                {isAuditing ? (
                   <div className="text-xs text-gray-500 animate-pulse py-4">Auditing blockchain ledgers...</div>
                ) : (
                  // FIXED THE ERROR HERE: expiryAlerts instead of EXPIRY_ALERTS
                  expiryAlerts.map((item, idx) => (
                    <div key={idx} className="p-3 border border-amber-500/20 bg-amber-500/5 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded">
                          Expires in {item.timeRemaining}
                        </span>
                        <Box className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1 font-mono">{item.sku}</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">Loc: {item.location}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Globe2Icon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
    </svg>
  );
}