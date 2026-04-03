
import React from 'react';

// 68. LODController
export const LODController: React.FC = () => (
    <div className="absolute bottom-6 left-64 pointer-events-auto bg-black/60 px-2 py-1 rounded border border-white/10 text-[9px] text-slate-400">
        LOD: HIGH
    </div>
);

// 69. FPSCounterHUD
export const FPSCounterHUD: React.FC = () => (
    <div className="absolute top-2 right-2 pointer-events-none text-green-500 font-mono text-[10px]">
        60 FPS
    </div>
);

// 70. MemoryUsageBar
export const MemoryUsageBar: React.FC = () => (
    <div className="absolute top-6 right-2 w-20 h-1 bg-slate-800 rounded overflow-hidden">
        <div className="w-[40%] h-full bg-blue-500"></div>
    </div>
);

// 71. QualitySettingsGear
export const QualitySettingsGear: React.FC = () => (
    <button className="absolute top-10 right-2 pointer-events-auto text-slate-500 hover:text-white">
        <span className="material-symbols-outlined text-sm">settings</span>
    </button>
);

// 72. ErrorGlitchOverlay
export const ErrorGlitchOverlay: React.FC<{ active: boolean }> = ({ active }) => {
    if (!active) return null;
    return (
        <div className="absolute inset-0 z-[100] bg-red-900/20 mix-blend-multiply flex items-center justify-center">
            <div className="text-red-500 font-mono font-bold animate-pulse">SYSTEM FAILURE</div>
        </div>
    );
};

// 73. LoadingWarpTunnel
export const LoadingWarpTunnel: React.FC<{ active: boolean }> = ({ active }) => {
    if (!active) return null;
    return (
        <div className="absolute inset-0 z-[100] bg-black flex items-center justify-center">
            <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0deg,white_10deg,transparent_20deg)] animate-[spin_0.2s_linear_infinite] opacity-10"></div>
            <div className="absolute text-cyan-500 font-bold tracking-[10px]">LOADING SECTOR...</div>
        </div>
    );
};

// 74. CacheStatusIndicator
export const CacheStatusIndicator: React.FC = () => (
    <div className="absolute bottom-2 right-2 flex items-center gap-1">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
        <span className="text-[8px] text-slate-500">OFFLINE READY</span>
    </div>
);
