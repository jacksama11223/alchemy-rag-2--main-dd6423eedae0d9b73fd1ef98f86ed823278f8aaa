import { create } from 'zustand';
import { IncomingAsset } from '../utils/dataProcessor';

interface DndActionStore {
  activeDragItem: IncomingAsset | null;
  setActiveDragItem: (item: IncomingAsset | null) => void;
  
  noteActions: {
    appendNoteContent: (content: string) => void;
    attachCanvasToNote: (canvasId: string, imageUrl: string) => void;
    attachFile: (fileId: string, fileName: string) => void;
  } | null;
  graphActions: {
    addNode: (nodeData: any) => void;
  } | null;
  tutorActions: {
    sendToTutor: (content: string) => void;
    sendImageToTutor: (imageUrl: string) => void;
    saveToKnowledgeBase: (asset: IncomingAsset) => void;
  } | null;
  airRoomActions: {
    sendToRoom: (content: string) => void;
  } | null;
  alchemyActions: {
    saveToTemp: (asset: IncomingAsset) => void;
    createFlashcards: (asset: IncomingAsset) => void;
    attachToDocument?: (asset: IncomingAsset) => void;
  } | null;
  
  setNoteActions: (actions: any) => void;
  setGraphActions: (actions: any) => void;
  setTutorActions: (actions: any) => void;
  setAirRoomActions: (actions: any) => void;
  setAlchemyActions: (actions: any) => void;
}

export const useDndActionStore = create<DndActionStore>((set) => ({
  activeDragItem: null,
  setActiveDragItem: (item) => set({ activeDragItem: item }),
  
  noteActions: null,
  graphActions: null,
  tutorActions: null,
  airRoomActions: null,
  alchemyActions: null,
  
  setNoteActions: (actions) => set({ noteActions: actions }),
  setGraphActions: (actions) => set({ graphActions: actions }),
  setTutorActions: (actions) => set({ tutorActions: actions }),
  setAirRoomActions: (actions) => set({ airRoomActions: actions }),
  setAlchemyActions: (actions) => set({ alchemyActions: actions }),
}));
