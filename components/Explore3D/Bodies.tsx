
import React from 'react';

// 1. SunNode
export const SunNode: React.FC<{ x: number, y: number, z: number, label: string }> = ({ x, y, z, label }) => (
    <div className="absolute transform-gpu group cursor-pointer" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
        <div className="w-24 h-24 rounded-full bg-yellow-400 shadow-[0_0_100px_rgba(250,204,21,0.8)] animate-pulse flex items-center justify-center">
            <span className="text-black font-black text-xs uppercase tracking-widest">{label}</span>
        </div>
    </div>
);

// 2. MoonNode
export const MoonNode: React.FC<{ parentSize: number }> = ({ parentSize }) => (
    <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-slate-300 rounded-full shadow-[0_0_10px_white] animate-[spin_4s_linear_infinite]" 
         style={{ marginTop: -parentSize/2 - 20, marginLeft: -2 }}>
    </div>
);

// 3. AsteroidBelt
export const AsteroidBelt: React.FC = () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border-[20px] border-dotted border-slate-700/30 animate-[spin-slow_60s_linear_infinite] pointer-events-none"></div>
);

// 4. BlackHoleArchive
export const BlackHoleArchive: React.FC<{ x: number, y: number, z: number }> = ({ x, y, z }) => (
    <div className="absolute transform-gpu" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
        <div className="w-32 h-32 rounded-full bg-black shadow-[0_0_50px_rgba(100,0,255,0.5)] border border-purple-500/50 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_50%,_purple_100%)] animate-spin-slow"></div>
            <span className="text-purple-300 text-[10px] z-10">ARCHIVE</span>
        </div>
    </div>
);

// 5. NebulaCluster
export const NebulaCluster: React.FC<{ x: number, y: number, z: number, color: string }> = ({ x, y, z, color }) => (
    <div className="absolute transform-gpu pointer-events-none" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
        <div className={`w-96 h-96 rounded-full blur-[80px] opacity-20 ${color}`}></div>
    </div>
);

// 6. CometNode
export const CometNode: React.FC = () => (
    <div className="absolute top-0 left-0 w-2 h-2 bg-white rounded-full shadow-[0_0_20px_white] animate-[stream_3s_linear_infinite]">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-1 bg-gradient-to-l from-transparent to-white opacity-50"></div>
    </div>
);

// 7. BinaryStarSystem
export const BinaryStarSystem: React.FC<{ x: number, y: number, z: number }> = ({ x, y, z }) => (
    <div className="absolute transform-gpu animate-[spin_5s_linear_infinite]" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
        <div className="absolute -top-4 w-6 h-6 bg-blue-400 rounded-full shadow-[0_0_20px_blue]"></div>
        <div className="absolute -bottom-4 w-6 h-6 bg-red-400 rounded-full shadow-[0_0_20px_red]"></div>
    </div>
);

// 8. SatelliteStation
export const SatelliteStation: React.FC = () => (
    <div className="absolute -top-10 -right-10 w-8 h-8 border border-slate-400 flex items-center justify-center animate-bounce text-[10px] text-cyan-400 bg-black/50">
        <span className="material-symbols-outlined text-sm">satellite_alt</span>
    </div>
);

// 9. DysonSphereShell
export const DysonSphereShell: React.FC = () => (
    <div className="absolute inset-0 border border-yellow-500/20 rounded-full animate-[spin_20s_linear_infinite] border-dashed"></div>
);

// 10. PulsarBeacon
export const PulsarBeacon: React.FC<{ x: number, y: number, z: number }> = ({ x, y, z }) => (
    <div className="absolute transform-gpu" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
        <div className="w-4 h-4 bg-white rounded-full animate-ping"></div>
        <div className="absolute top-0 left-0 w-4 h-4 bg-red-500 rounded-full"></div>
    </div>
);

// 11. WormholeGate
export const WormholeGate: React.FC<{ x: number, y: number, z: number }> = ({ x, y, z }) => (
    <div className="absolute transform-gpu cursor-pointer group" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
        <div className="w-40 h-40 rounded-full border-4 border-cyan-500/50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <div className="w-36 h-36 rounded-full border-4 border-purple-500/50 animate-spin-slow"></div>
            <div className="absolute text-white font-bold text-xs">JUMP GATE</div>
        </div>
    </div>
);

// 12. GhostNode
export const GhostNode: React.FC<{ x: number, y: number, z: number }> = ({ x, y, z }) => (
    <div className="absolute transform-gpu opacity-30 pointer-events-none" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
        <div className="w-8 h-8 border border-dashed border-white rounded-full flex items-center justify-center">
            ?
        </div>
    </div>
);
