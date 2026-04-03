
import React from 'react';

interface HeaderProps {
  onStart: () => void;
  onLoginClick: () => void;
  isAppView: boolean;
  onShowAbout: () => void;
  onShowFAQ: () => void;
  onGoToDashboard: () => void;
  onGoToFeatures?: () => void; // New prop for feature navigation
  onShowFriends?: () => void; // New prop for friend manager
  onToggleTodo?: () => void; // New prop for global todo
  onShowUserGuide?: () => void; // NEW: Prop to show user guide
}

const Header: React.FC<HeaderProps> = ({ onStart, onLoginClick, isAppView, onShowAbout, onShowFAQ, onGoToDashboard, onGoToFeatures, onShowFriends, onToggleTodo, onShowUserGuide }) => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200/80 dark:border-slate-700/80 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-50 bg-[#F8F9FA]/80 dark:bg-[#101c22]/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
        <div className="text-[#3498db] text-3xl select-none">
          <span className="material-symbols-outlined">auto_awesome</span>
        </div>
        <h2 className="text-xl font-bold text-[#212529] dark:text-[#F8F9FA]">LearnAI</h2>
      </div>
      
      {/* Navigation Links - Visible on all screens now */}
      <div className="hidden md:flex flex-1 justify-center gap-8">
        <div className="flex items-center gap-8">
          <a 
            href="#" 
            onClick={(e) => { 
                e.preventDefault(); 
                if (onGoToFeatures) {
                    onGoToFeatures();
                } else {
                    onGoToDashboard();
                }
            }} 
            className="text-sm font-medium text-[#212529] dark:text-[#F8F9FA] hover:text-[#3498db] transition-colors"
          >
            Tính năng
          </a>
          {/* New User Guide Link */}
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); if (onShowUserGuide) onShowUserGuide(); }} 
            className="text-sm font-medium text-[#212529] dark:text-[#F8F9FA] hover:text-[#3498db] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">local_library</span>
            Hướng dẫn
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onShowAbout(); }} 
            className="text-sm font-medium text-[#212529] dark:text-[#F8F9FA] hover:text-[#3498db] transition-colors"
          >
            Giới thiệu
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onShowFAQ(); }} 
            className="text-sm font-medium text-[#212529] dark:text-[#F8F9FA] hover:text-[#3498db] transition-colors"
          >
            Hỏi đáp
          </a>
        </div>
      </div>

      <div className="flex gap-2">
        {!isAppView ? (
          <>
            <button 
              onClick={onLoginClick}
              className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#3498db]/20 text-[#3498db] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#3498db]/30 transition-colors"
            >
              <span className="truncate">Đăng nhập</span>
            </button>
            <button 
              onClick={onStart}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#f1c40f] text-slate-900 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-amber-400 transition-colors"
            >
              <span className="truncate">Học ngay</span>
            </button>
          </>
        ) : (
           <div className="flex gap-2">
                {/* Global Todo Trigger */}
                {onToggleTodo && (
                     <button 
                        onClick={onToggleTodo}
                        className="flex w-10 h-10 cursor-pointer items-center justify-center rounded-full bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 transition-colors border border-amber-500/30"
                        title="Nhiệm vụ cần làm"
                    >
                        <span className="material-symbols-outlined text-xl">checklist</span>
                    </button>
                )}

                {onShowFriends && (
                    <button 
                        onClick={onShowFriends}
                        className="flex w-10 h-10 cursor-pointer items-center justify-center rounded-full bg-green-600/20 text-green-600 hover:bg-green-600/30 transition-colors border border-green-600/30"
                        title="Bạn bè"
                    >
                        <span className="material-symbols-outlined text-xl">group_add</span>
                    </button>
                )}
                <button 
                    onClick={onGoToDashboard}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#3498db]/20 text-[#3498db] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#3498db]/30 transition-colors"
                >
                    <span className="truncate">Trang chủ</span>
                </button>
            </div>
        )}
      </div>
    </header>
  );
};

export default React.memo(Header);
