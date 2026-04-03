
import React from 'react';
import { TodoTask, Project } from '../../types';
import { MilestoneMarker } from './MilestoneMarker';

interface TodoTaskItemProps {
    task: TodoTask;
    projects: Project[];
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    onClick: (task: TodoTask) => void;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
    onContextMenu?: (e: React.MouseEvent, task: TodoTask) => void;
}

export const TodoTaskItem: React.FC<TodoTaskItemProps> = ({ 
    task, projects, toggleTask, deleteTask, onClick, isSelected, onSelect, onContextMenu 
}) => {
    
    const getPriorityColor = (p: number) => {
        switch(p) {
            case 1: return 'border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
            case 2: return 'border-orange-500 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
            case 3: return 'border-blue-500 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
            default: return 'border-slate-500 text-slate-400';
        }
    };

    const getViewNameShort = (view: string) => {
        switch(view) {
            case 'alchemy': return 'Alchemy';
            case 'tutor': return 'Tutor';
            case 'explore-graph': return 'Graph';
            case 'draw': return 'Draw';
            case 'media': return 'Note';
            case 'drive': return 'Drive';
            case 'community': return 'Comm';
            default: return view;
        }
    };

    const project = projects.find(p => p.id === task.projectId);

    return (
        <div 
            onClick={() => onClick(task)}
            onContextMenu={(e) => onContextMenu && onContextMenu(e, task)}
            className={`group relative flex items-start gap-4 p-4 mb-2 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden
                ${isSelected ? 'bg-blue-900/30 border-blue-500 ring-1 ring-blue-500' : ''}
                ${task.isCompleted 
                    ? 'bg-[#1a1a1a]/50 border-transparent opacity-60 hover:opacity-100' 
                    : 'bg-[#1e1e1e] border-[#333] hover:border-slate-600 hover:shadow-lg hover:-translate-y-0.5'
                }`}
        >
            {/* Bulk Selection Checkbox (Visible on Hover or Selected) */}
            <div 
                className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                onClick={(e) => { e.stopPropagation(); onSelect && onSelect(task.id); }}
            >
                <div className={`w-4 h-4 rounded border ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-500 bg-[#121212]'}`}>
                    {isSelected && <span className="material-symbols-outlined text-[14px] text-white -mt-0.5 -ml-0.5 block">check</span>}
                </div>
            </div>

            {/* Priority Indicator Line on Left (Hidden if selection mode active logic could go here) */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300 ${
                task.priority === 1 ? 'bg-red-500' : 
                task.priority === 2 ? 'bg-orange-500' : 
                task.priority === 3 ? 'bg-blue-500' : 'bg-transparent'
            }`}></div>

            {/* Completion Checkbox */}
            <div className="pt-0.5 z-10 pl-4" onClick={(e) => e.stopPropagation()}>
                {task.isMilestone ? (
                    <div onClick={() => toggleTask(task.id)} className="cursor-pointer">
                        <MilestoneMarker isCompleted={task.isCompleted} />
                    </div>
                ) : (
                    <div 
                        onClick={() => toggleTask(task.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer ${
                            task.isCompleted 
                            ? 'bg-green-500 border-green-500 scale-110' 
                            : `${getPriorityColor(task.priority)} hover:bg-white/5`
                        }`}
                    >
                        <span className={`material-symbols-outlined text-base font-bold text-[#121212] transition-transform duration-300 ${task.isCompleted ? 'scale-100' : 'scale-0'}`}>
                            check
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                    <p className={`text-base font-medium transition-all duration-300 ${
                        task.isCompleted ? 'text-slate-500 line-through decoration-slate-600 decoration-2' : 'text-slate-100'
                    } ${task.isMilestone ? 'text-amber-400 font-bold uppercase tracking-wide' : ''}`}>
                        {task.content}
                    </p>
                    {task.isMilestone && <span className="material-symbols-outlined text-amber-500 text-sm">flag</span>}
                </div>
                
                {task.description && (
                    <p className={`text-sm transition-colors duration-300 line-clamp-1 ${task.isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                        {task.description}
                    </p>
                )}
                
                {/* Meta Tags Row */}
                <div className="flex flex-wrap items-center gap-3 mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    {/* Linked Feature Badge (New) */}
                    {task.linkedFeature && (
                        <div className="flex items-center gap-1 text-[10px] bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                            <span className="material-symbols-outlined text-[10px]">link</span>
                            {getViewNameShort(task.linkedFeature)}
                        </div>
                    )}

                    {/* Date */}
                    {task.dueDate && (
                        <div className={`flex items-center gap-1 text-xs font-bold ${
                            task.dueDate === 'today' ? 'text-green-400' : 
                            task.dueDate === 'tomorrow' ? 'text-purple-400' : 'text-slate-400'
                        }`}>
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            {task.dueDate === 'today' ? 'Hôm nay' : task.dueDate === 'tomorrow' ? 'Ngày mai' : task.dueDate}
                        </div>
                    )}

                    {/* Project Name */}
                    {project && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <span className="text-[10px] text-slate-600">#</span> {project.name}
                        </div>
                    )}
                    
                    {/* Tags */}
                    {task.tags && task.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            {tag}
                        </span>
                    ))}

                    {/* Subtasks Count */}
                    {task.subtasks && task.subtasks.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-md">
                            <span className="material-symbols-outlined text-[12px]">account_tree</span>
                            <span>{task.subtasks.filter(st => st.isCompleted).length}/{task.subtasks.length}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Hover Actions */}
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={() => onClick(task)}
                    className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                    title="Chỉnh sửa"
                >
                    <span className="material-symbols-outlined text-lg">edit</span>
                </button>
                <button 
                    onClick={() => deleteTask(task.id)} 
                    className="p-1.5 hover:bg-red-900/30 rounded text-slate-400 hover:text-red-400 transition-colors"
                    title="Xóa"
                >
                    <span className="material-symbols-outlined text-lg">delete</span>
                </button>
            </div>
        </div>
    );
};
