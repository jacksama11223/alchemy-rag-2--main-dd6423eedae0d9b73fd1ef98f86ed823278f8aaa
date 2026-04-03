
// ... (imports remain same)
import React, { useState, useEffect, useRef } from 'react';
import { NotePage, FileSystemType, NoteBlock, BlockType } from '../types'; 
import { NoteSidebar } from './NoteLab/NoteSidebar';
import { EditorCore } from './NoteLab/EditorCore';
import { FolderView } from './NoteLab/FolderView';
import { Breadcrumbs } from './NoteLab/Breadcrumbs';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { formatDriveNoteContent } from './NoteLab/DriveNote'; 
import { getNotesFromBackend, saveNoteToBackend, deleteNoteFromBackend, getCurrentUser } from '../services/mockBackend';
import { FeatureWindowControls } from './FeatureWindowControls';
import { useDndActionStore } from '../stores/dndActionStore';
import { DroppableZone } from './DroppableZone';

import { AssetPickerModal } from './AssetPickerModal';
import { handleIncomingData, IncomingAsset } from '../utils/dataProcessor';

import { ContextualDropZone } from './ContextualDropZone';
import { AnimatePresence, motion } from 'framer-motion';
import { useDataSync } from './Drive-MoveItems/DataSyncLogic';

// Initialize AI
const getAI = () => {
    const customKey = localStorage.getItem('custom_gemini_api_key');
    return new GoogleGenAI({ apiKey: customKey || process.env.API_KEY || '' });
};

interface NoteTakingProps {
    onBack: () => void;
    onShowAbout: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    onAnalyzeNote?: (content: string) => void;
    onToggleTodo?: () => void;
    // Add navigation prop to link to other features
    onNavigateToFeature?: (feature: string, params?: any) => void; 
    intent?: any;
    onClearIntent?: () => void;
}

