import React, { useState } from 'react';
import { AdminDashboard } from './Admin/AdminDashboard';
import { AdminUsers } from './Admin/AdminUsers';
import { AdminContent } from './Admin/AdminContent';
import { AdminMarketplace } from './Admin/AdminMarketplace';
import { AdminGamification } from './Admin/AdminGamification';
import { AdminSocial } from './Admin/AdminSocial';
import { AdminAI } from './Admin/AdminAI';
import { UserAccount, AdminUserFlow } from '../types';

interface AdminBoardProps {
    onLogout: () => void;
    onImpersonate: (user: UserAccount, flow?: AdminUserFlow) => void;
    appState?: any;
    onUpdateAppState?: (updates: any) => void;
    onBroadcast?: (msg: {title: string, message: string, type: 'info' | 'warning' | 'success'}) => void;
}

type AdminView = 'dashboard' | 'users' | 'content' | 'marketplace' | 'gamification' | 'social' | 'ai';

export const AdminBoard: React.FC<AdminBoardProps> = ({ onLogout, onImpersonate, appState, onUpdateAppState, onBroadcast }) => {
    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const menuItems = [
        { id: 'dashboard', icon: 'dashboard', label: 'Tổng Quan' },
        { id: 'users', icon: 'group', label: 'Quản Lý Người Dùng' },
        { id: 'content', icon: 'inventory_2', label: 'Quản Lý Nội Dung' },
        { id: 'marketplace', icon: 'storefront', label: 'Chợ Tri Thức' },
        { id: 'gamification', icon: 'sports_esports', label: 'Gamification' },
        { id: 'social', icon: 'forum', label: 'Cộng Đồng & Hỗ Trợ' },
        { id: 'ai', icon: 'neurology', label: 'Cấu Hình AI' },
    ];

    const getViewTitle = (id: string) => menuItems.find(i => i.id === id)?.label || 'Admin';

    return (
        <div className="relative flex h-screen w-screen bg-[#020617] text-slate-200 font-display overflow-hidden selection:bg-cyan-500/30">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] z-0"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay z-0"></div>

            {/* Sidebar */}
            <aside 
                className={`relative z-20 flex flex-col border-r border-white/10 bg-[#0b1120]/60 backdrop-blur-xl shadow-[5px_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 ${
                    isSidebarCollapsed ? 'w-20' : 'w-72'
                }`}
            >
                <div className="h-20 flex items-center px-6 border-b border-white/10 relative overflow-hidden group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0 z-10">
                        <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
                    </div>
                    {!isSidebarCollapsed && (
                        <div className="ml-4 animate-[fadeIn_0.3s] z-10">
                            <h1 className="font-black text-white text-lg leading-none tracking-wide">
                                LEARN<span className="text-cyan-400">AI</span>
                            </h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Admin Portal</p>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = activeView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id as AdminView)}
                                title={isSidebarCollapsed ? item.label : ''}
                                className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all group relative overflow-hidden ${
                                    isActive 
                                    ? 'bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_10px_cyan]"></div>}
                                <span className={`material-symbols-outlined text-2xl shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400 animate-pulse' : ''}`}>
                                    {item.icon}
                                </span>
                                {!isSidebarCollapsed && (
                                    <span className="font-bold text-sm whitespace-nowrap animate-[fadeIn_0.2s] flex-1 text-left">
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-white/10 bg-[#050b14]/50">
                    <button 
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors mb-2"
                    >
                        <span className="material-symbols-outlined">{isSidebarCollapsed ? 'last_page' : 'first_page'}</span>
                    </button>
                    <button 
                        onClick={onLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/20 ${isSidebarCollapsed ? 'justify-center' : ''}`}
                    >
                        <span className="material-symbols-outlined text-xl">logout</span>
                        {!isSidebarCollapsed && <span className="font-bold text-sm">Đăng Xuất</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 relative z-10">
                <header className="h-20 px-8 flex items-center justify-between border-b border-white/10 bg-[#020617]/40 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white tracking-wide">{getViewTitle(activeView)}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-bold text-white">Administrator</div>
                                <div className="text-[10px] text-cyan-400 font-bold uppercase">System Access</div>
                            </div>
                            <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 to-purple-500">
                                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=AdminMaster" alt="Admin" className="w-full h-full rounded-full bg-[#020617]" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="animate-[fadeInUp_0.5s] relative">
                             {activeView === 'dashboard' && <AdminDashboard />}
                             {activeView === 'users' && <AdminUsers onImpersonate={onImpersonate} />}
                             {activeView === 'content' && <AdminContent />}
                             {activeView === 'marketplace' && <AdminMarketplace />}
                             {activeView === 'gamification' && <AdminGamification />}
                             {activeView === 'social' && <AdminSocial onBroadcast={onBroadcast} />}
                             {activeView === 'ai' && <AdminAI />}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
