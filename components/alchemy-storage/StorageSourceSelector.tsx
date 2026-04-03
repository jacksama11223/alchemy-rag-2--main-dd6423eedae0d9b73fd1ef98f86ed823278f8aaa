import React from 'react';
import { StorageSourceType } from '../../types';

interface StorageSourceSelectorProps {
    selectedSource: StorageSourceType | 'all';
    onSelectSource: (source: StorageSourceType | 'all') => void;
}

const SOURCES: { id: StorageSourceType | 'all', label: string, icon: string, color: string }[] = [
    { id: 'all', label: 'Tất cả', icon: 'apps', color: 'bg-slate-100 text-slate-600' },
    { id: 'note', label: 'Ghi chú', icon: 'edit_note', color: 'bg-amber-100 text-amber-600' },
    { id: 'youtube', label: 'YouTube', icon: 'smart_display', color: 'bg-red-100 text-red-600' },
    { id: 'ocr', label: 'Quét ảnh', icon: 'document_scanner', color: 'bg-blue-100 text-blue-600' },
    { id: 'voice', label: 'Ghi âm', icon: 'mic', color: 'bg-orange-100 text-orange-600' },
    { id: 'web', label: 'Web/URL', icon: 'language', color: 'bg-emerald-100 text-emerald-600' },
    { id: 'upload', label: 'Tải lên', icon: 'upload_file', color: 'bg-purple-100 text-purple-600' },
    { id: 'drive', label: 'Google Drive', icon: 'add_to_drive', color: 'bg-blue-100 text-blue-600' },
    { id: 'unified', label: 'Tổng hợp', icon: 'summarize', color: 'bg-indigo-100 text-indigo-600' }
];

export const StorageSourceSelector: React.FC<StorageSourceSelectorProps> = ({ selectedSource, onSelectSource }) => {
    return (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200">
            {SOURCES.map(source => (
                <button
                    key={source.id}
                    onClick={() => onSelectSource(source.id)}
                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all shrink-0 ${
                        selectedSource === source.id 
                        ? 'border-sky-500 bg-sky-50 shadow-md scale-105' 
                        : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                    }`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${source.color}`}>
                        <span className="material-symbols-outlined">{source.icon}</span>
                    </div>
                    <span className={`font-bold ${selectedSource === source.id ? 'text-sky-700' : 'text-slate-700'}`}>
                        {source.label}
                    </span>
                </button>
            ))}
        </div>
    );
};
