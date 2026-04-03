
import React from 'react';

// 11. FocusModeToggle
export const FocusModeToggle: React.FC<{ active: boolean, onToggle: () => void }> = ({ active, onToggle }) => (
    <button 
        onClick={onToggle} 
        className={`p-2 rounded-full transition-all duration-300 ${active ? 'bg-cyan-600 text-white shadow-[0_0_15px_cyan]' : 'bg-black/40 text-slate-400 hover:text-white border border-white/10'}`} 
        title={active ? "Exit Focus Mode" : "Enter Focus Mode"}
    >
        <span className="material-symbols-outlined">{active ? 'filter_center_focus' : 'center_focus_strong'}</span>
    </button>
);

// 12. BreadcrumbTrail
interface BreadcrumbProps {
    path: { label: string; onClick?: () => void; active?: boolean }[];
    className?: string;
}

export const BreadcrumbTrail: React.FC<BreadcrumbProps> = ({ path, className }) => (
    <div className={`flex items-center flex-wrap gap-1 text-xs text-slate-400 ${className}`}>
        <span className="hover:text-white cursor-pointer" onClick={() => window.location.reload()}>Home</span>
        
        {path.map((item, index) => (
            <React.Fragment key={index}>
                <span className="material-symbols-outlined text-[10px] text-slate-600">chevron_right</span>
                <span 
                    onClick={item.onClick}
                    className={`transition-colors max-w-[150px] truncate ${
                        item.active 
                        ? 'text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' 
                        : 'hover:text-white cursor-pointer'
                    }`}
                >
                    {item.label}
                </span>
            </React.Fragment>
        ))}
    </div>
);

// 13. GraphBookmarkList
export const GraphBookmarkList: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute top-12 right-0 w-48 bg-[#1e1e1e] border border-white/10 rounded-lg p-2 z-40 shadow-xl">
            <h5 className="text-xs font-bold text-slate-500 uppercase px-2 mb-1">Dấu Trang</h5>
            <div className="space-y-1">
                <div className="px-2 py-1 hover:bg-white/10 rounded text-xs text-white cursor-pointer">Góc nhìn tổng quan</div>
                <div className="px-2 py-1 hover:bg-white/10 rounded text-xs text-white cursor-pointer">Nhóm ReactJS</div>
            </div>
        </div>
    );
};

// 14. ShortestPathFinder
export const ShortestPathFinder: React.FC<{ visible: boolean }> = ({ visible }) => {
    if (!visible) return null;
    return (
        <div className="absolute bottom-24 right-8 z-30 bg-[#1e1e1e] p-3 rounded-xl border border-white/10 shadow-lg flex flex-col gap-2 w-64">
            <h5 className="text-xs font-bold text-white flex items-center gap-2"><span className="material-symbols-outlined text-sm">alt_route</span> Tìm Đường Dẫn Tri Thức</h5>
            <input placeholder="Khái niệm A (Bắt đầu)" className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white" />
            <input placeholder="Khái niệm B (Kết thúc)" className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white" />
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1 rounded">Tìm mối liên hệ</button>
        </div>
    );
};

// 15. TimelineSlider (Reuse existing, just placeholder for export consistency)
// (Already implemented in ExploreGraph but putting here for grouping if needed, skipping to avoid duplicate)

// 16. SmartSearchBar
export const SmartSearchBar: React.FC<{ 
    isOpen: boolean, 
    setIsOpen: (v: boolean) => void, 
    query: string, 
    setQuery: (q: string) => void, 
    nodes: any[], 
    onSelect: (node: any) => void,
    onCreate?: () => void 
}> = ({ isOpen, setIsOpen, query, setQuery, nodes, onSelect, onCreate }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-32 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
            <div className="bg-[#1e1e1e] w-[600px] rounded-xl border border-white/20 shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center px-4 border-b border-white/10">
                    <span className="material-symbols-outlined text-slate-400">search</span>
                    <input 
                        autoFocus
                        className="w-full bg-transparent border-none py-4 px-3 text-white focus:ring-0 text-lg placeholder-slate-500 outline-none"
                        placeholder="Tìm kiếm khái niệm..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <button onClick={() => setIsOpen(false)} className="text-xs bg-white/10 px-2 py-1 rounded text-slate-400">ESC</button>
                </div>
                <div className="max-h-96 overflow-y-auto p-2">
                    {nodes.filter(n => n.title.toLowerCase().includes(query.toLowerCase())).slice(0, 10).map(n => (
                        <div key={n.id} onClick={() => { onSelect(n); setIsOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer group">
                            <span className="material-symbols-outlined text-slate-500 group-hover:text-cyan-400">article</span>
                            <div>
                                <div className="text-sm font-bold text-slate-200 group-hover:text-white">{n.title}</div>
                                <div className="text-xs text-slate-500">{n.type}</div>
                            </div>
                        </div>
                    ))}
                    {query && nodes.filter(n => n.title.toLowerCase().includes(query.toLowerCase())).length === 0 && (
                        <div className="p-4 text-center text-slate-500 text-sm">
                            Không tìm thấy kết quả
                            {onCreate && (
                                <button 
                                    onClick={() => { onCreate(); setIsOpen(false); }}
                                    className="block mx-auto mt-2 text-cyan-400 hover:text-cyan-300 underline"
                                >
                                    Tạo "{query}" bằng Alchemy
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
