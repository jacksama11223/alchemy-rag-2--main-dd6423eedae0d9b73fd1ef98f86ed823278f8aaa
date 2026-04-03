
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SavedDrawing, DrawingElement, ToolType, PageTemplate, CanvasMode, KnowledgeNode, AlchemyIntent } from '../types';
import InfiniteCanvas from './InfiniteCanvas';
import PagedCanvas from './PagedCanvas';
import { DrawingSidebar } from './Drawing/DrawingSidebar';
import { DrawingAIPanel } from './Drawing/DrawingAIPanel';
import { Minimap } from './Drawing/Minimap';
import { saveDrawingToBackend } from '../services/mockBackend'; // Using backend function which handles fallback
import { FeatureWindowControls } from './FeatureWindowControls';

interface DrawEverythingProps {
    onBack: () => void;
    onShowAbout: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    initialDrawing: SavedDrawing; 
    onToggleTodo?: () => void;
    onAddNode?: (node: KnowledgeNode) => void;
    onNavigateToAlchemy?: (intent: AlchemyIntent) => void;
    onNavigateToFeature?: (feature: string, params?: any) => void;
}

const DrawEverything: React.FC<DrawEverythingProps> = ({ 
    onBack, onShowAccount, initialDrawing, onToggleTodo, onAddNode, onNavigateToAlchemy, onNavigateToFeature
}) => {
    // --- SHARED STATE ---
    const [elements, setElements] = useState<DrawingElement[]>(initialDrawing.elements || []);
    const [history, setHistory] = useState<DrawingElement[][]>([initialDrawing.elements || []]);
    const [historyStep, setHistoryStep] = useState(0);
    const [currentDrawingName, setCurrentDrawingName] = useState(initialDrawing.name);
    
    const [pageTemplate, setPageTemplate] = useState<PageTemplate>(initialDrawing.template || 'grid');
    const [canvasMode, setCanvasMode] = useState<CanvasMode>(initialDrawing.mode || 'infinite');
    const [pageCount, setPageCount] = useState<number>(initialDrawing.pageCount || 1);

    const [tool, setTool] = useState<ToolType>('selection');
    const [activeSticker, setActiveSticker] = useState<string | undefined>(undefined);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    const [strokeColor, setStrokeColor] = useState('#ffffff');
    const [backgroundColor, setBackgroundColor] = useState('transparent');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [fontSize, setFontSize] = useState(20);
    const [eraserSize, setEraserSize] = useState(20);

    const historyRef = useRef(history);
    const historyStepRef = useRef(historyStep);
    
    // Debounce timer for saving
    const saveTimeoutRef = useRef<any>(null);

    useEffect(() => { historyRef.current = history; }, [history]);
    useEffect(() => { historyStepRef.current = historyStep; }, [historyStep]);

    // --- SAVE ACTIONS (SAFE VERSION) ---
    const triggerSave = () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                // Prepare updated object
                const updatedDrawing: SavedDrawing = {
                    id: initialDrawing.id,
                    name: currentDrawingName,
                    date: new Date().toLocaleString(),
                    elements: elements,
                    template: pageTemplate,
                    mode: canvasMode,
                    pageCount: pageCount
                };

                // Use the shared backend service which handles local/remote logic safely
                await saveDrawingToBackend(updatedDrawing);
                
                // Also explicitly update local storage array to ensure instant list updates without fetch
                const stored = localStorage.getItem('draw_everything_files');
                let drawings: SavedDrawing[] = [];
                if (stored) {
                     try {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed)) drawings = parsed;
                     } catch(e) {}
                }
                
                const idx = drawings.findIndex(d => d.id === initialDrawing.id);
                if (idx >= 0) drawings[idx] = updatedDrawing;
                else drawings.unshift(updatedDrawing);
                
                localStorage.setItem('draw_everything_files', JSON.stringify(drawings));

            } catch (e) {
                console.error("Auto-save failed", e);
            }
        }, 1000); // Debounce 1s
    };

    // Trigger save on change
    useEffect(() => {
        triggerSave();
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [elements, pageTemplate, canvasMode, currentDrawingName, pageCount]);

    // --- HISTORY ACTIONS ---
    const saveHistory = useCallback(() => {
        const currentStep = historyStepRef.current;
        const currentHistory = historyRef.current;
        const newHistory = currentHistory.slice(0, currentStep + 1);
        newHistory.push(elements);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    }, [elements]);

    const undo = useCallback(() => {
        const step = historyStepRef.current;
        if (step > 0) {
            const newStep = step - 1;
            setElements(historyRef.current[newStep]);
            setHistoryStep(newStep);
        }
    }, []);

    const redo = useCallback(() => {
        const step = historyStepRef.current;
        if (step < historyRef.current.length - 1) {
            const newStep = step + 1;
            setElements(historyRef.current[newStep]);
            setHistoryStep(newStep);
        }
    }, []);

    // Global Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) redo(); else undo();
            }
            if (e.key === 'v') setTool('selection');
            if (e.key === 'p') setTool('freedraw');
            if (e.key === 'e') setTool('eraser');
            if (e.key === 'h') setTool('hand');
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedElementId) {
                    const newEls = elements.filter(el => el.id !== selectedElementId);
                    setElements(newEls);
                    saveHistory();
                    setSelectedElementId(null);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, elements, selectedElementId, saveHistory]);

    const toggleCanvasMode = () => {
        const newMode = canvasMode === 'infinite' ? 'page' : 'infinite';
        setCanvasMode(newMode);
        if (newMode === 'page') {
            setStrokeColor('#000000'); 
        } else {
            setStrokeColor('#ffffff'); 
        }
    };

    // --- CONNECTED FEATURES ---
    const handleExportToGraph = () => {
        if (!onAddNode) return;
        const newNode: KnowledgeNode = {
            id: Date.now().toString(),
            title: currentDrawingName,
            type: 'Mixed',
            status: 'new',
            tags: ['Drawing', 'Sketch'],
            x: 0,
            y: 0,
            timestamp: new Date(),
            imageUrl: 'https://placehold.co/600x400/1e1e1e/FFF?text=Drawing+Snapshot',
            data: {
                summary: `Bản vẽ: ${currentDrawingName}. Được tạo từ DrawEverything.`
            }
        };
        onAddNode(newNode);
        alert("Đã lưu bản vẽ vào Sơ đồ tri thức!");
    };

    const handleExportToAlchemy = (intentQuery: string) => {
        if (onNavigateToAlchemy) {
            onNavigateToAlchemy({
                type: 'create',
                initialQuery: `Analyze this drawing content: ${intentQuery || "Diagram from user sketch"}`
            });
        }
    };

    const handleAddElements = useCallback((newElements: DrawingElement[]) => {
        setElements(prev => {
            const updated = [...prev, ...newElements];
            const currentStep = historyStepRef.current;
            const currentHistory = historyRef.current;
            const newHistory = currentHistory.slice(0, currentStep + 1);
            newHistory.push(updated);
            setHistory(newHistory);
            setHistoryStep(newHistory.length - 1);
            return updated;
        });
    }, []);

    const getCanvasImageMock = () => {
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    };

    return (
        <div className="flex flex-col h-screen bg-[#121212] text-slate-200 font-display overflow-hidden select-none relative">
            <style>{`
                @font-face { font-family: 'Virgil'; src: url('https://excalidraw.com/Virgil.woff2'); }
                .tool-btn {
                    width: 40px; height: 40px;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 8px; transition: all 0.2s; color: #a8a29e;
                }
                .tool-btn:hover { background-color: #292524; color: #fff; transform: translateY(-2px); }
                .tool-btn.active { background-color: #4338ca; color: #fff; box-shadow: 0 0 10px rgba(67, 56, 202, 0.5); }
                
                .color-btn {
                    width: 24px; height: 24px; border-radius: 4px;
                    border: 1px solid rgba(255,255,255,0.2); cursor: pointer;
                }
                .color-btn.active { border-color: #fff; transform: scale(1.1); box-shadow: 0 0 0 2px rgba(255,255,255,0.5); }
                textarea {
                    font-family: 'Virgil', sans-serif; background: transparent;
                    color: white; border: none; outline: none; resize: none;
                    overflow: hidden; padding: 0; margin: 0; line-height: 1.2;
                }
            `}</style>

            {/* HEADER */}
            <header className="absolute top-0 left-0 w-full flex items-center justify-between px-4 py-3 z-30 pointer-events-none">
                <div className="pointer-events-auto flex gap-3">
                    <button onClick={onBack} className="bg-[#1e1e1e] border border-[#333] px-4 py-2 rounded-lg text-sm hover:bg-[#333] flex items-center gap-2 shadow-lg">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                    </button>
                    <input 
                        type="text" 
                        value={currentDrawingName} 
                        onChange={(e) => setCurrentDrawingName(e.target.value)}
                        className="bg-[#1e1e1e] border border-[#333] px-3 py-1.5 rounded-lg text-sm text-white font-bold w-48 focus:outline-none focus:border-sky-500 pointer-events-auto shadow-lg"
                    />
                </div>
                
                <div className="pointer-events-auto flex gap-2 bg-[#1e1e1e]/90 backdrop-blur-md border border-[#333] p-1 rounded-lg shadow-lg">
                    <button onClick={toggleCanvasMode} className="px-3 py-1.5 rounded-md hover:bg-[#333] flex items-center gap-2 text-xs font-bold transition-all">
                        <span className="material-symbols-outlined text-sm text-sky-400">{canvasMode === 'infinite' ? 'all_inclusive' : 'note'}</span>
                        {canvasMode === 'infinite' ? 'Vô hạn' : 'Trang A4'}
                    </button>
                    <div className="w-px bg-[#444] my-1"></div>
                    <div className="flex gap-1">
                        <button onClick={() => setPageTemplate('blank')} className={`p-1.5 rounded hover:bg-[#333] ${pageTemplate === 'blank' ? 'bg-[#333]' : ''}`} title="Trắng"><span className="material-symbols-outlined text-sm">check_box_outline_blank</span></button>
                        <button onClick={() => setPageTemplate('grid')} className={`p-1.5 rounded hover:bg-[#333] ${pageTemplate === 'grid' ? 'bg-[#333]' : ''}`} title="Lưới"><span className="material-symbols-outlined text-sm">grid_on</span></button>
                        <button onClick={() => setPageTemplate('ruled')} className={`p-1.5 rounded hover:bg-[#333] ${pageTemplate === 'ruled' ? 'bg-[#333]' : ''}`} title="Kẻ ngang"><span className="material-symbols-outlined text-sm">format_align_justify</span></button>
                        <button onClick={() => setPageTemplate('dotted')} className={`p-1.5 rounded hover:bg-[#333] ${pageTemplate === 'dotted' ? 'bg-[#333]' : ''}`} title="Chấm bi"><span className="material-symbols-outlined text-sm">grain</span></button>
                    </div>
                </div>

                <div className="pointer-events-auto flex gap-2">
                    {onToggleTodo && (
                        <button onClick={onToggleTodo} className="p-2 bg-[#1e1e1e] border border-amber-500/20 text-amber-500 rounded-lg hover:bg-[#333] shadow-lg" title="Tasks">
                            <span className="material-symbols-outlined text-sm">checklist</span>
                        </button>
                    )}
                    <button onClick={undo} className="p-2 bg-[#1e1e1e] border border-[#333] rounded-lg hover:bg-[#333] shadow-lg" title="Undo"><span className="material-symbols-outlined text-sm">undo</span></button>
                    <button onClick={redo} className="p-2 bg-[#1e1e1e] border border-[#333] rounded-lg hover:bg-[#333] shadow-lg" title="Redo"><span className="material-symbols-outlined text-sm">redo</span></button>
                    <div className="w-px h-8 bg-[#333] mx-1"></div>
                    <button onClick={onShowAccount} className="p-2 bg-[#1e1e1e] rounded-full hover:bg-[#333] shadow-lg"><span className="material-symbols-outlined text-sm">person</span></button>
                    <FeatureWindowControls onClose={onBack} />
                </div>
            </header>

            {/* SIDEBARS & PANELS */}
            <DrawingSidebar 
                activeTool={tool} 
                onSelectTool={(t, icon) => { 
                    setTool(t); 
                    if(icon) setActiveSticker(icon);
                }} 
            />
            
            <DrawingAIPanel 
                onExportToGraph={handleExportToGraph}
                onExportToAlchemy={handleExportToAlchemy}
                getCanvasImage={getCanvasImageMock}
                onNavigateToFeature={onNavigateToFeature}
                onAddElements={handleAddElements} 
            />

            {/* FLOATING TOOLBAR */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-[#1e1e1e]/90 backdrop-blur-md border border-[#333] p-2 rounded-xl shadow-2xl flex gap-1 animate-slideInUp">
                <button onClick={() => setTool('hand')} className={`tool-btn ${tool === 'hand' ? 'active' : ''}`} title="Pan (H)"><span className="material-symbols-outlined">pan_tool</span></button>
                <button onClick={() => setTool('selection')} className={`tool-btn ${tool === 'selection' ? 'active' : ''}`} title="Select (V)"><span className="material-symbols-outlined">near_me</span></button>
                <div className="w-px bg-[#333] mx-1"></div>
                <button onClick={() => setTool('freedraw')} className={`tool-btn ${tool === 'freedraw' ? 'active' : ''}`} title="Draw (P)"><span className="material-symbols-outlined">edit</span></button>
                <button onClick={() => setTool('rectangle')} className={`tool-btn ${tool === 'rectangle' ? 'active' : ''}`} title="Rectangle (R)"><span className="material-symbols-outlined">crop_square</span></button>
                <button onClick={() => setTool('diamond')} className={`tool-btn ${tool === 'diamond' ? 'active' : ''}`} title="Diamond (D)"><span className="material-symbols-outlined">diamond</span></button>
                <button onClick={() => setTool('ellipse')} className={`tool-btn ${tool === 'ellipse' ? 'active' : ''}`} title="Ellipse (O)"><span className="material-symbols-outlined">circle</span></button>
                <button onClick={() => setTool('arrow')} className={`tool-btn ${tool === 'arrow' ? 'active' : ''}`} title="Arrow (A)"><span className="material-symbols-outlined">arrow_right_alt</span></button>
                <button onClick={() => setTool('line')} className={`tool-btn ${tool === 'line' ? 'active' : ''}`} title="Line (L)"><span className="material-symbols-outlined">remove</span></button>
                <button onClick={() => setTool('highlighter')} className={`tool-btn ${tool === 'highlighter' ? 'active' : ''}`} title="Highlight (H)"><span className="material-symbols-outlined text-yellow-400">brush</span></button>
                <button onClick={() => setTool('text')} className={`tool-btn ${tool === 'text' ? 'active' : ''}`} title="Text (T)"><span className="material-symbols-outlined">title</span></button>
                <div className="w-px bg-[#333] mx-1"></div>
                <button onClick={() => setTool('eraser')} className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`} title="Eraser (E)"><span className="material-symbols-outlined text-red-400">ink_eraser</span></button>
            </div>

            {/* PROPERTIES PANEL */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 z-30 bg-[#1e1e1e]/90 backdrop-blur-md border border-[#333] p-5 rounded-xl shadow-2xl flex flex-col gap-6 w-60 mt-32">
                {tool !== 'eraser' && tool !== 'hand' && tool !== 'sticker' && (
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-3 block tracking-wider">Color</label>
                        <div className="grid grid-cols-5 gap-2">
                            {['#ffffff', '#000000', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#78716c', 'transparent'].map(c => (
                                <div key={c} onClick={() => setStrokeColor(c)} className={`color-btn ${strokeColor === c ? 'active' : ''}`} style={{backgroundColor: c === 'transparent' ? 'transparent' : c, border: c === 'transparent' ? '1px dashed #555' : 'none'}} title={c}></div>
                            ))}
                        </div>
                    </div>
                )}
                {['rectangle', 'ellipse', 'diamond'].includes(tool) && (
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-3 block tracking-wider">Fill</label>
                        <div className="grid grid-cols-5 gap-2">
                            {['transparent', '#1e1e1e', '#ef4444', '#f59e0b', '#10b981', '#3b82f6'].map(c => (
                                <div key={c} onClick={() => setBackgroundColor(c)} className={`color-btn ${backgroundColor === c ? 'active' : ''}`} style={{backgroundColor: c === 'transparent' ? 'transparent' : c, border: c === 'transparent' ? '1px dashed #555' : 'none'}}></div>
                            ))}
                        </div>
                    </div>
                )}
                {tool !== 'text' && tool !== 'eraser' && tool !== 'hand' && tool !== 'sticker' && (
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-3 block tracking-wider">Width</label>
                        <div className="flex gap-2">
                            {[1, 2, 4, 8].map(w => (
                                <button key={w} onClick={() => setStrokeWidth(w)} className={`flex-1 py-1 text-xs border rounded-md transition-colors ${strokeWidth === w ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-transparent border-[#333] hover:bg-[#333]'}`}>{w}px</button>
                            ))}
                        </div>
                    </div>
                )}
                {tool === 'eraser' && (
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-3 block tracking-wider">Size: {eraserSize}px</label>
                        <input type="range" min="5" max="100" value={eraserSize} onChange={(e) => setEraserSize(Number(e.target.value))} className="w-full accent-sky-500"/>
                    </div>
                )}
                {tool === 'hand' && (
                    <div className="text-center text-xs text-slate-400">
                        Kéo để di chuyển trang
                    </div>
                )}
                {tool === 'sticker' && (
                    <div className="text-center text-xs text-slate-400">
                        <div className="text-4xl mb-2 flex justify-center"><span className="material-symbols-outlined">{activeSticker || 'stars'}</span></div>
                        Click to stamp sticker
                    </div>
                )}
            </div>

            {/* MINIMAP */}
            <Minimap />

            {/* MAIN CANVAS AREA */}
            <div className="flex-1 w-full h-full relative">
                {canvasMode === 'infinite' ? (
                    <InfiniteCanvas 
                        elements={elements}
                        setElements={setElements}
                        onHistorySave={saveHistory}
                        tool={tool}
                        setTool={setTool}
                        color={strokeColor}
                        fillColor={backgroundColor}
                        strokeWidth={strokeWidth}
                        eraserSize={eraserSize}
                        fontSize={fontSize}
                        template={pageTemplate}
                        setSelectedElementId={setSelectedElementId}
                        selectedElementId={selectedElementId}
                    />
                ) : (
                    <PagedCanvas 
                        elements={elements}
                        setElements={setElements}
                        onHistorySave={saveHistory}
                        tool={tool}
                        setTool={setTool}
                        color={strokeColor}
                        fillColor={backgroundColor}
                        strokeWidth={strokeWidth}
                        eraserSize={eraserSize}
                        fontSize={fontSize}
                        template={pageTemplate}
                        setSelectedElementId={setSelectedElementId}
                        selectedElementId={selectedElementId}
                        initialPageCount={pageCount}
                        onPageCountChange={setPageCount}
                    />
                )}
            </div>
        </div>
    );
};

export default React.memo(DrawEverything);
