
import React, { useEffect, useRef } from 'react';

interface VisionProps {
    onBack: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    onGoToFeatures?: () => void;
}

const Vision: React.FC<VisionProps> = ({ onBack, onLogout, onShowFAQ, onShowAccount, onGoToFeatures }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let shootingStars: ShootingStar[] = [];
        
        // Configuration
        const PARTICLE_COUNT = 150;
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            x: number;
            y: number;
            size: number;
            speedY: number;
            speedX: number;
            opacity: number;
            color: string;
            pulseSpeed: number;
            angle: number;

            constructor() {
                this.x = Math.random() * (canvas?.width || window.innerWidth);
                this.y = Math.random() * (canvas?.height || window.innerHeight) + (canvas?.height || window.innerHeight) / 2;
                this.size = Math.random() * 3 + 0.5;
                this.speedY = Math.random() * -1 - 0.2; // Move Up
                this.speedX = Math.random() * 0.5 - 0.25; // Slight horizontal drift
                this.opacity = Math.random() * 0.5 + 0.1;
                this.pulseSpeed = Math.random() * 0.02 + 0.005;
                this.angle = Math.random() * Math.PI * 2;
                
                // Color palette: White, Light Blue, Soft Gold
                const colors = ['255, 255, 255', '135, 206, 250', '255, 223, 186'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.y += this.speedY;
                this.x += this.speedX + Math.sin(this.angle) * 0.5;
                this.angle += 0.01;

                // Pulse opacity
                this.opacity += Math.sin(this.angle * 5) * this.pulseSpeed;
                if (this.opacity < 0.1) this.opacity = 0.1;
                if (this.opacity > 0.8) this.opacity = 0.8;

                // Reset
                if (this.y < -10) {
                    this.y = (canvas?.height || window.innerHeight) + 10;
                    this.x = Math.random() * (canvas?.width || window.innerWidth);
                }
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
                ctx.shadowBlur = 15;
                ctx.shadowColor = `rgba(${this.color}, 0.8)`;
                ctx.fill();
            }
        }

        class ShootingStar {
            x!: number;
            y!: number;
            length!: number;
            speed!: number;
            angle!: number;
            opacity!: number;
            active: boolean;

            constructor() {
                this.active = false;
                this.reset();
            }

            reset() {
                this.x = Math.random() * (canvas?.width || window.innerWidth);
                this.y = Math.random() * ((canvas?.height || window.innerHeight) / 2); // Start in top half
                this.length = Math.random() * 80 + 10;
                this.speed = Math.random() * 10 + 5;
                this.angle = Math.PI / 4; // 45 degrees
                this.opacity = 0;
                this.active = false;
            }

            trigger() {
                this.active = true;
                this.opacity = 1;
                this.x = Math.random() * ((canvas?.width || window.innerWidth) / 2); // Start left side mostly
                this.y = Math.random() * ((canvas?.height || window.innerHeight) / 3);
            }

            update() {
                if (!this.active) {
                    // Random chance to trigger
                    if (Math.random() < 0.005) {
                        this.trigger();
                    }
                    return;
                }

                this.x += this.speed * Math.cos(this.angle);
                this.y += this.speed * Math.sin(this.angle);
                this.opacity -= 0.01;

                if (this.opacity <= 0 || this.x > (canvas?.width || window.innerWidth) || this.y > (canvas?.height || window.innerHeight)) {
                    this.reset();
                }
            }

            draw() {
                if (!this.active || !ctx) return;
                
                const tailX = this.x - this.length * Math.cos(this.angle);
                const tailY = this.y - this.length * Math.sin(this.angle);

                const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(tailX, tailY);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.stroke();
                
                // Head glow
                ctx.beginPath();
                ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'white';
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        const init = () => {
            particles = [];
            shootingStars = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle());
            }
            for (let i = 0; i < 3; i++) {
                shootingStars.push(new ShootingStar());
            }
        };

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas?.width || window.innerWidth, canvas?.height || window.innerHeight);

            // Particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Shooting Stars
            shootingStars.forEach(s => {
                s.update();
                s.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
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
                
                @keyframes float-vision {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
                
                @keyframes glow-pulse-vision {
                    0%, 100% { text-shadow: 0 0 10px rgba(135, 206, 250, 0.5); }
                    50% { text-shadow: 0 0 25px rgba(135, 206, 250, 0.9), 0 0 10px rgba(255, 255, 255, 0.8); }
                }

                @keyframes reveal-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .glass-card-vision {
                    background: rgba(13, 25, 48, 0.65);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                }

                .vision-text-gradient {
                    background: linear-gradient(to right, #ffffff, #BFEFFF);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
            
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
                <img className="h-full w-full object-cover transition-transform duration-[20s] ease-in-out hover:scale-105" alt="Vision background sky" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7AQaY_D-KYdbpHj5FNiVKDIhLa3z3M-939Rd2pcclZS6oXjSGx4Tez3LxORKZE83Ms5Ua60eLo9jcX5M-cwjhlhJNt-zBVjXOrIyuOmSLnr_4Y56Me5fOTyx0lTN6nXIutBoDNge4bDVoKTiMLk-Fppivhbh9eCMZSV8sVgQV_DyDtzOT5U5E06Ud9Xqg68KRvdb19AG3d4S43YuQguQn4Keno38uOR4j9tUnFPZqmC2yq6vDdP5EHhwM3o0kTMc-uIWbto7950Dc"/>
                <div className="absolute inset-0 bg-sky-900/40 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-[#050A14]/60 to-transparent"></div>
            </div>
            
            {/* Particle Canvas */}
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 z-0 pointer-events-none"
            ></canvas>
            
            <div className="relative z-10 flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap px-6 sm:px-10 py-4 bg-gradient-to-b from-[#050A14]/80 to-transparent backdrop-blur-[1px]">
                    <div className="flex items-center gap-3 text-white">
                        <span className="material-symbols-outlined text-3xl" style={{ textShadow: '0 0 10px #87CEFA' }}>sailing</span>
                        <h2 className="text-xl font-bold tracking-[-0.015em]" style={{ textShadow: '0 0 10px #87CEFA' }}>LearnAI</h2>
                    </div>
                    <div className="hidden md:flex items-center gap-9">
                        <a 
                            className="text-white/80 hover:text-white text-sm font-bold leading-normal transition-all cursor-pointer"
                            onClick={(e) => { e.preventDefault(); if(onGoToFeatures) onGoToFeatures(); }}
                        >
                            Tính năng
                        </a>
                        <a className="text-white text-sm font-bold leading-normal underline underline-offset-8 decoration-cyan-400 decoration-2" href="#">Giới thiệu</a>
                        <a onClick={(e) => { e.preventDefault(); onShowFAQ(); }} className="text-white/80 hover:text-white text-sm font-bold leading-normal transition-all cursor-pointer" href="#">Hỏi đáp</a>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={onShowAccount}
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-cyan-600/90 hover:bg-cyan-500 text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-[0_0_15px_rgba(8,145,178,0.5)] transition-all"
                        >
                            <span className="truncate">Tài khoản</span>
                        </button>
                        <button onClick={onLogout} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white/10 text-white text-sm font-bold leading-normal tracking-[0.015em] backdrop-blur-sm hover:bg-white/20 border border-white/20 transition-all">
                            <span className="truncate">Đăng xuất</span>
                        </button>
                    </div>
                </header>

                <main className="flex flex-1 flex-col px-4 py-10 sm:py-20 relative">
                    <div className="w-full max-w-5xl mx-auto mb-8 relative z-20">
                        <button 
                            onClick={onBack}
                            className="group flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2.5 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/10 shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:-translate-x-1"
                        >
                            <span className="material-symbols-outlined text-cyan-300">arrow_back</span>
                            <span className="font-bold text-sm tracking-wide">Quay về</span>
                        </button>
                    </div>

                    <div className="w-full max-w-4xl mx-auto glass-card-vision rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden" 
                         style={{ animation: 'reveal-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
                        
                        {/* Decorative background glow inside card */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="inline-flex items-center justify-center p-4 rounded-full bg-cyan-500/10 border border-cyan-400/30 mb-8 shadow-[0_0_30px_rgba(6,182,212,0.3)]" style={{ animation: 'float-vision 6s ease-in-out infinite' }}>
                                <span className="material-symbols-outlined text-5xl text-cyan-300">visibility</span>
                            </div>

                            <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight vision-text-gradient drop-shadow-lg mb-8">
                                Tầm Nhìn Của Chúng Tôi
                            </h1>
                            
                            <div className="space-y-8 text-lg sm:text-xl text-slate-200/90 font-medium leading-relaxed max-w-3xl mx-auto text-left sm:text-center">
                                <p className="drop-shadow-md">
                                    <span className="text-cyan-300 font-bold">LearnAI</span> khao khát trở thành ngọn hải đăng tri thức toàn cầu, soi sáng con đường học tập cho hàng triệu người.
                                </p>
                                <p className="drop-shadow-md">
                                    Chúng tôi kiến tạo một vũ trụ học tập nơi <span className="text-amber-200 font-bold">trí tuệ nhân tạo</span> không thay thế con người, mà nâng tầm tiềm năng vô hạn của mỗi cá nhân, phá vỡ mọi rào cản ngôn ngữ và địa lý.
                                </p>
                                <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mx-auto"></div>
                                <p className="text-base sm:text-lg text-slate-300/80 italic">
                                    "Không chỉ là ứng dụng, chúng tôi là chòm sao dẫn lối trên hành trình chinh phục tri thức của bạn."
                                </p>
                            </div>

                            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-3xl">
                                <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-default">
                                    <span className="material-symbols-outlined text-4xl text-yellow-300 group-hover:scale-110 transition-transform" style={{ textShadow: '0 0 15px #FFD700' }}>light_mode</span>
                                    <span className="text-sm font-bold text-slate-200 tracking-wider uppercase">Soi Sáng</span>
                                </div>
                                <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-default">
                                    <span className="material-symbols-outlined text-4xl text-cyan-300 group-hover:scale-110 transition-transform" style={{ textShadow: '0 0 15px #00FFFF' }}>rocket_launch</span>
                                    <span className="text-sm font-bold text-slate-200 tracking-wider uppercase">Vươn Xa</span>
                                </div>
                                <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-default">
                                    <span className="material-symbols-outlined text-4xl text-purple-300 group-hover:scale-110 transition-transform" style={{ textShadow: '0 0 15px #E0B0FF' }}>hotel_class</span>
                                    <span className="text-sm font-bold text-slate-200 tracking-wider uppercase">Kiến Tạo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 sm:px-10 py-6 text-center bg-[#050A14]/90 text-slate-400 border-t border-cyan-900/30 relative z-20">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-2xl text-cyan-600">sailing</span>
                        <h2 className="text-lg font-bold text-cyan-100/50">LearnAI</h2>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-6 gap-y-2">
                        <a className="text-sm font-bold leading-normal hover:text-cyan-400 transition-colors cursor-pointer" style={{ textShadow: '0 0 5px rgba(0,0,0,0.5)' }}>Điều khoản dịch vụ</a>
                        <a className="text-sm font-bold leading-normal hover:text-cyan-400 transition-colors cursor-pointer" style={{ textShadow: '0 0 5px rgba(0,0,0,0.5)' }}>Chính sách bảo mật</a>
                    </div>
                    <p className="text-sm font-bold leading-normal text-slate-600">© 2024 LearnAI</p>
                </footer>
            </div>
        </div>
    );
};

export default React.memo(Vision);