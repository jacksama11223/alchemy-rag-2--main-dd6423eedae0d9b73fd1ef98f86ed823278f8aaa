import React from 'react';
import { KnowledgeNode } from '../../types';

interface LearningPathTreeProps {
    nodes: KnowledgeNode[];
    onNodeClick: (node: KnowledgeNode) => void;
}

export const LearningPathTree: React.FC<LearningPathTreeProps> = ({ nodes, onNodeClick }) => {
    // A simple mock tree structure based on nodes
    // In a real app, this would use connectedNodeIds to build a real tree
    
    // Let's just sort them by timestamp to simulate a path for now
    const sortedNodes = [...nodes].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return (
        <div className="p-4">
            <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined">account_tree</span>
                Cây Lộ Trình
            </h3>
            
            <div className="relative pl-4 border-l-2 border-slate-700 space-y-6 my-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {sortedNodes.length === 0 ? (
                    <p className="text-xs text-slate-500">Chưa có lộ trình nào được tạo.</p>
                ) : (
                    sortedNodes.map((node, idx) => (
                        <div key={node.id} className="relative">
                            {/* Timeline Dot */}
                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0f172a] shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            
                            <div 
                                onClick={() => onNodeClick(node)}
                                className="bg-[#1e293b]/60 border border-white/10 p-3 rounded-xl hover:bg-green-900/20 hover:border-green-500/40 transition-all cursor-pointer group"
                            >
                                <div className="text-[10px] text-green-400 font-bold mb-1 uppercase tracking-wider">Bước {idx + 1}</div>
                                <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{node.title}</h4>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
