
import React from 'react';

// 6. TelepresenceCursor
export const TelepresenceCursor: React.FC<{ x: number, y: number, name: string, color: string }> = ({ x, y, name, color }) => (
    <div 
        className="absolute pointer-events-none z-[100] transition-all duration-100 ease-linear"
        style={{ left: x, top: y }}
    >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-12">
            <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19138L11.7841 12.3673H5.65376Z" fill={color} stroke="white" strokeWidth="1"/>
        </svg>
        <span className="absolute left-4 top-2 px-1.5 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-sm" style={{ backgroundColor: color }}>
            {name}
        </span>
    </div>
);

// 7. HoloTableWhiteboard
export const HoloTableWhiteboard: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-xl flex flex-col animate-fade-in">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f172a]">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-cyan-400">draw</span> Holo-Whiteboard
                </h3>
                <div className="flex gap-4">
                    <div className="flex -space-x-2">
                        {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-[#0f172a]"></div>)}
                    </div>
                    <button onClick={onClose}><span className="material-symbols-outlined text-slate-400 hover:text-white">close</span></button>
                </div>
            </div>
            <div className="flex-1 relative cursor-crosshair bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px]">
                {/* Mock content */}
                <div className="absolute top-20 left-20 text-yellow-300 font-handwritten text-2xl transform -rotate-6">Brainstorming here!</div>
                <svg className="absolute inset-0 pointer-events-none w-full h-full">
                    <path d="M 100 100 Q 200 200 300 150" stroke="cyan" strokeWidth="2" fill="none" />
                </svg>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#1e293b] p-2 rounded-full border border-white/10 flex gap-2 shadow-2xl">
                <button className="p-2 rounded-full hover:bg-white/10 text-white"><span className="material-symbols-outlined">edit</span></button>
                <button className="p-2 rounded-full hover:bg-white/10 text-yellow-400"><span className="material-symbols-outlined">sticky_note_2</span></button>
                <button className="p-2 rounded-full hover:bg-white/10 text-red-400"><span className="material-symbols-outlined">ink_eraser</span></button>
            </div>
        </div>
    );
};

// 8. VoiceChannelIndicator
export const VoiceChannelIndicator: React.FC<{ active: boolean }> = ({ active }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${active ? 'bg-green-900/30 border-green-500/50' : 'bg-slate-800 border-slate-600'}`}>
        <div className="flex items-end gap-0.5 h-4">
            <div className={`w-1 bg-green-400 rounded-full ${active ? 'animate-[bounce_1s_infinite]' : 'h-1'}`}></div>
            <div className={`w-1 bg-green-400 rounded-full ${active ? 'animate-[bounce_1.2s_infinite]' : 'h-2'}`}></div>
            <div className={`w-1 bg-green-400 rounded-full ${active ? 'animate-[bounce_0.8s_infinite]' : 'h-1.5'}`}></div>
        </div>
        <span className={`text-xs font-bold ${active ? 'text-green-300' : 'text-slate-400'}`}>{active ? 'Voice Active' : 'Voice Off'}</span>
    </div>
);

// 9. LivePollWidget
export const LivePollWidget: React.FC = () => (
    <div className="absolute bottom-24 left-6 w-64 bg-[#1e1e1e] border border-blue-500/30 rounded-xl p-4 shadow-xl z-30 animate-slide-up">
        <h4 className="text-blue-300 font-bold text-xs mb-3 uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">poll</span> Bình chọn trực tiếp
        </h4>
        <p className="text-white text-sm mb-3 font-medium">Chúng ta nên học gì tiếp theo?</p>
        <div className="space-y-2">
            <div className="relative h-8 bg-white/5 rounded overflow-hidden cursor-pointer hover:bg-white/10 group">
                <div className="absolute top-0 left-0 h-full bg-blue-600/30 w-[60%]"></div>
                <div className="absolute inset-0 flex items-center justify-between px-3 text-xs text-slate-200">
                    <span>React Query</span>
                    <span className="font-bold">60%</span>
                </div>
            </div>
            <div className="relative h-8 bg-white/5 rounded overflow-hidden cursor-pointer hover:bg-white/10 group">
                <div className="absolute top-0 left-0 h-full bg-blue-600/30 w-[40%]"></div>
                <div className="absolute inset-0 flex items-center justify-between px-3 text-xs text-slate-200">
                    <span>Zustand</span>
                    <span className="font-bold">40%</span>
                </div>
            </div>
        </div>
    </div>
);

// 10. SpectatorModeToggle
export const SpectatorModeToggle: React.FC<{ active: boolean, onToggle: () => void }> = ({ active, onToggle }) => (
    <button 
        onClick={onToggle}
        className={`fixed top-24 right-20 z-40 p-2 rounded-full border transition-all ${active ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_purple]' : 'bg-black/40 text-slate-400 border-white/10 hover:text-white'}`}
        title="Chế độ Khán giả (Follow Host)"
    >
        <span className="material-symbols-outlined">visibility</span>
    </button>
);
