
import React, { useRef, useEffect, useState } from 'react';
import { NoteBlock, BlockType } from '../../types';
import { useDataSync } from '../Drive-MoveItems/DataSyncLogic';

// --- MERMAID BLOCK COMPONENT ---
// Dynamically loads mermaid from CDN to avoid huge bundle or install issues in restricted env
const MermaidBlock: React.FC<{ content: string; onUpdate: (newContent: string) => void }> = ({ content, onUpdate }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [renderError, setRenderError] = useState<string | null>(null);

    useEffect(() => {
        if (!isEditing && containerRef.current) {
            setRenderError(null);
            // Load mermaid from CDN if not already loaded
            if (!(window as any).mermaid) {
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
                script.onload = () => {
                    (window as any).mermaid.initialize({ startOnLoad: false, theme: 'dark' });
                    renderMermaid();
                };
                document.head.appendChild(script);
            } else {
                renderMermaid();
            }
        }
    }, [content, isEditing]);

    const renderMermaid = async () => {
        try {
            if (containerRef.current && (window as any).mermaid) {
                const id = `mermaid-${Date.now()}`;
                const { svg } = await (window as any).mermaid.render(id, content);
                containerRef.current.innerHTML = svg;
            }
        } catch (error) {
            console.error("Mermaid Render Error", error);
            setRenderError("Cú pháp không hợp lệ. Chuyển sang chế độ sửa để kiểm tra.");
            // Fallback: show raw content if render fails
            if (containerRef.current) containerRef.current.innerHTML = '';
        }
    };

    return (
        <div className="relative group/mermaid my-2">
            {!isEditing ? (
                <div 
                    className="p-4 bg-[#0d1117] rounded-lg border border-cyan-500/30 flex justify-center items-center min-h-[100px] cursor-pointer hover:border-cyan-500 transition-colors relative"
                    onClick={() => setIsEditing(true)}
                >
                    <div ref={containerRef} className="w-full overflow-x-auto flex justify-center"></div>
                    {renderError && <div className="text-red-400 text-xs font-mono absolute bottom-2">{renderError}</div>}
                    <div className="absolute top-2 right-2 opacity-0 group-hover/mermaid:opacity-100 transition-opacity bg-black/60 px-2 py-1 rounded text-xs text-white">Click to Edit</div>
                </div>
            ) : (
                <div className="bg-[#0d1117] rounded-lg border border-cyan-500/50 p-2">
                    <div className="flex justify-between items-center mb-2 px-2">
                        <span className="text-xs font-bold text-cyan-400">Mermaid Editor</span>
                        <button onClick={() => setIsEditing(false)} className="text-xs bg-cyan-600 text-white px-3 py-1 rounded hover:bg-cyan-500">Render</button>
                    </div>
                    <textarea 
                        autoFocus
                        className="w-full h-40 bg-transparent text-slate-300 font-mono text-sm resize-y outline-none p-2"
                        value={content}
                        onChange={(e) => onUpdate(e.target.value)}
                        placeholder="graph TD; A-->B;"
                    />
                </div>
            )}
        </div>
    );
};

