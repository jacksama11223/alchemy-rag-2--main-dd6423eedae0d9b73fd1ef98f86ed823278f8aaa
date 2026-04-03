
import React from 'react';

interface SystemDockProps {
    onOpenPanel: (tab: 'DATA' | 'VISUAL') => void;
    onToggleZenMode: () => void;
    onToggleFocusMode: () => void;
    zenModeActive: boolean;
    onCategory?: () => void;
    onNavigateToFeature?: (feature: string, params?: any) => void;
}

export const OmniMenu: React.FC<SystemDockProps> = ({
    onOpenPanel, onToggleZenMode, onToggleFocusMode, zenModeActive, onCategory, onNavigateToFeature
}) => {
    // Horizontal styling
    const baseStyle = "p-3 rounded-xl transition-all duration-300 flex items-center justify-center relative group border border-white/5 hover:bg-cyan-900/40 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-white/5";
    const iconStyle = "material-symbols-outlined text-xl transition-transform text-sky-300 group-hover:text-cyan-300 group-hover:scale-110";
    const labelStyle = "absolute bottom-full mb-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-white bg-black/80 px-2 py-1 rounded pointer-events-none";

    return (
        <div className={`fixed bottom-2 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 ${zenModeActive ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
            <div className="flex flex-row items-center gap-2 p-2 rounded-2xl bg-[#0f172a]/90 border border-sky-500/20 shadow-2xl backdrop-blur-xl">
                
                {/* Data Center */}
                <button className={baseStyle} onClick={() => onOpenPanel('DATA')}>
                    <span className={iconStyle}>analytics</span>
                    <span className={labelStyle}>Data Center</span>
                </button>

                {/* Visual Studio */}
                <button className={baseStyle} onClick={() => onOpenPanel('VISUAL')}>
                    <span className={iconStyle}>terminal</span>
                    <span className={labelStyle}>Coding Studio</span>
                </button>

                {/* Explore Category */}
                <button className={baseStyle} onClick={onCategory}>
                    <span className={iconStyle}>category</span>
                    <span className={labelStyle}>Phân Loại</span>
                </button>

                <div className="w-px h-8 bg-sky-500/20 mx-1"></div>

                {/* Toggles */}
                <button className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center relative group border border-white/5 hover:bg-cyan-900/40 hover:border-cyan-400/50 ${zenModeActive ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-white/5 text-slate-400'}`} onClick={onToggleZenMode}>
                    <span className="material-symbols-outlined text-xl">self_improvement</span>
                    <span className={labelStyle}>Zen Mode</span>
                </button>
                
                <button className="p-3 rounded-xl transition-all duration-300 flex items-center justify-center relative group border border-white/5 hover:bg-cyan-900/40 hover:border-cyan-400/50 bg-white/5 text-slate-400" onClick={onToggleFocusMode}>
                    <span className="material-symbols-outlined text-xl">center_focus_strong</span>
                    <span className={labelStyle}>Focus Mode</span>
                </button>

            </div>
        </div>
    );
};

