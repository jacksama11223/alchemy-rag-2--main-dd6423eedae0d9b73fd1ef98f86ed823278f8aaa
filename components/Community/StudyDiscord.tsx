
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UserAccount } from '../../types';
import { getCurrentUser, getChannelMessagesApi, sendChannelMessageApi, getDirectMessages, sendDirectMessage } from '../../services/mockBackend';
import { io, Socket } from 'socket.io-client';
import Peer from 'peerjs';
import { DroppableZone } from '../DroppableZone';
import { useDndActionStore } from '../../stores/dndActionStore';

// --- TYPES ---
interface Message {
    id: string;
    userId: string;
    username: string;
    avatar: string;
    content: string;
    timestamp: string;
    role?: string;
    isSystem?: boolean;
}

interface Participant {
    id: string;
    name: string;
    avatar: string;
    isMuted: boolean;
    isDeaf: boolean;
    isSpeaking: boolean;
    isCamOn: boolean;
    isScreenSharing: boolean;
    volumeLevel?: number;
    peerId?: string; // WebRTC Peer ID
}

interface Channel {
    id: string;
    name: string;
    type: 'text' | 'voice';
    participants: Participant[]; 
}

interface Category {
    id: string;
    name: string;
    channels: Channel[];
}

type OceanTheme = 'abyss' | 'coral' | 'sunset';

// Use relative path for socket to leverage Vite Proxy
const SOCKET_URL = '/'; 

// --- THEME CONFIGURATIONS ---
const THEMES: Record<OceanTheme, {
    bgGradient: [string, string, string];
    rayColor: string;
    particleColor: string;
    bubbleColor: string;
    ui: {
        sidebar: string;
        main: string;
        textMain: string;
        textMuted: string;
        accent: string;
        glass: string;
        border: string;
    }
}> = {
    abyss: {
        bgGradient: ['#020617', '#0f172a', '#020205'], // Dark Blue/Black
        rayColor: '34, 211, 238', // Cyan
        particleColor: '0, 255, 255', // Cyan
        bubbleColor: '255, 255, 255',
        ui: {
            sidebar: 'bg-[#0b1120]/80',
            main: 'bg-[#020617]/50',
            textMain: 'text-slate-200',
            textMuted: 'text-slate-400',
            accent: 'text-cyan-400',
            glass: 'bg-[#1e293b]/60',
            border: 'border-white/10'
        }
    },
    coral: {
        bgGradient: ['#006994', '#0093AF', '#004F6E'], // Tropical Blue
        rayColor: '255, 255, 255', // White rays
        particleColor: '255, 126, 107', // Coral Pink
        bubbleColor: '200, 240, 255',
        ui: {
            sidebar: 'bg-[#004e64]/80',
            main: 'bg-[#006994]/30',
            textMain: 'text-white',
            textMuted: 'text-blue-100',
            accent: 'text-yellow-300',
            glass: 'bg-[#ffffff]/10',
            border: 'border-white/20'
        }
    },
    sunset: {
        bgGradient: ['#2E1C59', '#6D327C', '#4A2563'], // Purple/Orange hints
        rayColor: '255, 165, 0', // Orange rays
        particleColor: '255, 215, 0', // Gold
        bubbleColor: '255, 200, 200',
        ui: {
            sidebar: 'bg-[#1a0b2e]/80',
            main: 'bg-[#2E1C59]/40',
            textMain: 'text-pink-100',
            textMuted: 'text-purple-200',
            accent: 'text-orange-300',
            glass: 'bg-[#4a2563]/40',
            border: 'border-pink-500/20'
        }
    }
};

