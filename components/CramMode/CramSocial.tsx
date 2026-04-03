import React from 'react';

// 1. SOS Signal
export const SosSignal: React.FC = () => (
    <button className="flex items-center gap-2 px-3 py-2 bg-red-900/30 text-red-300 border border-red-500/50 rounded-lg hover:bg-red-900/50 transition-colors">
        <span className="material-symbols-outlined text-lg animate-pulse">sos</span> Cầu cứu bạn bè
    </button>
);

// 2. Export PDF
export const ExportPdfBtn: React.FC = () => (
    <button className="flex items-center gap-2 px-3 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
        <span className="material-symbols-outlined text-lg">picture_as_pdf</span> Xuất Cheat Sheet
    </button>
);

// 3. Leaderboard Preview
export const MiniLeaderboard: React.FC = () => (
    <div className="mt-4 p-3 bg-white/5 rounded-lg">
        <h5 className="text-[10px] text-slate-400 font-bold uppercase mb-2">BXH Vườn Xanh</h5>
        <div className="space-y-1 text-xs">
            <div className="flex justify-between text-yellow-400"><span>1. Minh</span> <span>98%</span></div>
            <div className="flex justify-between text-slate-300"><span>2. Bạn</span> <span>45%</span></div>
        </div>
    </div>
);
