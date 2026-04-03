
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { FactChecker, KeywordHighlighter, MagicRewrite, SemanticExpander, BiasDetector, SocraticRewriter } from './AlchemyRefinementTools';
import { FormatExporter, CollectionBinder, SocialShareCard, FeedbackLoop } from './AlchemyOutputTools';
import { TextToSpeechPlayer, GlossaryTooltip } from './AlchemyContentRenderers';
import { logAlchemyAction, getCurrentUser } from '../../services/mockBackend'; 

// Initializing AI 
const getAI = () => {
    const customKey = localStorage.getItem('custom_gemini_api_key');
    return new GoogleGenAI({ apiKey: customKey || process.env.API_KEY || '' });
};

interface AlchemyStageProps {
    title?: string;
    onRefine?: (type: any) => void;
    onNext?: () => void;
    data?: any;
    setData?: (data: any) => void;
    sourceContent?: string; 
}

// ----------------------------------------------------------------------
// 1. METHOD SELECTOR: Light Mode
// ----------------------------------------------------------------------

interface MethodSelectorProps {
    onSelect: (method: string) => void;
    sourceContent?: string;
}

export const MethodSelector: React.FC<MethodSelectorProps> = ({ onSelect, sourceContent }) => {
    const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);
    const [recommendation, setRecommendation] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        if (sourceContent && !recommendation) {
            setAnalyzing(true);
            setTimeout(() => {
                const len = sourceContent.length;
                if (len < 500) setRecommendation('exam_magic_notes');
                else if (sourceContent.includes('?') || sourceContent.toLowerCase().includes('quiz')) setRecommendation('exam_mcq_gen');
                else if (sourceContent.includes('19') || sourceContent.includes('20')) setRecommendation('strat_study_plan'); 
                else setRecommendation('arch_concept_expand');
                setAnalyzing(false);
            }, 1000);
        }
    }, [sourceContent]);

    const methods = [
        // The Architect
        { id: 'arch_quick_node', category: 'The Architect', icon: 'database', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Quick Capture to Node', desc: 'Tạo 1 KnowledgeNode mới trên sơ đồ.' },
        { id: 'arch_concept_expand', category: 'The Architect', icon: 'layers', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Concept Expansion', desc: 'Mở rộng concept thành các node liên kết.' },
        { id: 'arch_connector', category: 'The Architect', icon: 'hub', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', label: 'The Connector', desc: 'Tìm điểm chung và nối các node lại.' },
        { id: 'arch_auto_hierarchy', category: 'The Architect', icon: 'account_tree', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Auto-Hierarchy', desc: 'Tự động phân cấp tài liệu thành sơ đồ.' },
        { id: 'arch_url_to_graph', category: 'The Architect', icon: 'link', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', label: 'URL to Graph', desc: 'Trích xuất thực thể từ bài viết thành Graph.' },
        { id: 'arch_yt_to_graph', category: 'The Architect', icon: 'smart_display', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Video to Graph', desc: 'Chuyển transcript video thành sơ đồ tư duy.' },
        
        // The Examiner
        { id: 'exam_magic_notes', category: 'The Examiner', icon: 'style', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', label: 'Magic Notes to Cards', desc: 'Tự động tạo bộ flashcard từ ghi chú.' },
        { id: 'exam_mcq_gen', category: 'The Examiner', icon: 'quiz', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', label: 'MCQ Generator', desc: 'Tạo câu hỏi trắc nghiệm từ tài liệu.' },
        { id: 'exam_cloze_del', category: 'The Examiner', icon: 'edit_note', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', label: 'Cloze Deletion', desc: 'Tạo flashcard điền vào chỗ trống.' },
        
        // The Refiner
        { id: 'ref_tldr', category: 'The Refiner', icon: 'bolt', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: 'TL;DR Summarize', desc: 'Tóm tắt ngắn gọn nội dung dài.' },
        { id: 'ref_eli5', category: 'The Refiner', icon: 'child_care', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Explain Like I\'m 5', desc: 'Giải thích khái niệm phức tạp một cách đơn giản.' },
        { id: 'ref_key_takeaways', category: 'The Refiner', icon: 'key', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Key Takeaways', desc: 'Trích xuất các ý chính quan trọng nhất.' },

        // The Explorer
        { id: 'exp_find_similar', category: 'The Explorer', icon: 'search', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Find Similar Concepts', desc: 'Tìm các concept tương tự trong Graph.' },
        { id: 'exp_contradictions', category: 'The Explorer', icon: 'difference', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Find Contradictions', desc: 'Tìm các thông tin mâu thuẫn với dữ liệu.' },

        // The Strategist
        { id: 'strat_study_plan', category: 'The Strategist', icon: 'calendar_month', color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-200', label: 'Generate Study Plan', desc: 'Tạo lộ trình học tập từ mục tiêu.' },
        { id: 'strat_spaced_rep', category: 'The Strategist', icon: 'update', color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-200', label: 'Spaced Repetition', desc: 'Lên lịch ôn tập tối ưu.' },

        // The Creator
        { id: 'crea_blog_post', category: 'The Creator', icon: 'draw', color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-200', label: 'Draft Blog Post', desc: 'Viết nháp bài blog từ các ý chính.' },
        { id: 'crea_analogy', category: 'The Creator', icon: 'lightbulb', color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-200', label: 'Generate Analogy', desc: 'Tạo phép ẩn dụ để dễ nhớ.' },
    ];

    const groupedMethods = methods.reduce((acc, method) => {
        if (!acc[method.category]) acc[method.category] = [];
        acc[method.category].push(method);
        return acc;
    }, {} as Record<string, typeof methods>);

    return (
        <div className="w-full max-w-6xl mx-auto py-10 animate-fade-in-up">
            <div className="text-center mb-12 relative">
                <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600 mb-4 drop-shadow-sm">Chọn Phương Thức Chế Tạo</h2>
                <p className="text-slate-500 text-xl font-medium">Bạn muốn chuyển hóa dữ liệu thô thành dạng tri thức nào?</p>
                
                {/* AI Recommendation Badge */}
                <div className={`absolute top-0 right-0 max-w-xs text-left bg-white/90 backdrop-blur-xl border border-sky-200 p-4 rounded-xl shadow-xl transition-all duration-500 ${analyzing || recommendation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`material-symbols-outlined text-sky-500 ${analyzing ? 'animate-spin' : ''}`}>
                            {analyzing ? 'settings_suggest' : 'auto_awesome'}
                        </span>
                        <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">AI Suggestion</span>
                    </div>
                    {analyzing ? (
                        <p className="text-xs text-slate-500">Đang phân tích nội dung đầu vào...</p>
                    ) : (
                        <p className="text-sm text-slate-700">
                            Dựa trên dữ liệu, tôi đề xuất: <strong className="text-sky-600">{methods.find(m => m.id === recommendation)?.label}</strong> để tối ưu hóa việc học.
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-12 px-4">
                {Object.entries(groupedMethods).map(([category, categoryMethods]) => (
                    <div key={category}>
                        <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-2">{category}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categoryMethods.map((method) => {
                                const isRecommended = recommendation === method.id;
                                const isHovered = hoveredMethod === method.id;

                                return (
                                    <button
                                        key={method.id}
                                        onClick={() => onSelect(method.id)}
                                        onMouseEnter={() => setHoveredMethod(method.id)}
                                        onMouseLeave={() => setHoveredMethod(null)}
                                        className={`relative flex flex-col p-8 rounded-3xl border-2 transition-all duration-300 group text-left h-full overflow-hidden ${
                                            isHovered 
                                            ? `${method.bg} ${method.border} shadow-xl scale-[1.02] z-10` 
                                            : `bg-white/80 ${isRecommended ? 'border-sky-400 shadow-lg ring-2 ring-sky-100' : 'border-slate-100 hover:border-slate-300 shadow-sm'}`
                                        }`}
                                    >
                                        {/* Recommended Label */}
                                        {isRecommended && (
                                            <div className="absolute top-0 right-0 bg-sky-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest z-20 shadow-md">
                                                Recommended
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div className={`p-5 rounded-2xl bg-white shadow-sm border border-slate-100 ${isHovered ? 'scale-110 rotate-3' : ''} transition-transform duration-500`}>
                                                <span className={`material-symbols-outlined text-4xl ${method.color}`}>{method.icon}</span>
                                            </div>
                                            {isHovered && (
                                                <span className="material-symbols-outlined text-slate-400 text-3xl animate-bounce-right">arrow_forward</span>
                                            )}
                                        </div>
                                        
                                        <h3 className={`text-2xl font-bold mb-3 text-slate-800`}>
                                            {method.label}
                                        </h3>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                            {method.desc}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 2. PROCESSING VIEW (Light Mode)
// ----------------------------------------------------------------------

interface ProcessingViewProps {
    status: string;
    progress: number;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({ status, progress }) => {
    const [thoughtProcess, setThoughtProcess] = useState<string[]>([]);
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const thoughts = [
            "Deconstructing input semantics...",
            "Checking factual consistency against knowledge base...",
            "Identifying key entities and relationships...",
            "Structuring learning pathways...",
            "Optimizing for memory retention (SM-2)...",
            "Generating metadata and tags...",
            "Finalizing output schema..."
        ];
        
        if (progress > 0) {
            const index = Math.floor((progress / 100) * thoughts.length);
            if (thoughtProcess[thoughtProcess.length-1] !== thoughts[index] && thoughts[index]) {
                setThoughtProcess(prev => [...prev, thoughts[index]]);
            }
        }
    }, [progress]);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [thoughtProcess]);

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center py-20 animate-fade-in">
            {/* Central Core */}
            <div className="relative mb-16">
                <div className="absolute inset-0 bg-sky-200/50 blur-[80px] rounded-full animate-pulse"></div>
                
                {/* Orbital Rings */}
                <div className="absolute inset-[-50px] border border-sky-200 rounded-full animate-[spin-slow_10s_linear_infinite]"></div>
                <div className="absolute inset-[-30px] border border-purple-200 rounded-full animate-[spin-slow_7s_linear_infinite_reverse]"></div>

                <div className="w-64 h-64 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center relative shadow-2xl z-10">
                    <svg className="w-full h-full -rotate-90 absolute top-0 left-0">
                        <circle cx="128" cy="128" r="120" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                        <circle 
                            cx="128" cy="128" r="120" 
                            fill="none" stroke="url(#gradient)" strokeWidth="6" 
                            strokeDasharray="754" 
                            strokeDashoffset={754 - (754 * progress) / 100} 
                            strokeLinecap="round"
                            className="transition-all duration-300 ease-out"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#0ea5e9" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                    </svg>
                    
                    <div className="text-center z-20 flex flex-col items-center">
                        <span className="text-6xl font-black text-slate-800 tracking-tighter">
                            {Math.round(progress)}%
                        </span>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                            <span className="text-xs text-sky-600 font-bold uppercase tracking-widest">Reasoning</span>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-8 animate-pulse">{status}</h3>

            {/* Neural Log Terminal (Light Theme) */}
            <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 overflow-hidden shadow-xl font-mono text-xs relative">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex gap-2 items-center">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <span className="ml-2 text-slate-500">gemini_core_v3.log</span>
                </div>
                <div className="p-6 h-48 overflow-y-auto space-y-2 relative bg-white">
                    {thoughtProcess.map((log, i) => (
                        <div key={i} className="flex gap-2 animate-[fadeIn_0.2s]">
                            <span className="text-slate-400">[{new Date().toLocaleTimeString()}]</span>
                            <span className="text-sky-600 font-medium">&gt; {log}</span>
                        </div>
                    ))}
                    <div ref={logEndRef} />
                    <div className="animate-pulse text-purple-500">_</div>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 3. REFINEMENT VIEW (Light Mode)
// ----------------------------------------------------------------------

interface RefinementViewProps extends AlchemyStageProps {
    isHighlighterActive: boolean;
    toggleHighlighter: () => void;
    initialContent?: string;
}

export const RefinementView: React.FC<RefinementViewProps> = ({ 
    title, onRefine, onNext, isHighlighterActive, toggleHighlighter, initialContent 
}) => {
    const [content, setContent] = useState(initialContent || "Đang tải nội dung...");
    const [activeTool, setActiveTool] = useState<string | null>(null);

    const currentUser = getCurrentUser();
    const logUsage = (toolName: string) => {
        if (currentUser) logAlchemyAction(currentUser.id, currentUser.name, 'Refined Content', toolName);
    };

    useEffect(() => {
        if (initialContent) setContent(initialContent);
    }, [initialContent]);

    const handleApplyChange = (newContent: string) => {
        setContent(newContent);
    };

    return (
        <div className="w-full h-full flex flex-col relative animate-fade-in rounded-3xl overflow-hidden bg-white/50 border border-white/60 shadow-2xl">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 bg-white/80 border-b border-slate-100 backdrop-blur-md sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white shadow-md">
                        <span className="material-symbols-outlined">science</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{title || "Untitled Project"}</h3>
                        <p className="text-xs text-slate-500">Chế độ tinh chỉnh nội dung</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button onClick={onNext} className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all flex items-center gap-2">
                        <span>Hoàn tất</span>
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                    </button>
                </div>
            </div>

            {/* Workspace Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Editor */}
                <div className="flex-1 bg-white relative flex flex-col">
                    <div className="flex-1 relative overflow-y-auto p-8 custom-scrollbar">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-full bg-transparent text-slate-800 text-lg leading-relaxed resize-none focus:outline-none font-mono placeholder-slate-400"
                            spellCheck={false}
                        />
                    </div>
                    
                    <div className="h-12 bg-slate-50 border-t border-slate-200 flex items-center px-4 gap-4 text-xs text-slate-500">
                        <span>Markdown Supported</span>
                        <span>{content.length} chars</span>
                        <div className="flex-1"></div>
                        <TextToSpeechPlayer text={content} />
                    </div>
                </div>

                {/* Right: AI Tools Panel */}
                <div className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col shadow-inner z-20">
                    <div className="p-4 border-b border-slate-200">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Bộ Công Cụ AI</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => { setActiveTool('fact'); logUsage('Fact Checker'); }} className={`p-3 rounded-xl border text-left transition-all ${activeTool === 'fact' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                                <span className="material-symbols-outlined text-xl mb-1 block">fact_check</span>
                                <span className="text-xs font-bold">Check Fact</span>
                            </button>
                            <button onClick={() => { setActiveTool('rewrite'); logUsage('Magic Rewrite'); }} className={`p-3 rounded-xl border text-left transition-all ${activeTool === 'rewrite' ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                                <span className="material-symbols-outlined text-xl mb-1 block">auto_fix</span>
                                <span className="text-xs font-bold">Rewrite</span>
                            </button>
                            <button onClick={() => { setActiveTool('expand'); logUsage('Semantic Expander'); }} className={`p-3 rounded-xl border text-left transition-all ${activeTool === 'expand' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                                <span className="material-symbols-outlined text-xl mb-1 block">unfold_more</span>
                                <span className="text-xs font-bold">Mở rộng</span>
                            </button>
                            <button onClick={() => { setActiveTool('bias'); logUsage('Bias Detector'); }} className={`p-3 rounded-xl border text-left transition-all ${activeTool === 'bias' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                                <span className="material-symbols-outlined text-xl mb-1 block">balance</span>
                                <span className="text-xs font-bold">Bias Check</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {activeTool === 'fact' && <FactChecker />}
                        {activeTool === 'rewrite' && <MagicRewrite onRewrite={(mode) => console.log(mode)} />}
                        {activeTool === 'expand' && <SemanticExpander text={content} onExpand={handleApplyChange} />}
                        {activeTool === 'bias' && <BiasDetector text={content} />}
                        {!activeTool && (
                            <div className="text-center text-slate-400 mt-10">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-30">build</span>
                                <p className="text-sm">Chọn một công cụ để bắt đầu tinh chỉnh.</p>
                            </div>
                        )}
                        <div className="mt-8 pt-4 border-t border-slate-200">
                            <KeywordHighlighter active={isHighlighterActive} onToggle={toggleHighlighter} />
                            <div className="h-4"></div>
                            <SocraticRewriter />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 4. RESULT VIEW (Light Mode)
// ----------------------------------------------------------------------

interface ResultViewProps {
    isScanningResonance: boolean;
    resonanceMatches: { id: string, title: string, reason: string }[];
    onLinkNode: (id: string) => void;
    onReset: () => void;
    onGoToGraph: () => void;
    onPublish?: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ 
    isScanningResonance, resonanceMatches, onLinkNode, onReset, onGoToGraph, onPublish
}) => {
    return (
        <div className="w-full max-w-5xl mx-auto py-10 animate-fade-in-up">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 border-4 border-green-500 mb-6 shadow-lg shadow-green-200">
                    <span className="material-symbols-outlined text-6xl text-green-600">rocket_launch</span>
                </div>
                <h2 className="text-4xl font-black text-slate-800 mb-2">Chế tạo thành công!</h2>
                <p className="text-slate-500 font-medium">Kiến thức mới đã được thêm vào kho tàng của bạn.</p>
                <div className="mt-2 inline-block bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                    Đã đồng bộ vào Sơ đồ Tri thức
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Actions */}
                <div className="space-y-4">
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-lg">
                        <h4 className="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">settings</span> Tùy chọn
                        </h4>
                        <div className="space-y-3">
                            <FormatExporter />
                            <CollectionBinder />
                            <SocialShareCard />
                            
                            {onPublish && (
                                <button 
                                    onClick={onPublish}
                                    className="w-full p-3 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl border border-purple-200 transition-all flex items-center justify-center gap-2 group font-bold"
                                >
                                    <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">public</span>
                                    <span>Xuất bản lên Thư viện</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <button onClick={onReset} className="w-full py-4 rounded-xl border border-slate-200 hover:bg-white/50 text-slate-500 font-bold transition-all bg-white shadow-sm">
                        + Tạo bài mới
                    </button>
                </div>

                {/* Center: Resonance Scanner */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-lg lg:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <span className="material-symbols-outlined text-9xl text-slate-900">hub</span>
                    </div>
                    
                    <h4 className="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-2 relative z-10">
                        <span className="material-symbols-outlined text-blue-500">psychology</span> Liên kết ngữ nghĩa (Semantic Resonance)
                    </h4>

                    <div className="bg-slate-50 rounded-xl p-4 min-h-[200px] relative z-10 border border-slate-200">
                        {isScanningResonance ? (
                            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-4">
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="animate-pulse font-medium">Đang quét toàn bộ Graph để tìm liên kết...</p>
                            </div>
                        ) : resonanceMatches.length > 0 ? (
                            <div className="space-y-3">
                                {resonanceMatches.map(match => (
                                    <div key={match.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
                                        <div>
                                            <h5 className="font-bold text-slate-800 text-sm">{match.title}</h5>
                                            <p className="text-xs text-slate-500 mt-0.5">{match.reason}</p>
                                        </div>
                                        <button 
                                            onClick={() => onLinkNode(match.id)}
                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Link
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500 italic">
                                Không tìm thấy liên kết phù hợp.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-center">
                <button 
                    onClick={onGoToGraph}
                    className="group px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 text-xl border-4 border-white/20"
                >
                    <span className="material-symbols-outlined text-3xl group-hover:animate-ping">explore</span>
                    Khám phá trong Sơ đồ Graph
                </button>
            </div>
            
            <div className="mt-8">
                <FeedbackLoop />
            </div>
        </div>
    );
};
