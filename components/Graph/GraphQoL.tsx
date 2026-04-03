
import React from 'react';

// 26. ZenModeButton
export const ZenModeButton: React.FC<{ active: boolean, onToggle: () => void }> = ({ active, onToggle }) => (
    <button 
        onClick={onToggle}
        className={`p-2 rounded-full border transition-all ${active ? 'bg-white text-black shadow-[0_0_15px_white]' : 'bg-[#1e1e1e] text-slate-400 border-white/10 hover:text-white'}`}
        title="Zen Mode"
    >
        <span className="material-symbols-outlined text-lg">self_improvement</span>
    </button>
);

// 27. FontResizerSlider
export const FontResizerSlider: React.FC<{ value: number, onChange: (val: number) => void }> = ({ value, onChange }) => (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] rounded-lg border border-white/10">
        <span className="text-[10px] text-slate-400">A</span>
        <input 
            type="range" 
            min="10" max="30" 
            value={value} 
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white" 
        />
        <span className="text-sm text-white font-bold">A</span>
    </div>
);

// 28. ColorBlindMode
export const ColorBlindMode: React.FC<{ active: boolean, onToggle: () => void }> = ({ active, onToggle }) => (
    <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:bg-white/5 rounded cursor-pointer" onClick={onToggle}>
        <span>Chế độ mù màu</span>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-blue-600' : 'bg-slate-600'}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-4.5' : 'left-0.5'}`}></div>
        </div>
    </div>
);

// 29. SnapToGridToggle
export const SnapToGridToggle: React.FC<{ active: boolean, onToggle: () => void }> = ({ active, onToggle }) => (
    <button 
        onClick={onToggle}
        className={`p-2 rounded-lg border transition-all ${active ? 'bg-blue-600/20 text-blue-300 border-blue-500/50' : 'bg-transparent text-slate-400 border-transparent hover:bg-white/5'}`}
        title="Snap to Grid"
    >
        <span className="material-symbols-outlined text-lg">grid_4x4</span>
    </button>
);

// 30. QuickEmojiReaction
export const QuickEmojiReaction: React.FC<{ x: number, y: number, visible: boolean }> = ({ x, y, visible }) => {
    if (!visible) return null;
    return (
        <div className="absolute z-50 flex gap-1 bg-[#1e1e1e] p-1.5 rounded-full border border-white/20 shadow-lg animate-scale-in" style={{ left: x, top: y }}>
            {['❤️', '👍', '🔥', '💡', '❓'].map(e => (
                <button key={e} className="hover:scale-125 transition-transform text-lg p-1">{e}</button>
            ))}
        </div>
    );
};
