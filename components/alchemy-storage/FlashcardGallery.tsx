import React, { useState } from 'react';
import { AlchemyStorageFlashcard } from '../../types';

interface FlashcardGalleryProps {
    flashcards: AlchemyStorageFlashcard[];
    onToggleSelect: (id: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onUpdateFlashcard: (card: AlchemyStorageFlashcard) => void;
    onRemoveFlashcard: (id: string) => void;
}

export const FlashcardGallery: React.FC<FlashcardGalleryProps> = ({ flashcards, onToggleSelect, onSelectAll, onDeselectAll, onUpdateFlashcard, onRemoveFlashcard }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeDeck, setActiveDeck] = useState<string | null>(null);
    const [editingCard, setEditingCard] = useState<AlchemyStorageFlashcard | null>(null);
    const [editFront, setEditFront] = useState('');
    const [editBack, setEditBack] = useState('');

    const handleStartEdit = (card: AlchemyStorageFlashcard, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingCard(card);
        setEditFront(card.front);
        setEditBack(card.back);
    };

    const handleSaveEdit = () => {
        if (editingCard) {
            onUpdateFlashcard({
                ...editingCard,
                front: editFront,
                back: editBack
            });
            setEditingCard(null);
        }
    };

    const decks = Array.from(new Set(flashcards.map(f => f.deckName || 'Thẻ lẻ'))) as string[];

    const filteredCards = flashcards.filter(card => {
        const matchesSearch = card.front.toLowerCase().includes(searchTerm.toLowerCase()) || card.back.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDeck = activeDeck ? (card.deckName || 'Thẻ lẻ') === activeDeck : true;
        return matchesSearch && matchesDeck;
    });

    const selectedCount = flashcards.filter(f => f.isSelected).length;

    const handleSelectDeck = (deckName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const deckCards = flashcards.filter(f => (f.deckName || 'Thẻ lẻ') === deckName);
        const allSelected = deckCards.every(f => f.isSelected);
        deckCards.forEach(card => {
            if (allSelected && card.isSelected) onToggleSelect(card.id);
            if (!allSelected && !card.isSelected) onToggleSelect(card.id);
        });
    };

    const handleDragStart = (e: React.DragEvent, deckName: string) => {
        const deckCards = flashcards.filter(f => (f.deckName || 'Thẻ lẻ') === deckName);
        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'deck', name: deckName, cards: deckCards }));
        
        // Ghost image
        const ghost = document.createElement('div');
        ghost.className = 'bg-amber-500 text-white px-4 py-2 rounded-xl font-bold shadow-xl opacity-80';
        ghost.textContent = `Bộ thẻ: ${deckName} (${deckCards.length} thẻ)`;
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 0);
        setTimeout(() => document.body.removeChild(ghost), 0);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">style</span> Kho Flashcard
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={onSelectAll} className="px-3 py-1.5 text-xs font-bold bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors">Chọn tất cả</button>
                        <button onClick={onDeselectAll} className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">Bỏ chọn</button>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm flashcard..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        />
                    </div>
                </div>
                <div className="text-xs text-slate-500 font-medium flex justify-between items-center">
                    <span>Đã chọn <span className="text-sky-600 font-bold">{selectedCount}</span> / {flashcards.length} flashcards</span>
                    {activeDeck && (
                        <button onClick={() => setActiveDeck(null)} className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">arrow_back</span> Quay lại thư mục
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 scrollbar-thin scrollbar-thumb-slate-200">
                {!activeDeck && !searchTerm ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {decks.map(deck => {
                            const deckCards = flashcards.filter(f => (f.deckName || 'Thẻ lẻ') === deck);
                            const selectedInDeck = deckCards.filter(f => f.isSelected).length;
                            return (
                                <div 
                                    key={deck}
                                    onClick={() => setActiveDeck(deck)}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, deck)}
                                    className="relative p-5 rounded-2xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md cursor-pointer transition-all duration-200 group flex flex-col items-center text-center gap-2"
                                >
                                    <div className="absolute top-3 right-3" onClick={(e) => handleSelectDeck(deck, e)}>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                            selectedInDeck === deckCards.length && deckCards.length > 0 ? 'border-sky-500 bg-sky-500 text-white' : 
                                            selectedInDeck > 0 ? 'border-sky-500 bg-sky-100 text-sky-500' : 'border-slate-300 bg-white'
                                        }`}>
                                            {selectedInDeck > 0 && <span className="material-symbols-outlined text-[14px] font-bold">{selectedInDeck === deckCards.length ? 'check' : 'remove'}</span>}
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-5xl text-amber-400 group-hover:scale-110 transition-transform">folder</span>
                                    <h3 className="font-bold text-slate-800">{deck}</h3>
                                    <p className="text-xs text-slate-500">{deckCards.length} thẻ</p>
                                </div>
                            );
                        })}
                    </div>
                ) : filteredCards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                        <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                        <p>Không tìm thấy flashcard nào.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCards.map(card => (
                            <div 
                                key={card.id}
                                onClick={() => onToggleSelect(card.id)}
                                className={`relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 group ${
                                    card.isSelected 
                                    ? 'border-sky-500 bg-sky-50 shadow-md ring-1 ring-sky-500/50' 
                                    : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-sm'
                                }`}
                            >
                                <div className="absolute top-3 right-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                        card.isSelected ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-300 bg-white'
                                    }`}>
                                        {card.isSelected && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                                    </div>
                                </div>
                                <div className="pr-8 mb-3">
                                    <p className="text-sm font-bold text-slate-800 line-clamp-2 mb-1">{card.front}</p>
                                    <p className="text-xs text-slate-500 line-clamp-2">{card.back}</p>
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex flex-wrap gap-1">
                                        {card.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-medium uppercase tracking-wider">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => handleStartEdit(card, e)}
                                            className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 hover:bg-sky-200 flex items-center justify-center transition-colors"
                                            title="Sửa thẻ"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onRemoveFlashcard(card.id); }}
                                            className="w-7 h-7 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors"
                                            title="Xóa thẻ"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingCard && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-[slideUp_0.3s]">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sky-500">edit_note</span>
                                Chỉnh sửa Flashcard
                            </h3>
                            <button onClick={() => setEditingCard(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mặt trước</label>
                                <textarea 
                                    value={editFront}
                                    onChange={e => setEditFront(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:border-sky-500 outline-none resize-none min-h-[100px]"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mặt sau</label>
                                <textarea 
                                    value={editBack}
                                    onChange={e => setEditBack(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:border-sky-500 outline-none resize-none min-h-[100px]"
                                />
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setEditingCard(null)} className="px-5 py-2 text-slate-500 hover:text-slate-700 font-medium transition-colors">Hủy</button>
                            <button 
                                onClick={handleSaveEdit}
                                className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
