
import React, { useState, useEffect, useRef } from 'react';

// --- SHARED TYPES ---
interface Message {
    id: string;
    role: 'ai' | 'user' | 'system';
    text: string;
    timestamp: Date;
}

// ----------------------------------------------------------------------
// 1. SOCRATIC CHAT BOT: Full Embedded Chat
// ----------------------------------------------------------------------

export const SocraticChatBot: React.FC<{ context: string }> = ({ context }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'ai', text: "Chào bạn! Tôi là Socrates. Dựa trên nội dung bài học, bạn có thắc mắc gì không?", timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isOpen]);

    const handleSend = () => {
        if(!input.trim()) return;
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Mock AI Response
        setTimeout(() => {
            const aiMsg: Message = { 
                id: (Date.now()+1).toString(), 
                role: 'ai', 
                text: "Câu hỏi rất thú vị. Tại sao bạn lại nghĩ như vậy? Liệu có góc nhìn nào khác mâu thuẫn với điều đó không?", 
                timestamp: new Date() 
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className={`fixed bottom-6 left-6 z-[60] transition-all duration-500 ease-in-out ${isOpen ? 'w-96 h-[500px]' : 'w-14 h-14'}`}>
            <div className={`bg-[#0f172a] border border-cyan-500/50 rounded-2xl shadow-2xl w-full h-full flex flex-col overflow-hidden relative transition-all ${isOpen ? 'opacity-100' : 'opacity-100 hover:scale-110'}`}>
                
                {/* Header */}
                {isOpen ? (
                    <div className="bg-gradient-to-r from-cyan-900/80 to-blue-900/80 p-4 flex justify-between items-center border-b border-cyan-500/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                <span className="material-symbols-outlined text-cyan-300 text-xl">psychology</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Socrates AI</h3>
                                <p className="text-[10px] text-cyan-200 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="text-slate-300 hover:text-white p-1 hover:bg-white/10 rounded"><span className="material-symbols-outlined text-lg">refresh</span></button>
                            <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white p-1 hover:bg-white/10 rounded"><span className="material-symbols-outlined text-lg">close_fullscreen</span></button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setIsOpen(true)} className="w-full h-full flex items-center justify-center bg-cyan-600 text-white hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/40 rounded-full">
                        <span className="material-symbols-outlined text-3xl">psychology_alt</span>
                    </button>
                )}

                {/* Body */}
                {isOpen && (
                    <>
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
                            {messages.map((m) => (
                                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                                        m.role === 'user' 
                                        ? 'bg-cyan-600 text-white rounded-br-none' 
                                        : 'bg-[#1e293b] border border-white/10 text-slate-200 rounded-bl-none'
                                    }`}>
                                        {m.text}
                                        <div className="text-[9px] opacity-50 mt-1 text-right">{m.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-[#1e293b] border border-white/10 p-3 rounded-2xl rounded-bl-none flex gap-1 items-center">
                                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-[#1e293b] border-t border-white/10">
                            <div className="flex gap-2 items-center bg-black/30 rounded-xl px-3 py-2 border border-white/10 focus-within:border-cyan-500/50 transition-colors">
                                <input 
                                    value={input} 
                                    onChange={(e) => setInput(e.target.value)} 
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Hỏi Socrates..." 
                                    className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
                                />
                                <button 
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className="text-cyan-400 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 2. EXAM SIMULATOR: Comprehensive Testing Tool
// ----------------------------------------------------------------------

export const ExamSimulator: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'running' | 'finished'>('idle');
    const [timeLeft, setTimeLeft] = useState(15 * 60); 
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);

    const totalQuestions = 10;

    useEffect(() => {
        let interval: any;
        if (status === 'running' && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && status === 'running') {
            setStatus('finished');
        }
        return () => clearInterval(interval);
    }, [status, timeLeft]);

    const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

    if (status === 'idle') {
        return (
            <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-6 text-center shadow-lg my-4">
                <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                    <span className="material-symbols-outlined text-3xl text-red-400">timer</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Phòng Thi Giả Lập</h3>
                <p className="text-slate-400 text-sm mb-6">10 câu hỏi • 15 phút • Độ khó cao</p>
                <button 
                    onClick={() => setStatus('running')}
                    className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg shadow-red-600/30 transition-all hover:scale-105"
                >
                    Bắt đầu làm bài
                </button>
            </div>
        );
    }

    if (status === 'finished') {
        return (
            <div className="bg-[#1e1e1e] border border-green-500/30 rounded-xl p-6 text-center shadow-lg my-4">
                <span className="material-symbols-outlined text-5xl text-green-400 mb-4">emoji_events</span>
                <h3 className="text-xl font-bold text-white mb-2">Hoàn thành!</h3>
                <p className="text-slate-400 text-sm mb-4">Bạn đã trả lời {answers.length}/{totalQuestions} câu hỏi.</p>
                <div className="flex gap-4 justify-center">
                    <button className="px-6 py-2 border border-slate-500 text-slate-300 rounded-lg hover:text-white">Xem lại</button>
                    <button onClick={() => { setStatus('idle'); setTimeLeft(15*60); setAnswers([]); setCurrentQ(0); }} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500">Thi lại</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1e1e1e] border border-red-500/30 rounded-xl p-6 my-4 relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h4 className="text-white font-bold">Câu hỏi {currentQ + 1} <span className="text-slate-500">/ {totalQuestions}</span></h4>
                    <div className="w-32 h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all" style={{ width: `${((currentQ+1)/totalQuestions)*100}%` }}></div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-red-300 bg-red-900/20 px-3 py-1 rounded-lg border border-red-500/20">
                    <span className="material-symbols-outlined text-lg">timer</span>
                    <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
                </div>
            </div>

            {/* Question Area (Mock) */}
            <div className="mb-6">
                <p className="text-slate-200 text-lg font-medium leading-relaxed">
                    Theo thuyết tương đối hẹp, điều gì sẽ xảy ra với thời gian khi vật thể di chuyển gần vận tốc ánh sáng?
                </p>
            </div>

            <div className="grid gap-3 mb-6">
                {['Thời gian trôi nhanh hơn', 'Thời gian giãn nở (trôi chậm lại)', 'Thời gian dừng lại hoàn toàn', 'Không ảnh hưởng'].map((opt, i) => (
                    <button 
                        key={i}
                        onClick={() => {
                            const newAns = [...answers];
                            newAns[currentQ] = i;
                            setAnswers(newAns);
                        }}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                            answers[currentQ] === i 
                            ? 'bg-blue-600/20 border-blue-500 text-white' 
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                    >
                        <span className="font-bold mr-2">{String.fromCharCode(65+i)}.</span> {opt}
                    </button>
                ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
                <button 
                    onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                    disabled={currentQ === 0}
                    className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30"
                >
                    Quay lại
                </button>
                {currentQ < totalQuestions - 1 ? (
                    <button 
                        onClick={() => setCurrentQ(currentQ + 1)}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors"
                    >
                        Tiếp theo
                    </button>
                ) : (
                    <button 
                        onClick={() => setStatus('finished')}
                        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow-lg transition-colors"
                    >
                        Nộp bài
                    </button>
                )}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 3. PROMPT ENGINEER ASSISTANT
// ----------------------------------------------------------------------

export const PromptEngineerAssistant: React.FC<{ input: string }> = ({ input }) => {
    if (!input || input.length > 50) return null;

    return (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl flex items-start gap-4 animate-[fadeIn_0.5s]">
            <div className="p-2 bg-blue-500/20 rounded-full text-blue-300">
                <span className="material-symbols-outlined text-xl">auto_fix</span>
            </div>
            <div className="flex-1">
                <h5 className="text-blue-200 text-sm font-bold mb-1">Gợi ý tối ưu Prompt</h5>
                <p className="text-slate-400 text-xs mb-2">Prompt của bạn khá ngắn. Hãy thử thêm các chi tiết sau để kết quả chính xác hơn:</p>
                <div className="flex flex-wrap gap-2">
                    <span className="bg-white/10 px-2 py-1 rounded text-[10px] text-white cursor-pointer hover:bg-blue-600">+ Đối tượng (ví dụ: cho người mới bắt đầu)</span>
                    <span className="bg-white/10 px-2 py-1 rounded text-[10px] text-white cursor-pointer hover:bg-blue-600">+ Định dạng (ví dụ: danh sách bullet)</span>
                    <span className="bg-white/10 px-2 py-1 rounded text-[10px] text-white cursor-pointer hover:bg-blue-600">+ Tone (ví dụ: hài hước)</span>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 4. SIMULATED DEBATE ARENA
// ----------------------------------------------------------------------

export const SimulatedDebate: React.FC<{ topic: string }> = ({ topic }) => {
    const [visible, setVisible] = useState(false);
    const [turn, setTurn] = useState(0);

    if (!visible) {
        return (
            <button onClick={() => setVisible(true)} className="w-full py-3 bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/30 text-orange-200 rounded-xl font-bold text-sm hover:border-orange-500/60 transition-all flex items-center justify-center gap-3 group">
                <span className="material-symbols-outlined group-hover:scale-125 transition-transform">swords</span> 
                Mở Đấu Trường Tranh Biện (AI vs AI)
            </button>
        );
    }

    return (
        <div className="w-full bg-[#0f172a] border border-orange-500/30 rounded-2xl p-6 my-4 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400"><span className="material-symbols-outlined">forum</span></div>
                    <div>
                        <h4 className="text-orange-100 font-bold text-lg">Tranh biện: {topic}</h4>
                        <p className="text-orange-400/60 text-xs uppercase font-bold tracking-wider">Round {Math.floor(turn/2) + 1}</p>
                    </div>
                </div>
                <button onClick={() => setVisible(false)} className="text-slate-500 hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>

            {/* Arena Content */}
            <div className="space-y-6 relative z-10">
                {/* Pro Side */}
                <div className={`flex gap-4 transition-opacity duration-500 ${turn % 2 === 0 ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold shrink-0 shadow-[0_0_20px_rgba(22,163,74,0.5)] border-2 border-green-400">Pro</div>
                    <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-2xl rounded-tl-none text-sm text-green-100 shadow-lg relative">
                        <span className="absolute -top-2 left-0 text-[10px] text-green-400 font-bold bg-[#0f172a] px-2">ỦNG HỘ</span>
                        Quan điểm này mang lại lợi ích dài hạn về tư duy hệ thống, giúp người học xây dựng nền tảng vững chắc thay vì học vẹt.
                    </div>
                </div>

                {/* Con Side */}
                <div className={`flex gap-4 flex-row-reverse transition-opacity duration-500 ${turn % 2 !== 0 ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold shrink-0 shadow-[0_0_20px_rgba(220,38,38,0.5)] border-2 border-red-400">Con</div>
                    <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-2xl rounded-tr-none text-sm text-red-100 shadow-lg relative text-right">
                        <span className="absolute -top-2 right-0 text-[10px] text-red-400 font-bold bg-[#0f172a] px-2">PHẢN ĐỐI</span>
                        Tuy nhiên, chi phí thời gian ban đầu quá lớn có thể gây nản lòng cho người mới, dẫn đến tỷ lệ bỏ cuộc cao.
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex justify-center relative z-10">
                <button 
                    onClick={() => setTurn(prev => prev + 1)}
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                >
                    Tiếp tục tranh luận <span className="material-symbols-outlined text-sm">fast_forward</span>
                </button>
            </div>

            {/* Background Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 via-transparent to-transparent"></div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 5. CODE REVIEW ASSISTANT (New)
// ----------------------------------------------------------------------

export const CodeReviewAssistant: React.FC = () => {
    const [code, setCode] = useState(`function sum(a, b) {\n  return a + b;\n}`);
    const [review, setReview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleReview = () => {
        setLoading(true);
        setTimeout(() => {
            setReview("✅ Code chạy tốt.\n💡 Gợi ý: Thêm type annotations nếu dùng TypeScript.\n⚠️ Chú ý: Cần xử lý trường hợp input không phải số.");
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="bg-[#1e1e1e] border border-blue-500/30 rounded-xl p-4 my-4">
            <h4 className="text-blue-300 font-bold mb-3 flex items-center gap-2"><span className="material-symbols-outlined">code</span> AI Code Review</h4>
            <div className="relative mb-3">
                <textarea 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-xs font-mono text-slate-300 focus:border-blue-500 outline-none resize-none"
                />
            </div>
            {review && (
                <div className="bg-blue-900/20 border-l-4 border-blue-500 p-3 mb-3 text-xs text-blue-100 whitespace-pre-wrap animate-[fadeIn_0.3s]">
                    {review}
                </div>
            )}
            <button 
                onClick={handleReview}
                disabled={loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
            >
                {loading ? 'Đang đọc code...' : 'Review ngay'}
            </button>
        </div>
    );
};
