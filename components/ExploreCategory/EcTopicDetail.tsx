
import React from 'react';

// 1. PlanetHeroSection
export const PlanetHeroSection: React.FC = () => (
    <div className="relative h-64 w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-blue-900/80 z-10"></div>
        <img src="https://images.unsplash.com/photo-1614730341194-75c60740a2d3?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000" alt="Planet" />
        <div className="absolute inset-0 z-20 flex items-center p-8 gap-8">
            <div className="w-32 h-32 rounded-full bg-black/30 backdrop-blur-xl border-2 border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] animate-float">
                <span className="material-symbols-outlined text-6xl text-purple-300">science</span>
            </div>
            <div>
                <h1 className="text-4xl font-black text-white mb-2 drop-shadow-lg">Quantum Physics 101</h1>
                <p className="text-lg text-slate-200 max-w-xl">Khám phá các nguyên lý cơ bản của cơ học lượng tử, từ lưỡng tính sóng-hạt đến sự vướng víu lượng tử.</p>
            </div>
        </div>
    </div>
);

// 2. OrbitProgressBar
export const OrbitProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
            <circle cx="64" cy="64" r="58" fill="none" stroke="#1e293b" strokeWidth="8" />
            <circle cx="64" cy="64" r="58" fill="none" stroke="#22d3ee" strokeWidth="8" strokeDasharray="365" strokeDashoffset={365 - (365 * progress) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-black text-white">{progress}%</span>
            <span className="text-[10px] text-cyan-400 uppercase font-bold">Orbit</span>
        </div>
    </div>
);

// 3. LoreTextContainer
export const LoreTextContainer: React.FC = () => (
    <div className="prose prose-invert prose-lg max-w-none p-6 bg-white/5 rounded-2xl border border-white/10 shadow-lg">
        <h3 className="text-cyan-300">Chương 1: Sự khởi đầu</h3>
        <p className="text-slate-300 leading-relaxed">
            Vào đầu thế kỷ 20, các nhà vật lý bắt đầu nhận thấy rằng ánh sáng và vật chất cư xử theo những cách kỳ lạ không thể giải thích bằng vật lý cổ điển. Điều này dẫn đến sự ra đời của <strong className="text-white bg-purple-500/20 px-1 rounded">Cơ học lượng tử</strong>.
        </p>
    </div>
);

// 4. SatelliteResources
export const SatelliteResources: React.FC = () => (
    <div className="w-64 bg-[#0f172a] border-l border-white/10 p-4 space-y-4 h-full">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Vệ tinh Tài liệu</h4>
        {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 hover:translate-x-1 transition-all cursor-pointer group">
                <span className="material-symbols-outlined text-red-400 group-hover:scale-110 transition-transform">picture_as_pdf</span>
                <div>
                    <div className="text-xs font-bold text-slate-200">Lecture_Note_{i}.pdf</div>
                    <div className="text-[10px] text-slate-500">2.4 MB</div>
                </div>
            </div>
        ))}
    </div>
);

// 5. IgnitionButton
export const IgnitionButton: React.FC = () => (
    <button className="group relative px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-full font-black text-white uppercase tracking-widest shadow-[0_0_20px_rgba(234,88,12,0.5)] hover:shadow-[0_0_40px_rgba(234,88,12,0.8)] hover:scale-105 transition-all overflow-hidden">
        <span className="relative z-10 flex items-center gap-2">
            <span className="material-symbols-outlined animate-bounce">rocket_launch</span>
            Ignition (Bắt đầu)
        </span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
    </button>
);

// 6. GravityDifficultyMeter
export const GravityDifficultyMeter: React.FC<{ level: 1|2|3|4|5 }> = ({ level }) => (
    <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Low G</span>
            <span>Singularity</span>
        </div>
        <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
                <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${i <= level ? (level > 3 ? 'bg-red-500' : 'bg-cyan-500') : 'bg-slate-800'}`}></div>
            ))}
        </div>
    </div>
);

// 7. TimeDilationTimer
export const TimeDilationTimer: React.FC = () => (
    <div className="flex items-center gap-2 bg-black/40 border border-cyan-500/30 rounded-lg px-3 py-1.5 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
        <span className="material-symbols-outlined text-cyan-400 text-sm animate-spin-slow">hourglass_top</span>
        <span className="font-mono text-cyan-300 font-bold">14:59</span>
    </div>
);

// 8. FlagPlantingBookmark
export const FlagPlantingBookmark: React.FC = () => (
    <button className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 border border-transparent hover:border-yellow-400/50 transition-all group" title="Cắm cờ (Lưu)">
        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">flag</span>
    </button>
);

// 9. PrerequisiteGateway
export const PrerequisiteGateway: React.FC = () => (
    <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-4 opacity-80 cursor-not-allowed grayscale-[50%]">
        <div className="p-3 bg-red-900/50 rounded-full text-red-400"><span className="material-symbols-outlined">lock</span></div>
        <div className="flex-1">
            <h4 className="text-red-200 font-bold text-sm">Khu vực bị khóa</h4>
            <p className="text-xs text-red-300/70">Hoàn thành "Đại số tuyến tính" để mở khóa hành tinh này.</p>
        </div>
    </div>
);

// 10. NextDestinationPreview
export const NextDestinationPreview: React.FC = () => (
    <div className="mt-8 p-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 cursor-pointer hover:scale-[1.01] transition-transform">
        <div className="bg-[#0f172a] rounded-xl p-4 flex justify-between items-center">
            <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Điểm đến tiếp theo</span>
                <h3 className="text-lg font-bold text-white">Thuyết Tương Đối Hẹp</h3>
            </div>
            <span className="material-symbols-outlined text-white text-2xl">arrow_forward</span>
        </div>
    </div>
);
