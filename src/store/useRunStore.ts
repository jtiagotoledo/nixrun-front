import { create } from 'zustand';

interface LocationData {
  latitude: number;
  longitude: number;
}

interface RunState {
  currentLocation: LocationData | null;
  setCurrentLocation: (location: LocationData) => void;
}

export const useRunStore = create<RunState>((set) => ({
  currentLocation: null,
  setCurrentLocation: (location) => set({ currentLocation: location }),
}));