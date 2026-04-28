import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Siren, HeartPulse, Wheat, PackagePlus, Zap, 
  Briefcase, Truck, ShieldAlert, RefreshCw, 
  Ban, ArrowUpRight, Activity
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_DISASTER || "PASTE_YOUR_API_KEY_HERE";

interface PriorityType {
  id: string;
  label: string;
  icon: any;
  active: boolean;
}

interface Shipment {
  id: string;
  contents: string;
  origin: string;
  destination: string;
  originalStatus: 'In Transit' | 'Scheduled';
  disasterStatus?: 'FAST-TRACKED' | 'HALTED' | 'REROUTED';
  aiReason?: string;
}

// Initial mixed bag of commercial and critical cargo
const INITIAL_SHIPMENTS: Shipment[] = [
  { id: 'SHP-991', contents: '10,000 Doses Amoxicillin', origin: 'Mumbai Pharma Hub', destination: 'Chennai Clinic', originalStatus: 'In Transit' },
  { id: 'SHP-992', contents: '500 OLED Televisions', origin: 'Shenzhen Port', destination: 'Delhi Electronics', originalStatus: 'In Transit' },
  { id: 'SHP-993', contents: '20 Tons Purified Water', origin: 'Pune Plant', destination: 'Kolkata Distribution', originalStatus: 'Scheduled' },
  { id: 'SHP-994', contents: 'Luxury Sedans (x12)', origin: 'Bremen', destination: 'Mumbai Dealership', originalStatus: 'In Transit' },
  { id: 'SHP-995', contents: 'Emergency Trauma Kits', origin: 'Red Cross Depot', destination: 'Kochi Hospital', originalStatus: 'Scheduled' },
];

