import { create } from 'zustand';

type RegionMode = 'global' | 'india';

interface RegionState {
  region: RegionMode;
  setRegion: (region: RegionMode) => void;
  toggleRegion: () => void;
}

export const useRegionStore = create<RegionState>((set) => ({
  region: 'global', // Defaults to global on load
  setRegion: (region) => set({ region }),
  toggleRegion: () => set((state) => ({ 
    region: state.region === 'global' ? 'india' : 'global' 
  })),
}));