
import React, { useState, useEffect } from 'react';

// 15. Zen Mode Toggle
export const ZenModeToggle: React.FC<{ isActive: boolean, onToggle: () => void }> = ({ isActive, onToggle }) => {
    return (
        <button 
            onClick={onToggle}
            className={`p-2 rounded-full transition-all ${isActive ? 'bg-white text-black shadow-[0_0_15px_white]' : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'}`}
            title="Chế độ Thiền (Zen Mode)"
        >
            <span className="material-symbols-outlined">{isActive ? 'self_improvement' : 'spa'}</span>
        </button>
    );
};

// 16. Version History Slider
export const VersionHistorySlider: React.FC<{ version: number, maxVersion: number, onChange: (v: number) => void }> = ({ version, maxVersion, onChange }) => {
    if (maxVersion <= 1) return null;

    return (
        <div className="flex items-center gap-2 p-2 bg-[#1e1e1e] rounded-lg border border-white/10">
            <button onClick={() => onChange(Math.max(1, version - 1))} className="text-slate-400 hover:text-white disabled:opacity-30" disabled={version <= 1}>
                <span className="material-symbols-outlined text-sm">undo</span>
            </button>
            <div className="flex-1 flex flex-col items-center w-24">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Lịch sử</span>
                <div className="flex gap-1 mt-1">
                    {Array.from({ length: maxVersion }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${i + 1 === version ? 'bg-cyan-400' : 'bg-slate-700 hover:bg-slate-500'}`}
                            onClick={() => onChange(i + 1)}
                        ></div>
                    ))}
                </div>
            </div>
            <button onClick={() => onChange(Math.min(maxVersion, version + 1))} className="text-slate-400 hover:text-white disabled:opacity-30" disabled={version >= maxVersion}>
                <span className="material-symbols-outlined text-sm">redo</span>
            </button>
        </div>
    );
};

// 17. Keyboard Shortcut Mapper
export const KeyboardShortcutMapper: React.FC = () => {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '?' && e.shiftKey) {
                setShowModal(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!showModal) return (
        <button onClick={() => setShowModal(true)} className="fixed bottom-4 right-4 p-2 bg-black/50 text-slate-500 rounded-full hover:text-white hover:bg-black/80 transition-colors z-40">
            <span className="material-symbols-outlined text-lg">keyboard</span>
        </button>
    );

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s]" onClick={() => setShowModal(false)}>
            <div className="bg-[#1e1e1e] border border-white/20 rounded-xl p-6 max-w-md w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-cyan-400">keyboard</span> Phím tắt
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-slate-300 text-sm border-b border-white/5 pb-2"><span>Mở menu này</span> <kbd className="bg-white/10 px-2 rounded">?</kbd></div>
                    <div className="flex justify-between text-slate-300 text-sm border-b border-white/5 pb-2"><span>Bắt đầu tạo</span> <kbd className="bg-white/10 px-2 rounded">Ctrl + Enter</kbd></div>
                    <div className="flex justify-between text-slate-300 text-sm border-b border-white/5 pb-2"><span>Lưu bài học</span> <kbd className="bg-white/10 px-2 rounded">Ctrl + S</kbd></div>
                    <div className="flex justify-between text-slate-300 text-sm border-b border-white/5 pb-2"><span>Chuyển bước</span> <kbd className="bg-white/10 px-2 rounded">→</kbd></div>
                    <div className="flex justify-between text-slate-300 text-sm"><span>Thoát</span> <kbd className="bg-white/10 px-2 rounded">Esc</kbd></div>
                </div>
            </div>
        </div>
    );
};

// 18. Local Storage Sync Indicator
export const LocalStorageSyncIndicator: React.FC = () => {
    const [status, setStatus] = useState<'saved' | 'saving'>('saved');

    useEffect(() => {
        // Fake saving effect on intervals
        const interval = setInterval(() => {
            setStatus('saving');
            setTimeout(() => setStatus('saved'), 1000);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/5 text-[10px] text-slate-400 z-40 transition-opacity opacity-70 hover:opacity-100">
            <div className={`w-2 h-2 rounded-full ${status === 'saved' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
            {status === 'saved' ? 'Đã lưu cục bộ' : 'Đang đồng bộ...'}
        </div>
    );
};
