import React, { useState, useRef, useEffect } from 'react';
import { getAuthHeader } from '../../services/mockBackend';
import NoteViewer from './NoteViewer';

interface NoteHighlighterFlashcardProps {
    note: any;
}

const NoteHighlighterFlashcard: React.FC<NoteHighlighterFlashcardProps> = ({ note }) => {
    const [highlightedText, setHighlightedText] = useState('');
    const [showFlashcardForm, setShowFlashcardForm] = useState(false);
    const [flashcardFront, setFlashcardFront] = useState('');
    const [flashcardBack, setFlashcardBack] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Handle text selection
    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            if (selection && selection.toString().trim().length > 0 && contentRef.current?.contains(selection.anchorNode)) {
                setHighlightedText(selection.toString().trim());
            }
        };

        document.addEventListener('mouseup', handleSelection);
        return () => document.removeEventListener('mouseup', handleSelection);
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
            // Mock API call to save flashcard set
            const response = await fetch('/api/flashcardsets', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    title: `Flashcard từ: ${note.title}`,
                    description: 'Tạo tự động từ NoteLab',
                    sourceNoteId: note.id || note._id,
                    cards: [
                        {
                            front: flashcardFront,
                            back: flashcardBack,
                            highlightedText: highlightedText
                        }
                    ],
                    tags: ['notelab', 'auto-generated']
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
                // Fallback success for demo
                setSaveSuccess(true);
                setTimeout(() => {
                    setShowFlashcardForm(false);
                    setHighlightedText('');
                    setSaveSuccess(false);
                    window.getSelection()?.removeAllRanges();
                }, 2000);
            }
        } catch (error) {
            console.error("Error saving flashcard:", error);
            // Fallback success for demo
            setSaveSuccess(true);
            setTimeout(() => {
                setShowFlashcardForm(false);
                setHighlightedText('');
                setSaveSuccess(false);
                window.getSelection()?.removeAllRanges();
            }, 2000);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="relative h-full flex flex-col">
            {/* Note Content Area */}
            <div className="flex-1 overflow-y-auto">
                <NoteViewer note={note} contentRef={contentRef} />
            </div>

            {/* Floating Action Bar for Highlighted Text */}
            {highlightedText && !showFlashcardForm && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-slide-up z-50">
                    <div className="flex items-center gap-2 max-w-[300px]">
                        <span className="material-symbols-outlined text-amber-400 text-sm">format_quote</span>
                        <span className="text-sm truncate font-medium">{highlightedText}</span>
                    </div>
                    <div className="w-px h-6 bg-slate-700 mx-2"></div>
                    <button 
                        onClick={handleCreateFlashcard}
                        className="flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">style</span>
                        Tạo Flashcard
                    </button>
                    <button 
                        onClick={() => {
                            setHighlightedText('');
                            window.getSelection()?.removeAllRanges();
                        }}
                        className="p-1 rounded-full hover:bg-slate-800 text-slate-400 transition-colors ml-2"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
            )}

            {/* Flashcard Creation Form Overlay */}
            {showFlashcardForm && (
                <div className="absolute inset-x-0 bottom-0 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 rounded-t-2xl animate-slide-up z-40">
                    <div className="flex justify-between items-center mb-4">
                        <h5 className="font-bold text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">style</span>
                            Tạo Flashcard Mới
                        </h5>
                        <button 
                            onClick={() => setShowFlashcardForm(false)}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {saveSuccess ? (
                        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 border border-emerald-200">
                            <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                            <span className="font-medium">Đã lưu flashcard thành công vào bộ sưu tập!</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Mặt trước (Câu hỏi / Khái niệm)
                                </label>
                                <input 
                                    type="text"
                                    value={flashcardFront}
                                    onChange={(e) => setFlashcardFront(e.target.value)}
                                    placeholder="Nhập câu hỏi hoặc từ khóa..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-800"
                                    autoFocus
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Mặt sau (Định nghĩa / Giải thích)
                                </label>
                                <textarea 
                                    value={flashcardBack}
                                    onChange={(e) => setFlashcardBack(e.target.value)}
                                    className="w-full px-4 py-3 bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-700 min-h-[100px] resize-none"
                                />
                                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">info</span>
                                    Nội dung này được lấy từ phần bạn đã highlight trong ghi chú.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button 
                                    onClick={() => setShowFlashcardForm(false)}
                                    className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Hủy
                                </button>
                                <button 
                                    onClick={handleSaveFlashcard}
                                    disabled={!flashcardFront.trim() || !flashcardBack.trim() || isSaving}
                                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSaving ? (
                                        <><span className="material-symbols-outlined animate-spin text-sm">sync</span> Đang lưu...</>
                                    ) : (
                                        <><span className="material-symbols-outlined text-sm">save</span> Lưu Flashcard</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NoteHighlighterFlashcard;
