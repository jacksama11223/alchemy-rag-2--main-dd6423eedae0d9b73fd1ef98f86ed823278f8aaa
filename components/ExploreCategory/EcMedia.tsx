
import React from 'react';

// 1. MonolithCodeBlock
export const MonolithCodeBlock: React.FC<{ code: string, lang: string }> = ({ code, lang }) => (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-700 bg-[#0d1117] shadow-2xl">
        <div className="flex justify-between items-center px-4 py-2 bg-[#161b22] border-b border-slate-700">
            <span className="text-xs font-mono text-slate-400">{lang}</span>
            <button className="text-slate-400 hover:text-white"><span className="material-symbols-outlined text-sm">content_copy</span></button>
        </div>
        <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
            <code>{code}</code>
        </pre>
    </div>
);

// 2. HoloProjectorVideo
export const HoloProjectorVideo: React.FC = () => (
    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] group cursor-pointer">
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl text-cyan-400 ml-1">play_arrow</span>
            </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
            <div className="h-full w-1/3 bg-cyan-500 shadow-[0_0_10px_cyan]"></div>
        </div>
        <div className="absolute top-4 left-4 text-xs font-bold text-cyan-300 uppercase tracking-widest bg-black/60 px-2 py-1 rounded">Holo-Stream</div>
    </div>
);

// 3. FlashcardFlipView
export const FlashcardFlipView: React.FC = () => (
    <div className="w-full max-w-md mx-auto aspect-[3/2] bg-[#1e293b] rounded-2xl border-2 border-white/10 shadow-xl flex items-center justify-center p-8 text-center cursor-pointer hover:-translate-y-1 transition-transform relative group perspective">
        <div className="absolute top-4 right-4 text-slate-500 text-xs font-bold">1/20</div>
        <div>
            <h3 className="text-2xl font-bold text-white mb-2">Event Horizon</h3>
            <p className="text-sm text-slate-400">Click để lật thẻ</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
);

// 4. AudioWavePlayer
export const AudioWavePlayer: React.FC = () => (
    <div className="flex items-center gap-3 bg-[#1e1e1e] p-3 rounded-full border border-white/10 shadow-lg w-full max-w-sm">
        <button className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white hover:bg-cyan-500">
            <span className="material-symbols-outlined text-sm">play_arrow</span>
        </button>
        <div className="flex-1 h-8 flex items-center gap-0.5 opacity-50">
            {[...Array(20)].map((_, i) => (
                <div key={i} className="w-1 bg-cyan-400 rounded-full" style={{ height: `${Math.random() * 100}%` }}></div>
            ))}
        </div>
        <span className="text-[10px] font-mono text-slate-400">02:14</span>
    </div>
);

// 5. FormulaEquationRenderer
export const FormulaEquationRenderer: React.FC<{ formula: string }> = ({ formula }) => (
    <div className="my-4 p-4 bg-white/5 rounded-xl text-center font-serif text-xl text-slate-200 italic border border-white/5">
        {formula}
    </div>
);

// 6. InteractiveQuizWidget
export const InteractiveQuizWidget: React.FC = () => (
    <div className="my-6 bg-[#0f172a] border border-blue-500/30 rounded-xl p-6">
        <h4 className="text-sm font-bold text-blue-300 uppercase mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">quiz</span> Quick Check
        </h4>
        <p className="text-white font-medium mb-4">Đơn vị đo lường khoảng cách trong thiên văn học là gì?</p>
        <div className="grid grid-cols-1 gap-2">
            <button className="text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-sm transition-colors">A. Kilomet</button>
            <button className="text-left px-4 py-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 text-sm font-bold">B. Năm ánh sáng (Light Year)</button>
            <button className="text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-sm transition-colors">C. Hải lý</button>
        </div>
    </div>
);

// 7. PomodoroTimerWidget (Mini)
export const PomodoroTimerWidget: React.FC = () => (
    <div className="fixed top-24 right-4 z-30 bg-black/60 backdrop-blur border border-red-500/30 rounded-full px-4 py-2 flex items-center gap-2 shadow-xl">
        <span className="material-symbols-outlined text-red-400 text-sm">timer</span>
        <span className="font-mono font-bold text-white">24:59</span>
    </div>
);

// 8. NotesOverlay
export const NotesOverlay: React.FC = () => (
    <div className="fixed top-1/4 right-4 z-30 w-48 bg-yellow-200/90 text-slate-900 p-4 rounded shadow-2xl rotate-1 hover:rotate-0 transition-transform origin-top-right cursor-text">
        <div className="text-[10px] font-bold opacity-50 uppercase mb-1">Ghi chú nhanh</div>
        <textarea className="w-full h-24 bg-transparent border-none resize-none outline-none text-xs font-medium" placeholder="Nhập ghi chú..."></textarea>
    </div>
);

// 9. DictionaryLookupTool
export const DictionaryLookupTool: React.FC = () => (
    <div className="absolute bg-[#1e1e1e] text-white p-3 rounded-xl shadow-2xl border border-white/20 z-50 w-64 -mt-20 ml-10">
        <div className="flex justify-between items-start mb-1">
            <h5 className="font-bold text-sm">Singularity</h5>
            <span className="text-[10px] text-slate-500">n.</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">Điểm kỳ dị: Một điểm trong không thời gian nơi mật độ vật chất trở nên vô hạn.</p>
    </div>
);

// 10. ZenModeToggle
export const ZenModeToggle: React.FC<{ active: boolean, onToggle: () => void }> = ({ active, onToggle }) => (
    <button 
        onClick={onToggle}
        className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all ${active ? 'bg-white text-black' : 'bg-[#1e1e1e] text-slate-400 hover:text-white border border-white/10'}`}
        title="Zen Mode"
    >
        <span className="material-symbols-outlined">{active ? 'close_fullscreen' : 'self_improvement'}</span>
    </button>
);
