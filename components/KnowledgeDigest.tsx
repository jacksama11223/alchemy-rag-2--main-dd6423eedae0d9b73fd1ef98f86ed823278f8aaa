
import React, { useState, useEffect } from 'react';
import { generateMentalModel } from '../services/geminiService';
import { FeatureWindowControls } from './FeatureWindowControls';

interface KnowledgeDigestProps {
    onBack: () => void;
    onShowAbout: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    initialText?: string;
    onExplodeToFlashcards?: (content: string) => void; // New prop: Bridge to Alchemy
}

const KnowledgeDigest: React.FC<KnowledgeDigestProps> = ({ onBack, onShowAbout, onLogout, onShowFAQ, onShowAccount, initialText, onExplodeToFlashcards }) => {
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [mentalModels, setMentalModels] = useState<any[]>([]);

    useEffect(() => {
        if (initialText) {
            setInputText(initialText);
        }
    }, [initialText]);

    const handleExtract = async () => {
        if (!inputText.trim()) return;
        setIsProcessing(true);
        try {
            const result = await generateMentalModel(inputText);
            if (result && result.models) {
                setMentalModels(result.models);
            }
        } catch (e) {
            console.error(e);
            alert("Có lỗi khi phân tích mental model.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExplode = () => {
        if (mentalModels.length === 0) return;
        const summaryText = mentalModels.map(m => `Model: ${m.title}\nDesc: ${m.description}\nApp: ${m.application}`).join('\n\n');
        if (onExplodeToFlashcards) {
            onExplodeToFlashcards(summaryText);
        }
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#020a1a] group/design-root overflow-x-hidden font-display">
            {/* Background Layers */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#03102d] via-[#051e48] to-[#012d26] opacity-90"></div>
            <img 
                alt="Underwater sacred garden with bioluminescent plants and ancient ruins" 
                className="absolute inset-0 w-full h-full object-cover opacity-15 z-0" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOwBbddQ-MP9UgXIUfN4w08iKkMlLT1lmcKekZN9OJB69pVuOVEVwUn8_lyYzV9eB6C3D1rrbe4dgd5RSQ4IXpUxvjih2SjJC6fkuzSb2LPjD5knydjj1IuI6L5G_0Nj5xySZmqaQCqJkg416LgzEwQ2D8Ktl325ZBIkJyTCqpfcD6ycsgO24Vb4GxsnCFUd5FE1FkNkF9naJD8ux4dIBS8NGMOinP-Mi1o6xbWE_U9qmmsq4Act3qcDwphuV0O387HOL8dMsQgPZt"
            />

            {/* Content Container */}
            <div className="layout-container flex h-full grow flex-col relative z-20">
                <header className="flex items-center justify-between whitespace-nowrap px-10 py-3 font-display bg-gradient-to-b from-[#03102d]/50 to-transparent">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2.5 text-xl font-bold text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
                            <span className="material-symbols-outlined text-3xl">menu_book</span>
                            <span>Tiêu Hóa Kiến Thức</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <FeatureWindowControls onClose={onBack} />
                    </div>
                </header>

                <main className="flex-grow flex flex-col items-center px-4 py-8">
                    <div className="w-full max-w-6xl">
                        <div className="w-full flex justify-start mb-6">
                            <button 
                                onClick={onBack}
                                className="flex items-center justify-center rounded-xl h-10 px-4 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] bg-black/20 hover:bg-black/40 transition-colors backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                            >
                                <span className="material-symbols-outlined text-white" style={{ fontSize: '20px', fontWeight: 700 }}>arrow_back</span>
                                <span>Quay về</span>
                            </button>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-lg border border-cyan-400/20 rounded-xl shadow-2xl shadow-cyan-500/10 p-8 flex flex-col lg:flex-row gap-8 items-start">
                            <div className="w-full lg:w-1/3 flex flex-col gap-6 items-center">
                                <h1 className="text-white text-3xl font-black leading-tight tracking-[-0.033em] [text-shadow:0_2px_10px_rgba(56,189,248,0.3)] text-center">Bộ Lọc Tư Duy</h1>
                                <p className="text-cyan-200 text-center text-sm">Nạp kiến thức thô, AI sẽ tinh lọc thành các mô hình tư duy cốt lõi (Mental Models).</p>
                                <div className="w-full space-y-4">
                                    <textarea 
                                        className="form-textarea w-full h-48 resize-none rounded-lg text-white placeholder:text-cyan-300/60 bg-cyan-900/30 border-2 border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 p-3 text-sm" 
                                        placeholder="Dán văn bản, ghi chú hoặc nội dung bài học vào đây..."
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                    ></textarea>
                                    <button 
                                        onClick={handleExtract}
                                        disabled={isProcessing || !inputText.trim()}
                                        className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-amber-500 text-white gap-3 text-base font-bold leading-normal shadow-lg shadow-amber-500/30 hover:bg-amber-400 hover:shadow-glow-yellow transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                    >
                                        <span className={`material-symbols-outlined ${isProcessing ? 'animate-spin' : ''}`}>auto_awesome</span>
                                        <span>{isProcessing ? 'Đang phân tích...' : 'Trích xuất Insight'}</span>
                                    </button>
                                </div>
                            </div>
                            <div className="w-full lg:w-2/3">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-amber-300 [text-shadow:0_1px_5px_rgba(252,211,77,0.4)]">Key Mental Models</h2>
                                    {mentalModels.length > 0 && (
                                        <button 
                                            onClick={handleExplode}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
                                        >
                                            <span className="material-symbols-outlined text-sm">local_fire_department</span>
                                            Bùng nổ (Tạo thẻ)
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-500/30">
                                    {mentalModels.length === 0 ? (
                                        <div className="text-center text-cyan-500/50 py-12 border-2 border-dashed border-cyan-500/20 rounded-lg">
                                            Chưa có dữ liệu phân tích. Hãy nhập nội dung bên trái.
                                        </div>
                                    ) : (
                                        mentalModels.map((model, idx) => (
                                            <div key={idx} className="bg-blue-900/30 border-2 border-blue-400/40 rounded-lg p-4 backdrop-blur-sm shadow-lg hover:shadow-glow-blue-2 transition-all duration-300 animate-[fadeIn_0.5s]">
                                                <h3 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-amber-300">psychology</span> 
                                                    {model.title}
                                                </h3>
                                                <p className="text-cyan-100/90 mt-2 text-sm">{model.description}</p>
                                                <div className="mt-3 pt-3 border-t border-white/10">
                                                    <span className="text-xs font-bold text-emerald-400 uppercase">Ứng dụng:</span>
                                                    <p className="text-emerald-100/80 text-sm mt-1">{model.application}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default React.memo(KnowledgeDigest);
