import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSimulationStore } from '../../store/useSimulationStore';
import { 
  CloudRain, ShieldAlert, Truck, Anchor, X, Warehouse, 
  Zap, Activity, ThermometerSnowflake, Crosshair,
  Car, Plane, Factory, BatteryCharging, AlertTriangle, Route
} from 'lucide-react';
import { useGemini } from '../../store/useGemini';

// ==========================================
// EXPANDED MOCK DATA LAKE (15 Layers)
// ==========================================
const MOCK_INFRASTRUCTURE = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { type: 'port', name: 'Shanghai Mega-Port', status: 'Congested' }, geometry: { type: 'Point', coordinates: [121.47, 31.23] } },
    { type: 'Feature', properties: { type: 'port', name: 'Rotterdam Hub', status: 'Optimal' }, geometry: { type: 'Point', coordinates: [4.47, 51.92] } },
    { type: 'Feature', properties: { type: 'port', name: 'LA Port', status: '82% Capacity' }, geometry: { type: 'Point', coordinates: [-118.24, 34.05] } },
    { type: 'Feature', properties: { type: 'warehouse', name: 'Texas Fulfillment', status: 'Optimal' }, geometry: { type: 'Point', coordinates: [-95.36, 29.76] } },
    { type: 'Feature', properties: { type: 'warehouse', name: 'Berlin Storage', status: '90% Capacity' }, geometry: { type: 'Point', coordinates: [13.40, 52.52] } },
    { type: 'Feature', properties: { type: 'supplier', name: 'Shenzhen Microchips', status: 'Active' }, geometry: { type: 'Point', coordinates: [114.05, 22.54] } },
    { type: 'Feature', properties: { type: 'supplier', name: 'Taiwan Semis', status: 'Active' }, geometry: { type: 'Point', coordinates: [121.56, 25.03] } },
    { type: 'Feature', properties: { type: 'supplier', name: 'Mumbai Textiles', status: 'Delayed' }, geometry: { type: 'Point', coordinates: [72.87, 19.07] } },
  ]
};

const MOCK_RISKS = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { type: 'storm', name: 'Typhoon Yutu', risk: 'Critical' }, geometry: { type: 'Point', coordinates: [130.0, 20.0] } },
    { type: 'Feature', properties: { type: 'storm', name: 'Atlantic Hurricane', risk: 'Severe' }, geometry: { type: 'Point', coordinates: [-60.0, 15.0] } },
    { type: 'Feature', properties: { type: 'piracy', name: 'Gulf of Aden Risk', risk: 'High' }, geometry: { type: 'Point', coordinates: [45.0, 12.0] } },
    { type: 'Feature', properties: { type: 'piracy', name: 'Strait of Malacca', risk: 'Moderate' }, geometry: { type: 'Point', coordinates: [100.0, 5.0] } },
    { type: 'Feature', properties: { type: 'geopolitics', name: 'Black Sea Embargo', risk: 'Critical' }, geometry: { type: 'Point', coordinates: [34.0, 43.0] } },
    { type: 'Feature', properties: { type: 'geopolitics', name: 'Suez Blockade', risk: 'Severe' }, geometry: { type: 'Point', coordinates: [32.3, 30.6] } },
  ]
};

const MOCK_ROUTES = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { type: 'cargo' }, geometry: { type: 'LineString', coordinates: [[121.47, 31.23], [-118.24, 34.05]] } },
    { type: 'Feature', properties: { type: 'cold-chain' }, geometry: { type: 'LineString', coordinates: [[4.47, 51.92], [-74.00, 40.71]] } },
    { type: 'Feature', properties: { type: 'ev-charging' }, geometry: { type: 'LineString', coordinates: [[-118.24, 34.05], [-95.36, 29.76], [-80.19, 25.76]] } },
    { type: 'Feature', properties: { type: 'drone' }, geometry: { type: 'LineString', coordinates: [[-74.00, 40.71], [-71.05, 42.36]] } },
    { type: 'Feature', properties: { type: 'traffic' }, geometry: { type: 'LineString', coordinates: [[-79.99, 9.38], [-77.0, 12.0]] } },
  ]
};

const LIVE_SHIPMENT_ROUTE = [[-0.1276, 51.5074], [-74.006, 40.7128]];

