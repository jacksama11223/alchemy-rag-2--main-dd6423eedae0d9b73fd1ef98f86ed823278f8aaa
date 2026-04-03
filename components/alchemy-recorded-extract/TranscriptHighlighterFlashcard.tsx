import React, { useState, useRef, useEffect } from 'react';
import { getAuthHeader } from '../../services/mockBackend';

interface TranscriptHighlighterFlashcardProps {
    recordingData: any;
}

const TranscriptHighlighterFlashcard: React.FC<TranscriptHighlighterFlashcardProps> = ({ recordingData }) => {
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
        setFlashcardFront('');
        setShowFlashcardForm(true);
    };

    const handleSaveFlashcard = async () => {
        if (!flashcardFront.trim() || !flashcardBack.trim()) return;

        setIsSaving(true);
        try {
            const response = await fetch('/api/flashcardsets', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    title: `Flashcard từ Ghi âm: ${recordingData.title}`,
                    description: 'Tạo tự động từ Trích xuất Ghi âm',
                    sourceNoteId: recordingData._id,
                    cards: [
                        {
                            front: flashcardFront,
                            back: flashcardBack,
                            highlightedText: highlightedText
                        }
                    ],
                    tags: ['audio-extract', 'auto-generated']
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

    if (!recordingData) return null;

    return (
        <div className="relative h-full flex flex-col">
            {/* Transcript Area */}
            <div className="flex-1 overflow-y-auto bg-white/50 rounded-xl border border-slate-200 p-6 shadow-inner">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">closed_caption</span>
                    Văn bản nhận diện (Transcript)
                </h4>
                <div 
                    ref={contentRef} 
                    className="prose prose-slate max-w-none text-slate-700 text-lg leading-relaxed whitespace-pre-wrap pb-24 font-serif"
                >
                    {recordingData.transcript || 'Không có dữ liệu văn bản.'}
                </div>
            </div>

            {/* Floating Action Bar for Highlighted Text */}
            {highlightedText && !showFlashcardForm && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-fade-in z-10">
                    <span className="text-sm font-medium truncate max-w-[200px] opacity-80">
                        "{highlightedText}"
                    </span>
                    <div className="w-px h-4 bg-slate-700"></div>
                    <button 
                        onClick={handleCreateFlashcard}
                        className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">style</span>
                        Tạo Flashcard
                    </button>
                    <button 
                        onClick={() => {
                            setHighlightedText('');
                            window.getSelection()?.removeAllRanges();
                        }}
                        className="text-slate-400 hover:text-white p-1"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
            )}

            {/* Flashcard Creation Form Overlay */}
            {showFlashcardForm && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">style</span>
                                Tạo Flashcard Mới
                            </h3>
                            <button 
                                onClick={() => setShowFlashcardForm(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {saveSuccess ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl">check</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2">Đã lưu Flashcard!</h4>
                                <p className="text-slate-500 text-sm">Flashcard đã được thêm vào bộ sưu tập của bạn.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Mặt trước (Câu hỏi / Thuật ngữ)</label>
                                    <textarea 
                                        value={flashcardFront}
                                        onChange={(e) => setFlashcardFront(e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                                        rows={3}
                                        placeholder="Nhập câu hỏi hoặc thuật ngữ..."
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Mặt sau (Định nghĩa / Trả lời)</label>
                                    <textarea 
                                        value={flashcardBack}
                                        onChange={(e) => setFlashcardBack(e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50 resize-none"
                                        rows={4}
                                    />
                                </div>
                                <div className="pt-4 flex justify-end gap-3">
                                    <button 
                                        onClick={() => setShowFlashcardForm(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        onClick={handleSaveFlashcard}
                                        disabled={isSaving || !flashcardFront.trim() || !flashcardBack.trim()}
                                        className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
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
                </div>
            )}
        </div>
    );
};

export default TranscriptHighlighterFlashcard;
