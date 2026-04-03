import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWindowContext } from './Dashboard-MultiTasking/components/WindowContext';

interface FeatureWindowControlsProps {
    onClose: () => void;
    onMinimize?: () => void;
    className?: string;
}

export const FeatureWindowControls: React.FC<FeatureWindowControlsProps> = ({ onClose, onMinimize, className = '' }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const windowContext = useWindowContext();

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (windowContext) {
            windowContext.toggleMaximize();
            return;
        }
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const handleMinimize = () => {
        if (windowContext) {
            windowContext.minimizeWindow();
        } else if (onMinimize) {
            onMinimize();
        } else {
            onClose();
        }
    };

    const handleClose = () => {
        if (windowContext) {
            windowContext.removeWindow();
        } else {
            onClose();
        }
    };

    const handlePiP = () => {
        if (windowContext) {
            windowContext.togglePiP();
        }
    };

    const isMaximized = windowContext ? windowContext.isMaximized : isFullscreen;
    const isPiP = windowContext ? windowContext.isPiP : false;

    // If in PiP mode and inside a window, we want to render the controls outside the main content
    // But since this component is rendered inside the content, we can use absolute positioning
    // to place it on the right side, outside the window bounds.
    // Note: The parent Window component must NOT have overflow-hidden for this to work.
    const pipStyles = isPiP ? "absolute -right-12 top-4 flex-col !ml-0 pointer-events-auto" : "";

    const controlsContent = (
        <div className={`flex items-center gap-2 ml-4 bg-slate-800/80 p-1.5 rounded-xl border border-white/20 backdrop-blur-md shadow-lg z-[100] cancel-drag ${pipStyles} ${className}`}>
            {windowContext && (
                <button 
                    onClick={handlePiP} 
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-200 hover:text-white transition-colors shadow-sm" 
                    title="Picture-in-Picture"
                >
                    <span className="material-symbols-outlined text-[16px]">{isPiP ? 'fullscreen' : 'picture_in_picture_alt'}</span>
                </button>
            )}
            <button 
                onClick={handleMinimize} 
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-200 hover:text-white transition-colors shadow-sm" 
                title="Minimize"
            >
                <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <button 
                onClick={toggleFullscreen} 
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-200 hover:text-white transition-colors shadow-sm" 
                title={isMaximized ? "Restore" : "Maximize"}
            >
                <span className="material-symbols-outlined text-[16px]">{isMaximized ? 'close_fullscreen' : 'crop_square'}</span>
            </button>
            <button 
                onClick={handleClose} 
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-red-500 text-slate-200 hover:text-white transition-colors shadow-sm" 
                title="Close"
            >
                <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
        </div>
    );

    if (isPiP && windowContext?.portalContainer) {
        return createPortal(controlsContent, windowContext.portalContainer);
    }

    return controlsContent;
};
