
import React, { useState, useEffect, useRef } from 'react';
import { KnowledgeNode } from '../../types';

interface EditorAllProps {
    isOpen: boolean;
    onClose: () => void;
    initialNode?: KnowledgeNode;
    userNodes: KnowledgeNode[];
    onUpdateNode: (node: KnowledgeNode) => void;
}

export const EditorAll: React.FC<EditorAllProps> = ({ isOpen, onClose, initialNode, userNodes, onUpdateNode }) => {
    const [selectedNodeId, setSelectedNodeId] = useState<string>(initialNode?.id || '');
    const [jsonContent, setJsonContent] = useState<string>('');
    const [isValid, setIsValid] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // State to trigger the close effect
    const [isSaveSuccess, setIsSaveSuccess] = useState(false);

    // Sync when initialNode changes or modal opens
    useEffect(() => {
        if (isOpen && initialNode) {
            setSelectedNodeId(initialNode.id);
            setJsonContent(JSON.stringify(initialNode.data, null, 2));
            setIsSaveSuccess(false); // Reset save state on open
        } else if (isOpen && !initialNode && selectedNodeId) {
            // Case where we open editor manually and select a node
            const node = userNodes.find(n => n.id === selectedNodeId);
            if (node) {
                 setJsonContent(JSON.stringify(node.data, null, 2));
                 setIsSaveSuccess(false);
            }
        } else if (isOpen && !initialNode && !selectedNodeId && userNodes.length > 0) {
            // Default select first node if nothing selected
             setSelectedNodeId(userNodes[0].id);
             setJsonContent(JSON.stringify(userNodes[0].data, null, 2));
             setIsSaveSuccess(false);
        }
    }, [isOpen, initialNode, selectedNodeId]); // Removed userNodes to prevent loop reset, handled in selection

    // EFFECT: Handle closing after successful save
    useEffect(() => {
        if (isSaveSuccess) {
            // Use a small timeout to allow UI to show "Saved" state briefly if desired, 
            // or just close immediately. 
            const timer = setTimeout(() => {
                onClose();
                setIsSaveSuccess(false);
            }, 500); // 0.5s delay for better UX
            return () => clearTimeout(timer);
        }
    }, [isSaveSuccess, onClose]);

    const handleNodeSelect = (id: string) => {
        setSelectedNodeId(id);
        const node = userNodes.find(n => n.id === id);
        if (node) {
            setJsonContent(JSON.stringify(node.data, null, 2));
            setIsValid(true);
            setErrorMsg(null);
            setIsSaveSuccess(false);
        }
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setJsonContent(val);
        try {
            JSON.parse(val);
            setIsValid(true);
            setErrorMsg(null);
        } catch (err: any) {
            setIsValid(false);
            setErrorMsg(err.message);
        }
    };

    const handleSave = () => {
        if (!isValid) {
            alert("JSON không hợp lệ. Vui lòng kiểm tra cú pháp.");
            return;
        }
        
        const node = userNodes.find(n => n.id === selectedNodeId);
        if (node) {
            try {
                const newData = JSON.parse(jsonContent);
                const updatedNode = { ...node, data: newData, timestamp: new Date() };
                
                // 1. Sync Data
                onUpdateNode(updatedNode);
                
                // 2. Trigger Effect to Close
                setIsSaveSuccess(true); 

            } catch (e) {
                alert("Lỗi khi lưu dữ liệu.");
            }
        }
    };

    const filteredNodes = userNodes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4">
            <div className="w-full max-w-6xl h-[85vh] bg-[#0f172a] rounded-2xl border border-cyan-500/30 flex shadow-2xl overflow-hidden">
                
                {/* Left: Node Selector */}
                <div className="w-80 border-r border-white/10 flex flex-col bg-[#0b1120]">
                    <div className="p-4 border-b border-white/10 bg-cyan-900/10">
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-cyan-400">edit_note</span>
                            Biên Tập Nội Dung
                        </h3>
                        <div className="relative">
                             <input 
                                type="text" 
                                placeholder="Tìm node..." 
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-8 pr-2 text-xs text-white focus:border-cyan-500 outline-none"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                             />
                             <span className="material-symbols-outlined absolute left-2 top-2 text-slate-500 text-sm">search</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {filteredNodes.map(node => (
                            <button
                                key={node.id}
                                onClick={() => handleNodeSelect(node.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all border border-transparent ${
                                    selectedNodeId === node.id 
                                    ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/50 font-bold' 
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <div className="truncate">{node.title}</div>
                                <div className="text-[10px] opacity-60 uppercase">{node.type}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Code Editor */}
                <div className="flex-1 flex flex-col relative bg-[#1e1e1e]">
                    <div className="p-3 border-b border-white/10 flex justify-between items-center bg-[#161b22]">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-mono text-slate-400">Node ID: {selectedNodeId}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isValid ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                {isValid ? 'VALID JSON' : 'INVALID SYNTAX'}
                            </span>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={onClose} className="px-4 py-1.5 border border-white/10 rounded hover:bg-white/5 text-slate-300 text-xs font-bold transition-colors">
                                Hủy
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={!isValid || isSaveSuccess}
                                className={`px-6 py-1.5 rounded text-xs font-bold transition-colors shadow-lg flex items-center gap-2 ${
                                    isSaveSuccess 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                            >
                                {isSaveSuccess ? (
                                    <>
                                        <span className="material-symbols-outlined text-sm">check</span> Đã lưu!
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">save</span> Lưu & Đồng bộ
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 relative">
                        <textarea 
                            className="absolute inset-0 w-full h-full bg-[#0d1117] text-green-400 font-mono text-sm p-4 outline-none resize-none"
                            value={jsonContent}
                            onChange={handleJsonChange}
                            spellCheck={false}
                        />
                    </div>
                    
                    {errorMsg && (
                        <div className="p-2 bg-red-900/80 text-white text-xs font-mono border-t border-red-500 absolute bottom-0 left-0 w-full">
                            Error: {errorMsg}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
