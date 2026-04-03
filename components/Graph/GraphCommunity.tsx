
import React, { useState } from 'react';

// ----------------------------------------------------------------------
// 1. TEMPLATE GALLERY MODAL: Searchable & Filterable
// ----------------------------------------------------------------------

export const TemplateGalleryModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    const templates = [
        { id: 1, name: 'SWOT Analysis', icon: 'grid_view', author: 'StrategyPro', downloads: 1200, tags: ['Business'] },
        { id: 2, name: 'Family Tree', icon: 'account_tree', author: 'GenealogyGuy', downloads: 850, tags: ['Personal'] },
        { id: 3, name: 'React Roadmap', icon: 'route', author: 'DanAbramovFan', downloads: 5000, tags: ['Tech', 'Coding'] },
        { id: 4, name: 'Essay Structure', icon: 'article', author: 'WriteWell', downloads: 300, tags: ['Writing'] },
        { id: 5, name: 'Startup Pitch Deck', icon: 'present_to_all', author: 'FounderX', downloads: 2000, tags: ['Business'] },
        { id: 6, name: 'Fitness Plan', icon: 'fitness_center', author: 'GymRat', downloads: 600, tags: ['Health'] },
    ];

    const filteredTemplates = templates.filter(t => 
        t.name.toLowerCase().includes(search.toLowerCase()) && 
        (filter === 'All' || t.tags.includes(filter))
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-md p-6" onClick={onClose}>
            <div className="bg-[#1e1e1e] w-full max-w-4xl h-[80vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-[#0f172a] flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-400">dataset</span> Kho Tàng Cấu Trúc Tri Thức
                        </h3>
                        <p className="text-sm text-slate-400">Tham khảo và ứng dụng các mô hình tri thức từ cộng đồng nghiên cứu.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"><span className="material-symbols-outlined text-2xl">close</span></button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-white/10 flex gap-4 bg-[#162032]">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-slate-500 material-symbols-outlined text-lg">search</span>
                        <input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tra cứu mô hình..." 
                            className="w-full bg-black/30 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-amber-500 outline-none" 
                        />
                    </div>
                    <select 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none cursor-pointer"
                    >
                        <option value="All">Toàn bộ lĩnh vực</option>
                        <option value="Business">Kinh Tế & Quản Trị</option>
                        <option value="Tech">Khoa Học Máy Tính</option>
                        <option value="Personal">Phát Triển Cá Nhân</option>
                        <option value="Health">Y Học & Sức Khỏe</option>
                    </select>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-[#121212]">
                    {filteredTemplates.map(t => (
                        <div key={t.id} className="bg-[#1e293b] border border-white/5 hover:border-amber-500/50 rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg group flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">{t.icon}</span>
                                </div>
                                <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400">{t.downloads} downloads</span>
                            </div>
                            <h4 className="font-bold text-white text-lg mb-1 group-hover:text-amber-400 transition-colors">{t.name}</h4>
                            <p className="text-xs text-slate-500 mb-4">by {t.author}</p>
                            <div className="mt-auto flex justify-between items-center pt-3 border-t border-white/5">
                                <div className="flex gap-1">
                                    {t.tags.map(tag => (
                                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-black/30 rounded text-slate-400">{tag}</span>
                                    ))}
                                </div>
                                <button className="text-amber-400 hover:text-white"><span className="material-symbols-outlined">download</span></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 2. COMMUNITY CHALLENGES: Gamified Engagement
// ----------------------------------------------------------------------

export const CommunityChallenges: React.FC = () => {
    return (
        <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-4 mt-6">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">local_fire_department</span> Nhiệm vụ Nghiên Cứu Tuần
            </h4>
            
            <div className="space-y-4">
                <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-xl p-4 relative overflow-hidden group hover:border-red-500/50 transition-colors cursor-pointer">
                    <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-4xl text-red-500/20">trophy</span>
                    </div>
                    <div className="relative z-10">
                        <h5 className="font-bold text-red-200 text-sm mb-1">Chuyên Gia Lịch Sử</h5>
                        <p className="text-xs text-slate-400 mb-3">Xây dựng mạng lưới khái niệm chi tiết về "Thế chiến thứ 2" với tối thiểu 50 nút dữ liệu.</p>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border border-[#1e1e1e]"></div>)}
                                <div className="w-6 h-6 rounded-full bg-slate-800 border border-[#1e1e1e] flex items-center justify-center text-[8px] text-white">+42</div>
                            </div>
                            <span className="text-[10px] font-bold text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded">Điểm thưởng: 500 XP</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 3. EXPERT HELP BOARD: Q&A
// ----------------------------------------------------------------------

export const ExpertHelpBoard: React.FC = () => {
    return (
        <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-4 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400">help_center</span> Tham Vấn Chuyên Gia
                </h4>
                <button className="text-xs text-blue-400 hover:text-white">Xem toàn bộ</button>
            </div>
            
            <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                    <div className="flex justify-between mb-1">
                        <span className="text-[10px] bg-blue-900/30 text-blue-300 px-1.5 rounded">React</span>
                        <span className="text-[10px] text-slate-500">10m ago</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium line-clamp-2">Làm sao để tối ưu hóa render trong Graph lớn với Canvas?</p>
                    <div className="mt-2 flex gap-3 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">chat_bubble</span> 3 trả lời</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">visibility</span> 12 xem</span>
                    </div>
                </div>
                
                <div className="p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                    <div className="flex justify-between mb-1">
                        <span className="text-[10px] bg-purple-900/30 text-purple-300 px-1.5 rounded">Design</span>
                        <span className="text-[10px] text-slate-500">2h ago</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium line-clamp-2">Cần góp ý về bảng màu cho Mindmap chủ đề Y học.</p>
                    <div className="mt-2 flex gap-3 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">chat_bubble</span> 8 trả lời</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">visibility</span> 45 xem</span>
                    </div>
                </div>
            </div>
            
            <button className="w-full mt-3 py-2 bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-colors">
                Gửi câu hỏi tham vấn
            </button>
        </div>
    );
};

// ----------------------------------------------------------------------
// 4. GRAPH MERGER TOOL (Logic Placeholder)
// ----------------------------------------------------------------------
export const GraphMergerTool: React.FC = () => (
    <button className="w-full text-left px-3 py-2 text-slate-300 hover:bg-white/10 rounded flex items-center gap-2 text-xs transition-colors">
        <span className="material-symbols-outlined text-sm text-purple-400">merge_type</span> 
        <span>Hợp Nhất Mạng Lưới (Merge)</span>
    </button>
);

// 5. PublicLinkGenerator
export const PublicLinkGenerator: React.FC = () => (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded border border-white/5 mt-2 hover:border-white/20 transition-colors group">
        <span className="material-symbols-outlined text-slate-400 text-sm group-hover:text-green-400">public</span>
        <input className="bg-transparent border-none text-xs text-slate-300 w-full focus:ring-0 p-0" readOnly value="learnai.app/g/xyz123" />
        <button className="text-blue-400 hover:text-white text-xs font-bold px-2 py-0.5 rounded hover:bg-blue-600 transition-colors">COPY</button>
    </div>
);

// 6. AuthorWatermark
export const AuthorWatermark: React.FC = () => (
    <div className="absolute bottom-4 right-4 z-0 pointer-events-none opacity-10 text-right select-none">
        <h1 className="text-4xl font-black text-white">LearnAI</h1>
        <p className="text-sm text-white">Tác giả: Bạn</p>
    </div>
);

// 7. FeedbackReporter
export const FeedbackReporter: React.FC = () => (
    <button className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded text-xs w-full transition-colors group">
        <span className="material-symbols-outlined text-sm text-red-400 group-hover:animate-swing">bug_report</span> 
        Báo cáo sự cố / Đóng góp ý kiến
    </button>
);
