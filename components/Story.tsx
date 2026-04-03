
import React, { useEffect, useRef } from 'react';

interface StoryProps {
    onBack: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    onGoToFeatures?: () => void;
}

const Story: React.FC<StoryProps> = ({ onBack, onLogout, onShowFAQ, onShowAccount, onGoToFeatures }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let mouse = { x: -1000, y: -1000 };

        // Configuration
        const PARTICLE_COUNT = 120;
        
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
            size: number;
            speedX: number;
            speedY: number;
            opacity: number;
            color: string;
            angle: number;
            spinSpeed: number;

            constructor() {
                this.x = Math.random() * (canvas?.width || window.innerWidth);
                this.y = Math.random() * (canvas?.height || window.innerHeight);
                this.size = Math.random() * 3 + 0.5; // Varied sizes
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = Math.random() * -0.5 - 0.1; // Slowly rising
                this.opacity = Math.random() * 0.5 + 0.1;
                this.angle = Math.random() * Math.PI * 2;
                this.spinSpeed = (Math.random() - 0.5) * 0.02;
                
                // Warm Gold / Amber palette
                const colors = ['255, 215, 0', '218, 165, 32', '255, 223, 186', '255, 250, 205'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.speedX + Math.sin(this.angle) * 0.2;
                this.y += this.speedY;
                this.angle += this.spinSpeed;

                // Opacity pulse
                this.opacity += Math.sin(this.angle * 3) * 0.005;

                // Reset
                if (this.y < -10) {
                    this.y = (canvas?.height || window.innerHeight) + 10;
                    this.x = Math.random() * (canvas?.width || window.innerWidth);
                }
                if (this.x < -10) this.x = (canvas?.width || window.innerWidth) + 10;
                if (this.x > (canvas?.width || window.innerWidth) + 10) this.x = -10;
            }

            draw() {
                if (!ctx) return;
                
                // Calculate distance to mouse for "Candlelight" effect
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const lightRadius = 250;
                
                let renderOpacity = this.opacity;
                let renderSize = this.size;

                // Particles near mouse glow brighter and slightly larger
                if (distance < lightRadius) {
                    const illumination = 1 - (distance / lightRadius);
                    renderOpacity = Math.min(1, this.opacity + illumination * 0.5);
                    renderSize = this.size * (1 + illumination * 0.5);
                }

                ctx.beginPath();
                ctx.arc(this.x, this.y, renderSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color}, ${renderOpacity})`;
                
                // Add a glow to larger particles
                if (renderSize > 2) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = `rgba(${this.color}, 0.5)`;
                } else {
                    ctx.shadowBlur = 0;
                }
                
                ctx.fill();
                ctx.shadowBlur = 0; // Reset
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

            // Draw Mouse Light (Soft radial gradient following mouse)
            if (mouse.x > -100) {
                const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300);
                gradient.addColorStop(0, 'rgba(255, 200, 100, 0.08)'); // Very subtle warm glow
                gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas?.width || window.innerWidth, canvas?.height || window.innerHeight);
            }

            particles.forEach(p => {
                p.update();
                p.draw();
            });

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

    // Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.reveal-on-scroll');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden font-display">
            <style>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                .font-display { font-family: 'Space Grotesk', sans-serif; }
                
                @keyframes candle-flicker {
                    0%, 100% { opacity: 0.3; }
                    25% { opacity: 0.25; }
                    50% { opacity: 0.35; }
                    75% { opacity: 0.28; }
                }

                .reveal-on-scroll {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 1s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                
                .reveal-visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .parchment-glow {
                    box-shadow: 0 0 50px rgba(251, 191, 36, 0.15);
                }
                
                .text-shadow-gold {
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                }

                .image-sepia-hover {
                    filter: sepia(0.2) brightness(0.9);
                    transition: all 0.5s ease;
                }
                .image-sepia-hover:hover {
                    filter: sepia(0) brightness(1.05);
                    transform: scale(1.02);
                }
            `}</style>
            
            {/* Background Image Layer with Parallax-like fixed position */}
            <div className="fixed inset-0 z-0">
                <img 
                    className="h-full w-full object-cover opacity-80" 
                    alt="An ancient open leather book, with pages gently turned by water, illuminated by a soft light from above." 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkZ-HqeGzZMHGdfSBt0JfV_rHR7vV9XfKCnVaZ3kdF4Avbsa4WwnbjiX2lzmXNKOz_5n3EIdKqQ3vyq-ZoInXnVtkMXE-_7673QfeiYAdFDtkSZsLqWAqOi4mhGPuc4gRULCddpmQOmvrnow82EiRpgGqxmolthkjro2OxQSKY609IMfFfoUedX_P2MRMUDC3Nh-iMBhl0FqsQ8uCkC-C2OVku6yfiNh6XuJRtliHhCQhbDtrvFiV28rvKL1NhXDAZn-fxnf71BfaE"
                />
                {/* Warm Overlay mimicking candlelight/library atmosphere */}
                <div className="absolute inset-0 bg-[#2d1b0e]/70 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>
                
                {/* Subtle flicker overlay */}
                <div className="absolute inset-0 bg-amber-500/10 mix-blend-overlay pointer-events-none" style={{ animation: 'candle-flicker 4s infinite' }}></div>
            </div>
            
            {/* Particle Canvas */}
            <canvas 
                ref={canvasRef} 
                className="fixed inset-0 z-0 pointer-events-none"
            ></canvas>
            
            <div className="relative z-10 flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap px-6 sm:px-10 py-4 bg-gradient-to-b from-[#1a120b]/90 to-transparent backdrop-blur-[2px]">
                    <div className="flex items-center gap-3 text-white">
                        <span className="material-symbols-outlined text-3xl text-amber-400 drop-shadow-md">sailing</span>
                        <h2 className="text-xl font-bold tracking-[-0.015em] text-amber-50 drop-shadow-md">LearnAI</h2>
                    </div>
                    <div className="hidden md:flex flex-1 justify-center items-center gap-9">
                        <a 
                            className="text-amber-100/80 hover:text-amber-100 text-sm font-bold leading-normal cursor-pointer transition-colors"
                            onClick={(e) => { e.preventDefault(); if(onGoToFeatures) onGoToFeatures(); }}
                            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                        >
                            Tính năng
                        </a>
                        <a className="text-amber-100 text-sm font-bold leading-normal underline underline-offset-8 decoration-amber-500/50 cursor-pointer" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>Giới thiệu</a>
                        <a onClick={(e) => { e.preventDefault(); onShowFAQ(); }} className="text-amber-100/80 hover:text-amber-100 text-sm font-bold leading-normal cursor-pointer transition-colors" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>Hỏi đáp</a>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={onShowAccount}
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-[0_0_15px_rgba(217,119,6,0.4)] transition-all"
                        >
                            <span className="truncate">Tài khoản</span>
                        </button>
                        <button onClick={onLogout} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white/10 text-amber-50 text-sm font-bold leading-normal tracking-[0.015em] backdrop-blur-sm hover:bg-white/20 transition-colors border border-white/10">
                            <span className="truncate">Đăng xuất</span>
                        </button>
                    </div>
                </header>

                <main className="flex flex-1 flex-col items-start px-4 py-10 sm:py-20" ref={containerRef}>
                    <div className="w-full max-w-5xl mx-auto">
                        <button 
                            onClick={onBack}
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2.5 bg-[#1a120b]/60 text-amber-100 mb-8 ml-4 sm:ml-0 backdrop-blur-md hover:bg-[#1a120b]/80 transition-all border border-amber-500/20 shadow-lg group"
                        >
                            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            <span className="font-bold text-sm">Quay về</span>
                        </button>
                        
                        <div className="w-full rounded-2xl bg-[#0F0F0F]/60 backdrop-blur-xl shadow-2xl p-8 sm:p-14 border border-amber-500/10 parchment-glow reveal-on-scroll">
                            <div className="prose prose-lg max-w-none text-amber-100/90">
                                <div className="text-center mb-12">
                                    <span className="material-symbols-outlined text-6xl text-amber-400/80 mb-4 animate-pulse">auto_stories</span>
                                    <h1 className="text-4xl sm:text-5xl font-black !text-amber-50 tracking-tight mb-4 drop-shadow-md">Câu Chuyện Của Chúng Tôi</h1>
                                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mx-auto"></div>
                                </div>
                                
                                <p className="leading-relaxed text-lg sm:text-xl reveal-on-scroll" style={{ transitionDelay: '0.1s' }}>
                                    Hành trình của <span className="text-amber-400 font-bold">LearnAI</span> bắt đầu từ một ý tưởng đơn giản nhưng đầy tham vọng: tạo ra một nền tảng học tập không chỉ hiệu quả mà còn truyền cảm hứng. Chúng tôi muốn kết hợp sự kỷ luật của phương pháp lặp lại ngắt quãng với niềm vui khám phá của những trò chơi nhập vai.
                                </p>
                                
                                <div className="flex flex-col md:flex-row gap-10 my-12 reveal-on-scroll" style={{ transitionDelay: '0.2s' }}>
                                    <div className="flex-1 relative group">
                                        <div className="absolute inset-0 bg-amber-500/20 rounded-lg blur-md group-hover:bg-amber-500/30 transition-all duration-500"></div>
                                        <img 
                                            alt="Sketches of the initial app idea." 
                                            className="w-full h-auto rounded-lg shadow-2xl relative z-10 image-sepia-hover border border-white/10" 
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYD6ujaZioIfUV0bQS5xl6SyZ0PuLDgZ4RybNGMskcjN_6SEc3CWs9up1KQic2o8vFks0ZlT2epwEK6vOYDoPFHafoEY68BfeQZSfvsQHOcEpmxwuE9SRFESD_nsd34LJk-3vk47s5oMHszhNwlvDVU9M4PlcEFMIjK3xv-MB0Q8zfZiEU7prNbjdYF1DrQUProApsCQ2dvY5KOnpIp51lrWi5TuszAxKrfrINJSnTimWrl0DQpOvwxPNqUyiaX1WiMD0OXyg2dvV4"
                                        />
                                        <p className="text-xs text-center mt-2 text-amber-200/50 italic">Bản phác thảo đầu tiên - Năm 2023</p>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h3 className="!text-amber-200 font-bold text-2xl mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-amber-500">ink_pen</span>
                                            Giai đoạn hình thành
                                        </h3>
                                        <p className="leading-relaxed text-amber-100/80">
                                            Từ những bản phác thảo trên giấy nháp, chúng tôi đã đặt ra mục tiêu xây dựng một <span className="italic text-white">"con thuyền tri thức"</span>. Biển cả được chọn làm chủ đề chính, tượng trưng cho sự bao la của kiến thức và cuộc hành trình khám phá không ngừng nghỉ. Mỗi tính năng là một công cụ hàng hải, giúp bạn định hướng giữa đại dương thông tin.
                                        </p>
                                    </div>
                                </div>

                                <div className="reveal-on-scroll" style={{ transitionDelay: '0.3s' }}>
                                    <h3 className="!text-amber-200 font-bold text-2xl mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-amber-500">flag</span>
                                        Cột mốc quan trọng
                                    </h3>
                                    <p className="leading-relaxed text-amber-100/80 mb-8">
                                        Qua nhiều tháng phát triển, thử nghiệm và nhận phản hồi từ cộng đồng, LearnAI đã dần thành hình. Chúng tôi đã tích hợp công nghệ AI tiên tiến để cá nhân hóa lộ trình học, tạo ra các bài tập tương tác thông minh và cung cấp phản hồi tức thì.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center my-10 reveal-on-scroll" style={{ transitionDelay: '0.4s' }}>
                                    <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 border border-amber-500/10 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300 group">
                                        <span className="material-symbols-outlined text-5xl text-amber-500 mb-3 group-hover:scale-110 transition-transform">rocket_launch</span>
                                        <p className="text-sm font-bold text-amber-100">Ra mắt Beta</p>
                                    </div>
                                    <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 border border-amber-500/10 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300 group">
                                        <span className="material-symbols-outlined text-5xl text-amber-500 mb-3 group-hover:scale-110 transition-transform">group</span>
                                        <p className="text-sm font-bold text-amber-100">1,000+ Người dùng</p>
                                    </div>
                                    <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 border border-amber-500/10 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300 group">
                                        <span className="material-symbols-outlined text-5xl text-amber-500 mb-3 group-hover:scale-110 transition-transform">smart_toy</span>
                                        <p className="text-sm font-bold text-amber-100">AI Thế hệ mới</p>
                                    </div>
                                    <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 border border-amber-500/10 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300 group">
                                        <span className="material-symbols-outlined text-5xl text-amber-500 mb-3 group-hover:scale-110 transition-transform">trophy</span>
                                        <p className="text-sm font-bold text-amber-100">Top Giáo Dục</p>
                                    </div>
                                </div>

                                <div className="text-center mt-12 reveal-on-scroll" style={{ transitionDelay: '0.5s' }}>
                                    <p className="leading-relaxed font-medium text-xl text-amber-50 italic mb-6">
                                        "Hôm nay, chúng tôi tự hào mang đến cho bạn LearnAI - không chỉ là một ứng dụng, mà là một cuộc phiêu lưu."
                                    </p>
                                    <p className="text-amber-200/60 text-sm">
                                        Cảm ơn bạn đã là một phần trong câu chuyện của chúng tôi.
                                    </p>
                                    <div className="mt-8 flex justify-center">
                                        <span className="material-symbols-outlined text-4xl text-amber-500/50 animate-bounce">keyboard_double_arrow_down</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 sm:px-10 py-6 text-center bg-[#1a120b]/90 text-amber-100/80 relative z-20 border-t border-amber-500/10">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-2xl text-amber-500" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>sailing</span>
                        <h2 className="text-lg font-bold" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>LearnAI</h2>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-6 gap-y-2">
                        <a className="text-sm font-bold leading-normal cursor-pointer hover:text-amber-400 hover:underline transition-colors" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>Điều khoản dịch vụ</a>
                        <a className="text-sm font-bold leading-normal cursor-pointer hover:text-amber-400 hover:underline transition-colors" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>Chính sách bảo mật</a>
                    </div>
                    <p className="text-sm font-bold leading-normal">© 2024 LearnAI</p>
                </footer>
            </div>
        </div>
    );
};

export default React.memo(Story);