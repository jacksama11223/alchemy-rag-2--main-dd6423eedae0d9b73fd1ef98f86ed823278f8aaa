import React, { useState, useEffect } from 'react';
import { getAchievements, getQuests } from '../../services/mockBackend';
import { Achievement, Quest } from '../../types';

export const AdminGamification: React.FC = () => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [quests, setQuests] = useState<Quest[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const ach = await getAchievements();
            const q = await getQuests();
            setAchievements(ach);
            setQuests(q);
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s]">
            <div>
                <h2 className="text-2xl font-bold text-white">Quản Lý Gamification</h2>
                <p className="text-slate-400 text-xs">Quản lý hệ thống nhiệm vụ, thành tựu và phần thưởng.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-white/10 bg-[#162032] flex justify-between items-center">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-yellow-400">emoji_events</span>
                            Thành Tựu ({achievements.length})
                        </h3>
                        <button className="text-xs font-bold px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition-all">+ Thêm Mới</button>
                    </div>
                    <div className="p-4 space-y-3">
                        {achievements.map(ach => (
                            <div key={ach.id} className="bg-black/20 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                                <span className="material-symbols-outlined text-2xl text-yellow-500">{ach.icon}</span>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white">{ach.title}</h4>
                                    <p className="text-xs text-slate-400">{ach.description}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-mono text-green-400">+{ach.rewardXP} XP</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-white/10 bg-[#162032] flex justify-between items-center">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-400">task_alt</span>
                            Nhiệm Vụ ({quests.length})
                        </h3>
                        <button className="text-xs font-bold px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition-all">+ Thêm Mới</button>
                    </div>
                    <div className="p-4 space-y-3">
                        {quests.map(quest => (
                            <div key={quest.id} className="bg-black/20 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        {quest.title}
                                        <span className="bg-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold border border-purple-500/30">{quest.type}</span>
                                    </h4>
                                    <p className="text-xs text-slate-400">{quest.description}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-mono text-green-400">{quest.reward}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
