import React, { useState, useEffect } from 'react';
import { getReports, resolveReport, getFeedbacks, updateFeedbackStatus, sendBroadcast } from '../../services/mockBackend';
import { ReportItem, FeedbackItem } from '../../types';

interface AdminSocialProps {
    onBroadcast?: (msg: {title: string, message: string, type: 'info' | 'warning' | 'success'}) => void;
}

export const AdminSocial: React.FC<AdminSocialProps> = ({ onBroadcast }) => {
    const [reports, setReports] = useState<ReportItem[]>([]);
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');

    const fetchData = async () => {
        const r = await getReports();
        const f = await getFeedbacks();
        setReports(r);
        setFeedbacks(f);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleResolveReport = async (id: string, action: string) => {
        await resolveReport(id, action);
        fetchData();
    };

    const handleUpdateFeedback = async (id: string, status: string, reply?: string) => {
        await updateFeedbackStatus(id, status, reply);
        if (reply) {
            setReplyingTo(null);
            setReplyContent('');
        }
        fetchData();
    };

    const handleSendBroadcast = async () => {
        if (!broadcastTitle || !broadcastMessage) return;
        await sendBroadcast(broadcastTitle, broadcastMessage, 'info');
        alert("Đã gửi thông báo toàn hệ thống!");
        setIsBroadcasting(false);
        setBroadcastTitle('');
        setBroadcastMessage('');
    };

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s]">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Cộng Đồng & Hỗ Trợ</h2>
                    <p className="text-slate-400 text-xs">Quản lý báo cáo, phản hồi và gửi thông báo toàn hệ thống.</p>
                </div>
                <button 
                    onClick={() => setIsBroadcasting(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all"
                >
                    <span className="material-symbols-outlined text-lg">campaign</span>
                    Gửi Thông Báo Toàn Hệ Thống
                </button>
            </div>

            {isBroadcasting && (
                <div className="bg-[#1e293b] border border-orange-500/30 rounded-2xl p-4 shadow-xl">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-400">campaign</span>
                        Soạn Thông Báo
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tiêu đề</label>
                            <input 
                                type="text" 
                                value={broadcastTitle}
                                onChange={(e) => setBroadcastTitle(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-orange-500"
                                placeholder="Nhập tiêu đề thông báo..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nội dung</label>
                            <textarea 
                                value={broadcastMessage}
                                onChange={(e) => setBroadcastMessage(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-orange-500 h-24 resize-none"
                                placeholder="Nhập nội dung thông báo..."
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsBroadcasting(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-sm transition-all">Hủy</button>
                            <button onClick={handleSendBroadcast} disabled={!broadcastTitle || !broadcastMessage} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">send</span> Gửi Ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reports */}
                <div className="bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-white/10 bg-[#162032] flex justify-between items-center">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-400">gavel</span>
                            Báo Cáo Vi Phạm ({reports.length})
                        </h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {reports.map(report => (
                            <div key={report.id} className="bg-black/20 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        {report.type}
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold border ${report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30'}`}>
                                            {report.status}
                                        </span>
                                    </h4>
                                    <span className="text-[10px] text-slate-500">{new Date(report.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-slate-400">{report.content}</p>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[10px]">person</span> {report.reporter}
                                </div>
                                {report.status === 'pending' && (
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button onClick={() => handleResolveReport(report.id, 'resolved')} className="text-[10px] font-bold px-2 py-1 rounded bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/30 transition-all">Đã Xử Lý</button>
                                        <button onClick={() => handleResolveReport(report.id, 'dismissed')} className="text-[10px] font-bold px-2 py-1 rounded bg-slate-600/20 hover:bg-slate-600/40 text-slate-400 border border-slate-500/30 transition-all">Bỏ Qua</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedbacks */}
                <div className="bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-white/10 bg-[#162032] flex justify-between items-center">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-400">forum</span>
                            Phản Hồi & Hỗ Trợ ({feedbacks.length})
                        </h3>
                    </div>
                    <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {feedbacks.map(fb => (
                            <div key={fb.id} className="bg-black/20 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        {fb.type}
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold border ${fb.priority === 'High' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                                            {fb.priority}
                                        </span>
                                    </h4>
                                    <span className="text-[10px] text-slate-500">{new Date(fb.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-slate-300">{fb.content}</p>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[10px]">person</span> {fb.userName}
                                </div>
                                
                                {fb.reply && (
                                    <div className="mt-2 bg-blue-900/20 border border-blue-500/20 rounded-lg p-2">
                                        <p className="text-[10px] font-bold text-blue-400 mb-1">Đã trả lời:</p>
                                        <p className="text-xs text-blue-100">{fb.reply}</p>
                                    </div>
                                )}

                                {replyingTo === fb.id ? (
                                    <div className="mt-2 space-y-2">
                                        <textarea 
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="Nhập câu trả lời cho người dùng..."
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-blue-500 resize-none h-20"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setReplyingTo(null)} className="text-[10px] font-bold px-2 py-1 rounded bg-slate-600/20 hover:bg-slate-600/40 text-slate-400 transition-all">Hủy</button>
                                            <button onClick={() => handleUpdateFeedback(fb.id, 'Resolved', replyContent)} className="text-[10px] font-bold px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 transition-all">Gửi Trả Lời & Hoàn Thành</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold border ${fb.status === 'New' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : fb.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30'}`}>
                                            {fb.status}
                                        </span>
                                        <div className="flex gap-2">
                                            {fb.status !== 'Resolved' && (
                                                <button onClick={() => setReplyingTo(fb.id)} className="text-[10px] font-bold px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 transition-all flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[10px]">reply</span> Trả Lời
                                                </button>
                                            )}
                                            {fb.status === 'New' && <button onClick={() => handleUpdateFeedback(fb.id, 'In Progress')} className="text-[10px] font-bold px-2 py-1 rounded bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 border border-yellow-500/30 transition-all">Đang Xử Lý</button>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
