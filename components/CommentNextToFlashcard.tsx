import React, { useState, useEffect } from 'react';
import { getFlashcardNote, saveFlashcardNote } from '../services/geminiService';

interface AIComment {
    id: string;
    text: string;
    timestamp: string;
}

interface CommentNextToFlashcardProps {
    isOpen: boolean;
    onToggle: () => void;
    comments: AIComment[];
    isLoading: boolean;
    onAskAi: (question: string) => void;
    currentFlashcardTitle?: string;
}

export const CommentNextToFlashcard: React.FC<CommentNextToFlashcardProps> = ({
    isOpen,
    onToggle,
    comments,
    isLoading,
    onAskAi,
    currentFlashcardTitle
}) => {
    const [inputValue, setInputValue] = useState("");
    const [activeTab, setActiveTab] = useState<'ai' | 'notes'>('ai');
    const [noteText, setNoteText] = useState("");
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    // Load note for current flashcard
    useEffect(() => {
        const loadNote = async () => {
            if (currentFlashcardTitle) {
                const note = await getFlashcardNote(currentFlashcardTitle);
                setNoteText(note.text || "");
                setSaveStatus('idle');
            }
        };
        loadNote();
    }, [currentFlashcardTitle]);

    const handleSaveNote = async () => {
        if (!currentFlashcardTitle) return;
        setSaveStatus('saving');
        const success = await saveFlashcardNote(currentFlashcardTitle, noteText);
        if (success) {
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
            setSaveStatus('error');
        }
    };

    const handleSend = () => {
        if (!inputValue.trim() || isLoading) return;
        onAskAi(inputValue);
        setInputValue("");
    };

    return (
        <div 
            className={`fixed right-0 top-0 h-full bg-[#0f172a]/90 backdrop-blur-2xl border-l border-white/10 transition-all duration-500 ease-in-out z-[160] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] ${
                isOpen ? 'w-96' : 'w-0'
            }`}
        >
            {/* Toggle Button (Visible when closed) */}
            {!isOpen && (
                <button 
                    onClick={onToggle}
                    className="absolute -left-12 top-1/2 -translate-y-1/2 w-12 h-24 bg-indigo-600 rounded-l-2xl flex items-center justify-center text-white hover:bg-indigo-500 transition-colors shadow-[-5px_0_15px_rgba(79,70,229,0.4)] group"
                >
                    <span className="material-symbols-outlined transition-transform group-hover:scale-125">smart_toy</span>
                    <div className="absolute -top-8 left-0 bg-indigo-600 text-[10px] font-bold px-2 py-1 rounded-t-lg rotate-90 origin-bottom-left whitespace-nowrap">AI TUTOR</div>
                </button>
            )}

            {/* Content Container */}
            <div className={`flex flex-col h-full overflow-hidden ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 delay-200`}>
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-indigo-900/20 to-transparent">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-white font-black text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-indigo-400">
                                    {activeTab === 'ai' ? 'psychology' : 'edit_note'}
                                </span>
                                {activeTab === 'ai' ? 'Gia Sư AI' : 'Kho Ghi Chú'}
                            </h3>
                            <p className="text-slate-400 text-xs mt-1">
                                {currentFlashcardTitle || 'Flashcard'}
                            </p>
                        </div>
                        <button 
                            onClick={onToggle}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">first_page</span>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                        <button 
                            onClick={() => setActiveTab('ai')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                                activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">smart_toy</span>
                            Hỏi AI
                        </button>
                        <button 
                            onClick={() => setActiveTab('notes')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                                activeTab === 'notes' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">inventory_2</span>
                            Ghi Chú
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {activeTab === 'ai' ? (
                    <>
                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {comments.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-3xl text-indigo-400">chat_bubble</span>
                                    </div>
                                    <p className="text-slate-400 text-sm max-w-[200px]">Bạn chưa có câu hỏi nào. Hãy nhập thắc mấc bên dưới!</p>
                                </div>
                            ) : (
                                comments.map((comment, index) => (
                                    <div key={comment.id || index} className="animate-fade-in group">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[14px] text-white">robot_2</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Phản hồi của AI</span>
                                            <span className="text-[10px] text-slate-500 ml-auto">{comment.timestamp ? new Date(comment.timestamp).toLocaleTimeString() : ''}</span>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-slate-300 leading-relaxed hover:border-indigo-500/30 transition-colors shadow-inner">
                                            <div 
                                                className="prose prose-invert prose-sm max-w-none prose-p:my-1" 
                                                dangerouslySetInnerHTML={{ __html: comment.text.replace(/\n/g, '<br/>') }} 
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                            {isLoading && (
                                <div className="flex items-center gap-3 animate-pulse">
                                    <div className="w-6 h-6 rounded-lg bg-slate-700"></div>
                                    <div className="h-4 bg-slate-700 rounded w-24"></div>
                                </div>
                            )}
                        </div>

                        {/* AI Input Area */}
                        <div className="p-6 border-t border-white/10 bg-black/40">
                            <div className="relative">
                                <textarea 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Gia sư ơi, giải thích lời giải này..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pb-12 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 outline-none transition-all resize-none min-h-[100px]"
                                />
                                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500 mr-2">Nhấn Enter để gửi</span>
                                    <button 
                                        onClick={handleSend}
                                        disabled={!inputValue.trim() || isLoading}
                                        className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        {isLoading ? (
                                            <span className="material-symbols-outlined animate-spin">autorenew</span>
                                        ) : (
                                            <span className="material-symbols-outlined">send</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Notes Area */}
                        <div className="flex-1 flex flex-col p-6 overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">sticky_note</span>
                                    Nội dung ghi chú
                                </span>
                                {saveStatus === 'success' && (
                                    <span className="text-[10px] text-green-400 flex items-center gap-1 animate-fade-in">
                                        <span className="material-symbols-outlined text-sm">done_all</span> Đã lưu vào RAG
                                    </span>
                                )}
                            </div>
                            
                            <textarea 
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Viết ghi chú quan trọng cho flashcard này tại đây... Dữ liệu này sẽ được đồng bộ vào bộ nhớ AI (RAG)."
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 outline-none transition-all resize-none mb-6 custom-scrollbar leading-relaxed"
                            />

                            <button 
                                onClick={handleSaveNote}
                                disabled={saveStatus === 'saving'}
                                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                                    saveStatus === 'saving' 
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:scale-[1.02] active:scale-95 shadow-indigo-500/20'
                                }`}
                            >
                                {saveStatus === 'saving' ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">autorenew</span>
                                        Đang đồng bộ hóa...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">cloud_sync</span>
                                        Lưu & Đồng bộ RAG
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] text-center text-slate-500 mt-4 italic">
                                * Ghi chú này sẽ được AI dùng làm ngữ cảnh khi bạn tra cứu sau này.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
