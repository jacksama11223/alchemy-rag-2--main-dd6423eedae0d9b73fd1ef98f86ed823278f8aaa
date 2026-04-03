import React from 'react';
import { KnowledgeNode } from '../../types';

interface PracticeExercisesProps {
    nodes: KnowledgeNode[];
    onNodeClick: (node: KnowledgeNode) => void;
}

export const PracticeExercises: React.FC<PracticeExercisesProps> = ({ nodes, onNodeClick }) => {
    // Filter nodes that have exercises (Quiz, Fill in blanks, Spot errors, Case studies)
    const exerciseNodes = nodes.filter(n => 
        (n.data?.quiz && n.data.quiz.length > 0) ||
        (n.data?.fillInBlanks && n.data.fillInBlanks.length > 0) ||
        (n.data?.spotErrors && n.data.spotErrors.length > 0) ||
        (n.data?.caseStudies && n.data.caseStudies.length > 0)
    );

    return (
        <div className="p-4">
            <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined">fitness_center</span>
                Bài Tập Thực Hành
            </h3>
            
            <p className="text-xs text-slate-400 mb-4">Các node chứa bài tập trắc nghiệm, điền từ, tìm lỗi sai hoặc tình huống thực tế để bạn rèn luyện.</p>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                {exerciseNodes.length === 0 ? (
                    <div className="text-center py-6 text-slate-600">
                        <span className="material-symbols-outlined text-3xl mb-2">inventory_2</span>
                        <p className="text-xs">Chưa có bài tập nào.</p>
                    </div>
                ) : (
                    exerciseNodes.map(node => {
                        let exCount = 0;
                        if (node.data?.quiz) exCount += node.data.quiz.length;
                        if (node.data?.fillInBlanks) exCount += node.data.fillInBlanks.length;
                        if (node.data?.spotErrors) exCount += node.data.spotErrors.length;
                        if (node.data?.caseStudies) exCount += node.data.caseStudies.length;

                        return (
                            <div 
                                key={node.id}
                                onClick={() => onNodeClick(node)}
                                className="p-3 rounded-xl bg-gradient-to-r from-pink-900/20 to-transparent border border-pink-500/20 hover:border-pink-500/50 transition-all cursor-pointer group"
                            >
                                <h4 className="text-sm font-bold text-slate-200 group-hover:text-pink-300 transition-colors mb-2">{node.title}</h4>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-pink-400 bg-pink-500/10 w-fit px-2 py-1 rounded">
                                    <span className="material-symbols-outlined text-[12px]">task_alt</span>
                                    {exCount} Bài tập
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
