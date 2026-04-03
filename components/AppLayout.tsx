import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type MainTab = 'home' | 'learn' | 'create' | 'social';

interface NavItem {
    id: string;
    label: string;
    icon: string;
    view: string;
}

interface AppLayoutProps {
    currentView: string;
    onNavigate: (view: string) => void;
    children: React.ReactNode;
    userXP?: number;
    userLevel?: number;
}

const NAV_CONFIG: Record<MainTab, NavItem[]> = {
    home: [
        { id: 'dashboard', label: 'Tổng quan', icon: 'dashboard', view: 'dashboard' },
        { id: 'digest', label: 'Nhiệm vụ', icon: 'checklist', view: 'digest' },
        { id: 'achievements', label: 'Thành tựu', icon: 'military_tech', view: 'achievements' },
        { id: 'account', label: 'Hồ sơ', icon: 'person', view: 'account' },
    ],
    learn: [
        { id: 'explore-graph', label: 'Sơ đồ tri thức', icon: 'hub', view: 'explore-graph' },
        { id: 'tutor', label: 'Gia sư AI', icon: 'school', view: 'tutor' },
        { id: 'video', label: 'Video Course', icon: 'play_lesson', view: 'video' },
        { id: 'explore-category', label: 'Thư viện', icon: 'local_library', view: 'explore-category' },
    ],
    create: [
        { id: 'alchemy', label: 'Giả kim thuật', icon: 'science', view: 'alchemy' },
        { id: 'media', label: 'NoteLab', icon: 'edit_note', view: 'media' },
        { id: 'draw', label: 'Xưởng vẽ', icon: 'draw', view: 'drawing-manager' },
        { id: 'drive', label: 'Kho lưu trữ', icon: 'folder', view: 'drive' },
    ],
    social: [
        { id: 'community', label: 'Cộng đồng', icon: 'forum', view: 'community' },
        { id: 'battle', label: 'Đấu trường', icon: 'swords', view: 'battle' },
    ]
};

export const AppLayout: React.FC<AppLayoutProps> = ({ currentView, onNavigate, children, userXP, userLevel }) => {
    const [activeTab, setActiveTab] = useState<MainTab>('home');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Sync active tab with current view
    useEffect(() => {
        // Find which tab contains the current view
        for (const [tab, items] of Object.entries(NAV_CONFIG)) {
            if (items.some(item => item.view === currentView)) {
                setActiveTab(tab as MainTab);
                return;
            }
        }
        // Special cases or defaults
        if (['landing', 'about', 'vision', 'mission', 'story', 'team', 'contact', 'faq'].includes(currentView)) {
            setActiveTab('home');
        }
    }, [currentView]);

    const handleTabChange = (tab: MainTab) => {
        setActiveTab(tab);
        // Navigate to the first item of the tab automatically
        onNavigate(NAV_CONFIG[tab][0].view);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#F8F9FA] dark:bg-[#101c22]">
            {/* Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ width: isSidebarCollapsed ? 80 : 260 }}
                className="flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-[#15202b] shadow-sm z-20 relative"
            >
                {/* Collapse Toggle */}
                <button 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute -right-3 top-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full p-1 shadow-md z-30 hover:bg-slate-50 text-slate-500"
                >
                    <span className="material-symbols-outlined text-sm">
                        {isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}
                    </span>
                </button>

                {/* Primary Tabs (Pillars) */}
                <div className="flex flex-col gap-2 p-3 border-b border-slate-100 dark:border-slate-700/50">
                    {(Object.keys(NAV_CONFIG) as MainTab[]).map((tab) => {
                        const isActive = activeTab === tab;
                        const config = {
                            home: { label: 'Home', icon: 'home' },
                            learn: { label: 'Học tập', icon: 'school' },
                            create: { label: 'Sáng tạo', icon: 'palette' },
                            social: { label: 'Xã hội', icon: 'groups' },
                        }[tab];

                        return (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                                    isActive 
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold shadow-sm' 
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                                title={config.label}
                            >
                                <span className={`material-symbols-outlined ${isActive ? 'filled' : ''} text-2xl`}>
                                    {config.icon}
                                </span>
                                {!isSidebarCollapsed && (
                                    <span className="text-sm font-medium whitespace-nowrap">
                                        {config.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Secondary Navigation (Contextual) */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {!isSidebarCollapsed && (
                        <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Menu
                        </h3>
                    )}
                    
                    {NAV_CONFIG[activeTab].map((item) => {
                        const isActive = currentView === item.view;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.view)}
                                className={`flex items-center gap-3 w-full p-2.5 rounded-lg transition-colors ${
                                    isActive
                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                                title={item.label}
                            >
                                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-blue-500' : 'text-slate-400'}`}>
                                    {item.icon}
                                </span>
                                {!isSidebarCollapsed && (
                                    <span className="text-sm truncate">{item.label}</span>
                                )}
                                {isActive && !isSidebarCollapsed && (
                                    <motion.div 
                                        layoutId="activeIndicator"
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* User Stats / Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className={`flex ${isSidebarCollapsed ? 'flex-col' : 'flex-row'} gap-2 mb-4 justify-center`}>
                        <button 
                            onClick={() => onNavigate('account')} 
                            className="p-2 rounded-lg text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-500 transition-colors shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600" 
                            title="Cài đặt tài khoản"
                        >
                            <span className="material-symbols-outlined text-[20px]">settings</span>
                        </button>
                        <button 
                            onClick={() => onNavigate('user-guide')} 
                            className="p-2 rounded-lg text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-500 transition-colors shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600" 
                            title="Hướng dẫn sử dụng"
                        >
                            <span className="material-symbols-outlined text-[20px]">help</span>
                        </button>
                    </div>

                    {!isSidebarCollapsed ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                                {userLevel || 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-500 uppercase">Cấp độ {userLevel || 1}</p>
                                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500 rounded-full" 
                                        style={{ width: `${Math.min(((userXP || 0) % 1000) / 10, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5 text-right">{userXP || 0} XP</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                {userLevel || 1}
                            </div>
                        </div>
                    )}
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative scroll-smooth" id="main-scroll-container">
                <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
};