// --- CYBER OCEAN BACKGROUND (ANIMATED CANVAS) ---
const CyberOceanBackground: React.FC<{ theme: OceanTheme, isLightMode: boolean }> = ({ theme, isLightMode }) => {
    // ... (Keep existing canvas implementation)
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const themeRef = useRef(THEMES[theme]);
    const modeRef = useRef(isLightMode);

    useEffect(() => {
        themeRef.current = THEMES[theme];
        modeRef.current = isLightMode;
    }, [theme, isLightMode]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const particles: any[] = [];
        const rays: any[] = [];
        const bubbles: any[] = [];

        for (let i = 0; i < 5; i++) {
            rays.push({
                x: Math.random() * width,
                width: Math.random() * 100 + 50,
                angle: (Math.random() - 0.5) * 0.2,
                speed: Math.random() * 0.002,
                opacity: Math.random() * 0.1 + 0.05
            });
        }

        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                pulseSpeed: Math.random() * 0.05
            });
        }

        for (let i = 0; i < 40; i++) {
            bubbles.push({
                x: Math.random() * width,
                y: Math.random() * height + height,
                radius: Math.random() * 3 + 1,
                speed: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.3 + 0.1,
                wobble: Math.random() * Math.PI * 2
            });
        }

        let time = 0;

        const animate = () => {
            if (!ctx) return;
            time += 0.01;
            const currentTheme = themeRef.current;
            const isLight = modeRef.current;

            ctx.clearRect(0, 0, width, height);

            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            
            if (isLight && theme === 'coral') {
                gradient.addColorStop(0, '#e0f7fa'); 
                gradient.addColorStop(0.5, '#4dd0e1');
                gradient.addColorStop(1, '#006064');
            } else {
                gradient.addColorStop(0, currentTheme.bgGradient[0]); 
                gradient.addColorStop(0.4, currentTheme.bgGradient[1]); 
                gradient.addColorStop(1, currentTheme.bgGradient[2]); 
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            ctx.save();
            ctx.globalCompositeOperation = 'overlay'; 
            rays.forEach(ray => {
                const rayGrad = ctx.createLinearGradient(ray.x, 0, ray.x + Math.tan(ray.angle) * height, height);
                rayGrad.addColorStop(0, `rgba(${currentTheme.rayColor}, ${isLight ? 0.3 : ray.opacity})`);
                rayGrad.addColorStop(1, 'transparent');
                
                ctx.fillStyle = rayGrad;
                ctx.beginPath();
                const sway = Math.sin(time + ray.x) * 20;
                ctx.moveTo(ray.x - ray.width/2 + sway, 0);
                ctx.lineTo(ray.x + ray.width/2 + sway, 0);
                ctx.lineTo(ray.x + ray.width*2 + Math.tan(ray.angle)*height + sway, height);
                ctx.lineTo(ray.x - ray.width*2 + Math.tan(ray.angle)*height + sway, height);
                ctx.fill();
            });
            ctx.restore();

            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                const flicker = Math.sin(time * 3 + p.x) * 0.2 + 0.8;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${currentTheme.particleColor}, ${p.opacity * flicker})`;
                if (!isLight) {
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = `rgba(${currentTheme.particleColor}, 0.8)`;
                } else {
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
            });

            bubbles.forEach(b => {
                b.y -= b.speed;
                b.x += Math.sin(time * 3 + b.wobble) * 0.5;
                
                if (b.y < -10) {
                    b.y = height + 10;
                    b.x = Math.random() * width;
                }

                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${currentTheme.bubbleColor}, ${b.opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(b.x - b.radius*0.3, b.y - b.radius*0.3, b.radius/3, 0, Math.PI*2);
                ctx.fillStyle = `rgba(${currentTheme.bubbleColor}, 0.3)`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        const animId = requestAnimationFrame(animate);

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animId);
        };
    }, [theme, isLightMode]);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none transition-colors duration-1000" />;
};

// --- DATA ---
const INITIAL_CATEGORIES: Category[] = [
    {
        id: 'cat_info',
        name: "TRẠM THÔNG TIN",
        channels: [
            { id: 'announcements', name: 'thông-báo-hải-trình', type: 'text', participants: [] },
            { id: 'rules', name: 'luật-biển-cả', type: 'text', participants: [] },
        ]
    },
    {
        id: 'cat_study',
        name: "KHU VỰC NGHIÊN CỨU",
        channels: [
            { id: 'general', name: 'sảnh-chính-san-hô', type: 'text', participants: [] },
            { id: 'react', name: 'hang-động-react', type: 'text', participants: [] },
            { id: 'voice_1', name: 'Tàu Ngầm Số 1', type: 'voice', participants: [] },
        ]
    }
];

export const StudyDiscord: React.FC<{ onExit: () => void, targetUser?: UserAccount | null }> = ({ onExit, targetUser }) => {
    // --- STATE ---
    const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
    const [activeChannelId, setActiveChannelId] = useState('general');
    
    // Theme
    const [currentTheme, setCurrentTheme] = useState<OceanTheme>('abyss');
    const [isLightMode, setIsLightMode] = useState(false);
    const [showAppearanceMenu, setShowAppearanceMenu] = useState(false);
    
    // Messages
    const [messagesByChannel, setMessagesByChannel] = useState<Record<string, Message[]>>({});
    const [inputDrafts, setInputDrafts] = useState<Record<string, string>>({});
    
    // WebRTC & Socket
    const socketRef = useRef<Socket | null>(null);
    const peerRef = useRef<Peer | null>(null);
    const currentUser = getCurrentUser();
    
    // Media State
    const [myStream, setMyStream] = useState<MediaStream | null>(null);
    const [peers, setPeers] = useState<Record<string, { stream: MediaStream, call: any }>>({}); // userId -> stream
    const [isMuted, setIsMuted] = useState(false);
    const [isCamOff, setIsCamOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isInVoice, setIsInVoice] = useState(false);

    // --- SOCKET & PEER CONNECTION ---
    useEffect(() => {
        if (currentUser) {
            socketRef.current = io(SOCKET_URL, {
                transports: ['websocket', 'polling'],
                reconnectionAttempts: 5,
                autoConnect: true,
                path: '/socket.io' // Match Vite Proxy config
            });

            socketRef.current.on('connect', () => {
                console.log("🌊 Discord Socket Connected");
                socketRef.current?.emit('join_user', currentUser.id);
            });

            // Text Messages
            socketRef.current.on('receive_message', handleReceiveDirectMessage);
            socketRef.current.on('receive_channel_message', handleReceiveChannelMessage);
            
            // WebRTC Signaling
            socketRef.current.on('user-connected-voice', handleUserConnectedVoice);
            socketRef.current.on('user-disconnected-voice', handleUserDisconnectedVoice);

            // Initialize Peer
            import('peerjs').then(({ default: Peer }) => {
                // Configure PeerJS to go through our Vite Proxy to avoid CORS/Mixed Content
                const peer = new Peer(undefined as any, {
                    host: window.location.hostname,
                    port: window.location.port ? parseInt(window.location.port) : 443,
                    path: '/peerjs/myapp', // Proxy rewrites this to /myapp on port 9000
                    secure: window.location.protocol === 'https:'
                });

                peer.on('open', (id) => {
                    console.log('📡 My Peer ID is: ' + id);
                    peerRef.current = peer;
                });

                // Answer incoming calls
                peer.on('call', (call) => {
                    // Answer with my current stream (if any) or empty if just listening
                    // For simplicity, we assume we always have a stream if we are in voice
                    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
                        if (isCamOff) stream.getVideoTracks().forEach(t => t.enabled = false);
                        if (isMuted) stream.getAudioTracks().forEach(t => t.enabled = false);
                        
                        setMyStream(stream); // Update local if needed
                        call.answer(stream); // Answer the call with an A/V stream.
                        
                        call.on('stream', (remoteStream) => {
                            setPeers(prev => ({
                                ...prev,
                                [call.peer]: { stream: remoteStream, call: call }
                            }));
                        });
                    }, (err) => {
                        console.error('Failed to get local stream', err);
                    });
                });
                
                peer.on('error', (err) => {
                    console.error("PeerJS Error:", err);
                });
            });
        }

        return () => {
            if(myStream) myStream.getTracks().forEach(track => track.stop());
            socketRef.current?.disconnect();
            peerRef.current?.destroy();
        };
    }, []);

    // --- HANDLERS ---
    
    // Text Handlers
    const handleReceiveDirectMessage = (newMsg: any) => {
         const otherId = newMsg.sender === currentUser?.id ? newMsg.recipient : newMsg.sender;
         const dmChannelId = `dm_${otherId}`;
         const formattedMsg = formatMessage(newMsg, currentUser);
         setMessagesByChannel(prev => ({
             ...prev,
             [dmChannelId]: [...(prev[dmChannelId] || []), formattedMsg]
         }));
    };

    const handleReceiveChannelMessage = (newMsg: any) => {
        const channelId = newMsg.channelId;
        const formattedMsg = formatMessage(newMsg, currentUser, true);
        setMessagesByChannel(prev => ({
            ...prev,
            [channelId]: [...(prev[channelId] || []), formattedMsg]
        }));
    };

    const formatMessage = (newMsg: any, currentUser: UserAccount | null, isChannel = false): Message => {
        return {
            id: newMsg._id,
            userId: isChannel ? newMsg.sender._id : newMsg.sender,
            username: isChannel ? newMsg.sender.name : (newMsg.sender === currentUser?.id ? currentUser?.name : 'User'),
            avatar: isChannel ? newMsg.sender.avatar : (newMsg.sender === currentUser?.id ? currentUser?.avatar : 'https://api.dicebear.com/7.x/bottts/svg?seed=Unknown'),
            content: newMsg.content,
            timestamp: new Date(newMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            role: (isChannel && newMsg.sender.isAdmin) ? 'Captain' : undefined
        };
    };

    // Voice Handlers
    const handleJoinVoice = async (channelId: string) => {
        if (isInVoice && activeChannelId === channelId) return;
        if (isInVoice) handleLeaveVoice(); // Leave current first

        setActiveChannelId(channelId);
        setIsInVoice(true);

        try {
            // Enhanced Error Handling for Secure Context
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                 const isSecure = window.isSecureContext;
                 let errorMsg = "Trình duyệt chặn truy cập Camera/Microphone.";
                 if (!isSecure) {
                     errorMsg += " Nguyên nhân: Kết nối không bảo mật (HTTP). Vui lòng sử dụng 'localhost' hoặc thiết lập HTTPS.";
                 } else {
                     errorMsg += " Vui lòng kiểm tra quyền trong cài đặt trình duyệt.";
                 }
                 alert(errorMsg);
                 setIsInVoice(false);
                 return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setMyStream(stream);
            
            // Tell server we joined, pass our PeerID
            if (socketRef.current && peerRef.current) {
                socketRef.current.emit('join-voice', channelId, currentUser?.id, peerRef.current.id);
            }
        } catch (err: any) {
            console.error("Error accessing media devices.", err);
            let msg = "Không thể truy cập Camera/Mic.";
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                msg += " Bạn đã từ chối quyền truy cập.";
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                msg += " Không tìm thấy thiết bị.";
            } else {
                msg += ` Chi tiết: ${err.message}`;
            }
            alert(msg);
            setIsInVoice(false);
        }
    };

    const handleLeaveVoice = () => {
        if (socketRef.current && activeChannelId) {
            socketRef.current.emit('leave-voice', activeChannelId, currentUser?.id);
        }
        
        // Stop all tracks
        if (myStream) {
            myStream.getTracks().forEach(track => track.stop());
            setMyStream(null);
        }
        
        // Close all peer connections
        Object.values(peers).forEach((p: any) => p.call.close());
        setPeers({});
        
        setIsInVoice(false);
        setActiveChannelId('general'); // Default back to text
    };

    const handleUserConnectedVoice = (userId: string, remotePeerId: string) => {
        console.log(`User ${userId} joined voice with PeerID: ${remotePeerId}`);
        // Call this user
        if (peerRef.current && myStream) {
            const call = peerRef.current.call(remotePeerId, myStream);
            call.on('stream', (remoteStream: MediaStream) => {
                setPeers(prev => ({
                    ...prev,
                    [remotePeerId]: { stream: remoteStream, call: call }
                }));
            });
        }
    };

    const handleUserDisconnectedVoice = (userId: string) => {
        console.log(`User ${userId} left voice`);
        // We rely on PeerJS 'close' or simple stream cleanup.
    };

    const toggleMute = () => {
        if (myStream) {
            myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMuted(!isMuted);
        }
    };

    const toggleCam = () => {
        if (myStream) {
            myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsCamOff(!isCamOff);
        }
    };

    const toggleShareScreen = async () => {
        if (!isScreenSharing) {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
                    alert("Trình duyệt không hỗ trợ chia sẻ màn hình.");
                    return;
                }
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const videoTrack = screenStream.getVideoTracks()[0];
                if (myStream) {
                     const oldVideoTrack = myStream.getVideoTracks()[0];
                     myStream.removeTrack(oldVideoTrack);
                     myStream.addTrack(videoTrack);
                }
                videoTrack.onended = () => {
                    stopScreenShare();
                };
                setIsScreenSharing(true);
            } catch (e) {
                console.error("Error sharing screen", e);
            }
        } else {
            stopScreenShare();
        }
    };

    const stopScreenShare = async () => {
         try {
             const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
             const videoTrack = camStream.getVideoTracks()[0];
             if (myStream) {
                 const oldTrack = myStream.getVideoTracks()[0];
                 oldTrack.stop();
                 myStream.removeTrack(oldTrack);
                 myStream.addTrack(videoTrack);
             }
             setIsScreenSharing(false);
         } catch(e) {
             console.error("Error reverting to camera", e);
         }
    };

    // --- CHANNEL SWITCHING & LOADING ---
    useEffect(() => {
        if (!currentUser) return;
        
        // Join Room for Public Channels (Text)
        if (!activeChannelId.startsWith('dm_') && !isInVoice) {
             socketRef.current?.emit('join_channel', activeChannelId);
             // Load History...
             const loadHistory = async () => {
                 const data = await getChannelMessagesApi(activeChannelId);
                 const formatted = data.map((m: any) => formatMessage(m, currentUser, true));
                 setMessagesByChannel(prev => ({ ...prev, [activeChannelId]: formatted }));
             };
             loadHistory();
        } else if (activeChannelId.startsWith('dm_')) {
             // Load DMs...
             const targetId = activeChannelId.replace('dm_', '');
             const loadDMs = async () => {
                 const msgs = await getDirectMessages(targetId);
                 setMessagesByChannel(prev => ({ ...prev, [activeChannelId]: msgs }));
             }
             loadDMs();
        }
    }, [activeChannelId, isInVoice, currentUser]);

    // Handle DM Target Effect
    useEffect(() => {
        if (targetUser) {
            const dmId = `dm_${targetUser.id}`;
            setActiveChannelId(dmId);
        }
    }, [targetUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputDrafts(prev => ({ ...prev, [activeChannelId]: e.target.value }));
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = inputDrafts[activeChannelId];
        if (!content || !content.trim()) return;

        // Optimistic clear
        setInputDrafts(prev => ({ ...prev, [activeChannelId]: '' }));

        try {
            if (activeChannelId.startsWith('dm_')) {
                const targetId = activeChannelId.replace('dm_', '');
                await sendDirectMessage(targetId, content);
            } else {
                await sendChannelMessageApi(activeChannelId, content);
            }
        } catch (error) {
            console.error("Message send failed", error);
            // Optionally restore input or show error
        }
    };

    const chatEndRef2 = useRef<HTMLDivElement>(null);
    const styles = THEMES[currentTheme].ui;
    const currentMessages = messagesByChannel[activeChannelId] || [];
    const currentInput = inputDrafts[activeChannelId] || '';

    useEffect(() => {
        chatEndRef2.current?.scrollIntoView({ behavior: 'auto' });
    }, [messagesByChannel, activeChannelId]);

    const activeChannelInfo = categories.flatMap(c => c.channels).find(ch => ch.id === activeChannelId);
    const isVoiceChannel = activeChannelInfo?.type === 'voice';

    const setAirRoomActions = useDndActionStore((state) => state.setAirRoomActions);

    useEffect(() => {
        setAirRoomActions({
            sendToRoom: (content: string) => {
                if (!activeChannelId.startsWith('dm_') && !isInVoice) {
                    sendChannelMessageApi(activeChannelId, content).catch(console.error);
                } else if (activeChannelId.startsWith('dm_')) {
                    const targetId = activeChannelId.replace('dm_', '');
                    sendDirectMessage(targetId, content).catch(console.error);
                }
            }
        });
        return () => setAirRoomActions(null);
    }, [activeChannelId, isInVoice, setAirRoomActions]);

    return (
        <DroppableZone id="air-room-zone" type="AIR_ROOM">
        <div className={`flex h-screen w-full font-display overflow-hidden relative selection:bg-cyan-500/30 transition-colors duration-500 ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
            <CyberOceanBackground theme={currentTheme} isLightMode={isLightMode} />

            {/* SERVER RAIL (Leftmost) */}
            <div className={`w-[72px] ${styles.sidebar} backdrop-blur-xl flex flex-col items-center py-4 gap-3 z-20 border-r ${styles.border} shadow-xl transition-colors duration-500`}>
                <button onClick={onExit} className={`w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 ${styles.textMuted} hover:text-white flex items-center justify-center transition-all group mb-2 border ${styles.border} hover:border-white/20`}>
                    <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                </button>
                <div className="relative group cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                        <span className="material-symbols-outlined text-2xl animate-pulse">sailing</span>
                    </div>
                </div>
                <div className="mt-auto flex flex-col gap-2 relative">
                    <button onClick={() => setShowAppearanceMenu(!showAppearanceMenu)} className={`w-12 h-12 rounded-full hover:bg-white/5 ${styles.textMuted} hover:text-white flex items-center justify-center transition-colors`}>
                        <span className="material-symbols-outlined">palette</span>
                    </button>
                    {showAppearanceMenu && (
                        <div className={`absolute bottom-0 left-16 mb-2 w-56 ${styles.sidebar} border ${styles.border} rounded-xl shadow-2xl p-4 z-50 animate-[slideInRight_0.2s]`}>
                            <h4 className={`text-xs font-bold ${styles.textMuted} uppercase mb-3`}>Giao diện</h4>
                            <div className="space-y-2">
                                {(['abyss', 'coral', 'sunset'] as OceanTheme[]).map(t => (
                                    <button key={t} onClick={() => setCurrentTheme(t)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentTheme === t ? 'bg-cyan-500/20 text-cyan-400' : styles.textMuted}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CHANNEL LIST */}
            <div className={`w-64 ${styles.sidebar} backdrop-filter backdrop-blur-lg border-r ${styles.border} flex flex-col z-10 shadow-2xl`}>
                <div className={`h-14 px-4 flex items-center border-b ${styles.border} bg-black/10`}>
                    <h1 className={`font-bold ${styles.textMain} truncate flex items-center gap-2`}><span className={`material-symbols-outlined ${styles.accent}`}>bubble_chart</span> AIR Community</h1>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
                    {categories.map((cat) => (
                        <div key={cat.id}>
                            <div className={`flex items-center gap-1 px-1 mb-1 text-[10px] font-bold ${styles.textMuted} uppercase tracking-wider`}>
                                <span className="material-symbols-outlined text-[10px]">expand_more</span> {cat.name}
                            </div>
                            <div className="space-y-0.5">
                                {cat.channels.map(channel => (
                                    <div key={channel.id} onClick={() => { if(channel.type === 'voice') handleJoinVoice(channel.id); else setActiveChannelId(channel.id); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer group transition-all ${((activeChannelId === channel.id && channel.type === 'text') || (isInVoice && activeChannelId === channel.id && channel.type === 'voice')) ? `${isLightMode ? 'bg-cyan-100 text-cyan-800' : 'bg-cyan-900/30 text-cyan-200'}` : `hover:bg-white/5 ${styles.textMuted} hover:text-white`}`}>
                                        <span className={`material-symbols-outlined text-lg opacity-70`}>{channel.type === 'text' ? 'tag' : 'volume_up'}</span>
                                        <span className="text-sm font-medium truncate">{channel.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Voice Control Panel (Bottom Left) */}
                {isInVoice && (
                    <div className="bg-[#0b1120] border-t border-white/10 p-2">
                        <div className="flex items-center gap-2 mb-2 text-green-400 text-xs font-bold px-1">
                            <span className="material-symbols-outlined text-sm">wifi_tethering</span>
                            Voice Connected
                        </div>
                        <div className="flex justify-around">
                            <button onClick={toggleMute} className={`p-2 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'hover:bg-white/10 text-slate-300'}`}>
                                <span className="material-symbols-outlined text-lg">{isMuted ? 'mic_off' : 'mic'}</span>
                            </button>
                            <button onClick={toggleCam} className={`p-2 rounded-full ${isCamOff ? 'bg-red-500 text-white' : 'hover:bg-white/10 text-slate-300'}`}>
                                <span className="material-symbols-outlined text-lg">{isCamOff ? 'videocam_off' : 'videocam'}</span>
                            </button>
                            <button onClick={toggleShareScreen} className={`p-2 rounded-full ${isScreenSharing ? 'bg-green-500 text-white' : 'hover:bg-white/10 text-slate-300'}`}>
                                <span className="material-symbols-outlined text-lg">screen_share</span>
                            </button>
                            <button onClick={handleLeaveVoice} className="p-2 rounded-full hover:bg-red-900/50 text-red-500">
                                <span className="material-symbols-outlined text-lg">call_end</span>
                            </button>
                        </div>
                    </div>
                )}

                <div className={`bg-black/20 border-t ${styles.border} p-2 h-14 overflow-hidden flex items-center gap-3`}>
                    <img src={currentUser?.avatar} className="w-8 h-8 rounded-full bg-slate-700 object-cover" />
                    <div className="flex-1 min-w-0">
                        <div className={`text-sm font-bold ${styles.textMain} truncate`}>{currentUser?.name}</div>
                        <div className={`text-[10px] ${styles.textMuted} truncate`}>#{currentUser?.friendCode}</div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className={`flex-1 flex flex-col min-w-0 ${styles.main} relative z-0 transition-colors duration-500`}>
                
                {/* Header */}
                <div className={`h-14 ${styles.glass} backdrop-blur-md px-4 flex items-center justify-between shadow-sm z-20 border-b ${styles.border}`}>
                    <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-2xl ${styles.textMuted}`}>{isVoiceChannel ? 'volume_up' : 'tag'}</span>
                        <h3 className={`font-bold ${styles.textMain} text-base`}>{activeChannelInfo?.name || (activeChannelId.startsWith('dm_') ? 'Direct Message' : 'Channel')}</h3>
                    </div>
                </div>

                {/* CONTENT: VOICE GRID or TEXT CHAT */}
                {isVoiceChannel && isInVoice ? (
                    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* My Video */}
                        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-green-500/50 shadow-lg">
                            {myStream && (
                                <video 
                                    ref={video => { if (video) video.srcObject = myStream; }} 
                                    autoPlay muted 
                                    className={`w-full h-full object-cover ${isCamOff ? 'hidden' : ''}`} 
                                />
                            )}
                            {isCamOff && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <img src={currentUser?.avatar} className="w-20 h-20 rounded-full border-2 border-white/20" />
                                </div>
                            )}
                            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs font-bold">
                                {currentUser?.name} (Bạn)
                            </div>
                        </div>

                        {/* Peer Videos */}
                        {Object.keys(peers).map(peerId => (
                            <VideoPlayer key={peerId} stream={peers[peerId].stream} label={`Peer ${peerId.substring(0, 5)}`} />
                        ))}
                    </div>
                ) : (
                    // Text Chat View
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-2">
                        {currentMessages.length === 0 ? (
                            <div className={`flex-1 flex flex-col items-center justify-center ${styles.textMuted}`}>
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-30">chat_bubble_outline</span>
                                <p>Chưa có tin nhắn nào. Hãy bắt đầu!</p>
                            </div>
                        ) : (
                            currentMessages.map((msg, idx) => {
                                const showHeader = idx === 0 || currentMessages[idx-1].userId !== msg.userId;
                                const isMe = msg.userId === currentUser?.id;
                                return (
                                    <div key={msg.id || idx} className={`group flex gap-4 px-4 py-1 hover:bg-white/5 rounded-lg transition-colors animate-[slideInUp_0.2s] ${!showHeader ? 'py-0.5' : 'mt-2'}`}>
                                        {showHeader ? <img src={msg.avatar} className="w-10 h-10 rounded-full bg-slate-700 mt-0.5" /> : <div className="w-10" />}
                                        <div className="flex-1 min-w-0">
                                            {showHeader && (
                                                <div className="flex items-baseline gap-2">
                                                    <span className={`font-bold text-base ${msg.role === 'Captain' ? 'text-amber-400' : styles.textMain}`}>{msg.username}</span>
                                                    <span className={`text-[10px] ${styles.textMuted} ml-1`}>{msg.timestamp}</span>
                                                    {msg.role === 'Captain' && <span className="text-[9px] bg-blue-600 px-1.5 rounded text-white font-bold">BOT</span>}
                                                </div>
                                            )}
                                            <p className={`${isLightMode ? 'text-slate-800' : 'text-slate-300'} leading-relaxed whitespace-pre-wrap`}>{msg.content}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={chatEndRef2} />
                    </div>
                )}

                {/* Input Area (Only for Text Channels) */}
                {!isVoiceChannel && (
                    <div className="px-4 pb-6 pt-2 z-20">
                        <form onSubmit={handleSendMessage} className={`${styles.glass} backdrop-blur-md rounded-xl px-4 py-3 flex items-center gap-3 border ${styles.border} shadow-lg relative focus-within:ring-2 focus-within:ring-cyan-500/50 transition-all`}>
                            <button type="button" className={`${styles.textMuted} hover:${styles.accent} w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-full transition-colors`}><span className="material-symbols-outlined text-2xl">add_circle</span></button>
                            <input value={currentInput} onChange={handleInputChange} className={`flex-1 bg-transparent border-none outline-none ${styles.textMain} placeholder-slate-500`} placeholder={`Gửi tin nhắn tới #${activeChannelInfo?.name || (activeChannelId.startsWith('dm_') ? 'Direct Message' : 'Channel')}`} />
                            <div className={`flex items-center gap-2 ${styles.textMuted}`}>
                                <button type="submit" className="hover:text-cyan-400"><span className="material-symbols-outlined">send</span></button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
        </DroppableZone>
    );
};

// --- SUB-COMPONENT: REMOTE VIDEO ---
const VideoPlayer: React.FC<{ stream: MediaStream, label: string }> = ({ stream, label }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-lg">
            <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs font-bold">
                {label}
            </div>
        </div>
    );
};
