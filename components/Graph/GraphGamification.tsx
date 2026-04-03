
import React, { useState, useEffect } from 'react';
import { Quest } from '../../types';
import { useGamification } from '../../contexts/GamificationContext';

// ----------------------------------------------------------------------
// 10. STREAK FLAME: Calculated Streak Visualization (Enhanced)
// ----------------------------------------------------------------------

export const StreakFlame: React.FC<{ days: number }> = ({ days }) => {
    // Determine flame intensity based on streak
    const intensity = Math.min(10, Math.floor(days / 5)) + 1; // 1 to 10
    const colorClass = days > 30 ? 'text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]' : days > 14 ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : days > 7 ? 'text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]' : 'text-yellow-500';
    
    return (
        <div className="group relative flex items-center gap-1.5 bg-[#1e1e1e] px-3 py-1.5 rounded-full border border-white/10 hover:border-orange-500/50 transition-colors cursor-help shadow-lg hover:scale-105 transform duration-300">
            <div className="relative">
                <span className={`material-symbols-outlined text-xl ${colorClass} animate-[pulse_2s_infinite] relative z-10`}>local_fire_department</span>
                {/* Enhanced Glow Effect */}
                <div className={`absolute inset-0 blur-md ${colorClass.split(' ')[0].replace('text', 'bg')} opacity-50 animate-pulse`}></div>
            </div>
            
            <div className="flex flex-col leading-none">
                <span className={`text-sm font-black ${colorClass}`}>{days}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Chuỗi Ngày Nghiên Cứu</span>
            </div>

            {/* Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black/90 p-3 rounded-xl border border-orange-500/30 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none text-center shadow-xl backdrop-blur-md">
                <p className="text-xs text-orange-200 font-bold mb-1">🔥 Phong độ nghiên cứu đỉnh cao!</p>
                <p className="text-[10px] text-slate-400">Duy trì cường độ nghiên cứu. Thêm 3 ngày để đạt cấp độ 'Phượng Hoàng'.</p>
            </div>
        </div>
    );
};

// ... (Keep AchievementCabinet, StudyGroupHub, LeaderboardWidget, MysteryBoxReward as they are) ...
// ----------------------------------------------------------------------
// 11. ACHIEVEMENT CABINET: Interactive Badge Display
// ----------------------------------------------------------------------

interface Badge {
    id: string;
    icon: string;
    color: string;
    title: string;
    desc: string;
    unlocked: boolean;
    progress?: number;
}

export const AchievementCabinet: React.FC = () => {
    const badges: Badge[] = [
        { id: 'alchemy', icon: 'science', color: 'text-cyan-400', title: 'Nhà Tổng Hợp Tri Thức', desc: 'Hoàn thành 10 mô-đun kiến thức', unlocked: true },
        { id: 'speed', icon: 'bolt', color: 'text-yellow-400', title: 'Tốc Độ Xử Lý', desc: 'Hoàn thành phân tích dưới 1 phút', unlocked: true },
        { id: 'scholar', icon: 'auto_stories', color: 'text-purple-400', title: 'Chuyên Gia Lĩnh Vực', desc: 'Đạt mức tinh thông 100% cho 5 chủ đề', unlocked: false, progress: 60 },
        { id: 'social', icon: 'share', color: 'text-pink-400', title: 'Người Lan Tỏa Tri Thức', desc: 'Chia sẻ 5 báo cáo nghiên cứu', unlocked: false, progress: 20 },
    ];

    return (
        <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-4 my-4 shadow-lg">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hồ Sơ Năng Lực</h4>
                <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded">2/4</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
                {badges.map((b) => (
                    <div key={b.id} className="group relative">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            b.unlocked 
                            ? 'bg-white/5 hover:bg-white/10 shadow-[0_0_10px_rgba(0,0,0,0.3)] hover:scale-110 cursor-pointer' 
                            : 'bg-black/40 border border-white/5 opacity-50 grayscale'
                        }`}>
                            <span className={`material-symbols-outlined text-xl ${b.unlocked ? b.color : 'text-slate-600'}`}>{b.icon}</span>
                            
                            {/* Progress Ring for Locked Items */}
                            {!b.unlocked && b.progress && (
                                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5">
                                    <circle cx="20" cy="20" r="18" fill="none" stroke="#333" strokeWidth="2" />
                                    <circle cx="20" cy="20" r="18" fill="none" stroke="#4f46e5" strokeWidth="2" strokeDasharray="113" strokeDashoffset={113 - (113 * b.progress) / 100} strokeLinecap="round" />
                                </svg>
                            )}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-[#0f172a] p-2 rounded-lg border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            <p className={`text-xs font-bold mb-1 ${b.unlocked ? b.color : 'text-slate-400'}`}>{b.title}</p>
                            <p className="text-[10px] text-slate-400 leading-tight">{b.desc}</p>
                            {!b.unlocked && b.progress && (
                                <div className="mt-2 w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${b.progress}%` }}></div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const StudyGroupHub: React.FC = () => {
    return (
        <div className="mt-4 p-4 bg-indigo-900/10 border border-indigo-500/20 rounded-xl relative overflow-hidden group hover:border-indigo-500/50 transition-colors cursor-pointer">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors"></div>
            
            <h4 className="text-indigo-200 font-bold text-xs mb-3 flex items-center gap-2 relative z-10">
                <span className="material-symbols-outlined text-sm">groups</span> Nhóm Nghiên Cứu: React Devs
            </h4>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border-2 border-[#1e1e1e] flex items-center justify-center text-[8px] text-white">
                            {String.fromCharCode(64+i)}
                        </div>
                    ))}
                    <div className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-[#1e1e1e] flex items-center justify-center text-[8px] text-white font-bold">+5</div>
                </div>
                <span className="text-[10px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> 3 Online</span>
            </div>

            <div className="flex gap-2 relative z-10">
                <button className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition-colors shadow-lg">Tham gia thảo luận</button>
                <button className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"><span className="material-symbols-outlined text-sm">qr_code</span></button>
            </div>
        </div>
    );
};

export const LeaderboardWidget: React.FC = () => {
    const [users, setUsers] = useState([
        { id: 1, name: 'Minh', score: 2100, trend: 'up' },
        { id: 2, name: 'Lan', score: 1950, trend: 'down' },
        { id: 3, name: 'Nam', score: 1500, trend: 'same' },
        { id: 4, name: 'Tôi', score: 1250, trend: 'up' },
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
                    <span className="material-symbols-outlined text-sm">trophy</span> Xếp Hạng Tuần
                </h4>
                <span className="text-[10px] text-slate-500 cursor-pointer hover:text-white">Xem toàn bộ danh sách</span>
            </div>
            
            <div className="space-y-1">
                {users.map((u, i) => (
                    <div 
                        key={u.id} 
                        className={`flex justify-between items-center text-xs p-2 rounded-lg transition-all duration-500 ${
                            u.name === 'Tôi' 
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
                            <span className={u.name === 'Tôi' ? 'text-white font-bold' : 'text-slate-300'}>{u.name}</span>
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
            { type: 'nothing', val: 'Cần nỗ lực hơn' }
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
            title="Mở hộp vật phẩm nghiên cứu"
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
        { id: '1', title: "Liên kết 10 Khái Niệm", type: 'Daily', progress: 7, total: 10, reward: "50 XP", completed: false, description: "Thiết lập mối quan hệ giữa các dữ liệu rời rạc." },
        { id: '2', title: "Thêm 3 ghi chú nghiên cứu", type: 'Daily', progress: 3, total: 3, reward: "Badge: Scribe", completed: true, description: "Lưu trữ các giả thuyết và quan sát mới." },
        { id: '3', title: "Tinh Thông 5 Chủ Đề", type: 'Weekly', progress: 2, total: 5, reward: "200 XP", completed: false, description: "Đạt cấp độ chuyên gia cho 5 lĩnh vực." },
        { id: '4', title: "Kiến Trúc Sư Tri Thức", type: 'Epic', progress: 45, total: 100, reward: "Skin: Galaxy", completed: false, description: "Xây dựng hệ thống khái niệm phức hợp." },
        { id: '5', title: "Lộ Trình AI: Khắc phục lỗ hổng kiến thức", type: 'LearningPath', progress: 0, total: 1, reward: "Start", completed: false, description: "AI phân tích các điểm yếu và đề xuất lộ trình tối ưu hóa." }
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
                    <span className="material-symbols-outlined text-base">assignment_turned_in</span> Mục Tiêu Nghiên Cứu
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
                        Hiện tại không có mục tiêu mới. Vui lòng quay lại sau.
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
                                    ? <span className="text-[10px] bg-green-500 text-black px-2 py-0.5 rounded font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">check</span> Đã nhận</span>
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
                                            {q.type === 'LearningPath' ? 'Tiến hành ngay' : 'Ghi nhận thành tích'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="p-4 border-t border-white/10 bg-black/20 text-center">
                <p className="text-[10px] text-slate-500">Mục tiêu mới sẽ có trong 04:23:12</p>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// NEW COMPONENTS FOR EXPLOREGRAPH.TSX
// ----------------------------------------------------------------------

export const DailyStreakFlame: React.FC<{ className?: string }> = ({ className }) => {
    const { progress } = useGamification();
    return (
        <div className={`z-30 hidden md:block ${className}`}>
            <StreakFlame days={progress.streak} />
        </div>
    );
};

export const RPGOverlay: React.FC<{ level: number, xp: number, className?: string }> = ({ level, xp, className }) => {
    // Determine stats based on level
    const str = Math.floor(level * 2.5);
    const int = Math.floor(level * 4.2);
    const focus = Math.floor(level * 3.0);
    const xpForNextLevel = 1000;
    const progress = (xp % xpForNextLevel) / xpForNextLevel * 100;

    return (
        <div className={`hidden md:flex flex-col gap-2 bg-[#0f172a]/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl animate-fade-in group w-64 hover:border-blue-500/30 transition-all ${className}`}>
            {/* Main Level Badge */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-[2px] relative shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                     <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center relative overflow-hidden">
                         <span className="material-symbols-outlined text-white/20 text-3xl absolute">person</span>
                         <span className="text-lg font-black text-white relative z-10">{level}</span>
                     </div>
                     <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-[8px] font-bold text-black px-1.5 rounded border border-[#0f172a]">LVL</div>
                </div>
                
                <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Cấp Độ Nghiên Cứu</span>
                        <span className="text-[9px] text-blue-400 font-mono">{Math.floor(xp)} XP</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_cyan]" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Stats Panel (Expandable or Always visible) */}
            <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/5">
                <div className="text-center bg-white/5 rounded p-1">
                    <div className="text-[9px] text-slate-500 uppercase font-bold">STR</div>
                    <div className="text-xs text-red-400 font-mono">{str}</div>
                </div>
                <div className="text-center bg-white/5 rounded p-1">
                    <div className="text-[9px] text-slate-500 uppercase font-bold">INT</div>
                    <div className="text-xs text-blue-400 font-mono">{int}</div>
                </div>
                <div className="text-center bg-white/5 rounded p-1">
                    <div className="text-[9px] text-slate-500 uppercase font-bold">FOC</div>
                    <div className="text-xs text-yellow-400 font-mono">{focus}</div>
                </div>
            </div>
        </div>
    );
};

interface AchievementPopupProps {
    title: string;
    description: string;
    visible: boolean;
    onClose?: () => void;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({ title, description, visible, onClose }) => {
    useEffect(() => {
        if (visible && onClose) {
            const timer = setTimeout(() => onClose(), 6000);
            return () => clearTimeout(timer);
        }
    }, [visible, onClose]);

    if (!visible) return null;

    return (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-[60] bg-[#1e1e1e] border-2 border-yellow-500 rounded-2xl p-6 shadow-[0_0_50px_rgba(234,179,8,0.5)] flex flex-col items-center gap-2 animate-bounce-in max-w-sm text-center">
            <div className="relative">
                <div className="absolute inset-0 bg-yellow-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <span className="material-symbols-outlined text-6xl text-yellow-400 relative z-10 animate-bounce">emoji_events</span>
            </div>
            <h4 className="text-lg font-black text-white uppercase tracking-wider text-yellow-500 mt-2">Thăng Cấp / Đạt Thành Tựu!</h4>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-sm text-slate-300">{description}</p>
            <button onClick={onClose} className="mt-4 px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-full transition-colors">Xác nhận</button>
        </div>
    );
};
