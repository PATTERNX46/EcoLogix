import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Code2, Copy, CheckCircle2, Zap, 
  Route, Leaf, ShieldAlert, Truck, Key,
  ChevronRight, Database
} from 'lucide-react';
interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface ApiEndpoint {
  id: string;
  name: string;
  icon: any;
  method: 'GET' | 'POST';
  endpoint: string;
  description: string;
  color: string;
  parameters: Parameter[];
  mockRequest: string;
  mockResponse: string;
}

const APIS: ApiEndpoint[] = [
  {
    id: 'eta',
    name: 'ETA Prediction API',
    icon: Zap,
    color: 'text-blue-400',
    method: 'POST',
    endpoint: '/v1/eta/predict',
    description: 'Generates a highly accurate Estimated Time of Arrival using Gemini AI, factoring in live weather, port congestion, and historical traffic patterns.',
    parameters: [
      { name: 'origin_coords', type: 'Array<float>', required: true, description: '[lat, lng] of the starting point.' },
      { name: 'dest_coords', type: 'Array<float>', required: true, description: '[lat, lng] of the destination.' },
      { name: 'asset_type', type: 'String', required: true, description: 'e.g., "Heavy_Freight", "Cold_Chain"' }
    ],
    mockRequest: `curl -X POST https://api.resilio.os/v1/eta/predict \\
  -H "Authorization: Bearer res_live_x89a..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "origin_coords": [19.0760, 72.8777],
    "dest_coords": [28.7041, 77.1025],
    "asset_type": "Heavy_Freight"
  }'`,
    mockResponse: `{
  "status": "success",
  "data": {
    "predicted_eta": "2026-05-01T14:30:00Z",
    "confidence_score": 0.94,
    "factors": {
      "weather_delay_mins": 15,
      "traffic_delay_mins": 42
    }
  }
}`
  },
  {
    id: 'route',
    name: 'Self-Healing Routing',
    icon: Route,
    color: 'text-emerald-400',
    method: 'POST',
    endpoint: '/v1/routing/optimize',
    description: 'Calculates the optimal polyline path. If a disruption occurs, calling this endpoint recalculates a bypass route in real-time.',
    parameters: [
      { name: 'current_location', type: 'Array<float>', required: true, description: 'Live GPS coordinates.' },
      { name: 'destination', type: 'String', required: true, description: 'Destination ID or Coordinates.' },
      { name: 'avoid_hazards', type: 'Boolean', required: false, description: 'Strictly bypass known risk zones.' }
    ],
    mockRequest: `const response = await fetch('https://api.resilio.os/v1/routing/optimize', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer res_live_x89a...' },
  body: JSON.stringify({
    current_location: [22.5726, 88.3639],
    destination: "PORT_CHN_01",
    avoid_hazards: true
  })
});`,
    mockResponse: `{
  "route_id": "rt_88xyz",
  "polyline": "m~a}E_~b{O_@w@bA...",
  "distance_km": 1450.2,
  "waypoints": [
    { "lat": 22.5, "lng": 88.3, "type": "departure" },
    { "lat": 20.2, "lng": 85.8, "type": "bypass_node" }
  ]
}`
  },
  {
    id: 'carbon',
    name: 'Carbon Scope 3 API',
    icon: Leaf,
    color: 'text-green-400',
    method: 'POST',
    endpoint: '/v1/emissions/calculate',
    description: 'Analyzes a manifest and transport method to calculate projected Scope 3 greenhouse gas emissions for ESG compliance reporting.',
    parameters: [
      { name: 'distance_km', type: 'Float', required: true, description: 'Total route distance.' },
      { name: 'cargo_weight_kg', type: 'Integer', required: true, description: 'Total weight of the shipment.' },
      { name: 'vehicle_class', type: 'String', required: true, description: '"EV", "Diesel_Euro6", "Rail", "Maritime"' }
    ],
    mockRequest: `import requests

payload = {
    "distance_km": 850.5,
    "cargo_weight_kg": 12000,
    "vehicle_class": "Diesel_Euro6"
}
headers = {"Authorization": "Bearer res_live_x89a..."}

res = requests.post("https://api.resilio.os/v1/emissions/calculate", json=payload, headers=headers)`,
    mockResponse: `{
  "esg_report": {
    "total_co2_kg": 845.2,
    "intensity_factor": 0.082,
    "offset_recommendation": {
      "credits_required": 1.0,
      "cost_usd": 12.50
    }
  }
}`
  },
  {
    id: 'risk',
    name: 'Geo-Risk Intelligence',
    icon: ShieldAlert,
    color: 'text-red-400',
    method: 'GET',
    endpoint: '/v1/risk/analyze',
    description: 'Queries the Resilio AI core for a real-time risk assessment of a specific geographical corridor or port.',
    parameters: [
      { name: 'region_id', type: 'String', required: true, description: 'Standard UN/LOCODE or GeoHash.' },
      { name: 'timeframe', type: 'String', required: false, description: '"current", "24h", "7d"' }
    ],
    mockRequest: `curl -X GET "https://api.resilio.os/v1/risk/analyze?region_id=IN_BOM&timeframe=24h" \\
  -H "Authorization: Bearer res_live_x89a..."`,
    mockResponse: `{
  "region": "Mumbai_Port_Trust",
  "overall_risk_score": 78,
  "threat_vectors": [
    { "type": "Weather", "severity": "High", "detail": "Monsoon flooding likely." },
    { "type": "Congestion", "severity": "Medium", "detail": "4-hour gate delays." }
  ],
  "safe_to_transit": false
}`
  },
  {
    id: 'fleet',
    name: 'Fleet Telemetry Stream',
    icon: Truck,
    color: 'text-purple-400',
    method: 'GET',
    endpoint: '/v1/fleet/telemetry/{asset_id}',
    description: 'Pulls the latest raw IoT sensor data (temperature, battery health, engine diagnostics) for a specific active asset.',
    parameters: [
      { name: 'asset_id', type: 'String', required: true, description: 'Passed in the URL path.' },
      { name: 'sensors', type: 'String', required: false, description: 'Comma-separated list (e.g., "temp,battery").' }
    ],
    mockRequest: `const socket = new WebSocket('wss://api.resilio.os/v1/fleet/stream/TRK-DL-44');

socket.onmessage = (event) => {
  const telemetry = JSON.parse(event.data);
  console.log("Live Temp:", telemetry.reefer_temp);
};`,
    mockResponse: `{
  "asset_id": "TRK-DL-44",
  "timestamp": "2026-04-28T10:15:30Z",
  "telemetry": {
    "engine_temp_c": 92,
    "reefer_temp_c": -18.5,
    "battery_v": 24.2,
    "gps": [22.5726, 88.3639]
  }
}`
  }
];

