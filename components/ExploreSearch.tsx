
import React from 'react';
import { FeatureWindowControls } from './FeatureWindowControls';

interface ExploreSearchProps {
    onBack: () => void;
    onShowAbout: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    onGoToFeatures?: () => void;
}

const ExploreSearch: React.FC<ExploreSearchProps> = ({ onBack, onShowAbout, onLogout, onShowFAQ, onShowAccount, onGoToFeatures }) => {
    
    return (
        <div className="bg-deep-sea-start font-display text-text-dark min-h-full flex flex-col relative overflow-hidden rounded-3xl">
            <style>{`
                .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
                .omnibar-glow { box-shadow: 0 0 20px rgba(57, 167, 255, 0.2), inset 0 0 10px rgba(57, 167, 255, 0.1); }
                .data-chip:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
            `}</style>
            
            <main className="flex-grow flex flex-col items-center pt-12 px-4 relative z-10">
                <div className="absolute top-4 right-4 z-50">
                    <FeatureWindowControls onClose={onBack} />
                </div>
                <div className="w-full max-w-4xl flex flex-col gap-10">
                    
                    {/* Breadcrumbs / Back Button */}
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-[-20px] self-start">
                        <button onClick={onBack} className="hover:text-white transition-colors hover:underline">Home</button>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="text-sky-400 font-bold">Search</span>
                    </div>

                    <div className="text-center mb-4">
                        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-sky-300 mb-3 drop-shadow-lg">Truy Xuất Dữ Liệu</h1>
                        <p className="text-sky-200/70 text-lg">Tìm kiếm mọi nốt tri thức trong mạng lưới của bạn</p>
                    </div>

                    <div className="relative group mx-auto w-full max-w-2xl">
                        <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 via-purple-500 to-sky-500 rounded-full opacity-30 group-hover:opacity-70 blur transition duration-500 animate-gradient-x"></div>
                        <div className="relative flex items-center bg-[#0f172a]/90 rounded-full omnibar-glow border border-sky-500/30 backdrop-blur-xl">
                            <span className="material-symbols-outlined text-2xl text-sky-400 ml-6">search</span>
                            <input 
                                className="w-full bg-transparent border-none focus:ring-0 text-white text-lg py-4 px-4 placeholder-slate-500 font-medium" 
                                placeholder="Nhập từ khóa, thẻ tag, hoặc chủ đề..." 
                                type="text"
                                autoFocus
                            />
                            <button className="mr-2 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
                                <span className="material-symbols-outlined">mic</span>
                            </button>
                            <button className="mr-2 p-3 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold transition-all shadow-lg">
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-400">
                        <span className="py-1">Gợi ý:</span>
                        {['Lịch sử', 'Toán học', 'Từ vựng', 'Python', 'React', 'Vật lý'].map(tag => (
                            <button key={tag} className="px-4 py-1 rounded-full bg-sky-900/30 hover:bg-sky-500/20 border border-sky-500/20 hover:border-sky-400/50 text-sky-200 transition-all">#{tag}</button>
                        ))}
                    </div>

                    <div className="mt-8">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-sky-400">history</span> Tìm kiếm gần đây</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Mock Results as Holographic Data Chips */}
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="data-chip p-5 rounded-2xl bg-[#1e293b]/40 border border-sky-500/10 backdrop-blur-md cursor-pointer transition-all duration-300 hover:bg-[#1e293b]/60 hover:border-sky-500/30 group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`p-2 rounded-lg bg-gradient-to-br ${i % 2 === 0 ? 'from-purple-500/20 to-blue-500/20 text-purple-300' : 'from-yellow-500/20 to-orange-500/20 text-yellow-300'}`}>
                                            <span className="material-symbols-outlined text-xl">{i % 2 === 0 ? 'school' : 'lightbulb'}</span>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-black/20 px-2 py-1 rounded border border-white/5">Unit {i}</span>
                                    </div>
                                    <h3 className="text-sky-100 font-bold mb-1 group-hover:text-white transition-colors">Kiến thức cơ bản {i}</h3>
                                    <p className="text-slate-400 text-xs line-clamp-2">Tóm tắt nội dung ngắn gọn về chủ đề này để người dùng nắm bắt nhanh...</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default React.memo(ExploreSearch);
