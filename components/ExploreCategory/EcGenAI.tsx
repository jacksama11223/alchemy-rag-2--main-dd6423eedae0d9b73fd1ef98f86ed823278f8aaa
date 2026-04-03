
import React, { useState } from 'react';

// 11. AIPromptRefiner
export const AIPromptRefiner: React.FC = () => (
    <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-xl mb-4">
        <div className="flex gap-2 mb-2">
            <input className="flex-1 bg-black/20 border border-white/10 rounded px-3 py-1.5 text-xs text-white" placeholder="Nhập yêu cầu thô sơ..." />
            <button className="text-indigo-400 hover:text-white bg-indigo-600/20 px-2 rounded hover:bg-indigo-600/40 border border-indigo-500/30"><span className="material-symbols-outlined text-sm">auto_fix</span></button>
        </div>
        <p className="text-[10px] text-slate-400 italic">✨ AI Suggestion: "Hãy giải thích khái niệm này cho học sinh lớp 5 với ví dụ thực tế..."</p>
    </div>
);

// 12. ContentSummarizerBot
export const ContentSummarizerBot: React.FC = () => (
    <button className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-600/30 transition-colors">
        <span className="material-symbols-outlined text-sm">summarize</span> TL;DR (Tóm tắt)
    </button>
);

// 13. ImageGenCanvas
export const ImageGenCanvas: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-8 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#1e293b] p-6 rounded-2xl max-w-lg w-full border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-white font-bold mb-4">AI Illustrator</h3>
                <div className="aspect-square bg-black/40 rounded-xl mb-4 flex items-center justify-center border border-dashed border-slate-600">
                    <span className="text-slate-500 text-xs">Ảnh sẽ xuất hiện ở đây...</span>
                </div>
                <div className="flex gap-2">
                    <input className="flex-1 bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white" placeholder="Mô tả ảnh..." />
                    <button className="bg-purple-600 text-white px-4 rounded font-bold hover:bg-purple-500">Vẽ</button>
                </div>
            </div>
        </div>
    );
};

// 14. QuizFabricator
export const QuizFabricator: React.FC = () => (
    <button className="w-full mt-2 py-2 border border-dashed border-orange-500/50 text-orange-300 hover:bg-orange-500/10 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
        <span className="material-symbols-outlined text-sm">psychology_alt</span>
        Tạo đề thi từ bài này
    </button>
);

// 15. VoiceOverSynthesizer
export const VoiceOverSynthesizer: React.FC = () => (
    <div className="flex items-center gap-2 bg-[#0f172a] p-2 rounded-full border border-white/10 shadow-lg">
        <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
            <span className="material-symbols-outlined text-sm">play_arrow</span>
        </button>
        <div className="h-6 w-24 bg-slate-800 rounded overflow-hidden flex items-center px-1 gap-0.5">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="w-1.5 bg-cyan-500/50 rounded-full" style={{ height: `${Math.random() * 100}%` }}></div>
            ))}
        </div>
        <span className="text-[10px] text-slate-400 font-mono">AI Voice</span>
    </div>
);
