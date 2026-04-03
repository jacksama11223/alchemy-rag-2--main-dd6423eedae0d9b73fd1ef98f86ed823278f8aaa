
import React, { useState, useEffect } from 'react';
import { Quest } from '../../types';
import { useGamification } from '../../contexts/GamificationContext';

// ----------------------------------------------------------------------
// 10. STREAK FLAME: Calculated Streak Visualization
// ----------------------------------------------------------------------

export const StreakFlame: React.FC = () => {
    // SYNC: Get real streak status from context
    const { progress, isCheckedInToday, checkIn } = useGamification();
    const days = progress.streak;

    // Determine flame intensity based on streak
    const colorClass = days > 30 ? 'text-purple-500' : days > 14 ? 'text-red-500' : days > 7 ? 'text-orange-500' : 'text-yellow-500';
    
    // Grey out if not checked in today to encourage action
    const displayColor = isCheckedInToday ? colorClass : 'text-slate-500';
    const borderColor = isCheckedInToday ? 'border-orange-500/50' : 'border-slate-600 hover:border-orange-500/50';

    return (
        <div 
            onClick={() => !isCheckedInToday && checkIn()}
            className={`group relative flex items-center gap-1.5 bg-[#1e1e1e] px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${borderColor}`}
            title={isCheckedInToday ? "Đã điểm danh hôm nay" : "Nhấn để điểm danh!"}
        >
            <div className="relative">
                <span className={`material-symbols-outlined text-xl relative z-10 transition-colors ${displayColor} ${isCheckedInToday ? 'animate-pulse' : ''}`}>local_fire_department</span>
                {/* Glow Effect only if active */}
                {isCheckedInToday && <div className={`absolute inset-0 blur-md ${colorClass} opacity-50`}></div>}
            </div>
            
            <div className="flex flex-col leading-none">
                <span className={`text-sm font-black transition-colors ${displayColor}`}>{days}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Day Streak</span>
            </div>

            {/* Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black/90 p-3 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none text-center shadow-xl">
                <p className={`text-xs font-bold mb-1 ${isCheckedInToday ? 'text-orange-200' : 'text-slate-300'}`}>
                    {isCheckedInToday ? "🔥 Bạn đang cháy!" : "🌑 Ngọn lửa đang tắt..."}
                </p>
                <p className="text-[10px] text-slate-400">
                    {isCheckedInToday 
                        ? "Học liên tục để duy trì ngọn lửa. Thêm 3 ngày nữa để mở khóa Skin 'Phoenix'." 
                        : "Nhấn vào đây hoặc học bài để giữ chuỗi ngày!"}
                </p>
            </div>
        </div>
    );
};

// ... (Keep StudyGroupHub, LeaderboardWidget, MysteryBoxReward, QuestLog as they are) ...
// ----------------------------------------------------------------------
// 11. ACHIEVEMENT CABINET: Interactive Badge Display (REAL DATA)
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

    // Sort to show most relevant: 
    // 1. Recently Unlocked
    // 2. Highest Progress (Not Unlocked)
    const displayBadges = [...achievements].sort((a, b) => {
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

export const StudyGroupHub: React.FC = () => {
    // Function to navigate to community
    const handleEnterGroup = () => {
        alert("Vui lòng truy cập mục 'Cộng Đồng' > 'AIR Room' để vào phòng!");
    };

    return (
        <div className="mt-4 p-4 bg-cyan-900/10 border border-cyan-500/20 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-colors"></div>
            
            <h4 className="text-cyan-200 font-bold text-xs mb-3 flex items-center gap-2 relative z-10 uppercase tracking-wide">
                <span className="material-symbols-outlined text-sm">hub</span> AIR Room (Live)
            </h4>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border-2 border-[#1e1e1e] flex items-center justify-center text-[8px] text-white">
                            {String.fromCharCode(64+i)}
                        </div>
                    ))}
                    <div className="w-6 h-6 rounded-full bg-cyan-600 border-2 border-[#1e1e1e] flex items-center justify-center text-[8px] text-white font-bold">+12</div>
                </div>
                <span className="text-[10px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online</span>
            </div>

            <div className="flex gap-2 relative z-10">
                <button 
                    onClick={handleEnterGroup}
                    className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded-lg transition-colors shadow-lg flex items-center justify-center gap-1"
                >
                     <span className="material-symbols-outlined text-sm">login</span> Vào phòng
                </button>
                <button className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"><span className="material-symbols-outlined text-sm">settings_voice</span></button>
            </div>
        </div>
    );
};

export const LeaderboardWidget: React.FC = () => {
    const [users, setUsers] = useState([
        { id: 1, name: 'Minh', score: 2100, trend: 'up' },
        { id: 2, name: 'Lan', score: 1950, trend: 'down' },
        { id: 3, name: 'Nam', score: 1500, trend: 'same' },
        { id: 4, name: 'Bạn', score: 1250, trend: 'up' },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setUsers(prev => prev.map(u => ({
                ...u,
                score: u.score + (Math.random() > 0.7 ? Math.floor(Math.random() * 50) : 0)
            })).sort((a,b) => b.score - a.score));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-4 my-4 shadow-lg">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">trophy</span> Top Tuần
                </h4>
                <span className="text-[10px] text-slate-500 cursor-pointer hover:text-white">Xem tất cả</span>
            </div>
            
            <div className="space-y-1">
                {users.map((u, i) => (
                    <div 
                        key={u.id} 
                        className={`flex justify-between items-center text-xs p-2 rounded-lg transition-all duration-500 ${
                            u.name === 'Bạn' 
                            ? 'bg-amber-900/20 border border-amber-500/30' 
                            : 'hover:bg-white/5'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`font-mono font-bold w-4 text-center ${
                                i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-500'
                            }`}>
                                {i+1}
                            </span>
                            <span className={u.name === 'Bạn' ? 'text-white font-bold' : 'text-slate-300'}>{u.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-mono">{u.score}</span>
                            <span className={`material-symbols-outlined text-[10px] ${
                                u.trend === 'up' ? 'text-green-500' : u.trend === 'down' ? 'text-red-500' : 'text-slate-600'
                            }`}>
                                {u.trend === 'up' ? 'arrow_upward' : u.trend === 'down' ? 'arrow_downward' : 'remove'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const MysteryBoxReward: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
    const [opened, setOpened] = useState(false);
    const [reward, setReward] = useState<{ type: string, val: string } | null>(null);

    const handleOpen = () => {
        if (opened) return;
        setOpened(true);
        
        const rewards = [
            { type: 'xp', val: '+100 XP' },
            { type: 'skin', val: 'Skin: Neon' },
            { type: 'badge', val: 'Badge: Lucky' },
            { type: 'nothing', val: 'Chúc may mắn lần sau' }
        ];
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
        setReward(randomReward);
        
        setTimeout(() => {
            onOpen();
        }, 2000);
    };

    if (reward) {
        return (
            <div className="animate-bounce-in bg-[#1e1e1e] border border-yellow-500/50 p-3 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] text-center min-w-[120px]">
                <div className="text-2xl mb-1">{reward.type === 'xp' ? '⚡' : reward.type === 'skin' ? '🎨' : '🎁'}</div>
                <div className="text-xs font-bold text-yellow-400">{reward.val}</div>
            </div>
        );
    }

    return (
        <div 
            className="animate-[float_3s_ease-in-out_infinite] cursor-pointer group relative" 
            onClick={handleOpen} 
            title="Mở quà bí ẩn!"
        >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.6)] flex items-center justify-center border-2 border-white/20 group-hover:scale-110 transition-transform group-hover:rotate-6">
                <span className="material-symbols-outlined text-white text-2xl group-hover:animate-ping">card_giftcard</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold border border-[#020410]">1</div>
        </div>
    );
};

interface QuestLogProps {
    isOpen: boolean;
    onClose: () => void;
    quests: Quest[];
    onClaimReward?: (quest: Quest) => void;
}

export const QuestLog: React.FC<QuestLogProps> = ({ isOpen, onClose, quests = [], onClaimReward }) => {
    const [activeTab, setActiveTab] = useState<'Daily' | 'Weekly' | 'Epic' | 'LearningPath'>('Daily');
    const defaultQuests: Quest[] = [
        { id: '1', title: "Liên kết 10 Nodes", type: 'Daily', progress: 7, total: 10, reward: "50 XP", completed: false, description: "Tạo liên kết giữa các khái niệm rời rạc." },
        { id: '2', title: "Thêm 3 ghi chú", type: 'Daily', progress: 3, total: 3, reward: "Badge: Scribe", completed: true, description: "Ghi chép lại những ý tưởng mới." },
        { id: '3', title: "Mastery 5 Topics", type: 'Weekly', progress: 2, total: 5, reward: "200 XP", completed: false, description: "Đạt mức tinh thông cao nhất cho 5 chủ đề." },
        { id: '4', title: "The Architect", type: 'Epic', progress: 45, total: 100, reward: "Skin: Galaxy", completed: false, description: "Xây dựng một mạng lưới tri thức khổng lồ." },
        { id: '5', title: "Lộ trình AI: Cải thiện điểm yếu", type: 'LearningPath', progress: 0, total: 1, reward: "Start", completed: false, description: "AI sẽ phân tích các nốt yếu và tạo lộ trình học tập thích ứng." }
    ];
    
    // Merge provided quests with default quests, prioritizing user quests
    const allQuests = [...quests];
    defaultQuests.forEach(dq => {
        if (!allQuests.some(q => q.id === dq.id)) {
            allQuests.push(dq);
        }
    });

    useEffect(() => {
        if (isOpen && quests.some(q => q.type === 'LearningPath' && !q.completed)) {
            setActiveTab('LearningPath');
        }
    }, [isOpen, quests]);

    const filteredQuests = allQuests.filter(q => q.type === activeTab);
    
    if (!isOpen) return null;
    
    return (
        <div className="absolute top-24 left-6 w-80 bg-[#1e1e1e]/95 backdrop-blur-md border border-amber-500/30 rounded-2xl p-0 z-40 shadow-2xl animate-slide-right flex flex-col overflow-hidden max-h-[500px]">
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-amber-900/20 to-transparent flex justify-between items-center">
                <h5 className="text-sm font-bold text-amber-400 uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">assignment_turned_in</span> Nhiệm vụ
                </h5>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">close</span></button>
            </div>
            <div className="flex border-b border-white/10 overflow-x-auto scrollbar-hide">
                {['LearningPath', 'Daily', 'Weekly', 'Epic'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-3 px-2 text-[10px] font-bold uppercase transition-colors relative whitespace-nowrap ${
                            activeTab === tab ? 'text-amber-400 bg-white/5' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                    >
                        {tab === 'LearningPath' ? 'Lộ Trình' : tab}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 shadow-[0_0_10px_orange]"></div>}
                    </button>
                ))}
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-700">
                {filteredQuests.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs italic">
                        Không có nhiệm vụ nào. Hãy quay lại sau!
                    </div>
                )}
                {filteredQuests.map(q => {
                    const isCompletable = q.progress >= q.total && !q.completed;
                    const isStartable = q.type === 'LearningPath' && !q.completed; // Learning Path tasks are "started" not just claimed
                    
                    return (
                        <div key={q.id} className={`p-3 rounded-xl border relative overflow-hidden group transition-all ${q.completed ? 'bg-green-900/20 border-green-500/30' : isCompletable || isStartable ? 'bg-amber-900/20 border-amber-500' : 'bg-black/20 border-white/5 hover:border-amber-500/30'}`}>
                            {q.completed && <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent pointer-events-none"></div>}
                            <div className="flex justify-between mb-1 relative z-10">
                                <span className={`text-sm font-bold ${q.completed ? 'text-green-300' : 'text-slate-200'}`}>{q.title}</span>
                                {q.completed 
                                    ? <span className="text-[10px] bg-green-500 text-black px-2 py-0.5 rounded font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">check</span> Claimed</span>
                                    : <span className="text-[10px] text-amber-400 font-mono bg-amber-900/30 px-2 py-0.5 rounded border border-amber-500/30">{q.reward}</span>
                                }
                            </div>
                            <p className="text-[10px] text-slate-400 mb-3 line-clamp-2 relative z-10">{q.description}</p>
                            <div className="relative z-10">
                                {q.type !== 'LearningPath' && (
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5 mb-2">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${q.completed ? 'bg-green-500' : 'bg-amber-500'}`} 
                                            style={{ width: `${Math.min(100, (q.progress / q.total) * 100)}%` }}
                                        ></div>
                                    </div>
                                )}
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-[9px] text-slate-500 font-mono">{q.type === 'LearningPath' ? 'Adaptive AI' : `${q.progress} / ${q.total}`}</span>
                                    
                                    {(isCompletable || isStartable) && onClaimReward && (
                                        <button 
                                            onClick={() => onClaimReward(q)}
                                            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold rounded shadow-lg animate-pulse"
                                        >
                                            {q.type === 'LearningPath' ? 'Bắt đầu ngay' : 'Nhận thưởng'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="p-4 border-t border-white/10 bg-black/20 text-center">
                <p className="text-[10px] text-slate-500">New quests available in 04:23:12</p>
            </div>
        </div>
    );
};
