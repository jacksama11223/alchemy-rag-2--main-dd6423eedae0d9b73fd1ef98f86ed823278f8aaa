import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import { useMultiTaskStore } from '../store/useMultiTaskStore';

const DraggableAppIcon: React.FC<{ app: { id: string, title: string, icon: string }, onClick: () => void }> = ({ app, onClick }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: app.id,
    data: {
      type: 'app-launcher',
      title: app.title,
      icon: app.icon,
    },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 group ${isDragging ? 'opacity-0' : ''}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/50 flex items-center justify-center transition-all shadow-lg">
        <span className="material-symbols-outlined text-2xl text-slate-300 group-hover:text-cyan-400">
          {app.icon}
        </span>
      </div>
      <span className="text-xs text-slate-400 group-hover:text-white whitespace-nowrap">
        {app.title}
      </span>
    </button>
  );
};

const FloatingBarComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { windows, addWindow, restoreWindow } = useMultiTaskStore();

  const minimizedWindows = windows.filter((w) => w.isMinimized);

  const apps = [
    { id: 'alchemy', title: 'Tổng Hợp & Xử Lý Tri Thức', icon: 'science' },
    { id: 'knowledge-graph', title: 'Trực Quan Hóa Mạng Lưới', icon: 'hub' },
    { id: 'tutor', title: 'Trợ Lý Nghiên Cứu AI', icon: 'smart_toy' },
    { id: 'draw', title: 'Không Gian Tư Duy Sáng Tạo', icon: 'draw' },
    { id: 'media', title: 'Hệ Thống Ghi Chú Kỹ Thuật Số', icon: 'edit_note' },
    { id: 'digest', title: 'Lộ Trình & Tiến Độ Nghiên Cứu', icon: 'checklist' },
    { id: 'drive', title: 'Kho Lưu Trữ Dữ Liệu', icon: 'folder_open' },
    { id: 'community', title: 'Mạng Lưới Cộng Đồng Nghiên Cứu', icon: 'diversity_3' },
  ];

  const getIconForApp = (type: string) => {
    const app = apps.find(a => a.id === type);
    return app ? app.icon : 'apps';
  };

  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 pointer-events-auto"
    >
      <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl p-2 flex items-center gap-2">
        {/* Minimized Windows */}
        {minimizedWindows.map((w) => (
          <button
            key={w.id}
            onClick={() => restoreWindow(w.id)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors relative group"
            title={w.title}
          >
            <span className="material-symbols-outlined text-sm">
              {getIconForApp(w.type)}
            </span>
            <span className="absolute -top-8 bg-black/80 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {w.title}
            </span>
          </button>
        ))}

        {minimizedWindows.length > 0 && <div className="w-px h-6 bg-white/20 mx-1" />}

        {/* Add Button */}
        <div className="relative">
          <button
            draggable={false}
            onClick={() => setIsOpen(!isOpen)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all ${
              isOpen ? 'bg-cyan-500 rotate-45' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <span className="material-symbols-outlined text-2xl pointer-events-none">add</span>
          </button>

          {/* App Launcher Popup */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex gap-4 max-w-[90vw] overflow-x-auto custom-scrollbar"
              >
                {apps.map((app) => (
                  <DraggableAppIcon
                    key={app.id}
                    app={app}
                    onClick={() => {
                      addWindow(app.id, app.title);
                      setIsOpen(false);
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export const FloatingBar = memo(FloatingBarComponent);
