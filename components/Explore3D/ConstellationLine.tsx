
import React from 'react';

interface ConstellationLineProps {
    x1: number; y1: number; z1: number;
    x2: number; y2: number; z2: number;
    color: string;
}

export const ConstellationLine: React.FC<ConstellationLineProps> = ({ x1, y1, z1, x2, y2, z2, color }) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;
    const length = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    // Calculate rotation angles
    const angleZ = Math.atan2(dy, dx) * (180 / Math.PI);
    // Approximate Y rotation for 3D effect in CSS transform
    const angleY = Math.atan2(dz, dx) * (180 / Math.PI); 

    return (
        <div 
            className="absolute transform-gpu"
            style={{
                width: `${length}px`,
                height: '1px',
                backgroundColor: color,
                opacity: 0.3,
                left: 0, top: 0,
                transformOrigin: '0 50%',
                // Translate to start point, then rotate to point to end point
                transform: `translate3d(${x1}px, ${y1}px, ${z1}px) rotateZ(${angleZ}deg) rotateY(${-angleY}deg)`,
                pointerEvents: 'none'
            }}
        />
    );
};
