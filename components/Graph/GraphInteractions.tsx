
import React, { useState } from 'react';

// 16. VoiceCommandListener
export const VoiceCommandListener: React.FC = () => (
    <div className="relative group">
        <button className="w-10 h-10 bg-red-600/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse transition-colors">
            <span className="material-symbols-outlined text-lg">mic</span>
        </button>
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            Listening... ("Zoom in", "Search")
        </div>
    </div>
);

// 17. GesturePad
export const GesturePad: React.FC<{ active: boolean }> = ({ active }) => {
    if (!active) return null;
    return (
        <div className="absolute inset-0 z-40 bg-black/10 cursor-crosshair flex items-center justify-center pointer-events-none">
            <div className="border-2 border-dashed border-white/30 rounded-lg p-8">
                <span className="text-white/50 text-2xl font-bold">Draw Gesture Here</span>
            </div>
        </div>
    );
};

// 18. DragDropZone (Desktop)
export const DragDropZone: React.FC = () => (
    <div className="absolute inset-0 z-50 bg-blue-500/10 border-4 border-blue-500/50 border-dashed m-4 rounded-3xl flex items-center justify-center backdrop-blur-sm pointer-events-none opacity-0 transition-opacity dragging-active">
        <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-blue-300">cloud_upload</span>
            <h2 className="text-2xl font-bold text-blue-100 mt-4">Drop files to import</h2>
        </div>
    </div>
);

// 19. ZenAudioPlayer
export const ZenAudioPlayer: React.FC = () => {
    const [playing, setPlaying] = useState(false);
    return (
        <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2 bg-[#1e1e1e] border border-white/10 rounded-full p-1 pr-3 shadow-lg">
            <button 
                onClick={() => setPlaying(!playing)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${playing ? 'bg-green-500' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
                <span className="material-symbols-outlined text-sm">{playing ? 'pause' : 'play_arrow'}</span>
            </button>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-300">Lofi Focus</span>
                <span className="text-[8px] text-slate-500">Chill Beats</span>
            </div>
        </div>
    );
};

// 20. EyeTrackingCursor (Experimental)
export const EyeTrackingCursor: React.FC<{ active: boolean }> = ({ active }) => {
    if (!active) return null;
    return (
        <div className="fixed w-10 h-10 border-2 border-cyan-400 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[100] transition-all duration-100 opacity-50" style={{ left: '50%', top: '50%' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-cyan-400 rounded-full"></div>
        </div>
    );
};
