
import React from 'react';
import { Project, TodoTask } from '../../types';
import { ThemeSwitcher } from './ThemeSwitcher';

interface TodoSidebarProps {
    isOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    activeView: string;
    setActiveView: (view: string) => void;
    projects: Project[];
    tasks: TodoTask[];
    completedCount: number;
    onOpenTemplates: () => void;
    onAddProject: () => void;
    onEditProject: (project: Project) => void; // New prop
    onDeleteProject: (id: string) => void;
}

export const TodoSidebar: React.FC<TodoSidebarProps> = ({
    isOpen, setIsSidebarOpen, activeView, setActiveView, projects, tasks, completedCount, onOpenTemplates, onAddProject, onEditProject, onDeleteProject
}) => {
    // Extract unique tags from all tasks
    const allTags = Array.from(new Set(tasks.flatMap(t => t.tags || []))).sort();

    return (
        <div className={`${isOpen ? 'w-[280px] opacity-100' : 'w-0 opacity-0'} bg-[#121212] flex flex-col border-r border-[#333] transition-all duration-300 ease-in-out overflow-hidden shrink-0`}>
            {/* User Profile Area */}
            <div className="p-4 flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 p-2 rounded-xl transition-colors select-none">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-600 flex items-center justify-center text-[#121212] font-black shadow-lg">
                            <span className="material-symbols-outlined text-xl">person</span>
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#121212] rounded-full"></div>
                    </div>
                    <div>
                        <p className="font-bold text-sm text-white leading-tight">Thuyền trưởng</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Free Plan</p>
                    </div>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined text-xl">first_page</span>
                </button>
            </div>

            {/* Main Navigation */}
            <div className="px-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#333]">
                <div className="space-y-1 mb-6">
                    <SidebarItem 
                        icon="inbox" 
                        label="Inbox" 
                        count={tasks.filter(t => (t.projectId === 'inbox' || !t.projectId) && !t.isCompleted && !t.isDeleted).length}
                        isActive={activeView === 'inbox'}
                        onClick={() => setActiveView('inbox')}
                        color="text-blue-400"
                    />
                    <SidebarItem 
                        icon="calendar_today" 
                        label="Hôm nay" 
                        count={tasks.filter(t => t.dueDate === 'today' && !t.isCompleted && !t.isDeleted).length}
                        isActive={activeView === 'today'}
                        onClick={() => setActiveView('today')}
                        color="text-green-400"
                    />
                    <SidebarItem 
                        icon="calendar_month" 
                        label="Sắp tới" 
                        count={tasks.filter(t => (t.dueDate === 'tomorrow' || t.dueDate === 'upcoming') && !t.isCompleted && !t.isDeleted).length}
                        isActive={activeView === 'upcoming'}
                        onClick={() => setActiveView('upcoming')}
                        color="text-purple-400"
                    />
                </div>

                <div className="mb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Views</div>
                <div className="space-y-1 mb-6">
                    <SidebarItem 
                        icon="view_kanban" 
                        label="Kanban Board" 
                        isActive={activeView === 'kanban'}
                        onClick={() => setActiveView('kanban')}
                        color="text-orange-400"
                    />
                    <SidebarItem 
                        icon="calendar_view_month" 
                        label="Lịch biểu" 
                        isActive={activeView === 'calendar'}
                        onClick={() => setActiveView('calendar')}
                        color="text-red-400"
                    />
                </div>

                {/* Projects Header */}
                <div className="mb-2 px-4 flex justify-between items-center group cursor-pointer" onClick={onAddProject}>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Dự án</span>
                    <button className="text-slate-500 hover:text-white transition-all p-1 hover:bg-white/10 rounded">
                        <span className="material-symbols-outlined text-base">add</span>
                    </button>
                </div>
                
                {/* Projects List */}
                <div className="space-y-1 mb-6">
                    {projects.map(p => (
                        <div 
                            key={p.id} 
                            onClick={() => setActiveView(p.id)}
                            className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${
                                activeView === p.id 
                                ? 'bg-[#262626] text-white shadow-inner' 
                                : 'text-slate-400 hover:bg-[#1a1a1a] hover:text-slate-200'
                            }`}
                        >
                            {/* Active Indicator Line */}
                            {activeView === p.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 bg-amber-500 rounded-r-full"></div>}
                            
                            <span className={`material-symbols-outlined text-sm transition-colors ${activeView === p.id ? p.color : 'text-slate-600 group-hover:text-slate-500'}`}>
                                {p.icon || 'tag'}
                            </span>
                            
                            <span className="text-sm font-medium flex-1 truncate">{p.name}</span>
                            
                            <span className="text-xs text-slate-600 group-hover:text-slate-500 transition-colors mr-2">
                                {tasks.filter(t => t.projectId === p.id && !t.isCompleted && !t.isDeleted).length}
                            </span>
                            
                            {/* Actions (Edit/Delete) - Not for Inbox */}
                            {p.id !== 'inbox' && (
                                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); onEditProject(p); }}
                                        className="text-slate-600 hover:text-blue-400 p-0.5 rounded hover:bg-white/5"
                                        title="Chỉnh sửa"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">edit</span>
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id); }}
                                        className="text-slate-600 hover:text-red-500 p-0.5 rounded hover:bg-white/5"
                                        title="Xóa"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">delete</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Tags List */}
                {allTags.length > 0 && (
                    <>
                        <div className="mb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Thẻ (Tags)</div>
                        <div className="space-y-1 mb-6">
                            {allTags.map(tag => (
                                <SidebarItem 
                                    key={tag}
                                    icon="label" 
                                    label={tag} 
                                    count={tasks.filter(t => t.tags?.includes(tag) && !t.isCompleted && !t.isDeleted).length}
                                    isActive={activeView === `tag:${tag}`}
                                    onClick={() => setActiveView(`tag:${tag}`)}
                                    color="text-pink-400"
                                />
                            ))}
                        </div>
                    </>
                )}

                <div className="mb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Tiện ích</div>
                <div className="space-y-1 mb-4">
                    <div onClick={onOpenTemplates} className="relative flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-all duration-200 text-slate-400 hover:bg-[#1a1a1a] hover:text-slate-200">
                        <span className="material-symbols-outlined text-xl text-amber-400">dataset</span>
                        <span className="text-sm font-medium flex-1">Mẫu (Templates)</span>
                    </div>
                    <SidebarItem 
                        icon="delete" 
                        label="Thùng rác" 
                        count={tasks.filter(t => t.isDeleted).length}
                        isActive={activeView === 'trash'}
                        onClick={() => setActiveView('trash')}
                        color="text-red-500"
                    />
                </div>
            </div>

            {/* Bottom Stats & Theme */}
            <div className="p-4 border-t border-[#333] bg-[#1a1a1a]">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-amber-900/20 to-transparent border border-amber-900/30 mb-3">
                    <div className="p-2 bg-amber-500/10 rounded-full text-amber-400">
                        <span className="material-symbols-outlined text-lg">emoji_events</span>
                    </div>
                    <div>
                        <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider">Karma Level 5</p>
                        <p className="text-sm font-bold text-white">{completedCount * 150} <span className="text-xs text-slate-400 font-normal">XP</span></p>
                    </div>
                </div>
                <ThemeSwitcher currentAccent="Amber" onAccentChange={(c) => console.log(c)} />
            </div>
        </div>
    );
};

const SidebarItem = ({ icon, label, count, isActive, onClick, color }: any) => (
    <div 
        onClick={onClick}
        className={`relative flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-all duration-200 ${
            isActive 
            ? 'bg-[#262626] text-white shadow-[0_2px_10px_rgba(0,0,0,0.2)]' 
            : 'text-slate-400 hover:bg-[#1a1a1a] hover:text-slate-200'
        }`}
    >
        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-blue-500 rounded-r-full"></div>}
        <span className={`material-symbols-outlined text-xl transition-colors ${isActive ? color : 'text-slate-500'}`}>{icon}</span>
        <span className="text-sm font-medium flex-1 truncate">{label}</span>
        {count !== undefined && count >= 0 && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/10 text-white' : 'text-slate-600'}`}>
                {count}
            </span>
        )}
    </div>
);
