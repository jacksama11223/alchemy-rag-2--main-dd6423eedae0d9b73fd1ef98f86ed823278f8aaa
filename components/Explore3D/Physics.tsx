
import React from 'react';

// 47. GravityWellGrid
export const GravityWellGrid: React.FC = () => (
    <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(255,255,255,0.1) 100%)', transform: 'scale(1.2)' }}></div>
);

// 48. CollisionShield
export const CollisionShield: React.FC = () => (
    <div className="absolute inset-0 border-4 border-red-500/20 rounded-lg pointer-events-none animate-pulse"></div>
);

// 49. OrbitPathLine
export const OrbitPathLine: React.FC<{ rx: number, ry: number }> = ({ rx, ry }) => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/10 pointer-events-none" style={{ width: rx*2, height: ry*2 }}></div>
);

// 50. SpringForceVisualizer
export const SpringForceVisualizer: React.FC<{ tension: number }> = ({ tension }) => (
    <div className={`absolute h-1 bg-gradient-to-r from-green-500 to-red-500 opacity-50`} style={{ width: '100px', transform: `scaleX(${tension})` }}></div>
);

// 51. RepulsionFieldArea
export const RepulsionFieldArea: React.FC<{ x: number, y: number }> = ({ x, y }) => (
    <div className="absolute w-40 h-40 rounded-full border border-red-500/10 bg-red-500/5 pointer-events-none" style={{ left: x - 80, top: y - 80 }}></div>
);

// 52. MagneticDockingPort
export const MagneticDockingPort: React.FC<{ x: number, y: number }> = ({ x, y }) => (
    <div className="absolute w-4 h-4 bg-yellow-400/50 rounded-full animate-ping pointer-events-none" style={{ left: x - 8, top: y - 8 }}></div>
);
