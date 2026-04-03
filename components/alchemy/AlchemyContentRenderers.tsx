
import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- TYPES ---
interface Node {
    id: string;
    x: number;
    y: number;
    label: string;
    color: string;
    level: number;
    collapsed?: boolean;
}

interface Link {
    source: string;
    target: string;
}

// ----------------------------------------------------------------------
// 1. CODE PLAYGROUND: Interactive Sandbox (Real JS Execution)
// ----------------------------------------------------------------------

export const CodePlayground: React.FC<{ initialCode?: string, language?: string }> = ({ 
    initialCode = "console.log('Hello LearnAI!');\n\nconst a = 10;\nconst b = 20;\nprint('Tổng là: ' + (a + b));\n\nreturn 'Execution Complete';", 
    language = "javascript" 
}) => {
    const [code, setCode] = useState(initialCode);
    const [output, setOutput] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const runCode = async () => {
        setIsRunning(true);
        setOutput(null);
        setLogs([]);

        // Small delay to visualize "processing" state
        await new Promise(resolve => setTimeout(resolve, 300));

        const capturedLogs: string[] = [];
        
        // Mock console environment
        const mockConsole = {
            log: (...args: any[]) => {
                capturedLogs.push(args.map(a => 
                    typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
                ).join(' '));
            },
            error: (...args: any[]) => {
                 capturedLogs.push(`❌ ${args.join(' ')}`);
            },
            warn: (...args: any[]) => {
                 capturedLogs.push(`⚠️ ${args.join(' ')}`);
            },
            info: (...args: any[]) => {
                 capturedLogs.push(`ℹ️ ${args.join(' ')}`);
            }
        };

        try {
            // Polyfill 'print' for Python-like feel in JS
            const wrapperCode = `
                const print = console.log;
                ${code}
            `;

            // Execute in function scope
            // We pass 'console' as an argument to capture logs
            const func = new Function('console', wrapperCode);
            
            // Run the code
            const result = func(mockConsole);
            
            // Update state with captured logs
            setLogs(capturedLogs);
            
            if (result !== undefined) {
                setOutput(String(result));
            } else if (capturedLogs.length === 0) {
                setOutput("Code executed successfully (No output)");
            }
        } catch (error: any) {
            setLogs(prev => [...prev, ...capturedLogs, `⛔ Runtime Error: ${error.message}`]);
        } finally {
            setIsRunning(false);
        }
    };

    // Syntax Highlighting Mock (Simple Regex based)
    const renderCode = (rawCode: string) => {
        return rawCode.split('\n').map((line, i) => {
            // Simple tokenizer
            const parts = line.split(/('.*?'|".*?"|\/\/.*|\bfunction\b|\bconst\b|\bvar\b|\blet\b|\breturn\b|\bif\b|\belse\b|\bfor\b|\bprint\b|\bconsole\b|\btrue\b|\bfalse\b)/g);
            return (
                <div key={i} className="leading-6 whitespace-pre">
                    <span className="inline-block w-8 text-slate-600 text-xs select-none mr-2 text-right border-r border-slate-700 pr-2">{i + 1}</span>
                    {parts.map((part, j) => {
                        if (part.startsWith("//")) return <span key={j} className="text-slate-500 italic">{part}</span>;
                        if (part.startsWith("'") || part.startsWith('"')) return <span key={j} className="text-green-400">{part}</span>;
                        if (['function', 'const', 'var', 'let', 'return', 'if', 'else', 'for', 'true', 'false'].includes(part)) return <span key={j} className="text-purple-400 font-bold">{part}</span>;
                        if (['print', 'console'].includes(part)) return <span key={j} className="text-yellow-300">{part}</span>;
                        return <span key={j} className="text-slate-300">{part}</span>;
                    })}
                </div>
            );
        });
    };

    return (
        <div className="w-full rounded-xl bg-[#1e1e1e] border border-cyan-500/30 overflow-hidden shadow-lg my-4 font-mono text-sm flex flex-col h-96">
            <div className="flex justify-between items-center px-4 py-2 bg-[#252526] border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-cyan-400 font-bold text-xs uppercase ml-2">{language} Playground</span>
                </div>
                <button 
                    onClick={runCode} 
                    disabled={isRunning}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold transition-all ${isRunning ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-500 shadow-lg hover:shadow-green-500/30'}`}
                >
                    <span className={`material-symbols-outlined text-sm ${isRunning ? 'animate-spin' : ''}`}>{isRunning ? 'settings' : 'play_arrow'}</span> 
                    {isRunning ? 'Running...' : 'Run Code'}
                </button>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Area */}
                <div className="flex-1 relative bg-[#1e1e1e] overflow-auto custom-scrollbar group">
                    {/* The textarea is transparent but handles input */}
                    <textarea 
                        value={code} 
                        onChange={(e) => setCode(e.target.value)}
                        className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white p-4 pl-12 font-mono text-sm resize-none focus:outline-none z-10 leading-6"
                        spellCheck={false}
                        autoCapitalize="off"
                        autoComplete="off"
                    />
                    {/* The div renders the highlighted code underneath */}
                    <div className="absolute inset-0 w-full h-full p-4 pointer-events-none z-0">
                        {renderCode(code)}
                    </div>
                </div>

                {/* Output Area */}
                <div className="w-1/3 bg-[#0d1117] border-l border-white/10 flex flex-col p-3 font-mono text-xs overflow-hidden">
                    <div className="text-slate-500 mb-2 uppercase font-bold tracking-wider flex justify-between">
                        <span>Console Output</span>
                        <button onClick={() => { setLogs([]); setOutput(null); }} className="hover:text-white" title="Clear"><span className="material-symbols-outlined text-xs">block</span></button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                        {logs.map((log, i) => (
                            <div key={i} className={`mb-1 break-words ${log.startsWith('❌') || log.startsWith('⛔') ? 'text-red-400' : log.startsWith('⚠️') ? 'text-yellow-400' : 'text-slate-300'}`}>
                                <span className="opacity-50 mr-2">$</span>{log}
                            </div>
                        ))}
                        {output && (
                            <div className="mt-2 p-2 bg-green-900/20 text-green-400 border-l-2 border-green-500 animate-[fadeIn_0.3s]">
                                <span className="font-bold">Result:</span> {output}
                            </div>
                        )}
                        {logs.length === 0 && !output && (
                            <div className="text-slate-600 italic mt-4 text-center opacity-50">
                                Ready to execute...
                            </div>
                        )}
                        <div className="mt-2 animate-pulse text-cyan-500">_</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 2. MIND MAP GENERATOR: Canvas Force-Directed-ish Graph
// ----------------------------------------------------------------------

export const MindMapGenerator: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = useState<Node[]>([
        { id: 'root', x: 300, y: 200, label: 'Main Concept', color: '#a855f7', level: 0 },
        { id: '1', x: 150, y: 100, label: 'History', color: '#3b82f6', level: 1 },
        { id: '2', x: 450, y: 100, label: 'Mechanism', color: '#3b82f6', level: 1 },
        { id: '3', x: 150, y: 300, label: 'Application', color: '#3b82f6', level: 1 },
        { id: '4', x: 450, y: 300, label: 'Future', color: '#3b82f6', level: 1 },
        { id: '1-1', x: 50, y: 50, label: 'Origin', color: '#22d3ee', level: 2 },
        { id: '2-1', x: 550, y: 50, label: 'Process', color: '#22d3ee', level: 2 },
    ]);
    const [links, setLinks] = useState<Link[]>([
        { source: 'root', target: '1' },
        { source: 'root', target: '2' },
        { source: 'root', target: '3' },
        { source: 'root', target: '4' },
        { source: '1', target: '1-1' },
        { source: '2', target: '2-1' },
    ]);

    const [draggingNode, setDraggingNode] = useState<string | null>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 }); // Mouse offset from node center
    const [scale, setScale] = useState(1);

    // Draw Logic
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.scale(scale, scale);

        // Draw Links (Curved Bezier)
        links.forEach(link => {
            const sNode = nodes.find(n => n.id === link.source);
            const tNode = nodes.find(n => n.id === link.target);
            if (sNode && tNode) {
                ctx.beginPath();
                ctx.moveTo(sNode.x, sNode.y);
                // Control points for bezier curve
                const cx1 = sNode.x + (tNode.x - sNode.x) / 2;
                const cy1 = sNode.y; 
                const cx2 = sNode.x + (tNode.x - sNode.x) / 2;
                const cy2 = tNode.y;
                
                // Simple straight line for now for performance in this context, or quadratic
                ctx.quadraticCurveTo(sNode.x, tNode.y, tNode.x, tNode.y);
                
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });

        // Draw Nodes
        nodes.forEach(node => {
            ctx.beginPath();
            const radius = node.level === 0 ? 30 : node.level === 1 ? 25 : 15;
            
            // Glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = node.color;
            
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = node.color;
            ctx.fill();
            
            // Reset shadow for text
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = node.level === 0 ? 'bold 12px sans-serif' : '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Simple text wrapping logic skipped for brevity
            ctx.fillText(node.label, node.x, node.y + radius + 15);
        });

        ctx.restore();
    }, [nodes, links, scale]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = canvas.parentElement?.clientWidth || 600;
            canvas.height = 400;
            draw();
        }
    }, [draw]);

    // Interaction Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / scale;
        const mouseY = (e.clientY - rect.top) / scale;

        // Check collision (reverse to pick top-most)
        const clickedNode = [...nodes].reverse().find(n => {
            const r = n.level === 0 ? 30 : n.level === 1 ? 25 : 15;
            const dist = Math.sqrt((n.x - mouseX) ** 2 + (n.y - mouseY) ** 2);
            return dist < r + 5;
        });

        if (clickedNode) {
            setDraggingNode(clickedNode.id);
            setOffset({ x: mouseX - clickedNode.x, y: mouseY - clickedNode.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingNode) return;
        const rect = canvasRef.current!.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / scale;
        const mouseY = (e.clientY - rect.top) / scale;

        setNodes(prev => prev.map(n => 
            n.id === draggingNode 
            ? { ...n, x: mouseX - offset.x, y: mouseY - offset.y } 
            : n
        ));
    };

    const handleMouseUp = () => {
        setDraggingNode(null);
    };

    return (
        <div ref={containerRef} className="w-full h-96 bg-[#0f172a] rounded-xl border border-purple-500/30 relative overflow-hidden group my-4 shadow-2xl">
            <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
                <button onClick={() => setScale(s => s + 0.1)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"><span className="material-symbols-outlined text-sm">add</span></button>
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"><span className="material-symbols-outlined text-sm">remove</span></button>
                <button className="p-2 bg-purple-600 hover:bg-purple-500 rounded-full text-white shadow-lg"><span className="material-symbols-outlined text-sm">fullscreen</span></button>
            </div>
            
            <div className="absolute top-2 left-4 text-xs font-bold text-purple-300 uppercase tracking-widest pointer-events-none">
                Interactive Mind Map
            </div>

            <canvas 
                ref={canvasRef}
                className="cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />
        </div>
    );
};

// ----------------------------------------------------------------------
// 3. TEXT TO SPEECH PLAYER: With Highlighting
// ----------------------------------------------------------------------

export const TextToSpeechPlayer: React.FC<{ text: string }> = ({ text }) => {
    const [playing, setPlaying] = useState(false);
    const [paused, setPaused] = useState(false);
    const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
    const [charIndex, setCharIndex] = useState(0);

    useEffect(() => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'vi-VN'; // Vietnamese default
        u.rate = 1.0;
        
        u.onboundary = (event) => {
            if (event.name === 'word') {
                setCharIndex(event.charIndex);
            }
        };
        
        u.onend = () => {
            setPlaying(false);
            setPaused(false);
            setCharIndex(0);
        };

        setUtterance(u);

        return () => {
            window.speechSynthesis.cancel();
        };
    }, [text]);

    const togglePlay = () => {
        if (!utterance) return;

        if (playing && !paused) {
            window.speechSynthesis.pause();
            setPaused(true);
        } else if (paused) {
            window.speechSynthesis.resume();
            setPaused(false);
        } else {
            window.speechSynthesis.speak(utterance);
            setPlaying(true);
        }
    };

    const stop = () => {
        window.speechSynthesis.cancel();
        setPlaying(false);
        setPaused(false);
        setCharIndex(0);
    };

    return (
        <div className="flex items-center gap-2 bg-[#1e1e1e] p-2 rounded-full border border-cyan-500/30 shadow-lg">
            <button 
                onClick={togglePlay}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${playing && !paused ? 'bg-cyan-500 text-white shadow-[0_0_15px_cyan]' : 'bg-white/10 text-cyan-400 hover:bg-cyan-500/20'}`}
                title={playing && !paused ? "Tạm dừng" : "Đọc"}
            >
                <span className="material-symbols-outlined text-xl">
                    {playing && !paused ? 'pause' : 'volume_up'}
                </span>
            </button>
            
            {playing && (
                <>
                    <div className="flex flex-col w-24">
                        <div className="flex gap-0.5 h-4 items-end mx-auto">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className={`w-1 bg-cyan-400 rounded-t ${paused ? 'h-1' : 'animate-[wave_1s_ease-in-out_infinite]'}`} style={{ animationDelay: `${i*0.1}s`, height: paused ? '4px' : undefined }}></div>
                            ))}
                        </div>
                        <span className="text-[9px] text-cyan-200 text-center font-mono">
                            {paused ? 'PAUSED' : 'READING'}
                        </span>
                    </div>
                    <button 
                        onClick={stop}
                        className="p-2 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">stop</span>
                    </button>
                </>
            )}
        </div>
    );
};

// ----------------------------------------------------------------------
// 4. LATEX FORMULA RENDERER
// ----------------------------------------------------------------------

export const LatexFormulaRenderer: React.FC<{ formula: string }> = ({ formula }) => {
    return (
        <div 
            className="inline-block px-4 py-2 my-2 bg-[#0f172a] rounded-lg border border-white/10 text-cyan-100 font-serif italic hover:bg-white/5 transition-colors cursor-pointer group relative shadow-inner"
            onClick={() => {
                navigator.clipboard.writeText(formula);
                // Could add toast here
            }}
        >
            <span className="text-slate-500 mr-3 text-xs font-sans not-italic select-none">Math:</span>
            <span className="text-lg tracking-wide">{formula}</span>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Click to Copy LaTeX
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 5. GLOSSARY TOOLTIP
// ----------------------------------------------------------------------

export const GlossaryTooltip: React.FC<{ word: string, definition: string }> = ({ word, definition }) => {
    return (
        <span className="group relative inline-block border-b-2 border-dotted border-amber-400/50 text-amber-100 cursor-help mx-1 hover:bg-amber-900/30 rounded px-1 transition-colors">
            {word}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-[#1e1e1e] border border-amber-500/30 text-slate-300 text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 translate-y-2 group-hover:translate-y-0">
                <strong className="text-amber-400 block mb-1 text-sm border-b border-white/10 pb-1">{word}</strong>
                <span className="leading-relaxed">{definition}</span>
                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1e1e1e] border-b border-r border-amber-500/30 transform rotate-45"></div>
            </span>
        </span>
    );
};
