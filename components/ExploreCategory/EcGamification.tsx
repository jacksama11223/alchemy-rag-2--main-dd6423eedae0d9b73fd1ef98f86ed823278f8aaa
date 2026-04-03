
import React from 'react';
import { useGamification } from '../../contexts/GamificationContext';

// 1. AstronautAvatar
export const AstronautAvatar: React.FC<{ level: number, src: string }> = ({ level, src }) => (
    <div className="relative inline-block group cursor-pointer">
        <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-500 animate-spin-slow">
            <div className="w-full h-full rounded-full bg-black p-[2px]">
                <img src={src} className="w-full h-full rounded-full object-cover" alt="Avatar" />
            </div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-black">
            {level}
        </div>
    </div>
);

// 2. CosmicRankBadge
export const CosmicRankBadge: React.FC<{ rank: string }> = ({ rank }) => (
    <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-lg border border-purple-500/50 shadow-lg">
        <span className="material-symbols-outlined text-yellow-400 text-sm">military_tech</span>
        <span className="text-xs font-bold text-purple-100 uppercase tracking-wider">{rank}</span>
    </div>
);

// 3. CometStreakCounter
export const CometStreakCounter: React.FC<{ streak: number }> = ({ streak }) => (
    <div className="flex flex-col items-center">
        <span className="material-symbols-outlined text-3xl text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse">local_fire_department</span>
        <span className="text-xs font-black text-orange-400 uppercase">{streak} DAYS</span>
    </div>
);

// 4. StardustCurrency
export const StardustCurrency: React.FC<{ amount: number }> = ({ amount }) => (
    <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-yellow-500/30">
        <span className="material-symbols-outlined text-yellow-400 text-sm">diamond</span>
        <span className="text-sm font-mono font-bold text-yellow-100">{amount.toLocaleString()}</span>
    </div>
);

