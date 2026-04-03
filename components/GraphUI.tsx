
import React from 'react';

// --- OCEAN THEME CONTAINERS ---

export const GraphShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="relative flex h-screen w-screen bg-[#001e3c] text-sky-100 font-display overflow-hidden select-none">
        
        {/* 1. Deep Ocean Gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#023e8a] via-[#0077b6] to-[#03045e]"></div>
        
        {/* 2. Caustics Effect (Sunlight through water) */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay"
             style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.005' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
                 backgroundSize: 'cover'
             }}>
        </div>

        {/* 3. Rising Bubbles Animation */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
                <div 
                    key={i}
                    className="absolute bg-white/10 rounded-full animate-[rise_15s_infinite_linear]"
                    style={{
                        width: Math.random() * 20 + 5 + 'px',
                        height: Math.random() * 20 + 5 + 'px',
                        left: Math.random() * 100 + '%',
                        bottom: '-50px',
                        animationDelay: Math.random() * 10 + 's',
                        animationDuration: Math.random() * 10 + 10 + 's'
                    }}
                ></div>
            ))}
        </div>

        {/* Content */}
        {children}
    </div>
);

// --- FLOATING HUD COMPONENTS ---

interface FloatingPanelProps {
    children: React.ReactNode;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-center' | 'top-center';
    className?: string;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({ children, position, className = '' }) => {
    const posClasses = {
        'top-left': 'top-28 left-6', // Lowered to avoid header collision
        'top-right': 'top-28 right-6',
        'bottom-left': 'bottom-28 left-6',
        'bottom-right': 'bottom-28 right-6',
        'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
        'top-center': 'top-6 left-1/2 -translate-x-1/2'
    };

    return (
        <div className={`absolute z-30 ${posClasses[position]} ${className} animate-fade-in`}>
            {children}
        </div>
    );
};

// --- STYLED WIDGETS (Ocean Themed) ---

export const GlassCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-[#0077b6]/40 backdrop-blur-xl border border-sky-300/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-2xl p-4 ${className}`}>
        {children}
    </div>
);

export const NeonButton: React.FC<{ icon: string, label?: string, title?: string, active?: boolean, onClick: () => void, color?: string }> = ({ icon, label, title, active, onClick, color = 'cyan' }) => {
    // Dynamic color handling for Ocean theme
    const activeClass = active 
        ? `bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.6)] font-bold border-transparent` 
        : 'bg-white/10 text-sky-200 border-white/20 hover:bg-white/20 hover:text-white hover:border-white/40';

    return (
        <button 
            onClick={onClick}
            className={`group relative flex items-center justify-center p-3 rounded-xl border transition-all duration-300 ${activeClass}`}
            title={title || label}
        >
            <span className={`material-symbols-outlined text-xl transition-transform group-hover:scale-110 ${active ? 'animate-pulse' : ''}`}>{icon}</span>
            {label && <span className="ml-2 text-xs font-bold uppercase tracking-wider">{label}</span>}
        </button>
    );
};

export const StatItem: React.FC<{ icon: string, label: string, value: string | number }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
        <div className="p-2 rounded-full bg-sky-500/20 text-sky-300">
            <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
        <div>
            <div className="text-[10px] text-sky-200/70 uppercase font-bold tracking-wider">{label}</div>
            <div className="text-sm font-mono text-white text-shadow-glow">{value}</div>
        </div>
    </div>
);

// --- CONTEXT MENUS ---

export const ContextToolbar: React.FC<{ x: number, y: number, children: React.ReactNode }> = ({ x, y, children }) => (
    <div 
        className="absolute z-50 flex flex-wrap max-w-[250px] justify-center items-center gap-1 p-2 bg-[#023e8a]/90 backdrop-blur-md border border-cyan-400/50 rounded-2xl shadow-[0_0_20px_rgba(0,119,182,0.5)] animate-scale-in"
        style={{ left: x, top: y, transform: 'translate(-50%, -120%)' }}
    >
        {children}
    </div>
);

export const ContextButton: React.FC<{ icon: string, onClick: () => void, tooltip: string, variant?: 'default' | 'danger' | 'highlight' }> = ({ icon, onClick, tooltip, variant = 'default' }) => {
    let classes = 'p-2.5 rounded-full transition-all relative group ';
    if (variant === 'danger') classes += 'hover:bg-red-500/20 text-slate-300 hover:text-red-400';
    else if (variant === 'highlight') classes += 'bg-cyan-400 text-black shadow-lg hover:scale-110';
    else classes += 'hover:bg-white/20 text-sky-100 hover:text-white';

    return (
        <button 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={classes}
        >
            <span className="material-symbols-outlined text-lg">{icon}</span>
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#001e3c] text-sky-100 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-cyan-500/30 z-50 shadow-lg">
                {tooltip}
            </span>
        </button>
    );
};