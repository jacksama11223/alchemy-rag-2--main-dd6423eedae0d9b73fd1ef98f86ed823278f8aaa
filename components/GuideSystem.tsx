
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// --- DATA: COMPREHENSIVE GUIDE CONTENT ---
export const GUIDE_CONTENT = {
    dashboard: {
        title: "Bảng Điều Khiển (Dashboard)",
        icon: "dashboard",
        color: "text-blue-400",
        steps: [
            {
                title: "Trung Tâm Chỉ Huy",
                content: "Nơi khởi đầu mọi hành trình. Theo dõi cấp độ (Level), điểm kinh nghiệm (XP) và chuỗi ngày học tập (Streak) của bạn tại đây.",
                icon: "home"
            },
            {
                title: "Sức Khỏe Hệ Sinh Thái",
                content: "Thanh trạng thái màu xanh lá cây biểu thị 'Sức khỏe tri thức'. Nó giảm dần theo thời gian nếu bạn không ôn tập. Hãy giữ nó ở mức 100%!",
                icon: "spa"
            },
            {
                title: "Điều Hướng Nhanh",
                content: "Sử dụng lưới tính năng bên dưới để truy cập nhanh vào Giả Kim Thuật, Sơ Đồ Tri Thức, hoặc Gia Sư AI.",
                icon: "grid_view"
            }
        ]
    },
    alchemy: {
        title: "Giả Kim Thuật (Alchemy)",
        icon: "science",
        color: "text-purple-400",
        steps: [
            {
                title: "Nạp Nguyên Liệu (Input)",
                content: "Hệ thống hỗ trợ đa nguồn: Dán văn bản, Link bài viết, Link YouTube (tự động lấy sub), File PDF (OCR), hoặc Ghi âm giọng nói.",
                icon: "input"
            },
            {
                title: "Chọn Công Thức (Process)",
                content: "Bạn muốn tạo gì? 'Flashcard' để nhớ từ, 'Quiz' để kiểm tra, hay 'Ontology' để vẽ sơ đồ tư duy? AI sẽ xử lý dựa trên lựa chọn này.",
                icon: "tune"
            },
            {
                title: "Kết Tinh & Liên Kết",
                content: "Sản phẩm cuối cùng là các Nốt Tri Thức (Nodes). Chúng sẽ tự động được liên kết vào Sơ đồ Graph và có thể được xuất bản lên Cộng đồng.",
                icon: "diamond"
            }
        ]
    },
    graph: {
        title: "Sơ Đồ Tri Thức (Graph)",
        icon: "hub",
        color: "text-cyan-400",
        steps: [
            {
                title: "Vũ Trụ Kiến Thức",
                content: "Mỗi chấm tròn là một bài học. Các đường nối thể hiện mối quan hệ. Lăn chuột để phóng to, kéo thả để sắp xếp lại tư duy.",
                icon: "share"
            },
            {
                title: "Thao Tác Nốt (Node Actions)",
                content: "Nhấp đúp vào Node để bắt đầu học. Chuột phải để mở menu: Sửa, Xóa, hoặc Hỏi Gia sư AI về nội dung đó.",
                icon: "touch_app"
            },
            {
                title: "Công Cụ Không Gian",
                content: "Sử dụng thanh công cụ bên trái để: Tạo vùng chọn (Zone), Lọc theo Tags, hoặc bật chế độ 'Focus' để tập trung.",
                icon: "filter_center_focus"
            }
        ]
    },
    tutor: {
        title: "Gia Sư Biện Chứng (Tutor)",
        icon: "school",
        color: "text-green-400",
        steps: [
            {
                title: "Phương Pháp Socratic",
                content: "AI không chỉ đưa ra đáp án. Nó sẽ hỏi ngược lại bạn, gợi mở vấn đề để bạn tự tư duy và hiểu sâu bản chất.",
                icon: "psychology_alt"
            },
            {
                title: "Đa Nhân Cách (Persona)",
                content: "Chọn người hướng dẫn phù hợp: Feynman (giải thích đơn giản), Giáo sư (nghiêm khắc), hoặc Bạn học (thân thiện).",
                icon: "face"
            },
            {
                title: "Lưu Case Study",
                content: "Bạn có thể lưu lại toàn bộ đoạn hội thoại hay thành một bài học (Node) trên sơ đồ để ôn lại sau này.",
                icon: "save"
            }
        ]
    },
    notelab: {
        title: "Phòng Ghi Chú (NoteLab)",
        icon: "edit_note",
        color: "text-indigo-400",
        steps: [
            {
                title: "Soạn Thảo Thông Minh",
                content: "Gõ phím '/' để mở menu lệnh: Tiêu đề, Todo list, Code block, Ảnh minh họa. Hỗ trợ Markdown đầy đủ.",
                icon: "keyboard"
            },
            {
                title: "Deep Think AI",
                content: "Bấm nút 'AI Analyze' để AI đọc ghi chú của bạn, tìm lỗ hổng logic và gợi ý mở rộng ý tưởng.",
                icon: "psychology"
            },
            {
                title: "Kết Nối Hệ Thống",
                content: "Ghi chú có thể được liên kết trực tiếp sang Sơ đồ Tri thức hoặc chuyển thành Nhiệm vụ (Task) chỉ với 1 cú click.",
                icon: "link"
            }
        ]
    },
    draw: {
        title: "Xưởng Vẽ (DrawEverything)",
        icon: "brush",
        color: "text-amber-400",
        steps: [
            {
                title: "Bảng Trắng Vô Tận",
                content: "Phác thảo ý tưởng tự do. Giữ phím Space để di chuyển vùng nhìn.",
                icon: "all_inclusive"
            },
            {
                title: "AI Vision",
                content: "Vẽ sơ đồ tay, sau đó bấm nút 'AI Analyze'. Hệ thống sẽ hiểu hình vẽ và chuyển nó thành cấu trúc dữ liệu số.",
                icon: "visibility"
            },
            {
                title: "Layer & Template",
                content: "Quản lý các lớp vẽ và sử dụng các mẫu giấy có sẵn (Lưới, Chấm bi, Kẻ ngang).",
                icon: "layers"
            }
        ]
    },
    drive: {
        title: "Drive Storage",
        icon: "folder_open",
        color: "text-blue-400",
        steps: [
            {
                title: "Kho Tài Liệu",
                content: "Lưu trữ PDF, DOCX, Ảnh tại đây. AI sẽ tự động phân loại và gắn thẻ cho tệp tin.",
                icon: "inventory_2"
            },
            {
                title: "Tích Hợp Alchemy",
                content: "Chọn tệp tin và gửi thẳng sang 'Giả Kim Thuật' để AI đọc và tạo bài học tự động.",
                icon: "science"
            },
            {
                title: "Semantic Search",
                content: "Tìm kiếm tệp tin không chỉ theo tên mà theo nội dung và ý nghĩa ngữ nghĩa.",
                icon: "manage_search"
            }
        ]
    },
    digest: { // Todo List
        title: "Quản Lý Nhiệm Vụ (ThingsToDo)",
        icon: "check_circle",
        color: "text-teal-400",
        steps: [
            {
                title: "GTD & Eisenhower",
                content: "Sắp xếp công việc theo độ Khẩn cấp/Quan trọng. Sử dụng Inbox để nắm bắt mọi ý tưởng.",
                icon: "priority_high"
            },
            {
                title: "Pomodoro Tích Hợp",
                content: "Kích hoạt đồng hồ tập trung ngay trên task. Hoàn thành task sẽ nhận được XP thưởng.",
                icon: "timer"
            },
            {
                title: "Liên Kết Đa Chiều",
                content: "Mỗi Task có thể gắn link dẫn trực tiếp đến một tính năng khác (VD: Task 'Học React' dẫn đến Graph React).",
                icon: "link"
            }
        ]
    },
    cram: {
        title: "Ôn Tập Cấp Tốc (Cram Mode)",
        icon: "bolt",
        color: "text-yellow-400",
        steps: [
            {
                title: "Cứu Sinh Mùa Thi",
                content: "Chế độ này lọc ra 20% kiến thức quan trọng nhất (Pareto) hoặc các thẻ yếu để bạn ôn tập gấp.",
                icon: "warning"
            },
            {
                title: "Cheat Sheet AI",
                content: "Bấm một nút, AI sẽ tổng hợp toàn bộ kiến thức cần thiết vào một trang giấy duy nhất.",
                icon: "sticky_note_2"
            },
            {
                title: "Hồi Sinh Kiến Thức",
                content: "Sau khi ôn xong, bấm 'Hồi sinh' để cập nhật lại trạng thái ghi nhớ cho các Node trên sơ đồ.",
                icon: "update"
            }
        ]
    },
    community: {
        title: "Cộng Đồng & Đấu Trường",
        icon: "diversity_3",
        color: "text-pink-400",
        steps: [
            {
                title: "Đấu Trường Rank",
                content: "Thi đấu 1vs1 trả lời Flashcard thời gian thực. Thắng nhận điểm LP để leo bảng xếp hạng.",
                icon: "swords"
            },
            {
                title: "Chợ Tri Thức",
                content: "Chia sẻ bộ thẻ của bạn hoặc tải về tài nguyên từ các cao thủ khác.",
                icon: "storefront"
            },
            {
                title: "AIR Room",
                content: "Phòng học ảo (Voice/Chat) nơi bạn có thể học cùng bạn bè.",
                icon: "hub"
            }
        ]
    }
};

