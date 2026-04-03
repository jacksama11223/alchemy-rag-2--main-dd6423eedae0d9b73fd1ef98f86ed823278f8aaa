
import React, { useState, useEffect } from 'react';
import { getUserFlows } from '../services/mockBackend';

// --- TYPES ---
type FlowCategory = 'START' | 'CREATE' | 'VISUALIZE' | 'LEARN' | 'MANAGE' | 'SOCIAL';

interface FlowStep {
    _id?: string;
    id?: string;
    label: string;
    icon: string;
    description: string;
    color: string; // Tailwind text color class
    bgColor: string; // Tailwind bg color class
}

interface Flow {
    _id?: string;
    id?: string;
    category: FlowCategory;
    title: string;
    summary: string;
    complexity: 'Easy' | 'Medium' | 'Hard';
    timeEstimate: string; // e.g. "2 mins"
    steps: FlowStep[];
}

// --- DATA: PART 1 (ONBOARDING) ---
const FALLBACK_FLOWS: Flow[] = [
    {
        id: 'onboarding_01',
        category: 'START',
        title: "Vòng Lặp Cốt Lõi (Core Loop)",
        summary: "Hiểu cách hệ thống vận hành từ lúc đăng nhập đến khi nhận thưởng.",
        complexity: 'Easy',
        timeEstimate: '1 min',
        steps: [
            { 
                id: 's1', 
                label: 'Dashboard', 
                icon: 'dashboard', 
                description: 'Trung tâm chỉ huy. Kiểm tra sức khỏe tri thức và chuỗi ngày (Streak).', 
                color: 'text-sky-400',
                bgColor: 'bg-sky-500/10'
            },
            { 
                id: 's2', 
                label: 'Chọn Tính Năng', 
                icon: 'grid_view', 
                description: 'Truy cập Alchemy, Graph, hoặc Tutor từ lưới điều hướng.', 
                color: 'text-indigo-400',
                bgColor: 'bg-indigo-500/10'
            },
            { 
                id: 's3', 
                label: 'Tương Tác', 
                icon: 'touch_app', 
                description: 'Tạo thẻ, học bài, hoặc chat với AI.', 
                color: 'text-purple-400',
                bgColor: 'bg-purple-500/10'
            },
            { 
                id: 's4', 
                label: 'Nhận XP & LP', 
                icon: 'military_tech', 
                description: 'Hệ thống tự động cộng điểm kinh nghiệm và điểm xếp hạng.', 
                color: 'text-yellow-400',
                bgColor: 'bg-yellow-500/10'
            },
            { 
                id: 's5', 
                label: 'Level Up', 
                icon: 'arrow_upward', 
                description: 'Nâng cấp hồ sơ và mở khóa tính năng mới.', 
                color: 'text-green-400',
                bgColor: 'bg-green-500/10'
            }
        ]
    },
    {
        id: 'onboarding_02',
        category: 'START',
        title: "Định Hướng Dữ Liệu (Data Flow)",
        summary: "Hiểu cách dữ liệu di chuyển giữa các module.",
        complexity: 'Medium',
        timeEstimate: '2 mins',
        steps: [
            { 
                id: 'd1', 
                label: 'Input (Alchemy)', 
                icon: 'science', 
                description: 'Nạp dữ liệu thô (Text, YouTube, PDF) vào lò luyện.', 
                color: 'text-pink-400',
                bgColor: 'bg-pink-500/10'
            },
            { 
                id: 'd2', 
                label: 'Processing (AI)', 
                icon: 'psychology', 
                description: 'AI phân tích, chia nhỏ và tạo cấu trúc JSON.', 
                color: 'text-cyan-400',
                bgColor: 'bg-cyan-500/10'
            },
            { 
                id: 'd3', 
                label: 'Storage (Graph)', 
                icon: 'hub', 
                description: 'Lưu trữ dưới dạng Node liên kết trong không gian 2D/3D.', 
                color: 'text-blue-400',
                bgColor: 'bg-blue-500/10'
            },
            { 
                id: 'd4', 
                label: 'Review (Tutor)', 
                icon: 'school', 
                description: 'Ôn tập lại các Node thông qua Flashcard hoặc Chat.', 
                color: 'text-green-400',
                bgColor: 'bg-green-500/10'
            }
        ]
    }
];

// --- COMPONENTS ---

