import { create } from 'zustand';

interface UIState {
  activeFeature: string;
  splitFeature: string | null;
  setActiveFeature: (feature: string) => void;
  setSplitFeature: (feature: string | null) => void;
  isSplitMode: () => boolean;
}

export const useUIStore = create<UIState>((set, get) => ({
  activeFeature: 'dashboard',
  splitFeature: null,
  setActiveFeature: (feature) => set({ activeFeature: feature }),
  setSplitFeature: (feature) => set({ splitFeature: feature }),
  isSplitMode: () => get().splitFeature !== null,
}));
