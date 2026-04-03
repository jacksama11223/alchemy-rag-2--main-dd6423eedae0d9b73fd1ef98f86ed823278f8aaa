
import React, { useState, useEffect } from 'react';
import { useBehavior } from '../contexts/BehaviorContext';

export const NeuralFeedbackWidget: React.FC = () => {
    const { persona, isAnalyzing, analyzeBehavior, logs } = useBehavior();
    const [isOpen, setIsOpen] = useState(false);
    const [showPulse, setShowPulse] = useState(false);

    // Pulse animation when new analysis arrives
    useEffect(() => {
        if (!isAnalyzing && persona) {
            setShowPulse(true);
            const timer = setTimeout(() => setShowPulse(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [persona, isAnalyzing]);

    if (!logs || logs.length === 0) return null;

    return (
        <>
            {/* Floating Brain / Trigger */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 left-6 z-[999] group flex items-center justify-center w-14 h-14 rounded-full bg-[#0f172a] border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-110 ${showPulse ? 'animate-bounce shadow-[0_0_40px_rgba(6,182,212,0.8)]' : ''}`}
                title="Neural Link Analysis"
            >
                {isAnalyzing ? (
                    <span className="material-symbols-outlined text-cyan-400 animate-spin text-2xl">sync</span>
                ) : (
                    <span className="material-symbols-outlined text-cyan-400 text-2xl group-hover:text-white transition-colors">neurology</span>
                )}
                
                {/* Connection Lines Effect */}
                <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping"></div>
            </button>

            {/* Insight Panel */}
            {isOpen && (
                <div className="fixed bottom-24 left-6 z-[999] w-80 bg-[#0f172a]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden animate-[slideInUp_0.3s]">
                    <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 p-4 border-b border-cyan-500/20 flex justify-between items-center">
                        <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-cyan-400">psychology</span>
                            Neural Profile
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                    
                    <div className="p-5">
                        {isAnalyzing ? (
                            <div className="text-center py-6">
                                <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                <p className="text-cyan-300 text-xs font-mono animate-pulse">Deep Learning Processing...</p>
                            </div>
                        ) : persona ? (
                            <div className="space-y-4">
                                {/* Profile Summary */}
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-white/5 rounded-lg p-2 text-center border border-white/5">
                                        <div className="text-[10px] text-slate-400 uppercase font-bold">Style</div>
                                        <div className="text-cyan-300 font-bold text-sm">{persona.learningStyle}</div>
                                    </div>
                                    <div className="flex-1 bg-white/5 rounded-lg p-2 text-center border border-white/5">
                                        <div className="text-[10px] text-slate-400 uppercase font-bold">Peak Time</div>
                                        <div className="text-yellow-300 font-bold text-sm">{persona.focusTime}</div>
                                    </div>
                                </div>

                                {/* Suggestion */}
                                <div className="bg-cyan-900/20 border border-cyan-500/30 p-3 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-cyan-400 text-sm animate-pulse">lightbulb</span>
                                        <span className="text-xs font-bold text-cyan-200 uppercase">AI Recommendation</span>
                                    </div>
                                    <p className="text-sm text-white leading-relaxed font-medium">
                                        {persona.suggestion}
                                    </p>
                                </div>

                                {/* Strengths/Weaknesses */}
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-green-400 font-bold block mb-1">Strengths</span>
                                        <ul className="list-disc list-inside text-slate-300">
                                            {persona.strengths?.slice(0, 2).map((s, i) => <li key={i} className="truncate">{s}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <span className="text-red-400 font-bold block mb-1">Focus Areas</span>
                                        <ul className="list-disc list-inside text-slate-300">
                                            {persona.weaknesses?.slice(0, 2).map((w, i) => <li key={i} className="truncate">{w}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-slate-400 text-sm mb-4">Chưa đủ dữ liệu để phân tích thói quen.</p>
                                <button 
                                    onClick={() => analyzeBehavior()}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors"
                                >
                                    Phân tích ngay (Beta)
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-[#0b1221] p-2 text-center border-t border-white/5">
                        <p className="text-[9px] text-slate-600 font-mono">
                            Logs Collected: {logs.length} • Model: Gemini 2.5 Flash
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};
