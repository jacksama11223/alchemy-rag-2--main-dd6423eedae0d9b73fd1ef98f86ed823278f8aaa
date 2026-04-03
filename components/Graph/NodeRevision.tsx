
import React, { useState, useMemo, useEffect } from 'react';
import { KnowledgeNode } from '../../types';
import { getNodeAggregateStatus, calculateNodeMastery } from '../../services/sm2Service';

interface NodeRevisionProps {
    nodes: KnowledgeNode[];
    onFocusNode: (nodeId: string) => void;
    onStartSession: (nodes: KnowledgeNode[]) => void;
    className?: string;
}

type TabType = 'DUE' | 'WEAK' | 'NEW' | 'ALL';

// --- LOGIC: Calculate precise days until due ---
const calculateDaysUntilDue = (dateString?: string): number => {
    if (!dateString) return 0; // Treat as due now if no date
    const targetDate = new Date(dateString);
    const today = new Date();
    
    // Reset hours to compare pure dates
    targetDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

// --- LOGIC: Analyze WHY a node is weak based on history ---
const analyzeNodeWeakness = (node: KnowledgeNode): { reason: string, severity: 'high' | 'medium' | 'low' } => {
    if (!node.data) return { reason: "Chưa có dữ liệu", severity: 'low' };

    let totalItems = 0;
    let hardItems = 0;   // E-Factor < 1.7 (Struggling)
    let lapsedItems = 0; // High reps but Interval dropped to 0 (Forgot recently)
    let newItems = 0;

    const checkItems = (items: any[]) => {
        if (!items) return;
        items.forEach(item => {
            totalItems++;
            if (item.sm2) {
                if (item.sm2.repetitions === 0) newItems++;
                // Identify items user rated 'Hard' or 'Again' frequently
                if (item.sm2.efactor < 1.9) hardItems++; 
                // Identify items user knew but then forgot (Lapser)
                if (item.sm2.repetitions > 2 && item.sm2.interval === 0) lapsedItems++;
            }
        });
    };

    checkItems(node.data.flashcards || []);
    checkItems(node.data.quiz || []);
    checkItems(node.data.fillInBlanks || []);

    if (totalItems === 0) return { reason: "Node rỗng", severity: 'low' };

    // Hierarchy of issues
    if (lapsedItems > 0) {
        return { 
            reason: `Bạn đã quên ${lapsedItems} kiến thức từng thuộc.`, 
            severity: 'high' 
        };
    }
    if (hardItems > 0) {
        return { 
            reason: `Gặp khó khăn với ${hardItems} câu hỏi/thẻ.`, 
            severity: hardItems > 2 ? 'high' : 'medium' 
        };
    }
    if (newItems === totalItems) {
        return { reason: "Chưa bắt đầu học.", severity: 'low' };
    }
    
    // Default fallback based on mastery
    const mastery = calculateNodeMastery(node);
    if (mastery < 50) return { reason: "Mức độ ghi nhớ thấp (<50%).", severity: 'medium' };

    return { reason: "Cần ôn tập định kỳ.", severity: 'low' };
};

// --- HELPER: Display string for time ---
const getRelativeTimeLabel = (days: number) => {
    if (days < 0) return `Trễ ${Math.abs(days)} ngày`;
    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Ngày mai';
    return `Sau ${days} ngày`;
};

// --- HELPER: Forecast Data ---
const getForecastData = (nodes: KnowledgeNode[]) => {
    const data = Array(5).fill(0);
    const now = new Date();
    now.setHours(0,0,0,0);

    nodes.forEach(n => {
        const nextDate = n.data?.flashcards?.[0]?.sm2?.nextReviewDate;
        if (nextDate) {
            const date = new Date(nextDate);
            date.setHours(0,0,0,0);
            const diff = Math.ceil((date.getTime() - now.getTime()) / (86400000));
            if (diff >= 0 && diff < 5) data[diff]++;
        }
    });
    return data;
};

// --- SUB-COMPONENT: REVISION CARD ---
const RevisionCard: React.FC<{ 
    node: KnowledgeNode; 
    mastery: number; 
    status: string;
    onClick: () => void;
    onPlay: (e: React.MouseEvent) => void;
    index: number;
    daysUntilDue: number;
    weaknessAnalysis: { reason: string, severity: string };
}> = ({ node, mastery, status, onClick, onPlay, index, daysUntilDue, weaknessAnalysis }) => {
    const isOverdue = daysUntilDue <= 0;
    const timeLabel = getRelativeTimeLabel(daysUntilDue);

    return (
        <div 
            onClick={onClick}
            className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border border-white/5 hover:border-cyan-500/30 bg-white/5 hover:bg-white/10 overflow-hidden animate-slide-up`}
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
        >
            {/* Background Progress Bar (Subtle) */}
            <div 
                className={`absolute bottom-0 left-0 h-0.5 transition-all duration-1000 ${status === 'weak' ? 'bg-yellow-500/50' : 'bg-cyan-500/30'}`} 
                style={{ width: `${mastery}%` }} 
            />

            <div className="flex items-center gap-3 min-w-0">
                {/* Mastery Ring */}
                <div className="relative w-10 h-10 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90">
                        <circle cx="20" cy="20" r="18" fill="none" stroke="#1e293b" strokeWidth="3" />
                        <circle 
                            cx="20" cy="20" r="18" 
                            fill="none" 
                            stroke={mastery > 80 ? '#22c55e' : mastery > 50 ? '#3b82f6' : mastery > 20 ? '#eab308' : '#ef4444'} 
                            strokeWidth="3" 
                            strokeDasharray="113" 
                            strokeDashoffset={113 - (113 * mastery) / 100} 
                            strokeLinecap="round" 
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-300">
                        {Math.round(mastery)}%
                    </div>
                </div>

                <div className="min-w-0 flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">{node.title}</h4>
                    
                    {/* Dynamic Detail Row */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        {/* If Weak, show Analysis. If Due, show Time. */}
                        {status === 'weak' ? (
                             <span className={`flex items-center gap-1 font-medium ${weaknessAnalysis.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}`}>
                                <span className="material-symbols-outlined text-[10px]">warning</span> 
                                {weaknessAnalysis.reason}
                            </span>
                        ) : (
                            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400 font-bold' : ''}`}>
                                <span className="material-symbols-outlined text-[10px]">schedule</span> {timeLabel}
                            </span>
                        )}
                        <span className="opacity-50">•</span>
                        <span className="uppercase bg-white/5 px-1 rounded opacity-80">{node.type}</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={onPlay}
                className="w-8 h-8 rounded-full bg-cyan-600/20 text-cyan-400 hover:bg-cyan-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 border border-cyan-500/30"
                title="Học ngay node này"
            >
                <span className="material-symbols-outlined text-lg">play_arrow</span>
            </button>
        </div>
    );
};

