
import React, { useState, useEffect, useRef } from 'react';
import { NotePage, NoteBlock, BlockType } from '../../types';
import { BlockWrapper } from './BlockComponents';
import { PageHeader } from './PageHeader';
import { GoogleGenAI } from "@google/genai";

const getAI = () => {
    const customKey = localStorage.getItem('custom_gemini_api_key');
    return new GoogleGenAI({ apiKey: customKey || process.env.API_KEY || '' });
};

interface EditorCoreProps {
    page: NotePage;
    onSave: (page: NotePage) => void;
    onAnalyzeAI?: (content: string) => void;
    onGenerateQuiz?: (title: string, content: string) => void; // New Prop for the Flow
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const EditorCore: React.FC<EditorCoreProps> = ({ page, onSave, onAnalyzeAI, onGenerateQuiz }) => {
    const [blocks, setBlocks] = useState<NoteBlock[]>(page.blocks);
    
    // Undo/Redo History
    const [history, setHistory] = useState<NoteBlock[][]>([page.blocks]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // Slash Menu State
    const [slashMenu, setSlashMenu] = useState<{ visible: boolean, x: number, y: number, blockId: string | null, selectedIndex: number }>({ visible: false, x: 0, y: 0, blockId: null, selectedIndex: 0 });

    // Floating Menu State
    const [floatingMenu, setFloatingMenu] = useState<{ visible: boolean, x: number, y: number }>({ visible: false, x: 0, y: 0 });

    // Handle Text Selection
    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            if (selection && !selection.isCollapsed && selection.toString().trim().length > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                setFloatingMenu({
                    visible: true,
                    x: rect.left + (rect.width / 2),
                    y: rect.top - 40 + window.scrollY
                });
            } else {
                setFloatingMenu({ visible: false, x: 0, y: 0 });
            }
        };

        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('keyup', handleSelection);
        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('keyup', handleSelection);
        };
    }, []);

    const applyFormat = (command: string, value?: string) => {
        if (command === 'createLink' && value) {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const a = document.createElement('a');
                a.href = value;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.appendChild(range.extractContents());
                range.insertNode(a);
                // Trigger input event to update state
                const activeEl = document.activeElement;
                if (activeEl && activeEl.getAttribute('contenteditable') === 'true') {
                    activeEl.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        } else {
            document.execCommand(command, false, value);
            // Trigger input event to update state
            const activeEl = document.activeElement;
            if (activeEl && activeEl.getAttribute('contenteditable') === 'true') {
                activeEl.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
        setFloatingMenu({ visible: false, x: 0, y: 0 });
    };

    const menuOptions: { type: BlockType; label: string; icon: string }[] = [
        { type: 'text', label: 'Text', icon: 'notes' },
        { type: 'h1', label: 'Heading 1', icon: 'format_h1' },
        { type: 'h2', label: 'Heading 2', icon: 'format_h2' },
        { type: 'h3', label: 'Heading 3', icon: 'format_h3' },
        { type: 'todo', label: 'To-do List', icon: 'check_box' },
        { type: 'bullet', label: 'Bulleted List', icon: 'format_list_bulleted' },
        { type: 'numbered', label: 'Numbered List', icon: 'format_list_numbered' },
        { type: 'code', label: 'Code Snippet', icon: 'code' },
        { type: 'quote', label: 'Quote', icon: 'format_quote' },
        { type: 'divider', label: 'Divider', icon: 'horizontal_rule' },
        { type: 'image', label: 'Image', icon: 'image' },
        { type: 'table', label: 'Table', icon: 'table' },
        { type: 'callout', label: 'Callout', icon: 'lightbulb' },
        { type: 'ai_magic', label: 'AI Magic', icon: 'auto_awesome' },
    ];

    // Helper: Focus a block by ID
    const focusBlock = (id: string, cursorPosition: 'start' | 'end' = 'end') => {
        setTimeout(() => {
            const el = document.getElementById(`block-content-${id}`);
            if (el) {
                el.focus();
                // Move cursor to end
                if (cursorPosition === 'end') {
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(el);
                    range.collapse(false); // false = end
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                }
            }
        }, 0);
    };

    // Helper: Push to history
    const pushHistory = (newBlocks: NoteBlock[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newBlocks);
        if (newHistory.length > 50) newHistory.shift(); // Limit to 50 states
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    // Undo/Redo Handlers
    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setBlocks(history[historyIndex - 1]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setBlocks(history[historyIndex + 1]);
        }
    };

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                handleRedo();
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [history, historyIndex]);

    // --- BLOCK OPERATIONS ---
    const updateBlock = (id: string, content: string, properties?: any) => {
        setBlocks(prev => {
            const newBlocks = prev.map(b => b.id === id ? { ...b, content, properties: { ...b.properties, ...properties } } : b);
            return newBlocks;
        });
    };

    const addBlock = (afterId: string, type: BlockType = 'text', properties?: any) => {
        const newBlock: NoteBlock = { id: generateId(), type, content: '', properties };
        setBlocks(prev => {
            const idx = prev.findIndex(b => b.id === afterId);
            const newArr = [...prev];
            newArr.splice(idx + 1, 0, newBlock);
            return newArr;
        });
        focusBlock(newBlock.id, 'start');
    };

    const deleteBlock = (id: string) => {
        setBlocks(prev => {
            if (prev.length <= 1) return prev; // Keep at least one block
            
            const idx = prev.findIndex(b => b.id === id);
            const newArr = prev.filter(b => b.id !== id);
            
            // Focus previous block if exists, else next
            if (idx > 0) {
                focusBlock(newArr[idx - 1].id, 'end');
            } else if (newArr.length > 0) {
                focusBlock(newArr[0].id, 'start');
            }
            return newArr;
        });
    };

    const mergeWithPrev = (id: string) => {
        const idx = blocks.findIndex(b => b.id === id);
        if (idx > 0) {
            const prevBlock = blocks[idx - 1];
            const currentBlock = blocks[idx];
            
            // Don't merge if types are incompatible or if it feels weird (like merging image)
            if (prevBlock.type === 'image' || currentBlock.type === 'image') {
                // Just delete current if empty? No, standard behavior is focus prev.
                focusBlock(prevBlock.id, 'end');
                return;
            }

            const newContent = prevBlock.content + currentBlock.content;
            
            setBlocks(prev => {
                const newArr = [...prev];
                newArr[idx - 1] = { ...prevBlock, content: newContent };
                newArr.splice(idx, 1);
                return newArr;
            });
            
            focusBlock(prevBlock.id, 'end');
        }
    };

    const changeBlockType = (id: string, type: BlockType) => {
        setBlocks(prev => prev.map(b => {
            if (b.id === id) {
                let newProps = { ...b.properties };
                if (type === 'numbered' && !newProps.number) newProps.number = 1;
                return { ...b, type, properties: newProps };
            }
            return b;
        }));
        
        // Remove the slash if it was triggered by slash
        const block = blocks.find(b => b.id === id);
        if (block && block.content.endsWith('/')) {
             updateBlock(id, block.content.slice(0, -1));
        } else if (block && block.content === '/') {
             updateBlock(id, '');
        }

        setSlashMenu({ ...slashMenu, visible: false });
        focusBlock(id, 'end');
    };

    const handleFocusNav = (id: string, direction: 'up' | 'down') => {
        const idx = blocks.findIndex(b => b.id === id);
        if (direction === 'up' && idx > 0) {
            focusBlock(blocks[idx - 1].id, 'end');
        } else if (direction === 'down' && idx < blocks.length - 1) {
            focusBlock(blocks[idx + 1].id, 'end');
        }
    };

    const handleAIMagic = async (id: string, prompt: string) => {
        if (!prompt.trim()) return;
        
        // Show loading state
        updateBlock(id, 'Generating...', { loading: true });
        
        try {
            const ai = getAI();
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `You are an AI assistant in a note-taking app. The user asked: "${prompt}". Provide a concise and helpful response formatted in markdown.`,
            });
            
            const generatedText = response.text || '';
            
            // Replace the AI block with the generated text
            // For simplicity, we just convert it to a text block with the content
            setBlocks(prev => prev.map(b => b.id === id ? { ...b, type: 'text', content: generatedText, properties: {} } : b));
            focusBlock(id, 'end');
        } catch (error) {
            console.error("AI Generation Error:", error);
            updateBlock(id, 'Error generating content. Please try again.', { error: true });
        }
    };

    // Auto-Save Effect & History Push
    useEffect(() => {
        onSave({ ...page, blocks });
        
        // Debounce history push
        const timer = setTimeout(() => {
            if (blocks !== history[historyIndex]) {
                pushHistory(blocks);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [blocks]);

    // Drag & Drop
    const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedBlockId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault(); // Necessary for drop
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedBlockId || draggedBlockId === targetId) return;

        setBlocks(prev => {
            const items = [...prev];
            const dragIdx = items.findIndex(b => b.id === draggedBlockId);
            const targetIdx = items.findIndex(b => b.id === targetId);
            
            const [reorderedItem] = items.splice(dragIdx, 1);
            items.splice(targetIdx, 0, reorderedItem);
            return items;
        });
        setDraggedBlockId(null);
    };

    // --- SLASH MENU HANDLERS ---
    const handleMenuTrigger = (rect: DOMRect, blockId: string) => {
        setSlashMenu({
            visible: true,
            x: rect.left,
            y: rect.bottom + window.scrollY, // Adjust for scroll
            blockId,
            selectedIndex: 0
        });
    };

    const handleMenuNavigate = (direction: 'up' | 'down' | 'enter') => {
        if (!slashMenu.visible) return;
        
        if (direction === 'up') {
            setSlashMenu(prev => ({ ...prev, selectedIndex: Math.max(0, prev.selectedIndex - 1) }));
        } else if (direction === 'down') {
            setSlashMenu(prev => ({ ...prev, selectedIndex: Math.min(menuOptions.length - 1, prev.selectedIndex + 1) }));
        } else if (direction === 'enter') {
            if (slashMenu.blockId) {
                changeBlockType(slashMenu.blockId, menuOptions[slashMenu.selectedIndex].type);
            }
        }
    };

    // --- AI DEEP THINK ---
    // ... (Keep handleDeepThink logic)

    // --- RENDER ---
    return (
        <div className="flex-1 overflow-y-auto pb-40">
            <PageHeader 
                page={page} 
                onUpdatePage={(updates) => onSave({ ...page, ...updates })} 
            />

            <div className="max-w-4xl mx-auto px-4 md:px-12 relative">
                {/* AI Helper Button */}
                <div className="absolute right-4 top-0 hidden md:flex gap-2 z-50">
                    {onGenerateQuiz && (
                        <button 
                            onClick={() => onGenerateQuiz(page.title, blocks.map(b => b.content).join('\n'))}
                            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 text-purple-300 rounded-full text-xs font-bold hover:bg-purple-600/40 border border-purple-500/30 transition-all cursor-pointer relative z-50"
                            title="Tạo Quiz từ nội dung này (Flow: Note -> Alchemy -> Graph)"
                        >
                            <span className="material-symbols-outlined text-sm">quiz</span>
                            Create Quiz
                        </button>
                    )}
                    <button 
                        onClick={() => onAnalyzeAI && onAnalyzeAI(blocks.map(b => b.content).join('\n'))}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-300 rounded-full text-xs font-bold hover:bg-blue-600/40 border border-blue-500/30 transition-all cursor-pointer relative z-50"
                    >
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        AI Analyze
                    </button>
                </div>

                <div className="space-y-1">
                    {blocks.map(block => (
                        <div key={block.id} className="relative">
                            <BlockWrapper 
                                block={block}
                                onUpdate={updateBlock}
                                onAddBlock={addBlock}
                                onDelete={deleteBlock}
                                onFocusNext={(id) => handleFocusNav(id, 'down')}
                                onFocusPrev={(id) => handleFocusNav(id, 'up')}
                                onMerge={mergeWithPrev}
                                onTypeChange={changeBlockType}
                                isDraggable
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onMenuTrigger={(rect) => handleMenuTrigger(rect, block.id)}
                                onMenuClose={() => setSlashMenu({ ...slashMenu, visible: false })}
                                isMenuOpen={slashMenu.visible && slashMenu.blockId === block.id}
                                onMenuNavigate={handleMenuNavigate}
                                onAIMagic={handleAIMagic}
                            />
                        </div>
                    ))}
                </div>

                {/* Empty State / Bottom Catcher */}
                <div 
                    className="h-32 cursor-text" 
                    onClick={() => {
                        if (blocks.length === 0) addBlock('init', 'text');
                        else {
                            // Focus last block
                            const last = blocks[blocks.length-1];
                            focusBlock(last.id, 'end');
                        }
                    }}
                ></div>

                {/* FLOATING MENU PORTAL */}
                {floatingMenu.visible && (
                    <div 
                        className="fixed z-[100] bg-[#1e1e1e] border border-[#333] rounded-lg shadow-2xl p-1 flex items-center gap-1 animate-[fadeIn_0.1s_ease-out]"
                        style={{ top: floatingMenu.y, left: floatingMenu.x, transform: 'translateX(-50%)' }}
                    >
                        <button onMouseDown={e => e.preventDefault()} onClick={() => applyFormat('bold')} className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white" title="Bold (Ctrl+B)">
                            <span className="material-symbols-outlined text-[18px]">format_bold</span>
                        </button>
                        <button onMouseDown={e => e.preventDefault()} onClick={() => applyFormat('italic')} className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white" title="Italic (Ctrl+I)">
                            <span className="material-symbols-outlined text-[18px]">format_italic</span>
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <button onMouseDown={e => e.preventDefault()} onClick={() => applyFormat('foreColor', '#ef4444')} className="p-1.5 hover:bg-white/10 rounded text-red-400 hover:text-red-300" title="Red Color">
                            <span className="material-symbols-outlined text-[18px]">format_color_text</span>
                        </button>
                        <button onMouseDown={e => e.preventDefault()} onClick={() => applyFormat('foreColor', '#3b82f6')} className="p-1.5 hover:bg-white/10 rounded text-blue-400 hover:text-blue-300" title="Blue Color">
                            <span className="material-symbols-outlined text-[18px]">format_color_text</span>
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <button onMouseDown={e => e.preventDefault()} onClick={() => {
                            const url = prompt('Enter link URL:');
                            if (url) applyFormat('createLink', url);
                        }} className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white" title="Link">
                            <span className="material-symbols-outlined text-[18px]">link</span>
                        </button>
                    </div>
                )}

                {/* SLASH MENU PORTAL (Simplified as Absolute) */}
                {slashMenu.visible && (
                    <div 
                        className="fixed z-[100] bg-[#1e1e1e] border border-[#333] rounded-lg shadow-2xl p-1 w-60 overflow-hidden animate-[fadeIn_0.1s_ease-out]"
                        style={{ top: slashMenu.y + 5, left: slashMenu.x }}
                    >
                        <div className="text-[10px] font-bold text-slate-500 px-3 py-2 uppercase tracking-wider">Basic Blocks</div>
                        {menuOptions.map((item, index) => (
                            <button 
                                key={item.type}
                                onClick={() => slashMenu.blockId && changeBlockType(slashMenu.blockId, item.type)}
                                className={`w-full text-left px-3 py-2 rounded flex items-center gap-3 text-sm transition-colors ${
                                    index === slashMenu.selectedIndex 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-slate-300 hover:bg-white/10'
                                }`}
                                onMouseEnter={() => setSlashMenu(prev => ({ ...prev, selectedIndex: index }))}
                            >
                                <div className="p-1 bg-white/10 rounded border border-white/5">
                                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                                </div>
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
