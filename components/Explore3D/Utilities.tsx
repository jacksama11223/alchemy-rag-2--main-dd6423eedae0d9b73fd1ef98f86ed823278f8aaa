
import React from 'react';

// 75. TutorialDroidUnit
export const TutorialDroidUnit: React.FC = () => (
    <div className="absolute bottom-32 left-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce pointer-events-auto cursor-pointer">
        <span className="material-symbols-outlined text-black">smart_toy</span>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
    </div>
);

// 76. SpaceTimeClock
export const SpaceTimeClock: React.FC = () => (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/40 px-4 py-1 rounded-full border border-cyan-500/30 text-cyan-400 font-mono text-xs">
        T-MINUS 02:00:00
    </div>
);

// 77. ScreenshotDrone
export const ScreenshotDrone: React.FC = () => (
    <button className="absolute bottom-24 right-64 pointer-events-auto p-2 bg-white/10 hover:bg-white/20 rounded-full text-white" title="Take Photo">
        <span className="material-symbols-outlined text-sm">photo_camera</span>
    </button>
);

// 78. DimensionPortalSelector
export const DimensionPortalSelector: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => (
    <button onClick={onSwitch} className="absolute top-24 left-6 pointer-events-auto flex items-center gap-2 bg-purple-900/50 hover:bg-purple-800/50 px-3 py-1.5 rounded-lg border border-purple-500/30">
        <span className="material-symbols-outlined text-sm text-purple-300">layers</span>
        <span className="text-xs text-purple-100">2D View</span>
    </button>
);

// 79. CreditsRollingText
export const CreditsRollingText: React.FC<{ active: boolean }> = ({ active }) => {
    if (!active) return null;
    return (
        <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-10 perspective-[300px]">
            <div className="text-yellow-500 text-center font-bold text-xs animate-[rise-fade_10s_linear_forwards] transform rotate-x-20">
                Architect: You<br/>Engineer: AI
            </div>
        </div>
    );
};

// 80. NotificationOrb
export const NotificationOrb: React.FC<{ message: string }> = ({ message }) => (
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none bg-blue-500/20 backdrop-blur border border-blue-400 rounded-full px-6 py-2 text-white text-sm shadow-[0_0_20px_blue] animate-fade-in-up">
        {message}
    </div>
);

// 81. ThemeCrystal
export const ThemeCrystal: React.FC = () => (
    <button className="absolute bottom-6 left-64 w-8 h-8 bg-gradient-to-tr from-pink-500 to-yellow-500 rotate-45 shadow-lg hover:rotate-90 transition-transform"></button>
);

// 82. DistanceRuler
export const DistanceRuler: React.FC = () => (
    <div className="absolute left-6 bottom-1/2 w-1 h-32 bg-white/20 flex flex-col justify-between">
        <div className="w-2 h-[1px] bg-white"></div>
        <div className="w-2 h-[1px] bg-white"></div>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-white/50 -rotate-90">100 AU</div>
    </div>
);

// 83. ClusterLabel3D
export const ClusterLabel3D: React.FC<{ x: number, y: number, z: number, label: string }> = ({ x, y, z, label }) => (
    <div className="absolute transform-gpu text-white/50 text-[100px] font-black pointer-events-none whitespace-nowrap" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
        {label}
    </div>
);

// 84. ZenModeButton (Redundant with Header but kept for list completeness)
export const ZenModeButtonUtility: React.FC = () => null;

// 85. LogoutAirlock
export const LogoutAirlock: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
    <button onClick={onLogout} className="absolute bottom-6 right-6 pointer-events-auto flex items-center gap-2 px-4 py-2 bg-red-900/50 border border-red-500/30 rounded-lg hover:bg-red-800/50 text-red-100 text-xs font-bold transition-colors">
        <span className="material-symbols-outlined text-sm">door_open</span>
        AIRLOCK (EXIT)
    </button>
);
