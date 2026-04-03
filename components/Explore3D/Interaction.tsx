
import React from 'react';

// 36. TractorBeamCursor
export const TractorBeamCursor: React.FC<{ x: number, y: number }> = ({ x, y }) => (
    <div className="fixed pointer-events-none z-[60]" style={{ left: x, top: y }}>
        <div className="w-0.5 h-screen bg-gradient-to-b from-cyan-500/50 to-transparent -translate-y-full"></div>
        <div className="w-8 h-8 border-2 border-cyan-500 rounded-full -translate-x-1/2 -translate-y-1/2 animate-ping opacity-20"></div>
    </div>
);

// 37. HoloContextMenu
export const HoloContextMenu: React.FC<{ x: number, y: number, visible: boolean }> = ({ x, y, visible }) => {
    if (!visible) return null;
    return (
        <div className="absolute z-50 pointer-events-auto" style={{ left: x, top: y }}>
            <div className="relative">
                <button className="absolute -top-12 -left-4 bg-black/80 border border-cyan-500/50 text-cyan-300 text-[10px] px-2 py-1 rounded hover:bg-cyan-900/50">Info</button>
                <button className="absolute -top-4 right-8 bg-black/80 border border-green-500/50 text-green-300 text-[10px] px-2 py-1 rounded hover:bg-green-900/50">Warp</button>
                <button className="absolute top-8 -left-4 bg-black/80 border border-red-500/50 text-red-300 text-[10px] px-2 py-1 rounded hover:bg-red-900/50">Scan</button>
                <div className="w-20 h-20 border border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 animate-spin-slow"></div>
            </div>
        </div>
    );
};

// 38. QuickTagBlaster
export const QuickTagBlaster: React.FC = () => (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto bg-black/80 p-2 rounded-full border border-white/20 flex gap-2">
        <span className="text-white text-xs font-bold px-2 py-1">TAG:</span>
        {['React', 'AI', 'Design'].map(t => (
            <button key={t} className="bg-white/10 hover:bg-cyan-600 px-2 py-1 rounded text-[10px] text-white transition-colors">{t}</button>
        ))}
    </div>
);

// 39. LinkBuilderRope
export const LinkBuilderRope: React.FC<{ x1: number, y1: number, x2: number, y2: number }> = ({ x1, y1, x2, y2 }) => (
    <svg className="fixed inset-0 pointer-events-none z-50">
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="yellow" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
    </svg>
);

// 40. MeasurementLaser
export const MeasurementLaser: React.FC = () => (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded border border-green-500/30 text-green-400 text-xs font-mono">
        DIST: 450.2 AU
    </div>
);

// 41. SearchHoloKeyboard
export const SearchHoloKeyboard: React.FC<{ visible: boolean }> = ({ visible }) => {
    if (!visible) return null;
    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-96 bg-cyan-900/20 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl transform perspective-[500px] rotate-x-20 pointer-events-auto">
            <input className="w-full bg-transparent border-b border-cyan-400 text-cyan-200 outline-none text-center font-mono" placeholder="SEARCH DATABASE..." autoFocus />
        </div>
    );
};

// 42. SelectionBoundingBox
export const SelectionBoundingBox: React.FC = () => (
    <div className="absolute border-2 border-dashed border-yellow-400 bg-yellow-400/10 pointer-events-none z-40" style={{ left: 100, top: 100, width: 200, height: 150 }}></div>
);

// 43. ObjectManipulator
export const ObjectManipulator: React.FC<{ x: number, y: number }> = ({ x, y }) => (
    <div className="absolute pointer-events-auto z-50" style={{ left: x, top: y }}>
        <div className="w-1 h-12 bg-green-500 absolute -top-12 left-0 cursor-ns-resize"></div> {/* Y */}
        <div className="w-12 h-1 bg-red-500 absolute top-0 left-0 cursor-ew-resize"></div> {/* X */}
        <div className="w-8 h-8 border-2 border-blue-500 rounded-full absolute -top-4 -left-4"></div> {/* Rotate */}
    </div>
);

// 44. FilterPrismObject
export const FilterPrismObject: React.FC = () => (
    <div className="absolute top-1/2 left-10 w-16 h-32 bg-white/10 backdrop-blur-lg border border-white/30 transform -skew-y-12 pointer-events-none"></div>
);

// 45. DetailInspectorPanel
export const DetailInspectorPanel: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <div className={`fixed right-0 top-20 bottom-20 w-80 bg-[#02041a]/90 border-l border-cyan-500/30 transition-transform duration-300 z-50 p-6 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <h3 className="text-cyan-400 font-bold text-lg mb-4">DATA ANALYSIS</h3>
        <div className="space-y-4 text-slate-300 text-xs">
            <div className="bg-black/40 p-2 rounded border border-white/10">Type: Celestial Body</div>
            <div className="bg-black/40 p-2 rounded border border-white/10">Mass: 4.2e24 kg</div>
            <div className="h-32 bg-slate-800 rounded animate-pulse"></div>
        </div>
    </div>
);

// 46. VoiceCommandVisualizer
export const VoiceCommandVisualizer: React.FC<{ active: boolean }> = ({ active }) => {
    if (!active) return null;
    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1 z-50">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 bg-cyan-400 animate-[wave_1s_ease-in-out_infinite]" style={{ height: Math.random() * 20 + 10 + 'px' }}></div>
            ))}
        </div>
    );
};
