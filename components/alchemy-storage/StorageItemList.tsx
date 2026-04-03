import React from 'react';
import { AlchemyStorageItem } from '../../types';

interface StorageItemListProps {
    items: AlchemyStorageItem[];
    onSelectItem: (item: AlchemyStorageItem) => void;
    selectedItemId?: string;
}

export const StorageItemList: React.FC<StorageItemListProps> = ({ items, onSelectItem, selectedItemId }) => {
    const handleDragStart = (e: React.DragEvent, item: AlchemyStorageItem) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'storageItem', item }));
        
        // Ghost image
        const ghost = document.createElement('div');
        ghost.className = 'bg-sky-500 text-white px-4 py-2 rounded-xl font-bold shadow-xl opacity-80 max-w-[200px] truncate';
        ghost.textContent = item.title;
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 0);
        setTimeout(() => document.body.removeChild(ghost), 0);
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
                <p>Không có dữ liệu nào trong kho.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-thumb-slate-200">
            {items.map(item => (
                <div 
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedItemId === item.id 
                        ? 'border-sky-500 bg-sky-50 shadow-md' 
                        : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                    }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800 line-clamp-1 flex-1 pr-4">{item.title}</h4>
                        <div className="flex gap-1 shrink-0">
                            {item.tags?.map(tag => (
                                <span key={tag} className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-600 rounded-full uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                            <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded-full uppercase tracking-wider">
                                {item.sourceType}
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                        {item.extractedText}
                    </p>
                    <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
