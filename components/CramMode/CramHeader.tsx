import React from 'react';
import { FeatureWindowControls } from '../FeatureWindowControls';

interface CramHeaderProps {
    onLogout: () => void;
    onBack?: () => void;
}

export const CramHeader: React.FC<CramHeaderProps> = ({ onLogout, onBack }) => (
    <header className="flex items-center justify-between whitespace-nowrap px-10 py-3 font-display bg-[#2a1e3e]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-2.5 text-xl font-bold text-white">
            <span className="material-symbols-outlined text-3xl text-amber-400">bolt</span>
            <span>Cram Mode <span className="text-xs text-slate-400 font-normal ml-2">Ôn thi cấp tốc</span></span>
        </div>
        <div className="flex items-center gap-4">
            {onBack && <FeatureWindowControls onClose={onBack} />}
        </div>
    </header>
);