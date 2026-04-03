
import React, { useMemo } from 'react';
import { KnowledgeNode } from '../types';

import { FeatureWindowControls } from './FeatureWindowControls';

interface MediaCardsProps {
    onBack: () => void;
    onShowAbout: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    userNodes?: KnowledgeNode[];
    onAnalyzeImage?: (imageBase64: string) => void;
    onDigest?: (content: string) => void;
}

const MediaCards: React.FC<MediaCardsProps> = ({ onBack, onShowAbout, onLogout, onShowFAQ, onShowAccount, userNodes = [], onAnalyzeImage, onDigest }) => {
    
    // Filter nodes that have images
    const imageNodes = useMemo(() => {
        return userNodes.filter(node => node.imageUrl);
    }, [userNodes]);

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-hidden iridescent-bg-enhanced font-vietnam text-silver-sparkle bg-[#0c0a18]">
            {/* ... (Keep existing styles and header) ... */}
            <header className="sticky top-0 z-50 flex h-20 items-center justify-between whitespace-nowrap border-b border-solid border-white/10 bg-gradient-to-b from-[rgba(17,24,39,0.5)] to-transparent px-6 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-md lg:px-12 transition-all duration-300">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-glow-silver text-silver-sparkle">edit_note</span>
                        <span className="text-2xl font-bold tracking-wider text-glow-silver text-silver-sparkle">Ghi Chú & Thư Viện</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <FeatureWindowControls onClose={onBack} />
                </div>
            </header>

            <main className="relative z-10 flex-grow p-6 lg:p-12 overflow-y-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-white text-glow-silver drop-shadow-xl sm:text-6xl">Khoảnh Khắc Tri Thức</h1>
                    <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-200 font-medium drop-shadow-md">
                        Mỗi hình ảnh là một câu chuyện. AI sẽ giúp bạn đọc vị và khám phá sâu hơn.
                    </p>
                </div>

                {imageNodes.length === 0 ? (
                    <div className="text-center py-20 bg-black/20 rounded-3xl border border-white/10 backdrop-blur-md">
                        <span className="material-symbols-outlined text-6xl text-slate-500 mb-4">image_not_supported</span>
                        <p className="text-xl text-slate-300">Chưa có thẻ nào chứa hình ảnh trong bộ sưu tập của bạn.</p>
                        <p className="text-sm text-slate-400 mt-2">Hãy dùng Giả kim thuật để tạo nội dung từ ảnh hoặc yêu cầu AI vẽ minh họa.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {imageNodes.map(node => (
                            <div key={node.id} className="group relative rounded-3xl border border-white/20 bg-black/40 overflow-hidden backdrop-blur-xl card-animated hover:bg-black/60 transition-colors shadow-2xl">
                                <div className="aspect-[4/3] w-full overflow-hidden relative">
                                    <img 
                                        src={node.imageUrl} 
                                        alt={node.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                </div>
                                
                                <div className="p-6 relative z-10">
                                    <h3 className="text-xl font-bold text-white mb-2 truncate">{node.title}</h3>
                                    <div className="flex gap-2 mb-4">
                                        <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-sky-300 uppercase font-bold tracking-wider">{node.type}</span>
                                    </div>
                                    
                                    <div className="flex gap-3 mt-4">
                                        <button 
                                            onClick={() => onAnalyzeImage && node.imageUrl && onAnalyzeImage(node.imageUrl)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors shadow-lg"
                                        >
                                            <span className="material-symbols-outlined text-sm">psychology</span>
                                            Hỏi Gia sư
                                        </button>
                                        <button 
                                            onClick={() => onDigest && node.data && onDigest(JSON.stringify(node.data))}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg"
                                        >
                                            <span className="material-symbols-outlined text-sm">summarize</span>
                                            Tóm tắt
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default React.memo(MediaCards);
