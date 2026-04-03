
import React from 'react';
import { FeatureWindowControls } from '../FeatureWindowControls';

interface SpaceHeaderProps {
    onBack: () => void;
    activeFilter?: string | null;
    autoOrbit: boolean;
    setAutoOrbit: (val: boolean) => void;
    zenMode: boolean;
    setZenMode: (val: boolean) => void;
    onShowAccount: () => void;
}

export const SpaceHeader: React.FC<SpaceHeaderProps> = ({ 
    onBack, activeFilter, autoOrbit, setAutoOrbit, zenMode, setZenMode, onShowAccount 
}) => {
    if (zenMode) return (
        <button 
            onClick={() => setZenMode(false)}
            className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors"
            title="Thoát Zen Mode"
        >
            <span className="material-symbols-outlined">close_fullscreen</span>
        </button>
    );

    return (
        <header className="absolute top-0 left-0 w-full z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-sky-blue/20 px-4 sm:px-6 lg:px-8 py-4 bg-[#02041a]/80 backdrop-blur-md">
            <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
                <span className="material-symbols-outlined text-3xl text-sky-400">rocket_launch</span>
                <h2 className="text-xl font-bold text-white">Vũ Trụ Ký Ức (Mnemonic Space)</h2>
            </div>
            <div className="flex items-center gap-4">
                {activeFilter && (
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/50 animate-[fadeIn_0.3s]">
                        Filter: {activeFilter}
                    </span>
                )}
                
                <button 
                    onClick={() => setAutoOrbit(!autoOrbit)} 
                    className={`p-2 rounded-lg text-xs font-bold border transition-colors flex items-center gap-2 ${
                        autoOrbit 
                        ? 'bg-sky-500 text-white border-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]' 
                        : 'border-white/20 text-slate-400 hover:text-white hover:border-white/40'
                    }`}
                >
                    <span className="material-symbols-outlined text-sm">{autoOrbit ? 'autoplay' : 'pause_circle'}</span>
                    {autoOrbit ? 'Auto Orbit: ON' : 'Auto Orbit: OFF'}
                </button>

                <button 
                    onClick={() => setZenMode(true)} 
                    className="p-2 rounded-lg text-xs font-bold border border-white/20 text-slate-400 hover:text-white hover:border-white transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">spa</span> Zen Mode
                </button>

                <button 
                    onClick={onShowAccount}
                    className="flex gap-2 cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-sky-blue/10 border border-sky-blue/50 text-sky-blue text-sm font-medium leading-normal hover:bg-sky-blue/20 transition-colors"
                >
                    <span className="material-symbols-outlined text-base">person</span>
                    <span className="truncate">Tài khoản</span>
                </button>
                <FeatureWindowControls onClose={onBack} />
            </div>
        </header>
    );
};