// ... (NoteLabOceanBackground remains same) ...
const NoteLabOceanBackground: React.FC = () => {
    // ... (Keep existing canvas logic - no changes needed here)
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const PARTICLES = 60;
        const particles: any[] = [];

        // Ink-like particles
        for (let i = 0; i < PARTICLES; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 3 + 1,
                speedY: Math.random() * 0.2 + 0.05,
                speedX: (Math.random() - 0.5) * 0.1,
                opacity: Math.random() * 0.3 + 0.1,
                color: Math.random() > 0.5 ? '165, 243, 252' : '147, 197, 253' // Cyan to Blue
            });
        }

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            // Deep Ocean/Ink Gradient
            const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
            gradient.addColorStop(0, '#0f172a'); // Center Slate
            gradient.addColorStop(1, '#020617'); // Outer Dark
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Draw Flowing Lines (Ink currents)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < width; i += 50) {
                ctx.moveTo(i, 0);
                ctx.bezierCurveTo(i + 50, height / 2, i - 50, height / 2, i, height);
            }
            ctx.stroke();

            // Draw Particles
            particles.forEach(p => {
                // Mouse Interaction
                const dx = p.x - mouseRef.current.x;
                const dy = p.y - mouseRef.current.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    p.x += (dx / dist) * force * 0.5;
                    p.y += (dy / dist) * force * 0.5;
                }

                p.y -= p.speedY;
                p.x += p.speedX;

                // Reset
                if (p.y < -10) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        const animId = requestAnimationFrame(animate);

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

const NoteTaking: React.FC<NoteTakingProps> = ({ 
    onBack, onShowAccount, onAnalyzeNote, onToggleTodo, onNavigateToFeature, intent, onClearIntent 
}) => {
    const [pages, setPages] = useState<NotePage[]>([]);
    const [activePageId, setActivePageId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isHubOpen, setIsHubOpen] = useState(true); // Right Sidebar
    const [isLoading, setIsLoading] = useState(true);
    
    // AI Analysis State
    const [isThinking, setIsThinking] = useState(false);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    
    // Ref for Debounced Saving
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pendingSaveRef = useRef<NotePage | null>(null);

    const { syncData } = useDataSync((data) => {
        if (data.type === 'note_updated') {
            setPages(prev => prev.map(p => p.id === data.page.id ? data.page : p));
        }
    });

    const handleAssetSelect = (asset: IncomingAsset) => {
        const { noteActions } = useDndActionStore.getState();
        if (noteActions) {
            handleIncomingData(asset, 'NOTE', noteActions);
        }
    };

    // --- HELPER: Parse Markdown to Blocks ---
    const parseMarkdownToBlocks = (text: string): NoteBlock[] => {
        // ... (Keep existing parser logic)
        const blocks: NoteBlock[] = [];
        const mermaidRegex = /```mermaid([\s\S]*?)```/g;
        let match;
        let lastIndex = 0;
        
        const processTextSegment = (segment: string) => {
            const lines = segment.split('\n');
            lines.forEach(line => {
                const trimmed = line.trim();
                if (!trimmed) return;
                
                let type: BlockType = 'text';
                let content = line;

                if (line.startsWith('# ')) { type = 'h1'; content = line.substring(2); }
                else if (line.startsWith('## ')) { type = 'h2'; content = line.substring(3); }
                else if (line.startsWith('### ')) { type = 'h3'; content = line.substring(4); }
                else if (line.startsWith('- ') || line.startsWith('* ')) { type = 'bullet'; content = line.substring(2); }

                content = content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                content = content.replace(/\*(.*?)\*/g, '<i>$1</i>');
                
                blocks.push({ id: Date.now().toString() + Math.random(), type, content });
            });
        };

        while ((match = mermaidRegex.exec(text)) !== null) {
             const before = text.substring(lastIndex, match.index);
             processTextSegment(before);
             
             blocks.push({ 
                 id: Date.now().toString() + Math.random(), 
                 type: 'mermaid', 
                 content: match[1].trim() 
             });
             
             lastIndex = mermaidRegex.lastIndex;
        }
        
        if (lastIndex < text.length) {
            processTextSegment(text.substring(lastIndex));
        }

        if (blocks.length === 0) {
            blocks.push({ id: 'init', type: 'text', content: '' });
        }

        return blocks;
    };

    // --- PERSISTENCE ---
    useEffect(() => {
        const loadNotes = async () => {
            setIsLoading(true);
            const data = await getNotesFromBackend();
            if (data.length === 0) {
                // Init default if empty
                const initNote: NotePage = {
                    id: Date.now().toString(), // Client ID for fallback
                    parentId: null,
                    type: 'note',
                    title: 'Chào mừng đến NoteLab',
                    icon: '👋',
                    coverImage: null,
                    blocks: [
                        { id: 'b1', type: 'h1', content: 'Trung tâm chỉ huy tri thức' },
                        { id: 'b2', type: 'text', content: 'Viết, suy nghĩ và kết nối với toàn bộ hệ sinh thái học tập.' },
                    ],
                    updatedAt: new Date()
                };
                const created = await saveNoteToBackend(initNote);
                if(created) {
                    setPages([created]);
                    setActivePageId(created.id);
                }
            } else {
                setPages(data);
                if (!activePageId) setActivePageId(data[0].id);
            }
            setIsLoading(false);
        };
        loadNotes();
    }, []);

    // --- INTENT HANDLING ---
    useEffect(() => {
        if (intent && intent.label) {
            const rawContent = intent.data || "";
            const contentString = formatDriveNoteContent(rawContent);
            const blocks = parseMarkdownToBlocks(contentString);
            
            const newNote: NotePage = {
                id: Date.now().toString(), // Client ID for fallback
                parentId: null,
                type: 'note',
                title: intent.label || 'New AI Note',
                icon: '🤖',
                coverImage: null,
                blocks: blocks,
                updatedAt: new Date(),
                isExpanded: true
            };
            
            saveNoteToBackend(newNote).then(saved => {
                if(saved) {
                    setPages(prev => [saved, ...prev]);
                    setActivePageId(saved.id);
                }
            });
            
            if (onClearIntent) onClearIntent();
        }
    }, [intent]);

    // Save Logic - Single Source of Truth is now Backend via saveNoteToBackend
    // We update local state optimistically or after response
    
    // ... (Keep handleCreatePage, handleDeletePage, handleUpdatePage, handleToggleExpand) ...
    const handleCreatePage = async (parentId: string | null, type: FileSystemType) => {
        const currentUser = getCurrentUser();
        // Allow creating if logged in or fallback
        
        const newPage: NotePage = {
            id: Date.now().toString(), // Use client-side ID for robust fallback
            parentId,
            type,
            title: '',
            icon: type === 'folder' ? '📁' : type === 'project' ? '🚀' : '📄',
            coverImage: type === 'project' ? 'linear-gradient(to right, #6a11cb, #2575fc)' : null,
            blocks: [{ id: Date.now().toString() + 'b', type: 'text', content: '' }],
            updatedAt: new Date(),
            isExpanded: true,
            projectMetadata: type === 'project' ? { status: 'planning', progress: 0 } : undefined
        };
        
        const created = await saveNoteToBackend(newPage);
        if (created) {
            setPages(prev => [...prev, created]);
            setActivePageId(created.id);
            if (parentId) handleToggleExpand(parentId, true);
        }
    };

    const handleDeletePage = async (id: string) => {
        if (confirm("Xóa trang này và các trang con?")) {
            const success = await deleteNoteFromBackend(id);
            if (success) {
                // Optimistic Update: Remove from local state
                const data = await getNotesFromBackend();
                setPages(data);
                if (activePageId === id) setActivePageId(data.length > 0 ? data[0].id : null);
            } else {
                alert("Lỗi xóa ghi chú.");
            }
        }
    };

    const handleUpdatePage = (updatedPage: NotePage) => {
        // 1. Optimistic local state update (Instant UI)
        setPages(prev => prev.map(p => p.id === updatedPage.id ? updatedPage : p));
        
        // 2. Track pending changes for flush-on-close
        pendingSaveRef.current = updatedPage;

        // 3. Debounce the backend/RAG sync (3 seconds)
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        
        saveTimerRef.current = setTimeout(async () => {
            await commitPendingSave();
        }, 3000);
    };

    const commitPendingSave = async () => {
        if (!pendingSaveRef.current) return;
        
        const pageToSave = pendingSaveRef.current;
        pendingSaveRef.current = null;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

        console.log(`[NoteTaking] Committing save for: ${pageToSave.title}`);
        await saveNoteToBackend(pageToSave);
        syncData({ type: 'note_updated', page: pageToSave });
    };

    // Flush pending save whenever active page changes or component unmounts
    useEffect(() => {
        return () => {
            if (pendingSaveRef.current) {
                commitPendingSave();
            }
        };
    }, [activePageId]);

    const handleAttachFile = async (fileId: string, fileName: string) => {
        const newBlock: NoteBlock = {
            id: Date.now().toString(),
            type: 'drive_file',
            content: '',
            properties: { fileId, fileName }
        };

        if (!activePageId) {
            // Create a new note if no active page
            const newPage: NotePage = {
                id: Date.now().toString(),
                title: `Ghi chú từ file: ${fileName}`,
                icon: '📄',
                type: 'note',
                parentId: null,
                blocks: [newBlock],
                isExpanded: true,
                updatedAt: new Date(),
            };
            
            setPages(prev => [...prev, newPage]);
            setActivePageId(newPage.id);
            
            const saved = await saveNoteToBackend(newPage);
            if (saved) {
                setPages(prev => prev.map(p => p.id === newPage.id ? saved : p));
                setActivePageId(saved.id);
                syncData({ type: 'note_updated', page: saved });
            }
            return;
        }

        const page = pages.find(p => p.id === activePageId);
        if (!page) return;

        const updatedPage = {
            ...page,
            blocks: [...page.blocks, newBlock],
            updatedAt: new Date()
        };

        await handleUpdatePage(updatedPage);
    };

    const handleToggleExpand = (id: string, forceState?: boolean) => {
        setPages(prev => prev.map(p => {
            if (p.id === id) {
                const newState = forceState !== undefined ? forceState : !p.isExpanded;
                // We should also persist this expansion state preference if desired
                const updated = { ...p, isExpanded: newState };
                saveNoteToBackend(updated); // Background save
                return updated;
            }
            return p;
        }));
    };

    // --- AI DEEP THINK ---
    const handleDeepThink = async () => {
        // ... (Keep existing logic)
        const activePage = pages.find(p => p.id === activePageId);
        if (!activePage || !activePage.blocks) return;

        const content = activePage.blocks.map(b => b.content).join('\n');
        if (!content.trim()) {
            alert("Ghi chú trống! Hãy viết gì đó trước.");
            return;
        }

        setIsThinking(true);
        setAiInsight(null);
        
        try {
            const ai = getAI();
            const prompt = `Analyze this note deeply. Identify logical gaps, suggest related concepts, and propose a structure to improve it.
            Note Content:
            ${content.substring(0, 5000)}
            
            Output format: Markdown with bold headings.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3.1-pro-preview',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } 
                }
            });

            setAiInsight(response.text || "Không có phản hồi.");
        } catch (error) {
            console.error(error);
            setAiInsight("Lỗi kết nối AI. Vui lòng thử lại.");
        } finally {
            setIsThinking(false);
        }
    };

    const setNoteActions = useDndActionStore(state => state.setNoteActions);
    useEffect(() => {
        setNoteActions({
            appendNoteContent: async (content: string) => {
                const activePage = pages.find(p => p.id === activePageId);
                const newBlock: NoteBlock = { id: Date.now().toString(), type: 'text', content };
                if (activePage) {
                    const updatedPage = { ...activePage, blocks: [...activePage.blocks, newBlock] };
                    handleUpdatePage(updatedPage);
                } else {
                    const newPage: NotePage = {
                        id: Date.now().toString(),
                        title: `Ghi chú mới`,
                        icon: '📄',
                        type: 'note',
                        parentId: null,
                        blocks: [newBlock],
                        isExpanded: true,
                        updatedAt: new Date(),
                    };
                    setPages(prev => [...prev, newPage]);
                    setActivePageId(newPage.id);
                    const saved = await saveNoteToBackend(newPage);
                    if (saved) {
                        setPages(prev => prev.map(p => p.id === newPage.id ? saved : p));
                        setActivePageId(saved.id);
                    }
                }
            },
            attachCanvasToNote: async (canvasId: string, imageUrl: string) => {
                const activePage = pages.find(p => p.id === activePageId);
                const newBlock: NoteBlock = { id: Date.now().toString(), type: 'image', content: imageUrl };
                if (activePage) {
                    const updatedPage = { ...activePage, blocks: [...activePage.blocks, newBlock] };
                    handleUpdatePage(updatedPage);
                } else {
                    const newPage: NotePage = {
                        id: Date.now().toString(),
                        title: `Ghi chú từ bản vẽ`,
                        icon: '📄',
                        type: 'note',
                        parentId: null,
                        blocks: [newBlock],
                        isExpanded: true,
                        updatedAt: new Date(),
                    };
                    setPages(prev => [...prev, newPage]);
                    setActivePageId(newPage.id);
                    const saved = await saveNoteToBackend(newPage);
                    if (saved) {
                        setPages(prev => prev.map(p => p.id === newPage.id ? saved : p));
                        setActivePageId(saved.id);
                    }
                }
            },
            attachFile: (fileId: string, fileName: string) => {
                handleAttachFile(fileId, fileName);
            }
        });
        return () => setNoteActions(null);
    }, [pages, activePageId]);

    // --- NEW: HANDLE GENERATE QUIZ FLOW ---
    const handleGenerateQuiz = (title: string, content: string) => {
        if (!content.trim()) {
            alert("Vui lòng viết nội dung trước khi tạo Quiz.");
            return;
        }

        if (onNavigateToFeature) {
            // Trigger Alchemy with specific intent for Quiz generation
            onNavigateToFeature('alchemy', { 
                type: 'quiz', // This type must be handled in Alchemy
                initialQuery: content,
                label: title // Pass title to label
            });
        } else {
            console.warn("Navigation prop missing for Quiz flow.");
        }
    };

    // --- ECOSYSTEM INTEGRATION ACTIONS ---
    const handleIntegrate = (target: string) => {
        const activePage = pages.find(p => p.id === activePageId);
        if (!activePage) return;
        const content = activePage.blocks.map(b => b.content).join('\n');

        if (!onNavigateToFeature) {
            console.warn("Navigation prop missing");
            return;
        }

        switch (target) {
            case 'alchemy':
                onNavigateToFeature('alchemy', { type: 'create', initialQuery: content });
                break;
            case 'tutor':
                onNavigateToFeature('tutor', { context: `I am writing a note about "${activePage.title}". Here is the content:\n${content}\n\nPlease critique it.` });
                break;
            case 'graph':
                // In real app, this would create a node via API
                alert("Đã tạo Node mới trên Sơ đồ tri thức từ ghi chú này!");
                onNavigateToFeature('explore-graph');
                break;
            case 'draw':
                onNavigateToFeature('draw');
                break;
            case 'digest':
                 onNavigateToFeature('digest');
                 break;
            case 'drive':
                 onNavigateToFeature('drive');
                 break;
            case 'community':
                 onNavigateToFeature('community');
                 break;
             case 'dashboard':
                 onNavigateToFeature('dashboard');
                 break;
        }
    };

    // --- DERIVED STATE ---
    const activePage = pages.find(p => p.id === activePageId);
    const activeChildren = pages.filter(p => p.parentId === activePageId);

    const activeDragItem = useDndActionStore(state => state.activeDragItem);
    const isDraggingFile = activeDragItem?.dataType === 'FILE_ASSET';
    const isDraggingDrawing = activeDragItem?.dataType === 'DRAWING_CANVAS';
    const isDraggingText = activeDragItem?.dataType === 'TEXT_NOTE' || activeDragItem?.dataType === 'AI_RESPONSE' || activeDragItem?.dataType === 'HTML_SNIPPET';
    const showDropZones = isDraggingFile || isDraggingDrawing || isDraggingText;

    return (
        <DroppableZone id="note-droppable" type="NOTE" className="flex h-screen bg-[#020617] text-slate-200 font-display overflow-hidden relative">
            <NoteLabOceanBackground />
            
            <style>{`
                .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
                [contenteditable]:empty:before { content: attr(data-placeholder); color: #64748b; cursor: text; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .glass-panel { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05); }
                .hub-btn { @apply flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 transition-all text-sm font-medium text-slate-300 hover:text-white; }
            `}</style>

            <div className={`relative z-10 flex h-full w-full transition-all duration-300 ${showDropZones ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
                {/* LEFT SIDEBAR */}
                <NoteSidebar 
                    isOpen={isSidebarOpen}
                    pages={pages}
                    activePageId={activePageId}
                    onSelectPage={setActivePageId}
                    onCreatePage={handleCreatePage}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    onBack={onBack}
                    onDeletePage={handleDeletePage}
                    onToggleExpand={handleToggleExpand}
                />

                {/* MAIN CONTENT */}
                <main className="flex-1 flex flex-col relative h-full bg-transparent min-w-0">
                    {/* Navbar / Breadcrumbs */}
                    <div className="h-14 border-b border-white/5 flex items-center px-4 justify-between bg-[#0f172a]/60 backdrop-blur-md z-10 shrink-0">
                        <div className="flex items-center gap-4">
                            {!isSidebarOpen && (
                                <button 
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                                >
                                    <span className="material-symbols-outlined text-lg">menu</span>
                                </button>
                            )}
                            
                            {activePageId && (
                                <Breadcrumbs 
                                    pages={pages}
                                    activePageId={activePageId}
                                    onSelectPage={setActivePageId}
                                />
                            )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                             <button 
                                onClick={() => setIsPickerOpen(true)}
                                className="flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full transition-all text-xs font-bold"
                            >
                                <span className="material-symbols-outlined text-sm">add_circle</span>
                                Thêm dữ liệu
                            </button>
                             <button 
                                onClick={handleDeepThink}
                                disabled={isThinking || !activePage}
                                className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/30 rounded-full transition-all text-xs font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)] animate-[pulse_3s_infinite]"
                            >
                                <span className={`material-symbols-outlined text-sm ${isThinking ? 'animate-spin' : ''}`}>psychology</span>
                                {isThinking ? 'AI Thinking...' : 'Deep Think'}
                            </button>
                            
                            <button 
                                onClick={() => setIsHubOpen(!isHubOpen)}
                                className={`p-2 rounded-full transition-colors ${isHubOpen ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                                title="Ecosystem Hub"
                            >
                                <span className="material-symbols-outlined">hub</span>
                            </button>
                            <FeatureWindowControls onClose={onBack} />
                        </div>
                    </div>

                    {/* View Switcher & Editor */}
                    <div className="flex-1 overflow-hidden relative flex">
                        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                            {isLoading ? (
                                <div className="h-full flex items-center justify-center text-slate-500">
                                    <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
                                    <p className="ml-2">Đang tải...</p>
                                </div>
                            ) : activePage ? (
                                activePage.type === 'note' ? (
                                    <div className="min-h-full">
                                        <EditorCore 
                                            key={activePage.id}
                                            page={activePage}
                                            onSave={handleUpdatePage}
                                            onAnalyzeAI={onAnalyzeNote} 
                                            onGenerateQuiz={handleGenerateQuiz} // Pass the Quiz handler
                                        />
                                        
                                        {/* AI Insight Result Area */}
                                        {aiInsight && (
                                            <div className="mx-auto max-w-4xl px-12 pb-20 animate-[fadeInUp_0.5s]">
                                                <div className="bg-[#1e1e2e]/90 border border-purple-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-purple-300 font-bold flex items-center gap-2">
                                                            <span className="material-symbols-outlined">auto_awesome</span> Phân tích chuyên sâu
                                                        </h3>
                                                        <button onClick={() => setAiInsight(null)} className="text-slate-500 hover:text-white"><span className="material-symbols-outlined text-sm">close</span></button>
                                                    </div>
                                                    <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                                                        <pre className="whitespace-pre-wrap font-sans">{aiInsight}</pre>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <FolderView 
                                        activePage={activePage}
                                        childrenPages={activeChildren}
                                        onSelectPage={setActivePageId}
                                        onCreateItem={(type) => handleCreatePage(activePage.id, type)}
                                        onUpdatePage={(updates) => handleUpdatePage({ ...activePage, ...updates })} // Pass update handler
                                    />
                                )
                            ) : (
                                <div className="flex-1 h-full flex flex-col items-center justify-center text-slate-500">
                                    <span className="material-symbols-outlined text-6xl mb-4 opacity-20">description</span>
                                    <p>Chọn một trang hoặc tạo mới để bắt đầu</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* RIGHT SIDEBAR: ECOSYSTEM HUB */}
                <aside className={`${isHubOpen ? 'w-72' : 'w-0'} bg-[#0b1120]/80 backdrop-blur-xl border-l border-white/5 flex flex-col transition-all duration-300 overflow-hidden shrink-0 h-full shadow-2xl z-20`}>
                    <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/20">
                        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">hub</span> Liên kết Hệ thống
                        </h3>
                        <button onClick={() => setIsHubOpen(false)} className="text-slate-500 hover:text-white"><span className="material-symbols-outlined text-sm">close</span></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* 1. Intelligence */}
                        <div>
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 pl-1">Trí tuệ nhân tạo</h4>
                            <div className="space-y-2">
                                <button onClick={() => handleIntegrate('alchemy')} className="hub-btn w-full group">
                                    <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-lg">science</span></div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-slate-200">Giả Kim Thuật</div>
                                        <div className="text-[9px] text-slate-500">Chế tác bài học từ ghi chú</div>
                                    </div>
                                </button>
                                <button onClick={() => handleIntegrate('tutor')} className="hub-btn w-full group">
                                    <div className="p-1.5 bg-green-500/10 text-green-400 rounded-lg group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-lg">school</span></div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-slate-200">Gia sư Biện chứng</div>
                                        <div className="text-[9px] text-slate-500">Phản biện & Chấm bài</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* 2. Visuals & Structure */}
                        <div>
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 pl-1">Cấu trúc & Hình ảnh</h4>
                            <div className="space-y-2">
                                <button onClick={() => handleIntegrate('graph')} className="hub-btn w-full group">
                                    <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-lg">hub</span></div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-slate-200">Sơ đồ Tri thức</div>
                                        <div className="text-[9px] text-slate-500">Map hóa ý tưởng này</div>
                                    </div>
                                </button>
                                <button onClick={() => handleIntegrate('draw')} className="hub-btn w-full group">
                                    <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-lg">brush</span></div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-slate-200">DrawEverything</div>
                                        <div className="text-[9px] text-slate-500">Vẽ minh họa</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* 3. Utilities */}
                        <div>
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 pl-1">Tiện ích mở rộng</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => handleIntegrate('digest')} className="hub-btn flex-col items-center text-center gap-1 p-2 group">
                                    <span className="material-symbols-outlined text-blue-400 group-hover:scale-110 transition-transform">checklist</span>
                                    <span className="text-[10px]">Tạo Task</span>
                                </button>
                                <button onClick={() => handleIntegrate('drive')} className="hub-btn flex-col items-center text-center gap-1 p-2 group">
                                    <span className="material-symbols-outlined text-red-400 group-hover:scale-110 transition-transform">cloud_upload</span>
                                    <span className="text-[10px]">Drive</span>
                                </button>
                                <button onClick={() => handleIntegrate('community')} className="hub-btn flex-col items-center text-center gap-1 p-2 group">
                                    <span className="material-symbols-outlined text-pink-400 group-hover:scale-110 transition-transform">share</span>
                                    <span className="text-[10px]">Chia sẻ</span>
                                </button>
                                <button onClick={() => handleIntegrate('dashboard')} className="hub-btn flex-col items-center text-center gap-1 p-2 group">
                                    <span className="material-symbols-outlined text-teal-400 group-hover:scale-110 transition-transform">push_pin</span>
                                    <span className="text-[10px]">Ghim</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </aside>
            </div>
            
            <AnimatePresence>
                {showDropZones && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] flex items-center justify-center gap-8 p-8 bg-black/40 backdrop-blur-sm"
                    >
                        {isDraggingFile && (
                            <>
                                <ContextualDropZone id="note-attach-file" type="NOTE" action="NOTES_ATTACH_FILE" icon="attach_file" text="Lưu dưới dạng file đính kèm" isVisible={true} />
                                <ContextualDropZone id="note-extract-text" type="NOTE" action="NOTES_EXTRACT_TEXT" icon="description" text="Trích xuất toàn bộ chữ vào Note" isVisible={true} />
                            </>
                        )}
                        {isDraggingDrawing && (
                            <>
                                <ContextualDropZone id="note-attach-drawing" type="NOTE" action="NOTES_ATTACH_DRAWING" icon="draw" text="Đính kèm bản vẽ vào Note" isVisible={true} />
                            </>
                        )}
                        {isDraggingText && (
                            <>
                                <ContextualDropZone id="note-append-text" type="NOTE" action="NOTES_APPEND_TEXT" icon="post_add" text="Thêm vào cuối Ghi chú" isVisible={true} />
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <AssetPickerModal 
                isOpen={isPickerOpen} 
                onClose={() => setIsPickerOpen(false)} 
                onSelect={handleAssetSelect} 
            />
        </DroppableZone>
    );
};

export default React.memo(NoteTaking);
