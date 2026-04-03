
import React, { useState, useEffect } from 'react';
import { KnowledgeNode } from '../../types';
import { suggestNoteDirections, generateTargetedNote } from '../../services/geminiService';

interface NodeTakingNoteProps {
    isOpen: boolean;
    onClose: () => void;
    node: KnowledgeNode;
    onSaveToNoteLab: (title: string, content: string) => void;
}

type Phase = 'analyzing' | 'selection' | 'generating' | 'editing';

export const NodeTakingNote: React.FC<NodeTakingNoteProps> = ({ isOpen, onClose, node, onSaveToNoteLab }) => {
    const [phase, setPhase] = useState<Phase>('analyzing');
    const [directions, setDirections] = useState<{title: string, description: string, strategy: string}[]>([]);
    const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
    const [noteContent, setNoteContent] = useState('');
    const [noteTitle, setNoteTitle] = useState('');
    
    // Interactive state for Q&A preview
    const [previewMode, setPreviewMode] = useState(false);
    const [visibleAnswers, setVisibleAnswers] = useState<{[key: number]: boolean}>({});

    // 1. Initial Analysis on Open
    useEffect(() => {
        if (isOpen && node) {
            setPhase('analyzing');
            setNoteTitle(`Ghi chú về: ${node.title}`);
            
            suggestNoteDirections(node)
                .then(suggestions => {
                    setDirections(suggestions);
                    setPhase('selection');
                })
                .catch(err => {
                    console.error(err);
                    alert("Không thể phân tích node này.");
                    onClose();
                });
        }
    }, [isOpen, node]);

    const handleSelectDirection = async (strategy: string, title: string) => {
        setSelectedStrategy(strategy);
        setPhase('generating');
        
        try {
            const content = await generateTargetedNote(node, strategy);
            setNoteContent(content);
            setPhase('editing');
            // If it's Q&A, enable preview mode by default to show interactive elements
            if (strategy === 'qa') {
                setPreviewMode(true);
            }
        } catch (e) {
            alert("Lỗi khi tạo nội dung.");
            setPhase('selection');
        }
    };

    const handleSave = () => {
        onSaveToNoteLab(noteTitle, noteContent);
        onClose();
    };

    // Helper to render Q&A interaction
    const renderInteractiveContent = (text: string) => {
        if (selectedStrategy !== 'qa') return <div className="whitespace-pre-wrap font-mono text-sm text-slate-300">{text}</div>;

        // Naive parser for the specific Q&A format requested
        // Format: **Question:** ... \n\n ... > **System Answer:** ...
        const parts = text.split(/\*\*Question:\*\*/g);
        
        return (
            <div className="space-y-6">
                {parts.map((part, index) => {
                    if (!part.trim()) return null;
                    const qIndex = index;
                    
                    // Split into Question part and Answer part
                    const splitAnswer = part.split(/> \*\*System Answer:\*\*/);
                    const questionText = splitAnswer[0];
                    const answerText = splitAnswer.length > 1 ? splitAnswer[1] : '';

                    return (
                        <div key={index} className="bg-black/20 p-4 rounded-xl border border-white/10">
                            <h4 className="text-cyan-400 font-bold mb-2 flex items-start gap-2">
                                <span className="material-symbols-outlined text-sm mt-0.5">help</span>
                                <div>{questionText.trim()}</div>
                            </h4>
                            
                            <textarea 
                                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-cyan-500 outline-none mb-3 resize-none h-20 placeholder-slate-600"
                                placeholder="Viết câu trả lời của bạn vào đây..."
                            ></textarea>

                            {answerText && (
                                <div>
                                    <button 
                                        onClick={() => setVisibleAnswers(prev => ({...prev, [qIndex]: !prev[qIndex]}))}
                                        className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 mb-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">{visibleAnswers[qIndex] ? 'expand_less' : 'expand_more'}</span>
                                        {visibleAnswers[qIndex] ? 'Ẩn đáp án gợi ý' : 'Xem đáp án gợi ý'}
                                    </button>
                                    
                                    {visibleAnswers[qIndex] && (
                                        <div className="bg-green-900/20 border-l-2 border-green-500 pl-3 py-2 text-sm text-green-100 animate-fade-in">
                                            {answerText.trim()}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-[#1e1e1e] w-full max-w-4xl h-[85vh] rounded-2xl border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.1)] flex flex-col overflow-hidden relative">
                
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#162032]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                            <span className="material-symbols-outlined text-xl">edit_note</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">AI Note Creator</h2>
                            <p className="text-xs text-slate-400 max-w-md truncate">Context: {node.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 relative">
                    
                    {/* PHASE 1: ANALYZING */}
                    {phase === 'analyzing' && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                                <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl text-cyan-400 animate-pulse">neurology</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Đang đọc hiểu dữ liệu...</h3>
                                <p className="text-slate-400 text-sm">AI đang quét toàn bộ cấu trúc của node để đề xuất phương pháp học tập.</p>
                            </div>
                        </div>
                    )}

                    {/* PHASE 2: SELECTION */}
                    {phase === 'selection' && (
                        <div className="max-w-2xl mx-auto">
                            <h3 className="text-2xl font-black text-white mb-6 text-center">Chọn hướng tiếp cận</h3>
                            <div className="grid gap-4">
                                {directions.map((dir, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleSelectDirection(dir.strategy, dir.title)}
                                        className="group flex items-start gap-4 p-5 bg-white/5 hover:bg-cyan-900/20 border border-white/10 hover:border-cyan-500/50 rounded-xl transition-all text-left hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className={`p-3 rounded-full shrink-0 ${dir.strategy === 'qa' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            <span className="material-symbols-outlined text-2xl">
                                                {dir.strategy === 'qa' ? 'quiz' : dir.strategy === 'feynman' ? 'child_care' : 'auto_stories'}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">{dir.title}</h4>
                                            <p className="text-sm text-slate-400 leading-relaxed">{dir.description}</p>
                                        </div>
                                        <div className="ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-cyan-500">arrow_forward</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PHASE 3: GENERATING */}
                    {phase === 'generating' && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                            <div className="w-full max-w-md bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 w-1/2 animate-[stream_1s_linear_infinite]" style={{ width: '100%', backgroundSize: '200% 100%' }}></div>
                            </div>
                            <p className="text-cyan-300 font-bold animate-pulse">Đang soạn thảo ghi chú theo phong cách {directions.find(d => d.strategy === selectedStrategy)?.title}...</p>
                        </div>
                    )}

                    {/* PHASE 4: EDITING / PREVIEW */}
                    {phase === 'editing' && (
                        <div className="h-full flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <input 
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                    className="bg-transparent text-xl font-bold text-white border-b border-white/20 pb-1 focus:border-cyan-500 outline-none w-full mr-4"
                                />
                                <div className="flex bg-black/30 rounded-lg p-1 shrink-0">
                                    <button 
                                        onClick={() => setPreviewMode(false)}
                                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${!previewMode ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Editor (Markdown)
                                    </button>
                                    <button 
                                        onClick={() => setPreviewMode(true)}
                                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${previewMode ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Interactive Preview
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 bg-[#0b1120] rounded-xl border border-white/10 overflow-hidden">
                                {previewMode ? (
                                    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
                                        {renderInteractiveContent(noteContent)}
                                    </div>
                                ) : (
                                    <textarea 
                                        className="w-full h-full bg-transparent p-4 text-sm text-slate-300 font-mono outline-none resize-none leading-relaxed"
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {phase === 'editing' && (
                    <div className="p-4 border-t border-white/10 bg-[#162032] flex justify-end gap-3">
                        <button onClick={() => setPhase('selection')} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-bold text-sm">
                            Quay lại chọn kiểu
                        </button>
                        <button 
                            onClick={handleSave}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-bold text-sm shadow-lg flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">save_as</span>
                            Lưu vào NoteLab
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
