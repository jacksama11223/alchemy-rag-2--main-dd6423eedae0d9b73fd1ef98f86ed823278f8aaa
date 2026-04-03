
import React, { useState, useRef, useEffect } from 'react';
import { VoiceInput } from './VoiceInput';
import { Project } from '../../types';

interface TodoAddFormProps {
    isAdding: boolean;
    setIsAdding: (val: boolean) => void;
    onAdd: (content: string, desc: string, priority: 1|2|3|4, date: string|null, projectId?: string) => void;
    initialContent?: string;
    initialDescription?: string;
    initialPriority?: 1 | 2 | 3 | 4;
    projects: Project[]; // Added projects list
    activeProjectId?: string; // To set default project
}

export const TodoAddForm: React.FC<TodoAddFormProps> = ({ 
    isAdding, setIsAdding, onAdd, 
    initialContent = '', initialDescription = '', initialPriority = 4,
    projects, activeProjectId
}) => {
    const [newTaskContent, setNewTaskContent] = useState(initialContent);
    const [newTaskDesc, setNewTaskDesc] = useState(initialDescription);
    const [newTaskPriority, setNewTaskPriority] = useState<1 | 2 | 3 | 4>(initialPriority);
    const [newTaskDate, setNewTaskDate] = useState<string>(''); // ISO Date string YYYY-MM-DD
    const [selectedProject, setSelectedProject] = useState<string>(activeProjectId || 'inbox');
    
    const formRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync initial props
    useEffect(() => {
        if (initialContent) setNewTaskContent(initialContent);
        if (initialDescription) setNewTaskDesc(initialDescription);
        if (initialPriority) setNewTaskPriority(initialPriority);
    }, [initialContent, initialDescription, initialPriority]);
    
    // Sync active project if changed externally or opened
    useEffect(() => {
        if (isAdding) {
             // If activeProjectId is a valid project (not a view like 'today'), use it
             const isValidProject = projects.some(p => p.id === activeProjectId);
             setSelectedProject(isValidProject ? activeProjectId! : 'inbox');
        }
    }, [isAdding, activeProjectId, projects]);

    useEffect(() => {
        if (isAdding && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            // Auto focus input
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isAdding]);

    const handleAddTask = () => {
        if (!newTaskContent.trim()) return;
        // Pass the raw date string or null, and the selected project
        onAdd(newTaskContent, newTaskDesc, newTaskPriority, newTaskDate || null, selectedProject);
        
        setNewTaskContent('');
        setNewTaskDesc('');
        setNewTaskPriority(4);
        setNewTaskDate('');
        // Keep focus for rapid entry
        inputRef.current?.focus();
    };

    const handleCancel = () => {
        setIsAdding(false);
        setNewTaskContent('');
        setNewTaskDesc('');
    };

    const getPriorityColor = (p: number) => {
        switch(p) {
            case 1: return 'text-red-500 border-red-500 bg-red-500/10';
            case 2: return 'text-orange-500 border-orange-500 bg-orange-500/10';
            case 3: return 'text-blue-500 border-blue-500 bg-blue-500/10';
            default: return 'text-slate-400 border-slate-500 bg-transparent';
        }
    };
    
    const currentProject = projects.find(p => p.id === selectedProject) || projects.find(p => p.id === 'inbox');

    if (!isAdding) {
        return (
            <button 
                onClick={() => setIsAdding(true)} 
                className="group flex items-center gap-3 mt-4 text-slate-400 hover:text-white transition-all w-full py-3 px-4 rounded-xl border border-transparent hover:bg-white/5 hover:border-[#333]"
            >
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent border border-slate-600 group-hover:bg-red-500 group-hover:border-red-500 group-hover:text-white transition-all shadow-sm">
                    <span className="material-symbols-outlined text-xl">add</span>
                </div>
                <span className="text-sm font-medium group-hover:translate-x-1 transition-transform">Thêm nhiệm vụ mới</span>
            </button>
        );
    }

    return (
        <div ref={formRef} className="mt-4 border border-slate-600/50 rounded-xl bg-[#1e1e1e] shadow-2xl overflow-hidden animate-[fadeIn_0.3s_ease-out] ring-1 ring-white/10">
            <div className="p-4 space-y-3">
                <div className="flex gap-2 items-center">
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder="Bạn muốn làm gì?" 
                        className="w-full bg-transparent text-white font-bold text-lg placeholder-slate-500 border-none outline-none focus:ring-0 p-0"
                        value={newTaskContent}
                        onChange={(e) => setNewTaskContent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    />
                    <VoiceInput onTranscript={(text) => setNewTaskContent(prev => prev + (prev ? ' ' : '') + text)} />
                </div>
                <textarea 
                    placeholder="Mô tả chi tiết (tùy chọn)..." 
                    className="w-full bg-transparent text-slate-400 text-sm placeholder-slate-600 border-none outline-none focus:ring-0 p-0 resize-none h-16"
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddTask(); }}}
                />
            </div>
            
            <div className="flex items-center justify-between px-4 py-3 bg-[#252525] border-t border-[#333]">
                <div className="flex gap-2 items-center flex-wrap">
                    {/* Date Picker */}
                    <div className="relative group">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${newTaskDate ? 'bg-green-500/10 border-green-500 text-green-400' : 'border-[#444] text-slate-400 hover:bg-[#333] hover:text-white'}`}>
                            <span className="material-symbols-outlined text-[16px]">calendar_today</span> 
                            <input 
                                type="date"
                                className="bg-transparent border-none p-0 text-inherit focus:ring-0 w-24 h-full cursor-pointer text-xs font-bold"
                                value={newTaskDate}
                                onChange={(e) => setNewTaskDate(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {/* Project Selector (New) */}
                    <div className="relative group">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#444] text-slate-400 hover:bg-[#333] hover:text-white text-xs font-bold transition-all">
                             <span className={`material-symbols-outlined text-[16px] ${currentProject?.color || 'text-slate-400'}`}>
                                 {currentProject?.icon || 'inbox'}
                             </span>
                             <span className="max-w-[100px] truncate">{currentProject?.name || 'Inbox'}</span>
                        </button>
                        
                        {/* Project Dropdown */}
                        <div className="absolute bottom-full left-0 mb-2 bg-[#2a2a2a] border border-[#444] rounded-xl shadow-xl p-1.5 hidden group-hover:block z-50 w-48 animate-[fadeIn_0.1s] max-h-48 overflow-y-auto custom-scrollbar">
                             {projects.map(p => (
                                 <button
                                    key={p.id}
                                    onClick={() => setSelectedProject(p.id)}
                                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${selectedProject === p.id ? 'bg-[#333] text-white' : 'text-slate-300 hover:bg-[#333]'}`}
                                 >
                                     <span className={`material-symbols-outlined text-sm ${p.color}`}>{p.icon}</span>
                                     <span className="truncate">{p.name}</span>
                                 </button>
                             ))}
                        </div>
                    </div>
                    
                    {/* Priority */}
                    <div className="relative group">
                        <button 
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${newTaskPriority < 4 ? getPriorityColor(newTaskPriority) : 'border-[#444] text-slate-400 hover:bg-[#333] hover:text-white'}`}
                        >
                            <span className="material-symbols-outlined text-[16px] filled">flag</span> 
                            {newTaskPriority < 4 ? `P${newTaskPriority}` : 'Ưu tiên'}
                        </button>
                        
                        {/* Dropdown */}
                        <div className="absolute bottom-full left-0 mb-2 bg-[#2a2a2a] border border-[#444] rounded-xl shadow-xl p-1.5 hidden group-hover:block z-50 w-40 animate-[fadeIn_0.1s]">
                            {[1, 2, 3, 4].map((p) => (
                                <button 
                                    key={p} 
                                    onClick={() => setNewTaskPriority(p as any)}
                                    className="flex items-center gap-3 w-full text-left px-3 py-2 hover:bg-[#333] rounded-lg text-xs text-slate-300 transition-colors"
                                >
                                    <span className={`material-symbols-outlined text-[16px] ${p === 1 ? 'text-red-500' : p === 2 ? 'text-orange-500' : p === 3 ? 'text-blue-500' : 'text-slate-400'}`}>flag</span>
                                    Priority {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={handleCancel} 
                        className="px-4 py-2 bg-transparent hover:bg-[#333] text-slate-400 text-xs font-bold rounded-lg transition-colors"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleAddTask} 
                        disabled={!newTaskContent.trim()}
                        className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all shadow-lg hover:shadow-red-900/20 active:scale-95"
                    >
                        Thêm ngay
                    </button>
                </div>
            </div>
        </div>
    );
};