export default function GlobeMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { isActive, disasterType } = useSimulationStore();
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  const { isAnalyzing, analysisResult, runAnalysis, clearAnalysis } = useGemini();

  const [layers, setLayers] = useState({
    cargo: true, coldChain: true, evCharging: false, drone: false, liveTracking: true,
    ports: true, warehouses: false, suppliers: false,
    traffic: true, storms: true, piracy: false, geopolitics: true
  });

  const toggle = (key: keyof typeof layers) => setLayers(p => ({ ...p, [key]: !p[key] }));

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";
    if (!mapboxgl.accessToken || map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current, style: 'mapbox://styles/mapbox/dark-v11', 
      projection: { name: 'globe' }, zoom: 1.5, center: [-30, 40], pitch: 45, dragPan: true, dragRotate: true
    });

    map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    let animationFrameId: number;
    let userInteracting = false;
    const spinGlobe = () => {
      if (!userInteracting && map.current && (map.current.getZoom() ?? 0) < 5) {
        const center = map.current.getCenter();
        if (center) { center.lng -= 0.15; map.current.easeTo({ center, duration: 50, easing: n => n }); }
      }
      animationFrameId = requestAnimationFrame(spinGlobe);
    };

    map.current.on('mousedown', () => { userInteracting = true; });
    map.current.on('mouseup', () => { userInteracting = false; });

    map.current.on('style.load', () => {
      map.current?.setFog({ color: 'rgb(9, 9, 11)', 'high-color': 'rgb(36, 92, 223)', 'space-color': 'rgb(9, 9, 11)', 'star-intensity': 0.6 });

      map.current?.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {}, 
          geometry: { type: 'LineString', coordinates: [[-74.006, 40.7128], [-0.1276, 51.5074]] }
        }
      });
      map.current?.addLayer({
        id: 'route-line', type: 'line', source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#34d399', 'line-width': 3, 'line-opacity': 0.8 }
      });
      map.current?.addLayer({
        id: 'route-glow', type: 'line', source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#34d399', 'line-width': 12, 'line-opacity': 0.2, 'line-blur': 8 }
      });

      map.current?.addSource('src-adv-routes', { type: 'geojson', data: MOCK_ROUTES as any });
      map.current?.addLayer({
        id: 'layer-adv-routes', type: 'line', source: 'src-adv-routes',
        layout: { visibility: 'none', 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-width': ['match', ['get', 'type'], 'drone', 1.5, 'traffic', 4, 2.5],
          'line-dasharray': ['match', ['get', 'type'], 'drone', ['literal', [2, 4]], ['literal', [1]]],
          'line-color': ['match', ['get', 'type'], 'cargo', '#34d399', 'cold-chain', '#93c5fd', 'ev-charging', '#4ade80', 'drone', '#c084fc', 'traffic', '#ef4444', '#ffffff'],
          'line-opacity': ['match', ['get', 'type'], 'traffic', 0.9, 0.6]
        }
      });

      map.current?.addSource('src-infra', { type: 'geojson', data: MOCK_INFRASTRUCTURE as any });
      map.current?.addLayer({
        id: 'layer-infra', type: 'circle', source: 'src-infra',
        paint: {
          'circle-radius': ['match', ['get', 'type'], 'port', 6, 'warehouse', 5, 'supplier', 4, 5],
          'circle-color': ['match', ['get', 'type'], 'port', '#3b82f6', 'warehouse', '#f97316', 'supplier', '#a855f7', '#ffffff'],
          'circle-stroke-width': 1.5, 'circle-stroke-color': '#000'
        }
      });

      map.current?.addSource('src-risks', { type: 'geojson', data: MOCK_RISKS as any });
      map.current?.addLayer({
        id: 'layer-risks-glow', type: 'circle', source: 'src-risks',
        paint: {
          'circle-radius': 30, 'circle-opacity': 0.3, 'circle-blur': 1,
          'circle-color': ['match', ['get', 'type'], 'storm', '#3b82f6', 'piracy', '#ef4444', 'geopolitics', '#eab308', '#fff'],
        }
      });
      map.current?.addLayer({
        id: 'layer-risks-core', type: 'circle', source: 'src-risks',
        paint: {
          'circle-radius': 8, 'circle-stroke-width': 2, 'circle-color': '#000',
          'circle-stroke-color': ['match', ['get', 'type'], 'storm', '#3b82f6', 'piracy', '#ef4444', 'geopolitics', '#eab308', '#fff'],
        }
      });

      map.current?.addSource('src-live-dot', {
        type: 'geojson', 
        data: { 
          type: 'FeatureCollection', 
          features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: LIVE_SHIPMENT_ROUTE[0] } }] 
        }
      });

      map.current?.addLayer({
        id: 'layer-live-dot', type: 'circle', source: 'src-live-dot',
        paint: { 'circle-radius': 6, 'circle-color': '#facc15', 'circle-stroke-width': 2, 'circle-stroke-color': '#000' }
      });

      ['layer-infra', 'layer-risks-core'].forEach(layer => {
        map.current?.on('click', layer, (e) => { if (e.features) setSelectedNode(e.features[0].properties); });
        map.current?.on('mouseenter', layer, () => { if (map.current) map.current.getCanvas().style.cursor = 'pointer'; });
        map.current?.on('mouseleave', layer, () => { if (map.current) map.current.getCanvas().style.cursor = ''; });
      });

      setIsMapLoaded(true); 
      spinGlobe(); 
      animateLiveDot(); 
    });

    let dotProgress = 0;
    let dotAnimFrame: number;
    const animateLiveDot = () => {
      dotProgress += 0.002; if (dotProgress > 1) dotProgress = 0;
      const [sLng, sLat] = LIVE_SHIPMENT_ROUTE[0];
      const [eLng, eLat] = LIVE_SHIPMENT_ROUTE[1];
      if (map.current?.getSource('src-live-dot')) {
        (map.current.getSource('src-live-dot') as mapboxgl.GeoJSONSource).setData({
          type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [sLng + (eLng - sLng) * dotProgress, sLat + (eLat - sLat) * dotProgress] } }]
        });
      }
      dotAnimFrame = requestAnimationFrame(animateLiveDot);
    };

    return () => { 
      cancelAnimationFrame(animationFrameId); 
      cancelAnimationFrame(dotAnimFrame); 
      if (map.current) {
        map.current.remove(); 
        map.current = null; 
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    let targetColor = '#34d399'; 
    let glowRadius = 12;

    if (isActive) {
      if (disasterType === 'flood') targetColor = '#3b82f6'; 
      else if (disasterType === 'strike') targetColor = '#f97316'; 
      else if (disasterType === 'cyberattack') targetColor = '#ef4444'; 
      glowRadius = 24; 
    }

    try {
      map.current.setPaintProperty('route-line', 'line-color', targetColor);
      map.current.setPaintProperty('route-glow', 'line-color', targetColor);
      map.current.setPaintProperty('route-glow', 'line-width', glowRadius);
    } catch (e) { console.warn("Mapbox paint error:", e); }
  }, [isActive, disasterType, isMapLoaded]);

  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const activeRoutes = [];
    if (layers.cargo) activeRoutes.push('cargo');
    if (layers.coldChain) activeRoutes.push('cold-chain');
    if (layers.evCharging) activeRoutes.push('ev-charging');
    if (layers.drone) activeRoutes.push('drone');
    if (layers.traffic) activeRoutes.push('traffic');
    
    if (activeRoutes.length === 0) {
      map.current.setLayoutProperty('layer-adv-routes', 'visibility', 'none');
    } else {
      map.current.setLayoutProperty('layer-adv-routes', 'visibility', 'visible');
      map.current.setFilter('layer-adv-routes', ['in', ['get', 'type'], ['literal', activeRoutes]]);
    }

    const activeInfra = [];
    if (layers.ports) activeInfra.push('port');
    if (layers.warehouses) activeInfra.push('warehouse');
    if (layers.suppliers) activeInfra.push('supplier');

    if (activeInfra.length === 0) {
      map.current.setLayoutProperty('layer-infra', 'visibility', 'none');
    } else {
      map.current.setLayoutProperty('layer-infra', 'visibility', 'visible');
      map.current.setFilter('layer-infra', ['in', ['get', 'type'], ['literal', activeInfra]]);
    }

    const activeRisks = [];
    if (layers.storms) activeRisks.push('storm');
    if (layers.piracy) activeRisks.push('piracy');
    if (layers.geopolitics) activeRisks.push('geopolitics');

    if (activeRisks.length === 0) {
      map.current.setLayoutProperty('layer-risks-core', 'visibility', 'none');
      map.current.setLayoutProperty('layer-risks-glow', 'visibility', 'none');
    } else {
      map.current.setLayoutProperty('layer-risks-core', 'visibility', 'visible');
      map.current.setLayoutProperty('layer-risks-glow', 'visibility', 'visible');
      map.current.setFilter('layer-risks-core', ['in', ['get', 'type'], ['literal', activeRisks]]);
      map.current.setFilter('layer-risks-glow', ['in', ['get', 'type'], ['literal', activeRisks]]);
    }

    // FIXED: Safely check for layer before toggling visibility
    if (map.current && map.current.getLayer('layer-live-dot')) {
      map.current.setLayoutProperty('layer-live-dot', 'visibility', layers.liveTracking ? 'visible' : 'none');
    }

  }, [layers, isMapLoaded]);

  return (
    <div className="w-full h-full min-h-[500px] relative rounded-b-2xl overflow-hidden bg-[#09090b] border-t border-white/5">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] z-0" />

      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 w-56 max-h-[90%] overflow-y-auto scrollbar-hide bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        <div className="p-3 border-b border-white/10 sticky top-0 bg-black/80 z-20">
          <h2 className="text-[10px] font-black text-white tracking-widest uppercase flex items-center gap-2">
            <Route className="w-3 h-3 text-blue-400" /> Control Matrix
          </h2>
        </div>
        <div className="p-3 space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Logistics & Routes</h3>
            <ToggleButton active={layers.cargo} onClick={() => toggle('cargo')} icon={<Truck className="w-3 h-3"/>} label="Standard Cargo" color="text-emerald-400" />
            <ToggleButton active={layers.coldChain} onClick={() => toggle('coldChain')} icon={<ThermometerSnowflake className="w-3 h-3"/>} label="Cold Chain" color="text-blue-400" />
            <ToggleButton active={layers.evCharging} onClick={() => toggle('evCharging')} icon={<BatteryCharging className="w-3 h-3"/>} label="EV Charging" color="text-green-400" />
            <ToggleButton active={layers.drone} onClick={() => toggle('drone')} icon={<Plane className="w-3 h-3"/>} label="Drone Corridors" color="text-purple-400" />
            <ToggleButton active={layers.liveTracking} onClick={() => toggle('liveTracking')} icon={<Crosshair className="w-3 h-3"/>} label="Live Telemetry" color="text-yellow-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Infrastructure</h3>
            <ToggleButton active={layers.ports} onClick={() => toggle('ports')} icon={<Anchor className="w-3 h-3"/>} label="Seaports" color="text-blue-400" />
            <ToggleButton active={layers.warehouses} onClick={() => toggle('warehouses')} icon={<Warehouse className="w-3 h-3"/>} label="Warehouses" color="text-orange-400" />
            <ToggleButton active={layers.suppliers} onClick={() => toggle('suppliers')} icon={<Factory className="w-3 h-3"/>} label="Suppliers" color="text-purple-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Threat Radar</h3>
            <ToggleButton active={layers.traffic} onClick={() => toggle('traffic')} icon={<Car className="w-3 h-3"/>} label="Traffic Jams" color="text-red-400" />
            <ToggleButton active={layers.storms} onClick={() => toggle('storms')} icon={<CloudRain className="w-3 h-3"/>} label="Storms" color="text-blue-400" />
            <ToggleButton active={layers.piracy} onClick={() => toggle('piracy')} icon={<AlertTriangle className="w-3 h-3"/>} label="Piracy Zones" color="text-red-500" />
            <ToggleButton active={layers.geopolitics} onClick={() => toggle('geopolitics')} icon={<ShieldAlert className="w-3 h-3"/>} label="Geopolitics" color="text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Node Detail Drawer */}
      {selectedNode && (
        <div className="absolute top-4 right-4 z-20 w-72 bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
          <div className={`p-4 border-b border-white/10 flex justify-between items-center ${selectedNode.risk ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
            <h3 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
              {selectedNode.risk ? <ShieldAlert className="w-4 h-4 text-red-400"/> : <Activity className="w-4 h-4 text-blue-400"/>}
              Node Intercepted
            </h3>
            <button onClick={() => { setSelectedNode(null); clearAnalysis(); }} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-4 text-sm">
            <div>
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Entity / Location</p>
              <p className="text-white font-bold text-lg leading-tight">{selectedNode.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Type</p>
                <p className="text-gray-300 capitalize text-xs font-bold">{selectedNode.type}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Status</p>
                <p className={`font-black uppercase text-xs ${selectedNode.risk ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                  {selectedNode.risk || selectedNode.status}
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              {analysisResult ? (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg animate-in fade-in slide-in-from-bottom-2 flex flex-col">
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2 shrink-0">
                    <Zap className="w-3 h-3"/> AI Resolution Strategy
                  </p>
                  {/* FIXED: Scrollable text box for Gemini analysis */}
                  <div className="max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-gray-300 text-[11px] leading-relaxed italic border-l-2 border-blue-500/50 pl-2">
                      "{analysisResult}"
                    </p>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => runAnalysis(selectedNode)}
                  disabled={isAnalyzing}
                  className={`w-full py-2.5 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest flex justify-center items-center gap-2 
                    ${isAnalyzing ? 'bg-white/5 text-gray-500 cursor-wait' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                >
                  {isAnalyzing ? <>Processing Telemetry...</> : <><Zap className="w-3 h-3 text-yellow-400"/> Run Gemini Analysis</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ToggleButton = ({ active, onClick, icon, label, color }: any) => (
  <button 
    onClick={onClick}
    className={`w-full p-2 rounded-lg border transition-all flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider
      ${active ? `bg-white/10 border-white/20 ${color}` : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
  >
    {icon} {label}
  </button>
);