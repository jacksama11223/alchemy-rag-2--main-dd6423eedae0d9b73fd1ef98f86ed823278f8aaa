
import React, { useState, useEffect } from 'react';
import { SavedLearningPath, PathLevel } from '../../types';
import { PathNodeActivity } from './PathNodeActivity';

interface GraphLearningPathProps {
    isOpen: boolean;
    onClose: () => void;
    pathData: { title: string, levels: PathLevel[] } | null;
    onStartLevel?: (level: PathLevel) => void; // Optional now as handled internally
    isLoading: boolean;
}

export const GraphLearningPath: React.FC<GraphLearningPathProps> = ({ 
    isOpen, onClose, pathData, isLoading 
}) => {
    // State for managing the active path locally to allow updates
    const [activePath, setActivePath] = useState<{ title: string, levels: PathLevel[] } | null>(null);
    const [savedPaths, setSavedPaths] = useState<SavedLearningPath[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<PathLevel | null>(null);
    const [showSavedList, setShowSavedList] = useState(false);

    // Sync prop data to local state when it arrives
    useEffect(() => {
        if (pathData) {
            setActivePath(pathData);
        }
    }, [pathData]);

    // Load saved paths from local storage
    useEffect(() => {
        const stored = localStorage.getItem('learnai_saved_paths');
        if (stored) {
            setSavedPaths(JSON.parse(stored));
        }
    }, []);

    const handleSavePath = () => {
        if (!activePath) return;
        const newPath: SavedLearningPath = {
            id: Date.now().toString(),
            title: activePath.title,
            createdAt: new Date().toLocaleDateString(),
            levels: activePath.levels,
            progress: 0
        };
        const updatedPaths = [newPath, ...savedPaths];
        setSavedPaths(updatedPaths);
        localStorage.setItem('learnai_saved_paths', JSON.stringify(updatedPaths));
        alert("Đã lưu lộ trình vào thư viện cá nhân!");
    };

    const handleLoadPath = (path: SavedLearningPath) => {
        setActivePath({ title: path.title, levels: path.levels });
        setShowSavedList(false);
    };

    const handleLevelUpdate = (updatedLevel: PathLevel) => {
        if (!activePath) return;
        const newLevels = activePath.levels.map(l => l.id === updatedLevel.id ? updatedLevel : l);
        const newPath = { ...activePath, levels: newLevels };
        setActivePath(newPath);
        
        // Also update if this path is saved
        // Find if current path matches a saved ID? (Simplified: just update state for now)
        // Ideally we track ID. For now let's assume we are working on `activePath`.
    };

    const handleUnlockNext = (currentLevelId: string) => {
        if (!activePath) return;
        const idx = activePath.levels.findIndex(l => l.id === currentLevelId);
        if (idx >= 0 && idx < activePath.levels.length - 1) {
            const nextLevel = activePath.levels[idx + 1];
            if (nextLevel.status === 'locked') {
                const updatedNext = { ...nextLevel, status: 'unlocked' as const };
                const newLevels = [...activePath.levels];
                newLevels[idx + 1] = updatedNext;
                setActivePath({ ...activePath, levels: newLevels });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/95 backdrop-blur-xl animate-fade-in p-4 overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#1e293b_1px,_transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center py-6 px-4 shrink-0 bg-[#0f172a]/80 rounded-b-2xl border-b border-white/10 mb-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowSavedList(!showSavedList)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-wider text-shadow-glow">
                                {activePath?.title || "Đang khởi tạo..."}
                            </h2>
                            <p className="text-sm text-slate-400 font-medium">Lộ trình thích ứng AI</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSavePath} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">save</span> Lưu lộ trình
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden gap-4">
                    {/* Saved Paths Sidebar */}
                    {showSavedList && (
                        <div className="w-64 bg-[#1e293b] border border-white/10 rounded-xl p-4 flex flex-col animate-slide-right">
                            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Lộ trình đã lưu</h3>
                            <div className="flex-1 overflow-y-auto space-y-2">
                                {savedPaths.length === 0 && <p className="text-slate-500 text-xs italic">Chưa có bản lưu nào.</p>}
                                {savedPaths.map(path => (
                                    <div 
                                        key={path.id} 
                                        onClick={() => handleLoadPath(path)}
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer border border-transparent hover:border-cyan-500/30 transition-all"
                                    >
                                        <div className="font-bold text-slate-200 text-sm truncate">{path.title}</div>
                                        <div className="text-[10px] text-slate-500">{path.createdAt} • {path.levels.length} levels</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Main Path View */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide relative pb-20 bg-black/20 rounded-xl border border-white/5">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-6">
                                <div className="relative w-24 h-24">
                                    <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
                                    <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                                    <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl text-cyan-400 animate-pulse">psychology</span>
                                </div>
                                <p className="text-cyan-300 font-bold animate-pulse text-center px-8">
                                    AI đang phân tích điểm yếu và kiến tạo lộ trình tối ưu cho bạn...
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-10 space-y-8 relative">
                                {/* Connecting Line */}
                                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
                                    <path 
                                        d={`M ${activePath?.levels.map((_, i) => {
                                            const x = 50 + (i % 2 === 0 ? 0 : (i % 4 === 1 ? 20 : -20)); // Zigzag
                                            const y = 60 + i * 160; // Adjusted spacing
                                            return `${i===0?'M':'L'} ${x}% ${y}`;
                                        }).join(' ')}`}
                                        stroke="#334155" 
                                        strokeWidth="8" 
                                        fill="none" 
                                        strokeLinecap="round"
                                    />
                                    <path 
                                        d={`M ${activePath?.levels.map((_, i) => {
                                            const x = 50 + (i % 2 === 0 ? 0 : (i % 4 === 1 ? 20 : -20)); 
                                            const y = 60 + i * 160;
                                            return `${i===0?'M':'L'} ${x}% ${y}`;
                                        }).join(' ')}`}
                                        stroke="#22d3ee" 
                                        strokeWidth="4" 
                                        fill="none" 
                                        strokeLinecap="round"
                                        strokeDasharray="10, 10"
                                        className="animate-[stream_20s_linear_infinite]"
                                    />
                                </svg>

                                {activePath?.levels.map((level, index) => {
                                    const offset = index % 2 === 0 ? 0 : (index % 4 === 1 ? 20 : -20);
                                    const isLocked = level.status === 'locked';
                                    const isCompleted = level.status === 'completed';
                                    const isLearningPassed = level.status === 'learning_passed';
                                    
                                    return (
                                        <div 
                                            key={level.id}
                                            className="relative z-10 flex flex-col items-center"
                                            style={{ transform: `translateX(${offset}%)` }}
                                        >
                                            <button
                                                onClick={() => !isLocked && setSelectedLevel(level)}
                                                disabled={isLocked}
                                                className={`w-24 h-24 rounded-full flex items-center justify-center border-b-8 transition-all transform active:translate-y-2 active:border-b-0 group relative ${
                                                    isCompleted 
                                                    ? 'bg-yellow-400 border-yellow-600 text-yellow-900 shadow-[0_0_20px_gold]' 
                                                    : isLearningPassed
                                                    ? 'bg-purple-500 border-purple-700 text-white animate-pulse'
                                                    : isLocked 
                                                    ? 'bg-slate-700 border-slate-800 text-slate-500 cursor-not-allowed'
                                                    : 'bg-cyan-500 border-cyan-700 text-white hover:bg-cyan-400 animate-bounce-subtle shadow-[0_0_30px_rgba(6,182,212,0.6)]'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-4xl font-bold">
                                                    {isCompleted ? 'emoji_events' : isLearningPassed ? 'quiz' : isLocked ? 'lock' : 'school'}
                                                </span>
                                                
                                                {/* Stars for completed */}
                                                {isCompleted && (
                                                    <div className="absolute -top-4 flex gap-1">
                                                        {[1,2,3].map(s => (
                                                            <span key={s} className="material-symbols-outlined text-yellow-300 text-sm drop-shadow-md filled">star</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </button>
                                            
                                            <div className={`mt-3 px-4 py-2 bg-[#1e293b] border ${isLocked ? 'border-slate-700' : isCompleted ? 'border-yellow-500' : 'border-cyan-500/50'} rounded-xl text-center max-w-[180px] shadow-lg relative`}>
                                                <h4 className={`text-sm font-bold ${isLocked ? 'text-slate-500' : 'text-white'}`}>{level.title}</h4>
                                                {!isLocked && <p className="text-[10px] text-slate-400 leading-tight mt-1 line-clamp-2">{level.description}</p>}
                                                {isLearningPassed && !isCompleted && (
                                                    <div className="absolute -right-2 -top-2 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {/* Final Trophy */}
                                <div className="relative z-10 pt-10 pb-20">
                                    <img 
                                        src="https://cdn-icons-png.flaticon.com/512/5900/5900538.png" 
                                        alt="Goal" 
                                        className="w-32 h-32 drop-shadow-[0_0_30px_gold] grayscale opacity-50"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Node Activity Modal */}
            {selectedLevel && (
                <PathNodeActivity 
                    level={selectedLevel}
                    onClose={() => setSelectedLevel(null)}
                    onUpdateLevel={handleLevelUpdate}
                    onCompleteLevel={() => handleUnlockNext(selectedLevel.id)}
                />
            )}
        </div>
    );
};
