
import React, { useState, useEffect } from 'react';

// 1. Battle Mode Lobby
export const BattleModeLobby: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-[fadeIn_0.3s]">
            <div className="bg-[#0f172a] w-full max-w-4xl h-[80vh] rounded-3xl border-2 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)] flex overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"><span className="material-symbols-outlined">close</span></button>
                
                {/* Left: Find Match */}
                <div className="w-1/2 p-8 border-r border-white/10 flex flex-col items-center justify-center gap-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-900/10 group-hover:bg-red-900/20 transition-colors"></div>
                    <span className="material-symbols-outlined text-8xl text-red-500 animate-pulse relative z-10">swords</span>
                    <h2 className="text-3xl font-black text-white relative z-10 uppercase tracking-widest">Đấu Rank</h2>
                    <button className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full shadow-lg relative z-10 hover:scale-105 transition-transform">
                        Tìm Trận (1v1)
                    </button>
                    <p className="text-slate-400 text-sm relative z-10">Đang tìm: 1,204 người chơi...</p>
                </div>

                {/* Right: Custom Room */}
                <div className="w-1/2 p-8 flex flex-col items-center justify-center gap-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-blue-900/20 transition-colors"></div>
                    <span className="material-symbols-outlined text-8xl text-blue-500 relative z-10">group_add</span>
                    <h2 className="text-3xl font-black text-white relative z-10 uppercase tracking-widest">Tạo Phòng</h2>
                    <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg relative z-10 hover:scale-105 transition-transform">
                        Mời Bạn Bè
                    </button>
                    <input type="text" placeholder="Nhập mã phòng..." className="bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white text-center w-64 relative z-10" />
                </div>
            </div>
        </div>
    );
};

// 2. Live Scoreboard
export const LiveScoreboard: React.FC = () => {
    const [scores, setScores] = useState({ you: 0, enemy: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            setScores(prev => ({ you: prev.you + Math.floor(Math.random() * 10), enemy: prev.enemy + Math.floor(Math.random() * 8) }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-4 bg-black/40 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-blue-400 uppercase">Bạn</span>
                <span className="text-2xl font-black text-white">{scores.you}</span>
            </div>
            <span className="text-slate-500 font-bold">VS</span>
            <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold text-red-400 uppercase">Đối thủ</span>
                <span className="text-2xl font-black text-white">{scores.enemy}</span>
            </div>
        </div>
    );
};

// 3. Crossword Puzzle
export const CrosswordPuzzle: React.FC = () => {
    // Simulated Visual Only
    return (
        <div className="bg-[#1e293b] p-4 rounded-xl border border-white/10 my-4">
            <h4 className="text-white font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-green-400">grid_on</span> Ô Chữ AI</h4>
            <div className="grid grid-cols-5 gap-1 aspect-square max-w-[200px] mx-auto opacity-70">
                {Array.from({length: 25}).map((_, i) => (
                    <div key={i} className={`border border-white/20 flex items-center justify-center text-xs font-bold text-white ${[0,1,5,6,10,11].includes(i) ? 'bg-transparent' : 'bg-slate-700'}`}>
                        {[0,1,5,6,10,11].includes(i) ? '' : String.fromCharCode(65 + Math.floor(Math.random()*26))}
                    </div>
                ))}
            </div>
        </div>
    );
};

// 4. Matching Game
export const MatchingGame: React.FC = () => {
    return (
        <div className="bg-[#1e293b] p-4 rounded-xl border border-white/10 my-4">
            <h4 className="text-white font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-purple-400">join_inner</span> Nối Từ</h4>
            <div className="flex justify-between gap-4">
                <div className="space-y-2 flex-1">
                    <button className="w-full p-2 bg-slate-700 rounded text-xs text-white hover:bg-purple-600 transition-colors">Apple</button>
                    <button className="w-full p-2 bg-slate-700 rounded text-xs text-white hover:bg-purple-600 transition-colors">Car</button>
                </div>
                <div className="space-y-2 flex-1">
                    <button className="w-full p-2 bg-slate-700 rounded text-xs text-white hover:bg-purple-600 transition-colors">Xe hơi</button>
                    <button className="w-full p-2 bg-slate-700 rounded text-xs text-white hover:bg-purple-600 transition-colors">Quả táo</button>
                </div>
            </div>
        </div>
    );
};

// 5. Fill In The Blank (Componentized)
export const FillInTheBlank: React.FC = () => {
    return (
        <div className="bg-[#1e293b] p-4 rounded-xl border border-white/10 my-4">
            <h4 className="text-white font-bold mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-amber-400">edit_note</span> Điền từ</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
                Photosynthesis is the process by which green plants use sunlight to synthesize <input className="bg-black/30 border-b border-white/50 text-center w-20 text-white focus:outline-none focus:border-amber-400" /> from carbon dioxide and water.
            </p>
        </div>
    );
};

// 6. Flashcard Carousel
export const FlashcardCarousel: React.FC = () => {
    return (
        <div className="relative h-48 w-full perspective-[1000px] flex items-center justify-center my-6">
            {/* Background Cards */}
            <div className="absolute w-32 h-40 bg-slate-700 rounded-xl transform -translate-x-12 translate-z-[-20px] scale-90 opacity-50"></div>
            <div className="absolute w-32 h-40 bg-slate-700 rounded-xl transform translate-x-12 translate-z-[-20px] scale-90 opacity-50"></div>
            
            {/* Main Card */}
            <div className="w-40 h-52 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center text-white font-bold text-center p-4 z-10 transform hover:scale-105 transition-transform cursor-pointer">
                Flashcard 3D
            </div>
        </div>
    );
};
