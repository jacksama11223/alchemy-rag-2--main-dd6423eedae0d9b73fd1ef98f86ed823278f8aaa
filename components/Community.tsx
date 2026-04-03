
import React, { useState, useEffect } from 'react';
import { KnowledgeNode, LeaderboardEntry, UserAccount } from '../types';
import { useGamification } from '../contexts/GamificationContext';
import { fetchLeaderboard, getCurrentUser, getAllUsers, sendFriendRequestApi } from '../services/mockBackend';
import { StudyDiscord } from './Community/StudyDiscord'; // Import Discord Component
import { FeatureWindowControls } from './FeatureWindowControls';

interface CommunityProps {
    onBack: () => void;
    onShowAbout: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    userNodes?: KnowledgeNode[];
    onUpdateNode?: (node: KnowledgeNode) => void;
    onGoToBattle?: () => void; // New prop to navigate to LearnWithPeople
    onToggleTodo?: () => void; // Added Prop
    onNavigateToFeature?: (feature: string, params?: any) => void; // For Omni Nav
    startView?: 'HUB' | 'DISCORD'; // Optional initial view
}

const Community: React.FC<CommunityProps> = ({ onBack, onGoToBattle, onToggleTodo, startView = 'HUB' }) => {
    const { rankProfile } = useGamification();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'HUB' | 'DISCORD'>(startView);
    const [chatTarget, setChatTarget] = useState<UserAccount | null>(null);

    useEffect(() => {
        // Fetch real leaderboard data
        const loadData = async () => {
            setLoading(true);
            const data = await fetchLeaderboard();
            setLeaderboard(data);
            setLoading(false);
        };
        loadData();
    }, []);

    // Set initial view if prop changes
    useEffect(() => {
        if(startView) setViewMode(startView);
    }, [startView]);

    const getTierColor = (tier: string) => {
        switch(tier) {
            case 'Challenger': return 'text-cyan-300 drop-shadow-[0_0_8px_cyan]';
            case 'Master': return 'text-purple-400 drop-shadow-[0_0_8px_purple]';
            case 'Diamond': return 'text-blue-300 drop-shadow-[0_0_5px_blue]';
            case 'Platinum': return 'text-emerald-300';
            case 'Gold': return 'text-yellow-400 drop-shadow-[0_0_5px_gold]';
            case 'Silver': return 'text-slate-300';
            case 'Bronze': return 'text-orange-400';
            default: return 'text-slate-500'; // Iron
        }
    };

    const getTierIcon = (tier: string) => {
        switch(tier) {
            case 'Challenger': return 'military_tech';
            case 'Master': return 'workspace_premium';
            case 'Diamond': return 'diamond';
            case 'Platinum': return 'shield_moon';
            case 'Gold': return 'verified';
            case 'Silver': return 'shield';
            default: return 'shield_lock';
        }
    };

    const handleDirectChat = async (userId: string) => {
        const currentUser = getCurrentUser();
        if (!currentUser) return alert("Vui lòng đăng nhập để chat.");
        if (userId === currentUser.id) return alert("Bạn không thể chat với chính mình.");
        if (userId.startsWith('bot_')) return alert("Đây là Bot hệ thống, không thể chat.");

        // In real app, we might fetch user profile by ID here
        // For now, assume mock users available or handled
        const allUsers = await getAllUsers();
        const target = allUsers.find(u => u.id === userId);
        
        // If we can't find them locally (e.g. from leaderboard only), create shell
        const targetUserAccount = target || { id: userId, name: 'User', avatar: '', email: '', friendCode: '', friends: [], joinedDate: '', isAdmin: false };

        setChatTarget(targetUserAccount as any);
        setViewMode('DISCORD');
    };

    const handleAddFriend = async (userId: string) => {
        const currentUser = getCurrentUser();
        if (!currentUser) return alert("Vui lòng đăng nhập.");
        if (userId === currentUser.id) return;
        
        // Optimistic update logic if needed
        const res = await sendFriendRequestApi(userId);
        alert(res.message);
    };

    if (viewMode === 'DISCORD') {
        return <StudyDiscord onExit={() => { setViewMode('HUB'); setChatTarget(null); }} targetUser={chatTarget} />;
    }

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#091428] overflow-x-hidden font-display text-[#F0E6D2] selection:bg-[#C8AA6E] selection:text-[#091428]">
            <style>{`
                .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
                .hextech-border {
                    border: 2px solid #C8AA6E;
                    box-shadow: 0 0 15px rgba(200, 170, 110, 0.3);
                }
                .hextech-bg {
                    background: linear-gradient(180deg, #1E2328 0%, #121212 100%);
                }
                .scroll-gold::-webkit-scrollbar { width: 8px; }
                .scroll-gold::-webkit-scrollbar-thumb { background: #785A28; border-radius: 4px; }
                .scroll-gold::-webkit-scrollbar-track { background: #010A13; }
            `}</style>
            
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-5 border-b border-[#785A28] bg-[#010A13]/95 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-4xl text-[#C8AA6E] animate-pulse">diversity_3</span>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-[0.1em] text-[#F0E6D2]">Cộng Đồng LearnAI</h2>
                        <p className="text-xs text-[#A09B8C] tracking-wide">Ranked Season 1</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {onToggleTodo && (
                        <button onClick={onToggleTodo} className="flex items-center gap-2 text-[#C8AA6E] border border-[#785A28] px-4 py-2 rounded font-bold hover:bg-[#32281E] transition-colors">
                            <span className="material-symbols-outlined text-xl">checklist</span>
                        </button>
                    )}
                    
                    {/* AIR ROOM PORTAL BUTTON */}
                    <button 
                        onClick={() => setViewMode('DISCORD')} 
                        className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-5 py-2 rounded shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105 border border-cyan-400/30"
                    >
                        <span className="material-symbols-outlined text-xl">hub</span>
                        AIR Room
                    </button>

                    <button onClick={onGoToBattle} className="flex items-center gap-2 text-[#091428] bg-[#C8AA6E] hover:bg-[#E6D4A0] transition-colors font-bold px-6 py-2 rounded shadow-[0_0_15px_rgba(200,170,110,0.4)] animate-[pulse_3s_infinite]">
                        <span className="material-symbols-outlined text-xl">swords</span>
                        <span className="uppercase tracking-wider text-sm">Vào Phòng Đấu</span>
                    </button>
                    <FeatureWindowControls onClose={onBack} />
                </div>
            </header>

            <main className="flex-grow p-8 flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto w-full">
                
                {/* LEFT: User Stats Card */}
                <div className="w-full lg:w-[350px] shrink-0 flex flex-col gap-6">
                    <div className="hextech-bg hextech-border rounded-xl p-8 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://lolstatic-a.akamaihd.net/frontpage/apps/prod/harbinger-l10-website/vi-vn/production/en-us/static/magic-01-c8aa6e.png')] opacity-10 bg-center bg-no-repeat bg-contain group-hover:opacity-20 transition-opacity duration-500"></div>
                        
                        <div className="relative z-10">
                            <div className="w-32 h-32 mx-auto mb-4 relative flex items-center justify-center">
                                {/* Tier Ring Animation */}
                                <div className={`absolute inset-0 border-4 rounded-full border-t-[#C8AA6E] border-r-transparent border-b-[#C8AA6E] border-l-transparent animate-[spin_10s_linear_infinite]`}></div>
                                <span className={`material-symbols-outlined text-8xl ${getTierColor(rankProfile.tier)} drop-shadow-2xl`}>{getTierIcon(rankProfile.tier)}</span>
                            </div>
                            
                            <h2 className={`text-3xl font-black uppercase tracking-widest ${getTierColor(rankProfile.tier)}`}>{rankProfile.tier} {rankProfile.division}</h2>
                            <p className="text-[#A09B8C] text-sm mt-1 mb-6 font-bold">{rankProfile.lp} LP</p>
                            
                            <div className="grid grid-cols-2 gap-4 border-t border-[#785A28]/30 pt-4">
                                <div>
                                    <p className="text-xs text-[#A09B8C] uppercase">Thắng</p>
                                    <p className="text-green-400 font-black text-xl">{rankProfile.totalWins}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase">Thua</p>
                                    <p className="text-red-400 font-black text-xl">{rankProfile.totalLosses}</p>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-[#785A28]/30">
                                <p className="text-xs text-[#C8AA6E] mb-2 uppercase tracking-wider font-bold">Điểm Mùa Giải</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-[#F0E6D2]"><span>Ngày</span> <span className="font-mono">{rankProfile.seasonPoints.daily}</span></div>
                                    <div className="flex justify-between text-xs text-[#F0E6D2]"><span>Tuần</span> <span className="font-mono">{rankProfile.seasonPoints.weekly}</span></div>
                                    <div className="flex justify-between text-xs text-[#F0E6D2]"><span>Tháng</span> <span className="font-mono">{rankProfile.seasonPoints.monthly}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hextech-bg border border-[#3C3C41] rounded-xl p-4 flex-1">
                        <h4 className="text-[#C8AA6E] font-bold text-xs uppercase mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">history</span> Lịch sử đấu
                        </h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto scroll-gold pr-1">
                            {rankProfile.matchHistory.map((match, i) => (
                                <div key={i} className={`flex justify-between items-center p-2 rounded border-l-2 ${match.result === 'Victory' ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
                                    <div>
                                        <span className={`text-xs font-bold block ${match.result === 'Victory' ? 'text-green-400' : 'text-red-400'}`}>{match.result === 'Victory' ? 'CHIẾN THẮNG' : 'THẤT BẠI'}</span>
                                        <span className="text-[10px] text-slate-500">{new Date(match.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <span className={`font-mono font-bold ${match.lpChange > 0 ? 'text-green-300' : 'text-red-300'}`}>
                                        {match.lpChange > 0 ? '+' : ''}{match.lpChange} LP
                                    </span>
                                </div>
                            ))}
                            {rankProfile.matchHistory.length === 0 && <p className="text-center text-xs text-slate-500 italic py-4">Chưa có trận đấu nào.</p>}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Leaderboard */}
                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex justify-between items-end border-b-2 border-[#C8AA6E] pb-2">
                        <h1 className="text-3xl font-black text-[#F0E6D2] uppercase tracking-tighter">Bảng Xếp Hạng <span className="text-[#C8AA6E]">Top 100</span></h1>
                        <div className="flex gap-2">
                            <button className="px-4 py-1 bg-[#C8AA6E] text-[#091428] font-bold text-xs uppercase rounded hover:bg-[#E6D4A0]">Đơn đấu</button>
                            <button className="px-4 py-1 bg-[#1E2328] text-[#A09B8C] font-bold text-xs uppercase rounded border border-[#3C3C41] hover:text-[#F0E6D2]">Bang hội</button>
                        </div>
                    </div>

                    <div className="bg-[#010A13] border border-[#3C3C41] rounded-xl flex-1 overflow-hidden flex flex-col shadow-2xl min-h-[500px]">
                        <div className="grid grid-cols-12 bg-[#1E2328] py-3 px-6 text-xs font-bold text-[#A09B8C] uppercase tracking-wider border-b border-[#3C3C41]">
                            <div className="col-span-1 text-center">Hạng</div>
                            <div className="col-span-6 pl-4">Anh hùng</div>
                            <div className="col-span-3">Bậc</div>
                            <div className="col-span-2 text-right">LP</div>
                        </div>
                        
                        <div className="overflow-y-auto flex-1 scroll-gold">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full text-[#C8AA6E] gap-2">
                                    <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
                                    <span className="text-xs uppercase tracking-widest">Đang tải dữ liệu máy chủ...</span>
                                </div>
                            ) : (
                                leaderboard.map((entry, idx) => {
                                    const currentUser = getCurrentUser();
                                    const isMe = entry.id === currentUser?.id;
                                    const isFriend = (entry as any).friends?.includes(currentUser?.id); // Mock logic for friend check if backend sends it

                                    return (
                                        <div 
                                            key={entry.id} 
                                            className={`grid grid-cols-12 items-center px-6 py-3 border-b border-[#1E2328] hover:bg-[#1E2328] transition-colors group cursor-pointer ${isMe ? 'bg-[#C8AA6E]/10 border-[#C8AA6E]/30' : ''}`}
                                        >
                                            <div className="col-span-1 text-center font-black text-lg text-[#A09B8C]">
                                                {idx + 1}
                                            </div>
                                            <div className="col-span-6 flex items-center gap-4 pl-4">
                                                <div className="relative">
                                                    <img src={entry.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-[#785A28]" />
                                                    <div className="absolute -bottom-1 -right-1 bg-[#1E2328] rounded-full p-[2px]">
                                                        <div className={`w-2 h-2 rounded-full ${entry.id.startsWith('bot_') ? 'bg-slate-500' : 'bg-green-500'}`}></div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col">
                                                    <span className={`font-bold text-sm ${isMe ? 'text-[#C8AA6E]' : 'text-[#F0E6D2]'} group-hover:text-white transition-colors`}>{entry.name}</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                                    {!entry.id.startsWith('bot_') && !isMe && (
                                                        <>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleDirectChat(entry.id); }}
                                                                className="bg-[#137fec]/20 hover:bg-[#137fec]/40 text-[#137fec] p-1.5 rounded-full"
                                                                title="Nhắn tin"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">chat</span>
                                                            </button>
                                                            {!isFriend && (
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleAddFriend(entry.id); }}
                                                                    className="bg-green-600/20 hover:bg-green-600/40 text-green-400 p-1.5 rounded-full"
                                                                    title="Kết bạn"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">person_add</span>
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-span-3 flex items-center gap-2">
                                                <span className={`material-symbols-outlined text-lg ${getTierColor(entry.tier)}`}>{getTierIcon(entry.tier)}</span>
                                                <span className={`text-xs font-bold uppercase ${getTierColor(entry.tier)}`}>{entry.tier}</span>
                                            </div>
                                            <div className="col-span-2 text-right font-mono text-[#F0E6D2] font-bold">
                                                {entry.lp}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default React.memo(Community);
