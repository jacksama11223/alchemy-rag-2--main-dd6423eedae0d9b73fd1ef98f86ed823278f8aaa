import React, { useState } from 'react';

interface SplitScreenEditorProps {
    leftContent: React.ReactNode;
    rightContent: React.ReactNode;
    onClose?: () => void;
}

export const SplitScreenEditor: React.FC<SplitScreenEditorProps> = ({ leftContent, rightContent, onClose }) => {
    const [splitRatio, setSplitRatio] = useState(50); // percentage

    const handleDrag = (e: React.MouseEvent) => {
        // Implement drag logic to resize panels
        const newRatio = (e.clientX / window.innerWidth) * 100;
        if (newRatio > 20 && newRatio < 80) {
            setSplitRatio(newRatio);
        }
    };

    return (
        <div className="flex w-full h-full bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
            <div className="h-full overflow-y-auto p-4" style={{ width: `${splitRatio}%` }}>
                {leftContent}
            </div>
            
            <div 
                className="w-2 bg-slate-200 hover:bg-sky-500 cursor-col-resize flex flex-col justify-center items-center z-10 transition-colors"
                onMouseDown={(e) => {
                    const container = e.currentTarget.parentElement;
                    if (!container) return;
                    const rect = container.getBoundingClientRect();
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                        const newRatio = ((moveEvent.clientX - rect.left) / rect.width) * 100;
                        if (newRatio > 20 && newRatio < 80) {
                            setSplitRatio(newRatio);
                        }
                    };
                    const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                }}
            >
                <div className="h-8 w-1 bg-slate-400 rounded-full"></div>
            </div>

            <div className="h-full overflow-y-auto p-4" style={{ width: `${100 - splitRatio}%` }}>
                {rightContent}
            </div>

            {onClose && (
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            )}
        </div>
    );
};
