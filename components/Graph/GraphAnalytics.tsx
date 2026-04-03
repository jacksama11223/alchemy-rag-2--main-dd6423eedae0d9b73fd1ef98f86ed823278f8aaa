
import React from 'react';

// 16. GraphStatisticsDashboard
export const GraphStatisticsDashboard: React.FC<{ visible: boolean }> = ({ visible }) => {
    if (!visible) return null;
    return (
        <div className="absolute top-24 left-6 z-30 bg-[#0f172a]/90 border border-white/10 rounded-xl p-4 w-56 shadow-lg backdrop-blur-md animate-fade-in">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Thống Kê Mạng Lưới Tri Thức</h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center bg-white/5 rounded p-2"><div className="text-lg font-bold text-white">124</div><div className="text-[10px] text-slate-500">Khái Niệm</div></div>
                <div className="text-center bg-white/5 rounded p-2"><div className="text-lg font-bold text-white">302</div><div className="text-[10px] text-slate-500">Liên Kết</div></div>
            </div>
            <div className="text-xs text-slate-300">
                <span className="block mb-1">Khái niệm trung tâm: <strong className="text-sky-400">ReactJS</strong></span>
                <span className="block">Độ sâu phân cấp tối đa: <strong className="text-sky-400">5 cấp độ</strong></span>
            </div>
        </div>
    );
};

// 17. HeatmapOverlay
export const HeatmapOverlay: React.FC<{ active: boolean }> = ({ active }) => {
    if (!active) return null;
    // This would ideally be a canvas layer, visually simulated here
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,0,0,0.2) 0%, transparent 60%)' }}></div>
    );
};

// 18. LegendPanel
export const LegendPanel: React.FC = () => (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-6 z-30 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex gap-4 text-[10px] text-slate-300">
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Khái Niệm</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Đã Thành Thạo</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Cần Củng Cố</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Cụm Chủ Đề</div>
    </div>
);

// 19. ClusterBoundaryRenderer
// (Logic component - renders SVGs behind nodes)
export const ClusterBoundaryRenderer: React.FC = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-20">
        <path d="M 200 200 Q 400 100 600 200 T 1000 200" fill="none" stroke="cyan" strokeWidth="2" strokeDasharray="5,5" />
        {/* Mock boundary */}
    </svg>
);
