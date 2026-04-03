
import React from 'react';

// 1. UniversalSearchBar
interface SearchBarProps {
    value: string;
    onChange: (val: string) => void;
}

export const UniversalSearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
    <div className="relative w-full max-w-2xl mx-auto group">
        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative flex items-center bg-[#0f172a]/90 border border-cyan-500/30 rounded-full px-6 py-3 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className="material-symbols-outlined text-cyan-400 text-2xl mr-4 animate-pulse">search</span>
            <input 
                type="text" 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Tìm kiếm Topic, Tag, hoặc Dữ liệu..." 
                className="bg-transparent border-none outline-none text-white w-full placeholder-slate-500 text-lg focus:ring-0"
            />
            <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/10 hidden sm:block">CTRL+K</span>
        </div>
    </div>
);

// 2. FilterAsteroidBelt
interface FilterProps {
    activeFilter: string;
    onSelectFilter: (filter: string) => void;
}

export const FilterAsteroidBelt: React.FC<FilterProps> = ({ activeFilter, onSelectFilter }) => (
    <div className="flex gap-3 overflow-x-auto py-4 px-2 scrollbar-hide mask-gradient-x">
        {['Tất cả', 'Mới nhất', 'Sắp hết hạn', 'Độ khó cao', 'Đang học', 'Yêu thích'].map((label, i) => (
            <button 
                key={i} 
                onClick={() => onSelectFilter(label)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-sm transition-all hover:scale-105 ${
                    activeFilter === label 
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_10px_cyan]' 
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-cyan-600/20 hover:border-cyan-500/50 hover:text-cyan-300'
                }`}
            >
                {label}
            </button>
        ))}
    </div>
);

// 3. OrbitalSidebar
export const OrbitalSidebar: React.FC<{ isOpen: boolean, onToggle: () => void }> = ({ isOpen, onToggle }) => (
    <div className={`fixed left-0 top-20 bottom-0 bg-[#020617]/95 border-r border-white/10 transition-all duration-300 z-40 flex flex-col items-center py-6 gap-6 ${isOpen ? 'w-20' : 'w-0 overflow-hidden opacity-0'}`}>
        {['dashboard', 'local_library', 'settings', 'group', 'analytics'].map(icon => (
            <button key={icon} className="p-3 rounded-xl bg-white/5 text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors shadow-lg">
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </button>
        ))}
    </div>
);

// 4. StarTrailBreadcrumbs
export const StarTrailBreadcrumbs: React.FC = () => (
    <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
        <span className="hover:text-cyan-400 cursor-pointer transition-colors">Home</span>
        <span className="material-symbols-outlined text-[10px] text-cyan-500/50">double_arrow</span>
        <span className="hover:text-cyan-400 cursor-pointer transition-colors">Explore</span>
        <span className="material-symbols-outlined text-[10px] text-cyan-500/50">double_arrow</span>
        <span className="text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">Category</span>
    </div>
);

// 5. WarpSpeedLoader
export const WarpSpeedLoader: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
        <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-purple-500 border-l-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-cyan-400 border-b-transparent border-l-purple-500 animate-spin-slow opacity-70"></div>
        </div>
        <p className="text-cyan-400 text-xs font-bold animate-pulse tracking-widest">ENTERING HYPERSPACE...</p>
    </div>
);

// 6. ConstellationTabs
interface TabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const ConstellationTabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => (
    <div className="flex items-center gap-0 relative my-6 border-b border-white/10 overflow-x-auto">
        {['Overview', 'Learning', 'Discussion', 'Resources'].map((tab, i) => (
            <div key={i} className="relative group cursor-pointer" onClick={() => onTabChange(tab)}>
                <div className={`px-6 py-3 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === tab ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                    {tab}
                </div>
                {/* Connector Line */}
                {i < 3 && <div className="absolute top-1/2 right-0 w-8 h-[1px] bg-white/10 translate-x-4 pointer-events-none group-hover:bg-cyan-500/50 transition-colors hidden sm:block"></div>}
                {/* Active Indicator */}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_cyan]"></div>}
            </div>
        ))}
    </div>
);

// 7. RecentVoyagesList
export const RecentVoyagesList: React.FC = () => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Recent Voyages</h4>
        <div className="space-y-2">
            {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer group transition-colors">
                    <div className="w-8 h-8 rounded bg-cyan-900/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 truncate group-hover:text-cyan-300">Advanced Astrophysics {i}</p>
                        <p className="text-[10px] text-slate-500">Last visited 2h ago</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// 8. CompassPagination
export const CompassPagination: React.FC = () => (
    <div className="flex justify-center items-center gap-4 mt-8">
        <button className="p-2 rounded-full border border-white/10 text-slate-400 hover:text-white hover:border-cyan-500 hover:bg-cyan-500/10 transition-all"><span className="material-symbols-outlined">west</span></button>
        <div className="flex gap-2">
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-600 text-white font-bold text-sm shadow-[0_0_10px_cyan]">1</span>
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-white/10 cursor-pointer text-sm">2</span>
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-white/10 cursor-pointer text-sm">3</span>
        </div>
        <button className="p-2 rounded-full border border-white/10 text-slate-400 hover:text-white hover:border-cyan-500 hover:bg-cyan-500/10 transition-all"><span className="material-symbols-outlined">east</span></button>
    </div>
);

// 9. NotificationsSignal
export const NotificationsSignal: React.FC = () => (
    <button className="relative p-2 text-slate-300 hover:text-white transition-colors">
        <span className="material-symbols-outlined">notifications</span>
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#020617] animate-pulse"></span>
    </button>
);

// 10. GroundControlFooter
export const GroundControlFooter: React.FC = () => (
    <footer className="border-t border-white/10 bg-[#020410] py-6 px-8 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-600">satellite_alt</span>
                <span>Ground Control (v2.4.0)</span>
            </div>
            <div className="flex gap-6">
                <a href="#" className="hover:text-cyan-400 transition-colors">System Status</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">Star Maps</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Protocol</a>
            </div>
            <p>© 2024 LearnAI. All systems nominal.</p>
        </div>
    </footer>
);
