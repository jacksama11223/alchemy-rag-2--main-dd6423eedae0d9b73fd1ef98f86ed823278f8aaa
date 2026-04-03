import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-[#101c22]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="text-[#3498db] text-2xl">
            <span className="material-symbols-outlined">auto_awesome</span>
          </div>
          <h2 className="text-lg font-bold text-[#212529] dark:text-[#F8F9FA]">LearnAI</h2>
        </div>
        <div className="flex gap-6 text-sm font-medium text-[#6c757d] dark:text-[#adb5bd]">
          <a className="hover:text-[#3498db] transition-colors" href="#">Điều khoản dịch vụ</a>
          <a className="hover:text-[#3498db] transition-colors" href="#">Chính sách bảo mật</a>
        </div>
        <p className="text-sm text-[#6c757d] dark:text-[#adb5bd]">© 2024 LearnAI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
