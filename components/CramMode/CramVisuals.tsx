import React from 'react';

// 1. Focus Mode Toggle (Pomodoro integration placeholder)
export const FocusTimer: React.FC = () => {
    return (
        <div className="fixed top-20 right-4 bg-black/80 text-white px-3 py-1 rounded-full border border-red-500/50 flex items-center gap-2 shadow-lg z-50">
            <span className="material-symbols-outlined text-red-400 text-sm animate-pulse">timer</span>
            <span className="font-mono text-sm font-bold">24:59</span>
        </div>
    );
};

// 2. Darkroom Mode Toggle
export const DarkroomToggle: React.FC<{ isDarkroom: boolean, onToggle: () => void }> = ({ isDarkroom, onToggle }) => (
    <button 
        onClick={onToggle}
        className={`p-2 rounded-full transition-colors ${isDarkroom ? 'bg-red-600 text-black' : 'bg-white/10 text-slate-400 hover:text-white'}`}
        title="Darkroom Mode (Red Light)"
    >
        <span className="material-symbols-outlined">dark_mode</span>
    </button>
);

// 3. MiniMap
export const MiniMap: React.FC<{ total: number, current: number }> = ({ total, current }) => (
    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
        <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${(current / total) * 100}%` }}></div>
    </div>
);

// 4. Sticky Note
export const StickyNote: React.FC = () => (
    <div className="absolute top-10 right-[-10px] w-32 bg-yellow-200 text-black p-2 shadow-lg rotate-3 text-xs font-handwritten transform hover:scale-110 transition-transform cursor-pointer z-40">
        📌 Đừng quên công thức Euler!
    </div>
);
