
import React, { useMemo } from 'react';
import { KnowledgeNode } from '../../types';

interface LearningHubSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    nodes: KnowledgeNode[];
    onStartGlobalReview: () => void;
}

export const LearningHubSidebar: React.FC<LearningHubSidebarProps> = ({ 
    isOpen, onClose, nodes, onStartGlobalReview 
}) => {
    // 1. Calculate Aggregate Statistics and Sorted Due List
    const processedData = useMemo(() => {
        let totalItems = 0;
        let dueItems = 0;
        let newItems = 0;
        let learningItems = 0; 
        let reviewItems = 0;   

        const now = new Date();

        // Filter and Score Due Nodes
        const dueList = nodes.filter(node => {
            const items = [...(node.data?.flashcards || []), ...(node.data?.quiz || []), ...(node.data?.fillInBlanks || []), ...(node.data?.spotErrors || []), ...(node.data?.caseStudies || [])];
            return items.some(i => !i.sm2?.nextReviewDate || new Date(i.sm2.nextReviewDate) <= now);
        }).map(node => {
            // Priority Score: Base 100 for due + 10 for each connection
            const priorityScore = 100 + (node.connectedNodeIds?.length || 0) * 10;
            return { ...node, priorityScore };
        }).sort((a, b) => b.priorityScore - a.priorityScore);

        nodes.forEach(node => {
            const items = [...(node.data?.flashcards || []), ...(node.data?.quiz || []), ...(node.data?.fillInBlanks || []), ...(node.data?.spotErrors || []), ...(node.data?.caseStudies || [])];
            items.forEach(item => {
                totalItems++;
                const reps = item.sm2?.repetitions || 0;
                const nextDate = item.sm2?.nextReviewDate ? new Date(item.sm2.nextReviewDate) : null;
                if (!nextDate) { newItems++; dueItems++; } 
                else {
                    if (nextDate <= now) dueItems++;
                    if (reps > 0 && reps < 3) learningItems++;
                    if (reps >= 3) reviewItems++;
                }
            });
        });

        return { stats: { totalItems, dueItems, newItems, learningItems, reviewItems }, dueList };
    }, [nodes]);

    const { stats, dueList } = processedData;

    return (
        <div className={`fixed top-0 left-0 h-full w-72 bg-[#0f172a]/95 backdrop-blur-xl border-r border-cyan-500/30 z-[100] transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-[10px_0_30px_rgba(0,0,0,0.5)] flex flex-col`}>
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-l from-cyan-900/20 to-transparent">
                <div className="flex items-center gap-3 text-cyan-400">
                    <span className="material-symbols-outlined">psychology</span>
                    <h3 className="font-bold text-lg tracking-tight">Trung tâm Học tập</h3>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                {/* Global Stats */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Thống kê tổng quát</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <div className="text-2xl font-black text-white">{stats.dueItems}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold">Cần ôn</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <div className="text-2xl font-black text-white">{stats.newItems}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold">Thẻ mới</div>
                        </div>
                    </div>
                </div>

                {/* Priority Due List */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Thứ tự ưu tiên (G-Learning)</h4>
                    <div className="space-y-2">
                        {dueList.length === 0 ? (
                            <p className="text-[10px] text-slate-500 italic">Mọi thứ đã được tối ưu hóa.</p>
                        ) : (
                            dueList.slice(0, 5).map(node => (
                                <div key={node.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${node.isBlocked ? 'bg-red-500/5 border-red-500/20 opacity-60' : 'bg-white/5 border-white/10 hover:border-cyan-500/30'}`}>
                                    <div className="flex flex-col gap-0.5 overflow-hidden">
                                        <span className={`text-[11px] font-bold truncate ${node.isBlocked ? 'text-red-300' : 'text-white'}`}>{node.title}</span>
                                        <span className="text-[9px] text-slate-500 font-medium">Rank: #{Math.round(node.priorityScore)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {node.isBlocked ? (
                                            <span className="material-symbols-outlined text-red-500 text-sm">lock</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-green-500 text-sm animate-pulse">check_circle</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        {dueList.length > 5 && <div className="text-center text-[9px] text-slate-600 font-bold">+{dueList.length - 5} chủ đề khác</div>}
                    </div>
                </div>

                {/* Progress Breakdown */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Trạng thái ghi nhớ</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                <span className="text-xs font-bold text-blue-100">Đang học (Learning)</span>
                            </div>
                            <span className="text-xs font-bold text-blue-400">{stats.learningItems}</span>
                        </div>
                        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-3 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                <span className="text-xs font-bold text-green-100">Đã nhớ (Review)</span>
                            </div>
                            <span className="text-xs font-bold text-green-400">{stats.reviewItems}</span>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="pt-4">
                    <button 
                        onClick={onStartGlobalReview}
                        disabled={stats.dueItems === 0 || dueList.every(n => n.isBlocked)}
                        className={`w-full py-4 rounded-2xl font-black text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 ${
                            stats.dueItems > 0 && !dueList.every(n => n.isBlocked)
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_10px_20px_rgba(6,182,212,0.3)]' 
                            : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/10'
                        }`}
                    >
                        <span className="material-symbols-outlined">bolt</span>
                        ÔN TẬP TỔNG LỰC ({stats.dueItems})
                    </button>
                    {stats.dueItems === 0 && (
                         <p className="text-[10px] text-center text-slate-500 mt-4 leading-relaxed px-4">
                            Tuyệt vời! Bạn đã hoàn thành tất cả mục tiêu hôm nay. Hãy quay lại sau khi não bộ cần củng cố thêm.
                         </p>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 opacity-50">
                 <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold text-center">
                    Powered by SM-2 / Anki Algorithm
                 </p>
            </div>
        </div>
    );
};
