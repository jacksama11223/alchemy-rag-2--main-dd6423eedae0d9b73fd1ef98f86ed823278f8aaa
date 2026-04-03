
import React, { useState, useEffect } from 'react';

// ----------------------------------------------------------------------
// 1. FACT CHECKER: Simulation of Claim Extraction & Verification
// ----------------------------------------------------------------------

interface Claim {
    id: number;
    text: string;
    status: 'pending' | 'verified' | 'disputed' | 'unverified';
    confidence: number;
    source?: string;
}

export const FactChecker: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [claims, setClaims] = useState<Claim[]>([]);

    const startScan = () => {
        setIsOpen(true);
        setIsScanning(true);
        setClaims([]);

        // Simulate Scanning Process
        setTimeout(() => {
            setClaims([
                { id: 1, text: "React was created by Facebook in 2013.", status: 'verified', confidence: 0.99, source: "React Documentation" },
                { id: 2, text: "Python is a compiled language.", status: 'disputed', confidence: 0.85, source: "Techopedia (Python is Interpreted)" },
                { id: 3, text: "Quantum entanglement allows faster-than-light communication.", status: 'unverified', confidence: 0.40, source: "Scientific Consensus needed" },
            ]);
            setIsScanning(false);
        }, 2000);
    };

    return (
        <div className="bg-black/20 rounded-xl border border-white/10 overflow-hidden">
            <button 
                onClick={startScan}
                className={`w-full flex items-center justify-between px-4 py-3 transition-all ${
                    isOpen 
                    ? 'bg-green-900/20 text-green-300' 
                    : 'text-slate-300 hover:bg-white/5'
                }`}
            >
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">fact_check</span>
                    <span className="text-xs font-bold uppercase">Kiểm tra sự thật</span>
                </div>
                {isScanning && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
            </button>

            {isOpen && (
                <div className="p-3 space-y-3 border-t border-white/10 animate-slide-down">
                    {isScanning ? (
                        <div className="text-center py-4 text-slate-500 text-xs italic">
                            Đang quét văn bản và đối chiếu cơ sở dữ liệu...
                        </div>
                    ) : (
                        claims.map(claim => (
                            <div key={claim.id} className="flex gap-3 items-start p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-help group">
                                <div className="mt-0.5 shrink-0">
                                    {claim.status === 'verified' && <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>}
                                    {claim.status === 'disputed' && <span className="material-symbols-outlined text-red-500 text-sm">cancel</span>}
                                    {claim.status === 'unverified' && <span className="material-symbols-outlined text-yellow-500 text-sm">warning</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-200 text-xs leading-relaxed">{claim.text}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{claim.source}</span>
                                        <span className={`text-[10px] font-bold ${claim.confidence > 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {Math.round(claim.confidence * 100)}% Acc
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {!isScanning && (
                        <button onClick={() => setIsOpen(false)} className="w-full py-2 bg-white/5 hover:bg-white/10 rounded text-xs text-slate-400 transition-colors">Đóng báo cáo</button>
                    )}
                </div>
            )}
        </div>
    );
};

// ----------------------------------------------------------------------
// 2. SOCRATIC REWRITER: Tone Adjustment
// ----------------------------------------------------------------------

export const SocraticRewriter: React.FC = () => {
    return (
        <div className="bg-black/20 rounded-xl border border-white/10 overflow-hidden">
             <div className="px-4 py-3 flex items-center gap-2 text-slate-300">
                <span className="material-symbols-outlined text-lg">psychology</span>
                <span className="text-xs font-bold uppercase">Socratic Rewriter</span>
            </div>
            <div className="p-3 border-t border-white/10 space-y-2">
                <p className="text-xs text-slate-400">Chọn đoạn văn bản để viết lại theo phong cách đặt câu hỏi gợi mở.</p>
                <button className="w-full py-2 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded hover:bg-purple-600/40 text-xs font-bold transition-colors">
                    Áp dụng lên đoạn đã chọn
                </button>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 3. SEMANTIC EXPANDER: Concept Explosion
// ----------------------------------------------------------------------

export const SemanticExpander: React.FC<{ text: string, onExpand: (txt: string) => void }> = ({ text, onExpand }) => {
    const handleExpand = () => {
        // Simulating expansion
        const expanded = text + "\n\n[Expanded Concept] Additional details provided by AI...";
        onExpand(expanded);
    };

    return (
        <div className="bg-black/20 rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2 text-slate-300">
                <span className="material-symbols-outlined text-lg">unfold_more</span>
                <span className="text-xs font-bold uppercase">Mở rộng ý (Expand)</span>
            </div>
            <div className="p-3 border-t border-white/10">
                <p className="text-xs text-slate-400 mb-3">AI sẽ phân tích ngữ cảnh và thêm thông tin chi tiết cho các khái niệm vắn tắt.</p>
                <button onClick={handleExpand} className="w-full py-2 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded hover:bg-blue-600/40 text-xs font-bold transition-colors">
                    Triển khai ý
                </button>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 4. BIAS DETECTOR: Neutrality Check
// ----------------------------------------------------------------------

export const BiasDetector: React.FC<{ text: string }> = ({ text }) => {
    const [score, setScore] = useState(100); // 0 = Biased, 100 = Neutral

    useEffect(() => {
        // Simulating bias check
        setScore(Math.floor(Math.random() * 30) + 70); 
    }, [text]);

    return (
        <div className="bg-black/20 rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">balance</span>
                    <span className="text-xs font-bold uppercase">Độ trung lập</span>
                </div>
                <span className={`text-xs font-bold ${score > 80 ? 'text-green-400' : 'text-yellow-400'}`}>{score}%</span>
            </div>
            <div className="px-4 pb-3">
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full ${score > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                        style={{ width: `${score}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 5. MAGIC REWRITE: Styles
// ----------------------------------------------------------------------

interface RewriteMode {
    id: string;
    label: string;
    icon: string;
    desc: string;
}

export const MagicRewrite: React.FC<{ onRewrite: (mode: string) => void }> = ({ onRewrite }) => {
    const modes: RewriteMode[] = [
        { id: 'simplify', label: 'Đơn giản hóa (ELI5)', icon: 'child_care', desc: 'Dễ hiểu cho người mới' },
        { id: 'concise', label: 'Cô đọng', icon: 'compress', desc: 'Ngắn gọn, súc tích' },
        { id: 'academic', label: 'Hàn lâm', icon: 'school', desc: 'Văn phong trang trọng' },
        { id: 'story', label: 'Kể chuyện', icon: 'auto_stories', desc: 'Biến thành câu chuyện' },
    ];

    return (
        <div className="bg-black/20 rounded-xl border border-white/10 overflow-hidden">
             <div className="px-4 py-3 flex items-center gap-2 text-slate-300 bg-purple-900/10">
                <span className="material-symbols-outlined text-lg text-purple-400">auto_fix</span>
                <span className="text-xs font-bold uppercase text-purple-200">Magic Rewrite</span>
            </div>
            <div className="p-2 grid grid-cols-1 gap-1 border-t border-white/10">
                {modes.map(mode => (
                    <button 
                        key={mode.id}
                        onClick={() => onRewrite(mode.id)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 text-left transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-sm">{mode.icon}</span>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-200">{mode.label}</div>
                            <div className="text-[10px] text-slate-500">{mode.desc}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 6. KEYWORD HIGHLIGHTER
// ----------------------------------------------------------------------

export const KeywordHighlighter: React.FC<{ active: boolean, onToggle: () => void }> = ({ active, onToggle }) => {
    return (
        <button 
            onClick={onToggle}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                active 
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.1)]' 
                : 'bg-black/20 border-white/10 text-slate-300 hover:bg-white/5'
            }`}
        >
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">ink_highlighter</span>
                <span className="text-xs font-bold uppercase">Highlight Từ khóa</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-yellow-500' : 'bg-slate-600'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-4.5' : 'left-0.5'}`}></div>
            </div>
        </button>
    );
};

// ----------------------------------------------------------------------
// 7. INTERACTIVE PREVIEW
// ----------------------------------------------------------------------

export const InteractivePreview: React.FC<{ onPreview: () => void }> = ({ onPreview }) => {
    return (
        <div className="mt-auto pt-4 border-t border-white/10">
            <button 
                onClick={onPreview}
                className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
            >
                <div className="relative z-10 flex items-center justify-center gap-3 text-white font-bold">
                    <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">play_circle</span>
                    <div className="text-left">
                        <div className="text-sm uppercase tracking-wider">Chạy thử nghiệm</div>
                        <div className="text-[10px] text-blue-200 font-normal">Xem trước nội dung tương tác</div>
                    </div>
                </div>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
        </div>
    );
};
