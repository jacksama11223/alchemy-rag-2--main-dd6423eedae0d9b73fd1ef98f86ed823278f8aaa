
import React from 'react';

// 21. PullToRefreshRocket
export const PullToRefreshRocket: React.FC = () => (
    <div className="flex justify-center py-4 text-cyan-500 animate-bounce">
        <span className="material-symbols-outlined text-2xl" style={{ transform: 'rotate(-45deg)' }}>rocket_launch</span>
    </div>
);

// 22. BottomSheetDrawer
export const BottomSheetDrawer: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => (
    <div className={`fixed inset-x-0 bottom-0 z-[100] bg-[#1e293b] rounded-t-3xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex justify-center p-2" onClick={onClose}>
            <div className="w-12 h-1.5 bg-slate-600 rounded-full cursor-pointer"></div>
        </div>
        <div className="p-6 grid grid-cols-4 gap-4 text-center">
            {['share', 'download', 'edit', 'delete'].map(icon => (
                <div key={icon} className="flex flex-col items-center gap-2 cursor-pointer hover:text-cyan-400 text-slate-400">
                    <div className="p-3 bg-white/5 rounded-2xl"><span className="material-symbols-outlined">{icon}</span></div>
                    <span className="text-xs capitalize">{icon}</span>
                </div>
            ))}
        </div>
    </div>
);

// 23. SwipeDeckInterface
export const SwipeDeckInterface: React.FC = () => (
    <div className="relative w-64 h-96 mx-auto perspective-1000">
        <div className="absolute inset-0 bg-slate-800 rounded-2xl transform scale-95 translate-y-4 opacity-50 shadow-xl"></div>
        <div className="absolute inset-0 bg-slate-700 rounded-2xl transform scale-[0.98] translate-y-2 opacity-80 shadow-xl"></div>
        <div className="absolute inset-0 bg-[#0f172a] border border-white/20 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-6 text-center cursor-grab active:cursor-grabbing hover:rotate-1 transition-transform">
            <span className="material-symbols-outlined text-4xl text-cyan-400 mb-4">psychology_alt</span>
            <h3 className="text-white font-bold text-lg">Flashcard Mobile</h3>
            <p className="text-slate-400 text-sm mt-2">Vuốt trái để quên, phải để nhớ.</p>
        </div>
    </div>
);

// 24. HapticFeedbackController
// (Logic component - renders a toggle in settings)
export const HapticFeedbackController: React.FC = () => (
    <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
        <span className="text-sm text-slate-300">Rung phản hồi (Haptic)</span>
        <input type="checkbox" className="toggle-checkbox" defaultChecked />
    </div>
);

// 25. OfflineSyncSpinner
export const OfflineSyncSpinner: React.FC<{ active: boolean }> = ({ active }) => {
    if (!active) return null;
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 z-50 backdrop-blur-md border border-white/10">
            <span className="material-symbols-outlined text-sm animate-spin">sync</span>
            Đồng bộ offline...
        </div>
    );
};
