
import React, { useState } from 'react';

interface ImportPlanProps {
    planData: { title: string, tasks: any[] };
    onCancel: () => void;
    onConfirm: (selectedTasks: any[]) => void;
}

export const ImportPlan: React.FC<ImportPlanProps> = ({ planData, onCancel, onConfirm }) => {
    // By default, select all tasks
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set(planData.tasks.map((_, i) => i)));

    const toggleSelection = (index: number) => {
        const newSet = new Set(selectedIndices);
        if (newSet.has(index)) newSet.delete(index);
        else newSet.add(index);
        setSelectedIndices(newSet);
    };

    const handleImport = () => {
        const tasksToImport = planData.tasks.filter((_, i) => selectedIndices.has(i));
        onConfirm(tasksToImport);
    };

    const toggleAll = () => {
        if (selectedIndices.size === planData.tasks.length) {
            setSelectedIndices(new Set());
        } else {
            setSelectedIndices(new Set(planData.tasks.map((_, i) => i)));
        }
    };

    const getPriorityLabel = (p: number) => {
        switch(p) {
            case 1: return <span className="text-[10px] bg-red-900/30 text-red-400 px-2 py-0.5 rounded border border-red-500/30">Cao</span>;
            case 2: return <span className="text-[10px] bg-orange-900/30 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">TB</span>;
            default: return <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">Thấp</span>;
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-[#1e293b] w-full max-w-3xl rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-[#0f172a] flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-400">playlist_add_check</span>
                            Xác Nhận Nhập Kế Hoạch
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">{planData.title || "Kế hoạch mới"}</p>
                    </div>
                    <button onClick={onCancel} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>

                {/* Toolbar */}
                <div className="px-6 py-3 bg-[#162032] border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            checked={selectedIndices.size === planData.tasks.length && planData.tasks.length > 0}
                            onChange={toggleAll}
                            className="w-4 h-4 rounded border-slate-500 bg-transparent checked:bg-green-500 cursor-pointer"
                        />
                        <span className="text-sm text-slate-300 font-bold">Chọn tất cả ({selectedIndices.size}/{planData.tasks.length})</span>
                    </div>
                </div>

                {/* Task List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#0f172a]">
                    {planData.tasks.map((task, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => toggleSelection(idx)}
                            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                                selectedIndices.has(idx) 
                                ? 'bg-green-900/10 border-green-500/50' 
                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                            }`}
                        >
                            <div className="pt-1">
                                <input 
                                    type="checkbox" 
                                    checked={selectedIndices.has(idx)}
                                    onChange={() => {}} // Handled by div click
                                    className="w-5 h-5 rounded border-slate-500 bg-transparent checked:bg-green-500 cursor-pointer"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-bold text-sm ${selectedIndices.has(idx) ? 'text-white' : 'text-slate-400'}`}>{task.content}</h4>
                                    {getPriorityLabel(task.priority)}
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed mb-2">{task.description}</p>
                                <div className="flex gap-2 text-[10px] text-slate-600">
                                    {task.dueDateOffset !== undefined && (
                                        <span className="flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded">
                                            <span className="material-symbols-outlined text-[10px]">event</span> 
                                            {task.dueDateOffset === 0 ? 'Today' : `+${task.dueDateOffset} days`}
                                        </span>
                                    )}
                                    {task.tags && task.tags.map((t: string, i: number) => (
                                        <span key={i} className="bg-black/20 px-1.5 py-0.5 rounded">#{t}</span>
                                    ))}
                                    {task.subtasks && task.subtasks.length > 0 && (
                                        <span className="flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded">
                                            <span className="material-symbols-outlined text-[10px]">list</span> 
                                            {task.subtasks.length} bước
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-[#162032] flex justify-end gap-3">
                    <button onClick={onCancel} className="px-6 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 font-bold transition-colors">
                        Hủy
                    </button>
                    <button 
                        onClick={handleImport}
                        disabled={selectedIndices.size === 0}
                        className="px-8 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-sm">download</span>
                        Nhập {selectedIndices.size} Công Việc
                    </button>
                </div>

            </div>
        </div>
    );
};
