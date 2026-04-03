
import React, { useState, useEffect } from 'react';
import { useGamification } from '../../contexts/GamificationContext';

export const PomodoroTimer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');
    const { addXP } = useGamification();

    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (mode === 'focus') {
                // Award real XP
                addXP(100, "Hoàn thành Pomodoro 25p");
                
                alert("Hoàn thành phiên tập trung! Hãy nghỉ ngơi.");
                setMode('break');
                setTimeLeft(5 * 60);
            } else {
                alert("Hết giờ nghỉ! Quay lại làm việc nào.");
                setMode('focus');
                setTimeLeft(25 * 60);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode, addXP]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e1e1e] border border-[#333] rounded-2xl shadow-2xl p-4 w-48 animate-[slideInUp_0.5s]">
            <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${mode === 'focus' ? 'text-red-400' : 'text-green-400'}`}>
                    {mode === 'focus' ? 'Focus' : 'Break'}
                </span>
                <button onClick={() => setMode(mode === 'focus' ? 'break' : 'focus')} className="text-slate-500 hover:text-white">
                    <span className="material-symbols-outlined text-sm">swap_horiz</span>
                </button>
            </div>
            
            <div className="text-center my-2">
                <div className="text-4xl font-black text-white font-mono tracking-widest">{formatTime(timeLeft)}</div>
            </div>
            
            <div className="flex justify-center gap-3 mt-3">
                <button 
                    onClick={toggleTimer}
                    className={`p-2 rounded-full text-white shadow-lg transition-transform active:scale-95 ${isActive ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-red-600 hover:bg-red-500'}`}
                >
                    <span className="material-symbols-outlined text-xl">{isActive ? 'pause' : 'play_arrow'}</span>
                </button>
                <button 
                    onClick={resetTimer}
                    className="p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">refresh</span>
                </button>
            </div>
        </div>
    );
};
