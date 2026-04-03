
import React, { useState, useEffect } from 'react';

export const QuickNoteWidget: React.FC = () => {
    const [note, setNote] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('learnai_quicknote');
        if (saved) setNote(saved);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNote(e.target.value);
        localStorage.setItem('learnai_quicknote', e.target.value);
    };

    return (
        <div className={`fixed bottom-24 right-6 z-40 transition-all duration-300 ${isOpen ? 'w-64 h-64' : 'w-12 h-12'}`}>
            <div className="relative w-full h-full bg-[#1e1e1e] border border-[#333] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {isOpen ? (
                    <>
                        <div className="bg-[#252525] p-2 flex justify-between items-center border-b border-[#333]">
                            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">lightbulb</span> Nháp
                            </span>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                                <span className="material-symbols-outlined text-sm">close_fullscreen</span>
                            </button>
                        </div>
                        <textarea 
                            className="flex-1 bg-transparent p-3 text-sm text-slate-200 resize-none focus:outline-none placeholder-slate-600"
                            placeholder="Ghi nhanh ý tưởng..."
                            value={note}
                            onChange={handleChange}
                        />
                    </>
                ) : (
                    <button 
                        onClick={() => setIsOpen(true)} 
                        className="w-full h-full flex items-center justify-center bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 transition-colors"
                        title="Ghi chú nhanh"
                    >
                        <span className="material-symbols-outlined text-xl">edit_note</span>
                    </button>
                )}
            </div>
        </div>
    );
};
