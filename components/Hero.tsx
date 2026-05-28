import React from 'react';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-sky-300 to-cyan-400">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
         {/* Moving Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="absolute top-10 left-10 w-24 h-12 bg-white/50 rounded-full blur-md animate-float"></div>
        <div className="absolute top-20 right-20 w-32 h-16 bg-white/50 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-40 h-20 bg-white/40 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div 
            className="absolute -bottom-10 right-0 left-0 h-24 bg-repeat-x z-10" 
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.3' d='M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,186.7C672,192,768,160,864,144C960,128,1056,128,1152,149.3C1248,171,1344,213,1392,234.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`, 
                backgroundSize: 'cover'
            }}
        ></div>
      </div>

      <div className="@container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 text-center lg:text-left text-white animate-fade-in-up">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-black leading-tight tracking-tighter md:text-5xl lg:text-6xl drop-shadow-md">
                Học tập thông minh hơn, không chỉ chăm chỉ hơn
              </h1>
              <h2 className="text-base font-normal leading-normal text-sky-100 md:text-lg drop-shadow-sm opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                Kết hợp phương pháp lặp lại ngắt quãng của Anki và học qua trò chơi của Duolingo, được cá nhân hóa bởi AI để tối ưu hóa hành trình học tập của bạn.
              </h2>
            </div>
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                <button 
                onClick={onStart}
                className="flex self-center lg:self-start min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-auto min-h-[48px] py-3 px-6 bg-[#f1c40f] text-slate-900 text-sm md:text-base font-bold leading-normal tracking-[0.015em] hover:bg-amber-400 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 text-center"
                >
                <span className="whitespace-normal">Bắt đầu hành trình học tập của bạn</span>
                </button>
            </div>
          </div>
          <div className="w-full h-full flex items-center justify-center animate-float" style={{ animationDuration: '6s' }}>
            <img 
              alt="Mascot" 
              className="max-w-md w-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkNUVzNsAARfzwx86jDnSD4oDvCGTrjEspjh60D7XLsa-1iraV5XkfraSO7NwOFpQrd9rhCvXRZ8ONGOAhJ5Bm0_qSJYOI5PVAMaH5MXBnPKkms0PvYwcSiMixrl-lQp9pYtE0-Y7wTcyYnLuScu9_2vCkRp9u6EIgDZATH0aDNDk2KEOYGm-4Cx1BPakE6scrQIUc42rkTADaLMXlagxKv34ozGfyNRXf7y5epXngCKT5PsrcEwZks1Z883gQH1pn-z9GFGPkk68U" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(Hero);