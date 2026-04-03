
import React from 'react';

// 59. PlayerShipAvatar
export const PlayerShipAvatar: React.FC<{ x: number, y: number, z: number, name: string }> = ({ x, y, z, name }) => (
    <div className="absolute transform-gpu pointer-events-none transition-all duration-500" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
        <span className="material-symbols-outlined text-white rotate-90">rocket</span>
        <span className="absolute top-full left-1/2 -translate-x-1/2 text-[8px] text-cyan-300 whitespace-nowrap">{name}</span>
    </div>
);

// 60. CommunicationBuoy
export const CommunicationBuoy: React.FC<{ x: number, y: number, z: number }> = ({ x, y, z }) => (
    <div className="absolute transform-gpu w-4 h-8 bg-orange-500/50 border border-orange-400 rounded-full animate-bounce" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-4 bg-white/50"></div>
    </div>
);

// 61. SignalFlare
export const SignalFlare: React.FC<{ x: number, y: number }> = ({ x, y }) => (
    <div className="absolute w-2 h-20 bg-gradient-to-t from-red-500 to-transparent animate-pulse" style={{ left: x, top: y - 80 }}></div>
);

// 62. MissionObjectiveHUD
export const MissionObjectiveHUD: React.FC = () => (
    <div className="absolute top-24 left-6 pointer-events-auto bg-black/60 p-3 rounded-lg border-l-4 border-yellow-500 w-48">
        <h4 className="text-yellow-500 text-xs font-bold uppercase mb-1">Current Objective</h4>
        <p className="text-white text-[10px]">Explore 3 new star systems.</p>
        <div className="w-full h-1 bg-white/20 mt-2 rounded"><div className="w-1/3 h-full bg-yellow-500 rounded"></div></div>
    </div>
);

// 63. FuelGauge
export const FuelGauge: React.FC = () => (
    <div className="absolute top-48 left-6 w-2 h-24 bg-black/60 rounded-full border border-white/20 overflow-hidden">
        <div className="absolute bottom-0 w-full h-[70%] bg-gradient-to-t from-red-500 to-green-500"></div>
    </div>
);

// 64. DiscoveryXPCounter
export const DiscoveryXPCounter: React.FC = () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-20 text-yellow-400 font-black text-xl animate-bounce shadow-black drop-shadow-md">
        +50 XP
    </div>
);

// 65. RankInsignia3D
export const RankInsignia3D: React.FC = () => (
    <div className="absolute top-6 left-56 w-8 h-8 pointer-events-none perspective-[100px]">
        <div className="w-full h-full bg-yellow-500 rotate-45 border-2 border-white animate-[spin-slow_5s_linear_infinite]"></div>
    </div>
);

// 66. ArtifactContainer
export const ArtifactContainer: React.FC<{ x: number, y: number, z: number }> = ({ x, y, z }) => (
    <div className="absolute transform-gpu cursor-pointer" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
        <div className="w-8 h-6 bg-yellow-600 rounded-sm border border-yellow-300 shadow-[0_0_10px_gold]"></div>
    </div>
);

// 67. SharedWhiteboardPlane
export const SharedWhiteboardPlane: React.FC<{ x: number, y: number, z: number }> = ({ x, y, z }) => (
    <div className="absolute transform-gpu w-64 h-48 bg-white/80 backdrop-blur pointer-events-auto" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
        <div className="text-black text-[10px] p-2">Team Notes...</div>
    </div>
);
