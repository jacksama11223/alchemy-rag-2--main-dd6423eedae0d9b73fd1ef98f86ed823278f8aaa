
import React, { useMemo } from 'react';
import { KnowledgeNode } from '../../types';

interface DueCardSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    allNodes: KnowledgeNode[]; // Changed from dueNodes to allNodes
    onNodeClick: (node: KnowledgeNode) => void;
    onStartReview: (node: KnowledgeNode) => void;
}

/**
 * Helper to format time until next review
 */
const formatTimeUntilDue = (dateString: string | undefined): string => {
    if (!dateString) return 'Mới';
    const nextDate = new Date(dateString);
    const now = new Date();
    const diffMs = nextDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMs < 0) {
        if (Math.abs(diffDays) === 0) return 'Đã đến hạn';
        return `${Math.abs(diffDays)} ngày trước`;
    }
    
    if (diffDays === 0) {
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHrs === 0) return 'Sắp đến hạn (<1h)';
        return `${diffHrs} giờ nữa`;
    }
    
    return `${diffDays} ngày nữa`;
};

export const DueCardSidebar: React.FC<DueCardSidebarProps> = ({ 
    isOpen, onClose, allNodes, onNodeClick, onStartReview 
}) => {
    // 1. Filter nodes that have studyable content and sort them
    const sortedNodes = useMemo(() => {
        const nodesWithContent = allNodes.filter(n => {
            const data = n.data || {};
            return (data.flashcards?.length || data.quiz?.length || data.fillInBlanks?.length || data.spotErrors?.length || data.caseStudies?.length);
        });

        return nodesWithContent.sort((a, b) => {
            const nextA = (a.data?.flashcards?.[0]?.sm2?.nextReviewDate || '9999');
            const nextB = (b.data?.flashcards?.[0]?.sm2?.nextReviewDate || '9999');
            
            const isDueA = new Date(nextA) <= new Date() ? 0 : 1;
            const isDueB = new Date(nextB) <= new Date() ? 0 : 1;

            if (isDueA !== isDueB) return isDueA - isDueB;
            return nextA.localeCompare(nextB);
        });
    }, [allNodes]);

    return (
        <div className={`fixed top-0 right-0 h-full w-80 bg-[#0f172a]/95 backdrop-blur-xl border-l border-cyan-500/30 z-[100] transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col`}>
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-900/20 to-transparent">
                <div className="flex items-center gap-3 text-cyan-400">
                    <span className="material-symbols-outlined">inventory_2</span>
                    <h3 className="font-bold text-lg tracking-tight">Kho thẻ tri thức</h3>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {sortedNodes.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                        <span className="material-symbols-outlined text-6xl mb-4 text-slate-500">auto_awesome</span>
                        <p className="text-slate-400 font-medium">Chưa có thẻ nào được tạo.</p>
                    </div>
                ) : (
                    sortedNodes.map((node) => {
                        const items = [
                            ...(node.data?.flashcards || []),
                            ...(node.data?.quiz || []),
                            ...(node.data?.fillInBlanks || []),
                            ...(node.data?.spotErrors || []),
                            ...(node.data?.caseStudies || [])
                        ];
                        
                        const now = new Date();
                        const dueCount = items.filter(item => {
                            if (!item.sm2?.nextReviewDate) return true; 
                            return new Date(item.sm2.nextReviewDate) <= now;
                        }).length;

                        // Get earliest next review date
                        const nextReviewStrings = items.map(i => i.sm2?.nextReviewDate).filter(Boolean) as string[];
                        const earliestNextReview = nextReviewStrings.length > 0 
                            ? nextReviewStrings.reduce((a, b) => a < b ? a : b)
                            : undefined;

                        const isDue = dueCount > 0;

                        return (
                            <div 
                                key={node.id} 
                                className={`group bg-white/5 border rounded-2xl p-4 transition-all hover:bg-white/10 cursor-pointer relative overflow-hidden ${isDue ? 'border-yellow-500/30' : 'border-white/10'}`}
                                onClick={() => onNodeClick(node)}
                            >
                                {isDue && <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>}
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-bold group-hover:text-cyan-300 transition-colors line-clamp-1 flex-1 pr-2 ${isDue ? 'text-yellow-400' : 'text-white'}`}>{node.title}</h4>
                                    {isDue && (
                                        <span className="bg-yellow-500/20 text-yellow-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-yellow-500/30">
                                            HẠN
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-[14px] text-slate-500">schedule</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDue ? 'text-yellow-500/70' : 'text-slate-500'}`}>
                                        {formatTimeUntilDue(earliestNextReview)}
                                    </span>
                                </div>

                                <div className="flex gap-1 mb-4 overflow-hidden">
                                     <span className="text-[10px] bg-white/10 text-slate-400 px-2 py-0.5 rounded-full whitespace-nowrap">{items.length} mục</span>
                                     {dueCount > 0 && <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full whitespace-nowrap">{dueCount} cần ôn</span>}
                                </div>

                                <button 
                                    onClick={(e) => { e.stopPropagation(); onStartReview(node); }}
                                    className={`w-full py-2 text-xs font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${isDue ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">{isDue ? 'play_circle' : 'visibility'}</span>
                                    {isDue ? 'Ôn tập ngay' : 'Xem nội dung'}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
