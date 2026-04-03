
import React, { useState, useEffect } from 'react';
import { generateStructuredNote } from '../../services/geminiService';

interface ChunkingTextProps {
    content: string;
    onComplete: (data: string) => void; // Returns formatted markdown/json string
}

export const ChunkingText: React.FC<ChunkingTextProps> = ({ content, onComplete }) => {
    const [status, setStatus] = useState<'reading' | 'ready' | 'generating'>('reading');
    const [progress, setProgress] = useState(0);

    // Simulate initial reading phase (Faster now)
    useEffect(() => {
        if (content) {
            let p = 0;
            const interval = setInterval(() => {
                p += 10; // Faster increment
                if (p >= 100) {
                    clearInterval(interval);
                    setStatus('ready');
                }
                setProgress(p);
            }, 30); // Faster tick
            return () => clearInterval(interval);
        }
    }, [content]);

    const handleGenerate = async (style: 'feynman' | 'mindmap') => {
        setStatus('generating');
        setProgress(0);
        
        // Progress simulation for generation (Faster feedback loop)
        const interval = setInterval(() => {
            setProgress(prev => Math.min(prev + 5, 95));
        }, 50);

        try {
            const result = await generateStructuredNote(content, style);
            clearInterval(interval);
            setProgress(100);
            onComplete(result);
        } catch (error) {
            console.error(error);
            alert("Lỗi xử lý AI.");
            setStatus('ready');
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-8 animate-fade-in bg-[#1e293b]/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
            
            {status === 'reading' && (
                <div className="text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-cyan-900/50"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                        <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl text-cyan-400 animate-pulse">menu_book</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Đang Quét Nhanh (Fast Scan)...</h2>
                        <p className="text-slate-400">Trích xuất ý chính từ {Math.round(content.length / 1000)}k ký tự...</p>
                    </div>
                    <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-cyan-500 transition-all duration-75" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            {status === 'ready' && (
                <div className="text-center space-y-8 w-full animate-slide-up">
                    <div>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">Sẵn Sàng Tốc Ký</h2>
                        <p className="text-slate-300">Chọn định dạng tóm tắt nhanh:</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <button 
                            onClick={() => handleGenerate('feynman')}
                            className="group p-6 bg-gradient-to-br from-green-900/40 to-teal-900/40 border border-green-500/30 rounded-2xl hover:border-green-400 hover:scale-[1.02] transition-all text-left relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-8xl text-green-400">child_care</span>
                            </div>
                            <span className="material-symbols-outlined text-4xl text-green-400 mb-4 bg-green-500/20 p-3 rounded-xl">school</span>
                            <h3 className="text-xl font-bold text-white mb-2">Feynman Tóm Tắt</h3>
                            <p className="text-sm text-slate-400">Giải thích siêu ngắn gọn, đi thẳng vào bản chất vấn đề. (TL;DR)</p>
                        </button>

                        <button 
                            onClick={() => handleGenerate('mindmap')}
                            className="group p-6 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-2xl hover:border-purple-400 hover:scale-[1.02] transition-all text-left relative overflow-hidden"
                        >
                             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-8xl text-purple-400">account_tree</span>
                            </div>
                            <span className="material-symbols-outlined text-4xl text-purple-400 mb-4 bg-purple-500/20 p-3 rounded-xl">hub</span>
                            <h3 className="text-xl font-bold text-white mb-2">Dàn Ý Cốt Lõi</h3>
                            <p className="text-sm text-slate-400">Chỉ liệt kê các đề mục và từ khóa quan trọng nhất. Cấu trúc Mindmap.</p>
                        </button>
                    </div>
                </div>
            )}

            {status === 'generating' && (
                <div className="text-center space-y-6">
                     <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-purple-900/50"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '0.5s' }}></div>
                        <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl text-purple-400 animate-pulse">auto_awesome</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Đang Tổng Hợp...</h2>
                        <p className="text-slate-400">AI đang viết note cô đọng nhất có thể...</p>
                    </div>
                    <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};
