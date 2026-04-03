import React, { createContext, useContext } from 'react';

interface WindowContextType {
  windowId: string;
  isMaximized: boolean;
  isPiP: boolean;
  minimizeWindow: () => void;
  toggleMaximize: () => void;
  removeWindow: () => void;
  togglePiP: () => void;
  portalContainer: HTMLElement | null;
}

export const WindowContext = createContext<WindowContextType | null>(null);

export const useWindowContext = () => useContext(WindowContext);
