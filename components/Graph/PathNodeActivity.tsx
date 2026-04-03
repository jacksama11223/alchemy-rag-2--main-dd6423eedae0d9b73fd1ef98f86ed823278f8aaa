
import React, { useState } from 'react';
import { PathLevel, FlashcardItem, QuizItem } from '../../types';
import { generateLevelContent } from '../../services/geminiService';
import { calculateItemSM2 } from '../../services/sm2Service';

interface PathNodeActivityProps {
    level: PathLevel;
    onClose: () => void;
    onUpdateLevel: (updatedLevel: PathLevel) => void;
    onCompleteLevel: () => void; // Triggered when quiz passed > 50%
}

type ActivityTab = 'LEARN' | 'TEST';
type Difficulty = 'Easy' | 'Medium' | 'Hard';

export const PathNodeActivity: React.FC<PathNodeActivityProps> = ({ level, onClose, onUpdateLevel, onCompleteLevel }) => {
    const [activeTab, setActiveTab] = useState<ActivityTab>('LEARN');
    const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Learning State
    const [flashcardIndex, setFlashcardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [learnScore, setLearnScore] = useState(0); // Count correct self-ratings
    
    // Quiz State
    const [quizAnswers, setQuizAnswers] = useState<{[key: number]: number}>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizScore, setQuizScore] = useState(0);

    const handleGenerateContent = async (type: 'Flashcard' | 'Quiz') => {
        setIsGenerating(true);
        try {
            const result = await generateLevelContent(level.title, level.description, type, difficulty);
            
            const updatedLevel = { ...level };
            if (type === 'Flashcard') {
                updatedLevel.learningContent = result.flashcards;
                // Reset learning state
                setFlashcardIndex(0);
                setIsFlipped(false);
                setLearnScore(0);
            } else {
                updatedLevel.quizContent = result.quiz;
                // Reset quiz state
                setQuizAnswers({});
                setQuizSubmitted(false);
                setQuizScore(0);
            }
            onUpdateLevel(updatedLevel);
        } catch (e) {
            console.error(e);
            alert("Lỗi tạo nội dung. Vui lòng thử lại.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRateFlashcard = (quality: number) => {
        if (!level.learningContent) return;
        
        if (quality >= 4) setLearnScore(prev => prev + 1);

        // Move to next
        setIsFlipped(false);
        if (flashcardIndex < level.learningContent.length - 1) {
            setFlashcardIndex(prev => prev + 1);
        } else {
            // Finished session
            const passRate = ((learnScore + (quality >=4 ? 1 : 0)) / level.learningContent.length) * 100;
            if (passRate >= 50) {
                const updatedLevel = { ...level, status: 'learning_passed' as const };
                onUpdateLevel(updatedLevel);
                alert(`Bạn đã hoàn thành phần học! Tỷ lệ nhớ: ${Math.round(passRate)}%. Hãy chuyển sang phần Kiểm tra.`);
                setActiveTab('TEST');
            } else {
                alert(`Tỷ lệ nhớ ${Math.round(passRate)}% chưa đạt 50%. Hãy ôn lại!`);
                setFlashcardIndex(0);
                setLearnScore(0);
            }
        }
    };

    const submitQuiz = () => {
        if (!level.quizContent) return;
        let correctCount = 0;
        level.quizContent.forEach((q, idx) => {
            if (quizAnswers[idx] === q.correctAnswer) correctCount++;
        });
        
        const scorePercent = (correctCount / level.quizContent.length) * 100;
        setQuizScore(scorePercent);
        setQuizSubmitted(true);

        if (scorePercent >= 50) {
            // Unlock next level logic is handled by parent via onCompleteLevel
            // But we update status here first
            onUpdateLevel({ ...level, status: 'completed' });
            setTimeout(() => {
                alert(`Chúc mừng! Bạn đạt ${scorePercent}%. Level tiếp theo đã mở khóa.`);
                onCompleteLevel();
                onClose();
            }, 1000);
        } else {
            alert(`Bạn đạt ${scorePercent}%. Cần >50% để qua màn. Hãy thử lại hoặc tạo đề mới dễ hơn.`);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in font-display">
            <div className="bg-[#0f172a] w-full max-w-4xl h-[90vh] rounded-2xl border border-cyan-500/30 shadow-2xl flex flex-col overflow-hidden relative">
                
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#162032]">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{level.title}</h2>
                        <p className="text-slate-400 text-sm">{level.description}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 bg-[#0f172a]">
                    <button 
                        onClick={() => setActiveTab('LEARN')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'LEARN' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <span className="material-symbols-outlined">school</span> Học Bài (Flashcard)
                    </button>
                    <button 
                        onClick={() => setActiveTab('TEST')}
                        disabled={level.status === 'unlocked' && !level.learningContent} // Enforce learning first? Optional.
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'TEST' ? 'text-purple-400 border-b-2 border-purple-400 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <span className="material-symbols-outlined">quiz</span> Kiểm Tra (Test)
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
                    
                    {/* Controls Row */}
                    <div className="flex justify-end items-center gap-3 mb-6">
                        <span className="text-xs text-slate-400 uppercase font-bold">Độ khó AI:</span>
                        <div className="flex bg-black/40 rounded-lg p-1">
                            {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className={`px-3 py-1 text-xs rounded-md transition-colors ${difficulty === d ? 'bg-white/20 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => handleGenerateContent(activeTab === 'LEARN' ? 'Flashcard' : 'Quiz')}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                        >
                            <span className={`material-symbols-outlined text-sm ${isGenerating ? 'animate-spin' : ''}`}>
                                {isGenerating ? 'sync' : 'auto_awesome'}
                            </span>
                            {isGenerating ? 'Đang tạo...' : `Tạo nội dung ${difficulty}`}
                        </button>
                    </div>

                    {/* LEARN TAB */}
                    {activeTab === 'LEARN' && (
                        <div className="h-full flex flex-col items-center justify-center">
                            {!level.learningContent || level.learningContent.length === 0 ? (
                                <div className="text-center text-slate-500">
                                    <span className="material-symbols-outlined text-6xl opacity-20 mb-4">style</span>
                                    <p>Chưa có flashcard. Hãy chọn độ khó và bấm "Tạo nội dung".</p>
                                </div>
                            ) : (
                                <div className="w-full max-w-2xl flex flex-col gap-6">
                                    <div className="flex justify-between text-slate-400 text-xs uppercase font-bold">
                                        <span>Tiến độ: {flashcardIndex + 1} / {level.learningContent.length}</span>
                                        <span>Đúng: {learnScore}</span>
                                    </div>
                                    
                                    {/* Flashcard Component */}
                                    <div 
                                        onClick={() => setIsFlipped(!isFlipped)}
                                        className="aspect-[3/2] w-full perspective-[1000px] cursor-pointer group"
                                    >
                                        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                                            <div className="absolute inset-0 backface-hidden bg-white/10 border border-white/20 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-2xl">
                                                <span className="text-cyan-400 text-xs uppercase tracking-widest mb-4">Câu hỏi</span>
                                                <h3 className="text-2xl font-bold text-white">{level.learningContent[flashcardIndex].front}</h3>
                                                <p className="text-slate-500 text-xs mt-8 animate-pulse">Click để lật</p>
                                            </div>
                                            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-900/40 border border-indigo-500/50 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-2xl">
                                                <span className="text-indigo-400 text-xs uppercase tracking-widest mb-4">Đáp án</span>
                                                <p className="text-xl font-medium text-indigo-100">{level.learningContent[flashcardIndex].back}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rating Buttons */}
                                    {isFlipped && (
                                        <div className="grid grid-cols-2 gap-4 animate-slide-up">
                                            <button onClick={() => handleRateFlashcard(1)} className="py-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-xl font-bold hover:bg-red-500/40">Chưa thuộc</button>
                                            <button onClick={() => handleRateFlashcard(5)} className="py-3 bg-green-500/20 border border-green-500/50 text-green-300 rounded-xl font-bold hover:bg-green-500/40">Đã thuộc</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TEST TAB */}
                    {activeTab === 'TEST' && (
                         <div className="h-full">
                            {!level.quizContent || level.quizContent.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                                    <span className="material-symbols-outlined text-6xl opacity-20 mb-4">quiz</span>
                                    <p>Chưa có bài kiểm tra. Hãy chọn độ khó và bấm "Tạo nội dung".</p>
                                </div>
                            ) : (
                                <div className="max-w-3xl mx-auto space-y-6 pb-20">
                                    {level.quizContent.map((q, idx) => {
                                        const isSelected = quizAnswers[idx] !== undefined;
                                        return (
                                            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-6">
                                                <h4 className="text-white font-bold mb-4 flex gap-2">
                                                    <span className="text-purple-400">Q{idx+1}.</span> {q.question}
                                                </h4>
                                                <div className="space-y-2">
                                                    {q.options.map((opt: any, optIdx: number) => {
                                                        let btnClass = "bg-black/20 border-white/10 text-slate-300 hover:bg-white/10";
                                                        if (quizSubmitted) {
                                                            if (optIdx === q.correctAnswer) btnClass = "bg-green-500/20 border-green-500 text-green-300";
                                                            else if (quizAnswers[idx] === optIdx) btnClass = "bg-red-500/20 border-red-500 text-red-300";
                                                        } else if (quizAnswers[idx] === optIdx) {
                                                            btnClass = "bg-purple-500/20 border-purple-500 text-purple-300";
                                                        }
                                                        
                                                        return (
                                                            <button 
                                                                key={optIdx}
                                                                onClick={() => !quizSubmitted && setQuizAnswers(prev => ({...prev, [idx]: optIdx}))}
                                                                className={`w-full text-left p-3 rounded-lg border transition-colors ${btnClass}`}
                                                            >
                                                                {opt}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                                {quizSubmitted && (
                                                    <div className="mt-3 text-sm text-slate-400 bg-black/20 p-2 rounded">
                                                        <span className="font-bold text-purple-400">Giải thích:</span> {q.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                    
                                    {!quizSubmitted && (
                                        <button 
                                            onClick={submitQuiz}
                                            disabled={Object.keys(quizAnswers).length < level.quizContent.length}
                                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform"
                                        >
                                            Nộp Bài & Chấm Điểm
                                        </button>
                                    )}
                                    {quizSubmitted && (
                                        <div className="text-center p-4 bg-white/10 rounded-xl border border-white/20">
                                            <p className="text-xl font-bold text-white mb-2">Kết quả: {quizScore}%</p>
                                            {quizScore < 50 && <button onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }} className="text-cyan-400 hover:underline">Làm lại</button>}
                                        </div>
                                    )}
                                </div>
                            )}
                         </div>
                    )}

                </div>
            </div>
        </div>
    );
};
