
import React from 'react';

interface SpaceNodeProps {
    node: {
        id: string;
        x: number;
        y: number;
        z: number;
        color: string;
        label: string;
        mastery: number;
    };
    isSelected: boolean;
    onClick: (node: any) => void;
}

export const SpaceNode: React.FC<SpaceNodeProps> = ({ node, isSelected, onClick }) => {
    const isWeak = node.mastery < 30;

    return (
        <div 
            className="absolute flex flex-col items-center justify-center cursor-pointer group transform-gpu"
            onClick={(e) => { e.stopPropagation(); onClick(node); }}
            style={{ 
                transform: `translate3d(${node.x}px, ${node.y}px, ${node.z}px)`,
                width: '40px', height: '40px',
                transformStyle: 'preserve-3d'
            }}
        >
            {/* Node Core (Planet) */}
            <div 
                className={`rounded-full transition-all duration-300 ${isSelected ? 'scale-150 ring-4 ring-white shadow-[0_0_30px_white]' : 'group-hover:scale-125'}`} 
                style={{ 
                    width: isWeak ? '30px' : '15px', 
                    height: isWeak ? '30px' : '15px',
                    backgroundColor: node.color, 
                    boxShadow: `0 0 ${isWeak ? '30px' : '15px'} ${node.color}`,
                    opacity: isWeak ? 1 : 0.8
                }}
            >
                {/* Pulse Animation for weak nodes (Attention needed) */}
                {isWeak && (
                    <div 
                        className="absolute inset-0 rounded-full animate-ping opacity-75" 
                        style={{ backgroundColor: node.color }}
                    ></div>
                )}
            </div>

            {/* Label (Billboard effect simulated by standard div in 3D context) */}
            <div 
                className={`mt-2 px-2 py-1 rounded bg-black/60 text-white text-[10px] whitespace-nowrap border border-white/10 backdrop-blur-sm transition-all duration-300 ${
                    isSelected || isWeak ? 'opacity-100 scale-110' : 'opacity-60 group-hover:opacity-100 scale-100'
                }`}
                style={{ textShadow: '0 1px 2px black' }}
            >
                {node.label}
            </div>
            
            {/* Mastery Bar below node */}
            <div className={`mt-1 w-12 h-1 bg-white/20 rounded-full overflow-hidden transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <div 
                    className="h-full transition-all duration-500" 
                    style={{ 
                        width: `${node.mastery}%`, 
                        backgroundColor: node.mastery > 70 ? '#22c55e' : node.mastery > 30 ? '#eab308' : '#ef4444' 
                    }}
                ></div>
            </div>
        </div>
    );
};
