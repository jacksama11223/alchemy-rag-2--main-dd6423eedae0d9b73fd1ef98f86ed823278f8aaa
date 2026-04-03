
import React, { useEffect, useRef } from 'react';

interface MissionProps {
    onBack: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    onGoToFeatures?: () => void;
}

const Mission: React.FC<MissionProps> = ({ onBack, onLogout, onShowFAQ, onShowAccount, onGoToFeatures }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let mouse = { x: -1000, y: -1000 };

        // Configuration
        const PARTICLE_COUNT = 100;
        const CONNECT_DISTANCE = 120;
        const MOUSE_CONNECT_DISTANCE = 180;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };
        window.addEventListener('mousemove', handleMouseMove);

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;

            constructor() {
                this.x = Math.random() * (canvas?.width || window.innerWidth);
                this.y = Math.random() * (canvas?.height || window.innerHeight);
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
                this.size = Math.random() * 2 + 1;
                this.color = `rgba(255, 255, 255, ${Math.random() * 0.6 + 0.2})`;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > (canvas?.width || window.innerWidth)) this.vx *= -1;
                if (this.y < 0 || this.y > (canvas?.height || window.innerHeight)) this.vy *= -1;

                // Mouse interaction - slightly attracted to mouse
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < MOUSE_CONNECT_DISTANCE) {
                    // Gentle attraction
                    this.x += dx * 0.005;
                    this.y += dy * 0.005;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas?.width || window.innerWidth, canvas?.height || window.innerHeight);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // Connect particles to each other
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < CONNECT_DISTANCE) {
                        ctx.beginPath();
                        const opacity = 1 - (distance / CONNECT_DISTANCE);
                        ctx.strokeStyle = `rgba(135, 206, 235, ${opacity * 0.4})`; // Light Sky Blue connections
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }

                // Connect particles to mouse
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < MOUSE_CONNECT_DISTANCE) {
                    ctx.beginPath();
                    const opacity = 1 - (distance / MOUSE_CONNECT_DISTANCE);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.6})`;
                    ctx.lineWidth = 1.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden font-display">
             <style>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                .font-display { font-family: 'Space Grotesk', sans-serif; }
                @keyframes float-card {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes icon-pulse {
                    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.5)); }
                    50% { transform: scale(1.1); filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.8)); }
                }
            `}</style>
            
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
                <img 
                    className="h-full w-full object-cover transition-transform duration-[30s] ease-in-out hover:scale-110" 
                    data-alt="A modern exploration ship sailing calmly on a peaceful sea towards the horizon." 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9cF00vW1ABgH2A8V8Y3QinM9ncdifU5ytDbyfj09owjGpP6jMBZz48tsOSJYKaDL7o0D0U5rVB5AW1SIwTrNGpDE9q20nOlqsVhR9AvUKNohpLAQhzOOCG21uGfyMfUJo-Fh8fgagOrCD4TBUUvyXhmJa_YVyRQQzFSlGm-ydsGGBAC9UeqYcHkf8ENOpeV8eG9aELz8tLPmzVhDQTmFp2p4Tcox-acK2o9UilfnSYSD5HuYotfcnDkTRe4C-wgXZul44UFcPbpGY"
                />
                <div className="absolute inset-0 bg-[#0A243A]/60 dark:bg-[#0A243A]/80 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>
                
                {/* Floating Compass */}
                <div className="absolute bottom-6 right-6 text-white/40 animate-pulse pointer-events-none">
                    <span className="material-symbols-outlined !text-8xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 200, 'GRAD' 200, 'opsz' 48", filter: "blur(2px)" }}>explore</span>
                </div>
            </div>

            {/* Particle Canvas */}
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 z-0 pointer-events-none"
            ></canvas>

            <div className="relative z-10 flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap px-6 sm:px-10 py-4 bg-gradient-to-b from-sky-900/60 to-transparent backdrop-blur-[2px]">
                    <div className="flex items-center gap-3 text-white">
                        <span className="material-symbols-outlined text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">sailing</span>
                        <h2 className="text-xl font-bold tracking-[-0.015em] drop-shadow-md">LearnAI</h2>
                    </div>
                    <div className="hidden md:flex flex-1 justify-center items-center gap-9">
                        <a 
                            className="text-white/90 hover:text-white text-sm font-bold leading-normal transition-colors drop-shadow-sm cursor-pointer"
                            onClick={(e) => { e.preventDefault(); if(onGoToFeatures) onGoToFeatures(); }}
                        >
                            Tính năng
                        </a>
                        <a className="text-white text-sm font-bold leading-normal underline underline-offset-8 decoration-2 decoration-sky-400 drop-shadow-sm" href="#">Giới thiệu</a>
                        <a onClick={(e) => { e.preventDefault(); onShowFAQ(); }} className="text-white/90 hover:text-white text-sm font-bold leading-normal transition-colors drop-shadow-sm cursor-pointer" href="#">Hỏi đáp</a>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={onShowAccount}
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-sky-500/80 text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-lg hover:bg-sky-500 transition-all border border-sky-400/50 hover:shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                        >
                            <span className="truncate">Tài khoản</span>
                        </button>
                        <button onClick={onLogout} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white/10 text-white text-sm font-bold leading-normal tracking-[0.015em] backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all">
                            <span className="truncate">Đăng xuất</span>
                        </button>
                    </div>
                </header>
                
                <main className="flex flex-1 flex-col px-4 py-10 sm:py-20">
                    <div className="w-full max-w-5xl mx-auto mb-4">
                        <button 
                            onClick={onBack}
                            className="group flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/10 shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        >
                            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            <span className="font-bold text-sm">Quay về</span>
                        </button>
                    </div>
                    
                    <div className="flex flex-1 flex-col items-center justify-center">
                        <div 
                            className="w-full max-w-4xl rounded-2xl bg-[#0A1A2F]/60 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] p-8 sm:p-12 text-center border border-sky-500/20 relative overflow-hidden"
                            style={{ animation: 'float-card 6s ease-in-out infinite' }}
                        >
                            {/* Decorative Glows */}
                            <div className="absolute -top-20 -left-20 w-40 h-40 bg-sky-500/30 rounded-full blur-[80px]"></div>
                            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/30 rounded-full blur-[80px]"></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-center items-center gap-6 mb-8">
                                    <span className="material-symbols-outlined !text-4xl text-sky-300" style={{ animation: 'icon-pulse 3s infinite' }}>link</span>
                                    <h1 className="text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em] drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]">
                                        Sứ Mệnh Của Chúng Tôi
                                    </h1>
                                    <span className="material-symbols-outlined !text-4xl text-sky-300" style={{ animation: 'icon-pulse 3s infinite', animationDelay: '1.5s' }}>explore</span>
                                </div>
                                
                                <div className="space-y-6">
                                    <p className="text-sky-100/90 text-lg sm:text-xl font-medium leading-relaxed drop-shadow-sm">
                                        LearnAI cam kết mang đến một cuộc cách mạng trong việc <span className="text-sky-300 font-bold">học tập cá nhân hóa</span>.
                                    </p>
                                    <p className="text-slate-300/90 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
                                        Sứ mệnh của chúng tôi là kết hợp sức mạnh của trí tuệ nhân tạo tiên tiến với các phương pháp học đã được chứng minh như của <span className="text-white font-semibold">Duolingo</span> và <span className="text-white font-semibold">Anki</span>, để tạo ra một hành trình tri thức độc đáo, hiệu quả và hấp dẫn cho mỗi người dùng.
                                    </p>
                                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent mx-auto my-6"></div>
                                    <p className="text-slate-300/90 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
                                        Chúng tôi mong muốn phá vỡ mọi rào cản, giúp bạn không chỉ học, mà còn thực sự thấu hiểu và ghi nhớ kiến thức bền vững, định hướng bạn đến thành công trên con đường học vấn và sự nghiệp.
                                    </p>
                                </div>

                                <div className="flex justify-center items-center gap-12 mt-10">
                                    <div className="flex flex-col items-center gap-3 group cursor-pointer">
                                        <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:bg-sky-500/20 group-hover:border-sky-400/50 transition-all duration-300 group-hover:scale-110 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                                            <span className="material-symbols-outlined !text-3xl text-sky-200 group-hover:text-white transition-colors">anchor</span>
                                        </div>
                                        <span className="text-xs font-bold text-sky-200/60 uppercase tracking-widest group-hover:text-sky-300 transition-colors">Nền Tảng</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-3 group cursor-pointer">
                                        <div className="p-5 rounded-full bg-white/5 border border-white/10 group-hover:bg-sky-500/20 group-hover:border-sky-400/50 transition-all duration-300 group-hover:scale-110 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                                            <span className="material-symbols-outlined !text-4xl text-sky-200 group-hover:text-white transition-colors">sailing</span>
                                        </div>
                                        <span className="text-xs font-bold text-sky-200/60 uppercase tracking-widest group-hover:text-sky-300 transition-colors">Hành Trình</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-3 group cursor-pointer">
                                        <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:bg-sky-500/20 group-hover:border-sky-400/50 transition-all duration-300 group-hover:scale-110 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                                            <span className="material-symbols-outlined !text-3xl text-sky-200 group-hover:text-white transition-colors">navigation</span>
                                        </div>
                                        <span className="text-xs font-bold text-sky-200/60 uppercase tracking-widest group-hover:text-sky-300 transition-colors">Định Hướng</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 sm:px-10 py-6 text-center bg-gradient-to-t from-[#0A243A]/90 to-transparent text-white relative z-20 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-2xl text-sky-400">sailing</span>
                        <h2 className="text-lg font-bold">LearnAI</h2>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-8 gap-y-2">
                        <a className="text-sm font-bold leading-normal hover:text-sky-300 transition-colors cursor-pointer tracking-wide" href="#">Điều khoản dịch vụ</a>
                        <a className="text-sm font-bold leading-normal hover:text-sky-300 transition-colors cursor-pointer tracking-wide" href="#">Chính sách bảo mật</a>
                    </div>
                    <p className="text-sm font-medium text-slate-400">© 2024 LearnAI</p>
                </footer>
            </div>
        </div>
    );
};

export default React.memo(Mission);