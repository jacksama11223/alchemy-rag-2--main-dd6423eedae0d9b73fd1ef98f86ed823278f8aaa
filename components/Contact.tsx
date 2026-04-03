
import React, { useEffect, useRef } from 'react';

interface ContactProps {
    onBack: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    onGoToFeatures?: () => void;
}

const Contact: React.FC<ContactProps> = ({ onBack, onLogout, onShowFAQ, onShowAccount, onGoToFeatures }) => {
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
        const CONNECT_DISTANCE = 110;
        const MOUSE_RADIUS = 150;

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
            baseX: number;
            baseY: number;
            density: number;
            color: string;

            constructor() {
                this.x = Math.random() * (canvas?.width || window.innerWidth);
                this.y = Math.random() * (canvas?.height || window.innerHeight);
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
                this.density = (Math.random() * 30) + 1;
                this.baseX = this.x;
                this.baseY = this.y;
                // Cyan / Blue / White mix
                const colors = ['rgba(34, 211, 238,', 'rgba(14, 165, 233,', 'rgba(255, 255, 255,'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > (canvas?.width || window.innerWidth)) this.vx *= -1;
                if (this.y < 0 || this.y > (canvas?.height || window.innerHeight)) this.vy *= -1;

                // Mouse interaction
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < MOUSE_RADIUS) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const maxDistance = MOUSE_RADIUS;
                    const force = (maxDistance - distance) / maxDistance;
                    const directionX = forceDirectionX * force * this.density * 0.6;
                    const directionY = forceDirectionY * force * this.density * 0.6;
                    
                    // Repel slightly
                    this.x -= directionX;
                    this.y -= directionY;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `${this.color} 0.8)`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = `${this.color} 0.5)`;
                ctx.fill();
                ctx.shadowBlur = 0;
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

                // Connect particles
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < CONNECT_DISTANCE) {
                        ctx.beginPath();
                        const opacity = 1 - (distance / CONNECT_DISTANCE);
                        ctx.strokeStyle = `${particles[i].color} ${opacity * 0.3})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
                
                // Connect to mouse
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < MOUSE_RADIUS) {
                     ctx.beginPath();
                     const opacity = 1 - (distance / MOUSE_RADIUS);
                     ctx.strokeStyle = `${particles[i].color} ${opacity * 0.4})`;
                     ctx.lineWidth = 0.5;
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
                
                @keyframes float-bottle {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-5px) rotate(1deg); }
                    50% { transform: translateY(0) rotate(0deg); }
                    75% { transform: translateY(5px) rotate(-1deg); }
                }

                @keyframes glow-pulse-contact {
                    0%, 100% { box-shadow: 0 0 15px rgba(34, 211, 238, 0.2); }
                    50% { box-shadow: 0 0 30px rgba(34, 211, 238, 0.5); }
                }

                .glass-card-contact {
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                }

                .glass-input {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    transition: all 0.3s ease;
                }
                .glass-input:focus {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(34, 211, 238, 0.6);
                    box-shadow: 0 0 15px rgba(34, 211, 238, 0.2);
                    outline: none;
                }
                .glass-input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }

                .icon-circle {
                    background: linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(14, 165, 233, 0.1));
                    border: 1px solid rgba(34, 211, 238, 0.3);
                    box-shadow: 0 0 10px rgba(34, 211, 238, 0.1);
                }
            `}</style>
            
            {/* Background Layer */}
            <div className="fixed inset-0 z-0">
                <img 
                    className="h-full w-full object-cover transition-transform duration-[40s] ease-in-out hover:scale-110" 
                    alt="A message in a glass bottle floating gently on a calm blue sea." 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUdQmGDFRKQyhi0C_W7-hHqeUI9LW5dSgK8NRz_rqL-FHyFisfWsDhy2a4rQNuIwqQ6xNLZKvFGFEkSZJOsgUHfm_JdLuUIbVyD8DmUJngZYZulnl0baE-mkB35xFAZO4lIIIvP7qZi_rdNJxsymnLn1Wpd8l7WeZ_MqWjxm9y73515fPnj-EQz-8WEmLBhEL8xhY0miV-pTFk1hsZjGCKpctJiYhEqhRyddon62a49kxROPbx61eIBJyMjqx5TLVPel5GZvyDMOJN"
                />
                {/* Dark Blue Overlay to make particles pop */}
                <div className="absolute inset-0 bg-[#020617]/70 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent"></div>
            </div>
            
            {/* Particle Canvas */}
            <canvas 
                ref={canvasRef} 
                className="fixed inset-0 z-0 pointer-events-none"
            ></canvas>
            
            <div className="relative z-10 flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap px-6 sm:px-10 py-4 bg-gradient-to-b from-[#020617]/80 to-transparent backdrop-blur-[2px]">
                    <div className="flex items-center gap-3 text-white">
                        <span className="material-symbols-outlined text-3xl text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">sailing</span>
                        <h2 className="text-xl font-bold tracking-[-0.015em] drop-shadow-md">LearnAI</h2>
                    </div>
                    <div className="hidden md:flex flex-1 justify-center items-center gap-9">
                        <a 
                            className="text-white/80 hover:text-cyan-300 text-sm font-bold leading-normal transition-all duration-300 hover:drop-shadow-[0_0_5px_rgba(34,211,238,0.5)] cursor-pointer"
                            onClick={(e) => { e.preventDefault(); if(onGoToFeatures) onGoToFeatures(); }}
                        >
                            Tính năng
                        </a>
                        <a className="text-cyan-300 text-sm font-bold leading-normal underline underline-offset-8 decoration-cyan-500/50 decoration-2" href="#">Giới thiệu</a>
                        <a onClick={(e) => { e.preventDefault(); onShowFAQ(); }} className="text-white/80 hover:text-cyan-300 text-sm font-bold leading-normal transition-all duration-300 hover:drop-shadow-[0_0_5px_rgba(34,211,238,0.5)] cursor-pointer" href="#">Hỏi đáp</a>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={onShowAccount}
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-cyan-600/90 text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-[0_0_15px_rgba(8,145,178,0.4)] hover:bg-cyan-500 transition-all border border-cyan-400/30"
                        >
                            <span className="truncate">Tài khoản</span>
                        </button>
                        <button onClick={onLogout} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white/5 text-white text-sm font-bold leading-normal tracking-[0.015em] backdrop-blur-md hover:bg-white/10 transition-colors border border-white/10">
                            <span className="truncate">Đăng xuất</span>
                        </button>
                    </div>
                </header>

                <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-20">
                    <div className="w-full max-w-5xl">
                        <button 
                            onClick={onBack}
                            className="group flex cursor-pointer items-center justify-center rounded-full h-10 px-5 bg-[#0F172A]/50 text-cyan-100 mb-8 border border-white/10 hover:bg-[#0F172A]/80 hover:border-cyan-500/50 transition-all shadow-lg backdrop-blur-sm"
                        >
                            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform text-lg mr-2">arrow_back</span>
                            <span className="text-sm font-bold">Quay về</span>
                        </button>
                        
                        <div 
                            className="w-full rounded-2xl glass-card-contact p-8 sm:p-12 relative overflow-hidden"
                            style={{ animation: 'float-bottle 8s ease-in-out infinite' }}
                        >
                            {/* Glow effects inside card */}
                            <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>

                            <div className="text-center mb-12 relative z-10">
                                <h1 className="text-white text-3xl sm:text-5xl font-black leading-tight tracking-[-0.033em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                                    Gửi Tín Hiệu <span className="text-cyan-400">SOS</span>
                                </h1>
                                <p className="text-cyan-100/70 text-sm sm:text-base font-normal leading-normal mt-4 max-w-2xl mx-auto">
                                    Bạn đang trôi dạt giữa đại dương kiến thức? Đừng lo, hãy gửi tin nhắn vào chai và đội ngũ cứu hộ LearnAI sẽ phản hồi sớm nhất!
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                                <div className="flex flex-col gap-8 justify-center">
                                    <div className="group flex items-center gap-5 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full icon-circle text-cyan-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                                            <span className="material-symbols-outlined text-2xl">alternate_email</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg mb-1 group-hover:text-cyan-300 transition-colors">Email Hỗ Trợ</h3>
                                            <p className="text-sm text-slate-300">jacktayden@gmail.com</p>
                                        </div>
                                    </div>
                                    <div className="group flex items-center gap-5 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full icon-circle text-cyan-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                                            <span className="material-symbols-outlined text-2xl">call</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg mb-1 group-hover:text-cyan-300 transition-colors">Điện Thoại</h3>
                                            <p className="text-sm text-slate-300">(+84) 794503705</p>
                                        </div>
                                    </div>
                                    <div className="group flex items-center gap-5 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full icon-circle text-cyan-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                                            <span className="material-symbols-outlined text-2xl">location_on</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg mb-1 group-hover:text-cyan-300 transition-colors">Trạm Hải Đăng</h3>
                                            <p className="text-sm text-slate-300">732 Lê Hồng Phong, P.Phước Long, TP.Nha Trang</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <form className="flex flex-col gap-5 bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
                                    <div>
                                        <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 block ml-1" htmlFor="name">Thuyền viên</label>
                                        <input 
                                            className="w-full rounded-lg glass-input px-4 py-3 text-sm placeholder:text-slate-500" 
                                            id="name" 
                                            placeholder="Tên của bạn" 
                                            type="text"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 block ml-1" htmlFor="email">Tần số liên lạc</label>
                                        <input 
                                            className="w-full rounded-lg glass-input px-4 py-3 text-sm placeholder:text-slate-500" 
                                            id="email" 
                                            placeholder="Email của bạn" 
                                            type="email"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 block ml-1" htmlFor="message">Thông điệp</label>
                                        <textarea 
                                            className="w-full rounded-lg glass-input px-4 py-3 text-sm placeholder:text-slate-500" 
                                            id="message" 
                                            placeholder="Nội dung tin nhắn..." 
                                            rows={4}
                                        ></textarea>
                                    </div>
                                    <button className="group flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-95 border border-cyan-400/30">
                                        <span className="material-symbols-outlined group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300">send</span>
                                        <span className="truncate">Thả Trôi Tin Nhắn</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
                
                <footer className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 sm:px-10 py-6 text-center bg-[#020617]/90 text-slate-400 relative z-20 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-2xl text-cyan-500">sailing</span>
                        <h2 className="text-lg font-bold text-cyan-100/50">LearnAI</h2>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-6 gap-y-2">
                        <a className="text-sm font-bold leading-normal hover:text-cyan-400 transition-colors cursor-pointer" href="#">Điều khoản dịch vụ</a>
                        <a className="text-sm font-bold leading-normal hover:text-cyan-400 transition-colors cursor-pointer" href="#">Chính sách bảo mật</a>
                    </div>
                    <p className="text-sm font-bold leading-normal">© 2024 LearnAI</p>
                </footer>
            </div>
        </div>
    );
};

export default React.memo(Contact);