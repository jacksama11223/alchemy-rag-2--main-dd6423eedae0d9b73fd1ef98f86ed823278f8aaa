import { create } from 'zustand';

interface LearningContextState {
  activeNodeId: string | null;
  activeTopic: string | null;
  setActiveNode: (nodeId: string, topicTitle: string) => void;
  clearContext: () => void;
}

export const useLearningContext = create<LearningContextState>((set) => ({
  activeNodeId: null,
  activeTopic: null,
  setActiveNode: (nodeId, topicTitle) => set({ activeNodeId: nodeId, activeTopic: topicTitle }),
  clearContext: () => set({ activeNodeId: null, activeTopic: null }),
}));
