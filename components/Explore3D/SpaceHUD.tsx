
import React from 'react';

interface SpaceHUDProps {
    speedMultiplier: number;
    visible: boolean;
}

export const SpaceHUD: React.FC<SpaceHUDProps> = ({ speedMultiplier, visible }) => {
    if (!visible) return null;

    return (
        <div className="absolute bottom-24 left-6 flex flex-col gap-2 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs text-slate-400 pointer-events-none w-72 animate-[slideInUp_0.5s]">
            <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                <span className="font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">explore</span> Hệ Thống Dẫn Đường
                </span>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-blue-300 font-bold">Trục Ngang (X)</span> 
                    <span className="text-white">Dòng Thời Gian</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-purple-300 font-bold">Trục Dọc (Y)</span> 
                    <span className="text-white">Độ Phức Tạp</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-red-300 font-bold">Độ Sâu (Z)</span> 
                    <span className="text-white">Mức Độ Thuộc Bài</span>
                </div>
            </div>
            
            <div className="mt-2 pt-2 text-[10px] text-slate-500 italic">
                <p>• Dùng <kbd className="bg-white/10 px-1 rounded text-white">W, A, S, D</kbd> để di chuyển camera.</p>
                <p>• Giữ <kbd className="bg-white/10 px-1 rounded text-white">Shift</kbd> để tăng tốc động cơ warp.</p>
            </div>

            <div className="mt-2">
                <div className="flex justify-between text-[10px] text-sky-300 mb-1">
                    <span>ENGINE POWER</span>
                    <span>{speedMultiplier}x</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-300 ${speedMultiplier > 1 ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-sky-500'}`} 
                        style={{ width: `${(speedMultiplier / 5) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};
