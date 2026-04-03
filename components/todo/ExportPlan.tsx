
import React, { useState } from 'react';
import { analyzePlanStrategies, generateDetailedPlan, PlanStrategy } from '../../services/geminiService';

interface ExportPlanProps {
    onPlanGenerated: (planData: any) => void;
    onClose: () => void;
}

export const ExportPlan: React.FC<ExportPlanProps> = ({ onPlanGenerated, onClose }) => {
    const [goal, setGoal] = useState('');
    const [step, setStep] = useState<'INPUT' | 'ANALYZING' | 'SELECTION' | 'GENERATING'>('INPUT');
    const [strategies, setStrategies] = useState<PlanStrategy[]>([]);

    const handleAnalyze = async () => {
        if (!goal.trim()) return;
        setStep('ANALYZING');
        try {
            const results = await analyzePlanStrategies(goal);
            setStrategies(results);
            setStep('SELECTION');
        } catch (e) {
            alert("Lỗi phân tích. Vui lòng thử lại.");
            setStep('INPUT');
        }
    };

    const handleSelectStrategy = async (strategy: PlanStrategy) => {
        setStep('GENERATING');
        try {
            const plan = await generateDetailedPlan(goal, strategy);
            onPlanGenerated(plan);
            // We don't close here, the parent will switch to ImportPlan view
        } catch (e) {
            alert("Lỗi tạo kế hoạch chi tiết.");
            setStep('SELECTION');
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-[#1e293b] w-full max-w-4xl rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-[#0f172a] flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-400">psychology</span>
                            AI Plan Architect
                        </h2>
                        <p className="text-xs text-slate-400">Trích xuất kế hoạch hành động tối ưu với Gemini 3.0 Pro</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    
                    {step === 'INPUT' && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-white mb-2">Mục tiêu của bạn là gì?</h3>
                                <p className="text-slate-400 text-sm">Hãy mô tả chi tiết mong muốn của bạn. AI sẽ đóng vai Project Manager để giúp bạn.</p>
                            </div>
                            <textarea 
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                className="w-full h-40 bg-black/30 border border-white/20 rounded-xl p-4 text-white placeholder-slate-500 focus:border-purple-500 outline-none resize-none text-base"
                                placeholder="Ví dụ: Tôi muốn học lập trình ReactJS từ con số 0 trong vòng 3 tháng để đi xin việc..."
                                autoFocus
                            />
                            <button 
                                onClick={handleAnalyze}
                                disabled={!goal.trim()}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined">auto_awesome</span>
                                Phân Tích Chiến Lược
                            </button>
                        </div>
                    )}

                    {step === 'ANALYZING' && (
                        <div className="flex flex-col items-center justify-center h-full gap-6">
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                                <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl text-purple-400 animate-pulse">neurology</span>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white mb-2">Đang suy nghĩ... (Thinking Mode)</h3>
                                <p className="text-slate-400 text-sm max-w-md">AI đang đánh giá độ phức tạp, nguồn lực cần thiết và xây dựng các kịch bản khả thi.</p>
                            </div>
                        </div>
                    )}

                    {step === 'SELECTION' && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-white">Chọn Hướng Tiếp Cận</h3>
                                <p className="text-slate-400 text-sm">AI đề xuất 3 chiến lược khác nhau cho mục tiêu của bạn.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {strategies.map((strat, idx) => (
                                    <div 
                                        key={strat.id || idx}
                                        onClick={() => handleSelectStrategy(strat)}
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-2 group flex flex-col h-full"
                                    >
                                        <div className="mb-4 p-3 bg-purple-500/20 rounded-xl w-fit text-purple-300 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-2xl">
                                                {idx === 0 ? 'rocket_launch' : idx === 1 ? 'balance' : 'school'}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-bold text-white mb-2">{strat.name}</h4>
                                        <p className="text-sm text-slate-300 mb-4 flex-1">{strat.description}</p>
                                        
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-green-400">Ưu điểm</p>
                                                {strat.pros.slice(0, 2).map((pro, i) => (
                                                    <div key={i} className="flex items-start gap-1 text-xs text-slate-400">
                                                        <span className="text-green-500">•</span> {pro}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-red-400">Nhược điểm</p>
                                                {strat.cons.slice(0, 2).map((con, i) => (
                                                    <div key={i} className="flex items-start gap-1 text-xs text-slate-400">
                                                        <span className="text-red-500">•</span> {con}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs font-mono text-slate-500">
                                            <span>Est: {strat.estimatedDuration}</span>
                                            <span className="group-hover:text-purple-400 transition-colors">Chọn →</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'GENERATING' && (
                        <div className="flex flex-col items-center justify-center h-full gap-6">
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-t-green-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '2s' }}></div>
                                <div className="absolute inset-2 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                                <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl text-green-400 animate-pulse">format_list_bulleted</span>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white mb-2">Đang chi tiết hóa kế hoạch...</h3>
                                <p className="text-slate-400 text-sm">AI đang chia nhỏ các bước, đặt độ ưu tiên và ước tính thời gian.</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
