import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';

interface ContextualDropZoneProps {
  id: string;
  action: string;
  icon: string;
  text: string;
  isVisible: boolean;
  type: string;
}

export const ContextualDropZone: React.FC<ContextualDropZoneProps> = ({ id, action, icon, text, isVisible, type }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { type, action }
  });

  if (!isVisible) return null;

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-300 w-64 h-48 cursor-pointer ${
        isOver 
          ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] scale-105' 
          : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-300 hover:border-slate-400'
      }`}
    >
      <span className={`material-symbols-outlined text-5xl transition-colors ${isOver ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-400'}`}>
        {icon}
      </span>
      <span className={`font-bold text-center ${isOver ? 'text-cyan-700 dark:text-cyan-100' : 'text-slate-600 dark:text-slate-300'}`}>
        {text}
      </span>
    </motion.div>
  );
};
