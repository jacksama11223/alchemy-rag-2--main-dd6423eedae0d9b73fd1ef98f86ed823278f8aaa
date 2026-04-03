import React from 'react';
import { KnowledgeNode } from '../../types';

interface CardTypeFilterProps {
    nodes: KnowledgeNode[];
    onNodeClick: (node: KnowledgeNode) => void;
}

export const CardTypeFilter: React.FC<CardTypeFilterProps> = ({ nodes, onNodeClick }) => {
    // Group nodes by type
    const flashcardNodes = nodes.filter(n => n.data?.flashcards && n.data.flashcards.length > 0);
    const quizNodes = nodes.filter(n => n.data?.quiz && n.data.quiz.length > 0);
    const mixedNodes = nodes.filter(n => n.type === 'Mixed' || n.type === 'Document');

    const renderSection = (title: string, icon: string, colorClass: string, items: KnowledgeNode[]) => (
        <div className="mb-6">
            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-3 ${colorClass}`}>
                <span className="material-symbols-outlined text-sm">{icon}</span>
                {title} ({items.length})
            </h4>
            <div className="space-y-2 max-h-[30vh] overflow-y-auto custom-scrollbar pr-2">
                {items.length === 0 ? (
                    <p className="text-xs text-slate-600 italic">Chưa có dữ liệu</p>
                ) : (
                    items.map(node => (
                        <div 
                            key={node.id}
                            onClick={() => onNodeClick(node)}
                            className="p-2 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer truncate text-sm text-slate-300 hover:text-white"
                        >
                            {node.title}
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="p-4">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined">category</span>
                Phân Loại Thẻ
            </h3>
            
            {renderSection('Flashcards', 'style', 'text-purple-400', flashcardNodes)}
            {renderSection('Trắc nghiệm (Quiz)', 'quiz', 'text-green-400', quizNodes)}
            {renderSection('Tổng hợp / Tài liệu', 'description', 'text-blue-400', mixedNodes)}
        </div>
    );
};
