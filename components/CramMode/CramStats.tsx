import React from 'react';

interface CramStatsProps {
    totalNodes: number;
    weakNodesCount: number;
    isGenerating: boolean;
    onGenerate: () => void;
    isReviving: boolean;
    onRevive: () => void;
    hasCheatSheet: boolean;
    onBack: () => void;
}

export const CramStats: React.FC<CramStatsProps> = ({ 
    totalNodes, weakNodesCount, isGenerating, onGenerate, isReviving, onRevive, hasCheatSheet, onBack 
}) => {
    const weakPercentage = totalNodes > 0 ? (weakNodesCount / totalNodes) * 100 : 0;

    return (
        <div className="w-full lg:w-1/3 flex flex-col gap-6 animate-fade-in-up">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors w-fit">
                <span className="material-symbols-outlined">arrow_back</span> Quay về Dashboard
            </button>

            <div className="bg-[#4a356a]/50 p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-[50px] group-hover:bg-red-500/30 transition-colors"></div>
                
                <h2 className="text-2xl font-bold text-white mb-6 relative z-10">Tình trạng Sinh thái</h2>
                
                <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl">
                        <span className="text-slate-300 text-sm">Tổng khái niệm</span>
                        <span className="font-mono font-bold text-white">{totalNodes}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                        <span className="text-red-200 text-sm font-bold">Vùng nguy hiểm (&lt;50%)</span>
                        <span className="font-mono font-bold text-white">{weakNodesCount}</span>
                    </div>

                    <div className="pt-2">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Mức độ rủi ro</span>
                            <span>{Math.round(weakPercentage)}%</span>
                        </div>
                        <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div 
                                className={`h-full transition-all duration-1000 ${weakPercentage > 50 ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`} 
                                style={{ width: `${weakPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-slate-400 mt-6 italic opacity-80">
                    {weakNodesCount > 0 
                        ? `Cảnh báo: ${weakNodesCount} chủ đề đang bị lãng quên. Cần ôn tập ngay để tránh mất kiến thức.`
                        : "Hệ thống ổn định. Bạn đã nắm vững mọi thứ!"
                    }
                </p>
            </div>

            <div className="space-y-3">
                <button 
                    onClick={onGenerate}
                    disabled={isGenerating || weakNodesCount === 0}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-900/20 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-white/10"
                >
                    {isGenerating ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">menu_book</span>}
                    {isGenerating ? "AI đang tổng hợp..." : "Tạo Cheat Sheet"}
                </button>

                {hasCheatSheet && !isReviving && (
                    <button 
                        onClick={onRevive}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 border border-white/10 animate-bounce-in"
                    >
                        <span className="material-symbols-outlined">spa</span> 
                        Hồi sinh Kiến thức (Xác nhận đã học)
                    </button>
                )}
                
                {isReviving && (
                    <div className="w-full py-4 bg-emerald-900/50 text-emerald-200 font-bold rounded-2xl flex items-center justify-center gap-2 border border-emerald-500/30">
                        <span className="material-symbols-outlined animate-spin">eco</span> Đang phục hồi hệ sinh thái...
                    </div>
                )}
            </div>
        </div>
    );
};