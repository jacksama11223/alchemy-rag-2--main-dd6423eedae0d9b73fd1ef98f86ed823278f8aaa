import React, { useState } from 'react';
import { AlchemyStorageFlashcard } from '../../types';

interface FlashcardAggregatorProps {
    flashcards: AlchemyStorageFlashcard[];
    onAggregate: (aggregatedCards: AlchemyStorageFlashcard[]) => void;
}

export const FlashcardAggregator: React.FC<FlashcardAggregatorProps> = ({ flashcards, onAggregate }) => {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const allTags = Array.from(new Set<string>(flashcards.flatMap(f => f.tags)));

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleAggregate = () => {
        if (selectedTags.length === 0) {
            alert("Vui lòng chọn ít nhất một tag để tổng hợp.");
            return;
        }
        const aggregated = flashcards.filter(card => 
            card.tags.some(tag => selectedTags.includes(tag))
        );
        onAggregate(aggregated);
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-fuchsia-600 flex items-center justify-center text-white shadow-md">
                    <span className="material-symbols-outlined text-2xl">join_inner</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Tổng hợp Flashcard</h3>
                    <p className="text-sm text-slate-500">Gộp theo chủ đề (Tags)</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
                {allTags.map(tag => (
                    <button 
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                            selectedTags.includes(tag) 
                            ? 'bg-purple-100 text-purple-700 border-purple-300 shadow-sm' 
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            <button 
                onClick={handleAggregate}
                disabled={selectedTags.length === 0}
                className={`w-full py-3 mt-2 rounded-2xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                    selectedTags.length > 0 
                    ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-400 hover:to-fuchsia-500 hover:shadow-lg hover:-translate-y-0.5' 
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
            >
                <span className="material-symbols-outlined">call_merge</span>
                Tổng hợp các thẻ đã chọn
            </button>
        </div>
    );
};
