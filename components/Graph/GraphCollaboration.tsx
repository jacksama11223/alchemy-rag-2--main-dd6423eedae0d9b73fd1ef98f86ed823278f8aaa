
import React, { useState, useEffect } from 'react';
import { getAllUsers, getCurrentUser } from '../../services/mockBackend';

// ----------------------------------------------------------------------
// 1. LIVE TEAM PULSE: Active User Visualization
// ----------------------------------------------------------------------

export const LiveTeamPulse: React.FC = () => {
    const [users, setUsers] = useState<{ id: string, name: string, color: string, status: string }[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const currentUser = getCurrentUser();
            const allAccounts = await getAllUsers();

            // Randomizers for visual flair
            const activities = [
                'Editing Graph', 
                'Viewing Node', 
                'Idle', 
                'Running Alchemy', 
                'In NoteLab',
                'Reviewing Flashcards'
            ];
            const colors = [
                'bg-blue-500', 'bg-pink-500', 'bg-green-500', 
                'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-cyan-500'
            ];

            // Filter out current user and map real users to display format
            const onlineUsers = allAccounts
                .filter(u => u.id !== currentUser?.id)
                .map(u => ({
                    id: u.id,
                    name: u.name,
                    // Deterministic color based on name length to keep it consistent per user
                    color: colors[u.name.length % colors.length], 
                    // Random activity to simulate "Live" status
                    status: activities[Math.floor(Math.random() * activities.length)] 
                }))
                .slice(0, 5); // Show max 5 users to fit UI

            setUsers(onlineUsers);
        };
        fetchUsers();
    }, []);

    return (
        <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-4 mb-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-400 text-sm animate-pulse">wifi_tethering</span> 
                Hoạt động trực tuyến ({users.length + 1})
            </h4>
            <div className="space-y-3">
                {/* Always show current user first */}
                <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs font-bold shadow-lg relative border border-cyan-400">
                        Me
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#1e1e1e] rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-cyan-400">Bạn (Admin)</p>
                        <p className="text-[10px] text-slate-500">Đang hoạt động...</p>
                    </div>
                </div>

                {users.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-600 italic border border-dashed border-white/5 rounded-lg">
                        Đang đợi người dùng khác kết nối...
                    </div>
                )}

                {users.map(u => (
                    <div key={u.id} className="flex items-center gap-3 group">
                        <div className={`w-8 h-8 rounded-full ${u.color} flex items-center justify-center text-white text-xs font-bold shadow-lg relative`}>
                            {u.name.charAt(0).toUpperCase()}
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#1e1e1e] rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-white">{u.name}</p>
                            <p className="text-[10px] text-slate-500">{u.status}</p>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-opacity">
                            <span className="material-symbols-outlined text-sm">chat</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 2. SECURE CHAT CHANNELS
// ----------------------------------------------------------------------

export const SecureChatChannel: React.FC = () => {
    const [messages, setMessages] = useState([
        { id: 1, user: 'Alex', text: 'Should we merge the React branch?', time: '10:00' },
        { id: 2, user: 'Sarah', text: 'Yes, looking good.', time: '10:05' },
    ]);
    const [input, setInput] = useState('');

    return (
        <div className="bg-[#1e1e1e] border border-white/10 rounded-xl flex flex-col h-96 overflow-hidden">
            <div className="p-3 bg-[#0f172a] border-b border-white/10 flex justify-between items-center">
                <span className="text-sm font-bold text-white"># general-discussion</span>
                <span className="text-xs text-slate-500">3 members</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
                {messages.map(m => (
                    <div key={m.id} className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xs font-bold text-blue-300">{m.user}</span>
                            <span className="text-[9px] text-slate-500">{m.time}</span>
                        </div>
                        <p className="text-sm text-slate-300 bg-white/5 p-2 rounded-lg rounded-tl-none inline-block self-start">{m.text}</p>
                    </div>
                ))}
            </div>
            <div className="p-3 border-t border-white/10 bg-[#0f172a]">
                <div className="flex gap-2">
                    <input 
                        className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        placeholder="Type a message..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                    />
                    <button className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg">
                        <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 3. CHANGE LOG DIFF VIEWER
// ----------------------------------------------------------------------

export const ChangeLogDiff: React.FC = () => {
    return (
        <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Lịch sử thay đổi</h4>
            <div className="space-y-3 font-mono text-xs">
                <div className="border-l-2 border-green-500 pl-3 py-1">
                    <p className="text-slate-500 text-[10px]">Today, 10:45 AM • Alex</p>
                    <p className="text-green-400">+ Added node "React Hooks"</p>
                </div>
                <div className="border-l-2 border-yellow-500 pl-3 py-1">
                    <p className="text-slate-500 text-[10px]">Yesterday, 4:20 PM • Sarah</p>
                    <p className="text-yellow-300">~ Edited description of "State Management"</p>
                    <div className="mt-1 bg-black/40 p-2 rounded text-[10px]">
                        <span className="text-red-400 line-through mr-2">Old text...</span>
                        <span className="text-green-400">New updated text...</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 4. GOVERNANCE VOTING SYSTEM
// ----------------------------------------------------------------------

export const GovernanceVoting: React.FC = () => {
    return (
        <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-4 mt-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Biểu quyết (Merge Request)</h4>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-white">Merge "Feature/AI-Graph"</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">Open</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">Proposed by Mike. Adds clustering algorithm.</p>
                
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2 flex">
                    <div className="w-[60%] h-full bg-green-500"></div>
                    <div className="w-[10%] h-full bg-red-500"></div>
                </div>
                
                <div className="flex gap-2">
                    <button className="flex-1 py-1.5 bg-green-600/20 text-green-300 border border-green-500/30 rounded text-xs font-bold hover:bg-green-600/40">Approve (3)</button>
                    <button className="flex-1 py-1.5 bg-red-600/20 text-red-300 border border-red-500/30 rounded text-xs font-bold hover:bg-red-600/40">Reject (1)</button>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 5. SHARE EXPORT MODAL
// ----------------------------------------------------------------------

export const ShareExportModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#1e1e1e] p-6 rounded-2xl w-[500px] border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Chia sẻ & Xuất bản</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>
                
                <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Liên kết công khai</label>
                        <div className="flex gap-2">
                            <input className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-xs text-white" readOnly value="https://learnai.io/g/graph-123" />
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-xs font-bold">Copy</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex flex-col items-center gap-2 transition-colors">
                            <span className="material-symbols-outlined text-2xl text-green-400">image</span>
                            <span className="text-sm font-bold text-slate-300">Xuất ảnh PNG</span>
                        </button>
                        <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex flex-col items-center gap-2 transition-colors">
                            <span className="material-symbols-outlined text-2xl text-orange-400">picture_as_pdf</span>
                            <span className="text-sm font-bold text-slate-300">Xuất PDF</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// MAIN COLLABORATION HUB
// ----------------------------------------------------------------------

export const TeamOperationsHub: React.FC = () => {
    return (
        <div className="w-full max-w-7xl mx-auto p-6 animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: People */}
            <div className="space-y-6">
                <h2 className="text-2xl font-black text-white">Cộng Tác</h2>
                <LiveTeamPulse />
                <ChangeLogDiff />
            </div>

            {/* Middle Column: Chat */}
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <SecureChatChannel />
                     <GovernanceVoting />
                </div>
            </div>
        </div>
    );
};
