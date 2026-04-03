
import React, { useMemo } from 'react';

export const Environment: React.FC<{ speedMultiplier: number }> = ({ speedMultiplier }) => {
    
    // Generate random space dust once
    const dustParticles = useMemo(() => {
        return Array.from({length: 80}).map((_, i) => ({
            x: (Math.random()-0.5) * 3000,
            y: (Math.random()-0.5) * 2000,
            z: (Math.random()-0.5) * 3000,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.1
        }));
    }, []);

    return (
        <>
            {/* Warp Effect Overlay */}
            {speedMultiplier > 1 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500/10 to-transparent pointer-events-none z-0 warp-speed"></div>
            )}

            {/* --- AXIS GUIDES (Spatial Mnemonic Anchors) --- */}
            
            {/* X-AXIS: Timeline */}
            <div className="axis-line" style={{ width: '4000px', height: '2px', left: '-2000px', top: '0', background: 'linear-gradient(90deg, transparent, blue, transparent)' }}></div>
            <div className="spatial-label text-blue-500/50" style={{ transform: 'translate3d(-1200px, 0, 0)' }}>QUÁ KHỨ</div>
            <div className="spatial-label text-blue-500/50" style={{ transform: 'translate3d(1000px, 0, 0)' }}>TƯƠNG LAI</div>

            {/* Y-AXIS: Complexity */}
            <div className="axis-line" style={{ width: '2px', height: '4000px', left: '0', top: '-2000px', background: 'linear-gradient(180deg, transparent, purple, transparent)' }}></div>
            <div className="spatial-label text-purple-500/50" style={{ transform: 'translate3d(100px, -800px, 0) rotateZ(-90deg)', fontSize: '60px' }}>TRỪU TƯỢNG</div>
            <div className="spatial-label text-purple-500/50" style={{ transform: 'translate3d(100px, 800px, 0) rotateZ(-90deg)', fontSize: '60px' }}>CỤ THỂ</div>

            {/* Z-AXIS: Mastery Markers */}
            <div className="spatial-label text-red-500/30" style={{ transform: 'translate3d(0, 200px, 500px)', fontSize: '40px' }}>⚠️ CẦN ÔN TẬP</div>
            <div className="spatial-label text-green-500/30" style={{ transform: 'translate3d(0, 200px, -1000px)', fontSize: '40px' }}>✅ ĐÃ TINH THÔNG</div>

            {/* Space Dust */}
            {dustParticles.map((p, i) => (
                <div 
                    key={`dust-${i}`} 
                    className="absolute rounded-full bg-white"
                    style={{
                        width: `${p.size}px`, height: `${p.size}px`,
                        opacity: p.opacity,
                        transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px)`
                    }}
                />
            ))}
        </>
    );
};