// --- DRIVE FILE BLOCK COMPONENT ---
const DriveFileBlock: React.FC<{ block: NoteBlock; onUpdate: (id: string, content: string, properties?: any) => void }> = ({ block, onUpdate }) => {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useDataSync((data) => {
        if (data.type === 'file_updated' && data.fileId === block.properties?.fileId) {
            setFileContent(data.content);
        }
    });

    useEffect(() => {
        const fetchFile = async () => {
            if (!block.properties?.fileId) return;
            setLoading(true);
            try {
                // In a real app, this would fetch from Google Drive API or our backend
                // For now, we simulate fetching content or use existing content if available
                const response = await fetch(`/api/alchemy/storage/items`);
                if (response.ok) {
                    const items = await response.json();
                    const item = items.find((i: any) => i._id === block.properties.fileId || i.title === block.properties.fileName);
                    if (item) {
                        setFileContent(item.extractedText || item.originalContent || 'No content available.');
                    } else {
                        setFileContent('File content not found in storage.');
                    }
                }
            } catch (error) {
                console.error("Error fetching drive file:", error);
                setFileContent('Error loading file content.');
            } finally {
                setLoading(false);
            }
        };

        if (isExpanded && !fileContent) {
            fetchFile();
        }
    }, [block.properties?.fileId, block.properties?.fileName, isExpanded, fileContent]);

    return (
        <div className="my-2 border border-blue-500/30 rounded-lg overflow-hidden bg-[#0d1117]">
            <div 
                className="flex items-center justify-between p-3 bg-blue-900/20 cursor-pointer hover:bg-blue-900/30 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-400">drive_file_move</span>
                    <span className="font-medium text-blue-100">{block.properties?.fileName || 'Unknown File'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 bg-blue-900/50 px-2 py-1 rounded">Google Drive</span>
                    <span className="material-symbols-outlined text-blue-400 text-sm">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                </div>
            </div>
            
            {isExpanded && (
                <div className="p-4 border-t border-blue-500/20">
                    {loading ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                        </div>
                    ) : (
                        <div className="text-slate-300 text-sm whitespace-pre-wrap font-serif max-h-[400px] overflow-y-auto custom-scrollbar">
                            {fileContent}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- BLOCK WRAPPER ---
interface BlockWrapperProps {
    block: NoteBlock;
    onUpdate: (id: string, content: string, properties?: any) => void;
    onAddBlock: (afterId: string, type?: BlockType, properties?: any) => void;
    onDelete: (id: string) => void;
    onFocusNext: (id: string) => void;
    onFocusPrev: (id: string) => void;
    onMerge: (id: string) => void;
    onTypeChange: (id: string, type: BlockType) => void;
    isDraggable?: boolean;
    onDragStart?: (e: React.DragEvent, id: string) => void;
    onDragOver?: (e: React.DragEvent, id: string) => void;
    onDrop?: (e: React.DragEvent, id: string) => void;
    onMenuTrigger?: (rect: DOMRect) => void;
    onMenuClose?: () => void;
    isMenuOpen?: boolean;
    onMenuNavigate?: (direction: 'up' | 'down' | 'enter') => void;
    onAIMagic?: (id: string, prompt: string) => void;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({ 
    block, onUpdate, onAddBlock, onDelete, onFocusNext, onFocusPrev, onMerge, onTypeChange,
    isDraggable, onDragStart, onDragOver, onDrop, onMenuTrigger, onMenuClose, isMenuOpen, onMenuNavigate, onAIMagic
}) => {
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (isMenuOpen && onMenuNavigate) {
            if (e.key === 'ArrowUp') { e.preventDefault(); onMenuNavigate('up'); return; }
            if (e.key === 'ArrowDown') { e.preventDefault(); onMenuNavigate('down'); return; }
            if (e.key === 'Enter') { e.preventDefault(); onMenuNavigate('enter'); return; }
            if (e.key === 'Escape') { e.preventDefault(); onMenuClose && onMenuClose(); return; }
        }

        // --- SHORTCUTS FOR FORMATTING ---
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'b') {
                e.preventDefault();
                document.execCommand('bold');
                return;
            }
            if (e.key === 'i') {
                e.preventDefault();
                document.execCommand('italic');
                return;
            }
            if (e.key === 'u') {
                e.preventDefault();
                document.execCommand('underline');
                return;
            }
            // Transform Shortcuts
            if (e.key === '1') { e.preventDefault(); onTypeChange(block.id, 'h1'); return; }
            if (e.key === '2') { e.preventDefault(); onTypeChange(block.id, 'h2'); return; }
            if (e.key === '3') { e.preventDefault(); onTypeChange(block.id, 'h3'); return; }
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (block.type === 'ai_magic' && onAIMagic) {
                onAIMagic(block.id, block.content);
            } else if (['numbered', 'bullet', 'todo'].includes(block.type) && block.content.trim() === '') {
                // If empty list item, convert back to text
                onTypeChange(block.id, 'text');
            } else if (block.type === 'numbered') {
                onAddBlock(block.id, 'numbered', { number: (block.properties?.number || 1) + 1 });
            } else if (block.type === 'bullet') {
                onAddBlock(block.id, 'bullet');
            } else if (block.type === 'todo') {
                onAddBlock(block.id, 'todo');
            } else {
                onAddBlock(block.id);
            }
        }
        if (e.key === 'Backspace') {
            const selection = window.getSelection();
            if (selection && selection.anchorOffset === 0 && selection.isCollapsed) {
                // If at start of block, merge with previous
                if (block.content.length === 0) {
                     e.preventDefault();
                     onDelete(block.id);
                } else {
                     onMerge(block.id);
                }
            }
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            onFocusPrev(block.id);
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            onFocusNext(block.id);
        }
        
        if (e.key === '/') {
            // Wait for render to get rect
            setTimeout(() => {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    onMenuTrigger && onMenuTrigger(rect);
                }
            }, 0);
        }
    };

    const handleChange = (content: string) => {
        // Markdown shortcuts
        if (block.type === 'text') {
            if (content === '# ') { onTypeChange(block.id, 'h1'); onUpdate(block.id, ''); return; }
            if (content === '## ') { onTypeChange(block.id, 'h2'); onUpdate(block.id, ''); return; }
            if (content === '### ') { onTypeChange(block.id, 'h3'); onUpdate(block.id, ''); return; }
            if (content === '- ' || content === '* ') { onTypeChange(block.id, 'bullet'); onUpdate(block.id, ''); return; }
            if (content === '1. ') { onTypeChange(block.id, 'numbered'); onUpdate(block.id, '', { number: 1 }); return; }
            if (content === '[] ') { onTypeChange(block.id, 'todo'); onUpdate(block.id, ''); return; }
            if (content === '> ') { onTypeChange(block.id, 'quote'); onUpdate(block.id, ''); return; }
            if (content === '---') { onTypeChange(block.id, 'divider'); onUpdate(block.id, ''); return; }
        }

        // Bold and Italic markdown replacement
        let newContent = content;
        if (/\*\*(.*?)\*\*/.test(newContent)) {
            newContent = newContent.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        }
        if (/\*(.*?)\*/.test(newContent) && !/\*\*(.*?)\*\*/.test(content)) {
            newContent = newContent.replace(/\*(.*?)\*/g, '<i>$1</i>');
        }

        onUpdate(block.id, newContent);
        if (!newContent.includes('/')) {
            onMenuClose && onMenuClose();
        }
    };

    return (
        <div 
            className="group relative flex items-start -ml-8 pl-8 py-1 pr-4 rounded-md hover:bg-white/5 transition-colors"
            draggable={isDraggable}
            onDragStart={(e) => onDragStart && onDragStart(e, block.id)}
            onDragOver={(e) => onDragOver && onDragOver(e, block.id)}
            onDrop={(e) => onDrop && onDrop(e, block.id)}
        >
            {/* Drag Handle & Add Button */}
            <div className="absolute left-0 top-1.5 flex items-center opacity-0 group-hover:opacity-100 transition-opacity select-none" contentEditable={false}>
                <button 
                    onClick={() => onAddBlock(block.id)}
                    className="p-0.5 text-slate-500 hover:text-white hover:bg-white/10 rounded cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
                <div 
                    className="p-0.5 text-slate-500 hover:text-white cursor-grab active:cursor-grabbing"
                    title="Drag to move"
                >
                    <span className="material-symbols-outlined text-[16px]">drag_indicator</span>
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <BlockContent 
                    block={block} 
                    onChange={handleChange} 
                    onKeyDown={handleKeyDown} 
                    onUpdate={onUpdate}
                />
            </div>
        </div>
    );
};

// --- CONTENT BLOCKS ---

const BlockContent: React.FC<{
    block: NoteBlock;
    onChange: (content: string) => void;
    onKeyDown: (e: any) => void;
    onUpdate: (id: string, content: string, properties?: any) => void;
}> = ({ block, onChange, onKeyDown, onUpdate }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    // This effect ensures the content is synced from props using innerHTML to support Bold tags.
    useEffect(() => {
        // Use innerHTML check to allow bold tags to be rendered
        if (contentRef.current && contentRef.current.innerHTML !== block.content && block.type !== 'mermaid') {
            // Only update DOM if it's different and we are NOT the active element to avoid cursor jumps
            if (document.activeElement !== contentRef.current) {
                contentRef.current.innerHTML = block.content;
            }
        }
    }, [block.content, block.type]);

    // Handle input event directly from DOM
    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        // Use innerHTML to preserve bold tags if user types
        const text = e.currentTarget.innerHTML;
        onChange(text);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'A') {
            const href = target.getAttribute('href');
            if (href) {
                window.open(href, '_blank', 'noopener,noreferrer');
            }
        }
    };

    const commonProps = {
        id: `block-content-${block.id}`,
        ref: contentRef,
        contentEditable: true,
        suppressContentEditableWarning: true,
        onInput: handleInput,
        onKeyDown: onKeyDown,
        onClick: handleClick,
    };

    switch (block.type) {
        case 'h1':
            return (
                <div
                    {...commonProps}
                    className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-600 pb-2"
                    data-placeholder="Heading 1"
                />
            );
        case 'h2':
            return (
                <div
                    {...commonProps}
                    className="text-2xl font-bold text-white mt-4 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-600 border-b border-white/10 pb-1"
                    data-placeholder="Heading 2"
                />
            );
        case 'h3':
            return (
                <div
                    {...commonProps}
                    className="text-xl font-bold text-white mt-2 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-600"
                    data-placeholder="Heading 3"
                />
            );
        case 'todo':
            return (
                <div className="flex items-start gap-3">
                    <input 
                        type="checkbox" 
                        checked={block.properties?.checked || false}
                        onChange={(e) => onUpdate(block.id, block.content, { checked: e.target.checked })}
                        className="mt-1.5 w-4 h-4 rounded border-slate-500 bg-transparent checked:bg-sky-500 focus:ring-0 cursor-pointer"
                    />
                    <div
                        {...commonProps}
                        className={`flex-1 outline-none text-slate-200 ${block.properties?.checked ? 'line-through text-slate-500' : ''}`}
                        data-placeholder="To-do"
                    />
                </div>
            );
        case 'bullet':
            return (
                <div className="flex items-start gap-3">
                    <span className="text-xl text-slate-400 leading-6">•</span>
                    <div
                        {...commonProps}
                        className="flex-1 outline-none text-slate-200"
                        data-placeholder="List item"
                    />
                </div>
            );
        case 'quote':
            return (
                <div className="flex gap-4 pl-4 border-l-4 border-amber-500/50 bg-amber-900/10 py-2 pr-2 rounded-r-lg">
                    <div
                        {...commonProps}
                        className="flex-1 outline-none text-amber-100 italic text-lg"
                        data-placeholder="Empty quote"
                    />
                </div>
            );
        case 'code':
            return (
                <div className="bg-[#0b1120] p-4 rounded-lg font-mono text-sm border border-white/10 relative group/code">
                    <div className="absolute top-2 right-2 text-xs text-slate-500 select-none" contentEditable={false}>Code</div>
                    <div
                        {...commonProps}
                        className="outline-none text-green-400 whitespace-pre-wrap"
                        data-placeholder="// Write code here"
                    />
                </div>
            );
        case 'numbered':
            return (
                <div className="flex items-start gap-3">
                    <span className="text-slate-400 font-mono mt-0.5">{block.properties?.number || 1}.</span>
                    <div
                        {...commonProps}
                        className="flex-1 outline-none text-slate-200"
                        data-placeholder="List item"
                    />
                </div>
            );
        case 'divider':
            return (
                <div className="py-4 cursor-pointer" onClick={() => onUpdate(block.id, '', {})} >
                    <hr className="border-white/10" />
                </div>
            );
        case 'table':
            return (
                <div className="my-4 overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-white/10">
                        <tbody>
                            <tr>
                                <td className="border border-white/10 p-2"><div {...commonProps} className="outline-none" data-placeholder="Cell" /></td>
                                <td className="border border-white/10 p-2"><div contentEditable className="outline-none" data-placeholder="Cell" /></td>
                            </tr>
                            <tr>
                                <td className="border border-white/10 p-2"><div contentEditable className="outline-none" data-placeholder="Cell" /></td>
                                <td className="border border-white/10 p-2"><div contentEditable className="outline-none" data-placeholder="Cell" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        case 'callout':
            return (
                <div className="flex gap-4 p-4 my-2 border border-blue-500/30 bg-blue-900/10 rounded-lg">
                    <span className="material-symbols-outlined text-blue-400">lightbulb</span>
                    <div
                        {...commonProps}
                        className="flex-1 outline-none text-blue-100"
                        data-placeholder="Type something important..."
                    />
                </div>
            );
        case 'ai_magic':
            return (
                <div className="flex gap-4 p-4 my-2 border border-purple-500/50 bg-purple-900/20 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <span className="material-symbols-outlined text-purple-400 animate-pulse">auto_awesome</span>
                    <div
                        {...commonProps}
                        className="flex-1 outline-none text-purple-100 font-medium"
                        data-placeholder="Ask AI to write something..."
                    />
                </div>
            );
        case 'mermaid':
            return (
                <MermaidBlock 
                    content={block.content} 
                    onUpdate={(newContent) => onUpdate(block.id, newContent)} 
                />
            );
        case 'image':
             return (
                <div className="my-2">
                    {block.properties?.imageUrl ? (
                        <div className="relative group/img max-w-full">
                            <img src={block.properties.imageUrl} alt="Block media" className="rounded-lg max-h-[500px] object-contain border border-white/10" />
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/img:opacity-100 transition-opacity" contentEditable={false}>
                                <button onClick={() => onUpdate(block.id, block.content, { imageUrl: '' })} className="bg-black/50 text-white p-1 rounded hover:bg-red-500">
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                            <input 
                                type="text"
                                className="w-full bg-transparent text-center text-xs text-slate-500 mt-1 outline-none"
                                placeholder="Write a caption..."
                                value={block.properties.caption || ''}
                                onChange={(e) => onUpdate(block.id, block.content, { ...block.properties, caption: e.target.value })}
                            />
                        </div>
                    ) : (
                        <div className="h-32 bg-white/5 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-white/10 transition-colors cursor-pointer relative">
                            <span className="material-symbols-outlined text-3xl mb-2">image</span>
                            <span className="text-sm">Add an image</span>
                            <input 
                                type="text" 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onClick={(e) => {
                                    const url = prompt("Enter image URL:");
                                    if(url) onUpdate(block.id, block.content, { imageUrl: url });
                                }}
                            />
                        </div>
                    )}
                </div>
             );
        case 'drive_file':
            return (
                <DriveFileBlock 
                    block={block} 
                    onUpdate={onUpdate} 
                />
            );
        default: // 'text'
            return (
                <div
                    {...commonProps}
                    className="outline-none text-slate-200 min-h-[1.5em] empty:before:content-[attr(data-placeholder)] empty:before:text-slate-600"
                    data-placeholder='Type "/" for commands'
                />
            );
    }
}
