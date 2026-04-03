
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, KnowledgeNode, SavedChatSession, TutorPersona } from '../types';
import { askGeminiWithSearch, evaluateChatSession, analyzeTutorSentiment, analyzeConversationForActions } from '../services/geminiService';
import { sendOmniMessage } from '../services/omniAgentService';
import { calculateNodeMastery, calculateItemSM2 } from '../services/sm2Service';
import { saveChatSession, fetchChatSessions, deleteChatSession } from '../services/mockBackend'; 
import { FeatureWindowControls } from './FeatureWindowControls';
import { DroppableZone } from './DroppableZone';
import { useDndActionStore } from '../stores/dndActionStore';
import { ContextualDropZone } from './ContextualDropZone';
import { AnimatePresence, motion } from 'framer-motion';

interface SocraticTutorProps {
  onBack: () => void;
  onShowAbout: () => void;
  onLogout: () => void;
  onShowFAQ: () => void;
  onShowAccount: () => void;
  initialMessage?: string;
  contextNode?: KnowledgeNode | null; 
  userNodes?: KnowledgeNode[];
  stats?: { due: number; weak: number; new: number };
  onSaveToAlchemy?: (content: string) => void; 
  onSaveCaseStudy?: (node: KnowledgeNode) => void; 
  onUpdateNode?: (node: KnowledgeNode) => void; 
  onToggleTodo?: () => void;
  onNavigateToFeature?: (feature: string, params?: any) => void; 
}

// --- OPTIMIZED VISUALS: PURE CSS BACKGROUND ---
const SunnyBeachCSSBackground: React.FC = React.memo(() => { 
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-[#e0f2fe] via-[#bae6fd] to-[#fef3c7]">
            <style>{`
                @keyframes floatParticle {
                    0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
                    50% { opacity: 0.6; }
                    100% { transform: translateY(-100px) scale(1); opacity: 0; }
                }
                @keyframes waveMoveSimple {
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-50%, 0, 0); }
                }
                @keyframes shimmerLight {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
                .particle-bubble {
                    position: absolute;
                    background: white;
                    border-radius: 50%;
                    animation: floatParticle 15s linear infinite;
                    will-change: transform, opacity;
                }
                .beach-wave {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 200%;
                    height: 150px;
                    background-repeat: repeat-x;
                    background-size: 50% 100%;
                    will-change: transform;
                }
            `}</style>
            
            {/* 1. Light Caustics Effect (Overlay) */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4) 0%, transparent 60%)' }}></div>

            {/* 2. Particles (Bubbles/Sand) */}
            {[...Array(15)].map((_, i) => (
                <div 
                    key={i}
                    className="particle-bubble"
                    style={{
                        left: `${Math.random() * 100}%`,
                        width: `${Math.random() * 6 + 2}px`,
                        height: `${Math.random() * 6 + 2}px`,
                        animationDelay: `-${Math.random() * 15}s`,
                        animationDuration: `${Math.random() * 10 + 10}s`
                    }}
                ></div>
            ))}

            {/* 3. Waves (CSS SVG) */}
            <div 
                className="beach-wave" 
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1440 320' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='rgba(255, 255, 255, 0.4)' d='M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,229.3C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'/%3E%3C/svg%3E")`,
                    animation: 'waveMoveSimple 25s linear infinite',
                    bottom: '20px',
                    height: '180px'
                }}
            ></div>
             <div 
                className="beach-wave" 
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1440 320' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='rgba(255, 255, 255, 0.6)' d='M0,224L48,218.7C96,213,192,203,288,208C384,213,480,235,576,245.3C672,256,768,256,864,240C960,224,1056,192,1152,192C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'/%3E%3C/svg%3E")`,
                    animation: 'waveMoveSimple 20s linear infinite',
                    bottom: '-20px',
                    height: '140px'
                }}
            ></div>
        </div>
    );
});

// --- HELPER COMPONENT: Render Text ---
const FormattedText: React.FC<{ text: string }> = React.memo(({ text }) => { 
    const processInlines = (input: string) => { 
        const parts = input.split(/(\*\*.*?\*\*)/g); 
        return parts.map((part, i) => { 
            if (part.startsWith('**') && part.endsWith('**')) { 
                return <strong key={i} className="font-black text-blue-600 drop-shadow-sm">{part.slice(2, -2)}</strong>; 
            } 
            return part; 
        }); 
    }; 
    
    const lines = text.split('\n'); 
    return ( 
        <div className="space-y-3 font-medium"> 
            {lines.map((line, idx) => { 
                const trimmed = line.trim(); 
                if (!trimmed) return <div key={idx} className="h-2"></div>; 
                if (trimmed.startsWith('# ')) return <h1 key={idx} className="text-2xl font-black text-blue-800 mt-4 mb-2">{processInlines(trimmed.slice(2))}</h1>; 
                if (trimmed.startsWith('## ')) return <h2 key={idx} className="text-xl font-bold text-cyan-700 mt-3 mb-1">{processInlines(trimmed.slice(3))}</h2>; 
                if (trimmed.startsWith('### ')) return <h3 key={idx} className="text-lg font-bold text-teal-700 mt-2 mb-1">{processInlines(trimmed.slice(4))}</h3>; 
                return <p key={idx} className="text-slate-700 leading-relaxed">{processInlines(line)}</p>; 
            })} 
        </div> 
    ); 
});

