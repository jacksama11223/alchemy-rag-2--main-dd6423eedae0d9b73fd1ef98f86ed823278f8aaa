
import React from 'react';
import { TodoTask } from '../../types';

interface TrashBinProps {
    deletedTasks: TodoTask[];
    onRestore: (id: string) => void;
    onPermanentDelete: (id: string) => void;
}

export const TrashBin: React.FC<TrashBinProps> = ({ deletedTasks, onRestore, onPermanentDelete }) => {
    return (
        <div className="w-full bg-[#1e1e1e] rounded-xl border border-red-900/30 overflow-hidden flex flex-col animate-[fadeIn_0.3s]">
            <div className="p-4 bg-red-900/10 border-b border-red-900/20 flex justify-between items-center">
                <h3 className="font-bold text-red-200 text-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">delete_forever</span> Thùng rác
                </h3>
                <span className="text-xs text-red-300/70">Tự động xóa sau 30 ngày</span>
            </div>
            
            <div className="p-4 space-y-2 min-h-[200px]">
                {deletedTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-600">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">recycling</span>
                        <p className="text-sm">Thùng rác trống</p>
                    </div>
                ) : (
                    deletedTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-[#252525] rounded-lg border border-[#333] group">
                            <span className="text-slate-400 text-sm line-through decoration-slate-600">{task.content}</span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => onRestore(task.id)}
                                    className="p-1.5 bg-green-900/30 text-green-400 rounded hover:bg-green-900/50"
                                    title="Khôi phục"
                                >
                                    <span className="material-symbols-outlined text-sm">restore_from_trash</span>
                                </button>
                                <button 
                                    onClick={() => onPermanentDelete(task.id)}
                                    className="p-1.5 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50"
                                    title="Xóa vĩnh viễn"
                                >
                                    <span className="material-symbols-outlined text-sm">delete_forever</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
