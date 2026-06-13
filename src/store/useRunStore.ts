import { create } from 'zustand';

interface LocationData {
  latitude: number;
  longitude: number;
}

interface RunState {
  route: LocationData[]; 
  addCoordinate: (location: LocationData) => void;
  clearRoute: () => void; 
}

export const useRunStore = create<RunState>((set) => ({
  route: [],
  
  addCoordinate: (location) => 
    set((state) => ({ route: [...state.route, location] })),
    
  clearRoute: () => set({ route: [] }),
}));