
import React from 'react';
import { OceanTheme } from '../../theme/theme';

interface LogoProps {
    variant?: 'light' | 'dark';
    className?: string;
}

export const BrandLogo: React.FC<LogoProps> = ({ variant = 'light', className = '' }) => {
    const textColor = variant === 'light' ? 'text-slate-800' : 'text-white';
    const iconColor = 'text-sky-500';

    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
            <div className={`${iconColor} text-3xl drop-shadow-sm`}>
                <span className="material-symbols-outlined">sailing</span>
            </div>
            <h2 className={`text-xl font-black tracking-tight ${textColor}`}>
                Learn<span className="text-sky-500">AI</span>
            </h2>
        </div>
    );
};

interface OceanBackgroundProps {
    variant?: 'surface' | 'deep'; // surface = Dashboard (Day), deep = Tools (Night/Ocean Depth)
}

export const OceanBackground: React.FC<OceanBackgroundProps> = React.memo(({ variant = 'surface' }) => {
    return (
        <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${variant === 'surface' ? OceanTheme.gradients.surface : OceanTheme.gradients.deep}`}>
            <style>{`
                @keyframes floatCloud {
                    0% { transform: translate3d(-100%, 0, 0); }
                    100% { transform: translate3d(100vw, 0, 0); }
                }
                @keyframes waveMove {
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-50%, 0, 0); }
                }
                @keyframes sunGlow {
                    0%, 100% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
                @keyframes riseBubble {
                    0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
                }
                .cloud {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.6);
                    border-radius: 9999px;
                    filter: blur(8px);
                    will-change: transform;
                }
                .wave {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 200%;
                    height: 120px;
                    background-repeat: repeat-x;
                    background-size: 50% 100%;
                    will-change: transform;
                }
            `}</style>

            {variant === 'surface' ? (
                <>
                    {/* Sun */}
                    <div className="absolute top-10 right-[10%] w-32 h-32 bg-yellow-300 rounded-full blur-[40px] opacity-60 animate-[sunGlow_4s_infinite_ease-in-out]"></div>
                    <div className="absolute top-16 right-[12%] w-20 h-20 bg-white rounded-full shadow-[0_0_50px_rgba(253,224,71,0.8)]"></div>

                    {/* Clouds */}
                    <div className="cloud w-48 h-16 top-20 opacity-60" style={{ animation: 'floatCloud 60s linear infinite', animationDelay: '-10s' }}></div>
                    <div className="cloud w-32 h-12 top-40 opacity-40" style={{ animation: 'floatCloud 45s linear infinite', animationDelay: '-5s' }}></div>
                    <div className="cloud w-64 h-20 top-10 opacity-30" style={{ animation: 'floatCloud 80s linear infinite', animationDelay: '-30s' }}></div>

                    {/* Waves */}
                    <div className="wave" style={{ 
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1440 320' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='rgba(14, 165, 233, 0.1)' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'/%3E%3C/svg%3E")`,
                        animation: 'waveMove 20s linear infinite', bottom: '20px', height: '150px' 
                    }}></div>
                    <div className="wave" style={{ 
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1440 320' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='rgba(14, 165, 233, 0.2)' d='M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'/%3E%3C/svg%3E")`,
                        animation: 'waveMove 15s linear infinite', bottom: '-10px', height: '120px' 
                    }}></div>
                </>
            ) : (
                <>
                    {/* Deep Sea Particles */}
                    {[...Array(20)].map((_, i) => (
                        <div 
                            key={i}
                            className="absolute bg-sky-500/20 rounded-full blur-[2px]"
                            style={{
                                left: `${Math.random() * 100}%`,
                                width: `${Math.random() * 4 + 2}px`,
                                height: `${Math.random() * 4 + 2}px`,
                                animation: `riseBubble ${Math.random() * 10 + 10}s linear infinite`,
                                animationDelay: `-${Math.random() * 10}s`
                            }}
                        />
                    ))}
                    {/* Grid Overlay for Tech Feel */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                </>
            )}
        </div>
    );
});

// A reusable glass container for light mode content (Dashboard style)
export const GlassSurface: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg rounded-3xl ${className}`}>
        {children}
    </div>
);