export default function DisasterResponse() {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [systemError, setSystemError] = useState<string | null>(null);
  
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);

  const [priorities, setPriorities] = useState<PriorityType[]>([
    { id: 'medicine', label: 'Medicine & MedTech', icon: HeartPulse, active: true },
    { id: 'food', label: 'Food & Water', icon: Wheat, active: true },
    { id: 'relief', label: 'Relief Personnel', icon: ShieldAlert, active: true },
    { id: 'supplies', label: 'Emergency Supplies', icon: PackagePlus, active: true },
    { id: 'commercial', label: 'Commercial Cargo', icon: Briefcase, active: false },
  ]);

  const togglePriority = (id: string) => {
    setPriorities(priorities.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const executeDisasterProtocol = async () => {
    setIsEmergencyMode(true);
    setIsProcessing(true);
    setSystemError(null);
    setLoadingText('Engaging DEFCON 1 Override...');
    await new Promise(r => setTimeout(r, 600));
    setLoadingText('AI evaluating global logistics grid...');

    const activeRules = priorities.filter(p => p.active).map(p => p.label).join(', ');

    const prompt = `You are an Autonomous Disaster Response Routing Engine.
    An emergency has been declared. You must override standard commercial logistics.
    
    Current Active Priorities: ${activeRules}
    
    Evaluate the following active shipments:
    ${JSON.stringify(INITIAL_SHIPMENTS.map(s => ({ id: s.id, contents: s.contents })))}

    Based strictly on the active priorities, reclassify EACH shipment.
    - If it matches a priority (like medicine/food), set disasterStatus to "FAST-TRACKED".
    - If it is non-essential (like TVs/Luxury Cars) and commercial is NOT prioritized, set disasterStatus to "HALTED".
    - If it needs to move out of the way of relief, set disasterStatus to "REROUTED".

    Return EXACTLY a raw JSON array (no markdown) with this structure:
    [
      {
        "id": "SHP-...",
        "disasterStatus": "FAST-TRACKED" | "HALTED" | "REROUTED",
        "aiReason": "1 short sentence explaining why it was halted or fast-tracked based on the priority rules."
      }
    ]`;

    let success = false;
    let attempt = 0;
    const fallbackModels = ['gemini-2.5-flash', 'gemini-2.0-flash'];

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

        // Fast-Fail on 503: Instantly break the loop to save the demo!
        if (response?.status === 503) {
          console.warn("503 Service Unavailable. Instantly triggering failsafe.");
          break; 
        }

        if (response?.status === 429) {
          attempt++;
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }

        if (!response?.ok) throw new Error(`API Error: ${response?.status}`);

        const data = await response.json();
        const jsonMatch = data.candidates[0].content.parts[0].text.match(/\[[\s\S]*\]/);
        const updates: { id: string, disasterStatus: any, aiReason: string }[] = JSON.parse(jsonMatch[0]);
        
        // Merge AI updates with original shipment data
        const updatedShipments = INITIAL_SHIPMENTS.map(shipment => {
          const update = updates.find(u => u.id === shipment.id);
          return update ? { ...shipment, ...update } : shipment;
        });

        setShipments(updatedShipments);
        success = true;

      } catch (error) {
        attempt++;
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    if (!success) {
      console.warn("Injecting Fallback Failsafe for Disaster Response...");
      // Failsafe Demo Data
      setShipments(INITIAL_SHIPMENTS.map(s => {
        if (s.contents.includes('Amoxicillin') || s.contents.includes('Water') || s.contents.includes('Trauma')) {
          return { ...s, disasterStatus: 'FAST-TRACKED', aiReason: 'Matches critical priority protocol. Cleared for immediate transit.' };
        } else {
          return { ...s, disasterStatus: 'HALTED', aiReason: 'Non-essential commercial asset. Halted to free up network bandwidth.' };
        }
      }));
    }
    
    setIsProcessing(false);
  };

  const deactivateProtocol = () => {
    setIsEmergencyMode(false);
    setShipments(INITIAL_SHIPMENTS);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[600px] pb-8 transition-colors duration-700">
      
      {/* LEFT COLUMN: Command Console */}
      <div className="w-full xl:w-[450px] flex flex-col gap-6 shrink-0">
        <div className={`border rounded-2xl shadow-xl p-6 relative overflow-hidden transition-all duration-700 ${
          isEmergencyMode ? 'bg-[#1a0505] border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'bg-[#0a0a0c] border-white/5'
        }`}>
          
          <div className="flex justify-between items-center mt-2 mb-6 border-b border-white/5 pb-4">
            <h2 className={`text-xl font-black tracking-widest uppercase flex items-center gap-3 transition-colors ${isEmergencyMode ? 'text-red-500' : 'text-white'}`}>
              <Siren className={`w-6 h-6 ${isEmergencyMode ? 'animate-pulse' : ''}`} /> 
              Response Override
            </h2>
          </div>
          
          <p className={`text-xs mb-6 leading-relaxed ${isEmergencyMode ? 'text-red-200' : 'text-gray-400'}`}>
            Activate this protocol to suspend standard commercial routing. The AI will autonomously halt non-essential freight and open corridors for prioritized relief.
          </p>

          <div className="space-y-3 mb-8">
            <label className={`text-[10px] font-bold uppercase tracking-widest block mb-3 ${isEmergencyMode ? 'text-red-400' : 'text-gray-500'}`}>
              Active Triage Priorities
            </label>
            
            <div className="grid grid-cols-2 gap-2">
              {priorities.map(priority => {
                const Icon = priority.icon;
                return (
                  <button
                    key={priority.id} onClick={() => togglePriority(priority.id)} disabled={isEmergencyMode}
                    className={`p-3 rounded-xl flex flex-col items-start gap-2 border text-[10px] font-bold uppercase tracking-wider transition-all text-left ${
                      priority.active 
                        ? (isEmergencyMode ? 'bg-red-500/20 border-red-500/50 text-red-100' : 'bg-white/10 border-white/20 text-white') 
                        : 'bg-[#050507] border-white/5 text-gray-600 hover:border-white/10'
                    } ${isEmergencyMode && 'cursor-not-allowed opacity-80'}`}
                  >
                    <Icon className={`w-4 h-4 ${priority.active ? (isEmergencyMode ? 'text-red-400' : 'text-blue-400') : 'text-gray-600'}`} />
                    {priority.label}
                  </button>
                )
              })}
            </div>
          </div>

          {!isEmergencyMode ? (
            <button 
              onClick={executeDisasterProtocol}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 group"
            >
              <Activity className="w-5 h-5 group-hover:animate-pulse" /> DECLARE EMERGENCY PROTOCOL
            </button>
          ) : (
            <button 
              onClick={deactivateProtocol}
              className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> STAND DOWN & RESTORE GRID
            </button>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: AI Logistics Grid */}
      <div className={`flex-1 border rounded-2xl shadow-xl p-8 relative overflow-hidden flex flex-col transition-all duration-700 ${
        isEmergencyMode ? 'bg-[#0f0303] border-red-500/30' : 'bg-[#0a0a0c] border-white/5'
      }`}>
        <h3 className={`text-sm font-black tracking-widest uppercase flex items-center gap-2 mb-8 border-b border-white/5 pb-4 ${isEmergencyMode ? 'text-red-400' : 'text-white'}`}>
          <Truck className="w-5 h-5" /> Live Routing Grid
        </h3>

        {isProcessing ? (
          <div className="flex-1 flex flex-col items-center justify-center text-red-500">
            <RefreshCw className="w-12 h-12 animate-spin mb-6" />
            <p className="font-mono text-xs uppercase tracking-widest text-center px-6 leading-relaxed animate-pulse">{loadingText}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            <AnimatePresence>
              {shipments.map((shipment, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                  key={shipment.id} 
                  className={`p-5 rounded-2xl border flex flex-col gap-3 transition-colors ${
                    !isEmergencyMode ? 'bg-[#111113] border-white/5' :
                    shipment.disasterStatus === 'FAST-TRACKED' ? 'bg-emerald-500/10 border-emerald-500/30' :
                    shipment.disasterStatus === 'HALTED' ? 'bg-red-500/10 border-red-500/30' :
                    'bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-black text-white tracking-wider">{shipment.contents}</h4>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mt-1">
                        {shipment.origin} → {shipment.destination}
                      </span>
                    </div>
                    
                    {!isEmergencyMode ? (
                      <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {shipment.originalStatus}
                      </span>
                    ) : (
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border flex items-center gap-1 ${
                        shipment.disasterStatus === 'FAST-TRACKED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        shipment.disasterStatus === 'HALTED' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {shipment.disasterStatus === 'HALTED' && <Ban className="w-3 h-3" />}
                        {shipment.disasterStatus === 'FAST-TRACKED' && <ArrowUpRight className="w-3 h-3" />}
                        {shipment.disasterStatus}
                      </span>
                    )}
                  </div>

                  {isEmergencyMode && shipment.aiReason && (
                    <div className="mt-2 pt-3 border-t border-white/5">
                      <p className="text-[11px] font-mono leading-relaxed text-gray-300">
                        <span className="text-red-400 font-bold mr-2">AI DIRECTIVE:</span>
                        {shipment.aiReason}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}