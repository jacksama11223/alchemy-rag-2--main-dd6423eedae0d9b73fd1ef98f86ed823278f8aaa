
import React, { useState, useEffect, useRef } from 'react';
import { UserAccount } from '../types';
import { getCurrentUser, addFriend, getFriendsList, fetchNotifications, respondToFriendRequestApi, getDirectMessages, sendDirectMessage } from '../services/mockBackend';
import { io, Socket } from 'socket.io-client';

interface FriendManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ChatMessage {
    _id: string; 
    content: string;
    sender: string;
    recipient: string;
    createdAt: string;
}

// Use relative path for socket to allow Vite proxy to handle it
const SOCKET_URL = '/'; 

export const FriendManager: React.FC<FriendManagerProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
    const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
    const [friends, setFriends] = useState<UserAccount[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [friendCodeInput, setFriendCodeInput] = useState('');
    const [addMessage, setAddMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    
    // Socket & Chat State
    const [socketConnected, setSocketConnected] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState<UserAccount | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    // REFS to solve "Stale State" inside socket listeners
    const selectedFriendRef = useRef<UserAccount | null>(null);
    const socketRef = useRef<Socket | null>(null);

    // Update ref whenever state changes
    useEffect(() => {
        selectedFriendRef.current = selectedFriend;
    }, [selectedFriend]);

    // 1. Initial Setup & Socket Connection
    useEffect(() => {
        if (!isOpen) return;

        const user = getCurrentUser();
        setCurrentUser(user);
        refreshData();

        if (user) {
            // Force new connection to ensure we are clean
            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            socketRef.current = io(SOCKET_URL, {
                transports: ['websocket', 'polling'],
                reconnectionAttempts: 5,
                autoConnect: true,
                path: '/socket.io' // Explicit path matching backend setup
            });

            socketRef.current.on('connect', () => {
                console.log("✅ Socket Connected. ID:", socketRef.current?.id);
                setSocketConnected(true);
                // Join room for Myself (Inbox)
                socketRef.current?.emit('join_user', user.id);
            });
            
            socketRef.current.on('disconnect', () => {
                console.log("❌ Socket Disconnected");
                setSocketConnected(false);
            });

            // GLOBAL MESSAGE LISTENER
            socketRef.current.on('receive_message', (newMsg: ChatMessage) => {
                console.log("📩 Message Received:", newMsg);
                
                const currentFriend = selectedFriendRef.current;
                
                // Logic: Is this message for the currently open chat?
                if (currentFriend) {
                    const isRelevant = 
                        (newMsg.sender === currentFriend.id && newMsg.recipient === user.id) || 
                        (newMsg.sender === user.id && newMsg.recipient === currentFriend.id);

                    if (isRelevant) {
                        setChatMessages(prev => {
                            // 1. Check if we already have this EXACT message ID (avoid pure duplicates)
                            if (prev.some(m => m._id === newMsg._id)) return prev;

                            // 2. Anti-Duplicate for Sender (Fix "Double Message" bug)
                            // If I sent this message, check if there is a temporary/optimistic message 
                            // with the SAME content. If so, REPLACE it instead of adding new.
                            if (newMsg.sender === user.id) {
                                const tempIndex = prev.findIndex(m => 
                                    m._id.startsWith('temp_') && m.content === newMsg.content
                                );
                                
                                if (tempIndex !== -1) {
                                    // Replace the temp message with the real one from socket
                                    const newList = [...prev];
                                    newList[tempIndex] = newMsg;
                                    return newList;
                                }
                            }

                            // 3. Otherwise, append new message
                            return [...prev, newMsg];
                        });
                        
                        // Scroll to bottom
                        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }
                }
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [isOpen]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (selectedFriend) {
             chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, selectedFriend]);

    // Load messages when picking a friend
    useEffect(() => {
        if (selectedFriend) {
            loadMessages();
        }
    }, [selectedFriend]);

    const refreshData = async () => {
        const user = getCurrentUser();
        if (user) {
            const fList = await getFriendsList();
            setFriends(fList);
            const notifs = await fetchNotifications();
            setNotifications(notifs.filter((n: any) => n.type === 'friend_request'));
        }
    };

    const loadMessages = async () => {
        if (!selectedFriend) return;
        setChatMessages([]); // Clear previous chat
        const msgs = await getDirectMessages(selectedFriend.id);
        setChatMessages(msgs);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
    };

    const handleSendRequest = async () => {
        if (!friendCodeInput.trim()) return;
        const result = await addFriend(friendCodeInput.trim().toUpperCase());
        setAddMessage({ text: result.message, type: result.success ? 'success' : 'error' });
        if (result.success) {
             setFriendCodeInput('');
             refreshData();
        }
        setTimeout(() => setAddMessage(null), 3000);
    };

    const handleResponse = async (id: string, action: 'accept' | 'decline') => {
        await respondToFriendRequestApi(id, action);
        refreshData();
    };

    const handleSendMessage = async () => {
        if (!selectedFriend || !chatInput.trim() || !currentUser) return;
        
        const targetId = selectedFriend.id || (selectedFriend as any)._id;
        
        if (!targetId) {
            alert("Lỗi: Không tìm thấy ID người nhận. Vui lòng tải lại trang.");
            return;
        }

        const content = chatInput;
        setChatInput(''); // Clear input

        // 1. Optimistic UI Update (Fake ID)
        const tempId = 'temp_' + Date.now();
        const tempMsg: ChatMessage = {
            _id: tempId,
            content: content,
            sender: currentUser.id,
            recipient: targetId,
            createdAt: new Date().toISOString()
        };
        
        setChatMessages(prev => [...prev, tempMsg]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

        try {
            // 2. Call API
            const savedMsg = await sendDirectMessage(targetId, content);
            
            if (savedMsg) {
                // 3. Replace Optimistic with Real (from API response)
                // Note: If Socket event arrived faster, this might be redundant but safe due to React key diffing
                setChatMessages(prev => prev.map(m => m._id === tempId ? savedMsg : m));
            } else {
                console.error("API returned null");
                setChatMessages(prev => prev.filter(m => m._id !== tempId));
                alert("Gửi tin nhắn thất bại! (Lỗi Server)");
            }
        } catch (error) {
            console.error("Failed to send", error);
            setChatMessages(prev => prev.filter(m => m._id !== tempId));
            alert("Gửi tin nhắn thất bại! (Lỗi Mạng)");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s]">
            <div className="bg-[#0f172a] w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl border border-white/10 flex overflow-hidden relative font-display">
                
                {/* 1. LEFT SIDEBAR */}
                <div className="w-80 bg-[#1e293b] border-r border-white/10 flex flex-col">
                    <div className="p-4 border-b border-white/10 bg-[#162032]">
                        <div className="flex items-center gap-3 mb-2">
                            <img src={currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Guest'} className="w-10 h-10 rounded-full border border-white/20" alt="Avatar" />
                            <div>
                                <h3 className="font-bold text-white text-sm">{currentUser?.name}</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                    <p className="text-[10px] text-slate-400">
                                        {socketConnected ? 'Online' : 'Reconnecting...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-black/20 p-2 rounded text-center cursor-pointer hover:bg-black/40 transition-colors" onClick={() => {navigator.clipboard.writeText(currentUser?.friendCode || ''); alert("Đã sao chép ID!");}}>
                             <p className="text-[10px] text-slate-400 uppercase font-bold">My Friend Code</p>
                             <p className="text-sm font-mono text-cyan-400 tracking-widest">{currentUser?.friendCode}</p>
                        </div>
                    </div>

                    <div className="flex p-2 gap-1 bg-[#1e293b]">
                        <button onClick={() => setActiveTab('friends')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'friends' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>Bạn bè ({friends.length})</button>
                        <button onClick={() => setActiveTab('requests')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors relative ${activeTab === 'requests' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>Lời mời {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}</button>
                        <button onClick={() => setActiveTab('add')} className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'add' ? 'bg-green-600 text-white' : 'text-green-500 hover:bg-green-900/20'}`}>+ Thêm</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {activeTab === 'friends' && (
                            friends.length === 0 ? <p className="text-xs text-slate-500 text-center py-4">Chưa có bạn bè.</p> :
                            friends.map(f => (
                                <div key={f.id} onClick={() => setSelectedFriend(f)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedFriend?.id === f.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-300'}`}>
                                    <img src={f.avatar} className="w-8 h-8 rounded-full bg-slate-800" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{f.name}</p>
                                        <p className="text-[10px] opacity-70 truncate">{f.rankTier || 'Iron'} • {f.lp || 0} LP</p>
                                    </div>
                                    <span className="material-symbols-outlined text-lg opacity-50">chat_bubble</span>
                                </div>
                            ))
                        )}
                        {activeTab === 'requests' && (
                            notifications.length === 0 ? <p className="text-xs text-slate-500 text-center py-4">Không có lời mời nào.</p> :
                            notifications.map(n => (
                                <div key={n._id} className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <img src={n.from?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Unknown'} className="w-8 h-8 rounded-full" />
                                        <div><p className="text-sm font-bold text-white">{n.from?.name}</p><p className="text-[10px] text-slate-400">muốn kết bạn</p></div>
                                    </div>
                                    <div className="flex gap-2"><button onClick={() => handleResponse(n._id, 'accept')} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold">Đồng ý</button><button onClick={() => handleResponse(n._id, 'decline')} className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold">Xóa</button></div>
                                </div>
                            ))
                        )}
                        {activeTab === 'add' && (
                            <div className="p-4">
                                <h4 className="text-white font-bold text-sm mb-2 uppercase">Thêm bạn bằng ID</h4>
                                <input value={friendCodeInput} onChange={(e) => setFriendCodeInput(e.target.value)} placeholder="VD: X7K9P2" className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-white focus:border-green-500 outline-none mb-3 font-mono text-center uppercase" maxLength={10} />
                                <button onClick={handleSendRequest} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg">Gửi Lời Mời</button>
                                {addMessage && <p className={`text-xs mt-3 text-center ${addMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{addMessage.text}</p>}
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. RIGHT AREA (Chat) */}
                <div className="flex-1 bg-[#0b1120] flex flex-col relative overflow-hidden">
                    <button onClick={onClose} className="absolute top-4 right-4 z-50 text-slate-500 hover:text-white bg-black/20 p-2 rounded-full hover:bg-white/10 transition-colors"><span className="material-symbols-outlined">close</span></button>

                    {selectedFriend ? (
                        <>
                            <div className="h-16 border-b border-white/10 flex items-center px-6 bg-[#162032]/90 backdrop-blur-md justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className="relative"><img src={selectedFriend.avatar} className="w-10 h-10 rounded-full border-2 border-white/10" /><div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#162032]"></div></div>
                                    <div><h3 className="font-bold text-white text-lg">{selectedFriend.name}</h3><p className="text-xs text-slate-400">{selectedFriend.rankTier}</p></div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-0">
                                {chatMessages.map((msg, idx) => {
                                    const isMe = msg.sender === currentUser?.id;
                                    return (
                                        <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-[slideInUp_0.2s]`}>
                                            {!isMe && <img src={selectedFriend.avatar} className="w-8 h-8 rounded-full mr-2 self-end mb-1" />}
                                            <div className={`max-w-[70%] p-3 rounded-2xl text-sm relative group shadow-lg ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#1e293b] text-slate-200 border border-white/10 rounded-bl-none'}`}>
                                                {msg.content}
                                                <div className="text-[9px] opacity-60 mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-4 bg-[#162032] border-t border-white/10 z-10">
                                <div className="flex gap-2 items-center bg-black/30 rounded-xl p-1.5 border border-white/10 focus-within:border-blue-500/50 transition-colors">
                                    <input className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm py-2 px-2" placeholder={`Nhắn tin cho ${selectedFriend.name}...`} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                                    <button onClick={handleSendMessage} className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg hover:scale-105 active:scale-95" disabled={!chatInput.trim()}><span className="material-symbols-outlined">send</span></button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                            <span className="material-symbols-outlined text-8xl opacity-20">diversity_3</span>
                            <p className="text-base font-medium text-slate-400">Chọn một người bạn để bắt đầu trò chuyện</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
