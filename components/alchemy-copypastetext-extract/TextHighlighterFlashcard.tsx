import React, { useState, useRef, useEffect } from 'react';
import { getAuthHeader } from '../../services/mockBackend';

interface TextHighlighterFlashcardProps {
    textObj: any;
}

const TextHighlighterFlashcard: React.FC<TextHighlighterFlashcardProps> = ({ textObj }) => {
    const [highlightedText, setHighlightedText] = useState('');
    const [showFlashcardForm, setShowFlashcardForm] = useState(false);
    const [flashcardFront, setFlashcardFront] = useState('');
    const [flashcardBack, setFlashcardBack] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);

    // Handle text selection
    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            if (selection && selection.toString().trim().length > 0) {
                // Check if selection is within our text container
                if (textRef.current && textRef.current.contains(selection.anchorNode)) {
                    setHighlightedText(selection.toString().trim());
                }
            }
        };

        document.addEventListener('mouseup', handleSelection);
        return () => {
            document.removeEventListener('mouseup', handleSelection);
        };
    }, []);

    const handleCreateFlashcard = () => {
        setFlashcardBack(highlightedText);
        setFlashcardFront(''); // User needs to fill this
        setShowFlashcardForm(true);
        setSaveSuccess(false);
    };

    const handleSaveFlashcard = async () => {
        if (!flashcardFront.trim() || !flashcardBack.trim()) return;

        setIsSaving(true);
        try {
            const response = await fetch('/api/flashcardsets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({
                    title: `Flashcard từ: ${textObj.title}`,
                    description: 'Tạo tự động từ Dán Văn Bản',
                    sourceNoteId: textObj._id || textObj.id,
                    cards: [
                        {
                            front: flashcardFront,
                            back: flashcardBack,
                            highlightedText: highlightedText
                        }
                    ],
                    tags: ['copypaste', 'auto-generated']
                })
            });

            if (response.ok) {
                setSaveSuccess(true);
                setTimeout(() => {
                    setShowFlashcardForm(false);
                    setHighlightedText('');
                    setSaveSuccess(false);
                    window.getSelection()?.removeAllRanges();
                }, 2000);
            } else {
                console.error("Failed to save flashcard");
            }
        } catch (error) {
            console.error("Error saving flashcard:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="relative h-full flex flex-col">
            {/* Text Content Area */}
            <div 
                ref={textRef}
                className="flex-1 overflow-y-auto text-slate-700 leading-relaxed whitespace-pre-wrap"
            >
                {textObj.content}
            </div>

            {/* Floating Action Button for Selection */}
            {highlightedText && !showFlashcardForm && (
                <div className="sticky bottom-4 left-0 right-0 flex justify-center animate-fade-in z-10">
                    <div className="bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-4">
                        <div className="max-w-[200px] truncate text-sm text-slate-300">
                            "{highlightedText}"
                        </div>
                        <button 
                            onClick={handleCreateFlashcard}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">style</span>
                            Tạo Flashcard
                        </button>
                    </div>
                </div>
            )}

            {/* Flashcard Creation Form */}
            {showFlashcardForm && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col p-6 rounded-2xl border border-slate-200 shadow-lg animate-slide-up">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-500">style</span>
                            Tạo Flashcard Mới
                        </h4>
                        <button 
                            onClick={() => setShowFlashcardForm(false)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {saveSuccess ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-emerald-600 gap-3">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl">check_circle</span>
                            </div>
                            <p className="font-medium text-lg">Đã lưu Flashcard thành công!</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
                            <div className="group">
                                <label className="block text-sm font-medium text-slate-700 mb-1 group-focus-within:text-emerald-600 transition-colors">Mặt trước (Câu hỏi / Từ vựng)</label>
                                <input 
                                    type="text" 
                                    value={flashcardFront}
                                    onChange={(e) => setFlashcardFront(e.target.value)}
                                    placeholder="Nhập câu hỏi hoặc từ vựng..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50 focus:bg-white shadow-sm"
                                    autoFocus
                                />
                            </div>
                            
                            <div className="flex-1 flex flex-col group">
                                <label className="block text-sm font-medium text-slate-700 mb-1 group-focus-within:text-emerald-600 transition-colors">Mặt sau (Câu trả lời / Định nghĩa)</label>
                                <textarea 
                                    value={flashcardBack}
                                    onChange={(e) => setFlashcardBack(e.target.value)}
                                    className="w-full flex-1 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none transition-all shadow-inner focus:bg-white"
                                />
                                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">info</span>
                                    Nội dung đã được tự động điền từ phần bạn bôi đen.
                                </p>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 mt-auto">
                                <button 
                                    onClick={() => setShowFlashcardForm(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                                >
                                    Hủy
                                </button>
                                <button 
                                    onClick={handleSaveFlashcard}
                                    disabled={!flashcardFront.trim() || !flashcardBack.trim() || isSaving}
                                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-sm">save</span>
                                    )}
                                    Lưu Flashcard
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TextHighlighterFlashcard;
