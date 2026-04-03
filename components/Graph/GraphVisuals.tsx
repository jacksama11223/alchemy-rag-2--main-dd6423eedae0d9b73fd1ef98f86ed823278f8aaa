
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { KnowledgeNode } from '../../types';

const getAI = () => {
    const customKey = localStorage.getItem('custom_gemini_api_key');
    return new GoogleGenAI({ apiKey: customKey || process.env.API_KEY || '' });
};

// 6. LinkStyleEditor
export const LinkStyleEditor: React.FC<{ isOpen?: boolean }> = ({ isOpen = true }) => {
    if (!isOpen) return null;
    return (
        <div className="w-full space-y-4 animate-fade-in">
            <div className="space-y-1">
                <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
                    <span>Độ dày</span>
                    <span className="text-slate-500">2px</span>
                </div>
                <input type="range" className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
            </div>
            
            <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
                <button className="flex-1 py-1.5 rounded text-xs font-bold text-white bg-white/10 shadow-sm transition-all">Solid</button>
                <button className="flex-1 py-1.5 rounded text-xs font-medium text-slate-500 hover:text-slate-300 transition-all">Dashed</button>
                <button className="flex-1 py-1.5 rounded text-xs font-medium text-slate-500 hover:text-slate-300 transition-all">Dotted</button>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                </div>
                <span className="text-xs text-slate-300 group-hover:text-white transition-colors">Animation Flow</span>
            </label>
        </div>
    );
};

// 7. ConditionalFormattingRules
export const ConditionalFormattingRules: React.FC<{ isOpen?: boolean }> = ({ isOpen = true }) => {
    if (!isOpen) return null;
    return (
        <div className="w-full space-y-3 animate-fade-in relative">
            <div className="bg-black/30 p-3 rounded-lg border border-white/10 relative group hover:border-cyan-500/30 transition-colors">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-slate-500 hover:text-red-400"><span className="material-symbols-outlined text-sm">delete</span></button>
                </div>
                <div className="flex gap-2 mb-2 items-center">
                    <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">IF</span>
                    <span className="text-xs text-slate-300 font-mono">Title contains "React"</span>
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-black bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">THEN</span>
                    <span className="text-xs text-slate-300 flex items-center gap-1">
                        Color = <span className="w-3 h-3 rounded-full bg-[#61DAFB] inline-block border border-white/20"></span> #61DAFB
                    </span>
                </div>
                
                {/* Popover Simulation */}
                 <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#1e1e1e] border border-white/20 rounded-xl p-4 shadow-2xl z-50 animate-scale-in origin-top hidden group-hover:block pointer-events-none group-hover:pointer-events-auto">
                    <h5 className="text-xs font-bold text-white uppercase mb-3 border-b border-white/10 pb-2">Định dạng có điều kiện</h5>
                    <div className="space-y-2">
                        <div className="text-xs text-slate-400">Nếu:</div>
                        <select className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none">
                            <option>Title contains</option>
                            <option>Tag equals</option>
                        </select>
                        <input className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none" placeholder="Value..." defaultValue="React" />
                        <div className="text-xs text-slate-400 mt-2">Thì:</div>
                        <div className="flex gap-2 items-center">
                            <span className="text-xs text-white">Color:</span>
                            <div className="w-4 h-4 rounded-full bg-[#61DAFB] border border-white cursor-pointer hover:scale-110 transition-transform"></div>
                        </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/10 text-center">
                         <button className="text-[10px] text-slate-400 hover:text-white">+ Thêm quy tắc</button>
                    </div>
                </div>
            </div>

            <button className="w-full py-2 bg-white/5 border border-dashed border-white/10 rounded-lg text-slate-400 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-xs font-bold">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Thêm quy tắc mới
            </button>
        </div>
    );
};

// 8. DepthOfFieldLens (Enhanced for Focus Mode)
export const DepthOfFieldLens: React.FC<{ active: boolean }> = ({ active }) => (
    active ? (
        <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-500 ease-in-out">
            {/* Darkens the peripheral area significantly to highlight center */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_100px,rgba(0,0,0,0.85)_400px)]"></div>
            {/* Adds a subtle blur to the background */}
            <div className="absolute inset-0 backdrop-blur-[2px] mask-radial"></div>
        </div>
    ) : null
);

