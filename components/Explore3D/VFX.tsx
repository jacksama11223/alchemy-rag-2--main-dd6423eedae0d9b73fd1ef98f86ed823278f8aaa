
import React from 'react';

// 25. StardustParticles
export const StardustParticles: React.FC = () => (
    <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(50)].map((_, i) => (
            <div 
                key={i} 
                className="absolute bg-white rounded-full opacity-40 animate-pulse"
                style={{ 
                    left: `${Math.random() * 100}%`, 
                    top: `${Math.random() * 100}%`, 
                    width: Math.random() * 2 + 'px', 
                    height: Math.random() * 2 + 'px',
                    animationDelay: `${Math.random() * 5}s`
                }}
            ></div>
        ))}
    </div>
);

// 26. AuroraBorealisLayer
export const AuroraBorealisLayer: React.FC = () => (
    <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-tr from-green-500/10 via-purple-500/10 to-blue-500/10 filter blur-3xl animate-pulse"></div>
);

// 27. GridFloor3D
export const GridFloor3D: React.FC = () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2000px] h-[2000px] pointer-events-none opacity-20"
         style={{ transform: 'rotateX(90deg) translateZ(-500px)', backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '100px 100px' }}>
    </div>
);

// 28. LensFlareFilter
export const LensFlareFilter: React.FC = () => (
    <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-[28%] right-[28%] w-12 h-12 bg-blue-300/20 rounded-full blur-xl"></div>
    </div>
);

// 29. VignetteOverlay
export const VignetteOverlay: React.FC = () => (
    <div className="absolute inset-0 pointer-events-none z-50 bg-[radial-gradient(circle_at_center,transparent_50%,black_100%)] opacity-60"></div>
);

// 30. GlitchEffectShader
export const GlitchEffectShader: React.FC<{ active: boolean }> = ({ active }) => {
    if (!active) return null;
    return (
        <div className="absolute inset-0 z-[60] pointer-events-none mix-blend-overlay opacity-50 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] bg-cover"></div>
    );
};

// 31. ConstellationPulse
export const ConstellationPulse: React.FC = () => (
    <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-[shimmer_2s_infinite]"></div>
);

// 32. AtmosphereHalo
export const AtmosphereHalo: React.FC<{ size: number, color: string }> = ({ size, color }) => (
    <div className={`absolute -inset-4 rounded-full blur-xl opacity-30 ${color}`} style={{ width: size + 30, height: size + 30 }}></div>
);

// 33. MeteorShowerEvent
export const MeteorShowerEvent: React.FC = () => (
    <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-1 h-20 bg-gradient-to-b from-transparent to-white rotate-45 animate-[rain_1s_infinite]"></div>
    </div>
);

// 34. ScanlineOverlay
export const ScanlineOverlay: React.FC = () => (
    <div className="absolute inset-0 pointer-events-none z-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
);

// 35. ShadowProjector
export const ShadowProjector: React.FC<{ x: number, z: number }> = ({ x, z }) => (
    <div className="absolute w-20 h-20 bg-black/50 rounded-full blur-md transform rotate-x-90 translate-y-20 opacity-50" style={{ transform: `translate3d(${x}px, 600px, ${z}px) rotateX(90deg)` }}></div>
);