const TypewriterText: React.FC<{ text: string }> = ({ text }) => { 
    const [displayedText, setDisplayedText] = useState(''); 
    useEffect(() => { 
        let index = 0; 
        setDisplayedText(''); 
        const intervalId = setInterval(() => { 
            setDisplayedText((prev) => { 
                if (index < text.length) { 
                    index += 3; // Speed up typing even more for better feel
                    return text.slice(0, index); 
                } 
                clearInterval(intervalId); 
                return text; 
            }); 
        }, 15); 
        return () => clearInterval(intervalId); 
    }, [text]); 
    return <FormattedText text={displayedText} />; 
};

// --- PERSONAS (Updated Colors) ---
const PERSONAS: TutorPersona[] = [ 
    { id: 'socratic', name: 'Trợ Lý Biện Chứng', description: 'Đặt câu hỏi để giúp bạn tự tìm ra câu trả lời (Mặc định).', icon: 'psychology_alt', systemInstruction: "You are a Socratic Tutor. Never give the answer directly. Instead, ask guiding questions to help the user discover the answer themselves. Be patient, encouraging, and concise.", color: 'text-blue-500' }, 
    { id: 'feynman', name: 'Phương Pháp Feynman', description: 'Giải thích siêu đơn giản bằng phép ẩn dụ.', icon: 'child_care', systemInstruction: "You are Richard Feynman. Explain complex concepts in simple language, using analogies and metaphors. Avoid jargon. Act as if you are explaining to a 5-year-old or a complete beginner.", color: 'text-green-500' }, 
    { id: 'strict', name: 'Hội Đồng Phản Biện', description: 'Chỉ ra lỗi sai thẳng thắn và yêu cầu độ chính xác cao.', icon: 'gavel', systemInstruction: "You are a strict, academic professor. You demand precision and accuracy. Correct any logical fallacies or factual errors immediately. Do not be rude, but be very firm and direct.", color: 'text-red-500' }, 
    { id: 'buddy', name: 'Cộng Sự Nghiên Cứu', description: 'Học cùng nhau, dùng ngôn ngữ teen, emoji.', icon: 'sentiment_very_satisfied', systemInstruction: "You are a study buddy. Use casual language, slang, and emojis. Be very supportive and hype the user up. Make learning feel like a fun collaboration.", color: 'text-amber-500' }, 
    { id: 'debater', name: 'Đối Tác Tranh Biện', description: 'Phản biện lại mọi luận điểm của bạn.', icon: 'swords', systemInstruction: "You are a skilled Debater. Your goal is to challenge the user's understanding by finding flaws, counter-examples, or logical gaps in their statements. Play devil's advocate. Be respectful but sharp.", color: 'text-purple-500' } 
];

// --- NEURAL BRIDGE WIDGET ---
const NeuralBridgeWidget: React.FC<{ suggestions: { type: 'ALCHEMY' | 'GRAPH' | 'TODO' | 'NOTE', label: string, data: string, reason: string }[], onAction: (action: any) => void }> = React.memo(({ suggestions, onAction }) => { 
    if (suggestions.length === 0) return null; 
    return ( 
        <div className="mb-4 mx-auto w-full max-w-xl animate-fade-in-up"> 
            <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-3 shadow-xl"> 
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-black/5"> 
                    <span className="material-symbols-outlined text-cyan-600 text-sm animate-pulse">neurology</span> 
                    <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider">Gợi ý mở rộng nghiên cứu</span> 
                </div> 
                <div className="flex gap-2 overflow-x-auto"> 
                    {suggestions.map((s, i) => ( 
                        <button key={i} onClick={() => onAction(s)} className="flex-1 min-w-[150px] flex items-center justify-between p-2 rounded-xl bg-white/60 hover:bg-white hover:shadow-md transition-all group border border-white/40"> 
                            <div className="flex items-center gap-2 overflow-hidden"> 
                                <span className={`material-symbols-outlined text-lg ${s.type === 'ALCHEMY' ? 'text-purple-500' : s.type === 'GRAPH' ? 'text-blue-500' : s.type === 'TODO' ? 'text-amber-500' : 'text-green-500'}`}> 
                                    {s.type === 'ALCHEMY' ? 'science' : s.type === 'GRAPH' ? 'hub' : s.type === 'TODO' ? 'check_circle' : 'edit_note'} 
                                </span> 
                                <div className="text-left min-w-0"> 
                                    <div className="text-xs font-bold text-slate-700 truncate">{s.label}</div> 
                                    <div className="text-[9px] text-slate-500 truncate group-hover:text-cyan-600">{s.reason}</div> 
                                </div> 
                            </div> 
                            <span className="material-symbols-outlined text-slate-400 text-sm group-hover:text-cyan-500 group-hover:translate-x-1 transition-transform">arrow_forward</span> 
                        </button> 
                    ))} 
                </div> 
            </div> 
        </div> 
    ); 
});

