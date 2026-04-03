import React, { useState, useEffect } from 'react';
import { createFeedback, getMyFeedbacks } from '../services/mockBackend';
import { FeedbackItem } from '../types';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
    const [type, setType] = useState('Bug');
    const [priority, setPriority] = useState('Medium');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [myFeedbacks, setMyFeedbacks] = useState<FeedbackItem[]>([]);
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

    useEffect(() => {
        if (isOpen) {
            fetchMyFeedbacks();
        }
    }, [isOpen]);

    const fetchMyFeedbacks = async () => {
        const data = await getMyFeedbacks();
        setMyFeedbacks(data);
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        
        setIsSubmitting(true);
        await createFeedback({ type, priority, content });
        setIsSubmitting(false);
        setContent('');
        alert('Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ xem xét sớm nhất.');
        fetchMyFeedbacks();
        setActiveTab('history');
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s]">
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative animate-[slideUp_0.3s] max-h-[90vh] flex flex-col">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
                
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400">forum</span>
                    Hỗ Trợ & Phản Hồi
                </h2>
                <p className="text-slate-400 text-sm mb-6">Gửi yêu cầu hỗ trợ hoặc xem lại các phản hồi từ Admin.</p>

                <div className="flex gap-4 mb-6 border-b border-white/10">
                    <button 
                        onClick={() => setActiveTab('new')}
                        className={`pb-2 text-sm font-bold transition-colors ${activeTab === 'new' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Gửi Phản Hồi Mới
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`pb-2 text-sm font-bold transition-colors ${activeTab === 'history' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Lịch Sử & Trả Lời ({myFeedbacks.length})
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {activeTab === 'new' ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Loại Phản Hồi</label>
                                    <select 
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                                    >
                                        <option value="Bug">Báo Lỗi (Bug)</option>
                                        <option value="Feature Request">Góp ý Tính Năng</option>
                                        <option value="Content Issue">Lỗi Nội Dung</option>
                                        <option value="Question">Câu Hỏi / Hỗ Trợ</option>
                                        <option value="Other">Khác</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Mức Độ</label>
                                    <select 
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                                    >
                                        <option value="Low">Thấp</option>
                                        <option value="Medium">Trung Bình</option>
                                        <option value="High">Cao (Khẩn cấp)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nội Dung Chi Tiết</label>
                                <textarea 
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Mô tả chi tiết vấn đề hoặc câu hỏi của bạn..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-blue-500 h-32 resize-none"
                                    required
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={isSubmitting || !content.trim()}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <span className="material-symbols-outlined animate-spin">autorenew</span>
                                ) : (
                                    <span className="material-symbols-outlined">send</span>
                                )}
                                Gửi Phản Hồi
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {myFeedbacks.length === 0 ? (
                                <div className="text-center py-10 text-slate-500">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-30">inbox</span>
                                    <p>Bạn chưa gửi phản hồi nào.</p>
                                </div>
                            ) : (
                                myFeedbacks.map(fb => (
                                    <div key={fb.id} className="bg-black/30 border border-white/5 rounded-xl p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold border ${fb.status === 'New' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : fb.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30'}`}>
                                                    {fb.status}
                                                </span>
                                                <span className="text-xs font-bold text-slate-300">{fb.type}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-500">{new Date(fb.timestamp).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-300 mb-3">{fb.content}</p>
                                        
                                        {fb.reply && (
                                            <div className="mt-3 bg-blue-900/20 border border-blue-500/20 rounded-lg p-3 relative">
                                                <div className="absolute -top-2.5 left-4 bg-[#0f172a] px-2 text-[10px] font-bold text-blue-400 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[10px]">admin_panel_settings</span> Admin Trả Lời
                                                </div>
                                                <p className="text-sm text-blue-100 mt-1 whitespace-pre-wrap">{fb.reply}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
