import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InteractionMode } from '../types';

interface LearningSideToolbarProps {
    activeMode: InteractionMode;
    onModeChange: (mode: InteractionMode) => void;
    className?: string;
}

interface ToolConfig {
    id: InteractionMode;
    icon: string;
    label: string;
    color: string;
    description: string;
}

const tools: ToolConfig[] = [
    { 
        id: 'linking', 
        icon: 'hub', 
        label: 'Nối Kiến Thức', 
        color: 'text-blue-400', 
        description: 'Kéo thả để tạo liên kết giữa các node'
    },
    { 
        id: 'clustering', 
        icon: 'category', 
        label: 'Tạo Cụm Nhóm', 
        color: 'text-purple-400', 
        description: 'Khoanh vùng các node để tạo nhóm tri thức'
    },
    { 
        id: 'expanding', 
        icon: 'account_tree', 
        label: 'Mở Rộng AI', 
        color: 'text-emerald-400', 
        description: 'Dùng AI để tìm kiếm các khái niệm liên quan'
    }
];

export const LearningSideToolbar: React.FC<LearningSideToolbarProps> = ({ 
    activeMode, 
    onModeChange,
    className = "absolute left-6 top-1/2 -translate-y-1/2"
}) => {
    return (
        <div className={`${className} z-[300] flex flex-col gap-4`}>
            <div className="bg-[#0f172a]/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 flex flex-col gap-4 shadow-2xl shadow-black/50">
                {tools.map((tool) => (
                    <div key={tool.id} className="relative group">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onModeChange(activeMode === tool.id ? 'none' : tool.id)}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                activeMode === tool.id 
                                ? 'bg-white/20 border border-white/30 shadow-lg' 
                                : 'hover:bg-white/5 text-slate-400 hover:text-white'
                            } ${activeMode === tool.id ? tool.color : ''}`}
                        >
                            <span className="material-symbols-outlined text-2xl">{tool.icon}</span>
                        </motion.button>
                        
                        {/* Tooltip */}
                        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-[10px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-2 group-hover:translate-x-0 shadow-xl z-50">
                            <div className={tool.color}>{tool.label}</div>
                            <div className="text-slate-400 font-normal">{tool.description}</div>
                            {/* Arrow */}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-right-slate-900"></div>
                        </div>
                    </div>
                ))}

                <div className="h-px bg-white/10 mx-2 my-1"></div>

                {/* Reset/None Tool */}
                <button
                    onClick={() => onModeChange('none')}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        activeMode === 'none' 
                        ? 'text-cyan-400 bg-white/10' 
                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                    }`}
                    title="Chế độ Học tập"
                >
                    <span className="material-symbols-outlined text-2xl">school</span>
                </button>
            </div>

            {/* Mode Indicator Overlay */}
            <AnimatePresence>
                {activeMode !== 'none' && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="absolute left-full ml-6 top-0 bottom-0 flex items-center pointer-events-none"
                    >
                        <div className="bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-full backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                                    Đang Kích Hoạt Chế Độ {activeMode.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
