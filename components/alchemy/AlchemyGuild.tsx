
import React, { useState, useEffect } from 'react';
import { MarketplaceItem, MarketplaceItemType } from '../../types';
import { getMarketplaceFeed, importItem, publishItem, getCurrentUser } from '../../services/mockBackend';
import { useGamification } from '../../contexts/GamificationContext';

// 1. Marketplace Grid
export const MarketplaceGrid: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [filterType, setFilterType] = useState<'All' | 'Deck' | 'Link' | 'Video'>('All');
    const [showShareModal, setShowShareModal] = useState(false);
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    
    // Auth State
    const currentUser = getCurrentUser();
    const { addXP } = useGamification();

    // Load Data on Mount and when posting
    useEffect(() => {
        const loadFeed = async () => {
            const data = await getMarketplaceFeed();
            setItems(data);
        };
        loadFeed();
    }, [showShareModal]); // Reload when modal closes (potentially after post)

    // Share Modal State
    const [newResourceTitle, setNewResourceTitle] = useState('');
    const [newResourceUrl, setNewResourceUrl] = useState('');
    const [newResourceType, setNewResourceType] = useState<MarketplaceItemType>('Link');
    const [newResourceCategory, setNewResourceCategory] = useState('Tech');
    const [newResourceDescription, setNewResourceDescription] = useState('');

    const categories = ['All', 'Language', 'Tech', 'Science', 'History', 'Art'];
    
    const filteredItems = items.filter(p => {
        const catMatch = activeCategory === 'All' || p.category === activeCategory;
        const typeMatch = filterType === 'All' || p.type === filterType;
        return catMatch && typeMatch;
    });

    const handleShareResource = () => {
        if (!currentUser) {
            alert("Vui lòng đăng nhập để chia sẻ.");
            return;
        }
        if (!newResourceTitle) {
            alert("Vui lòng nhập tiêu đề.");
            return;
        }
        if ((newResourceType === 'Link' || newResourceType === 'Video') && !newResourceUrl) {
            alert("Vui lòng nhập đường dẫn.");
            return;
        }
        
        const newItem = {
            title: newResourceTitle,
            price: 'Free',
            category: newResourceCategory,
            type: newResourceType,
            url: newResourceUrl,
            description: newResourceDescription
        };
        
        publishItem(newItem);
        
        addXP(100, "Chia sẻ tài nguyên cộng đồng");
        setShowShareModal(false);
        setNewResourceTitle('');
        setNewResourceUrl('');
        setNewResourceDescription('');
        alert("Đã chia sẻ tài nguyên thành công!");
    };

    const handleImportDeck = async (item: MarketplaceItem) => {
        if (!currentUser) {
            alert("Vui lòng đăng nhập để tải về.");
            return;
        }
        if (item.type !== 'Deck') {
            if (item.url) window.open(item.url, '_blank');
            return;
        }

        const success = await importItem(item.id);
        if (success) {
            alert(`Đã nhập "${item.title}" vào thư viện của bạn thành công!`);
            // Trigger refresh to update 'students' count visually
            const data = await getMarketplaceFeed();
            setItems(data);
        } else {
            alert("Lỗi khi nhập liệu hoặc bài này không có nội dung.");
        }
    };

    const getIconForType = (type: MarketplaceItemType) => {
        switch(type) {
            case 'Deck': return 'style'; // Flashcard style
            case 'Link': return 'link';
            case 'Video': return 'smart_display';
            default: return 'inventory_2';
        }
    };

    const getActionLabel = (type: MarketplaceItemType) => {
        switch(type) {
            case 'Deck': return 'Tải về';
            case 'Link': return 'Truy cập';
            case 'Video': return 'Xem ngay';
            default: return 'Xem';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 max-w-full md:max-w-2xl">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                                activeCategory === cat 
                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Share Button */}
                <button 
                    onClick={() => currentUser ? setShowShareModal(true) : alert("Vui lòng đăng nhập để chia sẻ!")}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition-transform hover:scale-105"
                >
                    <span className="material-symbols-outlined text-sm">add_link</span>
                    Chia sẻ Tài nguyên
                </button>
            </div>

            {/* Type Filter Tabs */}
            <div className="flex border-b border-white/10">
                {['All', 'Deck', 'Link', 'Video'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type as any)}
                        className={`px-6 py-2 text-xs font-bold border-b-2 transition-colors ${
                            filterType === type 
                            ? 'border-blue-500 text-blue-400' 
                            : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {type === 'All' ? 'Tất cả' : type === 'Deck' ? 'Bài học' : type}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {filteredItems.length === 0 ? (
                <div className="text-center py-10 text-slate-500">Chưa có bài đăng nào trong mục này.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item, i) => (
                        <div key={item.id} className="bg-[#1e293b] border border-white/5 rounded-2xl p-4 hover:border-amber-500/30 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl relative overflow-hidden">
                            {/* Type Badge */}
                            <div className={`absolute top-4 left-4 z-20 px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                item.type === 'Video' ? 'bg-red-500/20 text-red-300' :
                                item.type === 'Link' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-purple-500/20 text-purple-300'
                            }`}>
                                {item.type}
                            </div>

                            {/* Image Placeholder */}
                            <div className={`h-32 bg-gradient-to-br ${
                                item.type === 'Video' ? 'from-red-900/40 to-slate-800' : 
                                item.type === 'Link' ? 'from-blue-900/40 to-slate-800' : 
                                'from-slate-700 to-slate-800'
                            } rounded-xl mb-4 relative overflow-hidden group-hover:brightness-110 transition-all`}>
                                <div className="absolute inset-0 flex items-center justify-center text-slate-500/50">
                                    <span className="material-symbols-outlined text-5xl">{getIconForType(item.type)}</span>
                                </div>
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded-full font-bold">
                                    {item.category}
                                </div>
                            </div>

                            <h4 className="text-white font-bold text-lg truncate mb-1 group-hover:text-amber-400 transition-colors cursor-pointer" onClick={() => handleImportDeck(item)}>
                                {item.title}
                            </h4>
                            
                            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">person</span> {item.author}
                                </span>
                                <span className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                                    <span className="material-symbols-outlined text-[12px] filled">star</span> {item.rating || 5}
                                </span>
                            </div>
                            
                            {item.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.description}</p>}

                            <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                    <span className="material-symbols-outlined text-[12px]">{item.type === 'Deck' ? 'group' : 'visibility'}</span> 
                                    {item.students}
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span className={`text-sm font-bold ${item.price === 'Free' ? 'text-green-400' : 'text-amber-400'}`}>{item.price}</span>
                                    <button 
                                        onClick={() => handleImportDeck(item)}
                                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors text-xs font-bold"
                                    >
                                        {getActionLabel(item.type)}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* SHARE MODAL */}
            {showShareModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[fadeIn_0.2s]">
                    <div className="bg-[#1e293b] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 relative">
                        <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-400">share</span> Chia sẻ Tài nguyên
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Loại tài nguyên</label>
                                <div className="flex bg-black/30 p-1 rounded-lg">
                                    <button 
                                        onClick={() => setNewResourceType('Link')}
                                        className={`flex-1 py-2 rounded text-xs font-bold transition-all ${newResourceType === 'Link' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Link Web
                                    </button>
                                    <button 
                                        onClick={() => setNewResourceType('Video')}
                                        className={`flex-1 py-2 rounded text-xs font-bold transition-all ${newResourceType === 'Video' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Video
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1 italic">*Để chia sẻ bộ thẻ (Deck), vui lòng sử dụng nút "Xuất bản" trong Alchemy sau khi tạo bài.</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Tiêu đề</label>
                                <input 
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                    placeholder="VD: Tài liệu React nâng cao..."
                                    value={newResourceTitle}
                                    onChange={(e) => setNewResourceTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Mô tả ngắn</label>
                                <textarea 
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none resize-none h-16"
                                    placeholder="Mô tả nội dung..."
                                    value={newResourceDescription}
                                    onChange={(e) => setNewResourceDescription(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Đường dẫn (URL)</label>
                                <input 
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                    placeholder="https://..."
                                    value={newResourceUrl}
                                    onChange={(e) => setNewResourceUrl(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Danh mục</label>
                                <select 
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none cursor-pointer"
                                    value={newResourceCategory}
                                    onChange={(e) => setNewResourceCategory(e.target.value)}
                                >
                                    {categories.filter(c => c !== 'All').map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                onClick={handleShareResource}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold mt-2 shadow-lg transition-transform active:scale-95"
                            >
                                Đăng lên Cộng đồng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ... (Rest of components like CreatorProfile, etc. remain unchanged) ...
// 2. Creator Profile
export const CreatorProfile: React.FC = () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        return (
            <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/10 shadow-lg text-center">
                <p className="text-slate-400 mb-4">Đăng nhập để xem hồ sơ của bạn</p>
                <div className="w-20 h-20 rounded-full bg-slate-800 mx-auto mb-2 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-slate-600">person_off</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-80"></div>
            
            <div className="relative z-10 flex flex-col items-center -mt-4">
                <div className="w-20 h-20 rounded-full border-4 border-[#1e293b] bg-slate-800 p-1 mb-3">
                    <img src={currentUser.avatar} alt="Avatar" className="w-full h-full rounded-full" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1">{currentUser.name} <span className="material-symbols-outlined text-blue-400 text-sm align-middle" title="Verified Creator">verified</span></h3>
                <p className="text-xs text-slate-400 mb-4">Thành viên từ {new Date(currentUser.joinedDate).toLocaleDateString()}</p>
                
                <div className="flex gap-6 w-full justify-center border-b border-white/10 pb-4 mb-4">
                    <div className="text-center">
                        <div className="text-lg font-bold text-white">1</div>
                        <div className="text-[10px] text-slate-500 uppercase">Rank</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-white">0</div>
                        <div className="text-[10px] text-slate-500 uppercase">Followers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-white">5.0</div>
                        <div className="text-[10px] text-slate-500 uppercase">Rating</div>
                    </div>
                </div>

                <div className="w-full flex gap-2">
                    <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg">
                        Edit Profile
                    </button>
                    <button className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10">
                        <span className="material-symbols-outlined text-lg">settings</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// ... (Keep other components: RequestBoard, ReportContentButton, etc.) ...
export const RequestBoard: React.FC = () => {
    return (
        <div className="bg-[#1e293b] p-4 rounded-xl border border-white/10 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-white">Yêu cầu từ cộng đồng</h4>
                <button className="text-xs text-blue-400 hover:text-blue-300">Xem tất cả</button>
            </div>
            
            <div className="space-y-3">
                {[
                    { title: "Deck ôn thi JLPT N2", votes: 45, author: "user123" },
                    { title: "Lộ trình học React 2024", votes: 32, author: "dev_pro" },
                    { title: "Tổng hợp công thức Lý 12", votes: 18, author: "student_hn" }
                ].map((req, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <div>
                            <p className="text-xs font-bold text-slate-200">{req.title}</p>
                            <p className="text-[10px] text-slate-500">Requested by {req.author}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="material-symbols-outlined text-slate-400 hover:text-green-400 cursor-pointer text-sm">keyboard_arrow_up</span>
                            <span className="text-xs font-bold text-slate-300">{req.votes}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <button className="w-full mt-4 py-2 border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 rounded-lg text-xs font-bold transition-all">
                + Tạo yêu cầu mới
            </button>
        </div>
    );
};

export const ReportContentButton: React.FC = () => (
    <button className="text-slate-500 hover:text-red-400 flex items-center gap-1 text-xs transition-colors" title="Báo cáo vi phạm">
        <span className="material-symbols-outlined text-sm">flag</span> Báo cáo
    </button>
);

export const ForkButton: React.FC = () => (
    <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm">
        <span className="material-symbols-outlined text-sm">fork_right</span>
        Fork (Sao chép)
    </button>
);

export const UserRatingStar: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="flex gap-0.5 text-amber-400">
            {[1,2,3,4,5].map(i => (
                <span key={i} className="material-symbols-outlined text-sm">
                    {i <= rating ? 'star' : i - 0.5 <= rating ? 'star_half' : 'star_border'}
                </span>
            ))}
        </div>
    );
};

export const CommentThread: React.FC = () => {
    return (
        <div className="space-y-4 mt-6 border-t border-white/10 pt-4">
            <h4 className="text-sm font-bold text-white">Bình luận (3)</h4>
            <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">JD</div>
                <div className="flex-1">
                    <div className="bg-[#0f172a] p-3 rounded-xl rounded-tl-none border border-white/10">
                        <div className="flex justify-between mb-1">
                            <p className="text-xs font-bold text-slate-300">John Doe</p>
                            <span className="text-[10px] text-slate-600">2h ago</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">Bài học này rất hữu ích, cảm ơn bạn đã chia sẻ! Phần flashcard rất chi tiết.</p>
                    </div>
                    <div className="flex gap-3 mt-1 ml-2">
                        <button className="text-[10px] text-slate-500 hover:text-white">Thích</button>
                        <button className="text-[10px] text-slate-500 hover:text-white">Trả lời</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
