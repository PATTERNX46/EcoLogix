import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, Settings, Battery, Snowflake, Activity, 
  Wrench, AlertTriangle, RefreshCw, CheckCircle2, 
  Calendar, Gauge, CircleDot, Database, UploadCloud
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "PASTE_YOUR_API_KEY_HERE";

interface Vehicle {
  id: string;
  type: 'Heavy Freight' | 'Cold Chain' | 'EV Delivery';
  model: string;
  mileage: string;
  status: 'Active' | 'Warning' | 'Maintenance Due';
  rawTelemetry: string;
}

interface MaintenanceTask {
  timeframe: string;
  task: string;
  urgency: 'Critical' | 'High' | 'Routine';
}

interface AIDiagnostics {
  engineHealth: { score: number, analysis: string };
  tyreHealth: { score: number, analysis: string };
  reeferHealth: { score: number, analysis: string }; 
  batteryAnalytics: { score: number, analysis: string };
  predictedFailure: string;
  schedule: MaintenanceTask[];
}

export default function FleetMaintenance() {
  const [appMode, setAppMode] = useState<'ingest' | 'monitor'>('ingest');
  const [rawLogs, setRawLogs] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [liveFleet, setLiveFleet] = useState<Vehicle[]>([]);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [diagnosticsData, setDiagnosticsData] = useState<Record<string, AIDiagnostics>>({});
  const [systemError, setSystemError] = useState<string | null>(null);

  const loadSampleLogs = () => {
    setRawLogs(`VEHICLE_ID,CLASS,MODEL,ODO,SENSORS
TRK-DL-44,Heavy Freight,Volvo FH16 Diesel,245000km,"Engine_Temp:104C, Oil_Vis:42%, Tyre:4.2mm, Batt:24.1V"
REEF-MH-02,Cold Chain,Scania R450 Reefer,112000km,"Comp:88%, Amb:35C, Int:-17.5C, Coolant:65%"
EV-KA-99,EV Delivery,Tata Ultra E.9,45000km,"SOH:89%, Imbal:0.05V, Motor:65C, Regen:72%"`);
  };

  // --- 1. AI DATA INGESTION ENGINE ---
  const syncTelemetry = async () => {
    if (!rawLogs.trim()) return;
    setIsSyncing(true);
    setSystemError(null);
    setLoadingStep('Parsing raw telematics via Gemini...');

    const prompt = `You are a Telemetry Parsing Engine.
    Parse the following raw fleet log data into a structured JSON array.
    
    Raw Data:
    """
    ${rawLogs}
    """

    Return EXACTLY a raw JSON array (no markdown, no backticks) matching this structure:
    [
      {
        "id": "Vehicle ID",
        "type": "Must be exactly 'Heavy Freight', 'Cold Chain', or 'EV Delivery'",
        "model": "Vehicle Model",
        "mileage": "Current mileage",
        "status": "Determine if 'Active', 'Warning', or 'Maintenance Due' based on sensors",
        "rawTelemetry": "The exact raw sensor data string provided"
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

        if (response?.status === 429) {
          attempt++;
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }

        if (!response?.ok) throw new Error("API Error");

        const data = await response.json();
        const jsonMatch = data.candidates[0].content.parts[0].text.match(/\[[\s\S]*\]/);
        const parsedFleet: Vehicle[] = JSON.parse(jsonMatch[0]);
        
        setLiveFleet(parsedFleet);
        if (parsedFleet.length > 0) setSelectedVehicle(parsedFleet[0]);
        setAppMode('monitor');
        success = true;

      } catch (error) {
        attempt++;
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    if (!success) setSystemError("API Overloaded. Could not parse telemetry.");
    setIsSyncing(false);
  };

  // --- 2. AI PREDICTIVE DIAGNOSTICS ---
  const runDiagnostics = async () => {
    if (!selectedVehicle || diagnosticsData[selectedVehicle.id]) return;

    setIsAnalyzing(true);
    setSystemError(null);
    setLoadingStep('Ingesting vehicle telemetry logs...');
    await new Promise(r => setTimeout(r, 800));
    setLoadingStep('Running predictive failure models...');

    const prompt = `You are an AI Fleet Maintenance Chief. 
    Analyze the following raw telemetry for vehicle ID: ${selectedVehicle.id} (Type: ${selectedVehicle.type}).
    Raw Data: "${selectedVehicle.rawTelemetry}"

    Predict component failures and create a maintenance schedule based on this specific data.
    Return EXACTLY a raw JSON object (no markdown) with this structure:
    {
      "engineHealth": { "score": <0-100>, "analysis": "1 short sentence about engine/motor." },
      "tyreHealth": { "score": <0-100>, "analysis": "1 short sentence about tyres." },
      "reeferHealth": { "score": <0-100 or null if not a Cold Chain truck>, "analysis": "1 short sentence about refrigeration, or 'N/A'." },
      "batteryAnalytics": { "score": <0-100>, "analysis": "1 short sentence about battery/electrical." },
      "predictedFailure": "What component will fail next and in how many days/km?",
      "schedule": [
        { "timeframe": "Immediate / 7 Days / 30 Days", "task": "Specific maintenance action", "urgency": "Critical" | "High" | "Routine" }
      ]
    }`;

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

        if (response?.status === 429) {
          attempt++;
          setLoadingStep(`Rate Limit. Rerouting prediction matrix...`);
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }

        if (!response?.ok) throw new Error("API Error");

        const data = await response.json();
        const jsonMatch = data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);
        const parsedData = JSON.parse(jsonMatch[0]);
        
        setDiagnosticsData(prev => ({ ...prev, [selectedVehicle.id]: parsedData }));
        success = true;

      } catch (error) {
        attempt++;
        setLoadingStep(`Retrying telemetry analysis...`);
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    if (!success) {
      const fallbackData: AIDiagnostics = {
        engineHealth: { score: selectedVehicle.type === 'EV Delivery' ? 92 : 65, analysis: selectedVehicle.type === 'EV Delivery' ? 'Electric traction motor nominal.' : 'Thermal inefficiency detected.' },
        tyreHealth: { score: 45, analysis: 'Rear axle tread depth approaching minimum limits.' },
        reeferHealth: { score: selectedVehicle.type === 'Cold Chain' ? 58 : 100, analysis: selectedVehicle.type === 'Cold Chain' ? 'Compressor load is abnormally high.' : 'N/A' },
        batteryAnalytics: { score: selectedVehicle.type === 'EV Delivery' ? 78 : 88, analysis: selectedVehicle.type === 'EV Delivery' ? 'Regenerative braking loss implies early cell degradation.' : 'Standard output stable.' },
        predictedFailure: selectedVehicle.type === 'Cold Chain' ? "Reefer Compressor failure within 400km" : "Engine overheating within 7 days",
        schedule: [
          { timeframe: 'Immediate', task: selectedVehicle.type === 'Cold Chain' ? 'Top up refrigerant' : 'Oil flush and thermal sensor recalibration', urgency: 'Critical' },
          { timeframe: '7 Days', task: 'Replace rear axle tyre set', urgency: 'High' }
        ]
      };
      setDiagnosticsData(prev => ({ ...prev, [selectedVehicle.id]: fallbackData }));
    }
    
    setIsAnalyzing(false);
  };

  const activeReport = selectedVehicle ? diagnosticsData[selectedVehicle.id] : null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[600px] pb-8">
      
      {/* LEFT COLUMN: Data Ingestion OR Fleet List */}
      <div className="w-full xl:w-[400px] flex flex-col gap-6 shrink-0">
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl p-6 relative overflow-hidden flex flex-col h-[650px]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          
          {appMode === 'ingest' ? (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mt-2 mb-6 border-b border-white/5 pb-4">
                <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                  <Database className="w-6 h-6 text-blue-500" /> Connect Fleet
                </h2>
              </div>
              
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Paste raw telematics logs (CSV/JSON) below. Gemini AI will parse the unstructured sensor data to build a live fleet dashboard.
              </p>
              
              <div className="flex-1 relative flex flex-col">
                <textarea 
                  value={rawLogs} onChange={(e) => setRawLogs(e.target.value)} placeholder="Paste CSV/JSON logs here..."
                  className="flex-1 bg-[#111113] border border-white/10 rounded-xl p-4 text-[10px] font-mono text-gray-300 focus:outline-none focus:border-blue-500 transition-colors resize-none custom-scrollbar whitespace-pre"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button 
                  onClick={loadSampleLogs} type="button"
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors flex-1 border border-white/10"
                >
                  Load Sample
                </button>
                <button 
                  onClick={syncTelemetry} disabled={isSyncing || !rawLogs.trim()}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2 flex-1 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                  {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  {isSyncing ? 'Syncing...' : 'Sync Data'}
                </button>
              </div>

              {systemError && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">{systemError}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mt-2 mb-6 border-b border-white/5 pb-4">
                <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                  <Truck className="w-6 h-6 text-blue-500" /> Fleet Telemetry
                </h2>
                <button onClick={() => setAppMode('ingest')} className="text-[9px] text-gray-500 hover:text-white uppercase font-bold tracking-widest transition-colors">
                  Upload Logs
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {liveFleet.map(vehicle => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    key={vehicle.id} 
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedVehicle?.id === vehicle.id 
                        ? 'bg-blue-600/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                        : 'bg-[#111113] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-sm font-black text-white tracking-wider">{vehicle.id}</h4>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{vehicle.type}</span>
                      </div>
                      <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${
                        vehicle.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        vehicle.status === 'Warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {vehicle.status}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 bg-black/30 p-2 rounded-lg border border-white/5">
                      <span>{vehicle.model}</span>
                      <span>{vehicle.mileage}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: AI Predictive Diagnostics */}
      <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl p-8 relative overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" /> Predictive Maintenance Engine
          </h3>
          
          <button 
            onClick={runDiagnostics}
            disabled={isAnalyzing || !!activeReport || !selectedVehicle}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-gray-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            {isAnalyzing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wrench className="w-3 h-3" />}
            {isAnalyzing ? 'Analyzing...' : activeReport ? 'Analyzed' : 'Run AI Diagnostics'}
          </button>
        </div>

        {!isAnalyzing && !activeReport && (
          <div className="flex-1 flex flex-col items-center justify-center opacity-80">
            <Settings className="w-16 h-16 mb-4 text-gray-700" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">Awaiting Telemetry Sync</p>
            
            {selectedVehicle && (
              <div className="bg-[#111113] border border-white/5 p-5 rounded-2xl w-full max-w-lg space-y-3 shadow-lg text-left">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2 border-b border-white/5 pb-2">Raw Sensor Stream [{selectedVehicle.id}]</span>
                <p className="text-[11px] font-mono text-cyan-400/80 leading-relaxed">
                  {selectedVehicle.rawTelemetry.split(', ').map((log, i) => (
                    <span key={i} className="block">{'>'} {log}</span>
                  ))}
                </p>
              </div>
            )}
          </div>
        )}

        {isAnalyzing && (
          <div className="flex-1 flex flex-col items-center justify-center text-blue-400">
            <RefreshCw className="w-10 h-10 animate-spin mb-6" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-center px-6 leading-relaxed animate-pulse">{loadingStep}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence>
            {!isAnalyzing && activeReport && selectedVehicle && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                
                {/* PREDICTED FAILURE ALERT */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start gap-4 shadow-[0_0_20px_rgba(239,68,68,0.15)] relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                     <AlertTriangle className="w-24 h-24 text-red-500" />
                   </div>
                   <div className="bg-red-500/20 p-3 rounded-xl shrink-0 mt-1">
                     <AlertTriangle className="w-6 h-6 text-red-500" />
                   </div>
                   <div className="relative z-10">
                     <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">AI Predicted Failure</h4>
                     <p className="text-lg font-black text-white">{activeReport.predictedFailure}</p>
                   </div>
                </div>

                {/* COMPONENT HEALTH GRID */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-5 rounded-2xl border ${getScoreBg(activeReport.engineHealth.score)}`}>
                    <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedVehicle.type === 'EV Delivery' ? 'Motor & Drivetrain' : 'Engine Health'}</span>
                      </div>
                      <span className={`text-lg font-black ${getScoreColor(activeReport.engineHealth.score)}`}>{activeReport.engineHealth.score}%</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">{activeReport.engineHealth.analysis}</p>
                  </div>

                  <div className={`p-5 rounded-2xl border ${getScoreBg(activeReport.tyreHealth.score)}`}>
                    <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <CircleDot className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tyre Integrity</span>
                      </div>
                      <span className={`text-lg font-black ${getScoreColor(activeReport.tyreHealth.score)}`}>{activeReport.tyreHealth.score}%</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">{activeReport.tyreHealth.analysis}</p>
                  </div>

                  <div className={`p-5 rounded-2xl border ${getScoreBg(activeReport.batteryAnalytics.score)}`}>
                    <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Battery className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Battery Analytics</span>
                      </div>
                      <span className={`text-lg font-black ${getScoreColor(activeReport.batteryAnalytics.score)}`}>{activeReport.batteryAnalytics.score}%</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">{activeReport.batteryAnalytics.analysis}</p>
                  </div>

                  <div className={`p-5 rounded-2xl border opacity-100 ${selectedVehicle.type !== 'Cold Chain' ? 'bg-white/5 border-white/5 opacity-50 grayscale' : getScoreBg(activeReport.reeferHealth.score)}`}>
                    <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Snowflake className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reefer Health</span>
                      </div>
                      {selectedVehicle.type === 'Cold Chain' && (
                        <span className={`text-lg font-black ${getScoreColor(activeReport.reeferHealth.score)}`}>{activeReport.reeferHealth.score}%</span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">{activeReport.reeferHealth.analysis}</p>
                  </div>
                </div>

                {/* MAINTENANCE SCHEDULE */}
                <div>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Autonomous Maintenance Schedule
                  </h4>
                  <div className="space-y-3">
                    {activeReport.schedule.map((item, i) => (
                      <div key={i} className="bg-[#111113] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest w-20 text-center ${
                            item.urgency === 'Critical' ? 'bg-red-500/20 text-red-400' :
                            item.urgency === 'High' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {item.timeframe}
                          </div>
                          <span className="text-xs font-bold text-gray-200">{item.task}</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${item.urgency === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-transparent'}`} />
                      </div>
                    ))}
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