// 5. MissionLogPanel
export const MissionLogPanel: React.FC = () => (
    <div className="bg-[#1e293b] rounded-xl p-4 border border-white/10 w-64">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">assignment</span> Nhiệm vụ hàng ngày
        </h4>
        <div className="space-y-2">
            {[1, 2].map(i => (
                <div key={i} className="flex items-start gap-2 p-2 bg-black/20 rounded hover:bg-black/30 cursor-pointer">
                    <div className="mt-0.5 w-4 h-4 rounded border border-slate-500 flex items-center justify-center"></div>
                    <div className="flex-1">
                        <p className="text-xs text-slate-200">Hoàn thành 5 Flashcards</p>
                        <p className="text-[10px] text-yellow-500">+50 Stardust</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// 6. AchievementMedalCase
export const AchievementMedalCase: React.FC = () => (
    <div className="grid grid-cols-4 gap-2 bg-black/20 p-2 rounded-xl">
        {['school', 'bolt', 'auto_stories', 'lock'].map((icon, i) => (
            <div key={i} className={`w-10 h-10 rounded-lg flex items-center justify-center ${icon === 'lock' ? 'bg-slate-800 text-slate-600' : 'bg-gradient-to-br from-yellow-600 to-yellow-800 text-white shadow-lg'} hover:scale-110 transition-transform cursor-help`}>
                <span className="material-symbols-outlined text-lg">{icon}</span>
            </div>
        ))}
    </div>
);

// 7. GalacticLeaderboard
export const GalacticLeaderboard: React.FC = () => (
    <div className="w-full bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden">
        <div className="bg-white/5 p-3 text-xs font-bold text-white uppercase text-center">Bảng Xếp Hạng Thiên Hà</div>
        <div className="p-2 space-y-1">
            {[1, 2, 3].map(rank => (
                <div key={rank} className={`flex items-center p-2 rounded ${rank === 1 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'hover:bg-white/5'}`}>
                    <span className={`w-6 text-center font-bold ${rank === 1 ? 'text-yellow-400' : 'text-slate-500'}`}>{rank}</span>
                    <div className="w-6 h-6 rounded-full bg-slate-700 mx-2"></div>
                    <span className="flex-1 text-xs text-slate-300">SpaceCadet_{rank}</span>
                    <span className="text-xs font-mono text-cyan-400">{1000 - rank * 50} XP</span>
                </div>
            ))}
        </div>
    </div>
);

// 8. SkillTechTree
export const SkillTechTree: React.FC = () => (
    <div className="flex flex-col items-center gap-4 relative py-4">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white z-10 shadow-[0_0_15px_rgba(34,197,94,0.5)]">
            <span className="material-symbols-outlined text-lg">html</span>
        </div>
        <div className="w-0.5 h-8 bg-slate-600"></div>
        <div className="flex gap-8 relative">
            <div className="absolute top-0 left-5 right-5 h-0.5 bg-slate-600 -translate-y-4"></div> {/* Connector */}
            <div className="flex flex-col items-center gap-2">
                <div className="h-4 w-0.5 bg-slate-600 -mt-4"></div>
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white z-10">
                    <span className="material-symbols-outlined text-lg">css</span>
                </div>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="h-4 w-0.5 bg-slate-600 -mt-4"></div>
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black z-10">
                    <span className="material-symbols-outlined text-lg">javascript</span>
                </div>
            </div>
        </div>
    </div>
);

// 9. RivalRadar
export const RivalRadar: React.FC = () => (
    <div className="relative w-32 h-32 flex items-center justify-center bg-black/40 rounded-full border border-white/10">
        <div className="absolute inset-0 border border-white/5 rounded-full scale-50"></div>
        <div className="absolute inset-0 border border-white/5 rounded-full scale-75"></div>
        {/* Mock Polygon */}
        <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 text-cyan-500/50 fill-current">
            <polygon points="50,10 90,40 70,90 30,90 10,40" />
        </svg>
        <span className="text-[9px] text-white z-10 font-bold">VS</span>
    </div>
);

// 10. ExpGainerEffect (Visual placeholder for animation)
export const ExpGainerEffect: React.FC = () => (
    <div className="absolute top-0 right-0 transform -translate-y-full animate-bounce text-yellow-400 font-black text-sm shadow-black drop-shadow-md">
        +150 XP
    </div>
);

// ----------------------------------------------------------------------
// 11. ACHIEVEMENT CABINET: Interactive Badge Display
// ----------------------------------------------------------------------

export const AchievementCabinet: React.FC = () => {
    const { progress } = useGamification();
    const achievements = progress.achievements || [];

    // Calculate Stats
    const totalCount = achievements.length;
    const unlockedCount = achievements.filter(a => a.unlockedAt).length;

    // Helper to map category to color
    const getCategoryColor = (category: string) => {
        switch(category) {
            case 'Alchemy': return 'text-cyan-400';
            case 'Tutor': return 'text-green-400';
            case 'Graph': return 'text-purple-400';
            case 'Drive': return 'text-blue-400';
            case 'Social': return 'text-pink-400';
            default: return 'text-yellow-400';
        }
    };

    // Safely sort
    const displayBadges = [...(Array.isArray(achievements) ? achievements : [])].sort((a, b) => {
        if (a.unlockedAt && !b.unlockedAt) return -1;
        if (!a.unlockedAt && b.unlockedAt) return 1;
        if (a.unlockedAt && b.unlockedAt) {
            return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
        }
        // Both locked: sort by % completion
        const progA = a.progress / a.goal;
        const progB = b.progress / b.goal;
        return progB - progA;
    }).slice(0, 4); // Take top 4

    return (
        <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-4 my-4 shadow-lg">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thành tựu</h4>
                <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded font-mono">
                    {unlockedCount}/{totalCount}
                </span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
                {displayBadges.map((b) => {
                    const isUnlocked = !!b.unlockedAt;
                    const colorClass = getCategoryColor(b.category);
                    const percentage = Math.min(100, Math.round((b.progress / b.goal) * 100));

                    return (
                        <div key={b.id} className="group relative">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                isUnlocked 
                                ? 'bg-white/5 hover:bg-white/10 shadow-[0_0_10px_rgba(0,0,0,0.3)]' 
                                : 'bg-black/40 border border-white/5 opacity-60 grayscale'
                            }`}>
                                <span className={`material-symbols-outlined text-xl ${isUnlocked ? colorClass : 'text-slate-600'}`}>{b.icon}</span>
                                
                                {/* Progress Ring for Locked Items */}
                                {!isUnlocked && (
                                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5">
                                        <circle cx="20" cy="20" r="18" fill="none" stroke="#333" strokeWidth="2" />
                                        <circle 
                                            cx="20" cy="20" r="18" 
                                            fill="none" 
                                            stroke="#4f46e5" 
                                            strokeWidth="2" 
                                            strokeDasharray="113" 
                                            strokeDashoffset={113 - (113 * percentage) / 100} 
                                            strokeLinecap="round" 
                                        />
                                    </svg>
                                )}
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#0f172a] p-3 rounded-lg border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                <div className="flex justify-between items-start mb-1">
                                    <p className={`text-xs font-bold ${isUnlocked ? colorClass : 'text-slate-400'}`}>{b.title}</p>
                                    {isUnlocked && <span className="text-[10px] text-green-500">✔</span>}
                                </div>
                                <p className="text-[10px] text-slate-400 leading-tight mb-2">{b.description}</p>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${isUnlocked ? 'bg-green-500' : 'bg-indigo-500'}`} 
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <p className="text-[9px] text-slate-500 mt-1 text-right">{b.progress} / {b.goal}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
