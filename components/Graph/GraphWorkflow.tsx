
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { RPGOverlay } from './GraphGamification'; // Import RPG Overlay

// Initialize AI Client
const getAI = () => {
    const customKey = localStorage.getItem('custom_gemini_api_key');
    return new GoogleGenAI({ apiKey: customKey || process.env.API_KEY || '' });
};

// ----------------------------------------------------------------------
// 1. AI ACTION PLANNER: Strategy Generator
// ----------------------------------------------------------------------

export const AIActionPlanner: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const [goal, setGoal] = useState("");
    const [plan, setPlan] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGeneratePlan = async () => {
        if (!goal.trim()) return;
        setIsGenerating(true);
        try {
            const ai = getAI();
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Create a detailed step-by-step learning and execution plan for the goal: "${goal}".
                Break it down into phases, milestones, and specific tasks.
                Return JSON format: { "title": "Plan Title", "phases": [{ "name": "Phase 1", "tasks": ["Task 1", "Task 2"] }] }`,
                config: {
                    thinkingConfig: { thinkingBudget: 24576 },
                    responseMimeType: "application/json"
                }
            });
            if (response.text) setPlan(JSON.parse(response.text));
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#1e1e1e] w-full max-w-3xl rounded-2xl border border-white/20 shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-white/10 bg-[#0f172a] rounded-t-2xl flex justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400">strategy</span> AI Chiến Lược Gia
                    </h3>
                    <button onClick={onClose}><span className="material-symbols-outlined text-slate-400 hover:text-white">close</span></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                    {!plan ? (
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-300">Mục tiêu của bạn là gì?</label>
                            <textarea 
                                className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 text-white resize-none focus:border-amber-500 outline-none"
                                placeholder="VD: Trở thành Fullstack Developer trong 6 tháng..."
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                            />
                            <button 
                                onClick={handleGeneratePlan}
                                disabled={isGenerating || !goal}
                                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isGenerating ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">lightbulb</span>}
                                {isGenerating ? "Đang lập kế hoạch..." : "Tạo Lộ Trình"}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-slide-up">
                            <h2 className="text-2xl font-black text-white">{plan.title}</h2>
                            {plan.phases.map((phase: any, i: number) => (
                                <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4">
                                    <h4 className="text-amber-400 font-bold mb-3 uppercase text-xs tracking-wider">{phase.name}</h4>
                                    <ul className="space-y-2">
                                        {phase.tasks.map((task: string, j: number) => (
                                            <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                                                <div className="w-4 h-4 rounded border border-slate-500"></div>
                                                {task}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                            <button onClick={() => setPlan(null)} className="text-slate-400 text-xs hover:text-white">Tạo lại</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// SHARED TASK TYPE
// ----------------------------------------------------------------------
export interface Task {
    id: string;
    title: string;
    priority: 1 | 2 | 3 | 4; // 1: Do First (High/High), 2: Schedule (High Imp/Low Urg), 3: Delegate (Low Imp/High Urg), 4: Delete (Low/Low)
    status: 'backlog' | 'todo' | 'in-progress' | 'done';
}

// ----------------------------------------------------------------------
// 2. ADVANCED KANBAN BOARD
// ----------------------------------------------------------------------

export const AdvancedKanban: React.FC<{ 
    tasks: Task[], 
    onMoveTask: (id: string, status: Task['status']) => void 
}> = ({ tasks, onMoveTask }) => {
    const columns = ['backlog', 'todo', 'in-progress', 'done'];
    const [draggedItem, setDraggedItem] = useState<string | null>(null);

    const onDragStart = (e: React.DragEvent, id: string) => {
        setDraggedItem(id);
    };

    const onDrop = (e: React.DragEvent, col: string) => {
        e.preventDefault();
        if (draggedItem) {
            onMoveTask(draggedItem, col as Task['status']);
            setDraggedItem(null);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
            {columns.map(col => {
                const colTasks = tasks.filter(t => t.status === col);
                const isDone = col === 'done';
                
                return (
                    <div 
                        key={col} 
                        className={`min-w-[250px] rounded-xl flex flex-col border max-h-[500px] transition-colors ${isDone ? 'bg-green-900/10 border-green-500/30' : 'bg-[#1e293b] border-white/5'}`}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, col)}
                    >
                        <div className="p-3 border-b border-white/5 flex justify-between items-center rounded-t-xl bg-black/20">
                            <span className="font-bold text-xs uppercase text-slate-300">{col}</span>
                            <span className="bg-white/10 text-[10px] px-2 py-0.5 rounded text-white">{colTasks.length}</span>
                        </div>
                        <div className="flex-1 p-2 space-y-2 overflow-y-auto bg-black/10">
                            {colTasks.map(task => (
                                <div 
                                    key={task.id} 
                                    draggable
                                    onDragStart={(e) => onDragStart(e, task.id)}
                                    className={`p-3 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing group hover:-translate-y-1 transition-transform ${
                                        task.priority === 1 ? 'bg-red-900/20 border-red-500/40' : 
                                        task.priority === 2 ? 'bg-blue-900/20 border-blue-500/40' : 'bg-[#262626] border-[#333]'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                            task.priority === 1 ? 'text-red-400 bg-red-900/30' : 'text-slate-400 bg-black/30'
                                        }`}>P{task.priority}</span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-200">{task.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ----------------------------------------------------------------------
// 3. EISENHOWER MATRIX: Priority View
// ----------------------------------------------------------------------

export const EisenhowerMatrix: React.FC<{ 
    tasks: Task[], 
    onCompleteTask: (id: string) => void 
}> = ({ tasks, onCompleteTask }) => {
    
    // Helper to render a quadrant
    const renderQuadrant = (title: string, priority: number, colorClass: string, desc: string) => {
        const qTasks = tasks.filter(t => t.priority === priority && t.status !== 'done');
        return (
            <div className={`rounded-xl p-4 relative group hover:bg-white/5 transition-colors border ${colorClass} flex flex-col h-full`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className={`font-black text-xs uppercase tracking-widest ${colorClass.replace('border', 'text').split(' ')[1]}`}>{title}</span>
                        <p className="text-[10px] text-slate-500 mt-1">{desc}</p>
                    </div>
                    <span className="text-xs font-bold bg-black/40 px-2 py-1 rounded text-white">{qTasks.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {qTasks.map(t => (
                        <div key={t.id} className="bg-[#1e1e1e] p-2 rounded border border-white/5 flex items-center justify-between group/task">
                            <span className="text-xs text-slate-200 truncate pr-2">{t.title}</span>
                            <button 
                                onClick={() => onCompleteTask(t.id)}
                                className="opacity-0 group-hover/task:opacity-100 text-green-400 hover:text-green-300 transition-opacity"
                                title="Hoàn thành & Nhận XP"
                            >
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                            </button>
                        </div>
                    ))}
                    {qTasks.length === 0 && <div className="text-[10px] text-slate-600 text-center italic mt-4">Trống</div>}
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[500px] w-full max-w-4xl mx-auto">
            {renderQuadrant("Do First (Urgent & Important)", 1, "border-red-500/50 bg-red-900/10", "Làm ngay để nhận nhiều XP nhất!")}
            {renderQuadrant("Schedule (Important, Not Urgent)", 2, "border-blue-500/50 bg-blue-900/10", "Lên lịch thực hiện.")}
            {renderQuadrant("Delegate (Urgent, Not Important)", 3, "border-yellow-500/50 bg-yellow-900/10", "Ủy quyền hoặc làm nhanh.")}
            {renderQuadrant("Delete (Neither)", 4, "border-slate-600/50 bg-slate-800/30", "Loại bỏ hoặc làm khi rảnh.")}
        </div>
    );
};

// ----------------------------------------------------------------------
// 4. GANTT TIMELINE: Visual Roadmap (Placeholder for layout consistency)
// ----------------------------------------------------------------------

export const GanttTimeline: React.FC = () => {
    return (
        <div className="bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden mt-6 h-full flex items-center justify-center text-slate-500">
            Gantt Chart Coming Soon...
        </div>
    );
};

// ----------------------------------------------------------------------
// 5. PROJECT MANAGEMENT SUITE (THE HUB)
// ----------------------------------------------------------------------

interface ProjectManagementSuiteProps {
    userLevel: number;
    userXP: number;
    onGainXP: (amount: number, reason: string) => void;
    initialTasks?: Task[];
}

export const ProjectManagementSuite: React.FC<ProjectManagementSuiteProps> = ({ userLevel, userXP, onGainXP, initialTasks }) => {
    const [view, setView] = useState<'kanban' | 'matrix' | 'timeline'>('matrix');
    const [showPlanner, setShowPlanner] = useState(false);
    
    // Internal Task State (In real app, this might come from props/global state)
    const [tasks, setTasks] = useState<Task[]>(initialTasks || [
        { id: '1', title: 'Fix Critical Bug #404', priority: 1, status: 'todo' },
        { id: '2', title: 'Design System Update', priority: 2, status: 'in-progress' },
        { id: '3', title: 'Reply to Emails', priority: 3, status: 'todo' },
        { id: '4', title: 'Organize Desktop', priority: 4, status: 'backlog' },
        { id: '5', title: 'Prepare Presentation', priority: 1, status: 'todo' },
    ]);

    const handleMoveTask = (id: string, status: Task['status']) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
        
        // If moved to Done, trigger reward logic
        if (status === 'done') {
            const task = tasks.find(t => t.id === id);
            if (task) triggerReward(task);
        }
    };

    const handleCompleteTask = (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'done' } : t));
            triggerReward(task);
        }
    };

    const triggerReward = (task: Task) => {
        // Calculate XP based on Priority
        let xpGain = 0;
        switch(task.priority) {
            case 1: xpGain = 150; break;
            case 2: xpGain = 100; break;
            case 3: xpGain = 50; break;
            case 4: xpGain = 20; break;
        }
        
        onGainXP(xpGain, `Completed: ${task.title}`);
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-6 animate-fade-in relative">
            {/* Embedded RPG Overlay for Context */}
            <div className="absolute top-0 right-6 pointer-events-none transform scale-90 origin-top-right">
                <RPGOverlay level={userLevel} xp={userXP} />
            </div>

            <div className="flex justify-between items-center pr-64"> {/* Padding right to avoid overlay */}
                <h2 className="text-3xl font-black text-white">Quản lý & Tăng cấp</h2>
                <div className="flex gap-4">
                    <div className="bg-white/10 p-1 rounded-lg flex gap-1">
                        <button onClick={() => setView('matrix')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'matrix' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Eisenhower</button>
                        <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'kanban' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Kanban</button>
                        <button onClick={() => setView('timeline')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'timeline' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Timeline</button>
                    </div>
                    <button 
                        onClick={() => setShowPlanner(true)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-lg flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">smart_toy</span> AI Planner
                    </button>
                </div>
            </div>

            <div className="h-[600px] border border-white/10 rounded-2xl p-6 bg-[#161b22] shadow-inner overflow-hidden relative">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-20"></div>
                
                {view === 'matrix' && <EisenhowerMatrix tasks={tasks} onCompleteTask={handleCompleteTask} />}
                {view === 'kanban' && <AdvancedKanban tasks={tasks} onMoveTask={handleMoveTask} />}
                {view === 'timeline' && <GanttTimeline />}
            </div>

            <AIActionPlanner isOpen={showPlanner} onClose={() => setShowPlanner(false)} />
        </div>
    );
};

// 6. Wrapper for Modal use
export const KanbanBoardOverlay: React.FC<{ 
    isOpen: boolean, 
    onClose: () => void, 
    userLevel: number, 
    userXP: number, 
    onGainXP: (amount: number, reason: string) => void,
    initialTasks?: any[] // Accept generic array, mapped inside
}> = ({ isOpen, onClose, userLevel, userXP, onGainXP, initialTasks }) => {
    if (!isOpen) return null;

    const mappedTasks: Task[] | undefined = initialTasks ? initialTasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority || 2,
        status: t.status || 'todo'
    })) : undefined;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-[fadeIn_0.2s]" onClick={onClose}>
            <div className="bg-[#0f172a] w-full max-w-[90vw] h-[85vh] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 z-50 text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                <div className="flex-1 overflow-auto">
                    <ProjectManagementSuite userLevel={userLevel} userXP={userXP} onGainXP={onGainXP} initialTasks={mappedTasks} />
                </div>
            </div>
        </div>
    );
};
