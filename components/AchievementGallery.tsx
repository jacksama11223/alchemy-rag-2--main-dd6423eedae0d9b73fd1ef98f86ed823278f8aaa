
import React, { useState, useEffect } from 'react';
import { useGamification } from '../contexts/GamificationContext';
import { useBehavior } from '../contexts/BehaviorContext'; // Import Behavior
import { KnowledgeNode } from '../types';

interface AchievementGalleryProps {
    onBack: () => void;
    userNodes: KnowledgeNode[];
}

const AchievementGallery: React.FC<AchievementGalleryProps> = ({ onBack, userNodes }) => {
    const { progress } = useGamification();
    const { logs } = useBehavior(); // Get logs
    
    const [filter, setFilter] = useState('All');

    const categories = ['All', 'Alchemy', 'Tutor', 'Graph', 'Drive', 'Social', 'General'];
    
    // Safety check for render
    const safeAchievements = Array.isArray(progress.achievements) ? progress.achievements : [];
    const filteredAchievements = safeAchievements.filter(a => filter === 'All' || a.category === filter);
    const unlockedCount = safeAchievements.filter(a => a.unlockedAt).length;

    return (
        <div className="relative min-h-screen w-full bg-[#020617] text-slate-200 font-display overflow-hidden flex flex-col">
            <style>{`
                .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
                .pearl-shine {
                    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 60%);
                    box-shadow: inset 0 0 20px rgba(255,255,255,0.05);
                }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
            `}</style>

            {/* Deep Sea Background Effect */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]"></div>
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]"></div>
            </div>

            <header className="relative z-10 flex h-16 items-center justify-between px-6 border-b border-white/10 bg-black/20 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400">military_tech</span>
                        Đền Thờ Thành Tựu
                    </h2>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tiến trình chung</p>
                        <p className="text-sm font-black text-amber-400">{unlockedCount} / {safeAchievements.length} Đã mở khóa</p>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-thumb-white/10">
                <div className="max-w-6xl mx-auto space-y-12">
                    
                    {/* Standard Filter Tabs */}
                    <div className="flex flex-wrap gap-2 justify-center border-t border-white/10 pt-8">
                        {categories.map(c => (
                            <button 
                                key={c}
                                onClick={() => setFilter(c)}
                                className={`px-6 py-2 rounded-full text-xs font-bold transition-all border ${filter === c ? 'bg-amber-500 border-amber-400 text-black shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    {/* Standard Achievement Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredAchievements.map(a => {
                            const isLocked = !a.unlockedAt;
                            return (
                                <div 
                                    key={a.id} 
                                    className={`relative group rounded-2xl border transition-all duration-500 p-6 flex flex-col items-center text-center pearl-shine ${
                                        isLocked 
                                        ? 'bg-black/40 border-white/5 opacity-60' 
                                        : 'bg-[#1e293b]/60 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)] hover:border-amber-400 hover:shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-float-slow'
                                    }`}
                                >
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 relative ${isLocked ? 'bg-slate-800' : 'bg-amber-500/10 shadow-inner ring-1 ring-amber-500/50'}`}>
                                        <span className={`material-symbols-outlined text-4xl ${isLocked ? 'text-slate-600' : 'text-amber-400'}`}>{a.icon}</span>
                                        {!isLocked && <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl animate-pulse"></div>}
                                    </div>
                                    
                                    <h4 className={`font-bold text-sm mb-1 ${isLocked ? 'text-slate-500' : 'text-white'}`}>{a.title}</h4>
                                    <p className="text-[10px] text-slate-500 leading-relaxed mb-4 line-clamp-2">{a.description}</p>
                                    
                                    <div className="mt-auto w-full space-y-2">
                                        <div className="flex justify-between text-[8px] font-black uppercase text-slate-600">
                                            <span>Tiến độ</span>
                                            <span>{a.progress}/{a.goal}</span>
                                        </div>
                                        <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${isLocked ? 'bg-slate-600' : 'bg-amber-500 shadow-[0_0_5px_gold]'}`}
                                                style={{ width: `${Math.min(100, (a.progress / a.goal) * 100)}%` }}
                                            ></div>
                                        </div>
                                        
                                        {!isLocked ? (
                                            <span className="text-[9px] font-bold text-green-400 flex items-center justify-center gap-1 mt-2">
                                                <span className="material-symbols-outlined text-[12px]">verified</span>
                                                {new Date(a.unlockedAt!).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-bold text-slate-600 flex items-center justify-center gap-1 mt-2">
                                                <span className="material-symbols-outlined text-[12px]">lock</span>
                                                {a.rewardXP} XP
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default React.memo(AchievementGallery);
