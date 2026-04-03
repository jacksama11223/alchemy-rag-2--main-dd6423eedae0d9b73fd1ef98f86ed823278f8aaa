import React, { useState } from 'react';
import { AlchemyStorageFlashcard } from '../../types';

interface FlashcardToGraphPushProps {
    selectedFlashcards: AlchemyStorageFlashcard[];
    onPushToGraph: (flashcards: AlchemyStorageFlashcard[]) => Promise<void> | void;
}

export const FlashcardToGraphPush: React.FC<FlashcardToGraphPushProps> = ({ selectedFlashcards, onPushToGraph }) => {
    const [isPushing, setIsPushing] = useState(false);

    const handlePush = async () => {
        if (selectedFlashcards.length === 0) {
            alert("Vui lòng chọn ít nhất một flashcard để đẩy lên Sơ đồ tri thức.");
            return;
        }
        setIsPushing(true);
        try {
            await onPushToGraph(selectedFlashcards);
        } finally {
            setIsPushing(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl border border-emerald-400/30 shadow-lg p-6 flex flex-col gap-4 text-white relative overflow-hidden group shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-inner">
                    <span className="material-symbols-outlined text-2xl">hub</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold">Đẩy lên Sơ đồ tri thức</h3>
                    <p className="text-emerald-100 text-sm">{selectedFlashcards.length} flashcards đã chọn</p>
                </div>
            </div>

            <p className="text-sm text-emerald-50 leading-relaxed relative z-10">
                Chuyển đổi các flashcard đã chọn thành các node kiến thức mới trên Sơ đồ tri thức của bạn. Các flashcard có cùng tag sẽ tự động được liên kết với nhau.
            </p>

            <button 
                onClick={handlePush}
                disabled={selectedFlashcards.length === 0 || isPushing}
                className={`w-full py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 relative z-10 ${
                    selectedFlashcards.length > 0 && !isPushing
                    ? 'bg-white text-emerald-700 shadow-md hover:bg-emerald-50 hover:shadow-lg hover:-translate-y-0.5' 
                    : 'bg-white/20 text-emerald-100 cursor-not-allowed'
                }`}
            >
                {isPushing ? (
                    <>
                        <span className="material-symbols-outlined animate-spin">sync</span>
                        Đang đẩy lên...
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined">publish</span>
                        Đẩy lên Graph
                    </>
                )}
            </button>
        </div>
    );
};
