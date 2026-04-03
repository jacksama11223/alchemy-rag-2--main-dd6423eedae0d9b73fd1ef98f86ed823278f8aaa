
import React, { useState } from 'react';

interface NeuralHolodeckProps {
    onBack: () => void;
}

const NeuralHolodeck: React.FC<NeuralHolodeckProps> = ({ onBack }) => {
    const [activeScene, setActiveScene] = useState<'void' | 'matrix' | 'nebula'>('void');

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col">
            {/* Background Render */}
            <div className={`absolute inset-0 z-0 transition-all duration-1000 ${
                activeScene === 'matrix' ? 'bg-[#001a00]' : 
                activeScene === 'nebula' ? 'bg-[#1a0b2e]' : 'bg-[#000000]'
            }`}>
                {activeScene === 'matrix' && (
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}></div>
                )}
                {activeScene === 'nebula' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/20 to-black pointer-events-none"></div>
                )}
            </div>

            {/* UI Overlay */}
            <div className="relative z-10 flex flex-col h-full pointer-events-none">
                <header className="p-6 flex justify-between items-start pointer-events-auto">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-1">Neural Holodeck</h1>
                        <p className="text-xs text-cyan-500 font-mono">SIMULATION_STATUS: ONLINE</p>
                    </div>
                    <button onClick={onBack} className="px-6 py-2 border border-white/20 text-white hover:bg-white/10 rounded-full transition-colors text-sm font-bold uppercase tracking-wider">
                        Exit Simulation
                    </button>
                </header>

                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-8 pointer-events-auto">
                        <div className="w-64 h-64 border-2 border-cyan-500/30 rounded-full flex items-center justify-center relative animate-[spin_10s_linear_infinite]">
                            <div className="absolute inset-0 border-2 border-purple-500/30 rounded-full scale-110 animate-[spin_15s_linear_infinite_reverse]"></div>
                            <div className="absolute inset-0 border-2 border-white/10 rounded-full scale-75"></div>
                            <span className="material-symbols-outlined text-6xl text-white/50 animate-pulse">view_in_ar</span>
                        </div>
                        
                        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                            Chào mừng đến với Holodeck. Đây là không gian mô phỏng thực tế ảo dành cho việc học tập sâu (Deep Learning Immersion).
                            Tính năng đang được phát triển.
                        </p>

                        <div className="flex justify-center gap-4">
                            <button onClick={() => setActiveScene('matrix')} className="px-4 py-2 bg-green-900/30 border border-green-500/50 text-green-400 rounded hover:bg-green-900/50 transition-colors text-xs font-mono">LOAD MATRIX</button>
                            <button onClick={() => setActiveScene('nebula')} className="px-4 py-2 bg-purple-900/30 border border-purple-500/50 text-purple-400 rounded hover:bg-purple-900/50 transition-colors text-xs font-mono">LOAD NEBULA</button>
                            <button onClick={() => setActiveScene('void')} className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded hover:bg-white/20 transition-colors text-xs font-mono">RESET</button>
                        </div>
                    </div>
                </main>

                <footer className="p-6 text-center">
                    <p className="text-[10px] text-white/30 font-mono">SYSTEM INTEGRITY: 100%</p>
                </footer>
            </div>
        </div>
    );
};

export default React.memo(NeuralHolodeck);
