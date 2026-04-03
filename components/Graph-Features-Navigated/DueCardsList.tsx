import React from 'react';
import { KnowledgeNode } from '../../types';
import { getNodeAggregateStatus } from '../../services/sm2Service';

interface DueCardsListProps {
    nodes: KnowledgeNode[];
    onNodeClick: (node: KnowledgeNode) => void;
}

export const DueCardsList: React.FC<DueCardsListProps> = ({ nodes, onNodeClick }) => {
    const dueNodes = nodes.filter(node => getNodeAggregateStatus(node) === 'due' || getNodeAggregateStatus(node) === 'weak');

    return (
        <div className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined">schedule</span>
                Thẻ Đến Hạn ({dueNodes.length})
            </h3>
            
            {dueNodes.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">done_all</span>
                    <p className="text-xs">Tuyệt vời! Bạn không có thẻ nào đến hạn.</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    {dueNodes.map(node => (
                        <div 
                            key={node.id}
                            onClick={() => onNodeClick(node)}
                            className="p-3 rounded-xl bg-[#1e293b]/50 border border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between">
                                <h4 className="text-sm font-bold text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-2">{node.title}</h4>
                                <span className="material-symbols-outlined text-amber-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity">play_circle</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                                {node.tags?.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-black/30 text-slate-400 border border-white/5">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
