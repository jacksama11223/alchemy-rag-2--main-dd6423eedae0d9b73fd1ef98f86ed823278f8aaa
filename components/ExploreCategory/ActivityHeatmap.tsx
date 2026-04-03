
import React, { useState } from 'react';

export interface HeatmapDayData {
    day: number;
    intensity: number; // 0 to 1
    count: number;
    items: string[]; // List of node titles
}

interface ActivityHeatmapProps {
    data: HeatmapDayData[];
    currentDay: number; 
    currentMonth: number; 
    currentYear: number; 
    
    viewMonth: number;
    viewYear: number;
    
    startDayOffset: number;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onGoToday: () => void;

    // New Props for Filtering & Mode
    mode: 'activity' | 'schedule';
    onModeChange: (mode: 'activity' | 'schedule') => void;
    availableTags: string[];
    selectedTag: string;
    onTagSelect: (tag: string) => void;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ 
    data, 
    currentDay, currentMonth, currentYear, 
    viewMonth, viewYear,
    startDayOffset,
    onPrevMonth, onNextMonth, onGoToday,
    mode, onModeChange, availableTags, selectedTag, onTagSelect
}) => {
    
    const [hoveredDay, setHoveredDay] = useState<HeatmapDayData | null>(null);

    const blanks = Array.from({ length: startDayOffset }, (_, i) => i);
    const isViewingCurrentMonth = viewMonth === currentMonth && viewYear === currentYear;

    // Theme Colors based on Mode
    const theme = mode === 'activity' 
        ? { main: 'bg-green-500', text: 'text-green-400', border: 'border-green-500', glow: 'shadow-[0_0_20px_rgba(34,197,94,0.4)]', bgLow: 'bg-[rgba(34,197,94,0.2)]' }
        : { main: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]', bgLow: 'bg-[rgba(249,115,22,0.2)]' };

    return (
        <div className="w-full max-w-5xl mx-auto bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 animate-[fadeIn_0.5s] relative overflow-visible">
            
            {/* Header Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
                <div>
                    <h3 className={`font-bold text-2xl flex items-center gap-2 ${mode === 'activity' ? 'text-white' : 'text-orange-100'}`}>
                        <span className={`material-symbols-outlined ${theme.text}`}>
                            {mode === 'activity' ? 'history' : 'event_upcoming'}
                        </span>
                        {mode === 'activity' ? 'Lịch sử Hoạt động' : 'Lịch trình Ôn tập'}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 font-medium">
                        Tháng {viewMonth + 1}/{viewYear} • Tổng: <span className={`${theme.text} font-bold`}>{data.reduce((acc, d) => acc + d.count, 0)}</span> thẻ
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* Mode Switcher */}
                    <div className="bg-black/40 p-1 rounded-xl border border-white/10 flex">
                        <button 
                            onClick={() => onModeChange('activity')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${mode === 'activity' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <span className="material-symbols-outlined text-sm">history</span> Lịch sử
                        </button>
                        <button 
                            onClick={() => onModeChange('schedule')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${mode === 'schedule' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <span className="material-symbols-outlined text-sm">upcoming</span> Đến hạn
                        </button>
                    </div>

                    {/* Tag Filter */}
                    <div className="relative group z-20">
                        <button className="flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:border-white/30 transition-colors">
                            <span className="material-symbols-outlined text-sm">filter_list</span>
                            {selectedTag === 'All' ? 'Tất cả chủ đề' : selectedTag}
                        </button>
                        {/* Dropdown */}
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl overflow-hidden hidden group-hover:block max-h-60 overflow-y-auto custom-scrollbar">
                            <button onClick={() => onTagSelect('All')} className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/10 transition-colors">Tất cả</button>
                            {availableTags.map(tag => (
                                <button 
                                    key={tag} 
                                    onClick={() => onTagSelect(tag)} 
                                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-white/10 transition-colors truncate"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                        <button onClick={onPrevMonth} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"><span className="material-symbols-outlined">chevron_left</span></button>
                        <button onClick={onGoToday} className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${isViewingCurrentMonth ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>Nay</button>
                        <button onClick={onNextMonth} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"><span className="material-symbols-outlined">chevron_right</span></button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-3 mb-6 relative z-0">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                    <div key={d} className="text-center text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{d}</div>
                ))}

                {blanks.map((x) => (
                    <div key={`blank-${x}`} className="aspect-square rounded-xl bg-white/5 border border-transparent opacity-30"></div>
                ))}

                {data.map((d) => {
                    const isToday = isViewingCurrentMonth && d.day === currentDay;
                    
                    let bgClass = 'bg-white/5 border-white/5';
                    if (d.count > 0) {
                        const opacity = Math.min(1, Math.max(0.2, d.intensity));
                        // Dynamic color opacity based on intensity
                        bgClass = mode === 'activity' 
                            ? `bg-[rgba(34,197,94,${opacity})] border-green-500/30` 
                            : `bg-[rgba(249,115,22,${opacity})] border-orange-500/30`;
                    }

                    const todayClass = isToday 
                        ? `ring-2 ring-white/50 shadow-lg scale-105 z-10 ${theme.main}` 
                        : 'hover:border-white/30 hover:scale-105';

                    return (
                        <div 
                            key={d.day} 
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-300 cursor-pointer border ${bgClass} ${isToday ? '' : todayClass}`}
                            onMouseEnter={() => setHoveredDay(d)}
                            onMouseLeave={() => setHoveredDay(null)}
                        >
                            <span className={`text-sm font-bold ${isToday ? 'text-white' : d.count > 0 ? 'text-white' : 'text-slate-500'}`}>
                                {d.day}
                            </span>
                            
                            {d.count > 0 && (
                                <div className="mt-1 flex gap-0.5">
                                    <div className="w-1 h-1 rounded-full bg-white/80"></div>
                                    {d.count > 3 && <div className="w-1 h-1 rounded-full bg-white/80"></div>}
                                    {d.count > 6 && <div className="w-1 h-1 rounded-full bg-white/80"></div>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Detail Footer / Tooltip Area */}
            <div className="h-16 border-t border-white/10 pt-4 flex items-center justify-between">
                {hoveredDay && hoveredDay.count > 0 ? (
                    <div className="animate-fade-in w-full">
                        <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold ${theme.text} uppercase`}>
                                {mode === 'activity' ? 'Đã tạo/học' : 'Cần ôn tập'} ngày {hoveredDay.day}/{viewMonth + 1}
                            </span>
                            <span className="text-xs text-white font-mono">{hoveredDay.count} items</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {hoveredDay.items.slice(0, 5).map((item, i) => (
                                <span key={i} className="text-[10px] bg-white/10 px-2 py-1 rounded text-slate-300 whitespace-nowrap border border-white/5">
                                    {item}
                                </span>
                            ))}
                            {hoveredDay.items.length > 5 && (
                                <span className="text-[10px] text-slate-500 self-center">+{hoveredDay.items.length - 5} nữa</span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-500 w-full">
                        <span>Ít</span>
                        <div className="w-3 h-3 bg-white/5 rounded"></div>
                        <div className={`w-3 h-3 ${theme.bgLow} rounded`}></div>
                        <div className={`w-3 h-3 ${theme.main} rounded opacity-60`}></div>
                        <div className={`w-3 h-3 ${theme.main} rounded`}></div>
                        <span>Nhiều</span>
                        <span className="ml-auto italic">Rê chuột vào ngày để xem chi tiết</span>
                    </div>
                )}
            </div>
        </div>
    );
};