const FlowCard: React.FC<{ flow: Flow }> = ({ flow }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 ${isExpanded ? 'ring-2 ring-cyan-500/50 shadow-2xl' : 'hover:border-white/30'}`}>
            {/* Card Header */}
            <div 
                className="p-6 cursor-pointer flex justify-between items-start"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${flow.category === 'START' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                        <span className="material-symbols-outlined">
                            {flow.category === 'START' ? 'flag' : 'extension'}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">{flow.title}</h3>
                        <p className="text-sm text-slate-400">{flow.summary}</p>
                        <div className="flex gap-3 mt-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                flow.complexity === 'Easy' ? 'text-green-400 border-green-500/30 bg-green-500/10' :
                                flow.complexity === 'Medium' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' :
                                'text-red-400 border-red-500/30 bg-red-500/10'
                            }`}>
                                {flow.complexity}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[10px]">schedule</span> {flow.timeEstimate}
                            </span>
                        </div>
                    </div>
                </div>
                <button className={`p-2 rounded-full hover:bg-white/10 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-cyan-400' : 'text-slate-500'}`}>
                    <span className="material-symbols-outlined">expand_more</span>
                </button>
            </div>

            {/* Expanded Steps */}
            {isExpanded && (
                <div className="p-6 pt-0 border-t border-white/5 bg-[#0f172a]/50">
                    <div className="mt-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-8 left-6 right-6 h-0.5 bg-slate-700 hidden md:block z-0"></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                            {flow.steps.map((step, idx) => (
                                <div key={step._id || step.id || idx} className="flex flex-col items-center text-center group">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-lg transition-transform hover:scale-110 ${step.bgColor || 'bg-slate-800'} ${step.color || 'text-white'} border border-white/5`}>
                                        <span className="material-symbols-outlined">{step.icon}</span>
                                    </div>
                                    <div className="md:hidden h-8 w-0.5 bg-slate-700 my-2"></div> {/* Mobile Connector */}
                                    <h4 className="text-sm font-bold text-white mb-1">{idx + 1}. {step.label}</h4>
                                    <p className="text-xs text-slate-500 leading-tight">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                        <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">play_circle</span>
                            Thử ngay (Demo)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const UserFlowMap: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<FlowCategory>('START');
    const [flows, setFlows] = useState<Flow[]>(FALLBACK_FLOWS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFlows = async () => {
            try {
                const data = await getUserFlows();
                if (data && data.length > 0) {
                    setFlows(data);
                }
            } catch (e) {
                console.error("Failed to fetch flows", e);
            } finally {
                setLoading(false);
            }
        };
        fetchFlows();
    }, []);

    const categories: { id: FlowCategory, label: string, icon: string }[] = [
        { id: 'START', label: 'Bắt đầu', icon: 'flag' },
        { id: 'CREATE', label: 'Sáng tạo', icon: 'science' },
        { id: 'VISUALIZE', label: 'Sơ đồ', icon: 'hub' },
        { id: 'LEARN', label: 'Học tập', icon: 'school' },
        { id: 'MANAGE', label: 'Quản lý', icon: 'work' },
        { id: 'SOCIAL', label: 'Cộng đồng', icon: 'groups' },
    ];

    const displayedFlows = flows.filter(f => f.category === activeTab);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-display flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/10 px-8 py-4 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 border border-cyan-500/30">
                        <span className="material-symbols-outlined text-2xl">map</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Bản Đồ Hướng Dẫn</h1>
                        <p className="text-xs text-slate-400">Tutorial & User Flows Center</p>
                    </div>
                </div>
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Thoát
                </button>
            </header>

            {/* Navigation Tabs */}
            <div className="border-b border-white/10 bg-[#0b1120]">
                <div className="max-w-7xl mx-auto px-6 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-8">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`flex items-center gap-2 py-4 border-b-2 transition-colors whitespace-nowrap ${
                                    activeTab === cat.id 
                                    ? 'border-cyan-500 text-cyan-400' 
                                    : 'border-transparent text-slate-500 hover:text-white'
                                }`}
                            >
                                <span className={`material-symbols-outlined text-lg ${activeTab === cat.id ? 'animate-bounce-subtle' : ''}`}>{cat.icon}</span>
                                <span className="text-sm font-bold uppercase tracking-wide">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-100">
                <div className="max-w-5xl mx-auto">
                    
                    {/* Welcome Banner for START tab */}
                    {activeTab === 'START' && (
                        <div className="mb-10 p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-cyan-500/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <h2 className="text-3xl font-black text-white mb-4 relative z-10">Chào mừng đến với LearnAI</h2>
                            <p className="text-lg text-cyan-100/80 max-w-2xl relative z-10 leading-relaxed">
                                Đây là hệ thống học tập đa chiều, kết hợp giữa Sơ đồ Tri thức (Knowledge Graph), AI tạo sinh (Generative AI) và phương pháp lặp lại ngắt quãng (Spaced Repetition). Hãy chọn một luồng bên dưới để bắt đầu tìm hiểu.
                            </p>
                        </div>
                    )}

                    {/* Flow List */}
                    <div className="space-y-6">
                        {displayedFlows.length > 0 ? (
                            displayedFlows.map(flow => (
                                <FlowCard key={flow.id} flow={flow} />
                            ))
                        ) : (
                            <div className="text-center py-20">
                                <span className="material-symbols-outlined text-6xl text-slate-700 mb-4">construction</span>
                                <h3 className="text-xl font-bold text-slate-500">Đang cập nhật dữ liệu...</h3>
                                <p className="text-sm text-slate-600 mt-2">Các hướng dẫn cho mục này sẽ sớm được bổ sung (Part 2-6).</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};
