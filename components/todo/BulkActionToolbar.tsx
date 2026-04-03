
import React from 'react';

interface BulkActionToolbarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onDelete: () => void;
    onComplete: () => void;
    onMove: () => void;
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({ selectedCount, onClearSelection, onDelete, onComplete, onMove }) => {
    if (selectedCount === 0) return null;

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1e1e1e] border border-[#444] rounded-full px-6 py-3 shadow-2xl flex items-center gap-6 animate-[slideInUp_0.3s]">
            <div className="flex items-center gap-2 border-r border-[#444] pr-4">
                <span className="font-bold text-white">{selectedCount}</span>
                <span className="text-slate-400 text-sm">đã chọn</span>
                <button onClick={onClearSelection} className="ml-2 text-slate-500 hover:text-white">
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>
            
            <div className="flex gap-4">
                <button onClick={onComplete} className="flex flex-col items-center gap-1 group">
                    <span className="material-symbols-outlined text-green-500 group-hover:scale-110 transition-transform">check_circle</span>
                    <span className="text-[10px] text-slate-400">Hoàn thành</span>
                </button>
                <button onClick={onMove} className="flex flex-col items-center gap-1 group">
                    <span className="material-symbols-outlined text-blue-500 group-hover:scale-110 transition-transform">folder_move</span>
                    <span className="text-[10px] text-slate-400">Di chuyển</span>
                </button>
                <button onClick={onDelete} className="flex flex-col items-center gap-1 group">
                    <span className="material-symbols-outlined text-red-500 group-hover:scale-110 transition-transform">delete</span>
                    <span className="text-[10px] text-slate-400">Xóa</span>
                </button>
            </div>
        </div>
    );
};
