import { useState, useEffect } from 'react';

type FeedCategory = 'gps' | 'iot' | 'weather' | 'social' | 'customs' | 'satellite' | 'ais' | 'news' | 'regulatory';

export interface FusionAlert {
  id: string;
  timestamp: string;
  category: FeedCategory;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

// We removed 'weather' from the mock feeds because we are doing it FOR REAL now.
const MOCK_FEEDS: Record<Exclude<FeedCategory, 'weather'>, { messages: string[], severities: FusionAlert['severity'][] }> = {
  gps: {
    messages: ['Convoy TR-88 deviated from route', 'GPS signal restored in Sector 4', 'Asset 99a approached geofence'],
    severities: ['warning', 'info', 'info']
  },
  iot: {
    messages: ['Container 4A temp dropped below -2°C', 'Shock sensor triggered on Pallet 12', 'Battery optimal on all trackers'],
    severities: ['critical', 'warning', 'info']
  },
  social: {
    messages: ['Spike in #PortStrike mentions (Shanghai)', 'Sentiment stable for Carrier X', 'Local reports of road closures near Hub B'],
    severities: ['critical', 'info', 'warning']
  },
  customs: {
    messages: ['Clearance delayed: Manifest mismatch', 'Priority lane open at Border Check 2', 'Tariff update applied to manifest'],
    severities: ['critical', 'info', 'info']
  },
  satellite: {
    messages: ['SAR scan complete: Suez Canal clear', 'Optical feed shows heavy yard congestion', 'Thermal anomaly detected at facility'],
    severities: ['info', 'warning', 'critical']
  },
  ais: {
    messages: ['Vessel "Ever-Breeze" speed dropped to 4kts', 'Ship density high in Malacca Strait', 'Docking confirmed: Pier 4'],
    severities: ['warning', 'critical', 'info']
  },
  news: {
    messages: ['Flash: Union negotiations break down', 'Tech embargo lifted in Region C', 'Fuel prices spike globally'],
    severities: ['critical', 'info', 'warning']
  },
  regulatory: {
    messages: ['New emission cap enforced today', 'Compliance audit passed for Fleet A', 'Warning: Draft restriction at Port Y'],
    severities: ['info', 'info', 'warning']
  }
};

export function useDataFusion() {
  const [alerts, setAlerts] = useState<FusionAlert[]>([]);

  // ==========================================
  // ENGINE 1: THE LIVE REST API (Weather)
  // ==========================================
  useEffect(() => {
    const fetchLiveWeather = async () => {
      try {
        // Fetching real, live weather data using coordinates for Shanghai, China
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=31.23&longitude=121.47&current_weather=true');
        const data = await res.json();
        
        const temp = data.current_weather.temperature;
        const wind = data.current_weather.windspeed;
        
        // Determine severity based on real actual weather conditions!
        const isSevere = wind > 40 || temp > 35; 
        
        const realWeatherAlert: FusionAlert = {
          id: `real-weather-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          category: 'weather',
          message: `LIVE (Shanghai Hub): Temp ${temp}°C, Wind ${wind}km/h.`,
          severity: isSevere ? 'warning' : 'info'
        };

        setAlerts(prev => [realWeatherAlert, ...prev].slice(0, 8));
      } catch (error) {
        console.error("Live weather feed offline:", error);
      }
    };

    // Fetch immediately on load, then exactly every 12 seconds
    fetchLiveWeather();
    const weatherInterval = setInterval(fetchLiveWeather, 12000);
    return () => clearInterval(weatherInterval);
  }, []);

  // ==========================================
  // ENGINE 2: THE SIMULATOR (Everything Else)
  // ==========================================
  useEffect(() => {
    const interval = setInterval(() => {
      const categories = Object.keys(MOCK_FEEDS) as (keyof typeof MOCK_FEEDS)[];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const feedData = MOCK_FEEDS[randomCategory];
      
      const randomIndex = Math.floor(Math.random() * feedData.messages.length);
      
      const newAlert: FusionAlert = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        category: randomCategory as FeedCategory,
        message: feedData.messages[randomIndex],
        severity: feedData.severities[randomIndex]
      };

      setAlerts(prev => [newAlert, ...prev].slice(0, 8));
    }, 3000); // Simulated data pushes every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return alerts;
}