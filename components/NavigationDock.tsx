
import React from 'react';

interface NavigationDockProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

const NavigationDock: React.FC<NavigationDockProps> = ({ activeView, onNavigate }) => {
    const navGroups = [
        {
            id: 'home',
            label: 'Home',
            items: [
                { id: 'dashboard', icon: 'dashboard', label: 'Tổng quan' },
            ]
        },
        {
            id: 'learn',
            label: 'Học tập',
            items: [
                { id: 'explore-graph', icon: 'hub', label: 'Khám phá' },
                { id: 'tutor', icon: 'school', label: 'Gia sư AI' },
                { id: 'video', icon: 'play_lesson', label: 'Khóa học' },
            ]
        },
        {
            id: 'create',
            label: 'Sáng tạo',
            items: [
                { id: 'alchemy', icon: 'science', label: 'Giả kim' },
                { id: 'media', icon: 'edit_note', label: 'Ghi chú' },
                { id: 'draw', icon: 'palette', label: 'Xưởng vẽ' },
            ]
        },
        {
            id: 'social',
            label: 'Cộng đồng',
            items: [
                { id: 'community', icon: 'forum', label: 'Thảo luận' },
                { id: 'battle', icon: 'swords', label: 'Thách đấu' },
            ]
        },
        {
            id: 'library',
            label: 'Kho lưu trữ',
            items: [
                { id: 'drive', icon: 'folder', label: 'Drive' },
                { id: 'codex', icon: 'menu_book', label: 'Codex' },
                { id: 'digest', icon: 'checklist', label: 'Nhiệm vụ' },
            ]
        }
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col w-20 lg:w-64 h-screen fixed left-0 top-0 bg-white/90 dark:bg-[#101c22]/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 z-[100] transition-all duration-300">
                <div className="p-6 flex items-center justify-center lg:justify-start gap-3 mb-6">
                    <div className="text-blue-500 text-3xl select-none">
                        <span className="material-symbols-outlined">auto_awesome</span>
                    </div>
                    <h2 className="hidden lg:block text-xl font-black text-slate-800 dark:text-white tracking-tight">LearnAI</h2>
                </div>

                <div className="flex-1 overflow-y-auto px-3 space-y-6 scrollbar-hide">
                    {navGroups.map((group) => (
                        <div key={group.id}>
                            <h3 className="hidden lg:block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                                {group.label}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => onNavigate(item.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                                            activeView === item.id
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                        title={item.label}
                                    >
                                        <span className={`material-symbols-outlined text-2xl ${activeView === item.id ? 'fill-current' : ''}`}>
                                            {item.icon}
                                        </span>
                                        <span className="hidden lg:block text-sm font-bold">{item.label}</span>
                                        
                                        {/* Tooltip for collapsed state */}
                                        <div className="lg:hidden absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                            {item.label}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <button 
                        onClick={() => onNavigate('account')}
                        className="joyride-avatar w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                         <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            ME
                         </div>
                         <div className="hidden lg:block text-left">
                             <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Tài khoản</p>
                             <p className="text-xs text-slate-400">Cài đặt</p>
                         </div>
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#101c22]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-[100] px-4 py-2 flex justify-between items-center safe-area-bottom">
                {navGroups.flatMap(g => g.items).filter(i => ['dashboard', 'explore-graph', 'alchemy', 'community', 'drive'].includes(i.id)).map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                            activeView === item.id
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-2xl ${activeView === item.id ? 'fill-current' : ''}`}>
                            {item.icon}
                        </span>
                        <span className="text-[10px] font-bold mt-0.5">{item.label}</span>
                    </button>
                ))}
            </div>
        </>
    );
};

export default React.memo(NavigationDock);