export const NodeRevision: React.FC<NodeRevisionProps> = ({ nodes, onFocusNode, onStartSession, className = '' }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('DUE');
    const [typeFilter, setTypeFilter] = useState<string>('All');
    
    // --- SMART SORTING & CLASSIFICATION ---
    const classifiedData = useMemo(() => {
        const due: any[] = [];
        const weak: any[] = [];
        const newNodes: any[] = [];
        const all: any[] = [];

        nodes.forEach(node => {
            const status = getNodeAggregateStatus(node);
            const mastery = calculateNodeMastery(node);
            
            // Calculate Exact Days Logic
            let nextReviewDateStr = node.timestamp as string;
            // Try to find the earliest next review date among items
            if (node.data?.flashcards?.[0]?.sm2?.nextReviewDate) {
                 nextReviewDateStr = node.data.flashcards[0].sm2.nextReviewDate;
            }
            
            const daysUntilDue = calculateDaysUntilDue(nextReviewDateStr);
            
            // Run Analysis
            const weaknessAnalysis = analyzeNodeWeakness(node);

            // Assign "Sort Score" = Days (lower is more urgent)
            const enrichedNode = { 
                ...node, 
                _sortScore: daysUntilDue,
                _daysUntilDue: daysUntilDue,
                _weaknessAnalysis: weaknessAnalysis
            };

            if (status === 'due') due.push(enrichedNode);
            if (status === 'weak' || (mastery > 0 && mastery < 50)) weak.push(enrichedNode);
            
            // New logic: Has 0 reps
            const isReallyNew = node.data?.sm2?.repetitions === 0 && (!node.data?.flashcards?.some(f => (f.sm2?.repetitions || 0) > 0));
            if (isReallyNew || (status === 'learning' && mastery === 0)) {
                 newNodes.push(enrichedNode);
            }
            
            all.push(enrichedNode);
        });

        // SORTING: Priority = Overdue amount ascending (most negative first)
        const sortByUrgency = (a: any, b: any) => a._sortScore - b._sortScore;

        return { 
            due: due.sort(sortByUrgency), 
            weak: weak.sort((a,b) => calculateNodeMastery(a) - calculateNodeMastery(b)), // Lowest mastery first
            new: newNodes.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), // Newest first
            all: all.sort(sortByUrgency) 
        };
    }, [nodes]);

    // Apply Type Filter
    const activeList = useMemo(() => {
        const list = classifiedData[activeTab.toLowerCase() as keyof typeof classifiedData] || classifiedData.all;
        if (typeFilter === 'All') return list;
        return list.filter(n => n.type === typeFilter);
    }, [classifiedData, activeTab, typeFilter]);

    // Calculate Summary Stats
    const totalDue = classifiedData.due.length;
    const totalWeak = classifiedData.weak.length;
    const totalNew = classifiedData.new.length;

    // Forecast Data (Next 5 days)
    const forecast = useMemo(() => getForecastData(nodes), [nodes]);

    // Get unique types for filter
    const availableTypes = useMemo(() => {
        const types = new Set(nodes.map(n => n.type));
        return ['All', ...Array.from(types)];
    }, [nodes]);

    // --- RENDER ---
    return (
        <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center transition-all duration-500 ${className}`}>
            
            {/* EXPANDED DASHBOARD */}
            <div 
                className={`
                    w-[95vw] sm:w-[90vw] max-w-2xl bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col
                    ${isExpanded ? 'max-h-[70vh] opacity-100 mb-4 scale-100 translate-y-0' : 'max-h-0 opacity-0 mb-0 scale-95 translate-y-10 pointer-events-none'}
                `}
            >
                {/* AI Insight Header */}
                <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse border border-blue-500/30">
                            <span className="material-symbols-outlined text-blue-400 text-xl">psychology</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-blue-200 uppercase tracking-wide">AI Scheduler</h4>
                            <p className="text-xs text-slate-400">
                                {totalDue > 0 
                                    ? `Phát hiện ${totalDue} thẻ cần ôn tập để tối ưu trí nhớ.` 
                                    : "Hệ thống ổn định. Bạn có thể học thêm kiến thức mới."}
                            </p>
                        </div>
                    </div>
                    {/* Forecast Mini Chart */}
                    <div className="flex items-end gap-1 h-8">
                        {forecast.map((count, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 group relative">
                                <div 
                                    className={`w-2 rounded-t-sm transition-all ${i === 0 ? 'bg-red-500' : 'bg-slate-600'}`} 
                                    style={{ height: `${Math.max(20, Math.min(100, count * 10))}%` }}
                                ></div>
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 text-[9px] bg-black px-1 rounded whitespace-nowrap transition-opacity">
                                    {i === 0 ? 'Today' : `+${i}d`}: {count}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 bg-black/20 overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'DUE', label: 'Đến hạn', count: totalDue, color: 'text-red-400 border-red-500', icon: 'notifications_active' },
                        { id: 'WEAK', label: 'Cần cải thiện', count: totalWeak, color: 'text-yellow-400 border-yellow-500', icon: 'healing' },
                        { id: 'NEW', label: 'Mới', count: totalNew, color: 'text-blue-400 border-blue-500', icon: 'fiber_new' },
                        { id: 'ALL', label: 'Kho kiến thức', count: nodes.length, color: 'text-slate-400 border-slate-500', icon: 'inventory_2' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`flex-1 py-3 px-4 text-xs font-bold uppercase transition-all border-b-2 flex flex-col items-center gap-1 min-w-[80px] ${
                                activeTab === tab.id 
                                ? `${tab.color} bg-white/5` 
                                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                        >
                            <span className="material-symbols-outlined text-lg mb-0.5">{tab.icon}</span>
                            <div className="flex items-center gap-1">
                                <span>{tab.label}</span>
                                <span className="text-[9px] bg-white/10 px-1.5 rounded-full">{tab.count}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Filter Chips */}
                <div className="px-4 py-2 border-b border-white/5 bg-[#0b1120] flex gap-2 overflow-x-auto scrollbar-hide">
                    {availableTypes.map(t => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap ${
                                typeFilter === t 
                                ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500/50' 
                                : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0b1120] p-3">
                    {activeList.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center text-slate-500 gap-3 opacity-60">
                            <span className="material-symbols-outlined text-5xl">inbox</span>
                            <p className="text-xs font-bold">Danh sách trống.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {activeList.map((node, idx) => (
                                <RevisionCard 
                                    key={node.id}
                                    node={node}
                                    mastery={calculateNodeMastery(node)}
                                    status={activeTab === 'WEAK' ? 'weak' : getNodeAggregateStatus(node)}
                                    onClick={() => onFocusNode(node.id)}
                                    onPlay={(e) => { e.stopPropagation(); onStartSession([node]); }}
                                    index={idx}
                                    daysUntilDue={node._daysUntilDue}
                                    weaknessAnalysis={node._weaknessAnalysis}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 bg-[#0f172a] flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-[10px] text-slate-400 font-mono">
                            SM-2 ALGORITHM ACTIVE
                        </p>
                    </div>
                    {activeList.length > 0 && (
                        <button 
                            onClick={() => onStartSession(activeList)}
                            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 transform active:scale-95"
                        >
                            <span className="material-symbols-outlined text-sm">play_circle</span>
                            Học Ngay ({activeList.length})
                        </button>
                    )}
                </div>
            </div>

            {/* COLLAPSED BAR (Trigger) */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                    flex items-center gap-4 px-5 py-2.5 bg-[#0f172a]/90 backdrop-blur-md border rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all hover:scale-105 active:scale-95 group relative z-50
                    ${isExpanded ? 'border-cyan-500/50 ring-2 ring-cyan-500/20' : 'border-white/10 hover:border-white/30'}
                `}
            >
                <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                    <div className={`relative ${isExpanded ? 'rotate-180' : ''} transition-transform duration-300`}>
                        <span className={`material-symbols-outlined text-lg ${isExpanded ? 'text-cyan-400' : 'text-slate-400'}`}>
                            keyboard_arrow_up
                        </span>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revision Hub</span>
                        <span className="text-xs font-black text-white leading-none">
                            {totalDue > 0 ? `${totalDue} cần ôn` : 'Hoàn thành'}
                        </span>
                    </div>
                </div>

                {/* Mini Stats Icons */}
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1 ${totalDue > 0 ? 'text-red-400 animate-pulse' : 'text-slate-600'}`} title="Đến hạn">
                        <span className="material-symbols-outlined text-base">notifications_active</span>
                        <span className="text-xs font-bold">{totalDue}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${totalWeak > 0 ? 'text-yellow-400' : 'text-slate-600'}`} title="Cần cải thiện">
                        <span className="material-symbols-outlined text-base">healing</span>
                        <span className="text-xs font-bold">{totalWeak}</span>
                    </div>
                </div>

                {/* Progress Ring Mini */}
                <div className="relative w-7 h-7 ml-1">
                    <svg className="w-full h-full -rotate-90">
                        <circle cx="14" cy="14" r="11" fill="none" stroke="#1e293b" strokeWidth="2.5" />
                        <circle 
                            cx="14" cy="14" r="11" 
                            fill="none" stroke={totalDue > 0 ? '#ef4444' : '#22d3ee'} strokeWidth="2.5" 
                            strokeDasharray="69" 
                            strokeDashoffset={totalDue > 0 ? 30 : 0} 
                            strokeLinecap="round" 
                        />
                    </svg>
                    {totalDue === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[14px] text-cyan-400">check</span>
                        </div>
                    )}
                </div>
            </button>
        </div>
    );
};
