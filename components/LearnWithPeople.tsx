
import React, { useState, useEffect, useRef } from 'react';
import { KnowledgeNode, FlashcardItem, UserAccount } from '../types';
import { useGamification } from '../contexts/GamificationContext';
import { getAllUsers, getUserNodesByUserId, getCurrentUser } from '../services/mockBackend';
import { FeatureWindowControls } from './FeatureWindowControls';

interface LearnWithPeopleProps {
    onBack: () => void;
    userNodes: KnowledgeNode[]; // These are MY nodes
}

type GameState = 'LOBBY' | 'SETUP' | 'PLAYING' | 'RESULT';
type DeckSource = 'MINE' | 'THEIRS' | 'MIXED';

interface Opponent extends Omit<UserAccount, 'level'> {
    status: 'online' | 'offline';
    level: string; // Mock visual level
}

export const LearnWithPeople: React.FC<LearnWithPeopleProps> = ({ onBack, userNodes }) => {
    const { updateRank } = useGamification();
    const [gameState, setGameState] = useState<GameState>('LOBBY');
    
    // Data State
    const [opponents, setOpponents] = useState<Opponent[]>([]);
    const [opponentNodes, setOpponentNodes] = useState<KnowledgeNode[]>([]);
    
    // Setup State
    const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);
    const [timeLimit, setTimeLimit] = useState(60); // seconds
    const [deckSource, setDeckSource] = useState<DeckSource>('MINE');
    const [selectedDeckId, setSelectedDeckId] = useState<string>('');
    const [activeDeck, setActiveDeck] = useState<FlashcardItem[]>([]);

    // Game State
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [myScore, setMyScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [opponentProgress, setOpponentProgress] = useState(0);
    const [myCombo, setMyCombo] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Simulation Interval
    const simIntervalRef = useRef<any>(null);

    // --- INITIALIZATION ---
    useEffect(() => {
        const fetchOpponents = async () => {
            const currentUser = getCurrentUser();
            const allUsers = await getAllUsers();
            
            // Filter out myself and map to Opponent type with simulated status
            const potentialOpponents = allUsers
                .filter(u => u.id !== currentUser?.id)
                .map(u => ({
                    ...u,
                    status: Math.random() > 0.3 ? 'online' : 'offline', // Simulate online status
                    level: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum'][Math.floor(Math.random() * 5)] + ' ' + ['I', 'II', 'III'][Math.floor(Math.random() * 3)]
                } as Opponent));
                
            setOpponents(potentialOpponents);
        };
        fetchOpponents();
    }, []);

    // --- LOBBY ACTIONS ---
    const handleInvite = (friend: Opponent) => {
        setSelectedOpponent(friend);
        
        // Load opponent's real data
        const theirNodes = getUserNodesByUserId(friend.id);
        setOpponentNodes(theirNodes);

        // Simulate invite accept
        // In a real app, this would be a socket emit
        setTimeout(() => {
            setGameState('SETUP');
        }, 800);
    };

    // --- SETUP ACTIONS ---
    const getAvailableDecks = () => {
        // Filter for nodes that actually have flashcards content
        if (deckSource === 'MINE') return userNodes.filter(n => n.data?.flashcards && n.data.flashcards.length > 0);
        if (deckSource === 'THEIRS') return opponentNodes.filter(n => n.data?.flashcards && n.data.flashcards.length > 0);
        
        // For MIXED, we need to show options. 
        // Strategy: Show My decks, but mixing happens in start logic.
        return userNodes.filter(n => n.data?.flashcards && n.data.flashcards.length > 0); 
    };

    const handleStartGame = () => {
        let finalDeck: FlashcardItem[] = [];
        
        if (deckSource === 'MINE') {
            const node = userNodes.find(n => n.id === selectedDeckId);
            if (node?.data?.flashcards) finalDeck = [...node.data.flashcards];
        } else if (deckSource === 'THEIRS') {
            const node = opponentNodes.find(n => n.id === selectedDeckId);
            if (node?.data?.flashcards) finalDeck = [...node.data.flashcards];
        } else {
            // MIXED: Combine a selected deck of mine AND a random deck from opponent
            const myDeck = userNodes.find(n => n.id === selectedDeckId)?.data?.flashcards || [];
            
            // Try to find a deck from opponent
            const validOpponentDecks = opponentNodes.filter(n => n.data?.flashcards && n.data.flashcards.length > 0);
            let theirDeck: FlashcardItem[] = [];
            
            if (validOpponentDecks.length > 0) {
                // Pick a random one
                const randomNode = validOpponentDecks[Math.floor(Math.random() * validOpponentDecks.length)];
                theirDeck = randomNode.data?.flashcards || [];
            }
            
            finalDeck = [...myDeck, ...theirDeck].sort(() => Math.random() - 0.5);
        }

        if (finalDeck.length === 0) {
            alert("Bộ thẻ trống hoặc đối thủ chưa có bộ thẻ nào để trộn! Vui lòng chọn nguồn khác.");
            return;
        }

        // Initialize Game
        setActiveDeck(finalDeck);
        setCurrentIndex(0);
        setMyScore(0);
        setOpponentScore(0);
        setOpponentProgress(0);
        setTimeLeft(timeLimit);
        setMyCombo(0);
        setGameState('PLAYING');
    };

    // --- GAME LOOP ---
    useEffect(() => {
        if (gameState === 'PLAYING') {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setGameState('RESULT');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Opponent Simulation AI
            // Logic: Randomly answers correctly every 3-6 seconds
            // In a real app, this would listen to socket events for opponent progress
            simIntervalRef.current = setInterval(() => {
                const isCorrect = Math.random() > 0.3; // 70% accuracy
                if (isCorrect) {
                    setOpponentScore(s => s + 10 + Math.floor(Math.random() * 5)); // Base points + variance
                    setOpponentProgress(p => Math.min(p + (100 / activeDeck.length), 100));
                }
            }, 4000);

            return () => {
                clearInterval(timer);
                if (simIntervalRef.current) clearInterval(simIntervalRef.current);
            };
        } else if (gameState === 'RESULT') {
            // Calculate Rank Update
            const win = myScore > opponentScore;
            updateRank(win ? 30 : -15);
        }
    }, [gameState, activeDeck.length]);

    // --- PLAYER ACTIONS ---
    const handleAnswer = (correct: boolean) => {
        setIsFlipped(false);
        if (correct) {
            const comboBonus = Math.floor(myCombo / 3) * 5;
            setMyScore(s => s + 10 + comboBonus);
            setMyCombo(c => c + 1);
        } else {
            setMyScore(s => Math.max(0, s - 5)); // Penalty
            setMyCombo(0);
        }

        // Next card loop
        if (currentIndex < activeDeck.length - 1) {
            setTimeout(() => setCurrentIndex(i => i + 1), 200);
        } else {
            // Finished deck before time, bonus points?
            setMyScore(s => s + 50); 
            // Wait for timer or end? Let's end.
            setGameState('RESULT');
        }
    };

    // --- RENDERERS ---

    const renderLobby = () => (
        <div className="w-full max-w-4xl mx-auto p-6 animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-wider">Học Cùng Mọi Người</h2>
                <p className="text-slate-400">Chọn người dùng online để thách đấu (Real Data)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {opponents.length === 0 && (
                    <div className="col-span-3 text-center text-slate-500 py-10">
                        Chưa có người dùng nào khác. Hãy mở trình duyệt khác và đăng ký tài khoản mới để thấy họ ở đây!
                    </div>
                )}
                {opponents.map(friend => (
                    <div key={friend.id} className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 hover:border-cyan-500/50 transition-all group relative overflow-hidden">
                        <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${friend.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_lime]' : 'bg-slate-500'}`}></div>
                        <img src={friend.avatar} alt={friend.name} className="w-24 h-24 rounded-full border-4 border-[#0f172a] shadow-lg" />
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white">{friend.name}</h3>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{friend.level}</p>
                        </div>
                        <button 
                            onClick={() => handleInvite(friend)}
                            disabled={friend.status !== 'online'}
                            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-lg mt-2"
                        >
                            {friend.status === 'online' ? 'Thách Đấu' : 'Offline'}
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="mt-12 text-center">
                <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors">Quay lại</button>
            </div>
        </div>
    );

    const renderSetup = () => (
        <div className="w-full max-w-3xl mx-auto p-6 bg-[#1e293b] rounded-3xl border border-cyan-500/30 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold text-white">Thiết lập phòng đấu</h3>
                <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
                    <span className="text-xs text-slate-400">VS</span>
                    <span className="text-sm font-bold text-cyan-400">{selectedOpponent?.name}</span>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Nguồn thẻ (Deck Source)</label>
                    <div className="flex gap-2">
                        <button onClick={() => setDeckSource('MINE')} className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${deckSource === 'MINE' ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-black/20 border-white/10 text-slate-400 hover:text-white'}`}>Của Tôi</button>
                        <button onClick={() => setDeckSource('THEIRS')} className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${deckSource === 'THEIRS' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-black/20 border-white/10 text-slate-400 hover:text-white'}`}>Của {selectedOpponent?.name.split(' ')[0]}</button>
                        <button onClick={() => setDeckSource('MIXED')} className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${deckSource === 'MIXED' ? 'bg-amber-600 border-amber-400 text-white' : 'bg-black/20 border-white/10 text-slate-400 hover:text-white'}`}>Trộn lẫn (Mix)</button>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
                        {deckSource === 'MINE' ? 'Chọn bộ thẻ của bạn' : deckSource === 'THEIRS' ? `Chọn bộ thẻ của ${selectedOpponent?.name}` : 'Chọn bộ thẻ của bạn (Sẽ trộn với 1 bộ ngẫu nhiên của đối thủ)'}
                    </label>
                    <select 
                        value={selectedDeckId} 
                        onChange={(e) => setSelectedDeckId(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    >
                        <option value="">-- Chọn một bộ thẻ --</option>
                        {getAvailableDecks().map(d => (
                            <option key={d.id} value={d.id}>{d.title} ({d.data?.flashcards?.length || 0} cards)</option>
                        ))}
                    </select>
                    {deckSource !== 'MINE' && getAvailableDecks().length === 0 && (
                        <p className="text-xs text-red-400 mt-2">Người dùng này chưa có bộ thẻ công khai nào.</p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Thời gian giới hạn</label>
                    <div className="flex gap-2">
                        {[60, 180, 300].map(t => (
                            <button 
                                key={t} 
                                onClick={() => setTimeLimit(t)}
                                className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${timeLimit === t ? 'bg-white text-black border-white' : 'bg-transparent border-white/20 text-slate-400'}`}
                            >
                                {t / 60} Phút
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 flex gap-4">
                    <button onClick={() => setGameState('LOBBY')} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-bold">Hủy</button>
                    <button 
                        onClick={handleStartGame} 
                        disabled={!selectedDeckId}
                        className="flex-[2] py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform"
                    >
                        BẮT ĐẦU TRẬN ĐẤU
                    </button>
                </div>
            </div>
        </div>
    );

    const renderPlaying = () => {
        const currentCard = activeDeck[currentIndex];
        const progress = ((currentIndex) / activeDeck.length) * 100;

        return (
            <div className="w-full max-w-6xl mx-auto h-[85vh] flex flex-col">
                {/* HUD */}
                <div className="flex justify-between items-center bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 mb-6">
                    <div className="flex items-center gap-4">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me" className="w-12 h-12 rounded-full border-2 border-cyan-400" />
                        <div>
                            <div className="text-2xl font-black text-cyan-400">{myScore}</div>
                            <div className="text-[10px] text-cyan-200/70 font-bold uppercase tracking-wider">Score (Combo x{myCombo})</div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="text-3xl font-mono font-bold text-white">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
                        <div className="w-48 h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-yellow-400 transition-all duration-1000 linear" style={{ width: `${(timeLeft/timeLimit)*100}%` }}></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                        <div>
                            <div className="text-2xl font-black text-red-400">{opponentScore}</div>
                            <div className="text-[10px] text-red-200/70 font-bold uppercase tracking-wider">{selectedOpponent?.name}</div>
                        </div>
                        <img src={selectedOpponent?.avatar} className="w-12 h-12 rounded-full border-2 border-red-400" />
                    </div>
                </div>

                <div className="flex gap-8 flex-1 min-h-0">
                    {/* Main Game Area */}
                    <div className="flex-[2] flex flex-col justify-center items-center relative perspective-[1000px]">
                        {currentCard ? (
                            <div 
                                onClick={() => setIsFlipped(!isFlipped)}
                                className={`w-full max-w-lg aspect-[3/2] relative cursor-pointer group transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                            >
                                {/* Front */}
                                <div className="absolute inset-0 backface-hidden bg-[#1e293b] border-2 border-cyan-500/30 rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-[0_0_50px_rgba(6,182,212,0.1)] group-hover:border-cyan-400 transition-colors">
                                    <span className="text-cyan-500/50 text-xs font-bold uppercase tracking-widest absolute top-6">Question {currentIndex + 1}</span>
                                    <h3 className="text-3xl font-bold text-white">{currentCard.front}</h3>
                                    <p className="text-slate-500 text-xs mt-4 animate-pulse">Click để lật</p>
                                </div>
                                {/* Back */}
                                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#0f172a] border-2 border-purple-500/30 rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-[0_0_50px_rgba(168,85,247,0.1)]">
                                    <span className="text-purple-500/50 text-xs font-bold uppercase tracking-widest absolute top-6">Answer</span>
                                    <h3 className="text-2xl font-medium text-purple-100">{currentCard.back}</h3>
                                </div>
                            </div>
                        ) : (
                            <div className="text-white text-2xl font-bold">Hoàn thành bộ thẻ!</div>
                        )}

                        {isFlipped && (
                            <div className="flex gap-4 mt-8 w-full max-w-md animate-slide-up">
                                <button onClick={() => handleAnswer(false)} className="flex-1 py-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-xl font-bold hover:bg-red-900/40 transition-colors">Quên (-5)</button>
                                <button onClick={() => handleAnswer(true)} className="flex-1 py-4 bg-green-900/20 border border-green-500/50 text-green-400 rounded-xl font-bold hover:bg-green-900/40 transition-colors">Biết (+10)</button>
                            </div>
                        )}
                    </div>

                    {/* Opponent Progress (Mini View) */}
                    <div className="w-16 bg-black/20 rounded-full border border-white/5 relative overflow-hidden flex flex-col justify-end p-1">
                         <div 
                            className="w-full bg-red-600 rounded-full opacity-50 transition-all duration-500 ease-linear absolute bottom-0 left-0"
                            style={{ height: `${opponentProgress}%` }}
                         ></div>
                         <div className="relative z-10 w-full aspect-square rounded-full bg-white border-2 border-red-500 overflow-hidden mb-1 shadow-lg" style={{ bottom: `${opponentProgress}%`, marginBottom: -20, transition: 'bottom 0.5s linear' }}>
                            <img src={selectedOpponent?.avatar} className="w-full h-full" />
                         </div>
                         <div className="relative z-10 w-full aspect-square rounded-full bg-white border-2 border-cyan-500 overflow-hidden" style={{ bottom: `${progress}%`, marginBottom: -20, transition: 'bottom 0.2s ease-out' }}>
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me" className="w-full h-full" />
                         </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderResult = () => {
        const isWinner = myScore >= opponentScore;
        return (
            <div className="w-full max-w-2xl mx-auto p-10 bg-[#1e293b] rounded-3xl border-2 border-white/10 text-center shadow-2xl animate-bounce-in relative overflow-hidden">
                {isWinner && <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none"></div>}
                
                <h1 className={`text-6xl font-black mb-2 ${isWinner ? 'text-yellow-400 drop-shadow-[0_0_20px_gold]' : 'text-slate-400'}`}>
                    {isWinner ? 'VICTORY!' : 'DEFEAT'}
                </h1>
                <p className="text-slate-300 text-lg mb-8">{isWinner ? 'Bạn đã chiến thắng áp đảo!' : 'Hãy cố gắng lần sau nhé.'}</p>

                <div className="flex justify-center items-end gap-8 mb-10">
                    <div className="flex flex-col items-center gap-2">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me" className={`w-24 h-24 rounded-full border-4 ${isWinner ? 'border-yellow-400 shadow-[0_0_20px_gold]' : 'border-slate-500'}`} />
                        <span className="text-3xl font-black text-white">{myScore}</span>
                    </div>
                    <span className="text-2xl font-black text-slate-600 mb-8">VS</span>
                    <div className="flex flex-col items-center gap-2">
                        <img src={selectedOpponent?.avatar} className={`w-20 h-20 rounded-full border-4 ${!isWinner ? 'border-yellow-400 shadow-[0_0_20px_gold]' : 'border-slate-500'}`} />
                        <span className="text-2xl font-bold text-slate-300">{opponentScore}</span>
                    </div>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-8 flex justify-around">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">XP Earned</p>
                        <p className="text-xl font-mono text-cyan-400">+{isWinner ? 300 : 50} XP</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Rank Points</p>
                        <p className={`text-xl font-mono ${isWinner ? 'text-green-400' : 'text-red-400'}`}>{isWinner ? '+30' : '-15'} LP</p>
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    <button onClick={() => setGameState('LOBBY')} className="px-6 py-3 border border-white/20 hover:bg-white/5 rounded-xl text-white font-bold transition-colors">
                        Về Sảnh
                    </button>
                    <button onClick={handleStartGame} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg transition-transform hover:scale-105">
                        Đấu Lại
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white font-display overflow-x-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 flex justify-between items-center border-b border-white/5 bg-[#0f172a]">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors"><span className="material-symbols-outlined">arrow_back</span></button>
                    <span className="text-lg font-bold">Học Cùng Mọi Người</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-3 py-1 bg-white/5 rounded-full text-xs font-mono text-slate-400">
                        Mode: 1v1 Blitz
                    </div>
                    <FeatureWindowControls onClose={onBack} />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                {gameState === 'LOBBY' && renderLobby()}
                {gameState === 'SETUP' && renderSetup()}
                {gameState === 'PLAYING' && renderPlaying()}
                {gameState === 'RESULT' && renderResult()}
            </div>
        </div>
    );
};
