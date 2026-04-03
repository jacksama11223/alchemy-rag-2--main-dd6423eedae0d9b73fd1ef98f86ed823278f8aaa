
import React from 'react';
import { TodoTask } from '../../types';
import { SubtaskList } from './SubtaskList';
import { TagManager } from './TagManager';
import { AttachmentList } from './AttachmentList';
import { CommentSection } from './CommentSection';
import { RecurringTaskConfig } from './RecurringTaskConfig';
import { SmartReminder } from './SmartReminder';

interface TaskDetailModalProps {
    task: TodoTask;
    onClose: () => void;
    onUpdateTask: (updatedTask: TodoTask) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, onUpdateTask }) => {
    
    // Handlers
    const handleAddSubtask = (content: string) => {
        const newSubtask = { id: Date.now().toString(), content, isCompleted: false };
        onUpdateTask({ ...task, subtasks: [...(task.subtasks || []), newSubtask] });
    };

    const handleToggleSubtask = (id: string) => {
        const updatedSubtasks = task.subtasks?.map(st => st.id === id ? { ...st, isCompleted: !st.isCompleted } : st);
        onUpdateTask({ ...task, subtasks: updatedSubtasks });
    };

    const handleDeleteSubtask = (id: string) => {
        const updatedSubtasks = task.subtasks?.filter(st => st.id !== id);
        onUpdateTask({ ...task, subtasks: updatedSubtasks });
    };

    const handleAddTag = (tag: string) => {
        if (!task.tags?.includes(tag)) {
            onUpdateTask({ ...task, tags: [...(task.tags || []), tag] });
        }
    };

    const handleRemoveTag = (tag: string) => {
        onUpdateTask({ ...task, tags: task.tags?.filter(t => t !== tag) });
    };

    // Attachments
    const handleAddAttachment = (file: any) => {
        onUpdateTask({ ...task, attachments: [...(task.attachments || []), file] });
    };
    const handleRemoveAttachment = (id: string) => {
        onUpdateTask({ ...task, attachments: task.attachments?.filter(a => a.id !== id) });
    };

    // Comments
    const handleAddComment = (text: string) => {
        const newComment = { 
            id: Date.now().toString(), 
            text, 
            createdAt: new Date().toISOString(), 
            author: 'Me' 
        };
        onUpdateTask({ ...task, comments: [...(task.comments || []), newComment] });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
            <div 
                className="bg-[#1e1e1e] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#333] flex flex-col max-h-[90vh] animate-[slideInUp_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#333] bg-[#252525]">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => onUpdateTask({ ...task, isCompleted: !task.isCompleted })}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                task.isCompleted 
                                ? 'bg-green-900/30 text-green-400 border-green-500/50 hover:bg-green-900/50' 
                                : 'border-slate-600 text-slate-300 hover:bg-white/10 hover:border-slate-400'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">{task.isCompleted ? 'check_circle' : 'radio_button_unchecked'}</span>
                            {task.isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-mono bg-black/20 px-2 py-1 rounded">ID: {task.id.slice(-4)}</span>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-[#444] grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Column: Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <input 
                                type="text" 
                                className="w-full bg-transparent text-2xl font-bold text-white border-none focus:ring-0 p-0 mb-3 placeholder-slate-600 leading-tight"
                                value={task.content}
                                onChange={(e) => onUpdateTask({ ...task, content: e.target.value })}
                                placeholder="Tên công việc"
                            />
                            
                            <textarea 
                                className="w-full bg-transparent text-slate-300 text-sm border-none focus:ring-0 p-0 resize-none min-h-[80px] placeholder-slate-600 mb-2 leading-relaxed"
                                value={task.description || ''}
                                onChange={(e) => onUpdateTask({ ...task, description: e.target.value })}
                                placeholder="Mô tả chi tiết, ghi chú, link tài liệu..."
                            />
                        </div>

                        <SubtaskList 
                            subtasks={task.subtasks || []}
                            onAddSubtask={handleAddSubtask}
                            onToggleSubtask={handleToggleSubtask}
                            onDeleteSubtask={handleDeleteSubtask}
                        />

                        <AttachmentList 
                            attachments={task.attachments || []}
                            onAddAttachment={handleAddAttachment}
                            onRemoveAttachment={handleRemoveAttachment}
                        />

                        <CommentSection 
                            comments={task.comments || []}
                            onAddComment={handleAddComment}
                        />
                    </div>

                    {/* Right Column: Meta & Config */}
                    <div className="space-y-6">
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hạn chót</label>
                                <div className="flex gap-2">
                                    <button onClick={() => onUpdateTask({ ...task, dueDate: 'today' })} className={`flex-1 py-1 text-xs border rounded ${task.dueDate === 'today' ? 'bg-green-900/30 border-green-500 text-green-400' : 'border-[#444] text-slate-400'}`}>Hôm nay</button>
                                    <button onClick={() => onUpdateTask({ ...task, dueDate: 'tomorrow' })} className={`flex-1 py-1 text-xs border rounded ${task.dueDate === 'tomorrow' ? 'bg-purple-900/30 border-purple-500 text-purple-400' : 'border-[#444] text-slate-400'}`}>Mai</button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ưu tiên</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map((p) => (
                                        <button 
                                            key={p}
                                            onClick={() => onUpdateTask({ ...task, priority: p as any })}
                                            className={`flex-1 h-8 rounded border flex items-center justify-center text-xs font-bold transition-all ${
                                                task.priority === p 
                                                ? 'border-white text-white bg-white/10' 
                                                : 'border-[#444] text-slate-500 hover:border-slate-500'
                                            }`}
                                            style={{ color: task.priority === p ? (p===1?'#ef4444':p===2?'#f97316':p===3?'#3b82f6':'#94a3b8') : undefined }}
                                        >
                                            P{p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nhắc nhở</label>
                                <SmartReminder 
                                    reminderTime={task.reminderTime} 
                                    onSetReminder={(time) => onUpdateTask({...task, reminderTime: time})} 
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lặp lại</label>
                                <RecurringTaskConfig 
                                    recurrence={task.recurrence || 'none'}
                                    onChange={(val) => onUpdateTask({...task, recurrence: val})}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tags</label>
                            <TagManager 
                                tags={task.tags || []} 
                                onAddTag={handleAddTag} 
                                onRemoveTag={handleRemoveTag} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
