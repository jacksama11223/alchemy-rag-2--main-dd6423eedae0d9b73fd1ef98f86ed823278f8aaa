
import React from 'react';

// 1. TransmissionCommentSection
export const TransmissionCommentSection: React.FC = () => (
    <div className="mt-8 pt-6 border-t border-white/10">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">forum</span> Tín hiệu từ cộng đồng
        </h4>
        <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0"></div>
            <div className="flex-1 relative">
                <input className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none" placeholder="Gửi tín hiệu..." />
                <button className="absolute right-2 top-1.5 text-cyan-500 hover:text-cyan-400"><span className="material-symbols-outlined text-lg">send</span></button>
            </div>
        </div>
        <div className="space-y-4">
            <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-xs text-purple-300 font-bold">A</div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">AstroUser</span>
                        <span className="text-[10px] text-slate-500">2h ago</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">Bài học này thực sự mở mang tầm mắt! Phần lượng tử hơi khó hiểu nhưng ví dụ rất hay.</p>
                </div>
            </div>
        </div>
    </div>
);

// 2. BroadcastShareButton
export const BroadcastShareButton: React.FC = () => (
    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg">
        <span className="material-symbols-outlined text-sm">broadcast_on_personal</span>
        Phát sóng (Share)
    </button>
);

// 3. CrewManifest
export const CrewManifest: React.FC = () => (
    <div className="bg-[#1e293b] p-3 rounded-xl border border-white/10 w-64">
        <div className="flex justify-between items-center mb-3">
            <h5 className="text-xs font-bold text-slate-400 uppercase">Phi hành đoàn (Online)</h5>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        </div>
        <div className="flex -space-x-2 overflow-hidden">
            {[1,2,3,4].map(i => (
                <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-[#1e293b] bg-slate-700"></div>
            ))}
            <div className="h-8 w-8 rounded-full ring-2 ring-[#1e293b] bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold">+12</div>
        </div>
    </div>
);

// 4. SubspaceChatBox
export const SubspaceChatBox: React.FC<{ isOpen: boolean, onToggle: () => void }> = ({ isOpen, onToggle }) => (
    <div className={`fixed bottom-4 right-20 z-50 flex flex-col items-end transition-all ${isOpen ? '' : 'pointer-events-none'}`}>
        <div className={`bg-[#0f172a] border border-white/20 rounded-t-xl w-72 shadow-2xl transition-all duration-300 origin-bottom-right overflow-hidden ${isOpen ? 'h-80 opacity-100 pointer-events-auto' : 'h-0 opacity-0'}`}>
            <div className="bg-cyan-900/30 p-2 flex justify-between items-center border-b border-white/10">
                <span className="text-xs font-bold text-cyan-300 pl-2">Subspace Comms</span>
                <button onClick={onToggle}><span className="material-symbols-outlined text-slate-400 text-sm">close</span></button>
            </div>
            <div className="flex-1 p-2 overflow-y-auto text-xs space-y-2">
                <div className="text-slate-400 text-center italic text-[10px]">Kênh liên lạc đã mở...</div>
            </div>
            <input className="w-full bg-black/40 p-2 text-xs text-white border-t border-white/10 outline-none" placeholder="Nhập tin nhắn..." />
        </div>
        {!isOpen && (
            <button onClick={onToggle} className="pointer-events-auto bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">chat</span>
            </button>
        )}
    </div>
);

// 5. DistressSignalReport
export const DistressSignalReport: React.FC = () => (
    <button className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors">
        <span className="material-symbols-outlined text-sm">flag</span> Báo cáo nội dung
    </button>
);

// 6. HoloProfileCard
export const HoloProfileCard: React.FC = () => (
    <div className="absolute z-50 bg-[#0f172a]/90 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] w-56 animate-fade-in pointer-events-none">
        <div className="flex gap-3 items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600"></div>
            <div>
                <div className="text-sm font-bold text-white">Captain_Nemo</div>
                <div className="text-[10px] text-cyan-400">Level 42 Explorer</div>
            </div>
        </div>
        <div className="h-1 bg-slate-700 rounded-full overflow-hidden mb-1">
            <div className="h-full bg-cyan-500 w-3/4"></div>
        </div>
        <div className="text-[10px] text-slate-400 text-right">3000 / 4000 XP</div>
    </div>
);

// 7. AllianceHub
export const AllianceHub: React.FC = () => (
    <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl flex items-center justify-between">
        <div>
            <h4 className="text-indigo-200 font-bold text-sm">Liên Minh Front-End</h4>
            <p className="text-[10px] text-indigo-400/80">32 thành viên • Rank Bạc</p>
        </div>
        <button className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-500">Truy cập</button>
    </div>
);

// 8. CosmicEventsFeed
export const CosmicEventsFeed: React.FC = () => (
    <div className="w-full space-y-2">
        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Radar Hoạt Động</div>
        <div className="flex gap-2 items-center text-xs text-slate-300 bg-white/5 p-2 rounded">
            <span className="material-symbols-outlined text-yellow-400 text-sm">emoji_events</span>
            <span><strong>Huy</strong> vừa đạt huy chương vàng!</span>
        </div>
        <div className="flex gap-2 items-center text-xs text-slate-300 bg-white/5 p-2 rounded">
            <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
            <span><strong>Linh</strong> đã hoàn thành khóa React.</span>
        </div>
    </div>
);

// 9. MentorConnectBtn
export const MentorConnectBtn: React.FC = () => (
    <button className="w-full py-2 border border-dashed border-purple-500/50 text-purple-300 hover:bg-purple-500/10 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
        <span className="material-symbols-outlined text-sm">school</span>
        Liên lạc Người hướng dẫn
    </button>
);

// 10. VoteThrusters
export const VoteThrusters: React.FC = () => (
    <div className="flex flex-col items-center bg-white/5 rounded-lg p-1 border border-white/10">
        <button className="text-slate-400 hover:text-orange-500 transition-colors"><span className="material-symbols-outlined text-lg">keyboard_arrow_up</span></button>
        <span className="text-xs font-bold text-white">42</span>
        <button className="text-slate-400 hover:text-blue-500 transition-colors"><span className="material-symbols-outlined text-lg">keyboard_arrow_down</span></button>
    </div>
);
