import { create } from 'zustand';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

interface TelemetryState {
  healthScore: number;
  activeShipments: number;
  fuelEfficiency: number;
  co2Saved: number;
  systemStatus: string;
  isConnecting: boolean;
  connectToBackend: () => void;
}

export const useLiveTelemetry = create<TelemetryState>((set) => ({
  healthScore: 0,
  activeShipments: 0,
  fuelEfficiency: 0,
  co2Saved: 0,
  systemStatus: "OFFLINE",
  isConnecting: true,

  connectToBackend: () => {
    // This listens to a document called "global" inside the "telemetry" collection
    const unsub = onSnapshot(doc(db, "telemetry", "global"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        set({
          healthScore: data.healthScore,
          activeShipments: data.activeShipments,
          fuelEfficiency: data.fuelEfficiency,
          co2Saved: data.co2Saved,
          systemStatus: "ONLINE",
          isConnecting: false,
        });
      } else {
        set({ isConnecting: false, systemStatus: "WAITING FOR PYTHON ENGINE" });
      }
    });

    return unsub;
  }
}));