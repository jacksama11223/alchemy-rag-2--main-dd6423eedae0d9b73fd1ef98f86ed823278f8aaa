
import React from 'react';

interface TemplateGalleryProps {
    onSelectTemplate: (tasks: { content: string, subtasks?: string[] }[]) => void;
    onClose: () => void;
}

const TEMPLATES = [
    {
        name: "Chuẩn bị đi du lịch",
        icon: "flight",
        tasks: [
            { content: "Đặt vé máy bay" },
            { content: "Đặt phòng khách sạn" },
            { content: "Soạn hành lý", subtasks: ["Quần áo", "Thuốc men", "Giấy tờ"] },
            { content: "Đổi ngoại tệ" }
        ]
    },
    {
        name: "Quy trình học tập sâu",
        icon: "school",
        tasks: [
            { content: "Đọc tài liệu sơ bộ" },
            { content: "Tạo Flashcards trên LearnAI" },
            { content: "Làm bài tập thực hành" },
            { content: "Review lại sau 24h" }
        ]
    },
    {
        name: "Morning Routine",
        icon: "wb_sunny",
        tasks: [
            { content: "Uống 1 ly nước" },
            { content: "Tập thể dục 15p" },
            { content: "Đọc sách 20p" },
            { content: "Lên kế hoạch ngày mới" }
        ]
    }
];

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate, onClose }) => {
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-[fadeIn_0.2s]">
            <div className="bg-[#1e1e1e] border border-[#333] rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400">dataset</span> 
                    Thư Viện Mẫu
                </h2>
                
                <div className="grid grid-cols-1 gap-4">
                    {TEMPLATES.map((tmpl, idx) => (
                        <button 
                            key={idx}
                            onClick={() => onSelectTemplate(tmpl.tasks)}
                            className="flex items-center gap-4 p-4 bg-[#262626] rounded-xl border border-[#333] hover:border-amber-500/50 hover:bg-[#2a2a2a] transition-all group text-left"
                        >
                            <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:scale-110 transition-all">
                                <span className="material-symbols-outlined text-2xl">{tmpl.icon}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-200 group-hover:text-white">{tmpl.name}</h3>
                                <p className="text-xs text-slate-500">{tmpl.tasks.length} công việc</p>
                            </div>
                            <span className="material-symbols-outlined ml-auto text-slate-600 group-hover:text-amber-500">add_circle</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
