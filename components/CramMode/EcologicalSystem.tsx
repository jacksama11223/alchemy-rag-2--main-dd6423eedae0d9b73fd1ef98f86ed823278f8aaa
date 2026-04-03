import React from 'react';

// 1. Weather System
export const WeatherOverlay: React.FC<{ stormIntensity: number }> = ({ stormIntensity }) => {
    if (stormIntensity < 0.3) return null; // Sunny
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-30">
            {/* Simple CSS Rain */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://i.imgur.com/7Q3b3gW.png')] animate-[rain_0.5s_linear_infinite]"></div>
        </div>
    );
};

// 2. Guardian Spirit (Pet)
export const GuardianSpirit: React.FC<{ health: number }> = ({ health }) => {
    const mood = health > 80 ? 'happy' : health > 40 ? 'worried' : 'sad';
    const icons = { happy: 'sentiment_very_satisfied', worried: 'sentiment_neutral', sad: 'sentiment_very_dissatisfied' };
    const colors = { happy: 'text-green-400', worried: 'text-yellow-400', sad: 'text-red-400' };

    return (
        <div className={`fixed bottom-4 left-4 z-50 p-2 bg-black/60 rounded-full border border-white/20 backdrop-blur flex items-center gap-2 animate-bounce`}>
            <span className={`material-symbols-outlined text-3xl ${colors[mood]}`}>{icons[mood]}</span>
            <div className="text-[10px] text-white bg-white/10 px-2 py-0.5 rounded-full">
                {mood === 'happy' ? 'Rừng xanh tốt!' : mood === 'worried' ? 'Cần nước!' : 'Hạn hán!'}
            </div>
        </div>
    );
};

// 3. Harvest Button
export const HarvestButton: React.FC<{ ready: boolean, onClick: () => void }> = ({ ready, onClick }) => {
    if (!ready) return null;
    return (
        <button 
            onClick={onClick}
            className="fixed bottom-20 right-6 z-50 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black rounded-full shadow-[0_0_20px_gold] animate-pulse hover:scale-110 transition-transform"
        >
            <span className="material-symbols-outlined align-middle mr-1">agriculture</span> Thu hoạch (Harvest)
        </button>
    );
};