// 9. CustomFontLoader
export const CustomFontLoader: React.FC = () => (
    <div className="w-full">
        <select className="w-full bg-black/30 border border-white/10 text-xs text-white rounded-lg px-3 py-2 outline-none focus:border-cyan-500 transition-colors cursor-pointer appearance-none">
            <option>System Font (Default)</option>
            <option>Handwritten (Kalam)</option>
            <option>Monospace (JetBrains Mono)</option>
            <option>Serif (Merriweather)</option>
        </select>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Size</span>
            <span className="text-white">16px</span>
        </div>
        <input type="range" className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white mt-1" />
    </div>
);

// 10. ParticleEffectLayer
export const ParticleEffectLayer: React.FC = () => (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 left-10 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
    </div>
);

// 11. CodeLearningStudio (NEW)
interface CodeLesson {
    topic: string;
    theory: string;
    question: string;
    starterCode: string;
    expectedOutput: string;
    language: string;
}

export const CodeLearningStudio: React.FC<{ userNodes: KnowledgeNode[] }> = ({ userNodes }) => {
    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
    const [isGenerating, setIsGenerating] = useState(false);
    const [lesson, setLesson] = useState<CodeLesson | null>(null);
    const [userCode, setUserCode] = useState("");
    const [userOutput, setUserOutput] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [filterQuery, setFilterQuery] = useState("");

    // Allow selecting any node, filter by search
    const displayedNodes = userNodes.filter(n => 
        n.title.toLowerCase().includes(filterQuery.toLowerCase())
    );

    const toggleNode = (id: string) => {
        const next = new Set(selectedNodeIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedNodeIds(next);
    };

    const handleGenerate = async () => {
        if (selectedNodeIds.size === 0) {
            alert("Vui lòng chọn ít nhất một node (chủ đề) để tạo bài học!");
            return;
        }

        setIsGenerating(true);
        setUserOutput(""); // Reset output
        
        const selectedTitles = userNodes.filter(n => selectedNodeIds.has(n.id)).map(n => n.title).join(", ");

        try {
            const ai = getAI();
            const prompt = `
                Create a coding lesson and challenge based on these topics: ${selectedTitles}.
                Target Language: ${language}.
                Context: The user wants to learn programming concepts using these topics as context/examples.
                
                Return JSON format:
                {
                    "topic": "Lesson Title based on selected nodes",
                    "theory": "Short explanation of the concept (2-3 sentences)",
                    "question": "Specific coding task instructions",
                    "starterCode": "Initial code snippet for the user to start with",
                    "expectedOutput": "The exact string output expected from the correct code",
                    "language": "${language}"
                }
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });

            if (response.text) {
                const data = JSON.parse(response.text);
                setLesson(data);
                setUserCode(data.starterCode);
            }
        } catch (e) {
            console.error(e);
            alert("Lỗi tạo bài học. Vui lòng thử lại.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRunCode = () => {
        if (!lesson) return;
        setUserOutput("Running...");

        // Simulate execution delay
        setTimeout(() => {
            if (language === 'javascript') {
                try {
                    let logs: string[] = [];
                    const mockConsole = {
                        log: (...args: any[]) => logs.push(args.join(' '))
                    };
                    
                    // Safe-ish execution
                    const func = new Function('console', userCode);
                    func(mockConsole);
                    
                    const result = logs.join('\n');
                    setUserOutput(result || "Code executed (No output)");
                } catch (err: any) {
                    setUserOutput(`Error: ${err.message}`);
                }
            } else {
                // Mock for other languages
                if (userCode.includes('print') || userCode.includes('cout') || userCode.includes('System.out')) {
                    setUserOutput(lesson.expectedOutput); // Assume success for demo if they type print
                } else {
                    setUserOutput("Simulation: Syntax Error or No Output command found.");
                }
            }
        }, 500);
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden relative group">
            {/* Header / Selection Area */}
            <div className="p-4 border-b border-white/10 bg-[#162032] flex flex-col gap-3 shrink-0">
                <div className="flex justify-between items-start">
                    <h4 className="text-white font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-400">terminal</span>
                        AI Coding Studio
                    </h4>
                    <div className="flex items-center gap-2">
                        <select 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-black/30 border border-white/20 rounded px-2 py-1 text-xs text-white outline-none"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                        </select>
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating || selectedNodeIds.size === 0}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? <span className="material-symbols-outlined text-sm animate-spin">sync</span> : <span className="material-symbols-outlined text-sm">auto_awesome</span>}
                            {lesson ? "Tạo bài khác" : "Tạo bài học"}
                        </button>
                    </div>
                </div>

                {!lesson && (
                    <div className="flex flex-col gap-2">
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm node để thêm..." 
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-green-500/50 placeholder-slate-500"
                        />
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar content-start">
                            {displayedNodes.length === 0 && <span className="text-xs text-slate-500 italic p-2">Không tìm thấy node phù hợp.</span>}
                            {displayedNodes.map(node => (
                                <button
                                    key={node.id}
                                    onClick={() => toggleNode(node.id)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-all truncate max-w-[150px] ${
                                        selectedNodeIds.has(node.id)
                                        ? 'bg-green-600/30 text-green-300 border-green-500'
                                        : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30'
                                    }`}
                                    title={node.title}
                                >
                                    {node.title}
                                </button>
                            ))}
                        </div>
                        {selectedNodeIds.size > 0 && (
                            <div className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Đã chọn {selectedNodeIds.size} chủ đề
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-[#1e1e1e]">
                {lesson ? (
                    <>
                        {/* Theory Top Panel */}
                        <div className="bg-[#2d3748] p-4 border-b border-white/10 shrink-0 max-h-32 overflow-y-auto">
                            <div className="flex justify-between items-start mb-1">
                                <h5 className="text-green-300 font-bold text-sm">{lesson.topic}</h5>
                                <button onClick={() => setLesson(null)} className="text-slate-400 hover:text-white text-xs underline">Quay lại chọn node</button>
                            </div>
                            <p className="text-xs text-slate-300 mb-2">{lesson.theory}</p>
                            <div className="bg-yellow-900/20 border-l-2 border-yellow-500 pl-2 py-1">
                                <p className="text-xs text-yellow-100 font-medium"><strong className="text-yellow-500">Yêu cầu:</strong> {lesson.question}</p>
                            </div>
                        </div>

                        {/* Split Editor / Output */}
                        <div className="flex-1 flex min-h-0">
                            {/* Code Editor */}
                            <div className="flex-1 flex flex-col border-r border-white/10 bg-[#1e1e1e]">
                                <div className="px-3 py-1 bg-[#252526] text-[10px] text-slate-400 font-mono uppercase border-b border-white/5">
                                    Editor ({language})
                                </div>
                                <textarea 
                                    value={userCode}
                                    onChange={(e) => setUserCode(e.target.value)}
                                    className="flex-1 w-full bg-transparent text-slate-200 font-mono text-sm p-4 outline-none resize-none leading-relaxed"
                                    spellCheck={false}
                                />
                                <div className="p-2 border-t border-white/10 bg-[#252526]">
                                    <button 
                                        onClick={handleRunCode}
                                        className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">play_arrow</span> Run Code
                                    </button>
                                </div>
                            </div>

                            {/* Outputs */}
                            <div className="flex-1 flex flex-col bg-[#0d1117]">
                                <div className="flex-1 flex flex-col border-b border-white/10">
                                    <div className="px-3 py-1 bg-[#161b22] text-[10px] text-slate-400 font-mono uppercase border-b border-white/5">
                                        Expected Output
                                    </div>
                                    <div className="flex-1 p-3 text-xs font-mono text-slate-400 opacity-70 whitespace-pre-wrap">
                                        {lesson.expectedOutput}
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col bg-[#000000]">
                                    <div className="px-3 py-1 bg-[#161b22] text-[10px] text-slate-400 font-mono uppercase border-b border-white/5 flex justify-between">
                                        <span>Your Output</span>
                                        {userOutput.trim() === lesson.expectedOutput.trim() && userOutput !== "" && <span className="text-green-400 font-bold">CORRECT!</span>}
                                    </div>
                                    <div className={`flex-1 p-3 text-xs font-mono whitespace-pre-wrap ${userOutput ? 'text-white' : 'text-slate-600 italic'}`}>
                                        {userOutput || "Nhấn Run để xem kết quả..."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center opacity-60">
                        <span className="material-symbols-outlined text-6xl mb-4">code_blocks</span>
                        <p className="text-sm">Chọn chủ đề từ danh sách bên trên và nhấn "Tạo bài học AI" để bắt đầu.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
