
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
    // 1. Calculate Aggregate Statistics
    const stats = useMemo(() => {
        let totalItems = 0;
        let dueItems = 0;
        let newItems = 0;
        let learningItems = 0; // reps < 3 but not new
        let reviewItems = 0;   // reps >= 3

        const now = new Date();

        nodes.forEach(node => {
            const items = [
                ...(node.data?.flashcards || []),
                ...(node.data?.quiz || []),
                ...(node.data?.fillInBlanks || []),
                ...(node.data?.spotErrors || []),
                ...(node.data?.caseStudies || [])
            ];

            items.forEach(item => {
                totalItems++;
                const reps = item.sm2?.repetitions || 0;
                const nextDate = item.sm2?.nextReviewDate ? new Date(item.sm2.nextReviewDate) : null;

                if (!nextDate) {
                    newItems++;
                    dueItems++; // New items are technically due
                } else {
                    if (nextDate <= now) dueItems++;
                    if (reps > 0 && reps < 3) learningItems++;
                    if (reps >= 3) reviewItems++;
                }
            });
        });

        return { totalItems, dueItems, newItems, learningItems, reviewItems };
    }, [nodes]);

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
                        <div className="flex items-center justify-between bg-slate-500/10 border border-slate-500/20 p-3 rounded-xl text-slate-400">
                             <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                <span className="text-xs font-bold">Tổng số thẻ</span>
                            </div>
                            <span className="text-xs font-bold">{stats.totalItems}</span>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="pt-4">
                    <button 
                        onClick={onStartGlobalReview}
                        disabled={stats.dueItems === 0}
                        className={`w-full py-4 rounded-2xl font-black text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 ${
                            stats.dueItems > 0 
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_10px_20px_rgba(6,182,212,0.3)]' 
                            : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/10'
                        }`}
                    >
                        <span className="material-symbols-outlined">bolt</span>
                        ÔN TẬP TOÀN BỘ ({stats.dueItems})
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
