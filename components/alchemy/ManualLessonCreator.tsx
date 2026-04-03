
import React, { useState, useRef, useEffect } from 'react';

interface ManualLessonCreatorProps {
    isOpen: boolean;
    onClose: () => void;
    sourceContent: string;
    onSave: (data: any, type: 'Flashcard' | 'Case Study' | 'Quiz') => void;
}

interface ColorGroup {
    id: number;
    color: string;
    label: string;
}

// Unified item structure for local state
interface ManualItem {
    id: string;
    type: 'Flashcard' | 'Case Study' | 'Quiz';
    field1: string; // Question / Front / Scenario
    field2: string; // Answer / Back / Analysis
    tags: string[];
}

const generateColors = () => {
    const colors = [];
    for (let i = 0; i < 40; i++) {
        const hue = Math.floor((i / 40) * 360);
        colors.push(`hsl(${hue}, 85%, 75%)`);
    }
    return colors;
};

const INITIAL_COLORS = generateColors();

export const ManualLessonCreator: React.FC<ManualLessonCreatorProps> = ({ isOpen, onClose, sourceContent, onSave }) => {
    // --- STATE ---
    const [lessonTitle, setLessonTitle] = useState("Bài học thủ công mới"); // NEW: Custom Title State
    const [colorGroups, setColorGroups] = useState<ColorGroup[]>(
        INITIAL_COLORS.map((c, i) => ({ id: i, color: c, label: `Chủ đề ${i + 1}` }))
    );
    const [activeGroupId, setActiveGroupId] = useState(0);
    
    // Collection of created items
    const [createdItems, setCreatedItems] = useState<ManualItem[]>([]);
    
    // Current Editing Form
    const [templateType, setTemplateType] = useState<'Flashcard' | 'Case Study' | 'Quiz'>('Flashcard');
    const [input1, setInput1] = useState(''); // Question/Front
    const [input2, setInput2] = useState(''); // Answer/Back
    
    // UI
    // Modified to store the target element for deletion
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, text: string, target?: HTMLElement } | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Initialize content
    useEffect(() => {
        if (contentRef.current && sourceContent) {
            contentRef.current.innerHTML = sourceContent.replace(/\n/g, '<br/>');
        }
        // Reset title when opening new source
        if (isOpen) {
             setLessonTitle("Bài học thủ công mới");
        }
    }, [sourceContent, isOpen]);

    // --- LOGIC: Highlight & Capture ---
    const handleMouseUp = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

        const text = selection.toString().trim();
        if (!text) return;

        const range = selection.getRangeAt(0);
        const container = contentRef.current;

        // Visual Highlight
        if (container && container.contains(range.commonAncestorContainer)) {
            const span = document.createElement('span');
            const group = colorGroups.find(g => g.id === activeGroupId);
            
            span.style.backgroundColor = group?.color || '#fff';
            span.style.color = '#000';
            span.className = 'manual-highlight rounded px-1 cursor-context-menu transition-all hover:brightness-90';
            span.dataset.groupId = activeGroupId.toString();
            span.title = `Nhóm: ${group?.label} (Chuột phải để tùy chọn)`;
            
            // Context Menu Event
            span.oncontextmenu = (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Pass the span element itself as target
                setContextMenu({ x: e.clientX, y: e.clientY, text: text, target: span });
            };

            try {
                range.surroundContents(span);
                selection.removeAllRanges();
            } catch (e) {
                console.warn("Complex selection (crossing tags) not fully supported visually.");
            }
        }

        // AUTOMATIC ACTION: Fill the "Answer/Content" field
        setInput2(text);
    };

    // --- CONTEXT MENU ACTIONS ---
    const handleUseAsQuestion = () => {
        if (contextMenu) {
            setInput1(contextMenu.text);
            setContextMenu(null);
        }
    };

    // NEW: Remove Highlight Logic
    const handleDeleteHighlight = () => {
        if (contextMenu && contextMenu.target) {
            const span = contextMenu.target;
            // Replace the span with its text content (unwrap)
            const textNode = document.createTextNode(span.innerText);
            span.parentNode?.replaceChild(textNode, span);
            setContextMenu(null);
        }
    };

    // --- FORM ACTIONS ---
    const handleAddItem = () => {
        if (!input1.trim() && !input2.trim()) {
            alert("Vui lòng nhập nội dung!");
            return;
        }

        const group = colorGroups.find(g => g.id === activeGroupId);
        const newItem: ManualItem = {
            id: Date.now().toString(),
            type: templateType,
            field1: input1,
            field2: input2,
            tags: [group?.label || 'General']
        };

        setCreatedItems(prev => [newItem, ...prev]);
        
        // Reset form but keep type
        setInput1('');
        setInput2('');
    };

    const handleDeleteItem = (id: string) => {
        setCreatedItems(prev => prev.filter(i => i.id !== id));
    };

    // --- FINAL SAVE ---
    const handleFinish = () => {
        if (createdItems.length === 0) {
            alert("Bạn chưa tạo nội dung nào.");
            return;
        }

        const flashcards = createdItems.filter(i => i.type === 'Flashcard').map(i => ({ front: i.field1, back: i.field2 }));
        const caseStudies = createdItems.filter(i => i.type === 'Case Study').map(i => ({ scenario: i.field1, analysis: i.field2, question: 'Phân tích tình huống trên?' }));
        const quizzes = createdItems.filter(i => i.type === 'Quiz').map(i => ({ question: i.field1, explanation: i.field2, options: ['Đúng', 'Sai'], correctAnswer: 0 }));

        const finalData: any = {};
        if (flashcards.length > 0) finalData.flashcards = flashcards;
        if (caseStudies.length > 0) finalData.caseStudies = caseStudies;
        if (quizzes.length > 0) finalData.quiz = quizzes;

        // Use custom title
        finalData.title = lessonTitle.trim() || `Bài học thủ công (${createdItems[0].tags[0]})`;
        finalData.tags = Array.from(new Set(createdItems.flatMap(i => i.tags)));

        // Determine dominant type
        let mainType: 'Flashcard' | 'Case Study' | 'Quiz' = 'Flashcard';
        if (caseStudies.length > flashcards.length) mainType = 'Case Study';
        if (quizzes.length > Math.max(flashcards.length, caseStudies.length)) mainType = 'Quiz';

        // Add random coordinates to ensure it's visible in Graph
        finalData.x = (Math.random() - 0.5) * 400;
        finalData.y = (Math.random() - 0.5) * 300;

        onSave(finalData, mainType);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] bg-[#020617] flex flex-col animate-fade-in font-display">
            {/* HEADER */}
            <div className="h-16 border-b border-white/10 bg-[#0f172a] px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">arrow_back</span></button>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400">handyman</span>
                        Xưởng Chế Tác Thủ Công
                    </h2>
                </div>
                <button 
                    onClick={handleFinish}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg"
                >
                    <span className="material-symbols-outlined">save</span>
                    Hoàn tất ({createdItems.length})
                </button>
            </div>

            {/* BODY */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* LEFT: SOURCE CONTENT */}
                <div className="flex-1 bg-[#1e293b] overflow-y-auto p-8 relative">
                    <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 rounded-xl shadow-2xl min-h-[80vh]">
                        <div className="mb-4 text-xs text-slate-400 uppercase font-bold tracking-wider border-b pb-2">Văn bản nguồn (Bôi đen để trích xuất)</div>
                        <div 
                            ref={contentRef}
                            className="prose max-w-none font-serif text-lg leading-loose selection:bg-yellow-200 selection:text-black"
                            onMouseUp={handleMouseUp}
                        >
                            {/* Content injected via useEffect */}
                        </div>
                    </div>
                </div>

                {/* RIGHT: TOOLBOX */}
                <div className="w-96 bg-[#0f172a] border-l border-white/10 flex flex-col shrink-0">
                    
                    {/* 0. TITLE INPUT (NEW) */}
                    <div className="p-4 border-b border-white/10 bg-[#162032]">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">Tên Bài Học (Node Title)</label>
                        <input 
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none font-bold"
                            value={lessonTitle}
                            onChange={(e) => setLessonTitle(e.target.value)}
                            placeholder="VD: Lịch sử Việt Nam..."
                        />
                    </div>

                    {/* 1. COLOR GROUPS */}
                    <div className="p-4 border-b border-white/10 bg-[#162032]">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">1. Phân loại chủ đề</h4>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                            {colorGroups.slice(0, 10).map(group => (
                                <button 
                                    key={group.id}
                                    onClick={() => setActiveGroupId(group.id)}
                                    className={`w-8 h-8 rounded-full shrink-0 border-2 transition-all ${activeGroupId === group.id ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    style={{ backgroundColor: group.color }}
                                    title={group.label}
                                ></button>
                            ))}
                        </div>
                        <input 
                            className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white mt-2"
                            value={colorGroups.find(g => g.id === activeGroupId)?.label}
                            onChange={(e) => setColorGroups(prev => prev.map(g => g.id === activeGroupId ? { ...g, label: e.target.value } : g))}
                            placeholder="Tên chủ đề..."
                        />
                    </div>

                    {/* 2. CREATED ITEMS LIST (Mini Preview) */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#0b1120]">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">2. Danh sách đã tạo ({createdItems.length})</h4>
                        <div className="space-y-3">
                            {createdItems.length === 0 && <p className="text-slate-600 text-sm text-center italic">Chưa có thẻ nào.</p>}
                            {createdItems.map(item => (
                                <div key={item.id} className="bg-[#1e293b] p-3 rounded-lg border border-white/5 group relative">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${item.type === 'Flashcard' ? 'bg-blue-900/30 text-blue-300' : 'bg-purple-900/30 text-purple-300'}`}>{item.type}</span>
                                        <span className="text-[10px] text-slate-500">{item.tags[0]}</span>
                                    </div>
                                    <p className="text-sm text-white font-bold mb-1 line-clamp-1">{item.field1 || "(Trống)"}</p>
                                    <p className="text-xs text-slate-400 line-clamp-2">{item.field2}</p>
                                    <button 
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. EDITOR FORM */}
                    <div className="p-4 border-t border-white/10 bg-[#162032] shadow-2xl z-10">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                            3. Biên tập mẫu
                            <button onClick={() => { setInput1(''); setInput2(''); }} className="text-[10px] text-slate-500 hover:text-white">Clear Form</button>
                        </h4>
                        
                        <div className="flex bg-black/30 p-1 rounded-lg mb-3">
                            <button onClick={() => setTemplateType('Flashcard')} className={`flex-1 py-1.5 text-xs font-bold rounded ${templateType === 'Flashcard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Flashcard</button>
                            <button onClick={() => setTemplateType('Case Study')} className={`flex-1 py-1.5 text-xs font-bold rounded ${templateType === 'Case Study' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>Tình huống</button>
                            <button onClick={() => setTemplateType('Quiz')} className={`flex-1 py-1.5 text-xs font-bold rounded ${templateType === 'Quiz' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}>Quiz</button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">
                                    {templateType === 'Flashcard' ? 'Mặt trước (Câu hỏi)' : templateType === 'Case Study' ? 'Tên tình huống / Ngữ cảnh' : 'Câu hỏi'}
                                </label>
                                <input 
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none"
                                    placeholder="Nhập hoặc chuột phải vào highlight..."
                                    value={input1}
                                    onChange={(e) => setInput1(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">
                                    {templateType === 'Flashcard' ? 'Mặt sau (Đáp án)' : templateType === 'Case Study' ? 'Chi tiết / Phân tích' : 'Đáp án / Giải thích'}
                                    <span className="text-green-400 ml-1 text-[9px]">(Tự động điền khi bôi đen)</span>
                                </label>
                                <textarea 
                                    className="w-full h-24 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none resize-none"
                                    placeholder="Nội dung sẽ hiện ở đây khi bạn bôi đen văn bản bên trái..."
                                    value={input2}
                                    onChange={(e) => setInput2(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={handleAddItem}
                                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">add_circle</span> Thêm vào danh sách
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTEXT MENU */}
            {contextMenu && (
                <div 
                    className="fixed z-[200] bg-[#1e1e1e] border border-white/20 rounded-lg shadow-xl py-1 w-48 animate-fade-in"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onMouseLeave={() => setContextMenu(null)}
                    onClick={() => setContextMenu(null)}
                >
                    <button 
                        onClick={handleUseAsQuestion}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-cyan-600 hover:text-white flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">input</span>
                        Điền vào ô Câu hỏi
                    </button>
                    {contextMenu.target && (
                        <button 
                            onClick={handleDeleteHighlight}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">format_color_reset</span>
                            Xóa Highlight
                        </button>
                    )}
                    <button 
                        className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:bg-white/5 flex items-center gap-2"
                        onClick={() => { navigator.clipboard.writeText(contextMenu.text); }}
                    >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                        Copy văn bản
                    </button>
                </div>
            )}
        </div>
    );
};
