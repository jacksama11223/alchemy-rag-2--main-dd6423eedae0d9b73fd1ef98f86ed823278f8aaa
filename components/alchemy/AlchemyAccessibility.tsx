
import React, { useState, useEffect } from 'react';

// 1. Dyslexia Font Toggle
export const DyslexiaFontToggle: React.FC = () => {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        if (enabled) {
            document.body.classList.add('font-dyslexic'); // Assuming you'd have a CSS class for this
            document.body.style.fontFamily = '"Comic Sans MS", "Chalkboard SE", sans-serif'; // Fallback
        } else {
            document.body.classList.remove('font-dyslexic');
            document.body.style.fontFamily = '';
        }
    }, [enabled]);

    return (
        <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-sm text-slate-300">Phông chữ hỗ trợ khó đọc</span>
            <button 
                onClick={() => setEnabled(!enabled)}
                className={`w-10 h-5 rounded-full relative transition-colors ${enabled ? 'bg-green-500' : 'bg-slate-600'}`}
            >
                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${enabled ? 'left-6' : 'left-1'}`}></div>
            </button>
        </div>
    );
};

// 2. High Contrast Mode
export const HighContrastMode: React.FC = () => {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        if (enabled) {
            document.documentElement.style.filter = 'contrast(1.5)';
        } else {
            document.documentElement.style.filter = '';
        }
    }, [enabled]);

    return (
        <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-sm text-slate-300">Tương phản cao</span>
            <button 
                onClick={() => setEnabled(!enabled)}
                className={`w-10 h-5 rounded-full relative transition-colors ${enabled ? 'bg-green-500' : 'bg-slate-600'}`}
            >
                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${enabled ? 'left-6' : 'left-1'}`}></div>
            </button>
        </div>
    );
};

// 3. Text Size Slider
export const TextSizeSlider: React.FC = () => {
    const [size, setSize] = useState(100);

    useEffect(() => {
        document.documentElement.style.fontSize = `${size}%`;
    }, [size]);

    return (
        <div className="py-2 border-b border-white/5">
            <div className="flex justify-between text-sm text-slate-300 mb-1">
                <span>Cỡ chữ</span>
                <span>{size}%</span>
            </div>
            <input 
                type="range" 
                min="80" max="150" step="10" 
                value={size} 
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-white"
            />
        </div>
    );
};

// 4. Keyboard Map Modal (Table view)
export const KeyboardMapTable: React.FC = () => {
    return (
        <div className="py-2 border-b border-white/5">
            <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-sm text-slate-300 list-none">
                    <span>Bảng phím tắt</span>
                    <span className="material-symbols-outlined text-sm group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="mt-2 bg-black/20 rounded p-2 text-xs space-y-1 text-slate-400">
                    <div className="flex justify-between"><span>Tạo mới</span> <kbd>Ctrl+Enter</kbd></div>
                    <div className="flex justify-between"><span>Tìm kiếm</span> <kbd>Ctrl+K</kbd></div>
                    <div className="flex justify-between"><span>Đóng modal</span> <kbd>Esc</kbd></div>
                </div>
            </details>
        </div>
    );
};

// 5. Screen Reader Label (Utility Component)
export const ScreenReaderLabel: React.FC<{ text: string }> = ({ text }) => {
    return (
        <span className="sr-only">{text}</span>
    );
};
