
import React from 'react';

// 26. MacroRecorder
export const MacroRecorder: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center gap-1 bg-black/60 rounded-full p-1 border border-white/10 ${className}`}>
        <button className="w-6 h-6 rounded-full bg-red-600/80 hover:bg-red-500 flex items-center justify-center">
            <span className="w-2 h-2 bg-white rounded-full"></span>
        </button>
        <span className="text-[10px] text-slate-400 px-1">REC</span>
    </div>
);

// 27. CustomScriptConsole
export const CustomScriptConsole: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed bottom-0 left-0 w-full h-48 bg-[#0f172a] border-t border-white/10 z-[60] flex flex-col font-mono text-xs">
            <div className="bg-[#1e1e1e] p-2 flex justify-between items-center border-b border-white/5">
                <span className="text-green-400">Console</span>
                <button onClick={onClose}><span className="material-symbols-outlined text-sm text-slate-400">close</span></button>
            </div>
            <div className="flex-1 p-2 text-slate-300 overflow-y-auto">
                <p>&gt; Graph loaded successfully.</p>
                <p>&gt; 124 nodes rendered.</p>
                <div className="flex gap-2 mt-1">
                    <span className="text-blue-400">~</span>
                    <input className="bg-transparent border-none outline-none text-white w-full p-0" placeholder="graph.nodes.forEach(n => ...)" />
                </div>
            </div>
        </div>
    );
};

// 28. RegexSearchBuilder
export const RegexSearchBuilder: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 mt-2 w-96 bg-[#1e1e1e] border border-white/10 rounded-lg p-3 z-40 shadow-xl">
            <div className="flex gap-2 items-center">
                <span className="text-xs font-bold text-slate-400">REGEX</span>
                <input className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-yellow-300 font-mono" placeholder="^Node\d+$" />
            </div>
        </div>
    );
};

// 29. WebhookTriggerSettings
export const WebhookTriggerSettings: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#1e1e1e] p-6 rounded-xl w-96 border border-white/10 relative" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h4 className="text-white font-bold mb-4">Webhook Trigger</h4>
                <input className="w-full bg-black/30 border border-white/10 rounded p-2 text-xs text-white mb-2" placeholder="https://hooks.slack.com/..." />
                <div className="flex gap-2 text-xs text-slate-300">
                    <label><input type="checkbox" /> On Node Create</label>
                    <label><input type="checkbox" /> On Link</label>
                </div>
                <button className="w-full mt-4 py-2 bg-blue-600 rounded text-xs font-bold text-white">Save</button>
            </div>
        </div>
    );
};

// 30. PerformanceMonitor
export const PerformanceMonitor: React.FC = () => (
    <div className="absolute top-2 left-2 z-50 pointer-events-none text-[9px] font-mono text-green-500 bg-black/50 px-1 rounded">
        FPS: 60 | OBJ: 124 | MEM: 24MB
    </div>
);
