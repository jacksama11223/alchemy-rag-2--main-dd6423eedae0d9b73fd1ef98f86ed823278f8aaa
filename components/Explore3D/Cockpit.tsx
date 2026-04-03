
import React from 'react';

// 13. CockpitOverlay
export const CockpitOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="absolute inset-0 pointer-events-none z-40 border-[20px] border-black/80 rounded-[3rem] shadow-[inset_0_0_100px_black]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-12 bg-black/80 rounded-b-2xl border-b border-white/10 flex items-center justify-center text-cyan-500 text-xs font-mono">
            SYS: ONLINE
        </div>
        {children}
    </div>
);

// 14. RadarScreen
export const RadarScreen: React.FC = () => (
    <div className="absolute bottom-6 right-6 w-32 h-32 bg-black/80 rounded-full border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)] flex items-center justify-center overflow-hidden pointer-events-auto">
        <div className="absolute inset-0 border border-green-900/50 rounded-full scale-50"></div>
        <div className="absolute w-full h-[1px] bg-green-900/50"></div>
        <div className="absolute h-full w-[1px] bg-green-900/50"></div>
        <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(34,197,94,0.3)_360deg)] animate-[spin_2s_linear_infinite]"></div>
        {/* Blips */}
        <div className="absolute top-10 left-20 w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-8 right-10 w-1 h-1 bg-blue-500 rounded-full"></div>
    </div>
);

// 15. GyroscopeWidget
export const GyroscopeWidget: React.FC = () => (
    <div className="absolute bottom-6 right-44 w-16 h-16 bg-black/60 rounded-full border border-white/20 flex items-center justify-center pointer-events-auto">
        <div className="w-12 h-12 border border-white/10 rounded-full relative animate-spin-slow" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(60deg)' }}>
            <div className="absolute inset-0 border border-cyan-500/50 rounded-full" style={{ transform: 'rotateY(90deg)' }}></div>
        </div>
    </div>
);

// 16. WarpDriveButton
export const WarpDriveButton: React.FC = () => (
    <button className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto bg-red-600/80 hover:bg-red-500 text-white px-8 py-2 rounded-t-xl font-black uppercase tracking-widest border-t-2 border-red-400 shadow-[0_-5px_20px_red] transition-all active:scale-95">
        WARP
    </button>
);

// 17. FOVController
export const FOVController: React.FC = () => (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 h-48 w-2 bg-slate-800 rounded-full pointer-events-auto flex flex-col justify-end group">
        <div className="w-full h-1/2 bg-cyan-500 rounded-full relative">
            <div className="absolute -top-2 -left-1 w-4 h-4 bg-white rounded-full shadow-lg cursor-ns-resize group-hover:scale-125 transition-transform"></div>
        </div>
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] text-cyan-500 -rotate-90 opacity-0 group-hover:opacity-100 font-bold">ZOOM</span>
    </div>
);

// 18. AutoPilotToggle
export const AutoPilotToggle: React.FC = () => (
    <div className="absolute top-24 right-6 pointer-events-auto flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase">Auto-Pilot</span>
        <div className="w-8 h-4 bg-slate-700 rounded-full relative cursor-pointer">
            <div className="absolute left-0 top-0 w-4 h-4 bg-slate-400 rounded-full border border-black transition-all"></div>
        </div>
    </div>
);

// 19. CameraResetThruster
export const CameraResetThruster: React.FC = () => (
    <button className="absolute bottom-24 right-6 pointer-events-auto p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white border border-white/10">
        <span className="material-symbols-outlined text-sm">center_focus_strong</span>
    </button>
);

// 20. LookAtTargetReticle
export const LookAtTargetReticle: React.FC = () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-cyan-500/50 rounded-full flex items-center justify-center pointer-events-none">
        <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
        <div className="absolute top-0 w-0.5 h-2 bg-cyan-500"></div>
        <div className="absolute bottom-0 w-0.5 h-2 bg-cyan-500"></div>
        <div className="absolute left-0 h-0.5 w-2 bg-cyan-500"></div>
        <div className="absolute right-0 h-0.5 w-2 bg-cyan-500"></div>
    </div>
);

// 21. BookmarkStarMap
export const BookmarkStarMap: React.FC = () => (
    <div className="absolute top-40 left-6 pointer-events-auto bg-black/60 p-2 rounded-lg border border-white/10 w-10 hover:w-48 transition-all overflow-hidden group">
        <span className="material-symbols-outlined text-yellow-400 mb-2">star</span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
            <div className="text-[10px] text-white cursor-pointer hover:text-yellow-300 truncate">• Alpha Centauri (React)</div>
            <div className="text-[10px] text-white cursor-pointer hover:text-yellow-300 truncate">• Kepler-186f (Design)</div>
        </div>
    </div>
);

// 22. FlightPathTracer
export const FlightPathTracer: React.FC = () => (
    <svg className="absolute inset-0 pointer-events-none z-0 opacity-20">
        <path d="M 100 100 Q 400 300 800 100" fill="none" stroke="cyan" strokeWidth="2" strokeDasharray="5,5" />
    </svg>
);

// 23. OrbitControlGizmo
export const OrbitControlGizmo: React.FC = () => (
    <div className="absolute top-24 right-20 w-16 h-16 pointer-events-auto cursor-move opacity-70 hover:opacity-100 transition-opacity">
        <div className="relative w-full h-full border-2 border-slate-600 rounded-full flex items-center justify-center">
            <div className="w-1 h-8 bg-green-500 absolute"></div>
            <div className="w-8 h-1 bg-red-500 absolute"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full z-10"></div>
        </div>
    </div>
);

// 24. SpeedThrottleLever
export const SpeedThrottleLever: React.FC = () => (
    <div className="absolute bottom-6 right-64 w-32 h-8 bg-slate-800 rounded-lg pointer-events-auto relative border border-white/10">
        <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-green-500 to-red-500 opacity-20 w-full rounded-lg"></div>
        <div className="absolute top-[-4px] left-1/2 w-4 h-10 bg-slate-300 rounded shadow-lg cursor-ew-resize border border-black"></div>
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400">THRUST</span>
    </div>
);
