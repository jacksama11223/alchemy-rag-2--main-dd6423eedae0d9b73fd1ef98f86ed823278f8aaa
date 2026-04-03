import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GuideState {
  isGuideEnabled: boolean;
  toggleGuide: () => void;
  hoveredFeature: string | null;
  setHoveredFeature: (feature: string | null) => void;
}

export const useGuideStore = create<GuideState>()(
  persist(
    (set) => ({
      isGuideEnabled: true,
      toggleGuide: () => set((state) => ({ isGuideEnabled: !state.isGuideEnabled })),
      hoveredFeature: null,
      setHoveredFeature: (feature) => set({ hoveredFeature: feature }),
    }),
    {
      name: 'ecosystem-guide-storage',
      partialize: (state) => ({ isGuideEnabled: state.isGuideEnabled }),
    }
  )
);
