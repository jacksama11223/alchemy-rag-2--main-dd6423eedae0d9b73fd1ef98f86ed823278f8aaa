
import React from 'react';
import { FeatureWindowControls } from './FeatureWindowControls';

interface ExploreTopicProps {
    onBack: () => void;
    onShowAbout: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    onGoToFeatures?: () => void;
}

const ExploreTopic: React.FC<ExploreTopicProps> = ({ onBack, onShowAccount, onGoToFeatures }) => {
    
    // Fallback nav handler
    const handleNavigation = (view: 'graph' | 'search' | 'category' | '3d') => {
        if (view === 'category') onBack(); // Go back to category
        else { /* TODO: Use global navigation handler from props if strictly needed, or just rely on back for now */ }
    };

    return (
        <div className="bg-[#02041a] font-display text-text-dark min-h-screen flex flex-col relative overflow-hidden">
            <style>{` .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; } `}</style>
            
            <header className="flex items-center justify-between px-6 py-4 bg-[#02041a]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-3xl text-purple-400">topic</span>
                    <h2 className="text-lg font-bold text-white">Chủ Đề</h2>
                </div>
                <div className="flex gap-3 items-center">
                    <button onClick={onShowAccount} className="p-2 rounded-full hover:bg-white/10 text-slate-300"><span className="material-symbols-outlined">person</span></button>
                    {onGoToFeatures && (
                        <button onClick={onGoToFeatures} className="p-2 rounded-full hover:bg-white/10 text-slate-300" title="Tính năng"><span className="material-symbols-outlined">widgets</span></button>
                    )}
                    <FeatureWindowControls onClose={onBack} />
                </div>
            </header>

            <main className="flex-grow p-6 pb-24">
                <div className="max-w-6xl mx-auto">
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span> Quay lại phân loại
                    </button>
                    
                    <h1 className="text-3xl font-bold text-white mb-8">Khám phá theo Chủ đề</h1>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {['Khoa học', 'Lịch sử', 'Nghệ thuật', 'Công nghệ', 'Ngôn ngữ', 'Kinh tế'].map((topic, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all cursor-pointer group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">tag</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{topic}</h3>
                                </div>
                                <p className="text-slate-400 text-sm">Xem các bài học và thẻ ghi nhớ liên quan đến {topic}.</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default React.memo(ExploreTopic);
