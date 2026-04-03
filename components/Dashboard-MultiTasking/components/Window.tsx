import React, { useLayoutEffect, useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { useMultiTaskStore, WindowState } from '../store/useMultiTaskStore';
import { WindowContext } from './WindowContext';

interface WindowProps {
  windowState: WindowState;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ windowState, children }) => {
  const { id, title, x, y, width, height, isMinimized, isMaximized, isPiP, zIndex, isSplit } = windowState;
  const { updateWindow, bringToFront, minimizeWindow, removeWindow, togglePiP, toggleMaximize } = useMultiTaskStore();
  const [isDragging, setIsDragging] = useState(false);
  const rndRef = useRef<Rnd>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const currentPreviewState = useRef<string | null>(null);

  const [screenBounds, setScreenBounds] = useState({ w: window.innerWidth, h: window.innerHeight });

  useLayoutEffect(() => {
    const updateBounds = () => {
      setScreenBounds({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  const handleDragStart = () => {
    setIsDragging(true);
    bringToFront(id);
    document.body.classList.add('is-dragging');
  };

  const handleDrag = (e: any, d: any) => {
    // Show preview overlay if near edges
    const screenW = screenBounds.w;
    const screenH = screenBounds.h;
    const threshold = 50;

    let newPreviewState: string | null = null;
    let style = '';

    if (d.x < threshold) {
      newPreviewState = 'left';
      style = 'left: 0; top: 0; width: 50%; height: 100%; opacity: 1;';
    } else if (d.x + Number(width) > screenW - threshold) {
      newPreviewState = 'right';
      style = 'left: 50%; top: 0; width: 50%; height: 100%; opacity: 1;';
    } else if (d.y < threshold) {
      newPreviewState = 'top';
      style = 'left: 0; top: 0; width: 100%; height: 50%; opacity: 1;';
    } else if (d.y + Number(height) > screenH - threshold) {
      newPreviewState = 'bottom';
      style = 'left: 0; top: 50%; width: 100%; height: 50%; opacity: 1;';
    } else {
      style = 'opacity: 0; pointer-events: none;';
    }

    if (currentPreviewState.current !== newPreviewState) {
      currentPreviewState.current = newPreviewState;
      if (previewRef.current) {
        previewRef.current.style.cssText = `position: fixed; z-index: 9998; background-color: rgba(6, 182, 212, 0.2); border: 2px solid rgba(6, 182, 212, 0.5); backdrop-filter: blur(4px); transition: all 0.2s; pointer-events: none; ${style}`;
      }
    }
  };

  const handleDragStop = (e: any, d: any) => {
    setIsDragging(false);
    document.body.classList.remove('is-dragging');
    currentPreviewState.current = null;
    if (previewRef.current) {
      previewRef.current.style.cssText = 'opacity: 0; pointer-events: none;';
    }

    const screenW = screenBounds.w;
    const screenH = screenBounds.h;
    const threshold = 50;

    let newX = d.x;
    let newY = d.y;
    let newW = width;
    let newH = height;
    let split: 'left' | 'right' | 'top' | 'bottom' | null = null;

    if (d.x < threshold) {
      newX = 0; newY = 0; newW = screenW / 2; newH = screenH; split = 'left';
    } else if (d.x + Number(width) > screenW - threshold) {
      newX = screenW / 2; newY = 0; newW = screenW / 2; newH = screenH; split = 'right';
    } else if (d.y < threshold) {
      newX = 0; newY = 0; newW = screenW; newH = screenH / 2; split = 'top';
    } else if (d.y + Number(height) > screenH - threshold) {
      newX = 0; newY = screenH / 2; newW = screenW; newH = screenH / 2; split = 'bottom';
    }

    updateWindow(id, { x: newX, y: newY, width: newW, height: newH, isSplit: split, isMaximized: false });
  };

  const handleResizeStart = () => {
    document.body.classList.add('is-dragging');
  };

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    document.body.classList.remove('is-dragging');
    updateWindow(id, {
      width: ref.style.width,
      height: ref.style.height,
      ...position,
      isSplit: null,
      isMaximized: false,
    });
  };

  const windowStyle: React.CSSProperties = {
    zIndex,
    position: 'fixed',
    willChange: 'transform',
    display: isMinimized ? 'none' : 'flex',
  };

  return (
    <>
      <div ref={previewRef} style={{ opacity: 0, pointerEvents: 'none' }} />

      <Rnd
        ref={rndRef}
        size={{ width, height }}
        position={{ x, y }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragStop={handleDragStop}
        onResizeStart={handleResizeStart}
        onResizeStop={handleResizeStop}
        onMouseDown={() => bringToFront(id)}
        minWidth={300}
        minHeight={200}
        bounds="window"
        cancel=".cancel-drag"
        dragHandleClassName="window-handle"
        disableDragging={isMaximized}
        enableResizing={!isMaximized}
        style={windowStyle}
        className={`shadow-2xl bg-[#0f172a]/95 backdrop-blur-xl flex flex-col transition-shadow ${
          isDragging ? 'shadow-cyan-500/20' : ''
        } ${isMaximized ? 'rounded-none border-none !w-screen !h-screen !top-0 !left-0 !transform-none' : 'rounded-2xl border border-white/10'}`}
      >
        <div ref={setPortalContainer} className="absolute inset-0 pointer-events-none z-[100]" />
        {/* Header */}
        <div className="window-handle h-8 bg-[#1e293b]/80 border-b border-white/10 flex items-center justify-between pl-4 pr-1 cursor-grab active:cursor-grabbing select-none shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">{title}</span>
            {isPiP && <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">PiP</span>}
          </div>
          {/* We hide these buttons because we use FeatureWindowControls inside the app content now */}
          <div className="flex items-center cancel-drag hidden">
            <button onClick={(e) => { e.stopPropagation(); togglePiP(id); }} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors" title="Picture-in-Picture">
              <span className="material-symbols-outlined text-[16px]">{isPiP ? 'fullscreen' : 'picture_in_picture_alt'}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors" title="Minimize">
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors" title="Maximize">
              <span className="material-symbols-outlined text-[16px]">{isMaximized ? 'close_fullscreen' : 'crop_square'}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); removeWindow(id); }} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-red-500 transition-colors" title="Close">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto custom-scrollbar relative rounded-b-2xl">
          {/* Overlay to prevent iframe/content stealing mouse events during drag */}
          {isDragging && <div className="absolute inset-0 z-50" />}
          <WindowContext.Provider value={{
            windowId: id,
            isMaximized: !!isMaximized,
            isPiP,
            minimizeWindow: () => minimizeWindow(id),
            toggleMaximize: () => toggleMaximize(id),
            removeWindow: () => removeWindow(id),
            togglePiP: () => togglePiP(id),
            portalContainer
          }}>
            {children}
          </WindowContext.Provider>
        </div>
      </Rnd>
    </>
  );
};
