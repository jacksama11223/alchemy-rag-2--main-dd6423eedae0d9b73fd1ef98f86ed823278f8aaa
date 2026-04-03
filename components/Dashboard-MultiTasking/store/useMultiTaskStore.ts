import { create } from 'zustand';
import { debounce } from 'lodash';
import localforage from 'localforage';

export interface WindowState {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  isMinimized: boolean;
  isMaximized?: boolean;
  preMaximizeRect?: { x: number; y: number; width: number | string; height: number | string };
  isPiP: boolean;
  zIndex: number;
  isSplit: 'left' | 'right' | 'top' | 'bottom' | null;
  params?: any;
}

interface MultiTaskStore {
  windows: WindowState[];
  activeWindowId: string | null;
  addWindow: (type: string, title: string, initialProps?: Partial<WindowState>) => void;
  removeWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowState>) => void;
  bringToFront: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  togglePiP: (id: string) => void;
  loadState: (state: WindowState[]) => void;
}

// Use localforage for async storage to prevent blocking the main thread
const saveStateToBackend = debounce(async (windows: WindowState[]) => {
  try {
    await localforage.setItem('workspace_state', windows);
  } catch (error) {
    console.error('Failed to save workspace state:', error);
  }
}, 1500);

export const useMultiTaskStore = create<MultiTaskStore>((set, get) => ({
  windows: [],
  activeWindowId: null,

  addWindow: (type, title, initialProps) => {
    const state = get();
    const offset = (state.windows.length % 10) * 30;
    
    const newWindow: WindowState = {
      id: `${type}-${Date.now()}`,
      type,
      title,
      x: initialProps?.x ?? (window.innerWidth / 2 - 200 + offset),
      y: initialProps?.y ?? (window.innerHeight / 2 - 150 + offset),
      width: initialProps?.width ?? 400,
      height: initialProps?.height ?? 300,
      isMinimized: false,
      isPiP: false,
      zIndex: state.windows.length + 1,
      isSplit: initialProps?.isSplit ?? null,
    };
    
    set((state) => {
      const newWindows = [...state.windows, newWindow];
      saveStateToBackend(newWindows);
      return { windows: newWindows, activeWindowId: newWindow.id };
    });
  },

  removeWindow: (id) => {
    set((state) => {
      const newWindows = state.windows.filter((w) => w.id !== id);
      saveStateToBackend(newWindows);
      return { windows: newWindows };
    });
  },

  updateWindow: (id, updates) => {
    set((state) => {
      const newWindows = state.windows.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      );
      saveStateToBackend(newWindows);
      return { windows: newWindows };
    });
  },

  bringToFront: (id) => {
    set((state) => {
      const maxZ = Math.max(...state.windows.map((w) => w.zIndex), 0);
      const newWindows = state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: maxZ + 1 } : w
      );
      saveStateToBackend(newWindows);
      return { windows: newWindows, activeWindowId: id };
    });
  },

  minimizeWindow: (id) => {
    set((state) => {
      const newWindows = state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true, isPiP: false } : w
      );
      saveStateToBackend(newWindows);
      return { windows: newWindows };
    });
  },

  restoreWindow: (id) => {
    set((state) => {
      const maxZ = Math.max(...state.windows.map((w) => w.zIndex), 0);
      const newWindows = state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: false, zIndex: maxZ + 1 } : w
      );
      saveStateToBackend(newWindows);
      return { windows: newWindows, activeWindowId: id };
    });
  },

  toggleMaximize: (id) => {
    set((state) => {
      const maxZ = Math.max(...state.windows.map((w) => w.zIndex), 0);
      const newWindows = state.windows.map((w) => {
        if (w.id === id) {
          const isMaximized = !w.isMaximized;
          if (isMaximized) {
            // Save current state and maximize
            return {
              ...w,
              isMaximized: true,
              isSplit: null,
              preMaximizeRect: { x: w.x, y: w.y, width: w.width, height: w.height },
              x: 0,
              y: 0,
              width: '100vw',
              height: '100vh',
              zIndex: maxZ + 1,
            };
          } else {
            // Restore previous state
            return {
              ...w,
              isMaximized: false,
              x: w.preMaximizeRect?.x ?? w.x,
              y: w.preMaximizeRect?.y ?? w.y,
              width: w.preMaximizeRect?.width ?? w.width,
              height: w.preMaximizeRect?.height ?? w.height,
              zIndex: maxZ + 1,
            };
          }
        }
        return w;
      });
      saveStateToBackend(newWindows);
      return { windows: newWindows, activeWindowId: id };
    });
  },

  togglePiP: (id) => {
    set((state) => {
      const newWindows = state.windows.map((w) => {
        if (w.id === id) {
          const isPiP = !w.isPiP;
          return {
            ...w,
            isPiP,
            isMinimized: false,
            isSplit: isPiP ? null : w.isSplit,
            width: isPiP ? 300 : 400,
            height: isPiP ? 200 : 300,
            x: isPiP ? window.innerWidth - 360 : window.innerWidth / 2 - 200,
            y: isPiP ? window.innerHeight - 220 : window.innerHeight / 2 - 150,
            zIndex: isPiP ? 9999 : w.zIndex,
          };
        }
        return w;
      });
      saveStateToBackend(newWindows);
      return { windows: newWindows };
    });
  },

  loadState: (state) => {
    set({ windows: state });
  },
}));
