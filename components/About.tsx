
import React, { useEffect, useRef } from 'react';

interface AboutProps {
    onBack: () => void;
    onShowVision: () => void;
    onShowMission: () => void;
    onShowStory: () => void;
    onShowTeam: () => void;
    onShowContact: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    onGoToFeatures?: () => void;
}

const About: React.FC<AboutProps> = ({ onBack, onShowVision, onShowMission, onShowStory, onShowTeam, onShowContact, onLogout, onShowFAQ, onShowAccount, onGoToFeatures }) => {
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
        const PARTICLE_COUNT = 80;
        const CONNECT_DISTANCE = 100;
        const MOUSE_RADIUS = 150;

        // Resize handling
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // Mouse handling
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
            baseX: number;
            baseY: number;
            density: number;
            type: 'bubble' | 'plankton';
            opacity: number;

            constructor() {
                this.x = Math.random() * (canvas?.width || window.innerWidth);
                this.y = Math.random() * (canvas?.height || window.innerHeight) + (canvas?.height || window.innerHeight); // Start slightly below or random
                this.baseX = this.x;
                this.baseY = this.y;
                
                // Randomize type
                this.type = Math.random() > 0.3 ? 'bubble' : 'plankton';

                if (this.type === 'bubble') {
                    this.size = Math.random() * 4 + 1;
                    this.vx = Math.random() * 0.5 - 0.25; // Wobble
                    this.vy = Math.random() * -1.5 - 0.5; // Rise up
                    this.opacity = Math.random() * 0.4 + 0.1;
                } else {
                    this.size = Math.random() * 2;
                    this.vx = Math.random() * 0.4 - 0.2; // Drift
                    this.vy = Math.random() * 0.4 - 0.2; // Drift
                    this.opacity = Math.random() * 0.6 + 0.2;
                }
                
                this.density = (Math.random() * 30) + 1;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                if (this.type === 'bubble') {
                    // Draw Bubble (stroke circle with shine)
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    
                    // Shine on bubble
                    ctx.beginPath();
                    ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity + 0.2})`;
                    ctx.fill();
                } else {
                    // Draw Plankton (solid tiny circle)
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(173, 216, 230, ${this.opacity})`; // Light blueish
                    ctx.fill();
                }
                ctx.closePath();
            }

            update() {
                // Movement
                this.x += this.vx;
                this.y += this.vy;

                // Mouse Interaction (Repel)
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < MOUSE_RADIUS) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const maxDistance = MOUSE_RADIUS;
                    const force = (maxDistance - distance) / maxDistance;
                    const directionX = forceDirectionX * force * this.density;
                    const directionY = forceDirectionY * force * this.density;
                    
                    this.x -= directionX;
                    this.y -= directionY;
                }

                // Reset particles when they go off screen
                if (this.type === 'bubble') {
                    // Bubbles reset to bottom when they go off top
                    if (this.y < -50) {
                        this.y = (canvas?.height || window.innerHeight) + 10;
                        this.x = Math.random() * (canvas?.width || window.innerWidth);
                    }
                } else {
                    // Plankton wraps around
                    if (this.x < -20) this.x = (canvas?.width || window.innerWidth) + 20;
                    if (this.x > (canvas?.width || window.innerWidth) + 20) this.x = -20;
                    if (this.y < -20) this.y = (canvas?.height || window.innerHeight) + 20;
                    if (this.y > (canvas?.height || window.innerHeight) + 20) this.y = -20;
                }
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
            
            // Draw particles
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
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
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f6f7f8] dark:bg-[#101922] group/design-root overflow-x-hidden font-display">
            <style>{`
                .font-display { font-family: 'Space Grotesk', sans-serif; }
            `}</style>
            
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
                <img className="h-full w-full object-cover transition-transform duration-[20s] ease-in-out hover:scale-105" alt="Ocean background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYb_ed7c6-_2w3udsmpkzqSPE-8JExgPa9spK1HJkBTkZkljXXwVALgiF18u2o3SZaVwolLD032iLiucOjxwFdyziM8TfNrXGq5OlKjY0BGDr-j3JG3HDn0GsQbfJqnIZegin_DbTi9I5HFhFuRJCBRP65vlVnpYIM0C8HyfipmulnkeA5263jL3KBiSsBaDR7_4C8pxUazko00qgh7OKqeeqcAFsQ_F0_1PwglTFfCHpN6NFZhp-ki_tP2JclvnOowZ0pqAK5PyDY"/>
                
                {/* Overlay Gradients */}
                <div className="absolute inset-0 bg-sky-200/30 dark:bg-sky-900/50 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#101922]/80 via-transparent to-sky-500/10"></div>
            </div>

            {/* Particle Canvas Layer */}
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 z-0 pointer-events-none"
                style={{ mixBlendMode: 'screen' }}
            ></canvas>

            <div className="relative z-10 flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap px-6 sm:px-10 py-4 bg-gradient-to-b from-sky-900/20 to-transparent backdrop-blur-[2px]">
                    <div className="flex flex-1 items-center gap-9">
                        <div className="flex items-center gap-3 text-white">
                            <span className="material-symbols-outlined text-3xl drop-shadow-md">sailing</span>
                            <h2 className="text-xl font-bold tracking-[-0.015em] drop-shadow-md">LearnAI</h2>
                        </div>
                        <div className="hidden md:flex items-center gap-9">
                            <a 
                                className="text-white text-sm font-bold leading-normal cursor-pointer hover:text-white/80 transition-colors drop-shadow-sm"
                                onClick={(e) => { e.preventDefault(); if(onGoToFeatures) onGoToFeatures(); }}
                            >
                                Tính năng
                            </a>
                            <a className="text-white text-sm font-bold leading-normal underline underline-offset-4 cursor-pointer drop-shadow-sm">Giới thiệu</a>
                            <a onClick={(e) => { e.preventDefault(); onShowFAQ(); }} className="text-white text-sm font-bold leading-normal cursor-pointer hover:text-white/80 transition-colors drop-shadow-sm" href="#">Hỏi đáp</a>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={onShowAccount}
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#137fec] text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-lg hover:bg-[#137fec]/90 transition-all hover:scale-105 active:scale-95"
                        >
                            <span className="truncate">Tài khoản</span>
                        </button>
                        <button onClick={onLogout} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white/20 dark:bg-white/10 text-white text-sm font-bold leading-normal tracking-[0.015em] backdrop-blur-md hover:bg-white/30 transition-all shadow-lg border border-white/20">
                            <span className="truncate">Đăng xuất</span>
                        </button>
                    </div>
                </header>
                <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-20">
                    <div className="w-full max-w-4xl rounded-xl bg-white/70 dark:bg-[#101922]/70 backdrop-blur-xl shadow-2xl p-6 sm:p-10 border border-white/20 ring-1 ring-white/10 animate-[fadeInUp_0.8s_ease-out]">
                        <div className="flex items-center gap-4 mb-8">
                            <button 
                                onClick={onBack}
                                className="flex cursor-pointer items-center justify-center rounded-full h-9 w-9 bg-white/50 dark:bg-white/10 text-slate-800 dark:text-white hover:bg-white/80 dark:hover:bg-white/20 transition-all hover:scale-110 shadow-sm"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <div className="text-center flex-1">
                                <h1 className="text-slate-900 dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] drop-shadow-sm">Hải Trình Của Chúng Ta</h1>
                                <h2 className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-normal leading-normal mt-1">Khám phá câu chuyện, sứ mệnh và đội ngũ đằng sau LearnAI.</h2>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div 
                                onClick={onShowVision}
                                className="flex items-center justify-between gap-6 py-2 px-[15px] rounded-lg border border-slate-300/50 dark:border-slate-700/50 bg-white/50 dark:bg-white/5 cursor-pointer hover:bg-white/70 dark:hover:bg-white/10 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-[#137fec]">
                                        <span className="material-symbols-outlined text-xl">light</span>
                                    </div>
                                    <p className="text-slate-800 dark:text-slate-100 text-base font-medium leading-normal">Tầm nhìn của chúng tôi</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </div>
                            
                            <div 
                                onClick={onShowMission}
                                className="flex items-center justify-between gap-6 py-2 px-[15px] rounded-lg border border-slate-300/50 dark:border-slate-700/50 bg-white/50 dark:bg-white/5 cursor-pointer hover:bg-white/70 dark:hover:bg-white/10 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-500">
                                        <span className="material-symbols-outlined text-xl">explore</span>
                                    </div>
                                    <p className="text-slate-800 dark:text-slate-100 text-base font-medium leading-normal">Sứ mệnh</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </div>

                            <div 
                                onClick={onShowStory}
                                className="flex items-center justify-between gap-6 py-2 px-[15px] rounded-lg border border-slate-300/50 dark:border-slate-700/50 bg-white/50 dark:bg-white/5 cursor-pointer hover:bg-white/70 dark:hover:bg-white/10 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                     <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-500">
                                        <span className="material-symbols-outlined text-xl">history_edu</span>
                                    </div>
                                    <p className="text-slate-800 dark:text-slate-100 text-base font-medium leading-normal">Câu chuyện</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </div>

                            <div 
                                onClick={onShowTeam}
                                className="flex items-center justify-between gap-6 py-2 px-[15px] rounded-lg border border-slate-300/50 dark:border-slate-700/50 bg-white/50 dark:bg-white/5 cursor-pointer hover:bg-white/70 dark:hover:bg-white/10 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500">
                                        <span className="material-symbols-outlined text-xl">groups</span>
                                    </div>
                                    <p className="text-slate-800 dark:text-slate-100 text-base font-medium leading-normal">Đội ngũ</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </div>

                            <div 
                                onClick={onShowContact}
                                className="flex items-center justify-between gap-6 py-2 px-[15px] rounded-lg border border-slate-300/50 dark:border-slate-700/50 bg-white/50 dark:bg-white/5 cursor-pointer hover:bg-white/70 dark:hover:bg-white/10 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-500">
                                        <span className="material-symbols-outlined text-xl">connect_without_contact</span>
                                    </div>
                                    <p className="text-slate-800 dark:text-slate-100 text-base font-medium leading-normal">Liên hệ</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 sm:px-10 py-6 text-center bg-gradient-to-t from-sky-900/40 to-transparent text-white relative z-20">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-2xl drop-shadow-sm">sailing</span>
                        <h2 className="text-lg font-bold drop-shadow-sm">LearnAI</h2>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-6 gap-y-2">
                        <a className="text-sm font-bold leading-normal hover:underline cursor-pointer drop-shadow-sm hover:text-sky-200 transition-colors">Điều khoản dịch vụ</a>
                        <a className="text-sm font-bold leading-normal hover:underline cursor-pointer drop-shadow-sm hover:text-sky-200 transition-colors">Chính sách bảo mật</a>
                    </div>
                    <p className="text-sm font-bold leading-normal drop-shadow-sm">© 2024 LearnAI</p>
                </footer>
            </div>
        </div>
    );
};

export default React.memo(About);
