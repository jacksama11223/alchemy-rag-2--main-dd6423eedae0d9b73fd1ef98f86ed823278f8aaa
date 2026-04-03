
import React, { useState } from 'react';

// ----------------------------------------------------------------------
// 16. VectorSearchPanel: Semantic Search with AI
// ----------------------------------------------------------------------

export const VectorSearchPanel: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    const handleSearch = () => {
        if (!query) return;
        setIsSearching(true);
        // Simulate Vector DB Search
        setTimeout(() => {
            setResults([
                { id: 1, title: 'Concept: Neural Networks', similarity: 0.98, type: 'node' },
                { id: 2, title: 'Note: Deep Learning Basics', similarity: 0.92, type: 'note' },
                { id: 3, title: 'Image: Perceptron Model', similarity: 0.85, type: 'image' },
            ]);
            setIsSearching(false);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] bg-[#0f172a]/95 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-0 z-50 shadow-[0_0_40px_rgba(6,182,212,0.2)] animate-slide-down overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-cyan-500/20 bg-cyan-900/10 flex items-center gap-3">
                <span className="material-symbols-outlined text-cyan-400 text-2xl animate-pulse">psychology</span>
                <input 
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-cyan-500/50 font-medium text-lg" 
                    placeholder="Tìm kiếm theo ý nghĩa (VD: 'động vật bốn chân')..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    autoFocus
                />
                {isSearching ? (
                    <span className="material-symbols-outlined text-cyan-500 animate-spin">sync</span>
                ) : (
                    <button onClick={handleSearch} className="text-cyan-400 hover:text-white"><span className="material-symbols-outlined">search</span></button>
                )}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-2">
                {results.length === 0 && !isSearching && (
                    <div className="p-8 text-center text-slate-500 text-sm italic">
                        Nhập từ khóa để tìm các khái niệm có liên quan về mặt ngữ nghĩa.
                    </div>
                )}
                {results.map(res => (
                    <div key={res.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl cursor-pointer group transition-all duration-200 border border-transparent hover:border-cyan-500/30">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${res.type === 'node' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                <span className="material-symbols-outlined text-lg">{res.type === 'node' ? 'hub' : res.type === 'note' ? 'description' : 'image'}</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">{res.title}</h4>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{res.type}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: `${res.similarity * 100}%` }}></div>
                            </div>
                            <span className="text-xs font-mono text-emerald-400 font-bold">{Math.round(res.similarity * 100)}%</span>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Footer */}
            <div className="bg-[#020617]/50 p-2 text-center border-t border-white/5">
                <span className="text-[10px] text-slate-500">Powered by Vector Embeddings</span>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 17. SynonymSuggester: Contextual AI Helper
// ----------------------------------------------------------------------

export const SynonymSuggester: React.FC<{ word: string, visible: boolean }> = ({ word, visible }) => {
    if (!visible) return null;
    
    // Mock suggestions based on 'word'
    const suggestions = ['Concept', 'Idea', 'Notion', 'Abstract'];

    return (
        <div className="absolute z-50 bg-[#1e1e1e] border border-purple-500/50 p-3 rounded-xl shadow-xl -mt-16 ml-4 animate-scale-in origin-bottom-left">
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-purple-300 uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">auto_fix</span> Gợi ý cho "{word}"
                </p>
            </div>
            <div className="flex gap-2 flex-wrap max-w-[200px]">
                {suggestions.map(s => (
                    <button key={s} className="px-2 py-1 bg-white/10 hover:bg-purple-600 text-slate-300 hover:text-white rounded-lg text-[10px] transition-colors border border-white/5">
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 18. DeadLinkDetector: Graph Health Check
// ----------------------------------------------------------------------

export const DeadLinkDetector: React.FC = () => {
    const [issues, setIssues] = useState(3);

    if (issues === 0) return null;

    return (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 -translate-y-16 z-30 cursor-pointer group">
            <div className="bg-red-900/90 text-red-100 px-4 py-2 rounded-full border border-red-500 flex items-center gap-2 text-xs shadow-lg shadow-red-900/50 animate-pulse hover:animate-none transition-all hover:scale-105">
                <span className="material-symbols-outlined text-base">link_off</span>
                <span className="font-bold">Phát hiện {issues} liên kết hỏng</span>
            </div>
            
            {/* Hover Detail */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#1e1e1e] rounded-xl border border-red-500/30 p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="text-[10px] text-slate-400 mb-1">Click để tự động sửa chữa hoặc xóa các liên kết không hợp lệ.</div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 19. SentimentColorizer: Visualization Filter
// ----------------------------------------------------------------------

export const SentimentColorizer: React.FC<{ active: boolean, onToggle: () => void }> = ({ active, onToggle }) => (
    <button 
        onClick={onToggle}
        className={`p-2 rounded-full border transition-all shadow-lg ${
            active 
            ? 'bg-pink-600 border-pink-400 text-white shadow-pink-500/50 scale-110' 
            : 'bg-[#1e1e1e] text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
        }`}
        title="Tô màu theo cảm xúc (Sentiment Analysis)"
    >
        <span className="material-symbols-outlined text-lg">mood</span>
    </button>
);

// ----------------------------------------------------------------------
// 20. PathwaySimulator: Flow Analysis
// ----------------------------------------------------------------------

export const PathwaySimulator: React.FC = () => {
    const [simulating, setSimulating] = useState(false);

    return (
        <div className="absolute bottom-24 right-20 z-30">
            <button 
                onClick={() => setSimulating(!simulating)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border transition-all hover:scale-105 active:scale-95 ${
                    simulating 
                    ? 'bg-green-600 border-green-400 text-white shadow-green-500/30' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white border border-white/20'
                }`}
            >
                <span className={`material-symbols-outlined text-sm ${simulating ? 'animate-spin' : ''}`}>
                    {simulating ? 'sync' : 'play_circle'}
                </span>
                <span className="text-xs font-bold">{simulating ? 'Simulating Flow...' : 'Simulate User Flow'}</span>
            </button>
        </div>
    );
};
