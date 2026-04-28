import { create } from 'zustand';

export type DisasterType = 'flood' | 'strike' | 'cyberattack' | 'none';

interface ImpactMetrics {
  financialLoss: number;
  co2Impact: number;
  etaDelayDays: number;
  resilienceScore: number;
}

interface SimulationState {
  isActive: boolean;
  disasterType: DisasterType;
  impact: ImpactMetrics | null;
  startSimulation: (type: DisasterType) => void;
  resetSimulation: () => void;
}

// Simulated algorithms for impact calculation
const calculateImpact = (type: DisasterType): ImpactMetrics => {
  switch (type) {
    case 'flood': return { financialLoss: 1.2, co2Impact: +420, etaDelayDays: 5, resilienceScore: 68 };
    case 'strike': return { financialLoss: 2.8, co2Impact: 0, etaDelayDays: 12, resilienceScore: 45 };
    case 'cyberattack': return { financialLoss: 5.4, co2Impact: 0, etaDelayDays: 8, resilienceScore: 32 };
    default: return { financialLoss: 0, co2Impact: 0, etaDelayDays: 0, resilienceScore: 95 };
  }
};

export const useSimulationStore = create<SimulationState>((set) => ({
  isActive: false,
  disasterType: 'none',
  impact: null,
  
  startSimulation: (type) => {
    // In a real app, this would hit your Python backend API. 
    // Here we calculate it locally for instant feedback.
    set({ isActive: true, disasterType: type, impact: calculateImpact(type) });
  },
  
  resetSimulation: () => set({ isActive: false, disasterType: 'none', impact: null }),
}));