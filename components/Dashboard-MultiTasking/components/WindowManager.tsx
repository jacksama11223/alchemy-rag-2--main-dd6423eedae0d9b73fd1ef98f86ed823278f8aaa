import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor, DragOverlay, MeasuringStrategy } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { motion } from 'framer-motion';
import localforage from 'localforage';
import { useMultiTaskStore } from '../store/useMultiTaskStore';
import { Window } from './Window';
import { FloatingBar } from './FloatingBar';

import { useDndActionStore } from '../../../stores/dndActionStore';
import { handleIncomingData } from '../../../utils/dataProcessor';

interface WindowManagerProps {
  renderAppContent: (type: string, isWindow: boolean, closeWindow?: () => void, windowId?: string, windowParams?: any) => React.ReactNode;
}

export const WindowManager: React.FC<WindowManagerProps> = ({ renderAppContent }) => {
  const { windows, loadState, addWindow, removeWindow } = useMultiTaskStore();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    // Load state on mount
    const loadSavedState = async () => {
      try {
        const savedState = await localforage.getItem('workspace_state');
        if (savedState && Array.isArray(savedState)) {
          loadState(savedState);
        }
      } catch (e) {
        console.error('Failed to load workspace state', e);
      }
    };
    loadSavedState();
  }, [loadState]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
    setActiveDragData(event.active.data.current);
    useDndActionStore.getState().setActiveDragItem(event.active.data.current as any);
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
    setActiveDragData(null);
    useDndActionStore.getState().setActiveDragItem(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    setActiveDragData(null);
    useDndActionStore.getState().setActiveDragItem(null);
    const { active, over } = event;
    
    if (active.data.current?.type === 'app-launcher') {
      const appId = active.id as string;
      const appTitle = active.data.current.title;
      
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      
      // Get the final position of the dragged item
      const dropX = active.rect.current.translated?.left || 0;
      const dropY = active.rect.current.translated?.top || 0;
      
      let initialProps: any = {};
      
      // Determine split based on drop position
      if (dropX < screenW / 4) {
        // Dropped on the left quarter
        initialProps = {
          x: 0,
          y: 0,
          width: screenW / 2,
          height: screenH,
          isSplit: 'left'
        };
      } else if (dropX > screenW * 3 / 4) {
        // Dropped on the right quarter
        initialProps = {
          x: screenW / 2,
          y: 0,
          width: screenW / 2,
          height: screenH,
          isSplit: 'right'
        };
      } else if (dropY < screenH / 4) {
        // Dropped on the top quarter
        initialProps = {
          x: 0,
          y: 0,
          width: screenW,
          height: screenH / 2,
          isSplit: 'top'
        };
      } else if (dropY > screenH * 3 / 4) {
        // Dropped on the bottom quarter
        initialProps = {
          x: 0,
          y: screenH / 2,
          width: screenW,
          height: screenH / 2,
          isSplit: 'bottom'
        };
      } else {
        // Dropped in the center
        initialProps = {
          x: screenW / 2 - 400,
          y: screenH / 2 - 300,
          width: 800,
          height: 600,
          isSplit: null
        };
      }
      
      addWindow(appId, appTitle, initialProps);
    } else if (active.data.current?.dataType && over?.data.current?.type) {
        // Handle asset drag and drop
        const asset = active.data.current as any;
        const targetType = over.data.current.type as 'NOTE' | 'GRAPH' | 'TUTOR' | 'AIR_ROOM' | 'ALCHEMY';
        
        const { noteActions, graphActions, tutorActions, airRoomActions, alchemyActions } = useDndActionStore.getState();
        
        let targetActions = null;
        if (targetType === 'NOTE') targetActions = noteActions;
        else if (targetType === 'GRAPH') targetActions = graphActions;
        else if (targetType === 'TUTOR') targetActions = tutorActions;
        else if (targetType === 'AIR_ROOM') targetActions = airRoomActions;
        else if (targetType === 'ALCHEMY') targetActions = alchemyActions;
        
        if (targetActions) {
            const action = over.data.current.action;
            handleIncomingData(asset, targetType, targetActions, action);
        }
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd} 
      onDragCancel={handleDragCancel} 
      modifiers={[restrictToWindowEdges]}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        }
      }}
    >
      {/* Drop zone overlay when dragging an app from launcher */}
      {activeDragId && activeDragData?.type === 'app-launcher' && (
        <div className="fixed inset-0 z-[9990] bg-cyan-900/10 backdrop-blur-sm border-4 border-dashed border-cyan-500/30 flex items-center justify-center pointer-events-none transition-all">
          <p className="text-2xl font-bold text-cyan-400/50">Kéo thả vào đây để mở</p>
        </div>
      )}

      {windows.map((w) => (
        <Window key={w.id} windowState={w}>
          {renderAppContent(w.type, true, () => removeWindow(w.id), w.id, w.params)}
        </Window>
      ))}
      <FloatingBar />

      {createPortal(
        <DragOverlay zIndex={10000} dropAnimation={{
          duration: 250,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeDragId && activeDragData?.type === 'app-launcher' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2 pointer-events-none"
            >
              {/* Glassmorphism Window Preview */}
              <div className="w-64 h-40 rounded-xl bg-[#0f172a]/60 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden">
                <div className="h-8 bg-white/10 border-b border-white/10 flex items-center justify-between px-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-cyan-400">
                      {activeDragData.icon || 'apps'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-300 truncate">
                      {activeDragData.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-50">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="flex-1 relative overflow-hidden bg-white/5">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-[1px]">
                    <span className="material-symbols-outlined text-4xl text-white/30 drop-shadow-lg">
                      {activeDragData.icon || 'apps'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeDragId && activeDragData?.dataType ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl pointer-events-none"
            >
              <span className="material-symbols-outlined text-2xl text-blue-500">
                {activeDragData.dataType === 'FILE_ASSET' ? 'description' : 
                 activeDragData.dataType === 'DRAWING_CANVAS' ? 'draw' : 
                 activeDragData.dataType === 'TEXT_NOTE' ? 'text_snippet' : 'data_object'}
              </span>
              <span className="font-medium text-slate-700 max-w-[200px] truncate">
                {activeDragData.title || 'Đang kéo dữ liệu...'}
              </span>
            </motion.div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};
