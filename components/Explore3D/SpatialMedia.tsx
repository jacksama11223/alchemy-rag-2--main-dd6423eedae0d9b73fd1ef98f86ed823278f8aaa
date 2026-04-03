
import React from 'react';

// 53. VideoMonolith
export const VideoMonolith: React.FC<{ x: number, y: number, z: number }> = ({ x, y, z }) => (
    <div className="absolute transform-gpu bg-black border border-slate-700 w-48 h-32 flex items-center justify-center cursor-pointer hover:border-cyan-500" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
        <span className="material-symbols-outlined text-4xl text-white opacity-50">play_circle</span>
    </div>
);

// 54. ImageGalleryCube
export const ImageGalleryCube: React.FC<{ x: number, y: number, z: number }> = ({ x, y, z }) => (
    <div className="absolute transform-gpu w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 animate-[spin-slow_10s_linear_infinite]" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white">IMG</div>
    </div>
);

// 55. AudioEmitterSphere
export const AudioEmitterSphere: React.FC<{ x: number, y: number, z: number }> = ({ x, y, z }) => (
    <div className="absolute transform-gpu w-10 h-10 bg-purple-500/50 rounded-full flex items-center justify-center animate-pulse cursor-pointer" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
        <span className="material-symbols-outlined text-white text-sm">music_note</span>
    </div>
);

// 56. TextCrawlIntro
export const TextCrawlIntro: React.FC = () => (
    <div className="fixed inset-0 z-50 pointer-events-none flex justify-center items-end pb-20 perspective-[300px]">
        <div className="text-yellow-400 font-bold text-center animate-[rise-fade_20s_linear_forwards] transform rotate-x-20 opacity-0">
            <h1 className="text-4xl mb-4">EPISODE IV</h1>
            <p className="max-w-md mx-auto">A NEW KNOWLEDGE...</p>
        </div>
    </div>
);

// 57. PDFHolocron
export const PDFHolocron: React.FC<{ x: number, y: number, z: number }> = ({ x, y, z }) => (
    <div className="absolute transform-gpu w-12 h-12 bg-blue-900/80 border-2 border-blue-400 transform rotate-45 flex items-center justify-center shadow-[0_0_20px_blue]" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px) rotateZ(45deg)` }}>
        <span className="material-symbols-outlined text-white -rotate-45">picture_as_pdf</span>
    </div>
);

// 58. CodeTerminalBlock
export const CodeTerminalBlock: React.FC<{ x: number, y: number, z: number }> = ({ x, y, z }) => (
    <div className="absolute transform-gpu bg-black/90 border border-green-500/50 p-2 w-48 font-mono text-[8px] text-green-500" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
        &gt; npm install knowledge<br/>
        &gt; compiling...
    </div>
);
