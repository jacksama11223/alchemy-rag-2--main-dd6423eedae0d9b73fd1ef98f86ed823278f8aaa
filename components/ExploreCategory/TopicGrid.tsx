
import React from 'react';
import { GalaxyCard } from './GalaxyCard';

interface TopicGridProps {
    // items can be Node shortcuts OR Category tags
    items: { 
        id: string; 
        title: string; 
        icon: string; 
        type: string; 
        tag?: string; 
        desc?: string; 
        count?: number; 
        avgMastery?: number;
        isNode?: boolean; // Flag to distinguish node vs tag
        rawNode?: any;
    }[];
    onItemSelect?: (item: any) => void; // Generic selection handler
    totalNodes: number;
}

export const TopicGrid: React.FC<TopicGridProps> = ({ items, onItemSelect, totalNodes }) => {
    
    // Icons mapping for visual variety (fallback if no icon provided)
    const icons = ['topic', 'science', 'history_edu', 'code', 'psychology', 'public', 'biotech', 'architecture'];

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-cyan-400">view_module</span> 
                    Danh sách hiển thị
                </h3>
                <span className="text-xs text-slate-500">Đang hiển thị {items.length} mục</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-[fadeInUp_0.5s]">
                {/* Special "All" Card - Only show if showing Categories, or always keep as Graph entry? */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl opacity-30 group-hover:opacity-70 blur transition duration-500"></div>
                    <GalaxyCard 
                        title="Toàn bộ Sơ đồ" 
                        icon="hub" 
                        color="from-slate-800 to-slate-900" 
                        desc="Xem tổng quan mạng lưới tri thức (Graph View)" 
                        count={totalNodes} 
                        onClick={() => onItemSelect && onItemSelect({ isNode: false, title: '' })} 
                    />
                     <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button 
                            className="bg-cyan-500 hover:bg-cyan-400 text-white p-2 rounded-full shadow-lg"
                            onClick={(e) => { e.stopPropagation(); onItemSelect && onItemSelect({ isNode: false, title: '' }); }}
                            title="Mở Sơ đồ Tri thức"
                        >
                            <span className="material-symbols-outlined">open_in_new</span>
                        </button>
                    </div>
                </div>

                {/* Items (Nodes or Categories) */}
                {items.map((item, index) => {
                    const mastery = item.avgMastery || 0;
                    
                    // Assign colors based on Mastery/Status
                    let color = "from-amber-900/80 to-orange-900/80"; // Default/Weak
                    
                    if (mastery > 70) {
                         color = "from-emerald-900/80 to-teal-900/80";
                    } else if (mastery > 30) {
                         color = "from-blue-900/80 to-cyan-900/80";
                    }

                    const displayDesc = item.isNode 
                        ? (item.desc || `Thẻ bài: ${item.type}`) 
                        : `Khám phá ${item.count} node về ${item.title}`;

                    const displayIcon = item.icon || icons[index % icons.length];

                    return (
                        <div key={item.id} className="relative group">
                             <div className={`absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-50 blur transition duration-500 bg-gradient-to-r ${color}`}></div>
                            <GalaxyCard 
                                title={item.title} 
                                icon={displayIcon} 
                                color={color}
                                desc={displayDesc}
                                count={!item.isNode ? item.count : undefined} // Don't show count for single node
                                mastery={mastery}
                                node={item.rawNode} // PASS FULL NODE FOR ANALYTICS
                                onClick={() => onItemSelect && onItemSelect(item)} 
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