// --- MAIN COMPONENT ---
const SocraticTutor: React.FC<SocraticTutorProps> = ({ 
    onBack, onShowAbout, onLogout, onShowFAQ, onShowAccount, 
    initialMessage, contextNode, userNodes, stats, 
    onSaveToAlchemy, onSaveCaseStudy, onUpdateNode, onToggleTodo, onNavigateToFeature 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedChatSession[]>([]);
  const [currentPersona, setCurrentPersona] = useState<TutorPersona>(PERSONAS[0]);
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false); 
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  const recognitionRef = useRef<any>(null);

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{score: number, feedback: string} | null>(null);
  const hasSentInitialRef = useRef(false);

  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [empathyInsight, setEmpathyInsight] = useState<{msg: string, action?: string} | null>(null);
  const [bridgeSuggestions, setBridgeSuggestions] = useState<any[]>([]);

  const setTutorActions = useDndActionStore(state => state.setTutorActions);

  useEffect(() => {
    setTutorActions({
      sendToTutor: (content: string) => {
        setInput(content);
        // Optionally auto-send: handleSend(content);
      },
      sendImageToTutor: (imageUrl: string) => {
        // Implement image sending logic if supported, or just append URL
        setInput(prev => prev + `\n[Image: ${imageUrl}]`);
      }
    });
    return () => setTutorActions(null);
  }, [setTutorActions]);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading, bridgeSuggestions]);
  
  // LOAD HISTORY FROM API
  useEffect(() => {
      const loadHistory = async () => {
          const sessions = await fetchChatSessions();
          setSavedSessions(sessions);
      };
      loadHistory();
  }, []);

  // --- UPDATED LOAD SESSION HANDLER ---
  const handleLoadSession = (session: SavedChatSession) => { 
      // 1. Load the messages
      setMessages(session.messages); 
      setSessionId(session.id);
      
      // 2. Restore persona
      const persona = PERSONAS.find(p => p.id === session.personaId);
      if (persona) setCurrentPersona(persona);
      
      // 3. Reset ephemeral state for a clean slate
      setEmpathyInsight(null);
      setBridgeSuggestions([]);
      setEvaluationResult(null);
      
      // 4. Close modal and confirm
      setShowHistoryModal(false); 
      
      // 5. Scroll
      setTimeout(scrollToBottom, 100);
  };

  // ... (Other handlers: handleSend, handleSaveSession, handleDeleteSession, etc. kept same) ...
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setEmpathyInsight(null);
    setBridgeSuggestions([]);

    // Filter out the initial model greeting if it's the very first message
    let validHistory = messages.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));
    if (validHistory.length > 0 && validHistory[0].role === 'model') {
        validHistory = validHistory.slice(1);
    }

    try {
      let responseText = "";
      if (isSearchEnabled) {
          const result = await askGeminiWithSearch(userMessage.text, validHistory);
          responseText = result.text + (result.sources ? "\n\n(Nguồn: Google Search)" : "");
      } else {
          let systemPrompt = currentPersona.systemInstruction;
          if (contextNode && contextNode.data) systemPrompt += `\n\nContext: ${JSON.stringify(contextNode.data).substring(0, 2000)}`;
          
          let token = '';
          const sessionStr = window.localStorage.getItem('learnai_session');
          if (sessionStr) {
              try {
                  const session = JSON.parse(sessionStr);
                  token = session.token || '';
              } catch (e) {}
          }
          
          const apiKey = window.localStorage.getItem('custom_gemini_api_key') || undefined;
          responseText = await sendOmniMessage(userMessage.text, validHistory, systemPrompt, token, apiKey, isThinkingMode, sessionId);
      }
      setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: new Date() }]);

      if (messages.length > 1) {
          analyzeTutorSentiment([...validHistory, { role: 'user', parts: [{ text: userMessage.text }] }]).then(analysis => {
                if (analysis.shouldSwitchPersona && analysis.shouldSwitchPersona !== currentPersona.id) {
                    setEmpathyInsight({ msg: analysis.suggestion || `Có vẻ bạn đang ${analysis.emotion}. Thử đổi người hướng dẫn?`, action: analysis.shouldSwitchPersona });
                }
            });
          analyzeConversationForActions(userMessage.text, responseText).then(result => {
                if (result.actions && result.actions.length > 0) {
                    setBridgeSuggestions(result.actions);
                }
            });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSession = async () => { 
      if (messages.length < 2) return; 
      const title = messages[1]?.text.substring(0, 30) + "..."; 
      const newSession: SavedChatSession = { 
          id: sessionId, 
          title, 
          date: new Date().toLocaleDateString(), 
          messages, 
          personaId: currentPersona.id 
      }; 
      const success = await saveChatSession(newSession);
      if (success) {
          const sessions = await fetchChatSessions();
          setSavedSessions(sessions);
          alert("Đã lưu lịch sử trò chuyện vào Database!"); 
      } else {
           const updatedSessions = [newSession, ...savedSessions];
           setSavedSessions(updatedSessions);
           alert("Đã lưu cục bộ (Server offline?)");
      }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(confirm("Bạn có chắc muốn xóa phiên trò chuyện này?")) {
          const success = await deleteChatSession(id);
          if(success) {
              setSavedSessions(prev => prev.filter(s => s.id !== id));
          } else {
              alert("Lỗi khi xóa phiên.");
          }
      }
  };

  const handlePersonaSelect = (persona: TutorPersona) => { setCurrentPersona(persona); setShowPersonaModal(false); setMessages(prev => [...prev, { role: 'model', text: `Chế độ **${persona.name}** đã được kích hoạt. ${persona.description}`, timestamp: new Date() }]); };
  const renderTimestamp = (ts: any) => { const date = ts instanceof Date ? ts : new Date(ts); if (isNaN(date.getTime())) return ""; return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); };
  
  const handleIntegrationAction = (target: string, content: string) => {
      if (!onNavigateToFeature) {
          alert("Tính năng đang phát triển.");
          return;
      }
      onNavigateToFeature('bridge', { target, content });
  };
  
  const handleBridgeAction = (suggestion: any) => {
      if (!onNavigateToFeature) return;
      let target = '';
      if (suggestion.type === 'ALCHEMY') target = 'alchemy';
      else if (suggestion.type === 'GRAPH') target = 'graph';
      else if (suggestion.type === 'TODO') target = 'todo';
      else if (suggestion.type === 'NOTE') target = 'note';
      if (target) {
           onNavigateToFeature('bridge', { target, content: suggestion.data || suggestion.label });
           setBridgeSuggestions(prev => prev.filter(s => s !== suggestion));
      }
  };

  const handleEvaluateSession = async () => { if (!contextNode || messages.length < 3) return; setIsEvaluating(true); try { const result = await evaluateChatSession(messages, contextNode.title); setEvaluationResult(result); if (onUpdateNode && contextNode.data) { const newData = { ...contextNode.data }; if (newData.flashcards) newData.flashcards = newData.flashcards.map(f => ({ ...f, sm2: calculateItemSM2(f.sm2, result.score) })); onUpdateNode({ ...contextNode, data: newData }); } } finally { setIsEvaluating(false); } };
  
  useEffect(() => {
      useDndActionStore.setState({
          tutorActions: {
              saveToKnowledgeBase: (asset) => {
                  if (onSaveCaseStudy) {
                      const newNode: KnowledgeNode = {
                          id: Date.now().toString(),
                          title: asset.title || 'Dữ liệu mới',
                          type: 'Case Study',
                          x: Math.random() * 500,
                          y: Math.random() * 500,
                          connectedNodeIds: contextNode ? [contextNode.id] : [],
                          timestamp: new Date(),
                          tags: ['imported'],
                          status: 'learning',
                          data: {
                              summary: asset.payload
                          }
                      };
                      onSaveCaseStudy(newNode);
                      alert(`Đã lưu "${newNode.title}" vào Kho dữ liệu (Knowledge Base).`);
                  }
              },
              sendToTutor: (text) => {
                  setInput(text);
                  // Optionally trigger send automatically
                  // handleSend();
              },
              sendImageToTutor: (imageUrl: string) => {
                  setInput(prev => prev + `\n[Image: ${imageUrl}]`);
              }
          }
      });
      return () => {
          useDndActionStore.setState({ tutorActions: null });
      };
  }, []);

  // ... (Effects for initial message etc) ...
  useEffect(() => {
      if (hasSentInitialRef.current) return;
      hasSentInitialRef.current = true;
      if (initialMessage) {
          const userMsg: ChatMessage = { role: 'user', text: initialMessage, timestamp: new Date() };
          setMessages(prev => [...prev, userMsg]);
          setIsLoading(true);
          const history = messages.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));
          let systemPrompt = currentPersona.systemInstruction;
          
          let token = '';
          const sessionStr = window.localStorage.getItem('learnai_session');
          if (sessionStr) {
              try {
                  const session = JSON.parse(sessionStr);
                  token = session.token || '';
              } catch (e) {}
          }

          sendOmniMessage(initialMessage, history, systemPrompt, token).then(responseText => {
                  const botMessage: ChatMessage = { role: 'model', text: responseText, timestamp: new Date() };
                  setMessages(prev => [...prev, botMessage]);
              }).finally(() => setIsLoading(false));
      } else {
          setMessages([{ role: 'model', text: `Chào mừng! Tôi là **${currentPersona.name}**. ${currentPersona.description} Bạn muốn bắt đầu từ đâu?`, timestamp: new Date() }]);
      }
  }, [initialMessage, stats, userNodes, currentPersona, contextNode]);


  const toggleListening = () => {
    if (!recognitionRef.current) return;
    isListening ? recognitionRef.current.stop() : recognitionRef.current.start();
    setIsListening(!isListening);
  };
  const handleApplyPersonaSwitch = () => {
      if (empathyInsight?.action) {
          const newPersona = PERSONAS.find(p => p.id === empathyInsight.action);
          if (newPersona) {
              handlePersonaSelect(newPersona);
              setEmpathyInsight(null);
          }
      }
  };

  const activeDragItem = useDndActionStore(state => state.activeDragItem);
  const isDraggingFile = activeDragItem?.dataType === 'FILE_ASSET';
  const isDraggingText = activeDragItem?.dataType === 'TEXT_NOTE' || activeDragItem?.dataType === 'HTML_SNIPPET' || activeDragItem?.dataType === 'AI_RESPONSE';
  const showDropZones = isDraggingFile || isDraggingText;

  return (
    <DroppableZone id="tutor-zone" type="TUTOR" className="w-full h-full">
    <div className={`relative flex min-h-screen w-full flex-col font-display text-slate-800 overflow-hidden`}>
      {/* PURE CSS BACKGROUND */}
      <SunnyBeachCSSBackground />
      
      <AnimatePresence>
          {showDropZones && (
              <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[100] flex items-center justify-center gap-8 p-8 bg-black/40 backdrop-blur-sm"
              >
                  {isDraggingFile && (
                      <>
                          <ContextualDropZone id="tutor-save-kb" type="TUTOR" action="TUTOR_SAVE_KB" icon="database" text="Lưu vào Kho dữ liệu (Knowledge Base)" isVisible={true} />
                          <ContextualDropZone id="tutor-send-chat" type="TUTOR" action="TUTOR_SEND_CHAT" icon="chat" text="Đẩy vào cuộc trò chuyện hiện tại" isVisible={true} />
                      </>
                  )}
                  {isDraggingText && (
                      <>
                          <ContextualDropZone id="tutor-send-chat-text" type="TUTOR" action="TUTOR_SEND_CHAT" icon="chat" text="Đẩy vào cuộc trò chuyện hiện tại" isVisible={true} />
                      </>
                  )}
              </motion.div>
          )}
      </AnimatePresence>

      <div className={`relative z-10 flex flex-col h-screen w-full transition-all duration-300 ${showDropZones ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
          {/* ... Header (Glassmorphism Light) ... */}
          <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/40 bg-white/40 backdrop-blur-xl px-4 py-3 shadow-sm sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={onBack}>
                    <span className="material-symbols-outlined text-3xl text-blue-500 group-hover:scale-110 transition-transform drop-shadow-md">sailing</span>
                    <span className="text-2xl font-black tracking-wide text-blue-900">LearnAI</span>
                </div>
                {contextNode && (
                    <div className="hidden md:flex items-center gap-2 bg-blue-100/50 px-3 py-1 rounded-full border border-blue-200 backdrop-blur-md shadow-sm">
                        <span className="material-symbols-outlined text-sm text-blue-600">topic</span>
                        <span className="text-xs text-blue-800 font-bold truncate max-w-[150px]">Context: {contextNode.title}</span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => { setMessages([]); setSessionId(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`); }} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/40 hover:bg-white/60 text-slate-600 transition-all shadow-sm" title="Cuộc trò chuyện mới">
                    <span className="material-symbols-outlined">add_comment</span>
                </button>
                <button onClick={() => setShowPersonaModal(true)} className="flex h-10 items-center justify-center gap-2 rounded-full border border-white/60 bg-white/40 hover:bg-white/60 px-4 text-sm font-bold text-slate-700 transition-all shadow-sm">
                    <span className={`material-symbols-outlined ${currentPersona.color}`}>{currentPersona.icon}</span>
                    <span className="hidden sm:inline">{currentPersona.name}</span>
                </button>
                <button onClick={() => setShowHistoryModal(true)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/40 hover:bg-white/60 text-slate-600 transition-all shadow-sm" title="Lịch sử">
                    <span className="material-symbols-outlined">history</span>
                </button>
                <button onClick={onShowAccount} className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-base font-bold text-slate-700 transition-all hover:bg-white/60 border border-white/60 bg-white/30 shadow-sm">
                    <span className="material-symbols-outlined text-xl">person</span>
                    <span className="hidden sm:inline">Tài khoản</span>
                </button>
                <FeatureWindowControls onClose={onBack} />
            </div>
          </header>

          <main className="flex-grow overflow-hidden flex flex-col relative">
              <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-1 flex-col px-4 pb-6 pt-4 sm:px-6 lg:px-8">
                  {/* Top Bar with Omni Tool and Back */}
                  <div className="flex justify-end items-center mb-4">
                    {/* Omni Tool Trigger */}
                    <div className="flex gap-2">
                        {onToggleTodo && (
                             <button onClick={onToggleTodo} className="p-2 bg-amber-100/50 text-amber-600 border border-amber-200 rounded-full hover:bg-amber-100 shadow-sm" title="Todo">
                                <span className="material-symbols-outlined text-lg">checklist</span>
                            </button>
                        )}
                        <button onClick={() => handleIntegrationAction('draw', '')} className="p-2 bg-purple-100/50 text-purple-600 border border-purple-200 rounded-full hover:bg-purple-100 shadow-sm" title="Vẽ (Draw)">
                            <span className="material-symbols-outlined text-lg">brush</span>
                        </button>
                        <button onClick={() => handleIntegrationAction('drive', '')} className="p-2 bg-blue-100/50 text-blue-600 border border-blue-200 rounded-full hover:bg-blue-100 shadow-sm" title="Drive">
                            <span className="material-symbols-outlined text-lg">folder_open</span>
                        </button>
                    </div>
                  </div>

                  {/* Neural Empathy Notification */}
                  {empathyInsight && (
                      <div className="mb-4 mx-auto bg-purple-100/90 border border-purple-300 p-3 rounded-xl flex items-center justify-between gap-4 shadow-lg animate-bounce-in max-w-lg">
                          <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-purple-600 text-xl animate-pulse">neurology</span>
                              <span className="text-sm text-purple-900 font-medium">{empathyInsight.msg}</span>
                          </div>
                          <div className="flex gap-2">
                              <button onClick={handleApplyPersonaSwitch} className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors shadow-md">Đổi ngay</button>
                              <button onClick={() => setEmpathyInsight(null)} className="text-purple-400 hover:text-purple-600 px-2"><span className="material-symbols-outlined text-sm">close</span></button>
                          </div>
                      </div>
                  )}

                  {/* Chat Area (Glassmorphism Light) */}
                  <div className="flex h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white/30 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                          {messages.map((msg, index) => (
                              <div 
                                key={index} 
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-start'} gap-4 animate-[fadeInUp_0.3s_ease-out] group relative`}
                                onMouseEnter={() => setHoveredMessageId(msg.id || index.toString())}
                                onMouseLeave={() => setHoveredMessageId(null)}
                              >
                                  {msg.role === 'model' && (
                                      <div className={`mt-1 h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 bg-white/80 shadow-md flex items-center justify-center ${isChallengeMode ? 'border-red-400' : 'border-blue-400'}`}>
                                          <span className={`material-symbols-outlined text-2xl ${currentPersona.color}`}>{currentPersona.icon}</span>
                                      </div>
                                  )}
                                  
                                  <div className={`flex max-w-2xl flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-1`}>
                                      <p className={`text-xs font-bold ${msg.role === 'model' ? 'text-blue-800' : 'text-amber-800'}`}>
                                          {msg.role === 'model' ? currentPersona.name : 'Bạn'}
                                      </p>
                                      
                                      <div className={`p-5 shadow-lg relative border backdrop-blur-md ${
                                          msg.role === 'model' 
                                          ? 'rounded-3xl rounded-tl-none bg-white/70 border-white/60 text-slate-800' 
                                          : 'rounded-3xl rounded-tr-none bg-gradient-to-br from-amber-100 to-orange-50 border-orange-200/50 text-slate-900'
                                      }`}>
                                          <div className="text-base leading-relaxed font-medium">
                                              {msg.role === 'model' ? <TypewriterText text={msg.text} /> : <FormattedText text={msg.text} />}
                                          </div>
                                      </div>
                                      
                                      {/* DIALECTIC TOOLBAR (On Hover - Darker icons for light bg) */}
                                      <div className={`flex gap-1 mt-1 transition-opacity duration-300 ${hoveredMessageId === (msg.id || index.toString()) ? 'opacity-100' : 'opacity-0'}`}>
                                          <span className="text-[10px] text-slate-500 opacity-60 px-1 self-center">{renderTimestamp(msg.timestamp)}</span>
                                          {msg.role === 'model' && (
                                              <>
                                                  <button onClick={() => handleIntegrationAction('alchemy', msg.text)} className="p-1.5 rounded-full bg-white/40 hover:bg-purple-100 text-slate-500 hover:text-purple-600 border border-transparent hover:border-purple-300 transition-all shadow-sm" title="Giả Kim Thuật">
                                                      <span className="material-symbols-outlined text-[16px]">science</span>
                                                  </button>
                                                  <button onClick={() => handleIntegrationAction('graph', msg.text)} className="p-1.5 rounded-full bg-white/40 hover:bg-blue-100 text-slate-500 hover:text-blue-600 border border-transparent hover:border-blue-300 transition-all" title="Graph">
                                                      <span className="material-symbols-outlined text-[16px]">hub</span>
                                                  </button>
                                                  <button onClick={() => handleIntegrationAction('note', msg.text)} className="p-1.5 rounded-full bg-white/40 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 border border-transparent hover:border-indigo-300 transition-all" title="NoteLab">
                                                      <span className="material-symbols-outlined text-[16px]">edit_note</span>
                                                  </button>
                                                  <button onClick={() => handleIntegrationAction('todo', msg.text)} className="p-1.5 rounded-full bg-white/40 hover:bg-amber-100 text-slate-500 hover:text-amber-600 border border-transparent hover:border-amber-300 transition-all" title="Todo">
                                                      <span className="material-symbols-outlined text-[16px]">checklist</span>
                                                  </button>
                                                   <button onClick={() => handleIntegrationAction('todo_bulk', msg.text)} className="p-1.5 rounded-full bg-white/40 hover:bg-teal-100 text-slate-500 hover:text-teal-600 border border-transparent hover:border-teal-300 transition-all" title="Plan">
                                                      <span className="material-symbols-outlined text-[16px]">list_alt</span>
                                                  </button>
                                              </>
                                          )}
                                      </div>
                                  </div>

                                  {msg.role === 'user' && (
                                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-amber-300 bg-amber-100 shadow-md">
                                          <img alt="User" className="h-full w-full object-cover opacity-90" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                                      </div>
                                  )}
                              </div>
                          ))}
                          
                          {isLoading && (
                              <div className="flex items-start gap-4">
                                  <div className="mt-1 h-10 w-10 flex-shrink-0 rounded-full border-2 border-blue-300 bg-white flex items-center justify-center shadow-sm">
                                      <span className={`material-symbols-outlined text-lg ${currentPersona.color}`}>{currentPersona.icon}</span>
                                  </div>
                                  <div className="rounded-3xl rounded-tl-none bg-white/60 p-4 border border-white/50 backdrop-blur-md flex flex-col gap-2 shadow-sm">
                                      <div className="flex gap-1.5 h-2 items-center">
                                          <div className="size-2 bg-blue-400 rounded-full animate-bounce"></div>
                                          <div className="size-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                                          <div className="size-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                                      </div>
                                      <p className="text-[10px] text-blue-500 font-mono uppercase tracking-widest animate-pulse">Thinking (Gemini 3 Pro)...</p>
                                  </div>
                              </div>
                          )}
                          <div ref={messagesEndRef} />
                      </div>

                      {/* Neural Bridge Widget - Shows AI Suggestions */}
                      <NeuralBridgeWidget suggestions={bridgeSuggestions} onAction={handleBridgeAction} />

                      {/* Input Area (Light Glass) */}
                      <div className="px-4 pb-6 pt-2 sm:px-6">
                          <div className="relative group shadow-xl rounded-full">
                              <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full blur opacity-40"></div>
                              <input 
                                  className="relative w-full rounded-full border border-white/60 bg-white/80 py-4 pl-6 pr-40 text-base text-slate-800 placeholder-slate-400 backdrop-blur-md outline-none focus:border-cyan-400 focus:bg-white transition-all shadow-inner" 
                                  placeholder={isListening ? "Đang lắng nghe..." : isSearchEnabled ? "Tìm kiếm Google & hỏi..." : "Nhập câu trả lời..."} 
                                  type="text"
                                  value={input}
                                  onChange={(e) => setInput(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                  disabled={isLoading || isListening}
                              />
                              <div className="absolute inset-y-0 right-1.5 flex items-center gap-1 z-10">
                                  <button onClick={() => setIsThinkingMode(!isThinkingMode)} className={`p-2 rounded-full transition-all ${isThinkingMode ? 'text-purple-600 bg-purple-100' : 'text-slate-400 hover:text-purple-500'}`} title="Thinking Mode (Gemini 3 Pro)">
                                      <span className="material-symbols-outlined text-xl">psychology</span>
                                  </button>
                                  <button onClick={() => setIsSearchEnabled(!isSearchEnabled)} className={`p-2 rounded-full transition-all ${isSearchEnabled ? 'text-blue-600 bg-blue-100' : 'text-slate-400 hover:text-blue-500'}`} title="Search Grounding">
                                      <span className="material-symbols-outlined text-xl">travel_explore</span>
                                  </button>
                                  <button onClick={toggleListening} className={`p-2 rounded-full transition-all ${isListening ? 'text-red-500 animate-pulse bg-red-100' : 'text-slate-400 hover:text-red-500'}`}>
                                      <span className="material-symbols-outlined text-xl">{isListening ? 'mic_off' : 'mic'}</span>
                                  </button>
                                  <button onClick={handleSend} disabled={isLoading || !input.trim()} className={`p-2 rounded-full transition-all ${!input.trim() ? 'text-slate-300' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-400/50 hover:scale-105'}`}>
                                      <span className="material-symbols-outlined text-xl">send</span>
                                  </button>
                              </div>
                          </div>
                          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                              <button onClick={handleSaveSession} className="flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white/70 transition-all backdrop-blur-sm shadow-sm hover:shadow-md">
                                  <span className="material-symbols-outlined text-base">save</span> Lưu trữ thảo luận
                              </button>
                              <button onClick={() => setShowHistoryModal(true)} className="flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white/70 transition-all backdrop-blur-sm shadow-sm hover:shadow-md">
                                  <span className="material-symbols-outlined text-base">history</span> Nhật Ký Thảo Luận
                              </button>
                              <button onClick={handleEvaluateSession} disabled={isEvaluating} className="flex items-center gap-2 rounded-full border border-purple-300 bg-purple-100/50 px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-200/50 transition-all backdrop-blur-sm shadow-sm hover:shadow-md">
                                  <span className="material-symbols-outlined text-base">{isEvaluating ? 'sync' : 'grade'}</span> Đánh giá chất lượng
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </main>
          
          {/* Modals for Eval, History, Persona (Synced) - Updated to Light Theme */}
          {evaluationResult && (
              <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s]">
                  <div className="bg-white border border-purple-200 w-full max-w-md rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-b from-purple-50 via-white to-white pointer-events-none"></div>
                      <div className="mb-6 flex justify-center relative z-10">
                          <div className="size-24 rounded-full bg-purple-100 flex items-center justify-center border-4 border-purple-500 shadow-lg">
                              <span className="text-4xl font-black text-purple-700">{evaluationResult.score}/5</span>
                          </div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2 relative z-10">Kết quả đánh giá</h3>
                      <div className="text-slate-600 mb-6 text-sm leading-relaxed relative z-10 bg-purple-50 p-4 rounded-xl border border-purple-100">
                          <FormattedText text={evaluationResult.feedback} />
                      </div>
                      <button onClick={() => setEvaluationResult(null)} className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all relative z-10 shadow-lg">Tiếp tục</button>
                  </div>
              </div>
          )}

          {showHistoryModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s]">
                  <div className="bg-white border border-white/60 w-full max-w-md rounded-3xl overflow-hidden max-h-[80vh] flex flex-col shadow-2xl relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white pointer-events-none"></div>
                      <div className="p-5 border-b border-slate-100 flex justify-between bg-white/80 relative z-10">
                          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><span className="material-symbols-outlined text-blue-500">history</span> Nhật Ký Thảo Luận</h3>
                          <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
                      </div>
                      <div className="p-4 overflow-y-auto flex-1 space-y-3 custom-scrollbar relative z-10">
                          {savedSessions.length === 0 && <p className="text-slate-400 text-center py-8 italic">Chưa có lịch sử trò chuyện.</p>}
                          {savedSessions.map(session => (
                              <div key={session.id} className="group p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-300 transition-all flex justify-between items-center cursor-pointer shadow-sm hover:shadow-md" onClick={() => handleLoadSession(session)}>
                                  <div className="flex-1 min-w-0">
                                      <h4 className="text-slate-800 font-bold truncate text-sm mb-1">{session.title}</h4>
                                      <p className="text-[10px] text-slate-500 font-medium">{session.date} • {session.messages.length} tin nhắn</p>
                                  </div>
                                  <button 
                                    onClick={(e) => handleDeleteSession(session.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                    title="Xóa phiên này"
                                  >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {showPersonaModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s]">
                  <div className="bg-white border border-white/60 w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl relative">
                       <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white pointer-events-none"></div>
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/80 relative z-10">
                          <h3 className="text-2xl font-bold text-slate-800">Chọn Chế Độ Tương Tác</h3>
                          <button onClick={() => setShowPersonaModal(false)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
                      </div>
                      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar relative z-10">
                          {PERSONAS.map(persona => (
                              <div key={persona.id} onClick={() => handlePersonaSelect(persona)} className={`cursor-pointer p-5 rounded-2xl border transition-all flex items-start gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 ${currentPersona.id === persona.id ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-100' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${currentPersona.id === persona.id ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                      <span className={`material-symbols-outlined text-3xl ${persona.color}`}>{persona.icon}</span>
                                  </div>
                                  <div>
                                      <h4 className={`font-bold text-base mb-1 ${persona.color}`}>{persona.name}</h4>
                                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{persona.description}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}
      </div>
    </div>
    </DroppableZone>
  );
};

export default React.memo(SocraticTutor);
