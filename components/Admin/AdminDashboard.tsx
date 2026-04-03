import React, { useState, useEffect } from 'react';
import { getAllUsers, getRealAnalyticsDashboardData } from '../../services/mockBackend';
import { AnalyticsData } from '../../types';
import { socketService } from '../../services/socketService';

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<AnalyticsData | null>(null);
    const [totalUsers, setTotalUsers] = useState(0);
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const [apiLogs, setApiLogs] = useState<any[]>([]);

    useEffect(() => {
        let isMounted = true;
        let interval: any;

        const fetchRealData = async () => {
            const users = await getAllUsers();
            const data = await getRealAnalyticsDashboardData();
            if (isMounted) {
                setTotalUsers(users.length);
                
                if (Array.isArray(data)) {
                    const transformedStats: AnalyticsData = {
                        dailyActiveUsers: data.map((d: any) => d.dailyActiveUsers || 0).reverse().slice(-7),
                        newSignups: data.map((d: any) => d.newSignups || 0).reverse().slice(-7),
                        aiTokensConsumed: data.map((d: any) => d.aiTokensConsumed || 0).reverse().slice(-7),
                        featureUsage: data[0]?.featureUsage || [],
                        retentionRate: data[0]?.retentionRate || 0
                    };
                    
                    while (transformedStats.dailyActiveUsers.length < 7) transformedStats.dailyActiveUsers.unshift(0);
                    while (transformedStats.newSignups.length < 7) transformedStats.newSignups.unshift(0);
                    while (transformedStats.aiTokensConsumed.length < 7) transformedStats.aiTokensConsumed.unshift(0);
                    
                    setStats(transformedStats);
                } else if (data) {
                    setStats(data as AnalyticsData);
                } else {
                    setStats({
                        dailyActiveUsers: [0,0,0,0,0,0,0],
                        newSignups: [0,0,0,0,0,0,0],
                        aiTokensConsumed: [0,0,0,0,0,0,0],
                        featureUsage: [],
                        retentionRate: 0
                    });
                }
            }
        };

        fetchRealData();
        interval = setInterval(fetchRealData, 10000);

        const socket = socketService.getSocket();
        if (socket) {
            socket.on('online_users_update', (users) => {
                if (isMounted) setOnlineUsers(users);
            });

            socket.on('api_request_log', (log) => {
                if (isMounted) setApiLogs(prev => [log, ...prev].slice(0, 50));
            });
        }

        return () => {
            isMounted = false;
            if (interval) clearInterval(interval);
            if (socket) {
                socket.off('online_users_update');
                socket.off('api_request_log');
            }
        };
    }, []);

    const StatsCard = ({ icon, title, value, color, trend }: { icon: string, title: string, value: string | number, color: string, trend?: string }) => (
        <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6 flex items-start justify-between shadow-lg hover:border-white/10 transition-colors group">
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-black text-white">{value}</h3>
                {trend && <p className="text-[10px] text-green-400 mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-xs">trending_up</span> {trend} tuần này</p>}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('400', '500')}/20 text-${color.split('-')[1]}-400 group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
        </div>
    );

    const activeToday = stats?.dailyActiveUsers?.[6] || 0;
    const tokensTotal = stats?.aiTokensConsumed?.reduce((a,b) => a+b, 0) || 0;
    const signupsToday = stats?.newSignups?.[6] || 0;

    return (
        <div className="space-y-8 animate-[fadeIn_0.5s]">
            <div>
                <h2 className="text-3xl font-black text-white mb-2">Tổng Quan Hệ Thống</h2>
                <p className="text-slate-400 text-sm">Theo dõi các chỉ số quan trọng của nền tảng.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard icon="group" title="Tổng Người Dùng" value={totalUsers} color="text-blue-400" trend={`+${signupsToday}`} />
                <StatsCard icon="person_play" title="Người Dùng Online" value={onlineUsers.length} color="text-green-400" />
                <StatsCard icon="neurology" title="Token AI Đã Dùng" value={tokensTotal.toLocaleString()} color="text-purple-400" />
                <StatsCard icon="anchor" title="Tỷ Lệ Giữ Chân" value={`${stats?.retentionRate || 0}%`} color="text-amber-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#1e293b] border border-white/5 rounded-2xl p-6 h-96 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-cyan-400">monitoring</span> Lưu lượng truy cập (7 ngày)
                        </h3>
                    </div>
                    <div className="flex-1 flex items-end gap-2 px-2 pb-4">
                        {stats?.dailyActiveUsers?.map((count, i) => {
                            const max = Math.max(...(stats?.dailyActiveUsers || [1]), 1);
                            const heightPercent = (count / max) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                                    <div 
                                        className="bg-blue-500/30 hover:bg-cyan-400/50 rounded-t-sm transition-all duration-500 relative" 
                                        style={{ height: `${Math.max(5, heightPercent)}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {count}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-500 text-center mt-2">D-{6-i}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6 h-96 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400">pie_chart</span> Tính năng phổ biến
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {stats?.featureUsage?.sort((a,b) => b.count - a.count).map((feature, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs text-slate-300">
                                    <span>{feature.name}</span>
                                    <span className="font-bold">{feature.count} uses</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${i===0 ? 'bg-green-500' : i===1 ? 'bg-blue-500' : 'bg-slate-500'}`} 
                                        style={{ width: `${(feature.count / (Math.max(...(stats?.featureUsage?.map(f=>f.count) || [1])))) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {(!stats?.featureUsage || stats.featureUsage.length === 0) && (
                            <p className="text-slate-500 text-xs text-center pt-10">Chưa có dữ liệu sử dụng.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Online Users List */}
                <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 shadow-xl">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">group</span>
                        Người Dùng Đang Trực Tuyến
                    </h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {onlineUsers.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-4">Chưa có người dùng nào trực tuyến.</p>
                        ) : (
                            onlineUsers.map((user, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{user.name}</p>
                                            <p className="text-[10px] text-slate-400">{user.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-green-400">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        Online
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* API Request Logs */}
                <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 shadow-xl">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-400">api</span>
                        Hoạt Động API (Real-time)
                    </h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {apiLogs.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-4">Đang chờ dữ liệu...</p>
                        ) : (
                            apiLogs.map((log, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded w-12 text-center ${
                                            log.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                                            log.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                                            log.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                            {log.method}
                                        </span>
                                        <div>
                                            <p className="text-xs font-mono text-slate-300 truncate max-w-[150px]">{log.path}</p>
                                            <p className="text-[10px] text-slate-500">{log.userName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xs font-bold ${log.status >= 400 ? 'text-red-400' : 'text-green-400'}`}>
                                            {log.status}
                                        </p>
                                        <p className="text-[9px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
