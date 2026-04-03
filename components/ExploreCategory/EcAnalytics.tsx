
import React, { useMemo } from 'react';
import { KnowledgeNode } from '../../types';

// --- LOGIC: TIME ESTIMATION ---
const calculateStudyTime = (node: KnowledgeNode): number => {
    // 1. Get raw count
    const flashcards = node.data?.flashcards?.length || 0;
    const quiz = node.data?.quiz?.length || 0;
    const others = (node.data?.fillInBlanks?.length || 0) + (node.data?.spotErrors?.length || 0);
    
    const totalItems = flashcards + quiz + others;
    if (totalItems === 0) return 0;

    // 2. Determine Speed Factor based on Status & History
    // Review is faster (10s/item), New is slower (30s/item)
    // We assume mixed content for simplicity if not strictly tracked
    let secondsPerItem = 30; // Default: Learning New
    
    // Check if node has been studied (has SM-2 data with reps > 0)
    const hasHistory = node.data?.flashcards?.some(f => f.sm2 && f.sm2.repetitions > 0);
    
    if (hasHistory) {
        secondsPerItem = 12; // Quick Review speed
        
        // Bonus: If related to a high mastery tag (mock logic), user learns faster
        // In real app: check mastery of other nodes with same tags.
        secondsPerItem *= 0.9; 
    }

    // 3. Optimism Bias (Psychology: Make it feel 20% shorter to encourage start)
    // Users usually overestimate their speed, but we want to lower the entry barrier.
    const optimismFactor = 0.8;

    const totalSeconds = totalItems * secondsPerItem * optimismFactor;
    
    // Minimum 1 minute
    return Math.max(1, Math.ceil(totalSeconds / 60));
};

// --- COMPONENT: ESTIMATED TIME BADGE ---
export const EstimatedTimeBadge: React.FC<{ node: KnowledgeNode }> = ({ node }) => {
    const minutes = useMemo(() => calculateStudyTime(node), [node]);

    if (minutes === 0) return null;

    // Color coding: Fast (Green) vs Long (Orange)
    const colorClass = minutes < 5 ? "text-green-300 bg-green-900/30 border-green-500/30" : 
                       minutes < 15 ? "text-yellow-300 bg-yellow-900/30 border-yellow-500/30" : 
                       "text-orange-300 bg-orange-900/30 border-orange-500/30";

    return (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold backdrop-blur-md ${colorClass}`} title="Thời gian học dự kiến (đã tối ưu)">
            <span className="material-symbols-outlined text-[12px]">timer</span>
            <span>~{minutes} phút</span>
        </div>
    );
};

// --- LOGIC: RETENTION FORECAST ---
// Ebbinghaus Forgetting Curve: R = e^(-t/S)
// We simplify: If you skip today (t=1), how much does R drop based on current Interval?
const calculateRetentionDrop = (node: KnowledgeNode) => {
    // Find average interval of items
    const items = node.data?.flashcards || [];
    if (items.length === 0) return { current: 100, tomorrow: 100, drop: 0 };

    const avgInterval = items.reduce((acc, i) => acc + (i.sm2?.interval || 0), 0) / items.length;
    
    // If interval is 0 (New/Forgot), Stability is very low (e.g., 0.5 days)
    const S = Math.max(0.5, avgInterval); 

    // Current (Supposed to review today -> t=0 relative to due) -> R ≈ 90% (SM-2 target)
    const currentR = 90; 

    // Tomorrow (t=1 day late)
    // Simplified Decay: The smaller the S (interval), the harder the fall.
    const timeDelay = 1; 
    const projectedR = 100 * Math.exp(-timeDelay / S); // Raw math
    
    // Normalize logic for UI impact
    // If S is small (new items), drop is huge (e.g. 90% -> 40%)
    // If S is large (mastered), drop is tiny (e.g. 90% -> 89%)
    
    let uiProjectedR = Math.round(projectedR);
    // Cap at 90 start
    if (uiProjectedR > 90) uiProjectedR = 89;

    return {
        current: 90,
        tomorrow: uiProjectedR,
        drop: 90 - uiProjectedR
    };
};

// --- COMPONENT: RETENTION FORECAST CHART ---
export const RetentionForecastChart: React.FC<{ node: KnowledgeNode }> = ({ node }) => {
    const { current, tomorrow, drop } = useMemo(() => calculateRetentionDrop(node), [node]);
    
    // Don't scare new users too much if drop is negligible
    if (drop < 2) return (
        <div className="text-[10px] text-green-400 flex items-center justify-center gap-1 mt-2">
            <span className="material-symbols-outlined text-xs">check_circle</span>
            Kiến thức vẫn an toàn!
        </div>
    );

    return (
        <div className="mt-3 bg-black/40 p-3 rounded-xl border border-red-500/20 relative overflow-hidden group/chart">
            <div className="flex justify-between items-end mb-2 relative z-10">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Nguy cơ quên</span>
                <span className="text-xs font-black text-red-400 animate-pulse">-{drop}%</span>
            </div>
            
            {/* Mini Line Chart SVG */}
            <div className="h-12 w-full relative z-10">
                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                    {/* Grid Lines */}
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#334155" strokeWidth="1" />
                    <line x1="0" y1="0" x2="0" y2="50" stroke="#334155" strokeWidth="1" />
                    
                    {/* The Curve */}
                    <path 
                        d={`M 0 5 Q 50 ${50 - (current - 50)} 100 ${50 - (tomorrow - 50)}`} 
                        fill="none" 
                        stroke="#f87171" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                    />
                    
                    {/* Today Point */}
                    <circle cx="0" cy="5" r="3" fill="#4ade80" />
                    <text x="5" y="15" fontSize="8" fill="#4ade80">Nay</text>

                    {/* Tomorrow Point */}
                    <circle cx="100" cy={`${50 - (tomorrow - 50)}`} r="3" fill="#f87171" />
                    <text x="80" y={`${50 - (tomorrow - 50) - 5}`} fontSize="8" fill="#f87171">Mai</text>
                </svg>
            </div>

            {/* Background Fear Factor */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent pointer-events-none"></div>
            
            <p className="text-[9px] text-slate-400 mt-2 text-center relative z-10">
                Nếu không học hôm nay, bạn sẽ mất <strong className="text-white">{drop}%</strong> trí nhớ vào ngày mai.
            </p>
        </div>
    );
};
