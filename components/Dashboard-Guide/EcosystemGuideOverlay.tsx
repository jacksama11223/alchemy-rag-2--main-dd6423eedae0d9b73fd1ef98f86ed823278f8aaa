import React, { useState } from 'react';
import Xarrow from 'react-xarrows';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuideStore } from '../../store/useGuideStore';
import { ECOSYSTEM_CONNECTIONS } from './guideData';

export const EcosystemGuideOverlay: React.FC = () => {
  const { isGuideEnabled, hoveredFeature } = useGuideStore();
  const [activePopover, setActivePopover] = useState<string | null>(null);

  if (!isGuideEnabled || !hoveredFeature) return null;

  const connections = ECOSYSTEM_CONNECTIONS[hoveredFeature] || [];
  const activeConnection = connections.find(c => c.target === activePopover);

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 pointer-events-none"
        />
      </AnimatePresence>

      <div className="absolute inset-0 z-40 pointer-events-none">
        {connections.map((conn, idx) => (
          <React.Fragment key={`${hoveredFeature}-${conn.target}-${idx}`}>
            <Xarrow
              start={`feature-${hoveredFeature}`}
              end={`feature-${conn.target}`}
              color={conn.color}
              strokeWidth={3}
              path="smooth"
              dashness={{ strokeLen: 10, nonStrokeLen: 5, animation: -2 }}
              headSize={6}
              passProps={{
                className: 'pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity',
                onClick: () => setActivePopover(activePopover === conn.target ? null : conn.target)
              }}
              labels={{
                middle: (
                  <div 
                    className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-slate-200 pointer-events-auto cursor-pointer hover:scale-105 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePopover(activePopover === conn.target ? null : conn.target);
                    }}
                  >
                    {activePopover === conn.target ? 'Đóng' : 'Xem liên kết'}
                  </div>
                )
              }}
            />
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence>
        {activeConnection && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[400px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto"
          >
            <div className={`p-4 text-white ${activeConnection.color === '#3b82f6' ? 'bg-blue-500' : activeConnection.color === '#10b981' ? 'bg-green-500' : activeConnection.color === '#f59e0b' ? 'bg-amber-500' : activeConnection.color === '#8b5cf6' ? 'bg-purple-500' : 'bg-slate-800'}`}>
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined">route</span>
                  Hướng dẫn lộ trình
                </h3>
                <button onClick={() => setActivePopover(null)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-700 leading-relaxed mb-4">{activeConnection.text}</p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Cách sử dụng:</h4>
                <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                  <li>Nhấp vào tính năng gốc để bắt đầu.</li>
                  <li>Sử dụng dữ liệu từ tính năng này để chuyển sang bước tiếp theo.</li>
                  <li>Bạn có thể mở cả hai tính năng cùng lúc bằng cách kéo thả chúng vào không gian làm việc.</li>
                </ul>
              </div>
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => {
                    setActivePopover(null);
                    useGuideStore.getState().toggleGuide();
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl transition-colors text-sm"
                >
                  Bỏ qua lần sau
                </button>
                <button 
                  onClick={() => setActivePopover(null)}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors text-sm shadow-md"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
