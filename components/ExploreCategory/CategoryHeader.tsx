
import React from 'react';

interface CategoryHeaderProps {
    viewMode: 'cards' | 'heatmap';
    setViewMode: (mode: 'cards' | 'heatmap') => void;
    onShowAbout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    onLogout: () => void;
    onGoToFeatures?: () => void; // New prop
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({ 
    viewMode, setViewMode, onShowAbout, onShowFAQ, onShowAccount, onLogout, onGoToFeatures
}) => {
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-sky-blue/20 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-50 bg-deep-sea-start/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <div className="text-sky-blue text-3xl">
                    <span className="material-symbols-outlined">sailing</span>
                </div>
                <h2 className="text-xl font-bold text-white">LearnAI</h2>
                <div className="hidden md:flex ml-8 items-center gap-8">
                    <a 
                        className="text-sm font-medium hover:text-sky-blue text-text-muted-dark transition-colors cursor-pointer" 
                        onClick={(e) => { e.preventDefault(); if(onGoToFeatures) onGoToFeatures(); }}
                    >
                        Tính năng
                    </a>
                    <a onClick={(e) => { e.preventDefault(); onShowAbout(); }} className="text-sm font-medium hover:text-sky-blue text-text-muted-dark transition-colors cursor-pointer" href="#">Giới thiệu</a>
                    <a onClick={(e) => { e.preventDefault(); onShowFAQ(); }} className="text-sm font-medium hover:text-sky-blue text-text-muted-dark transition-colors cursor-pointer" href="#">Hỏi đáp</a>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex gap-2 bg-white/10 rounded-lg p-1 mr-2">
                    <button 
                        onClick={() => setViewMode('cards')} 
                        className={`p-2 rounded transition-colors ${viewMode === 'cards' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
                        title="Dạng lưới"
                    >
                        <span className="material-symbols-outlined text-sm">grid_view</span>
                    </button>
                    <button 
                        onClick={() => setViewMode('heatmap')} 
                        className={`p-2 rounded transition-colors ${viewMode === 'heatmap' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
                        title="Biểu đồ nhiệt"
                    >
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                    </button>
                </div>
                <button 
                    onClick={onShowAccount}
                    className="flex gap-2 cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-sky-blue/10 border border-sky-blue/50 text-sky-blue text-sm font-medium leading-normal hover:bg-sky-blue/20 transition-colors"
                >
                    <span className="material-symbols-outlined text-base">person</span>
                    <span className="truncate">Tài khoản</span>
                </button>
                <button onClick={onLogout} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-sky-blue/20 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-sky-blue/30 transition-colors">
                    <span className="truncate">Đăng xuất</span>
                </button>
            </div>
        </header>
    );
};
