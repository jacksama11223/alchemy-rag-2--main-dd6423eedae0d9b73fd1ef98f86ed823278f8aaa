
import React, { useState } from 'react';
import { TodoTask } from '../../types';

interface CalendarViewProps {
    tasks: TodoTask[];
    onTaskClick: (task: TodoTask) => void;
    onAdd?: (date: string, title?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskClick, onAdd }) => {
    // State to track the currently viewed month/year
    // Defaulting to current date, but user can navigate freely to 2025, 2026, etc.
    const [viewDate, setViewDate] = useState(new Date());

    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();
    
    // Real "Today" for highlighting
    const realToday = new Date();

    // Get days in the viewed month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    // Adjust blanks so Monday is first (if Sunday(0) -> 6 blanks, else day-1)
    const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i);

    // Navigation Handlers
    const handlePrevMonth = () => {
        setViewDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const handleToday = () => {
        setViewDate(new Date());
    };

    const getTasksForDay = (day: number) => {
        // Use the ALREADY FILTERED tasks prop
        return tasks.filter(t => {
            if (t.isDeleted) return false;
            
            // Calculate specific date strings for 'today', 'tomorrow' based on REAL time, not view time
            const taskDateObj = new Date(); // Start with real today
            let targetDateStr = t.dueDate;

            if (t.dueDate === 'today') {
                // Keep as real today
            } else if (t.dueDate === 'tomorrow') {
                taskDateObj.setDate(taskDateObj.getDate() + 1);
            } else if (t.dueDate && t.dueDate.includes('-')) {
                // ISO Date string
                const parts = new Date(t.dueDate);
                if (!isNaN(parts.getTime())) {
                    taskDateObj.setTime(parts.getTime());
                }
            } else {
                return false; // Skip 'upcoming' or null unless we handle specific logic
            }

            // Check if the task's calculated date matches the cell's date in the VIEW
            return (
                taskDateObj.getDate() === day && 
                taskDateObj.getMonth() === currentMonth && 
                taskDateObj.getFullYear() === currentYear
            );
        });
    };

    return (
        <div className="w-full h-full bg-[#1e1e1e] rounded-xl border border-[#333] overflow-hidden flex flex-col animate-[fadeIn_0.3s]">
            <div className="p-4 bg-[#252525] border-b border-[#333] flex justify-between items-center">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-400">calendar_month</span>
                    Tháng {currentMonth + 1}, {currentYear}
                </h3>
                <div className="flex gap-2">
                    <button 
                        onClick={handlePrevMonth}
                        className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                        title="Tháng trước"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button 
                        onClick={handleToday}
                        className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase px-3 border border-[#444]"
                        title="Về hôm nay"
                    >
                        Hôm nay
                    </button>
                    <button 
                        onClick={handleNextMonth}
                        className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                        title="Tháng sau"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-7 bg-[#252525] border-b border-[#333] text-center py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div className="text-red-400">Sun</div>
            </div>
            
            <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-[#1e1e1e] overflow-y-auto custom-scrollbar">
                {blanks.map((x) => <div key={`blank-${x}`} className="border-r border-b border-[#333] min-h-[100px] bg-[#151515]"></div>)}
                
                {days.map(day => {
                    const dayTasks = getTasksForDay(day);
                    
                    // Highlight if this cell matches REAL today
                    const isToday = 
                        day === realToday.getDate() && 
                        currentMonth === realToday.getMonth() && 
                        currentYear === realToday.getFullYear();
                    
                    return (
                        <div key={day} className={`border-r border-b border-[#333] min-h-[100px] p-2 relative group hover:bg-[#262626] transition-colors flex flex-col gap-1 ${isToday ? 'bg-blue-900/10' : ''}`}>
                            <div className="flex justify-between items-start">
                                <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
                                    {day}
                                </span>
                                <div className="flex items-center gap-1">
                                    {dayTasks.length > 0 && <span className="text-[10px] text-slate-600 font-bold">{dayTasks.length}</span>}
                                    {onAdd && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const title = prompt("Tên công việc:");
                                                if (title) {
                                                    // Ensure we format with padding (2025-01-05)
                                                    const m = String(currentMonth + 1).padStart(2, '0');
                                                    const d = String(day).padStart(2, '0');
                                                    onAdd(`${currentYear}-${m}-${d}`, title);
                                                }
                                            }}
                                            className="w-5 h-5 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span className="material-symbols-outlined text-xs">add</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto max-h-[120px] scrollbar-hide space-y-1 mt-1">
                                {dayTasks.map(t => (
                                    <div 
                                        key={t.id} 
                                        onClick={() => onTaskClick(t)}
                                        className={`text-[10px] px-2 py-1.5 rounded truncate cursor-pointer hover:opacity-100 opacity-90 border-l-2 shadow-sm transition-transform hover:scale-[1.02] ${
                                            t.isCompleted ? 'bg-[#333] text-slate-500 line-through border-slate-500' :
                                            t.priority === 1 ? 'bg-red-900/30 border-red-500 text-red-200' :
                                            t.priority === 2 ? 'bg-orange-900/30 border-orange-500 text-orange-200' :
                                            'bg-blue-900/30 border-blue-500 text-blue-200'
                                        }`}
                                        title={t.content}
                                    >
                                        {t.content}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
