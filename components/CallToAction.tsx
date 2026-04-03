import React from 'react';

interface CTAProps {
    onStart: () => void;
}

const CallToAction: React.FC<CTAProps> = ({ onStart }) => {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] dark:bg-[#101c22]">
      <div className="relative max-w-6xl mx-auto rounded-xl bg-[#3498db]/90 dark:bg-[#3498db]/50 p-8 md:p-12 text-center flex flex-col items-center gap-6 shadow-xl backdrop-blur-sm overflow-hidden group">
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>

        <h2 className="relative z-10 text-3xl font-bold leading-tight tracking-tight text-white dark:text-[#F8F9FA]">Sẵn sàng để chinh phục mục tiêu của bạn?</h2>
        <p className="relative z-10 max-w-2xl text-base font-normal leading-normal text-sky-100 dark:text-[#adb5bd] md:text-lg">
          Tham gia cùng hàng ngàn học viên khác và bắt đầu hành trình học tập được cá nhân hóa ngay hôm nay.
        </p>
        <button 
          onClick={onStart}
          className="relative z-10 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#f1c40f] text-slate-900 text-base font-bold leading-normal tracking-[0.015em] hover:bg-amber-400 transition-colors shadow-lg animate-[pulse_2s_ease-in-out_infinite] hover:animate-none hover:scale-105 active:scale-95"
        >
          <span className="truncate">Đăng ký miễn phí ngay hôm nay</span>
        </button>
      </div>
    </section>
  );
};

export default React.memo(CallToAction);