export default function ApiPortal() {
  const [activeApi, setActiveApi] = useState<ApiEndpoint>(APIS[0]);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState<'req' | 'res' | null>(null);

  const handleCopy = (type: 'req' | 'res', text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText('res_live_x89a9f2b4c7dE...');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[700px] pb-8">
      
      {/* LEFT COLUMN: API Navigation & Keys */}
      <div className="w-full xl:w-[320px] flex flex-col gap-6 shrink-0">
        
        {/* API Key Generator Card */}
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <h2 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-blue-400" /> Developer Keys
          </h2>
          <p className="text-[10px] text-gray-500 mb-3 leading-relaxed">
            Use this bearer token to authenticate requests to the Resilio core. Do not share this key.
          </p>
          <div className="flex items-center gap-2 bg-[#050507] border border-white/10 rounded-lg p-2">
            <input 
              type="password" 
              readOnly 
              value="res_live_x89a9f2b4c7dE..." 
              className="bg-transparent border-none outline-none text-xs text-gray-300 font-mono flex-1 px-2"
            />
            <button 
              onClick={handleCopyKey}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white"
            >
              {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl p-4 flex-1">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 px-2">Available Endpoints</h3>
          <div className="space-y-1">
            {APIS.map(api => {
              const Icon = api.icon;
              const isActive = activeApi.id === api.id;
              return (
                <button
                  key={api.id}
                  onClick={() => setActiveApi(api)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                    isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? api.color : 'text-gray-500'}`} />
                    <span className="text-xs font-bold tracking-wide">{api.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3 h-3 text-gray-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MIDDLE COLUMN: Documentation */}
      <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl p-8 relative overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeApi.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-8 max-w-3xl"
          >
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-white/5 border border-white/10`}>
                  <activeApi.icon className={`w-6 h-6 ${activeApi.color}`} />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">{activeApi.name}</h1>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
                {activeApi.description}
              </p>
            </div>

            {/* Endpoint URL Bar */}
            <div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Endpoint</h3>
              <div className="flex items-center gap-0 bg-[#050507] border border-white/10 rounded-xl overflow-hidden shadow-inner">
                <div className={`px-4 py-3 text-xs font-black tracking-widest border-r border-white/10 ${activeApi.method === 'POST' ? 'text-emerald-400 bg-emerald-500/10' : 'text-blue-400 bg-blue-500/10'}`}>
                  {activeApi.method}
                </div>
                <div className="px-4 py-3 text-sm font-mono text-gray-300 flex-1 flex items-center gap-2">
                  <span className="text-gray-600">https://api.resilio.os</span>
                  <span className="text-white">{activeApi.endpoint}</span>
                </div>
              </div>
            </div>

            {/* Parameters Table */}
            <div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Parameters</h3>
              <div className="border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#111113] border-b border-white/10 text-[10px] uppercase tracking-widest text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-bold">Name</th>
                      <th className="px-4 py-3 font-bold">Type</th>
                      <th className="px-4 py-3 font-bold text-right">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#050507]">
                    {activeApi.parameters.map((param, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-white">{param.name}</span>
                            {param.required && <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Required</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-mono text-blue-400">{param.type}</td>
                        <td className="px-4 py-4 text-xs text-gray-400 text-right">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

      {/* RIGHT COLUMN: Code Snippets (Terminal View) */}
      <div className="w-full xl:w-[450px] flex flex-col gap-4 shrink-0">
        
        {/* Request Block */}
        <div className="bg-[#050507] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-1/2">
          <div className="bg-[#111113] px-4 py-2 border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-3 h-3" /> Request Example
            </span>
            <button onClick={() => handleCopy('req', activeApi.mockRequest)} className="text-gray-500 hover:text-white transition-colors">
              {copiedCode === 'req' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
            <pre className="text-[11px] font-mono leading-relaxed text-gray-300">
              <code>{activeApi.mockRequest}</code>
            </pre>
          </div>
        </div>

        {/* Response Block */}
        <div className="bg-[#050507] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-1/2">
          <div className="bg-[#111113] px-4 py-2 border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Code2 className="w-3 h-3" /> JSON Response
            </span>
            <button onClick={() => handleCopy('res', activeApi.mockResponse)} className="text-gray-500 hover:text-white transition-colors">
              {copiedCode === 'res' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
            <pre className="text-[11px] font-mono leading-relaxed text-emerald-400">
              <code>{activeApi.mockResponse}</code>
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}