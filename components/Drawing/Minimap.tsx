
import React from 'react';

export const Minimap: React.FC = () => {
    return (
        <div className="absolute bottom-6 right-6 w-32 h-24 bg-[#1e1e1e] border border-white/20 rounded-lg shadow-xl overflow-hidden z-30 opacity-80 hover:opacity-100 transition-opacity hidden md:block">
            <div className="w-full h-full relative bg-black/20">
                {/* Mock content representation */}
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-[40%] left-[60%] w-4 h-1 bg-white/50 rounded"></div>
                
                {/* Viewport frame */}
                <div className="absolute top-1/2 left-1/2 w-16 h-10 border-2 border-amber-400 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(251,191,36,0.3)]"></div>
            </div>
        </div>
    );
};
