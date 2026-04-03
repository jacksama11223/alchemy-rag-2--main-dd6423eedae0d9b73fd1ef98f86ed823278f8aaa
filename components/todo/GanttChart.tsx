
import React from 'react';
import { TodoTask } from '../../types';

interface GanttChartProps {
    tasks: TodoTask[];
}

export const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
    // Determine timeline range
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Start of month
    const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0); // End of next month
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const getPosition = (dateStr?: string | null) => {
        if (!dateStr || dateStr === 'today' || dateStr === 'tomorrow' || dateStr === 'upcoming') {
            // Visualize abstract dates relative to today
            const target = new Date();
            if (dateStr === 'tomorrow') target.setDate(target.getDate() + 1);
            if (dateStr === 'upcoming') target.setDate(target.getDate() + 7);
            
            const diffTime = Math.abs(target.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            return (diffDays / totalDays) * 100;
        }
        
        const date = new Date(dateStr);
        const diffTime = Math.abs(date.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return (diffDays / totalDays) * 100;
    };

    // Filter tasks that have at least some date info
    const timelineTasks = tasks.filter(t => (t.dueDate || t.startDate) && !t.isDeleted);

    return (
        <div className="w-full h-full bg-[#1e1e1e] rounded-xl border border-[#333] flex flex-col overflow-hidden animate-[fadeIn_0.3s]">
            <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#252525]">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400">timeline</span> Tiến độ (Gantt)
                </h3>
                <div className="text-xs text-slate-400 font-mono bg-black/20 px-2 py-1 rounded">
                    {startDate.toLocaleDateString()} &rarr; {endDate.toLocaleDateString()}
                </div>
            </div>
            
            <div className="flex-1 overflow-auto relative p-4 bg-[#1a1a1a]">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex pointer-events-none pl-40 h-full">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex-1 border-r border-[#333] h-full opacity-30 flex flex-col justify-end pb-2">
                            <span className="text-[10px] text-slate-600 pl-1">Week {i+1}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-4 relative z-10">
                    {timelineTasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">calendar_clock</span>
                            <p>Chưa có công việc nào có ngày tháng để hiển thị.</p>
                        </div>
                    )}
                    
                    {timelineTasks.map(task => {
                        const endPos = getPosition(task.dueDate);
                        // If no start date, assume standard 1-day or short duration ending at due date
                        const startPos = task.startDate ? getPosition(task.startDate) : Math.max(0, endPos - 5); 
                        const width = Math.max(2, endPos - startPos); // Minimum width
                        
                        return (
                            <div key={task.id} className="flex items-center gap-4 h-10 group hover:bg-white/5 rounded px-2 transition-colors">
                                <div className="w-36 shrink-0 truncate text-xs text-slate-300 font-medium text-right pr-4 border-r border-[#333] h-full flex items-center justify-end">
                                    {task.content}
                                </div>
                                <div className="flex-1 relative h-full flex items-center">
                                    {/* Progress Bar Track */}
                                    <div className="absolute left-0 right-0 h-1 bg-[#333] rounded-full"></div>
                                    
                                    {/* Task Bar */}
                                    <div 
                                        className={`absolute h-6 rounded-md flex items-center ${
                                            task.isMilestone ? 'bg-amber-500 rotate-45 w-4 h-4 !rounded-sm top-1/2 -translate-y-1/2' : 
                                            task.isCompleted ? 'bg-green-600/80 border border-green-500' : 'bg-blue-600/80 border border-blue-500'
                                        } shadow-lg hover:brightness-110 cursor-pointer transition-all hover:scale-105 z-10`}
                                        style={{ 
                                            left: `${Math.max(0, Math.min(100, startPos))}%`, 
                                            width: task.isMilestone ? undefined : `${width}%` 
                                        }}
                                        title={`${task.startDate || 'Start'} -> ${task.dueDate}`}
                                    >
                                        {!task.isMilestone && (
                                            <div className="w-full px-2 flex justify-between items-center overflow-hidden">
                                                <span className="text-[9px] text-white/90 font-bold truncate">{task.progress || 0}%</span>
                                                {width > 10 && <span className="text-[9px] text-white/70 truncate ml-1">{task.dueDate}</span>}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Connector Lines (Mock) */}
                                    {!task.isMilestone && <div className="absolute h-px bg-slate-600 w-full opacity-0 group-hover:opacity-20" style={{top: '50%'}}></div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
