
import React, { useState, useEffect, useRef } from 'react';
import { ActiveGuide, GUIDE_CONTENT } from './GuideSystem';

interface UserGuideProps {
    onBack: () => void;
    onNavigateToFeature: (feature: string) => void;
}

// --- VISUAL UTILS (Particles) ---
const FloatingParticles = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        const particles: any[] = [];
        
        for(let i=0; i<50; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 2,
                dx: (Math.random() - 0.5) * 0.5,
                dy: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.x += p.dx;
                p.y += p.dy;
                if(p.x < 0) p.x = width; if(p.x > width) p.x = 0;
                if(p.y < 0) p.y = height; if(p.y > height) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
                ctx.fillStyle = `rgba(34, 211, 238, ${p.opacity})`;
                ctx.fill();
            });
            requestAnimationFrame(animate);
        };
        animate();
        
        const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);
    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30 z-0" />;
};

// --- FEATURE CARD COMPONENT (With ActiveGuide Integration) ---

interface FeatureCardProps {
    title: string;
    desc: string;
    icon: string;
    color: string;
    delay?: number;
    guideKey: keyof typeof GUIDE_CONTENT; // Link to guide data
    onNavigate: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, desc, icon, color, delay = 0, guideKey, onNavigate }) => {
    const [showGuide, setShowGuide] = useState(false);

    return (
        <>
            <button 
                onClick={() => setShowGuide(true)}
                className={`flex items-start gap-4 p-5 rounded-2xl bg-[#1e293b]/50 border border-white/5 hover:border-${color}-500/50 hover:bg-white/5 transition-all text-left group animate-[fadeInUp_0.5s] relative overflow-hidden`}
                style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
            >
                {/* Glow Effect */}
                <div className={`absolute -right-10 -bottom-10 w-32 h-32 bg-${color}-500/20 rounded-full blur-2xl group-hover:bg-${color}-500/30 transition-colors pointer-events-none`}></div>
                
                <div className={`p-3 rounded-xl bg-${color}-900/20 text-${color}-400 group-hover:scale-110 transition-transform relative z-10 border border-${color}-500/20`}>
                    <span className="material-symbols-outlined text-2xl">{icon}</span>
                </div>
                <div className="relative z-10 flex-1">
                    <h4 className={`font-bold text-white text-lg group-hover:text-${color}-300 transition-colors mb-1`}>{title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-white transition-colors">
                        <span>Xem hướng dẫn</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </div>
                </div>
            </button>

            {/* The Active Guide Popup */}
            <ActiveGuide 
                guideKey={guideKey} 
                isOpen={showGuide} 
                onClose={() => setShowGuide(false)} 
                onNavigate={onNavigate}
            />
        </>
    );
};

// --- SECTIONS ---

const IntroSection = ({ onNavigateToFeature }: { onNavigateToFeature: (f: string) => void }) => (
    <div className="space-y-8 relative">
        <div className="relative p-8 rounded-3xl bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 overflow-hidden text-center md:text-left animate-[fadeIn_0.5s]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300 drop-shadow-md">
                        Học Viện LearnAI
                    </h2>
                    <p className="text-lg text-slate-300 leading-relaxed">
                        Khám phá sức mạnh của <strong className="text-cyan-400">Hệ Điều Hành Tri Thức</strong>. Chọn một tính năng bên dưới để xem hướng dẫn chi tiết (Interactive Tour).
                    </p>
                </div>
                <div className="w-full md:w-1/3 aspect-video bg-black/40 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-50"></div>
                     <span className="material-symbols-outlined text-6xl text-cyan-400 animate-float">rocket_launch</span>
                </div>
            </div>
        </div>

        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-2 border-l-2 border-cyan-500">Tính năng nổi bật</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard 
                title="Giả Kim Thuật (Alchemy)" 
                desc="Biến dữ liệu thô thành bài học tinh gọn." 
                icon="science" 
                color="purple" 
                delay={100}
                guideKey="alchemy"
                onNavigate={() => onNavigateToFeature('alchemy')} 
            />
            <FeatureCard 
                title="Sơ Đồ Tri Thức (Graph)" 
                desc="Bản đồ tư duy liên kết vạn vật." 
                icon="hub" 
                color="cyan" 
                delay={200}
                guideKey="graph"
                onNavigate={() => onNavigateToFeature('explore-graph')} 
            />
            <FeatureCard 
                title="Gia Sư AI (Tutor)" 
                desc="Đối thoại Socratic & Tranh biện." 
                icon="psychology_alt" 
                color="green" 
                delay={300}
                guideKey="tutor"
                onNavigate={() => onNavigateToFeature('tutor')} 
            />
            <FeatureCard 
                title="Cộng Đồng & Rank" 
                desc="Thi đấu và chia sẻ tài nguyên." 
                icon="diversity_3" 
                color="pink" 
                delay={400}
                guideKey="community"
                onNavigate={() => onNavigateToFeature('community')} 
            />
        </div>
    </div>
);

// --- MAIN COMPONENT ---

export const UserGuide: React.FC<UserGuideProps> = ({ onBack, onNavigateToFeature }) => {
    const [activeCategory, setActiveCategory] = useState<'start' | 'create' | 'store' | 'learn' | 'social'>('start');

    const renderCategoryContent = () => {
        switch(activeCategory) {
            case 'start':
                return (
                    <div className="space-y-12">
                        <IntroSection onNavigateToFeature={onNavigateToFeature} />
                        <div className="h-px bg-white/10 w-full"></div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-2 border-l-2 border-blue-500">Khởi động</h3>
                        <FeatureCard 
                            title="Dashboard (Bảng Điều Khiển)" 
                            desc="Trung tâm chỉ huy, theo dõi streak và sức khỏe tri thức."
                            icon="dashboard" 
                            color="blue"
                            guideKey="dashboard"
                            onNavigate={() => onNavigateToFeature('dashboard')}
                        />
                    </div>
                );
            case 'create':
                return (
                    <div className="space-y-6">
                         <div className="mb-6">
                            <h2 className="text-3xl font-black text-white mb-2">Sáng Tạo & Nhập Liệu</h2>
                            <p className="text-slate-400">Biến mọi nguồn dữ liệu thành kiến thức.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <FeatureCard 
                                title="Giả Kim Thuật (Alchemy)" 
                                desc="Xử lý đa phương tiện (Youtube, PDF, Voice) thành Flashcards." 
                                icon="science" 
                                color="purple"
                                guideKey="alchemy"
                                onNavigate={() => onNavigateToFeature('alchemy')}
                            />
                            <FeatureCard 
                                title="Phòng Ghi Chú (NoteLab)" 
                                desc="Ghi chú thông minh với AI Deep Think." 
                                icon="edit_note" 
                                color="indigo"
                                guideKey="notelab"
                                onNavigate={() => onNavigateToFeature('media')}
                            />
                            <FeatureCard 
                                title="Xưởng Vẽ (DrawEverything)" 
                                desc="Bảng trắng vô tận tích hợp AI Vision." 
                                icon="brush" 
                                color="amber"
                                guideKey="draw"
                                onNavigate={() => onNavigateToFeature('draw')}
                            />
                        </div>
                    </div>
                );
            case 'store':
                return (
                    <div className="space-y-6">
                         <div className="mb-6">
                            <h2 className="text-3xl font-black text-white mb-2">Lưu Trữ & Trực Quan</h2>
                            <p className="text-slate-400">Quản lý kho tàng tri thức của bạn.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <FeatureCard 
                                title="Sơ Đồ Tri Thức (Graph)" 
                                desc="Trực quan hóa các khái niệm và mối liên hệ." 
                                icon="hub" 
                                color="cyan"
                                guideKey="graph"
                                onNavigate={() => onNavigateToFeature('explore-graph')}
                            />
                            <FeatureCard 
                                title="Drive Storage" 
                                desc="Lưu trữ tài liệu và nhúng vào bài học." 
                                icon="folder_open" 
                                color="blue"
                                guideKey="drive"
                                onNavigate={() => onNavigateToFeature('drive')}
                            />
                        </div>
                    </div>
                );
            case 'learn':
                return (
                    <div className="space-y-6">
                        <div className="mb-6">
                            <h2 className="text-3xl font-black text-white mb-2">Học Tập & Ôn Luyện</h2>
                            <p className="text-slate-400">Tương tác sâu để ghi nhớ lâu dài.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <FeatureCard 
                                title="Gia Sư Biện Chứng" 
                                desc="Đối thoại Socratic 1-1 với AI." 
                                icon="school" 
                                color="green"
                                guideKey="tutor"
                                onNavigate={() => onNavigateToFeature('tutor')}
                            />
                             <FeatureCard 
                                title="Ôn Tập Cấp Tốc (Cram)" 
                                desc="Học nhanh cho kỳ thi (Pareto 80/20)." 
                                icon="bolt" 
                                color="yellow"
                                guideKey="cram"
                                onNavigate={() => onNavigateToFeature('video')} // Assuming video course or cram nav
                            />
                        </div>
                    </div>
                );
            case 'social':
                return (
                    <div className="space-y-6">
                         <div className="mb-6">
                            <h2 className="text-3xl font-black text-white mb-2">Xã Hội & Quản Lý</h2>
                            <p className="text-slate-400">Kết nối cộng đồng và quản lý bản thân.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                             <FeatureCard 
                                title="Cộng Đồng & Đấu Trường" 
                                desc="Leo rank, thi đấu và chia sẻ tài nguyên." 
                                icon="diversity_3" 
                                color="pink"
                                guideKey="community"
                                onNavigate={() => onNavigateToFeature('community')}
                            />
                            <FeatureCard 
                                title="Quản Lý Nhiệm Vụ (Todo)" 
                                desc="GTD, Pomodoro và lập kế hoạch." 
                                icon="check_circle" 
                                color="teal"
                                guideKey="digest" // Using digest key for Todo guide
                                onNavigate={() => onNavigateToFeature('digest')}
                            />
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    const NavButton = ({ id, icon, label, color }: any) => (
        <button
            onClick={() => setActiveCategory(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden group ${
                activeCategory === id 
                ? `bg-${color}-600/20 text-${color}-300 border border-${color}-500/30 shadow-[0_0_15px_rgba(0,0,0,0.2)]` 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
        >
            <span className={`material-symbols-outlined text-lg relative z-10 ${activeCategory === id ? 'animate-pulse' : ''}`}>{icon}</span>
            <span className="text-sm font-bold relative z-10">{label}</span>
            {activeCategory === id && <div className={`absolute left-0 top-0 h-full w-1 bg-${color}-400`}></div>}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-display flex flex-col relative overflow-hidden">
            {/* Ambient Background */}
            <FloatingParticles />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Header */}
            <header className="relative z-20 h-16 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-slate-400 hover:text-white">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                            <span className="material-symbols-outlined text-xl">local_library</span>
                        </div>
                        <h1 className="text-lg font-bold text-white uppercase tracking-wider">Học Viện LearnAI</h1>
                    </div>
                </div>
                <div className="text-xs text-slate-500 font-mono hidden sm:block">
                    MANUAL V3.0 • INTERACTIVE
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative z-10">
                {/* Sidebar */}
                <aside className="w-64 bg-[#0b1120]/80 backdrop-blur-md border-r border-white/10 hidden md:flex flex-col">
                    <div className="p-4 space-y-2">
                        <NavButton id="start" icon="flag" label="Khởi Động" color="blue" />
                        <NavButton id="create" icon="design_services" label="Sáng Tạo" color="purple" />
                        <NavButton id="store" icon="inventory_2" label="Lưu Trữ" color="cyan" />
                        <NavButton id="learn" icon="school" label="Học Tập" color="green" />
                        <NavButton id="social" icon="public" label="Xã Hội & Task" color="pink" />
                    </div>

                    <div className="mt-auto p-6">
                        <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-4 rounded-2xl border border-white/10 text-center">
                            <span className="material-symbols-outlined text-3xl text-yellow-400 mb-2">emoji_objects</span>
                            <p className="text-xs text-slate-300 mb-3">Bạn có thắc mắc?</p>
                            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white transition-colors">
                                Xem FAQ
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
                    <div className="max-w-4xl mx-auto pb-20">
                        {renderCategoryContent()}
                    </div>
                </main>

                {/* Mobile Nav */}
                <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#0b1120]/95 backdrop-blur-xl border-t border-white/10 flex justify-around p-2 z-50 overflow-x-auto">
                    {[
                        { id: 'start', icon: 'flag' },
                        { id: 'create', icon: 'edit' },
                        { id: 'store', icon: 'folder' },
                        { id: 'learn', icon: 'school' },
                        { id: 'social', icon: 'group' }
                    ].map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveCategory(item.id as any)}
                            className={`p-3 rounded-lg flex flex-col items-center ${activeCategory === item.id ? 'text-cyan-400' : 'text-slate-500'}`}
                        >
                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default React.memo(UserGuide);
