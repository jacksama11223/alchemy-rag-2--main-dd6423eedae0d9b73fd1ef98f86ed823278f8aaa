
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { KnowledgeNode } from '../types';
import { calculateItemSM2, getPredictedInterval } from '../services/sm2Service';
import { gradeUserAnswer } from '../services/geminiService';
import { useGamification } from '../contexts/GamificationContext';
import { reviewNodeItemInBackend } from '../services/mockBackend';
import { LearningSideToolbar } from './LearningSideToolbar';
import { useAppStore } from '../store/useAppStore';
import { InteractionMode } from '../types';

interface LearningModalProps {
    node: KnowledgeNode;
    onClose: () => void;
    onUpdateNode?: (node: KnowledgeNode) => void;
    onDeepDive: (context: string) => void;
    playlistTotal?: number;
    playlistCurrent?: number;
    onNextNode?: () => void;
    onEditInNoteLab?: (node: KnowledgeNode) => void; 
    parentNodeTitle?: string; // New prop for G-Learning breadcrumb
}

type SessionItemType = 'Flashcard' | 'Quiz' | 'Fill-in-the-blanks' | 'Spot the Error' | 'Case Study';

interface SessionItem {
    type: SessionItemType;
    data: any;
    originalIndex: number;
}

// --- MEMOIZED SUB-COMPONENTS ---
// ... (FlashcardView, QuizView, OtherTypesView remain exactly same) ...
// 1. Flashcard Component
const FlashcardView = React.memo(({ 
    data, isFlipped, onFlip, isAIGradingMode, userAnswer, onUserAnswerChange, 
    onSubmitGrading, aiFeedback, isGrading, onNext, onRate, getIntervalLabel, isRankedMode,
    combo, isShake
}: any) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-full gap-8 my-auto relative">
            {/* Combo Counter Effect */}
            {combo > 1 && (
                <div className="absolute top-0 right-0 z-50 animate-bounce text-yellow-400 font-black text-2xl drop-shadow-[0_0_10px_orange]">
                    {combo}x COMBO!
                </div>
            )}

            <div className={`relative w-full max-w-2xl aspect-[3/2] perspective-[1000px] min-h-[300px] ${isShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
                <div 
                    className={`w-full h-full relative preserve-3d transition-transform duration-500 cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                    onClick={() => { if(!isAIGradingMode || isFlipped) onFlip(); }}
                >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-[0_0_30px_rgba(56,189,248,0.2)] flex flex-col items-center justify-center p-8 text-center border-2 border-slate-200 dark:border-slate-700 overflow-y-auto hover:border-cyan-400 transition-colors">
                        <span className="text-slate-400 text-sm uppercase tracking-widest mb-4 font-bold shrink-0">Mặt trước</span>
                        <p className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white leading-relaxed whitespace-pre-wrap break-words w-full">
                            {data.front}
                        </p>
                        
                        {/* AI Grading Input on Front */}
                        {isAIGradingMode && !isFlipped && (
                            <div className="absolute bottom-4 w-full px-8 shrink-0" onClick={e => e.stopPropagation()}>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-full py-3 px-4 text-center focus:ring-2 focus:ring-purple-500 outline-none transition-all text-slate-800 dark:text-white placeholder-slate-400"
                                    placeholder="Nhập câu trả lời của bạn..."
                                    value={userAnswer}
                                    onChange={(e) => onUserAnswerChange(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && onSubmitGrading()}
                                />
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onSubmitGrading(); }}
                                    disabled={isGrading || !userAnswer}
                                    className="mt-2 w-full py-2 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-500 disabled:opacity-50 transition-colors"
                                >
                                    {isGrading ? "Đang chấm..." : "Kiểm tra"}
                                </button>
                            </div>
                        )}
                        {!isAIGradingMode && <p className="absolute bottom-4 text-slate-400 text-xs animate-pulse shrink-0">Nhấn để lật</p>}
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.3)] flex flex-col items-center justify-center p-8 text-center border-2 border-indigo-500/50 overflow-y-auto">
                        <span className="text-indigo-300 text-sm uppercase tracking-widest mb-4 font-bold shrink-0">Mặt sau</span>
                        <p className="text-xl md:text-2xl font-medium text-white leading-relaxed whitespace-pre-wrap break-words w-full">
                            {data.back}
                        </p>
                        {/* AI Grading Result */}
                        {aiFeedback && (
                            <div className="mt-4 p-3 bg-white/10 rounded-xl border border-white/20 w-full animate-[fadeIn_0.5s] shrink-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-slate-300 font-bold uppercase">AI Đánh giá</span>
                                    <span className={`text-lg font-black ${aiFeedback.score >= 4 ? 'text-green-400' : aiFeedback.score >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>{aiFeedback.score}/5</span>
                                </div>
                                <p className="text-sm text-slate-200">{aiFeedback.feedback}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls */}
            {isFlipped ? (
                isAIGradingMode ? (
                    <button onClick={onNext} className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full font-bold transition-all shadow-lg cursor-pointer shrink-0">
                        Tiếp tục
                    </button>
                ) : (
                    <div className="grid grid-cols-4 gap-3 w-full max-w-2xl animate-[fadeInUp_0.3s] shrink-0">
                        <button onClick={() => onRate(0)} className="py-3 px-1 bg-red-900/30 text-red-300 border border-red-500/30 rounded-xl hover:bg-red-500/20 font-bold cursor-pointer transition-colors flex flex-col items-center relative group hover:scale-105 active:scale-95">
                            <span>Quên</span>
                            <span className="text-xs opacity-70">{getIntervalLabel(0)}</span>
                            {isRankedMode && <span className="absolute -top-3 right-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">-15 LP</span>}
                        </button>
                        <button onClick={() => onRate(3)} className="py-3 px-1 bg-yellow-900/30 text-yellow-300 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/20 font-bold cursor-pointer transition-colors flex flex-col items-center relative group hover:scale-105 active:scale-95">
                            <span>Khó</span>
                            <span className="text-xs opacity-70">{getIntervalLabel(3)}</span>
                            {isRankedMode && <span className="absolute -top-3 right-0 bg-yellow-600 text-black text-[10px] px-2 py-0.5 rounded-full font-black">+5 LP</span>}
                        </button>
                        <button onClick={() => onRate(4)} className="py-3 px-1 bg-blue-900/30 text-blue-300 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 font-bold cursor-pointer transition-colors flex flex-col items-center relative group hover:scale-105 active:scale-95">
                            <span>Được</span>
                            <span className="text-xs opacity-70">{getIntervalLabel(4)}</span>
                            {isRankedMode && <span className="absolute -top-3 right-0 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">+10 LP</span>}
                        </button>
                        <button onClick={() => onRate(5)} className="py-3 px-1 bg-green-900/30 text-green-300 border border-green-500/30 rounded-xl hover:bg-green-500/20 font-bold cursor-pointer transition-colors flex flex-col items-center relative group hover:scale-105 active:scale-95">
                            <span>Dễ</span>
                            <span className="text-xs opacity-70">{getIntervalLabel(5)}</span>
                            {isRankedMode && <span className="absolute -top-3 right-0 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">+20 LP</span>}
                        </button>
                    </div>
                )
            ) : (
                <div className="text-slate-400 text-sm shrink-0">{isAIGradingMode ? "Nhập câu trả lời để AI chấm điểm" : "Lật thẻ để đánh giá mức độ ghi nhớ"}</div>
            )}
        </div>
    );
});

// 2. Quiz Component
const QuizView = React.memo(({ data, selectedOption, isRevealed, onSelectOption, onCheck, onNext, isRankedMode }: any) => {
    // Check data integrity
    if (!data || !data.options || !Array.isArray(data.options)) {
        return <div className="text-red-400 text-center p-8">Lỗi dữ liệu: Câu hỏi trắc nghiệm không hợp lệ. (Thiếu options)</div>;
    }

    return (
        <div className="flex flex-col h-full my-auto max-w-4xl mx-auto w-full">
            <div className="bg-white/5 p-6 md:p-8 rounded-2xl border border-white/10 shrink-0 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                <h4 className="text-lg md:text-xl font-bold text-white mb-6 leading-relaxed whitespace-pre-wrap break-words relative z-10">
                    <span className="text-sky-400 mr-2">Q.</span>
                    {data.question}
                </h4>
                <div className="space-y-3 relative z-10">
                    {data.options.map((opt: string, optIdx: number) => {
                        const isSelected = selectedOption === optIdx;
                        const isCorrect = optIdx === data.correctAnswer;
                        let btnClass = "bg-black/20 border-white/10 text-slate-300 hover:bg-white/10";
                        
                        if (isRevealed) {
                            if (isCorrect) btnClass = "bg-green-500/20 border-green-500 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                            else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-100";
                        } else if (isSelected) {
                            btnClass = "bg-sky-500/20 border-sky-500 text-sky-100 shadow-md";
                        }

                        return (
                            <button
                                key={optIdx}
                                disabled={isRevealed}
                                onClick={() => onSelectOption(optIdx)}
                                className={`w-full p-4 rounded-xl text-left text-base transition-all border cursor-pointer whitespace-normal break-words h-auto min-h-[3.5rem] flex items-center transform active:scale-[0.99] ${btnClass}`}
                            >
                                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center mr-3 text-xs font-bold shrink-0">
                                    {String.fromCharCode(65 + optIdx)}
                                </span>
                                {opt}
                            </button>
                        );
                    })}
                </div>
                
                {isRevealed && (
                    <div className="mt-6 p-4 bg-indigo-900/30 rounded-lg border border-indigo-500/30 animate-[fadeIn_0.3s]">
                        <div className="flex items-center gap-2 mb-2">
                            {selectedOption === data.correctAnswer 
                                ? <span className="text-green-400 font-bold flex items-center gap-1"><span className="material-symbols-outlined">check_circle</span> Chính xác! {isRankedMode && "+20 LP"}</span>
                                : <span className="text-red-400 font-bold flex items-center gap-1"><span className="material-symbols-outlined">error</span> Chưa đúng {isRankedMode && "-15 LP"}</span>
                            }
                        </div>
                        <p className="text-indigo-200 text-sm whitespace-pre-wrap">{data.explanation}</p>
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-center shrink-0">
                {!isRevealed ? (
                    <button 
                        disabled={selectedOption === undefined}
                        onClick={onCheck}
                        className="px-10 py-3 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform cursor-pointer"
                    >
                        Kiểm tra
                    </button>
                ) : (
                    <button 
                        onClick={onNext}
                        className="px-10 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20 cursor-pointer"
                    >
                        Câu tiếp theo
                    </button>
                )}
            </div>
        </div>
    );
});

// 3. Other Types Component
const OtherTypesView = React.memo(({ type, data, isRevealed, onReveal, onNext, onRate, getIntervalLabel }: any) => {
    return (
        <div className="flex flex-col h-full my-auto max-w-3xl mx-auto w-full text-center">
            <div className="bg-white/5 p-6 md:p-8 rounded-2xl border border-white/10 mb-8 min-h-[300px] flex flex-col justify-center items-center shrink-0 shadow-lg">
                {type === 'Fill-in-the-blanks' && (
                    <>
                        <p className="text-2xl text-white font-medium leading-relaxed whitespace-pre-wrap break-words w-full">
                            {data.sentence}
                        </p>
                        {isRevealed && (
                            <div className="mt-6 text-emerald-400 font-bold text-xl animate-[fadeIn_0.5s] p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/30">
                                Đáp án: {data.answer}
                            </div>
                        )}
                    </>
                )}

                {type === 'Spot the Error' && (
                    <>
                        <div className="flex items-center gap-2 mb-4 text-coral-orange">
                            <span className="material-symbols-outlined">error_outline</span>
                            <span className="font-bold uppercase tracking-wider text-sm">Tìm lỗi sai</span>
                        </div>
                        <p className={`text-xl text-white mb-4 whitespace-pre-wrap break-words w-full ${isRevealed ? 'line-through opacity-50' : ''}`}>
                            {data.text}
                        </p>
                        {isRevealed && (
                            <div className="animate-[fadeIn_0.5s] w-full p-4 bg-green-900/20 rounded-xl border border-green-500/30">
                                <p className="text-green-400 font-bold text-xl mb-2 whitespace-pre-wrap">{data.correction}</p>
                                <p className="text-slate-400 text-sm whitespace-pre-wrap">Lỗi: {data.error}</p>
                            </div>
                        )}
                    </>
                )}

                {type === 'Case Study' && (
                    <div className="text-left w-full">
                        <div className="bg-black/20 p-4 rounded-lg border-l-4 border-warm-gold mb-4 italic text-slate-300 whitespace-pre-wrap">
                            "{data.scenario}"
                        </div>
                        <h4 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sky-400">help</span>
                            Câu hỏi:
                        </h4>
                        <p className="text-white mb-6 whitespace-pre-wrap">{data.question}</p>
                        
                        {isRevealed && (
                            <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/30 animate-[fadeIn_0.5s]">
                                <h5 className="text-indigo-300 font-bold mb-1 text-sm uppercase">Phân tích</h5>
                                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{data.analysis}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {!isRevealed ? (
                <button 
                    onClick={onReveal}
                    className="px-8 py-3 rounded-full bg-sky-600 text-white font-bold hover:bg-sky-500 shadow-lg transition-all hover:scale-105 cursor-pointer shrink-0"
                >
                    Hiện đáp án / Phân tích
                </button>
            ) : (
                <div className="flex flex-col gap-2 w-full max-w-xl mx-auto animate-[fadeInUp_0.3s] shrink-0">
                    <p className="text-sm text-slate-400 mb-2">Bạn cảm thấy thế nào?</p>
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => onRate(1)} className="py-3 bg-red-600/20 text-red-300 border border-red-600/50 rounded-xl hover:bg-red-600/40 font-bold transition-all cursor-pointer flex flex-col items-center">
                            <span>Chưa hiểu</span>
                            <span className="text-xs opacity-70">{getIntervalLabel(1)}</span>
                        </button>
                        <button onClick={() => onRate(3)} className="py-3 bg-yellow-600/20 text-yellow-300 border border-yellow-600/50 rounded-xl hover:bg-yellow-600/40 font-bold transition-all cursor-pointer flex flex-col items-center">
                            <span>Tạm ổn</span>
                            <span className="text-xs opacity-70">{getIntervalLabel(3)}</span>
                        </button>
                        <button onClick={() => onRate(5)} className="py-3 bg-green-600/20 text-green-300 border border-green-600/50 rounded-xl hover:bg-green-600/40 font-bold transition-all cursor-pointer flex flex-col items-center">
                            <span>Đã hiểu rõ</span>
                            <span className="text-xs opacity-70">{getIntervalLabel(5)}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

// --- MAIN COMPONENT ---

export const LearningModal: React.FC<LearningModalProps> = ({ 
    node, onClose, onUpdateNode, onDeepDive, playlistTotal, playlistCurrent, onNextNode, onEditInNoteLab,
    parentNodeTitle 
}) => {
    // --- GAMIFICATION & RANKED CONTEXT ---
    const { isRankedMode, updateRank } = useGamification();

    // --- STATE MANAGEMENT ---
    const { interactionMode: activeMode, setInteractionMode: setActiveMode } = useAppStore();
    
    // Reset interaction mode on unmount
    useEffect(() => {
        return () => setActiveMode('none');
    }, [setActiveMode]);

    // Flatten all due items into a single queue
    const sessionQueue = useMemo<SessionItem[]>(() => {
        if (!node.data) return [];

        let queue: SessionItem[] = [];
        const now = new Date();
        const todayStart = new Date(now.setHours(0,0,0,0)).getTime();

        const checkAndAdd = (item: any, idx: number, type: SessionItemType) => {
            if (!item) return;
            // Defensive check for sm2 data, init if missing
            if (!item.sm2) {
                 item.sm2 = { repetitions: 0, interval: 0, efactor: 2.5, nextReviewDate: new Date().toISOString() };
            }

            const reviewDate = item.sm2.nextReviewDate ? new Date(item.sm2.nextReviewDate).setHours(0,0,0,0) : 0;
            const isDue = reviewDate <= todayStart;
            const isNew = item.sm2.repetitions === 0;

            if (isDue || isNew) {
                queue.push({ type, data: item, originalIndex: idx });
            }
        };

        // Support both "flashcards" (standard) and "cards" (old backend key) — defensive fallback
        const flashcardsArray = node.data.flashcards || node.data.cards || [];
        if (flashcardsArray.length > 0) flashcardsArray.forEach((item: any, idx: number) => checkAndAdd(item, idx, 'Flashcard'));
        if (node.data.quiz) node.data.quiz.forEach((item: any, idx: number) => checkAndAdd(item, idx, 'Quiz'));
        if (node.data.fillInBlanks) node.data.fillInBlanks.forEach((item: any, idx: number) => checkAndAdd(item, idx, 'Fill-in-the-blanks'));
        if (node.data.spotErrors) node.data.spotErrors.forEach((item: any, idx: number) => checkAndAdd(item, idx, 'Spot the Error'));
        if (node.data.caseStudies) node.data.caseStudies.forEach((item: any, idx: number) => checkAndAdd(item, idx, 'Case Study'));

        return queue;
    }, [node.data]); // Depend on node.data to recalculate if node updates

    const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    
    // Store quiz answers mapped by queue index
    const [quizAnswers, setQuizAnswers] = useState<{[key: number]: number}>({}); 
    const [revealedItems, setRevealedItems] = useState<{[key: number]: boolean}>({});

    // AI Grading State
    const [isAIGradingMode, setIsAIGradingMode] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');
    const [aiFeedback, setAiFeedback] = useState<{score: number, feedback: string} | null>(null);
    const [isGrading, setIsGrading] = useState(false);

    // Gamification State
    const [combo, setCombo] = useState(0);
    const [isShake, setIsShake] = useState(false);

    const currentSessionItem = sessionQueue[currentQueueIndex];

    // --- ACTIONS (Wrapped in useCallback) ---

    // Generic Update Function
    const updateItemSM2 = useCallback(async (type: SessionItemType, index: number, quality: number) => {
        if (!node.data) return;

        // Map UI type back to data keys
        let itemTypeKey = '';
        if (type === 'Flashcard') itemTypeKey = 'flashcards';
        else if (type === 'Quiz') itemTypeKey = 'quiz';
        else if (type === 'Fill-in-the-blanks') itemTypeKey = 'fillInBlanks';
        else if (type === 'Spot the Error') itemTypeKey = 'spotErrors';
        else if (type === 'Case Study') itemTypeKey = 'caseStudies';

        if (itemTypeKey) {
            // Update on Backend
            await reviewNodeItemInBackend(node.id, itemTypeKey, index, quality);
            
            // Note: Since we are using a linear queue and about to move next, 
            // we don't necessarily NEED to update the local node object immediately 
            // if we are going to close the modal and re-render the graph soon.
            // But let's update locally too to ensure session integrity if they re-visit.
            if (onUpdateNode) {
                const newData = { ...node.data };
                const arr = newData[itemTypeKey as keyof typeof newData] as any[];
                if (arr) {
                    const item = arr[index];
                    const newSM2 = calculateItemSM2(item.sm2, quality);
                    newData[itemTypeKey as keyof typeof newData] = arr.map((x, i) => i === index ? { ...x, sm2: newSM2 } : x) as any;
                    onUpdateNode({ ...node, data: newData });
                }
            }
        }

        // --- RANKED MODE LOGIC ---
        if (isRankedMode) {
            let points = 0;
            // Scoring System
            if (quality >= 4) points = 20; 
            else points = -15; 
            updateRank(points);
        }

        // --- COMBO LOGIC ---
        if (quality >= 4) {
             setCombo(prev => prev + 1);
        } else {
             setCombo(0);
             setIsShake(true);
             setTimeout(() => setIsShake(false), 500);
        }

    }, [node, onUpdateNode, isRankedMode, updateRank]);

    const handleNext = useCallback(() => {
        setIsFlipped(false);
        // Do NOT clear revealedItems immediately to allow animation if needed, but for simplicity here we keep state clean
        // Ideally we keep revealed state per index if we want to revisit, but this is a linear queue
        setUserAnswer('');
        setAiFeedback(null);
        if (currentQueueIndex < sessionQueue.length - 1) {
            setCurrentQueueIndex(prev => prev + 1);
        } else {
            // Finished session for this node
            if (onNextNode) {
                onNextNode();
            } else {
                onClose();
            }
        }
    }, [currentQueueIndex, sessionQueue.length, onNextNode, onClose]);

    const handleRating = useCallback((quality: number) => {
        if (currentSessionItem) {
            updateItemSM2(currentSessionItem.type, currentSessionItem.originalIndex, quality);
        }
        handleNext();
    }, [currentSessionItem, updateItemSM2, handleNext]);

    const handleDeepDiveClick = useCallback(() => {
        if (!currentSessionItem) return;
        const { type, data } = currentSessionItem;
        let context = `Tôi đang học chủ đề "${node.title}" (Item Type: ${type}) và cần bạn giải thích sâu hơn về phần này:\n\n`;

        if (type === 'Flashcard') {
            context += `Thuật ngữ/Câu hỏi: "${data.front}"\nĐịnh nghĩa/Đáp án: "${data.back}"`;
        } else if (type === 'Quiz') {
            context += `Câu hỏi: "${data.question}"\nCác lựa chọn: ${data.options.join(', ')}\nĐáp án đúng: ${data.options[data.correctAnswer]}`;
        } else if (type === 'Fill-in-the-blanks') {
            context += `Câu điền từ: "${data.sentence}"\nTừ cần điền: "${data.answer}"`;
        } else if (type === 'Spot the Error') {
            context += `Câu có lỗi: "${data.text}"\nLỗi sai: "${data.error}"\nSửa lại: "${data.correction}"`;
        } else if (type === 'Case Study') {
            context += `Tình huống: "${data.scenario}"\nCâu hỏi: "${data.question}"\nPhân tích: "${data.analysis}"`;
        }

        context += "\n\nHãy giải thích chi tiết hơn giúp tôi.";
        onDeepDive(context);
    }, [currentSessionItem, node.title, onDeepDive]);

    const handleSubmitForGrading = useCallback(async () => {
        if (!userAnswer.trim() || !currentSessionItem) return;
        setIsGrading(true);
        setIsFlipped(true); // Reveal the answer visually
        try {
            const result = await gradeUserAnswer(
                userAnswer, 
                currentSessionItem.data.back, 
                currentSessionItem.data.front
            );
            setAiFeedback(result);
            // Auto-apply SM-2 based on AI score
            updateItemSM2('Flashcard', currentSessionItem.originalIndex, result.score);
        } catch (e) {
            console.error(e);
            alert("Lỗi chấm điểm AI.");
        } finally {
            setIsGrading(false);
        }
    }, [userAnswer, currentSessionItem, updateItemSM2]);

    // Helper to get preview string for SM-2 buttons
    const getIntervalLabel = useCallback((quality: number) => {
        if (!currentSessionItem) return "";
        return getPredictedInterval(currentSessionItem.data.sm2, quality);
    }, [currentSessionItem]);

    // --- RENDER ---

    if (!node.data) return null;

    // Distinguish: "completed all items" vs "node has no studyable content at all"
    const hasAnyContent = !!(
        (node.data.flashcards?.length ?? 0) > 0 ||
        (node.data.cards?.length ?? 0) > 0 ||
        (node.data.quiz?.length ?? 0) > 0 ||
        (node.data.fillInBlanks?.length ?? 0) > 0 ||
        (node.data.spotErrors?.length ?? 0) > 0 ||
        (node.data.caseStudies?.length ?? 0) > 0
    );

    if (sessionQueue.length === 0) {
        // Node has no studyable content at all — show diagnostic screen
        if (!hasAnyContent) {
            return (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.3s]">
                    <div className="bg-slate-900 border border-orange-500/30 p-8 rounded-2xl max-w-md text-center shadow-2xl">
                        <span className="material-symbols-outlined text-6xl text-orange-400 mb-4">quiz</span>
                        <h3 className="text-2xl font-bold text-white mb-2">Chưa có nội dung học</h3>
                        <p className="text-slate-300 mb-2">Node này chưa có Flashcard, Quiz hoặc bài tập nào.</p>
                        <p className="text-slate-500 text-sm mb-6 font-mono break-all">
                            Kiểu nội dung: <span className="text-amber-400">{node.type}</span><br/>
                            Data keys: <span className="text-amber-400">{node.data ? Object.keys(node.data).join(', ') : 'null'}</span>
                        </p>
                        <button onClick={onClose} className="px-8 py-3 bg-slate-700 text-white rounded-full font-bold hover:bg-slate-600 transition-all cursor-pointer">
                            Quay lại Sơ đồ
                        </button>
                    </div>
                </div>
            );
        }

        // All items have been reviewed — show LEVEL CLEARED
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.3s]">
                <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-2xl max-w-md text-center shadow-2xl shadow-emerald-500/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
                    <span className="material-symbols-outlined text-6xl text-emerald-400 mb-4 animate-bounce drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]">check_circle</span>
                    <h3 className="text-2xl font-bold text-white mb-2 relative z-10">LEVEL CLEARED!</h3>
                    <p className="text-slate-300 mb-6 relative z-10">Bạn đã hoàn thành hết các bài học cần ôn tập trong chủ đề này.</p>
                    <div className="flex flex-col gap-3 relative z-10">
                        {onNextNode ? (
                            <button onClick={onNextNode} className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-500 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 hover:scale-105">
                                <span>Bài tiếp theo</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        ) : (
                            <button onClick={onClose} className="px-8 py-3 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-500 transition-all shadow-lg hover:shadow-emerald-500/40 cursor-pointer hover:scale-105">
                                Quay lại Sơ đồ
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const progressPercent = ((currentQueueIndex + 1) / (sessionQueue.length || 1)) * 100;

    return (
        <div className={`fixed inset-0 z-[150] transition-all duration-700 ${activeMode === 'none' ? 'bg-black/95 backdrop-blur-xl' : 'bg-black/40 backdrop-blur-none'} flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in font-display pointer-events-none ${isShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
            
            <div className="pointer-events-auto">
                <LearningSideToolbar activeMode={activeMode} onModeChange={setActiveMode} />
            </div>

            {/* Header / Context Bar */}
            <div className={`absolute top-0 left-0 w-full p-6 flex justify-between items-start transition-all duration-500 ${activeMode !== 'none' ? 'opacity-0 -translate-y-10' : 'opacity-100 translate-y-0 pointer-events-auto'}`}>
                <div className="flex flex-col gap-1">
                    {/* G-Learning Breadcrumb */}
                    {parentNodeTitle && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">
                            <span className="material-symbols-outlined text-[14px]">psychology</span>
                            <span>{parentNodeTitle}</span>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                        </div>
                    )}
                    <div className="flex items-center gap-4 text-white">
                        <span className="text-xl md:text-2xl font-black tracking-tight truncate max-w-[250px] md:max-w-md">{node.title}</span>
                        {node.originalAuthor && (
                            <span className="text-[10px] text-amber-500/80 font-bold italic bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                BY {node.originalAuthor.toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 pointer-events-auto">
                    {isRankedMode && (
                        <div className="hidden sm:flex px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                            <span className="material-symbols-outlined text-yellow-500 text-sm">military_tech</span>
                            <span className="text-yellow-500 font-bold text-xs uppercase tracking-widest">Ranked</span>
                        </div>
                    )}
                    
                    {onEditInNoteLab && (
                        <button 
                            onClick={() => onEditInNoteLab(node)}
                            className="p-2 bg-purple-600/20 hover:bg-purple-600 border border-purple-500/30 text-purple-300 hover:text-white rounded-full transition-all"
                            title="Chỉnh sửa Note"
                        >
                            <span className="material-symbols-outlined">edit_note</span>
                        </button>
                    )}

                    <button 
                        onClick={handleDeepDiveClick}
                        className="p-2 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-full transition-all"
                        title="Hỏi Gia sư AI"
                    >
                        <span className="material-symbols-outlined">psychology</span>
                    </button>

                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all transform hover:rotate-90">
                        <span className="material-symbols-outlined text-2xl md:text-3xl">close</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`w-full max-w-5xl flex flex-col items-center mt-12 transition-all duration-500 ${activeMode !== 'none' ? 'opacity-20 scale-90 blur-sm translate-x-32' : 'opacity-100 scale-100 pointer-events-auto'}`}>
                {/* Progress Indicators */}
                <div className="w-full mb-8 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">
                        <span>Chế độ: {currentSessionItem.type}</span>
                        <span>{currentQueueIndex + 1} / {sessionQueue.length} câu</span>
                    </div>
                    {/* RPG Experience Bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5 shadow-inner relative">
                        <div 
                            className="h-full bg-gradient-to-r from-sky-500 via-blue-500 to-purple-500 transition-all duration-700 ease-out relative" 
                            style={{ width: `${progressPercent}%` }}
                        >
                             <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                </div>

                {/* Card Viewer Frame */}
                <div className={`w-full relative bg-slate-900/40 backdrop-blur-sm rounded-[2.5rem] border flex flex-col p-4 md:p-10 shadow-3xl transition-all ${isRankedMode ? 'border-yellow-500/20 shadow-[0_20px_60px_rgba(234,179,8,0.1)]' : 'border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]'}`}>
                    
                    {/* Toggle AI Grading for Flashcards */}
                    {currentSessionItem.type === 'Flashcard' && (
                        <div className="absolute top-6 right-10 z-20">
                            <button 
                                onClick={() => setIsAIGradingMode(!isAIGradingMode)}
                                className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider transition-all ${isAIGradingMode ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-black/20 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                            >
                                <span className="material-symbols-outlined text-[12px]">{isAIGradingMode ? 'bolt' : 'smart_toy'}</span>
                                {isAIGradingMode ? "AI GRADING: ON" : "AI GRADING: OFF"}
                            </button>
                        </div>
                    )}

                    {/* Content Component Rendering */}
                    <div className="w-full h-full min-h-[400px] flex flex-col">
                        {currentSessionItem.type === 'Flashcard' && (
                            <FlashcardView 
                                data={currentSessionItem.data}
                                isFlipped={isFlipped}
                                onFlip={() => setIsFlipped(!isFlipped)}
                                isAIGradingMode={isAIGradingMode}
                                userAnswer={userAnswer}
                                onUserAnswerChange={setUserAnswer}
                                onSubmitGrading={handleSubmitForGrading}
                                aiFeedback={aiFeedback}
                                isGrading={isGrading}
                                onNext={handleNext}
                                onRate={handleRating}
                                getIntervalLabel={getIntervalLabel}
                                isRankedMode={isRankedMode}
                                combo={combo}
                                isShake={isShake}
                            />
                        )}

                        {currentSessionItem.type === 'Quiz' && (
                            <QuizView 
                                data={currentSessionItem.data}
                                selectedOption={quizAnswers[currentQueueIndex]}
                                isRevealed={revealedItems[currentQueueIndex]}
                                onSelectOption={(idx: number) => setQuizAnswers(prev => ({ ...prev, [currentQueueIndex]: idx }))}
                                onCheck={() => {
                                    const isCorrect = quizAnswers[currentQueueIndex] === currentSessionItem.data.correctAnswer;
                                    const quality = isCorrect ? 5 : 1; 
                                    setRevealedItems(prev => ({...prev, [currentQueueIndex]: true}));
                                    updateItemSM2('Quiz', currentSessionItem.originalIndex, quality);
                                    if(isCorrect) setCombo(prev => prev + 1); else setCombo(0);
                                }}
                                onNext={handleNext}
                                isRankedMode={isRankedMode}
                            />
                        )}

                        {['Fill-in-the-blanks', 'Spot the Error', 'Case Study'].includes(currentSessionItem.type) && (
                            <OtherTypesView 
                                type={currentSessionItem.type}
                                data={currentSessionItem.data}
                                isRevealed={revealedItems[currentQueueIndex]}
                                onReveal={() => setRevealedItems(prev => ({...prev, [currentQueueIndex]: true}))}
                                onNext={handleNext}
                                onRate={handleRating}
                                getIntervalLabel={getIntervalLabel}
                            />
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .perspective-\[1000px\] { perspective: 1000px; }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export default React.memo(LearningModal);
