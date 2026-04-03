
import React, { useState, useEffect } from 'react';

export const OnboardingTour: React.FC = () => {
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('learnai_todo_tour');
        if (!hasSeenTour) {
            setVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setVisible(false);
        localStorage.setItem('learnai_todo_tour', 'true');
    };

    const steps = [
        { title: "Chào mừng!", content: "Đây là không gian quản lý công việc tối thượng của bạn." },
        { title: "Inbox", content: "Nơi chứa mọi ý tưởng chưa được phân loại." },
        { title: "Tiện ích Pro", content: "Kéo xuống Sidebar để thấy Lịch, Kanban và Thùng rác." },
        { title: "Nhập giọng nói", content: "Thử bấm vào icon micro khi tạo task nhé!" }
    ];

    if (!visible) return null;

    return (
        <div className="fixed bottom-10 left-10 z-[60] max-w-sm w-full animate-[slideInUp_0.5s]">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-[1px] rounded-2xl shadow-2xl">
                <div className="bg-[#1e1e1e] rounded-2xl p-6 relative">
                    <button onClick={handleDismiss} className="absolute top-2 right-2 text-slate-400 hover:text-white">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                    
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">✨</span>
                        <h3 className="font-bold text-white text-lg">{steps[step].title}</h3>
                    </div>
                    <p className="text-slate-300 text-sm mb-6 leading-relaxed">{steps[step].content}</p>
                    
                    <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                            {steps.map((_, i) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-blue-500' : 'w-1.5 bg-slate-600'}`}></div>
                            ))}
                        </div>
                        <button 
                            onClick={() => step < steps.length - 1 ? setStep(step + 1) : handleDismiss()}
                            className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                        >
                            {step < steps.length - 1 ? 'Tiếp theo' : 'Bắt đầu'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
