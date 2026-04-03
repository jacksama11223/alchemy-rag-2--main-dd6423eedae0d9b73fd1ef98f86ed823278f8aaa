
import React, { useState } from 'react';
import { distillVideoContent } from '../services/geminiService';
import { KnowledgeNode, Quest } from '../types';

interface VideoCourseProps {
    onBack: () => void;
    onShowAbout: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    onAddNodes?: (nodes: KnowledgeNode[]) => void;
    onRegisterQuest?: (quest: Quest) => void; // New prop
    onToggleTodo?: () => void; // Added Prop
}

const VideoCourse: React.FC<VideoCourseProps> = ({ onBack, onShowAbout, onLogout, onShowFAQ, onShowAccount, onAddNodes, onRegisterQuest, onToggleTodo }) => {
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Distillation State
    const [distillationResult, setDistillationResult] = useState<{ nodes: any[], stats: any } | null>(null);
    const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');

    // RESEARCH FEATURES STATE
    const [detailLevel, setDetailLevel] = useState(50); // Topic 2: Semantic Zoom
    const [unlockedMysteries, setUnlockedMysteries] = useState<Set<number>>(new Set()); // Topic 1: Curiosity Gaps
    const [activeWormhole, setActiveWormhole] = useState<number | null>(null); // Topic 3: Wormholes

    const handleProcess = async () => {
        if (!transcript.trim()) return;
        setStep('processing');
        setIsProcessing(true);
        try {
            // Pass semantic zoom level
            const result = await distillVideoContent(transcript, detailLevel);
            setDistillationResult(result);
            setUnlockedMysteries(new Set()); // Reset locks
            setStep('result');
        } catch (e) {
            console.error(e);
            alert("Lỗi khi chưng cất tri thức.");
            setStep('input');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleIntegrate = () => {
        if (!distillationResult || !onAddNodes) return;
        
        const timestamp = new Date();
        const startX = 50 - (distillationResult.nodes.length * 10) / 2; // Center horizontally
        
        // Convert to KnowledgeNodes and Link them sequentially
        const newNodes: KnowledgeNode[] = distillationResult.nodes.map((mod: any, index: number) => {
            return {
                id: Date.now().toString() + Math.random(), 
                title: mod.title,
                type: 'Flashcard', // Default type
                status: 'new',
                tags: mod.tags || ['Distilled'],
                x: startX + index * 15, // Arrange linearly on graph
                y: 50 + (index % 2 === 0 ? 5 : -5), // Zigzag slightly
                timestamp: timestamp,
                data: {
                    summary: mod.summary,
                    flashcards: mod.flashcards?.map((fc: any) => ({
                        front: fc.front,
                        back: fc.back,
                        sm2: { repetitions: 0, interval: 0, efactor: 2.5, nextReviewDate: timestamp.toISOString() }
                    })) || []
                }
            } as KnowledgeNode;
        });

        // Add Sequential Links (Manually update connectedNodeIds)
        for (let i = 0; i < newNodes.length - 1; i++) {
            if (!newNodes[i].connectedNodeIds) newNodes[i].connectedNodeIds = [];
            newNodes[i].connectedNodeIds?.push(newNodes[i+1].id);
        }

        onAddNodes(newNodes);

        // --- NEW: GENERATE QUEST ---
        if (onRegisterQuest) {
            const newQuest: Quest = {
                id: Date.now().toString(),
                title: `Lộ trình: ${newNodes[0].title}...`,
                type: 'LearningPath',
                progress: 0,
                total: newNodes.length,
                reward: "Badge: Speed Learner",
                completed: false,
                description: `Hoàn thành lộ trình học tuyến tính từ video đã chưng cất.`,
                targetNodeIds: newNodes.map(n => n.id)
            };
            onRegisterQuest(newQuest);
            alert(`Đã tích hợp lộ trình học! Kiểm tra Quest Log để bắt đầu.`);
        } else {
            alert(`Đã tích hợp lộ trình học gồm ${newNodes.length} bước vào Sơ đồ!`);
        }
        
        // Reset
        setTranscript('');
        setDistillationResult(null);
        setStep('input');
    };

    return (
        <div className="bg-[#0b1120] font-display text-slate-200 min-h-screen flex flex-col">
            <style>{`
                .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
                .lab-grid {
                    background-image: linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
                .distill-tube {
                    background: linear-gradient(180deg, rgba(56,189,248,0.1) 0%, rgba(56,189,248,0.4) 100%);
                    box-shadow: 0 0 15px rgba(56,189,248,0.3), inset 0 0 10px rgba(56,189,248,0.2);
                }
                @keyframes drip {
                    0% { top: 0; opacity: 1; height: 10px; }
                    100% { top: 100%; opacity: 0; height: 5px; }
                }
                .drip-drop {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    background: #38bdf8;
                    border-radius: 4px;
                    animation: drip 1.5s infinite ease-in;
                }
                /* Semantic Zoom Slider */
                .zoom-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #38bdf8;
                    cursor: pointer;
                    box-shadow: 0 0 10px #38bdf8;
                }
                /* Curiosity Effects */
                .mystery-blur { filter: blur(4px); user-select: none; }
                .wormhole-spin { animation: spin-slow 10s linear infinite; }
            `}</style>
            
            <div className="relative flex min-h-screen w-full flex-col overflow-hidden lab-grid">
                <header className="flex items-center justify-between px-6 py-4 bg-[#0f172a]/90 backdrop-blur-md border-b border-sky-500/20 z-50">
                    <div className="flex items-center gap-3 text-sky-400">
                        <span className="material-symbols-outlined text-3xl">science</span>
                        <h2 className="text-xl font-bold text-white tracking-wider">Phòng Thí Nghiệm Chưng Cất Tri Thức</h2>
                    </div>
                    <div className="flex gap-4">
                        {onToggleTodo && (
                            <button onClick={onToggleTodo} className="text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">checklist</span>
                            </button>
                        )}
                        <button onClick={onShowAccount} className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Tài khoản</button>
                        <button onClick={onLogout} className="text-sm font-bold text-slate-300 hover:text-red-400 transition-colors">Đăng xuất</button>
                    </div>
                </header>

                <main className="flex-grow flex flex-col items-center justify-center p-6 z-10 relative">
                    {/* INPUT PHASE */}
                    {step === 'input' && (
                        <div className="w-full max-w-4xl bg-[#1e293b]/80 backdrop-blur-xl border border-sky-500/30 rounded-2xl shadow-2xl p-8 flex flex-col gap-6 animate-[fadeIn_0.5s]">
                            <button onClick={onBack} className="self-start flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">arrow_back</span> Quay về
                            </button>
                            
                            <div className="text-center">
                                <h1 className="text-4xl font-black text-white mb-2">Nhập Dữ Liệu Thô</h1>
                                <p className="text-slate-400">Hệ thống sẽ lọc bỏ tạp chất và trích xuất tinh thể tri thức.</p>
                            </div>

                            <textarea 
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                className="w-full h-48 bg-black/40 border border-sky-500/20 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-none font-mono text-sm"
                                placeholder="Dán transcript video, bài giảng, hoặc tài liệu dài vào đây..."
                            ></textarea>
                            
                            {/* Research Topic 2: Semantic Zoom */}
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sky-400 font-bold text-sm flex items-center gap-2">
                                        <span className="material-symbols-outlined">zoom_in</span> Semantic Zoom (Độ chi tiết)
                                    </label>
                                    <span className="text-white font-mono">{detailLevel}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="10" max="100" step="10"
                                    value={detailLevel}
                                    onChange={(e) => setDetailLevel(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer zoom-slider"
                                />
                                <div className="flex justify-between text-[10px] text-slate-500 mt-1 uppercase font-bold">
                                    <span>Tóm tắt</span>
                                    <span>Cân bằng</span>
                                    <span>Chi tiết</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleProcess}
                                disabled={!transcript}
                                className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <span className="material-symbols-outlined group-hover:animate-spin">cyclone</span> 
                                Bắt đầu quá trình chưng cất
                            </button>
                        </div>
                    )}

                    {/* PROCESSING PHASE */}
                    {step === 'processing' && (
                        <div className="flex flex-col items-center gap-8">
                            <div className="relative w-24 h-64 border-2 border-sky-500/50 rounded-full overflow-hidden bg-black/30">
                                <div className="absolute bottom-0 left-0 w-full distill-tube animate-[rise_2s_infinite]" style={{ height: '100%' }}></div>
                                <div className="absolute top-0 w-full h-full flex justify-center">
                                    <div className="drip-drop"></div>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-sky-400 animate-pulse">Đang Lọc Nhiễu & Nén Dữ Liệu...</h2>
                            <p className="text-slate-400 max-w-md text-center">AI đang phân tích cấu trúc ngữ nghĩa, loại bỏ thông tin thừa và cô đọng các khái niệm cốt lõi.</p>
                        </div>
                    )}

                    {/* RESULT PHASE */}
                    {step === 'result' && distillationResult && (
                        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 animate-[fadeInUp_0.5s]">
                            {/* Stats Panel */}
                            <div className="w-full lg:w-1/3 bg-[#1e293b]/90 border border-sky-500/30 rounded-2xl p-6 shadow-xl h-fit">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-400">analytics</span> Thông số Kỹ thuật
                                </h3>
                                
                                <div className="space-y-6">
                                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                        <div className="text-slate-400 text-xs uppercase font-bold mb-1">Tỷ lệ Nén</div>
                                        <div className="text-3xl font-black text-sky-400">{distillationResult.stats.compressionRate}</div>
                                        <div className="w-full h-1 bg-gray-700 mt-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-sky-500" style={{ width: distillationResult.stats.compressionRate }}></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                            <div className="text-slate-400 text-xs uppercase font-bold mb-1">Từ Gốc</div>
                                            <div className="text-xl font-bold text-white">{distillationResult.stats.originalWords}</div>
                                        </div>
                                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                            <div className="text-slate-400 text-xs uppercase font-bold mb-1">Sau Lọc</div>
                                            <div className="text-xl font-bold text-green-400">{distillationResult.stats.distilledWords}</div>
                                        </div>
                                    </div>

                                    <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                        <span className="text-slate-400 text-sm font-bold">Độ Nhiễu (Noise)</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${distillationResult.stats.noiseLevel === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {distillationResult.stats.noiseLevel}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleIntegrate}
                                    className="w-full mt-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">save_alt</span> Tích hợp vào Sơ đồ
                                </button>
                                <button 
                                    onClick={() => setStep('input')}
                                    className="w-full mt-3 py-3 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 rounded-xl transition-all"
                                >
                                    Hủy bỏ
                                </button>
                            </div>

                            {/* Path Preview Panel with Curiosity Features */}
                            <div className="w-full lg:w-2/3 bg-[#1e293b]/90 border border-sky-500/30 rounded-2xl p-6 shadow-xl">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-400">route</span> Lộ Trình Tri Thức
                                </h3>
                                
                                <div className="space-y-6 relative">
                                    {/* Connecting Line */}
                                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-sky-500/30 z-0"></div>

                                    {distillationResult.nodes.map((node: any, idx: number) => {
                                        const isLocked = node.isMystery && !unlockedMysteries.has(idx);
                                        const showWormhole = node.wormhole && activeWormhole === idx;

                                        return (
                                            <div key={idx} className="relative z-10 flex gap-4">
                                                {/* Number Bubble */}
                                                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 shadow-lg font-bold transition-all ${isLocked ? 'bg-purple-900 border-purple-500 text-purple-300 animate-pulse' : 'bg-[#0f172a] border-sky-500 text-sky-400'}`}>
                                                    {isLocked ? '?' : idx + 1}
                                                </div>

                                                <div className={`flex-grow p-4 rounded-xl border transition-all relative ${isLocked ? 'bg-purple-900/20 border-purple-500/50 hover:bg-purple-900/30 cursor-pointer' : 'bg-black/20 border-white/5 hover:border-sky-500/50'}`}
                                                     onClick={() => {
                                                         if(isLocked) {
                                                             const newSet = new Set(unlockedMysteries);
                                                             newSet.add(idx);
                                                             setUnlockedMysteries(newSet);
                                                         }
                                                     }}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <h4 className={`text-lg font-bold mb-1 ${isLocked ? 'text-purple-300' : 'text-white'}`}>
                                                            {node.title}
                                                        </h4>
                                                        
                                                        {/* Research Topic 3: Wormhole Icon */}
                                                        {node.wormhole && !isLocked && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setActiveWormhole(activeWormhole === idx ? null : idx); }}
                                                                className="p-1 rounded-full hover:bg-white/10 text-pink-400 animate-spin-slow"
                                                                title="Phát hiện Lỗ sâu kiến thức!"
                                                            >
                                                                <span className="material-symbols-outlined">blur_on</span>
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Research Topic 1: Curiosity Gap Content */}
                                                    {isLocked ? (
                                                        <div className="mt-2">
                                                            <p className="text-purple-200 text-sm font-bold italic mb-2">"{node.mysteryHook}"</p>
                                                            <div className="h-4 bg-purple-500/20 rounded blur-sm w-3/4"></div>
                                                            <div className="text-xs text-purple-400 mt-2 flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-sm">lock</span>
                                                                Click để mở khóa kiến thức
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm text-slate-400 mb-2">{node.summary}</p>
                                                            <div className="flex gap-2">
                                                                {node.tags.map((t: string) => (
                                                                    <span key={t} className="text-[10px] bg-sky-900/30 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">{t}</span>
                                                                ))}
                                                                <span className="text-[10px] bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[10px]">style</span> {node.flashcards?.length || 0} Cards
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}

                                                    {/* Wormhole Reveal */}
                                                    {showWormhole && (
                                                        <div className="mt-3 p-3 bg-pink-900/30 border border-pink-500/30 rounded-lg animate-[fadeIn_0.3s]">
                                                            <div className="flex items-center gap-2 text-pink-300 font-bold text-xs uppercase mb-1">
                                                                <span className="material-symbols-outlined text-sm">public</span>
                                                                Wormhole Detected: {node.wormhole.targetField}
                                                            </div>
                                                            <p className="text-pink-100 text-sm">{node.wormhole.connection}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default React.memo(VideoCourse);
