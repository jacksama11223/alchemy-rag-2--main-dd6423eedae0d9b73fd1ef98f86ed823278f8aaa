
import React, { useState } from 'react';

// 31. RainSoundMixer
export const RainSoundMixer: React.FC = () => (
    <div className="bg-[#1e1e1e] p-4 rounded-xl border border-white/10 w-64 shadow-xl">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">equalizer</span> Âm thanh nền
        </h4>
        <div className="space-y-3">
            {[
                { icon: 'water_drop', label: 'Mưa' },
                { icon: 'forest', label: 'Rừng' },
                { icon: 'local_fire_department', label: 'Lửa' }
            ].map(sound => (
                <div key={sound.label} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-500 text-sm w-4">{sound.icon}</span>
                    <input type="range" className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white" />
                </div>
            ))}
        </div>
    </div>
);

// 32. BreathingGuideCircle
export const BreathingGuideCircle: React.FC<{ active: boolean }> = ({ active }) => {
    if (!active) return null;
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 bg-cyan-500/20 rounded-full animate-ping opacity-50"></div>
            <div className="absolute w-24 h-24 bg-cyan-400/30 rounded-full animate-pulse flex items-center justify-center text-white font-bold text-xs backdrop-blur-sm">
                Hít vào...
            </div>
        </div>
    );
};

// 33. ScreenDimmerOverlay
export const ScreenDimmerOverlay: React.FC<{ active: boolean }> = ({ active }) => {
    if (!active) return null;
    return <div className="fixed inset-0 z-[200] bg-black/60 pointer-events-none mix-blend-multiply transition-opacity duration-1000"></div>;
};

// 34. FocusCurtain
export const FocusCurtain: React.FC<{ active: boolean }> = ({ active }) => {
    if (!active) return null;
    return (
        <div className="fixed inset-0 z-[85] bg-black/90 flex items-center justify-center">
            <div className="h-20 w-full bg-transparent border-y-2 border-cyan-500/30 shadow-[0_0_50px_black] relative">
                <p className="absolute -top-8 left-1/2 -translate-x-1/2 text-slate-500 text-xs uppercase">Reading Zone</p>
            </div>
        </div>
    );
};

// 35. PomodoroTaskLink
export const PomodoroTaskLink: React.FC = () => (
    <div className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 px-3 py-1 rounded-full cursor-pointer hover:bg-red-900/30 transition-colors">
        <span className="material-symbols-outlined text-red-400 text-sm">timer</span>
        <span className="text-xs text-red-200">25:00 • "Học React Hooks"</span>
    </div>
);
