import React, { useState } from 'react';
import { AlchemyStorageFlashcard } from '../../types';

interface SelectedFlashcardListProps {
    flashcards: AlchemyStorageFlashcard[];
    onUpdateFlashcard: (updatedCard: AlchemyStorageFlashcard) => void;
    onRemoveFlashcard: (id: string) => void;
}

export const SelectedFlashcardList: React.FC<SelectedFlashcardListProps> = ({ flashcards, onUpdateFlashcard, onRemoveFlashcard }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFront, setEditFront] = useState('');
    const [editBack, setEditBack] = useState('');
    const [editTags, setEditTags] = useState('');

    const handleEditStart = (card: AlchemyStorageFlashcard) => {
        setEditingId(card.id);
        setEditFront(card.front);
        setEditBack(card.back);
        setEditTags(card.tags.join(', '));
    };

    const handleSave = (card: AlchemyStorageFlashcard) => {
        const updatedTags = editTags.split(',').map(t => t.trim()).filter(t => t !== '');
        onUpdateFlashcard({
            ...card,
            front: editFront,
            back: editBack,
            tags: updatedTags
        });
        setEditingId(null);
    };

    const handleCancel = () => {
        setEditingId(null);
    };

    if (flashcards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-3xl border border-slate-200 border-dashed text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">style</span>
                <p>Chưa có flashcard nào được chọn.</p>
                <p className="text-xs mt-1">Hãy chọn flashcard từ kho để bắt đầu.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex justify-between items-center mb-2 shrink-0">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sky-500">checklist</span> Danh sách đã chọn ({flashcards.length})
                </h3>
            </div>
            
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                {flashcards.map(card => (
                    <div key={card.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 transition-all hover:shadow-md">
                        {editingId === card.id ? (
                            <div className="flex flex-col gap-3 animate-[fadeIn_0.2s]">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Mặt trước</label>
                                    <input 
                                        type="text" 
                                        value={editFront} 
                                        onChange={(e) => setEditFront(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-sky-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Mặt sau</label>
                                    <textarea 
                                        value={editBack} 
                                        onChange={(e) => setEditBack(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-sky-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none h-20"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Tags (cách nhau bằng dấu phẩy)</label>
                                    <input 
                                        type="text" 
                                        value={editTags} 
                                        onChange={(e) => setEditTags(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-sky-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-2">
                                    <button onClick={handleCancel} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">Hủy</button>
                                    <button onClick={() => handleSave(card)} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all">Lưu thay đổi</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-800 mb-1">{card.front}</p>
                                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">{card.back}</p>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <button onClick={() => handleEditStart(card)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-sky-100 hover:text-sky-600 transition-colors">
                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                        </button>
                                        <button onClick={() => onRemoveFlashcard(card.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors">
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {card.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-medium uppercase tracking-wider">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
