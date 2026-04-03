
import React, { useEffect, useRef } from 'react';

interface TeamProps {
    onBack: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    onGoToFeatures?: () => void;
}

const Team: React.FC<TeamProps> = ({ onBack, onLogout, onShowFAQ, onShowAccount, onGoToFeatures }) => {
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
        const CONNECT_DISTANCE = 100;
        
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
            type: 'bubble' | 'data';
            opacity: number;
            pulse: number;

            constructor() {
                this.x = Math.random() * (canvas?.width || window.innerWidth);
                this.y = Math.random() * (canvas?.height || window.innerHeight);
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() * -1) - 0.2; // Always float up
                this.type = Math.random() > 0.5 ? 'bubble' : 'data';
                
                if (this.type === 'bubble') {
                    this.size = Math.random() * 3 + 1;
                } else {
                    this.size = Math.random() * 4 + 2; // Data bits are slightly larger squares
                }
                
                this.opacity = Math.random() * 0.5 + 0.1;
                this.pulse = Math.random() * 0.05;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.opacity += Math.sin(Date.now() * 0.005 + this.x) * 0.005;

                // Reset
                if (this.y < -10) {
                    this.y = (canvas?.height || window.innerHeight) + 10;
                    this.x = Math.random() * (canvas?.width || window.innerWidth);
                }
                if (this.x < -10) this.x = (canvas?.width || window.innerWidth) + 10;
                if (this.x > (canvas?.width || window.innerWidth) + 10) this.x = -10;

                // Mouse Repulsion (Water displacement)
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 150) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (150 - distance) / 150;
                    const directionX = forceDirectionX * force * 2;
                    const directionY = forceDirectionY * force * 2;
                    this.x -= directionX;
                    this.y -= directionY;
                }
            }

            draw() {
                if (!ctx) return;
                
                if (this.type === 'bubble') {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(135, 206, 235, ${this.opacity})`; // Sky blue
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = `rgba(135, 206, 235, 0.5)`;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                } else {
                    // Data bit (Square with stroke)
                    ctx.beginPath();
                    ctx.rect(this.x, this.y, this.size, this.size);
                    ctx.strokeStyle = `rgba(0, 255, 255, ${this.opacity})`; // Cyan
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    
                    // Occasionally fill it
                    if (Math.random() > 0.95) {
                        ctx.fillStyle = `rgba(0, 255, 255, ${this.opacity * 0.5})`;
                        ctx.fill();
                    }
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

            // Draw Radar Scan Line
            const time = Date.now() * 0.0005;
            const scanY = (time % 2) * canvas.height; // Scan goes down
            
            // Draw particles
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // Connect particles if close (Network effect)
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < CONNECT_DISTANCE) {
                        ctx.beginPath();
                        const opacity = (1 - (distance / CONNECT_DISTANCE)) * 0.2;
                        ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
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
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#020617] group/design-root overflow-x-hidden font-display">
            <style>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                .font-display { font-family: 'Space Grotesk', sans-serif; }
                
                @keyframes float-hologram {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes scanline {
                    0% { transform: translateY(-100%); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(200%); opacity: 0; }
                }

                @keyframes pulse-ring {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(19, 127, 236, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(19, 127, 236, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(19, 127, 236, 0); }
                }

                .hologram-card {
                    background: rgba(2, 6, 23, 0.7);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    box-shadow: 0 0 20px rgba(6, 182, 212, 0.15), inset 0 0 20px rgba(6, 182, 212, 0.05);
                    position: relative;
                    overflow: hidden;
                }

                .hologram-card::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 50%;
                    background: linear-gradient(to bottom, rgba(6, 182, 212, 0.2), transparent);
                    animation: scanline 4s linear infinite;
                    pointer-events: none;
                }

                .profile-ring {
                    animation: pulse-ring 3s infinite;
                }
                
                .tech-text-shadow {
                    text-shadow: 0 0 5px rgba(6, 182, 212, 0.8);
                }
            `}</style>

            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                <img 
                    className="h-full w-full object-cover opacity-60" 
                    alt="A team of scientists/explorers working together inside a modern research submarine." 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT54M2bEweXcqqm9j9XtVWxOLCl17onQufUCrlR880d88HNLOvdY8fUkIo-dDB8g8qBdmI2VrVuaqRVXOxiwQOek0Lt7-Z4qUSZRNNLLwX-bBF63GRkAiylwLdMtmnbQ7mKm303YwXsxg_uIQRGZRN8kAIxTHhJqe5tguC4r83GuP8r4eJSkcxSkqn0Xk4jdcx1guwVt8sviEb_PhjMw_c6O1vnqvFScywN_BMOuRmTzBTzNcgg5dPDj9HfzCNvn-noPEs9V3QeKIv"
                />
                {/* Deep Sea Blue Overlay */}
                <div className="absolute inset-0 bg-[#020617]/80 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/70 to-transparent"></div>
                
                {/* Grid Overlay for Tech Feel */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            </div>

            {/* Particle Canvas */}
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 z-0 pointer-events-none"
            ></canvas>

            <div className="relative z-10 flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap px-6 sm:px-10 py-4 bg-gradient-to-b from-[#020617]/90 to-transparent">
                    <div className="flex items-center gap-9">
                        <div className="flex items-center gap-3 text-white">
                            <span className="material-symbols-outlined text-3xl text-cyan-400" style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.6)' }}>sailing</span>
                            <h2 className="text-xl font-bold tracking-[-0.015em] text-cyan-50" style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.4)' }}>LearnAI</h2>
                        </div>
                        <div className="hidden md:flex items-center gap-9">
                            <a 
                                className="text-cyan-100/70 text-sm font-bold leading-normal hover:text-cyan-300 transition-colors cursor-pointer tracking-wide" 
                                onClick={(e) => { e.preventDefault(); if(onGoToFeatures) onGoToFeatures(); }}
                            >
                                Tính năng
                            </a>
                            <a className="text-cyan-300 text-sm font-bold leading-normal underline underline-offset-8 decoration-2 cursor-pointer decoration-cyan-500/50" href="#">Giới thiệu</a>
                            <a onClick={(e) => { e.preventDefault(); onShowFAQ(); }} className="text-cyan-100/70 text-sm font-bold leading-normal hover:text-cyan-300 transition-colors cursor-pointer tracking-wide" href="#">Hỏi đáp</a>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={onShowAccount}
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-sm h-10 px-4 bg-[#137fec]/20 border border-[#137fec]/60 text-[#137fec] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#137fec]/40 hover:shadow-[0_0_15px_rgba(19,127,236,0.6)] transition-all"
                        >
                            <span className="truncate">Tài khoản</span>
                        </button>
                        <button onClick={onLogout} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-sm h-10 px-4 bg-transparent border border-white/20 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-white/10 transition-colors">
                            <span className="truncate">Đăng xuất</span>
                        </button>
                    </div>
                </header>

                <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-20">
                    <div className="w-full max-w-6xl">
                        <button 
                            onClick={onBack}
                            className="group flex cursor-pointer items-center justify-center gap-2 rounded-sm h-9 px-4 bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 mb-8 hover:bg-cyan-900/60 transition-all backdrop-blur-sm shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                        >
                            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            <span className="text-sm font-bold uppercase tracking-wider">Quay về</span>
                        </button>
                        
                        <div className="w-full rounded-2xl bg-[#020617]/50 backdrop-blur-md p-8 sm:p-14 border-y border-cyan-500/20 relative">
                             {/* Decorative Corner Brackets */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/60 rounded-tl-lg"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/60 rounded-tr-lg"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/60 rounded-bl-lg"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/60 rounded-br-lg"></div>

                            <div className="text-center mb-12 relative z-10">
                                <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full border border-cyan-500/30 bg-cyan-950/30">
                                    <span className="material-symbols-outlined text-3xl text-cyan-400">engineering</span>
                                </div>
                                <h1 className="text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em] tech-text-shadow">Đội Ngũ Phát Triển</h1>
                                <div className="flex items-center justify-center gap-4 mt-2">
                                    <div className="h-px w-10 bg-gradient-to-r from-transparent to-cyan-500/50"></div>
                                    <h2 className="text-cyan-200/80 text-sm sm:text-base font-normal tracking-widest uppercase">Các kỹ sư kiến tạo tương lai</h2>
                                    <div className="h-px w-10 bg-gradient-to-l from-transparent to-cyan-500/50"></div>
                                </div>
                            </div>

                            <div className="flex justify-center flex-wrap gap-8">
                                {/* Profile Card */}
                                <div 
                                    className="hologram-card flex flex-col items-center text-center p-8 rounded-xl max-w-xs w-full hover:transform hover:scale-105 transition-transform duration-500"
                                    style={{ animation: 'float-hologram 6s ease-in-out infinite' }}
                                >
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 profile-ring"></div>
                                        <div className="relative z-10 p-1 bg-cyan-950/50 rounded-full border border-cyan-500/50">
                                            <img 
                                                alt="Profile picture of Hoàng Đăng Quang" 
                                                className="h-32 w-32 rounded-full object-cover grayscale-[30%] contrast-125 hover:grayscale-0 transition-all duration-500" 
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA81ARAOB6DSXa0TZGNOEqHyyqSXOZMOLbW5v87gsKcNU4wAwEBrqXBr3N0U5TKQVhwsOXS3t4yQMo5G4UmMX8wyS3zt-LoH767aPEEUyeZU3FrVq9XcjZGNjbInRO1ZFWOG_MxFZqvDEDHSPIcM53SN22bBZu7zXtxVVsOsFK1iKJsPKxDEFcg7a7nr5dvd28QbzD-65WQPWn25yDYq5BS93mJT3AQXgMQstruf4H7-fUso4cOK9NxpYMHcF1ddiJI6NulB_71lxWt"
                                            />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-[#020617] p-1.5 rounded-full border border-cyan-500 shadow-lg z-20">
                                             <span className="material-symbols-outlined text-cyan-400 text-lg">code</span>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-white text-2xl font-bold leading-tight tracking-tight mb-2">Hoàng Đăng Quang</h3>
                                    <div className="px-3 py-1 rounded-full bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
                                        Lead Developer
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        "Kiến trúc sư trưởng của hệ thống, người biến những ý tưởng điên rồ thành dòng code thực thi."
                                    </p>
                                    
                                    <div className="mt-6 flex gap-3">
                                        <button className="p-2 rounded-full bg-white/5 hover:bg-cyan-500/20 text-cyan-400 transition-colors border border-white/5 hover:border-cyan-500/30">
                                            <span className="material-symbols-outlined text-lg">mail</span>
                                        </button>
                                        <button className="p-2 rounded-full bg-white/5 hover:bg-cyan-500/20 text-cyan-400 transition-colors border border-white/5 hover:border-cyan-500/30">
                                            <span className="material-symbols-outlined text-lg">link</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 sm:px-10 py-6 text-center bg-[#020617]/90 text-slate-400 border-t border-cyan-900/30 relative z-20">
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

export default React.memo(Team);