interface ActiveGuideProps {
    guideKey: keyof typeof GUIDE_CONTENT;
    isOpen: boolean;
    onClose: () => void;
    onNavigate?: () => void;
}

export const ActiveGuide: React.FC<ActiveGuideProps> = ({ guideKey, isOpen, onClose, onNavigate }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const data = GUIDE_CONTENT[guideKey];

    useEffect(() => {
        if (isOpen) setCurrentStep(0);
    }, [isOpen]);

    if (!isOpen || !data) return null;

    const steps = data.steps;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Finish
            if (onNavigate) onNavigate();
            else onClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    const ModalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-[fadeIn_0.3s]" onClick={onClose}>
            <div 
                className="bg-[#0f172a] w-full max-w-4xl h-[80vh] md:h-[600px] rounded-3xl border border-cyan-500/30 shadow-[0_0_50px_rgba(8,145,178,0.3)] flex flex-col relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

                {/* Header */}
                <div className="shrink-0 p-6 border-b border-white/10 flex justify-between items-center bg-white/5 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 ${data.color} shadow-lg`}>
                            <span className="material-symbols-outlined text-3xl">{data.icon}</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-wide">{data.title}</h3>
                            <p className="text-sm text-slate-400 font-medium">Hướng dẫn tương tác</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                {/* Body: Split View */}
                <div className="flex-1 flex overflow-hidden relative z-10">
                    {/* Left: Step Navigation */}
                    <div className="w-1/3 border-r border-white/10 bg-[#0b1221]/50 flex flex-col overflow-y-auto custom-scrollbar">
                        <div className="p-4 space-y-2">
                            {steps.map((step, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setCurrentStep(idx)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 group ${
                                        idx === currentStep 
                                        ? 'bg-cyan-900/30 border-cyan-500/50 shadow-lg' 
                                        : 'bg-transparent border-transparent hover:bg-white/5'
                                    }`}
                                >
                                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-xs transition-colors border ${
                                        idx === currentStep ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-slate-800 text-slate-500 border-slate-700'
                                    }`}>
                                        {idx + 1}
                                    </div>
                                    <span className={`font-bold text-sm line-clamp-2 ${idx === currentStep ? 'text-cyan-100' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                        {step.title}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Step Content */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center items-center text-center relative bg-[#0f172a]/50">
                        <div className={`mb-6 w-24 h-24 shrink-0 rounded-full bg-gradient-to-br from-white/5 to-white/10 border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-float ${data.color}`}>
                            <span className="material-symbols-outlined text-5xl">{steps[currentStep].icon}</span>
                        </div>
                        
                        <h2 className="text-3xl font-black text-white mb-4 animate-[fadeIn_0.3s]">{steps[currentStep].title}</h2>
                        <p className="text-lg text-slate-300 leading-relaxed max-w-lg animate-[fadeInUp_0.4s]">
                            {steps[currentStep].content}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 p-6 border-t border-white/10 bg-[#0b1221] flex justify-between items-center relative z-10">
                    <div className="flex gap-1.5">
                        {steps.map((_, idx) => (
                            <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-cyan-500' : 'w-2 bg-slate-700'}`}></div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border border-white/10 ${
                                currentStep === 0 
                                ? 'text-slate-600 cursor-not-allowed opacity-50' 
                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Trước
                        </button>
                        <button 
                            onClick={handleNext}
                            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-500/20 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            {currentStep === steps.length - 1 ? (onNavigate ? 'Đi tới tính năng' : 'Hoàn tất') : 'Tiếp theo'}
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(ModalContent, document.body);
};

// --- GUIDE TRIGGER BUTTON (Mini) ---
export const GuideTrigger: React.FC<{ guideKey: keyof typeof GUIDE_CONTENT; className?: string }> = ({ guideKey, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Safety check if data exists
    if (!guideKey || !GUIDE_CONTENT[guideKey]) return null;

    return (
        <>
            <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
                className={`relative w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/50 flex items-center justify-center hover:bg-cyan-500 hover:text-white hover:scale-110 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] z-[50] group ${className}`}
                title="Hướng dẫn"
            >
                <span className="font-bold text-sm">?</span>
            </button>
            <ActiveGuide guideKey={guideKey} isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};
