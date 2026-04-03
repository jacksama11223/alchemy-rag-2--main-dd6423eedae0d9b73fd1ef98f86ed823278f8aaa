import React, { useState } from 'react';
import { TodoTask } from '../../types';

interface KanbanBoardProps {
    tasks: TodoTask[];
    onTaskClick: (task: TodoTask) => void;
    onUpdateStatus: (taskId: string, status: 'todo' | 'in-progress' | 'done') => void;
    onAdd?: (status: string, title?: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskClick, onUpdateStatus, onAdd }) => {
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    const columns = [
        { id: 'todo', title: 'Cần làm', color: 'bg-slate-500', headerBg: 'bg-slate-900/50', border: 'border-slate-500/30' },
        { id: 'in-progress', title: 'Đang làm', color: 'bg-blue-500', headerBg: 'bg-blue-900/20', border: 'border-blue-500/30' },
        { id: 'done', title: 'Hoàn thành', color: 'bg-green-500', headerBg: 'bg-green-900/20', border: 'border-green-500/30' }
    ];

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
        // Add a class to body to indicate dragging if needed
    };

    const handleDrop = (e: React.DragEvent, status: 'todo' | 'in-progress' | 'done') => {
        e.preventDefault();
        if (draggedTaskId) {
            onUpdateStatus(draggedTaskId, status);
            setDraggedTaskId(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="flex gap-6 h-full overflow-x-auto pb-4 animate-[fadeIn_0.3s]">
            {columns.map(col => {
                // Filter tasks for this column based on the PASSED filtered list
                const colTasks = tasks.filter(t => (t.status || (t.isCompleted ? 'done' : 'todo')) === col.id);
                
                return (
                    <div 
                        key={col.id} 
                        className={`flex-1 min-w-[300px] bg-[#1e1e1e] rounded-xl border border-[#333] flex flex-col shadow-lg transition-colors ${draggedTaskId ? 'hover:border-slate-500' : ''}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.id as any)}
                    >
                        <div className={`p-4 border-b border-[#333] flex justify-between items-center ${col.headerBg} rounded-t-xl backdrop-blur-sm`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${col.color} shadow-[0_0_8px_currentColor]`}></div>
                                <h3 className="font-bold text-white text-sm uppercase tracking-wide">{col.title}</h3>
                            </div>
                            <span className="text-xs bg-black/40 px-2 py-0.5 rounded text-slate-300 font-bold border border-white/5">{colTasks.length}</span>
                        </div>
                        
                        <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-[#444] bg-[#121212]/30">
                            {colTasks.map(task => (
                                <div 
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    onClick={() => onTaskClick(task)}
                                    className="p-4 bg-[#262626] rounded-xl border border-[#333] hover:border-slate-500 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${task.priority === 1 ? 'bg-red-900/30 text-red-400 border border-red-500/30' : 'bg-[#333] text-slate-400'}`}>
                                            {task.priority === 1 ? 'High Priority' : `P${task.priority}`}
                                        </span>
                                        {task.dueDate === 'today' && <span className="text-[10px] text-green-400 font-bold bg-green-900/20 px-2 py-0.5 rounded">Hôm nay</span>}
                                    </div>
                                    <p className="text-sm font-medium text-slate-200 line-clamp-2 mb-3 leading-relaxed">{task.content}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 border-t border-[#333] pt-2">
                                        {task.subtasks && task.subtasks.length > 0 && (
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">checklist</span> {task.subtasks.filter(s=>s.isCompleted).length}/{task.subtasks.length}</span>
                                        )}
                                        {task.comments && task.comments.length > 0 && (
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">chat_bubble</span> {task.comments.length}</span>
                                        )}
                                        {task.isMilestone && <span className="text-amber-500 material-symbols-outlined text-[14px]">flag</span>}
                                    </div>
                                </div>
                            ))}
                            {colTasks.length === 0 && (
                                <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-[#333] rounded-xl text-slate-600 text-xs">
                                    <span className="material-symbols-outlined text-2xl mb-1 opacity-50">drag_indicator</span>
                                    Thả công việc vào đây
                                </div>
                            )}
                        </div>

                        {/* Add Task Button */}
                        {onAdd && (
                            <button 
                                onClick={() => {
                                    const title = prompt("Tên công việc:");
                                    if (title) onAdd(col.id, title);
                                }}
                                className="m-3 mt-0 py-2 border border-dashed border-[#444] rounded-xl text-xs font-bold text-slate-500 hover:text-white hover:border-slate-400 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">add</span> Thêm thẻ
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};