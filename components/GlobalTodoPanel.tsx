
import React, { useState } from 'react';
import { TodoTask } from '../types';
import { decomposeComplexTask } from '../services/geminiService'; // Import

interface GlobalTodoPanelProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: TodoTask[];
    onAddTask: (content: string, desc: string, priority: 1|2|3|4, dueDate: string|null, feature?: string) => void;
    onToggleTask: (id: string) => void;
    currentView: string;
    onNavigate: (view: string) => void;
}

export const GlobalTodoPanel: React.FC<GlobalTodoPanelProps> = ({ 
    isOpen, onClose, tasks, onAddTask, onToggleTask, currentView, onNavigate 
}) => {
    const [newTaskContent, setNewTaskContent] = useState('');
    const [filter, setFilter] = useState<'all' | 'current'>('current');
    const [isExpanding, setIsExpanding] = useState(false);

    // Filter tasks based on current view context if requested
    const displayTasks = tasks.filter(t => {
        if (t.isDeleted || t.isCompleted) return false;
        if (filter === 'current' && t.linkedFeature) {
             return t.linkedFeature === currentView;
        }
        return true;
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskContent.trim()) return;
        
        onAddTask(newTaskContent, '', 4, 'today', currentView);
        setNewTaskContent('');
    };

    const handleMagicExpand = async () => {
        if (!newTaskContent.trim()) return;
        setIsExpanding(true);
        const subtasks = await decomposeComplexTask(newTaskContent);
        
        // Add main task
        onAddTask(newTaskContent, 'AI Decomposed Task', 1, 'today', currentView);
        
        // Add subtasks (Simulation: just adding them as separate tasks linked to same view for now)
        // In a real implementation, we would add them as `subtasks` array to the main task
        subtasks.forEach((st: any) => {
            onAddTask(`↳ ${st.content}`, '', st.priority, 'today', currentView);
        });

        setIsExpanding(false);
        setNewTaskContent('');
    };

    const getViewName = (view: string) => {
        switch(view) {
            case 'alchemy': return 'Giả kim thuật';
            case 'tutor': return 'Gia sư';
            case 'explore-graph': return 'Sơ đồ';
            case 'draw': return 'Draw';
            case 'media': return 'Ghi chú';
            case 'drive': return 'Drive';
            case 'community': return 'Cộng đồng';
            default: return 'Chung';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-20 right-6 bottom-6 w-80 bg-[#1e1e1e] border border-white/20 rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden animate-slide-left backdrop-blur-md">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-[#252525] flex justify-between items-center">
                <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400 text-lg">checklist</span>
                        Kế hoạch
                    </h3>
                    <p className="text-[10px] text-slate-400">Đang ở: <span className="text-amber-200 font-bold">{getViewName(currentView)}</span></p>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-white/10 bg-[#1a1a1a]">
                <button 
                    onClick={() => setFilter('current')}
                    className={`flex-1 py-2 text-xs font-bold transition-colors ${filter === 'current' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:text-white'}`}
                >
                    Trang này
                </button>
                <button 
                    onClick={() => setFilter('all')}
                    className={`flex-1 py-2 text-xs font-bold transition-colors ${filter === 'all' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:text-white'}`}
                >
                    Tất cả
                </button>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-[#121212]/50 scrollbar-thin scrollbar-thumb-slate-700">
                {displayTasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs italic">
                        {filter === 'current' ? 'Chưa có việc nào cho tính năng này.' : 'Không có công việc cần làm.'}
                    </div>
                ) : (
                    displayTasks.map(task => (
                        <div key={task.id} className="bg-[#262626] border border-white/5 p-2 rounded-lg group hover:border-slate-500 transition-colors">
                            <div className="flex items-start gap-2">
                                <button 
                                    onClick={() => onToggleTask(task.id)}
                                    className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${task.isCompleted ? 'bg-green-500 border-green-500' : 'border-slate-500 hover:border-white'}`}
                                >
                                    {task.isCompleted && <span className="material-symbols-outlined text-[10px] text-black">check</span>}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm text-slate-200 break-words ${task.isCompleted ? 'line-through text-slate-500' : ''}`}>{task.content}</p>
                                    
                                    {/* Linked Feature Badge */}
                                    {task.linkedFeature && filter === 'all' && (
                                        <button 
                                            onClick={() => onNavigate(task.linkedFeature!)}
                                            className="mt-1 flex items-center gap-1 text-[9px] bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded hover:bg-blue-800/50 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[10px]">link</span>
                                            {getViewName(task.linkedFeature)}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Quick Add with AI */}
            <div className="p-3 border-t border-white/10 bg-[#1e1e1e]">
                <form onSubmit={handleAdd} className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Thêm nhanh..." 
                        className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        value={newTaskContent}
                        onChange={(e) => setNewTaskContent(e.target.value)}
                    />
                    <button 
                        type="button"
                        onClick={handleMagicExpand}
                        disabled={isExpanding || !newTaskContent.trim()}
                        className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-3 py-2 disabled:opacity-50"
                        title="Atomic Task Decomposition (AI)"
                    >
                        <span className={`material-symbols-outlined text-sm ${isExpanding ? 'animate-spin' : ''}`}>
                            {isExpanding ? 'sync' : 'auto_fix'}
                        </span>
                    </button>
                    <button 
                        type="submit"
                        disabled={!newTaskContent.trim()}
                        className="bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-3 py-2 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                </form>
            </div>
            
            <div className="bg-blue-900/20 py-1 text-center cursor-pointer hover:bg-blue-900/40 transition-colors" onClick={() => { onClose(); onNavigate('digest'); }}>
                 <span className="text-[10px] text-blue-300 font-bold uppercase">Mở quản lý đầy đủ</span>
            </div>
        </div>
    );
};
