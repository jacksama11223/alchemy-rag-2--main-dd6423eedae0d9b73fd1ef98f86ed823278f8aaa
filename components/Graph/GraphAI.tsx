
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

// Initialize AI Client
const getAI = () => {
    const customKey = localStorage.getItem('custom_gemini_api_key');
    return new GoogleGenAI({ apiKey: customKey || process.env.API_KEY || '' });
};

// ----------------------------------------------------------------------
// 1. AIChatAssistant: Deep Reasoning Graph Analyst
// ----------------------------------------------------------------------

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    isThinking?: boolean;
    timestamp: Date;
}

export const AIChatAssistant: React.FC<{ 
    isOpen: boolean, 
    onToggle: () => void, 
    contextNodes?: any[],
    isFocusMode?: boolean 
}> = ({ isOpen, onToggle, contextNodes = [], isFocusMode = false }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'model', text: "Tôi là Trợ lý Phân Tích Mạng Lưới (Network Analyst). Tôi hỗ trợ phát hiện các liên kết ẩn, đề xuất hướng nghiên cứu mới và giải thích các cấu trúc tri thức phức tạp.", timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isOpen]);

    // Update initial message or status when focus mode changes
    useEffect(() => {
        if (isFocusMode && contextNodes.length > 0) {
             setMessages(prev => [...prev, { 
                 id: Date.now().toString(), 
                 role: 'model', 
                 text: `🔒 CHẾ ĐỘ TẬP TRUNG: Đang phân tích chuyên sâu "${contextNodes[0].title}". Mọi đề xuất sẽ liên quan chặt chẽ đến ngữ cảnh khái niệm này.`, 
                 timestamp: new Date() 
            }]);
        }
    }, [isFocusMode, contextNodes]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        try {
            // Context Preparation
            let graphContext = "";
            let systemInstruction = "";

            if (isFocusMode && contextNodes.length > 0) {
                 // STRICT CONTEXT
                 graphContext = `FOCUSED NODE: ${JSON.stringify(contextNodes[0])}. Ignore all other graph nodes.`;
                 systemInstruction = "You are in Focus Mode. Provide answers ONLY related to the FOCUSED NODE. Do not suggest exploring unrelated topics.";
            } else {
                 // BROAD CONTEXT
                 graphContext = contextNodes.length > 0 
                    ? `Current Graph Context: ${contextNodes.map(n => `${n.title} (${n.type})`).join(', ')}. ` 
                    : "Analyzing the entire knowledge graph structure. ";
                 systemInstruction = "You are a Graph Analyst. Explore connections freely.";
            }

            const prompt = `${systemInstruction} \n ${graphContext} \n User Query: ${input}`;

            const ai = getAI();
            // Call Gemini 2.5 Flash with Thinking Budget
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 16000 }, // Standard thinking budget (Max 24k)
                }
            });

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: response.text || "Hiện tại chưa thể trích xuất thông tin.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("AI Graph Error:", error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Hệ thống đang xử lý lượng dữ liệu lớn. Vui lòng thử lại sau.", timestamp: new Date() }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className={`absolute bottom-24 right-6 z-40 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'w-[450px] h-[600px] opacity-100' : 'w-12 h-12 opacity-0 pointer-events-none'}`}>
            <div className={`w-full h-full bg-[#0f172a]/95 backdrop-blur-xl border ${isFocusMode ? 'border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)]' : 'border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)]'} rounded-2xl flex flex-col overflow-hidden relative transition-all duration-500`}>
                
                {/* Header */}
                <div className={`p-4 flex justify-between items-center border-b transition-colors ${isFocusMode ? 'bg-amber-900/30 border-amber-500/30' : 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-cyan-500/20'}`}>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className={`material-symbols-outlined text-2xl ${isFocusMode ? 'text-amber-400' : 'text-cyan-300'}`}>
                                {isFocusMode ? 'filter_center_focus' : 'psychology'}
                            </span>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#0f172a] rounded-full animate-pulse"></div>
                        </div>
                        <div>
                            <span className={`font-bold text-sm block ${isFocusMode ? 'text-amber-100' : 'text-cyan-100'}`}>
                                {isFocusMode ? 'Phân Tích Chuyên Sâu' : 'Trí Tuệ Mạng Lưới'}
                            </span>
                            <span className={`text-[10px] font-mono ${isFocusMode ? 'text-amber-400/70' : 'text-cyan-400/70'}`}>
                                Gemini 2.5 Flash • {isFocusMode ? 'Phạm Vi Giới Hạn' : 'Chế Độ Suy Luận'}
                            </span>
                        </div>
                    </div>
                    <button onClick={onToggle} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full">
                        <span className="material-symbols-outlined text-xl">close_fullscreen</span>
                    </button>
                </div>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-cyan-900/50">
                    {messages.map((m) => (
                        <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'model' ? (isFocusMode ? 'bg-amber-900/50 text-amber-300' : 'bg-cyan-900/50 text-cyan-300') : 'bg-slate-700 text-slate-300'}`}>
                                <span className="material-symbols-outlined text-sm">{m.role === 'model' ? 'smart_toy' : 'person'}</span>
                            </div>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                                m.role === 'user' 
                                ? 'bg-cyan-600 text-white rounded-tr-none' 
                                : 'bg-[#1e293b] border border-white/10 text-slate-200 rounded-tl-none'
                            }`}>
                                <div className="whitespace-pre-wrap">{m.text}</div>
                                <div className={`text-[9px] mt-1 opacity-50 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                                    {m.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {isThinking && (
                        <div className="flex gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center animate-pulse ${isFocusMode ? 'bg-amber-900/50 text-amber-300' : 'bg-cyan-900/50 text-cyan-300'}`}>
                                <span className="material-symbols-outlined text-sm">smart_toy</span>
                            </div>
                            <div className="bg-[#1e293b] border border-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <div className="flex space-x-1">
                                    <div className={`w-2 h-2 rounded-full animate-bounce ${isFocusMode ? 'bg-amber-400' : 'bg-cyan-400'}`}></div>
                                    <div className={`w-2 h-2 rounded-full animate-bounce delay-75 ${isFocusMode ? 'bg-amber-400' : 'bg-cyan-400'}`}></div>
                                    <div className={`w-2 h-2 rounded-full animate-bounce delay-150 ${isFocusMode ? 'bg-amber-400' : 'bg-cyan-400'}`}></div>
                                </div>
                                <span className={`text-xs font-bold italic animate-pulse ${isFocusMode ? 'text-amber-400' : 'text-cyan-400'}`}>
                                    {isFocusMode ? "Đang phân tích đối tượng..." : "Đang suy luận sâu..."}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-[#020617]/50 backdrop-blur-md">
                    <div className="flex gap-2 relative">
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                            className={`w-full bg-[#1e293b] border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 resize-none h-12 pr-12 scrollbar-hide placeholder-slate-500 transition-all ${isFocusMode ? 'border-amber-500/30 focus:border-amber-500/50 focus:ring-amber-500/50' : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/50'}`}
                            placeholder={isFocusMode ? "Truy vấn về dữ liệu đang chọn..." : "Truy vấn sâu về cấu trúc tri thức..."}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || isThinking}
                            className={`absolute right-2 top-2 p-1.5 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105 active:scale-95 ${isFocusMode ? 'bg-amber-600 hover:bg-amber-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                        >
                            <span className="material-symbols-outlined text-lg">arrow_upward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... (Rest of components: SuggestionPopover, AutoTaggingService, ConceptExpander, AIChatToggle, LearningPathOverlay)
// [Assuming previous components remain unchanged, re-exporting them for context]
export const SuggestionPopover: React.FC<{ x: number, y: number, visible: boolean }> = ({ x, y, visible }) => {
    if (!visible) return null;
    return (
        <div className="absolute z-50 bg-[#1e293b]/95 border border-amber-500/50 p-4 rounded-xl w-64 shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-bounce-in backdrop-blur-md" style={{ left: x, top: y }}>
            <div className="flex items-center gap-2 mb-2 text-amber-400">
                <span className="material-symbols-outlined text-lg animate-pulse">lightbulb</span>
                <span className="text-xs font-bold uppercase tracking-wider">AI Insight</span>
            </div>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Phát hiện mối liên hệ tiềm năng giữa <strong className="text-white">"State Management"</strong> và <strong className="text-white">"React Context"</strong>.
            </p>
            <div className="flex gap-2">
                <button className="flex-1 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-lg transition-transform hover:scale-105 active:scale-95">
                    Thiết lập liên kết
                </button>
                <button className="px-3 py-1.5 border border-white/10 hover:bg-white/10 text-slate-400 rounded-lg text-[10px] transition-colors">
                    Bỏ qua
                </button>
            </div>
        </div>
    );
};

export const AutoTaggingService: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'scanning' | 'tagging'>('idle');
    const [scannedCount, setScannedCount] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            const random = Math.random();
            if (random > 0.95) {
                setStatus('scanning');
                setTimeout(() => {
                    setStatus('tagging');
                    setScannedCount(prev => prev + 1);
                    setTimeout(() => setStatus('idle'), 2000);
                }, 1500);
            }
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    if (status === 'idle' && scannedCount === 0) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 px-4 py-2 bg-[#0f172a]/90 border border-white/10 rounded-full shadow-xl backdrop-blur-md transition-all">
            <div className="relative">
                <span className={`material-symbols-outlined text-lg ${status === 'tagging' ? 'text-purple-400 animate-spin' : 'text-slate-400'}`}>
                    {status === 'tagging' ? 'autorenew' : 'smart_toy'}
                </span>
                {status === 'tagging' && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>
                )}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    {status === 'idle' ? 'Giám Sát AI' : status === 'scanning' ? 'Đang quét mạng lưới...' : 'Đang gán nhãn dữ liệu...'}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                    Đã xử lý: {scannedCount} khái niệm
                </span>
            </div>
        </div>
    );
};

export const ConceptExpander: React.FC<{ onExpand: () => void }> = ({ onExpand }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="absolute top-1/2 right-6 -translate-y-1/2 z-30 flex flex-col items-end gap-2">
            <button 
                onClick={onExpand}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.4)] border border-purple-400/30 transition-all hover:scale-110 hover:rotate-3 active:scale-95"
            >
                <span className="material-symbols-outlined text-2xl text-white animate-pulse">all_inclusive</span>
                
                {/* Orbital Rings */}
                <div className="absolute inset-0 rounded-2xl border border-white/20 scale-125 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500"></div>
                <div className="absolute inset-0 rounded-2xl border border-purple-500/50 scale-110 opacity-0 group-hover:opacity-100 group-hover:rotate-45 transition-all duration-700"></div>
            </button>

            {/* Explanation Tooltip */}
            <div className={`bg-[#1e293b] border border-purple-500/30 px-4 py-2 rounded-xl shadow-xl text-right transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
                <h4 className="text-purple-300 font-bold text-xs uppercase">Mở rộng phạm vi nghiên cứu</h4>
                <p className="text-xs text-slate-400">AI tự động khởi tạo các khái niệm liên quan.</p>
            </div>
        </div>
    );
};

export const AIChatToggle: React.FC<{ isOpen: boolean, onToggle: () => void }> = ({ isOpen, onToggle }) => (
    <button 
        onClick={onToggle} 
        className={`fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl z-30 group ${
            isOpen 
            ? 'bg-red-500 text-white rotate-180 hover:bg-red-600' 
            : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white hover:scale-110 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]'
        }`}
    >
        <span className="material-symbols-outlined text-2xl">{isOpen ? 'close' : 'smart_toy'}</span>
        
        {/* Notification Badge */}
        {!isOpen && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-[#020410] rounded-full animate-bounce"></span>
        )}
    </button>
);

export const LearningPathOverlay: React.FC<{ active: boolean, currentStep?: number, totalSteps?: number, title?: string }> = ({ active, currentStep = 1, totalSteps = 10, title }) => {
    if (!active) return null;
    return (
        <div className="absolute bottom-6 left-6 z-30 bg-black/80 backdrop-blur-md pl-4 pr-6 py-3 rounded-full border border-green-500/50 flex items-center gap-4 shadow-[0_0_20px_rgba(34,197,94,0.2)] animate-slide-up">
            <div className="relative">
                <span className="material-symbols-outlined text-green-400 animate-pulse text-2xl">route</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></div>
            </div>
            <div>
                <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider block mb-0.5">Tiến độ: {title || 'Nhiệm vụ hiện tại'}</span>
                <span className="text-sm font-bold text-white">Giai đoạn {currentStep}/{totalSteps}</span>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white font-bold transition-colors flex items-center gap-1">
                Tiếp tục <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
        </div>
    );
};
