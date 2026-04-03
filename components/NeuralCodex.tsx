
import React, { useState } from 'react';
import { KnowledgeNode } from '../types';
import { FeatureWindowControls } from './FeatureWindowControls';

interface NeuralCodexProps {
    onBack: () => void;
    userNodes?: KnowledgeNode[];
}

// Simple Codex Viewer Component
const NeuralCodex: React.FC<NeuralCodexProps> = ({ onBack, userNodes = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);

    const filteredNodes = userNodes.filter(node => 
        node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.tags && node.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    return (
        <div className="flex h-screen bg-[#020617] text-slate-200 font-display">
            {/* Sidebar */}
            <div className="w-80 bg-[#0f172a] border-r border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-400">menu_book</span> Neural Codex
                    </h2>
                    <FeatureWindowControls onClose={onBack} />
                </div>
                
                <div className="p-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm tri thức..." 
                            className="w-full bg-[#1e293b] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-purple-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-500 text-lg">search</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {filteredNodes.length === 0 && (
                        <div className="text-center text-slate-500 text-xs py-8">Không tìm thấy mục nào.</div>
                    )}
                    {filteredNodes.map(node => (
                        <div 
                            key={node.id}
                            onClick={() => setSelectedNode(node)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedNode?.id === node.id ? 'bg-purple-900/30 border border-purple-500/30 text-white' : 'hover:bg-white/5 border border-transparent text-slate-300'}`}
                        >
                            <h3 className="font-bold text-sm truncate">{node.title}</h3>
                            <div className="flex gap-2 mt-1">
                                <span className="text-[10px] uppercase bg-black/30 px-1.5 py-0.5 rounded text-slate-400">{node.type}</span>
                                {node.tags && node.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[10px] text-slate-500">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-[#0b1120] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                
                {selectedNode ? (
                    <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-8 pb-6 border-b border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        selectedNode.type === 'Flashcard' ? 'bg-blue-900/30 text-blue-300 border border-blue-500/30' :
                                        selectedNode.type === 'Quiz' ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30' :
                                        'bg-slate-800 text-slate-300 border border-slate-700'
                                    }`}>
                                        {selectedNode.type}
                                    </span>
                                    <span className="text-xs text-slate-500">{new Date(selectedNode.timestamp).toLocaleDateString()}</span>
                                </div>
                                <h1 className="text-4xl font-black text-white leading-tight">{selectedNode.title}</h1>
                            </div>

                            <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                                {selectedNode.data?.summary && (
                                    <div className="mb-8">
                                        <h3 className="text-cyan-400 font-bold text-xl mb-3">Tóm tắt</h3>
                                        <p className="leading-relaxed bg-[#1e293b]/50 p-6 rounded-2xl border border-white/5">{selectedNode.data.summary}</p>
                                    </div>
                                )}

                                {selectedNode.data?.flashcards && selectedNode.data.flashcards.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-green-400 font-bold text-xl mb-4">Flashcards ({selectedNode.data.flashcards.length})</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedNode.data.flashcards.map((card, idx) => (
                                                <div key={idx} className="bg-[#1e293b] p-4 rounded-xl border border-white/5">
                                                    <p className="font-bold text-white mb-2">{card.front}</p>
                                                    <hr className="border-white/10 my-2" />
                                                    <p className="text-slate-400 text-sm">{card.back}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                        <span className="material-symbols-outlined text-8xl mb-4">auto_stories</span>
                        <p className="text-lg">Chọn một mục từ danh sách để xem chi tiết.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(NeuralCodex);
