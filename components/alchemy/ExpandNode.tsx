
import React, { useState, useEffect } from 'react';
import { KnowledgeNode } from '../../types';
import { getExpansionSuggestions, generateLearningContent } from '../../services/geminiService';

interface ExpandNodeProps {
    isOpen: boolean;
    onClose: () => void;
    originalNode: KnowledgeNode;
    onSave: (newNode: KnowledgeNode, parentId: string) => void;
}

type Phase = 'analyzing' | 'suggestion' | 'format_selection' | 'generating' | 'review';

export const ExpandNode: React.FC<ExpandNodeProps> = ({ isOpen, onClose, originalNode, onSave }) => {
    const [phase, setPhase] = useState<Phase>('analyzing');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [selectedFormat, setSelectedFormat] = useState<'Flashcard' | 'Quiz' | 'Case Study' | 'Fill-in-the-blanks'>('Flashcard');
    const [generatedData, setGeneratedData] = useState<any>(null);
    const [editableContent, setEditableContent] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // Initial Analysis
    useEffect(() => {
        if (isOpen && originalNode) {
            setPhase('analyzing');
            getExpansionSuggestions(originalNode)
                .then(s => {
                    setSuggestions(s);
                    setPhase('suggestion');
                })
                .catch(e => {
                    console.error(e);
                    setError("Không thể phân tích node này. Vui lòng thử lại.");
                });
        }
    }, [isOpen, originalNode]);

    const handleTopicSelect = (topic: string) => {
        setSelectedTopic(topic);
        setPhase('format_selection');
    };

    const handleFormatSelect = async (format: 'Flashcard' | 'Quiz' | 'Case Study' | 'Fill-in-the-blanks') => {
        setSelectedFormat(format);
        setPhase('generating');
        
        try {
            // Construct context from original node + new topic
            const context = `
                Original Context: ${originalNode.title} - ${JSON.stringify(originalNode.data?.summary || '')}
                Expansion Topic: ${selectedTopic}
                Create detailed content for this new topic branching from the original.
            `;
            
            const result = await generateLearningContent(context, format, { complexity: 'Medium', language: 'Vietnamese' });
            setGeneratedData(result);
            setEditableContent(JSON.stringify(result, null, 2));
            setPhase('review');
        } catch (e) {
            console.error(e);
            setError("Lỗi khi tạo nội dung mở rộng.");
            setPhase('format_selection');
        }
    };

    const handleSave = () => {
        try {
            const parsedData = JSON.parse(editableContent);
            
            // INHERIT TAGS LOGIC:
            // Combine parent tags with "Expanded" tag and new generated tags.
            const parentTags = originalNode.tags || [];
            const newTags = parsedData.tags || [];
            const mergedTags = Array.from(new Set([...parentTags, ...newTags, 'Expanded']));

            const newNode: KnowledgeNode = {
                id: Date.now().toString(),
                title: parsedData.title || selectedTopic,
                type: selectedFormat,
                status: 'new',
                tags: mergedTags,
                x: 0, // Position handled by parent
                y: 0, 
                timestamp: new Date(),
                data: parsedData,
                parentNodeId: originalNode.id, // Link back
                relationshipLabel: 'mở rộng'
            };
            onSave(newNode, originalNode.id);
            onClose();
        } catch (e) {
            alert("JSON không hợp lệ. Vui lòng kiểm tra cú pháp.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4">
            <div className="bg-[#0f172a] w-full max-w-2xl rounded-2xl border border-purple-500/30 shadow-2xl flex flex-col overflow-hidden max-h-[85vh] relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                
                {/* Header */}
                <div className="p-6 bg-[#162032] border-b border-white/10">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-400">account_tree</span>
                        Mở Rộng Tri Thức (AI Expansion)
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Gốc: <span className="text-cyan-300 font-bold">{originalNode.title}</span></p>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl text-red-200 mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {phase === 'analyzing' && (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                                <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-purple-400 animate-pulse">neurology</span>
                            </div>
                            <p className="text-purple-300 font-bold animate-pulse text-center">
                                AI đang đọc hiểu nội dung node gốc...
                            </p>
                        </div>
                    )}

                    {phase === 'suggestion' && (
                        <div className="space-y-4 animate-slide-up">
                            <p className="text-slate-300 text-sm">AI đề xuất 5 hướng phát triển từ chủ đề này:</p>
                            <div className="grid gap-3">
                                {suggestions.map((topic, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleTopicSelect(topic)}
                                        className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/50 transition-all group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-200 group-hover:text-white">{topic}</span>
                                            <span className="material-symbols-outlined text-slate-500 group-hover:text-purple-400">arrow_forward</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {phase === 'format_selection' && (
                        <div className="space-y-6 animate-slide-up">
                            <div>
                                <h4 className="text-white font-bold mb-1">Chủ đề: {selectedTopic}</h4>
                                <button onClick={() => setPhase('suggestion')} className="text-xs text-slate-500 hover:text-purple-400 underline">Chọn lại chủ đề</button>
                            </div>
                            <p className="text-slate-300 text-sm">Bạn muốn tạo nội dung dưới dạng nào?</p>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'Flashcard', icon: 'style', label: 'Flashcards' },
                                    { id: 'Quiz', icon: 'quiz', label: 'Trắc nghiệm' },
                                    { id: 'Case Study', icon: 'work_history', label: 'Tình huống' },
                                    { id: 'Fill-in-the-blanks', icon: 'edit_note', label: 'Điền từ' }
                                ].map((fmt) => (
                                    <button
                                        key={fmt.id}
                                        onClick={() => handleFormatSelect(fmt.id as any)}
                                        className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-600/20 hover:border-purple-500/50 flex flex-col items-center gap-3 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-3xl text-slate-400">{fmt.icon}</span>
                                        <span className="font-bold text-slate-200">{fmt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {phase === 'generating' && (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                             <div className="relative w-20 h-20">
                                <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                                <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-cyan-400 animate-pulse">auto_awesome</span>
                            </div>
                            <p className="text-cyan-300 font-bold animate-pulse text-center">
                                Đang chế tác nội dung {selectedFormat}...
                            </p>
                        </div>
                    )}

                    {phase === 'review' && (
                        <div className="flex flex-col h-full animate-slide-up">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-white font-bold">Xem trước & Chỉnh sửa</h4>
                                <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-500/30">JSON Valid</span>
                            </div>
                            <textarea 
                                className="flex-1 w-full bg-black/30 border border-white/10 rounded-xl p-4 text-xs font-mono text-green-300 focus:outline-none focus:border-purple-500 resize-none"
                                value={editableContent}
                                onChange={(e) => setEditableContent(e.target.value)}
                                spellCheck={false}
                            />
                        </div>
                    )}
                </div>

                {phase === 'review' && (
                    <div className="p-4 bg-[#162032] border-t border-white/10 flex justify-end gap-3">
                        <button onClick={() => setPhase('format_selection')} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">Quay lại</button>
                        <button 
                            onClick={handleSave}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">save</span>
                            Lưu vào Sơ đồ
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
