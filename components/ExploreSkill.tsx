
import React from 'react';
import { FeatureWindowControls } from './FeatureWindowControls';

interface ExploreSkillProps {
    onBack: () => void;
    onShowAbout: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    onGoToFeatures?: () => void;
}

const ExploreSkill: React.FC<ExploreSkillProps> = ({ onBack, onShowAbout, onLogout, onShowFAQ, onShowAccount, onGoToFeatures }) => {
    return (
        <div className="bg-glow-grid-bg font-display text-text-dark min-h-screen flex flex-col">
            <style>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                .grid-bg {
                    background-color: #02041a;
                    background-image:
                        linear-gradient(rgba(34, 211, 238, 0.2), transparent 1px),
                        linear-gradient(90deg, rgba(34, 211, 238, 0.2), transparent 1px),
                        linear-gradient(rgba(240, 225, 74, 0.05), transparent 1px),
                        linear-gradient(90deg, rgba(240, 225, 74, 0.05), transparent 1px);
                    background-size: 70px 70px, 70px 70px, 350px 350px, 350px 350px;
                    background-position: -1px -1px, -1px -1px, -1px -1px, -1px -1px;
                    animation: gridPulse 10s ease-in-out infinite;
                }
                .crystal-button {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    cursor: pointer;
                }
                .crystal-button:hover {
                    transform: scale(1.05);
                    filter: brightness(1.2);
                }
            `}</style>
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
                <main className="flex-grow">
                    <section className="relative min-h-[calc(100vh-160px)] w-full flex flex-col items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8">
                        <div className="absolute inset-0 grid-bg z-0"></div>
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute left-[10%] top-[20%] h-1 w-1 rounded-full bg-neon-yellow animate-ping opacity-75" style={{ animationDelay: '1s' }}></div>
                            <div className="absolute left-[80%] top-[30%] h-1 w-1 rounded-full bg-neon-cyan animate-ping opacity-75" style={{ animationDelay: '3s' }}></div>
                            <div className="absolute left-[50%] top-[70%] h-1.5 w-1.5 rounded-full bg-neon-yellow animate-ping opacity-75" style={{ animationDelay: '2s' }}></div>
                            <div className="absolute left-[25%] top-[85%] h-1 w-1 rounded-full bg-neon-cyan animate-ping opacity-75"></div>
                            <div className="absolute left-[90%] top-[90%] h-1 w-1 rounded-full bg-neon-yellow animate-ping opacity-75" style={{ animationDelay: '4s' }}></div>
                            <div className="absolute rounded-full bg-white/10 animate-bubble w-3 h-3 left-[15%] bottom-0" style={{ animationDuration: '9s', animationDelay: '1s' }}></div>
                            <div className="absolute rounded-full bg-white/10 animate-bubble w-5 h-5 left-[35%] bottom-0" style={{ animationDuration: '7s', animationDelay: '3s' }}></div>
                            <div className="absolute rounded-full bg-white/10 animate-bubble w-2 h-2 left-[65%] bottom-0" style={{ animationDuration: '11s', animationDelay: '0.5s' }}></div>
                            <div className="absolute rounded-full bg-white/10 animate-bubble w-4 h-4 left-[80%] bottom-0" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
                        </div>
                        <div className="absolute top-6 right-6 z-30">
                            <FeatureWindowControls onClose={onBack} />
                        </div>
                        <div className="relative z-10 w-full max-w-5xl bg-black/30 backdrop-blur-lg border border-sky-blue/30 rounded-2xl shadow-lg p-8">
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-bold text-white tracking-wider">Ma Trận Kỹ Năng</h1>
                                <p className="text-text-muted-dark mt-2">Chọn một loại kỹ năng để khám phá mạng lưới tri thức</p>
                            </div>
                            <div className="relative w-full aspect-square max-w-lg mx-auto">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="crystal-button flex flex-col items-center justify-center p-4 w-32 h-32 bg-crystal-purple/20 border border-crystal-purple/50 rounded-full shadow-glow-purple backdrop-blur-sm">
                                        <span className="material-symbols-outlined text-crystal-purple text-5xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}>code</span>
                                        <span className="mt-2 text-sm font-semibold text-white text-center">Lập trình</span>
                                    </div>
                                </div>
                                <div className="absolute inset-0" style={{ transform: 'rotate(72deg)' }}>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[130%]">
                                        <div className="crystal-button flex flex-col items-center justify-center p-4 w-32 h-32 bg-crystal-blue/20 border border-crystal-blue/50 rounded-full shadow-glow-blue backdrop-blur-sm">
                                            <span className="material-symbols-outlined text-crystal-blue text-5xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}>local_pharmacy</span>
                                            <span className="mt-2 text-sm font-semibold text-white text-center">Y khoa</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0" style={{ transform: 'rotate(144deg)' }}>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[130%]">
                                        <div className="crystal-button flex flex-col items-center justify-center p-4 w-32 h-32 bg-crystal-gold/20 border border-crystal-gold/50 rounded-full shadow-glow-gold backdrop-blur-sm">
                                            <span className="material-symbols-outlined text-crystal-gold text-5xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}>monitoring</span>
                                            <span className="mt-2 text-sm font-semibold text-white text-center">Kinh tế</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0" style={{ transform: 'rotate(216deg)' }}>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[130%]">
                                        <div className="crystal-button flex flex-col items-center justify-center p-4 w-32 h-32 bg-crystal-green/20 border border-crystal-green/50 rounded-full shadow-glow-green backdrop-blur-sm">
                                            <span className="material-symbols-outlined text-crystal-green text-5xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}>psychology_alt</span>
                                            <span className="mt-2 text-sm font-semibold text-white text-center">Triết học</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0" style={{ transform: 'rotate(288deg)' }}>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[130%]">
                                        <div className="crystal-button flex flex-col items-center justify-center p-4 w-32 h-32 bg-crystal-pink/20 border border-crystal-pink/50 rounded-full shadow-glow-pink backdrop-blur-sm">
                                            <span className="material-symbols-outlined text-crystal-pink text-5xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}>brush</span>
                                            <span className="mt-2 text-sm font-semibold text-white text-center">Nghệ thuật</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default React.memo(ExploreSkill);
