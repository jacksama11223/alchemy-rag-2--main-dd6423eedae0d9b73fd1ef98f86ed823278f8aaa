
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { DriveFile, DriveFileType, AlchemyIntent } from '../types';
import { semanticFileClustering } from '../services/geminiService'; // Import
import { Uploadfile } from './DriveStorage/Uploadfile'; // IMPORT NEW COMPONENT
import { DeepRead } from './DriveStorage/DeepRead'; // IMPORT DEEP READ
import { AuthoringModal } from './DriveStorage/AuthoringModal'; // IMPORT AI AUTHORING
import { getFilesFromBackend, saveFileToBackend, deleteFileFromBackend } from '../services/mockBackend'; // API
import { FeatureWindowControls } from './FeatureWindowControls';
import { IncomingAsset } from '../utils/dataProcessor';

interface DriveStorageProps {
    onBack: () => void;
    onShowAccount: () => void;
    onNavigateToAlchemy: (intent: AlchemyIntent) => void;
    onToggleTodo?: () => void;
}

interface FilePreviewModalProps {
    file: DriveFile | null;
    onClose: () => void;
    onExtractText: (text: string) => void;
    onSaveSuccess: (updatedFile: DriveFile) => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose, onExtractText, onSaveSuccess }) => {
    const [selectedText, setSelectedText] = useState('');
    const [selectionPos, setSelectionPos] = useState({ x: 0, y: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (file) {
            setEditedContent(file.content || "");
            setIsEditing(false); // Reset editing mode when file changes
        }
    }, [file]);

    const handleSave = async () => {
        if (!file) return;
        setIsSaving(true);
        try {
            const sessionStr = window.localStorage.getItem('learnai_session');
            let token = '';
            if (sessionStr) {
                const session = JSON.parse(sessionStr);
                token = session.token || '';
            }

            const res = await fetch(`/api/files/${file.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: editedContent })
            });

            if (!res.ok) throw new Error('Failed to save file contents');
            const updatedFile = await res.json();
            onSaveSuccess(updatedFile);
            setIsEditing(false);
            alert("File saved successfully!");
        } catch (err) {
            console.error("Error saving file:", err);
            alert("Lỗi khi lưu file.");
        } finally {
            setIsSaving(false);
        }
    };

    const getContent = () => {
        if (!file) return "";
        if (file.content && !file.content.includes('(Mocked)')) {
            return file.content;
        }
        if (file.type === 'image') return "Image Preview Not Supported for Text Selection.";
        return `[${file.name.toUpperCase()} - DEMO CONTENT]\n\n# Chapter 1: Introduction\n\n**LearnAI** is a powerful tool.`; 
    };

    const handleMouseUp = () => {
        if (isEditing) return; // Disable extraction in edit mode
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSelectedText(selection.toString());
            setSelectionPos({ x: rect.left + rect.width / 2, y: rect.top - 50 });
        } else {
            setSelectedText('');
        }
    };

    if (!file) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4" onClick={onClose}>
            <div 
                className="bg-white text-slate-900 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-500">description</span>
                        <h3 className="font-bold text-lg">{file.name}</h3>
                        {isEditing && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200 font-bold">CHẾ ĐỘ CHỈNH SỬA</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold transition-all"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                Chỉnh sửa
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-bold transition-all shadow-md"
                                >
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    {isSaving ? 'Đang lưu...' : 'Lưu lại'}
                                </button>
                                <button 
                                    onClick={() => { setIsEditing(false); setEditedContent(file.content || ""); }}
                                    className="px-3 py-1.5 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-lg text-sm font-bold transition-all"
                                >
                                    Hủy
                                </button>
                            </>
                        )}
                        <div className="w-px h-6 bg-slate-200 mx-2"></div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-10 py-8 bg-[#fdfdfd]">
                    {isEditing ? (
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="w-full h-full p-4 border border-blue-200 rounded-xl font-mono text-base leading-relaxed focus:outline-none focus:ring-4 focus:ring-blue-100 bg-white shadow-inner resize-none custom-scrollbar"
                            placeholder="Nhập nội dung tài liệu..."
                            autoFocus
                        />
                    ) : (
                        <div 
                            className="prose prose-slate max-w-none text-lg leading-relaxed selection:bg-yellow-200 selection:text-black font-serif"
                            onMouseUp={handleMouseUp}
                            ref={contentRef}
                        >
                            <style>{`
                                .prose h1 { font-size: 2.25rem; font-weight: 900; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
                                .prose h2 { font-size: 1.75rem; font-weight: 800; color: #334155; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                                .prose h3 { font-size: 1.5rem; font-weight: 700; color: #475569; margin-top: 1.25rem; margin-bottom: 0.5rem; }
                                .prose p { margin-bottom: 1.25rem; color: #334155; }
                                .prose strong { color: #1e293b; font-weight: 700; }
                                .prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
                                .prose li { margin-bottom: 0.5rem; }
                                .prose code { background: #f1f5f9; padding: 0.2rem 0.4rem; rounded: 4px; font-family: monospace; color: #e11d48; }
                                .prose blockquote { border-left: 4px solid #3b82f6; padding-left: 1.5rem; color: #64748b; font-style: italic; margin: 1.5rem 0; }
                            `}</style>
                            <ReactMarkdown>{editedContent || getContent()}</ReactMarkdown>
                        </div>
                    )}
                </div>
                
                {/* Floating Action Button for Selection */}
                {selectedText && !isEditing && (
                    <div 
                        className="fixed z-[160] transform -translate-x-1/2 animate-bounce-in"
                        style={{ left: selectionPos.x, top: selectionPos.y }}
                    >
                        <button 
                            onClick={() => {
                                onExtractText(selectedText);
                                setSelectedText('');
                            }}
                            className="bg-black text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 hover:bg-slate-800 transition-transform hover:scale-105"
                        >
                            <span className="material-symbols-outlined text-sm text-yellow-400">flash_on</span>
                            Tạo Flashcard
                        </button>
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-black absolute left-1/2 -translate-x-1/2 -bottom-2"></div>
                    </div>
                )}
            </div>
        </div>
    );
};


// ... (OceanParticles and generateMockFiles remain same) ...
const OceanParticles: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const particles: any[] = [];
        const particleCount = 100;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 3 + 1,
                speedY: Math.random() * 0.5 + 0.2, // Float up
                speedX: Math.random() * 0.2 - 0.1, // Drift
                opacity: Math.random() * 0.5 + 0.1,
                color: Math.random() > 0.8 ? '255, 255, 255' : '100, 200, 255' // White or Cyan bubble
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Draw particles
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
                ctx.shadowBlur = 5;
                ctx.shadowColor = `rgba(${p.color}, 0.5)`;
                ctx.fill();

                // Update position
                p.y -= p.speedY;
                p.x += p.speedX;

                // Reset if out of bounds
                if (p.y < -10) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }
            });

            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
};

interface DraggableDriveFileProps {
    file: DriveFile;
    onClick: (e: React.MouseEvent) => void;
    onDoubleClick: () => void;
    className?: string;
    children: React.ReactNode;
    as?: React.ElementType;
}

const DraggableDriveFile: React.FC<DraggableDriveFileProps> = ({ file, onClick, onDoubleClick, className = '', children, as: Component = 'div' }) => {
    const asset: IncomingAsset = {
        id: file.id,
        dataType: 'FILE_ASSET',
        title: file.name,
        payload: file.content || `[Tài liệu: ${file.name}]`
    };

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `drive-file-${file.id}`,
        data: asset,
    });

    const style = {
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 'auto',
    };

    return (
        <Component 
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            className={className}
        >
            {children}
        </Component>
    );
};

export const DriveStorage: React.FC<DriveStorageProps> = ({ onBack, onShowAccount, onNavigateToAlchemy, onToggleTodo }) => {
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
    const [filter, setFilter] = useState<'my-drive' | 'shared' | 'recent' | 'starred' | 'trash'>('my-drive');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    // AI Clustering State
    const [semanticClusters, setSemanticClusters] = useState<{name: string, fileIds: string[]}[]>([]);
    const [isClustering, setIsClustering] = useState(false);
    
    // Preview State
    const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
    const [isAuthoringOpen, setIsAuthoringOpen] = useState(false);

    useEffect(() => {
        const loadFiles = async () => {
            setIsLoading(true);
            const data = await getFilesFromBackend();
            setFiles(data);
            setIsLoading(false);
        };
        loadFiles();
    }, []);

    // ... (Computed Data logic remains) ...
    const currentFiles = files.filter(f => {
        if (searchQuery) {
            return f.name.toLowerCase().includes(searchQuery.toLowerCase()) && !f.isTrashed;
        }
        if (filter === 'trash') return f.isTrashed;
        if (f.isTrashed) return false;
        if (filter === 'starred') return f.isStarred;
        if (filter === 'shared') return f.owner !== 'Tôi';
        if (filter === 'recent') return true; 
        return f.parentId === currentFolderId;
    });

    const folders = currentFiles.filter(f => f.type === 'folder');
    const normalFiles = currentFiles.filter(f => f.type !== 'folder');
    const suggestedFiles = filter === 'my-drive' && !currentFolderId 
        ? files.filter(f => !f.isTrashed && (f.isStarred || f.type !== 'folder')).slice(0, 4) 
        : [];

    // Breadcrumbs logic ...
    const breadcrumbs = [];
    let tempId = currentFolderId;
    while (tempId) {
        const folder = files.find(f => f.id === tempId);
        if (folder) {
            breadcrumbs.unshift(folder);
            tempId = folder.parentId;
        } else {
            break;
        }
    }

    // ... (Handlers remain mostly same) ...
    const handleFileClick = (file: DriveFile, e: React.MouseEvent) => {
        if (e.ctrlKey || e.metaKey) {
            const newSet = new Set(selectedFileIds);
            if (newSet.has(file.id)) newSet.delete(file.id);
            else newSet.add(file.id);
            setSelectedFileIds(newSet);
        } else {
            setSelectedFileIds(new Set([file.id]));
        }
    };

    const handleDoubleClick = (file: DriveFile) => {
        if (file.type === 'folder') {
            setCurrentFolderId(file.id);
            setSelectedFileIds(new Set());
        } else {
            // Open Preview Modal instead of alert
            setPreviewFile(file);
        }
    };

    const handleMicroLearning = (text: string) => {
        setPreviewFile(null); // Close modal
        // Navigate to Alchemy with intent to create flashcard
        onNavigateToAlchemy({
            type: 'create',
            initialQuery: `Create flashcards from this specific text excerpt: "${text}"`,
            label: "Micro-Lesson"
        });
    };

    // UPDATED: Using Uploadfile component for real file handling
    const handleUploadComplete = (newFiles: DriveFile[]) => {
        // Save to backend individually (or bulk if backend supports it)
        newFiles.forEach(f => {
            saveFileToBackend(f).then(saved => {
                if(saved) setFiles(prev => [...prev, saved]);
            });
        });
    };
    
    // NEW: AI Semantic Cluster Handler
    const handleSemanticSort = async () => {
        setIsClustering(true);
        const result = await semanticFileClustering(currentFiles);
        setSemanticClusters(result.clusters);
        setIsClustering(false);
    };

    // ... (Other handlers: createFolder, Embed, Delete) ...
    const handleCreateFolder = async () => {
        const name = prompt("Nhập tên thư mục mới:");
        if (name) {
            const newFolder: DriveFile = {
                id: Date.now().toString(), // Client ID
                parentId: currentFolderId,
                name,
                type: 'folder',
                size: '-',
                lastModified: new Date().toISOString().split('T')[0],
                owner: 'Tôi',
                isStarred: false,
                isTrashed: false
            };
            const saved = await saveFileToBackend(newFolder);
            if(saved) setFiles(prev => [...prev, saved]);
        }
    };

    const handleEmbedToAlchemy = () => {
        const selected = files.filter(f => selectedFileIds.has(f.id));
        if (selected.length === 0) return;
        const validFiles = selected.filter(f => ['pdf', 'doc', 'txt'].includes(f.type));
        if (validFiles.length === 0) {
            alert("Vui lòng chọn file văn bản (PDF, Word, TXT) để xử lý.");
            return;
        }
        const prompt = `[EMBEDDED FILES]\n${validFiles.map(f => `File: ${f.name}\nContent: ${f.content || '(Simulated Content)'}`).join('\n\n')}`;
        onNavigateToAlchemy({ type: 'create', initialQuery: prompt });
    };

    const handleDelete = async () => {
        if (filter === 'trash') {
            if (confirm("Xóa vĩnh viễn các file đã chọn?")) {
                selectedFileIds.forEach(id => deleteFileFromBackend(id));
                setFiles(prev => prev.filter(f => !selectedFileIds.has(f.id)));
                setSelectedFileIds(new Set());
            }
        } else {
            // Soft delete
             selectedFileIds.forEach(id => {
                 const f = files.find(x => x.id === id);
                 if(f) saveFileToBackend({...f, isTrashed: true});
             });
            setFiles(prev => prev.map(f => selectedFileIds.has(f.id) ? { ...f, isTrashed: true } : f));
            setSelectedFileIds(new Set());
        }
    };

    // ... (Icon Helpers) ...
    const getIconClass = (type: string) => {
        switch(type) {
            case 'folder': return 'material-symbols-outlined text-amber-300';
            case 'pdf': return 'material-symbols-outlined text-red-400';
            case 'doc': return 'material-symbols-outlined text-blue-400';
            case 'image': return 'material-symbols-outlined text-purple-400';
            case 'txt': return 'material-symbols-outlined text-slate-400';
            default: return 'material-symbols-outlined text-gray-400';
        }
    };

    const getIconName = (type: string) => {
         switch(type) {
            case 'folder': return 'folder';
            case 'pdf': return 'picture_as_pdf';
            case 'doc': return 'description';
            case 'image': return 'image';
            case 'txt': return 'article';
            default: return 'insert_drive_file';
        }
    };
    
    const usedStorage = files.length * 0.5; 
    const totalStorage = 20;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 text-slate-700 font-sans relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#023e8a] via-[#0077b6] to-[#0096c7] z-0"></div>
            <OceanParticles />
            <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

            {/* Styles... (Keep existing styles) */}
            <style>{`
                @keyframes floatUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
                .animate-entry { animation: floatUp 0.5s ease-out forwards; }
                .glass-panel { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2); }
                .pearl-card { background: linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; }
                .pearl-card:hover { transform: translateY(-5px) scale(1.02); background: linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%); box-shadow: 0 10px 25px rgba(160, 210, 235, 0.3); border-color: rgba(255, 255, 255, 0.5); }
                .glass-btn-highlight { background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%); border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); backdrop-filter: blur(10px); }
                .glass-btn-highlight:hover { transform: translateY(-2px); background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 100%); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); }
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
                .folder-grid-item { background: linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(240, 248, 255, 0.5) 100%); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.6); box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .folder-grid-item:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); }
                .cursor-wait { cursor: wait; }
            `}</style>
            
            {/* File Preview Modal */}
            <FilePreviewModal 
                file={previewFile} 
                onClose={() => setPreviewFile(null)} 
                onExtractText={handleMicroLearning}
                onSaveSuccess={(updatedFile) => {
                    setFiles(prev => prev.map(f => f.id === updatedFile.id ? updatedFile : f));
                    setPreviewFile(updatedFile);
                }}
            />

            <AuthoringModal 
                isOpen={isAuthoringOpen}
                onClose={() => setIsAuthoringOpen(false)}
                parentId={currentFolderId}
                onSuccess={(newFile) => setFiles(prev => [...prev, newFile])}
            />

            <nav className="w-full max-w-[1400px] flex justify-between items-center mb-6 px-4 relative z-20">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={onBack}>
                    <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors backdrop-blur-md">
                        <span className="material-symbols-outlined text-white text-lg">arrow_back</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">sailing</span>
                        <span className="text-xl font-bold text-white tracking-wide drop-shadow-md">LearnAI Drive</span>
                    </div>
                </div>
                
                {/* Search Bar */}
                <div className="flex-1 max-w-2xl mx-8 relative hidden md:block">
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm tài liệu, thư mục..." 
                        className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-full py-3 pl-12 pr-4 text-white placeholder-white/70 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all shadow-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="material-symbols-outlined text-white/70 absolute left-4 top-3.5">search</span>
                </div>

                <div className="flex items-center gap-3">
                    {onToggleTodo && (
                         <button onClick={onToggleTodo} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" title="Tasks">
                            <span className="material-symbols-outlined">checklist</span>
                        </button>
                    )}
                    <button onClick={onShowAccount} className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-[2px] shadow-lg hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <span className="material-symbols-outlined text-white">person</span>
                        </div>
                    </button>
                    <FeatureWindowControls onClose={onBack} />
                </div>
            </nav>

            <div className="w-full max-w-[1400px] flex-1 flex gap-6 relative z-10 overflow-hidden rounded-3xl glass-panel shadow-2xl animate-entry">
                
                {/* SIDEBAR */}
                <aside className="w-64 flex-col gap-2 p-4 hidden lg:flex border-r border-white/20 bg-white/5">
                    
                    {/* Updated Upload Button using Uploadfile component */}
                    <Uploadfile 
                        currentFolderId={currentFolderId} 
                        onUploadComplete={handleUploadComplete} 
                    />

                    <button 
                        onClick={() => setIsAuthoringOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600/40 to-indigo-600/40 border border-white/20 text-white font-bold hover:from-blue-600/60 hover:to-indigo-600/60 transition-all shadow-lg group mb-2"
                    >
                        <span className="material-symbols-outlined text-yellow-400 group-hover:rotate-12 transition-transform">auto_awesome</span>
                        <span className="text-sm">AI Authoring Lab</span>
                    </button>

                    <nav className="flex-1 space-y-1">
                        {[
                            { id: 'my-drive', icon: 'hard_drive', label: 'Drive của tôi' },
                            { id: 'shared', icon: 'group', label: 'Được chia sẻ' },
                            { id: 'recent', icon: 'schedule', label: 'Gần đây' },
                            { id: 'starred', icon: 'star', label: 'Có gắn sao' },
                            { id: 'trash', icon: 'delete', label: 'Thùng rác' },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setFilter(item.id as any); setCurrentFolderId(null); setSelectedFileIds(new Set()); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    filter === item.id 
                                    ? 'bg-blue-100/20 text-white font-bold shadow-sm backdrop-blur-sm border border-white/20' 
                                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* Storage Widget */}
                    <div className="mt-auto p-4 bg-black/20 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 text-white/90 text-sm font-bold mb-2">
                            <span className="material-symbols-outlined text-blue-300">cloud</span>
                            Bộ nhớ
                        </div>
                        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-blue-400 w-[15%]"></div>
                        </div>
                        <p className="text-xs text-white/60">{usedStorage} GB / {totalStorage} GB đã dùng</p>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 flex flex-col overflow-hidden bg-white/5 backdrop-blur-sm">
                    {/* Toolbar */}
                    <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
                        <div className="flex items-center gap-2 text-white/80 text-sm overflow-hidden">
                             <button onClick={() => setCurrentFolderId(null)} className="hover:bg-white/10 px-2 py-1 rounded transition-colors">Drive của tôi</button>
                             {breadcrumbs.map(b => (
                                 <React.Fragment key={b.id}>
                                     <span className="material-symbols-outlined text-xs text-white/50">chevron_right</span>
                                     <button onClick={() => setCurrentFolderId(b.id)} className="hover:bg-white/10 px-2 py-1 rounded transition-colors whitespace-nowrap">{b.name}</button>
                                 </React.Fragment>
                             ))}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {selectedFileIds.size > 0 && (
                                <div className="flex bg-blue-600/80 rounded-lg p-1 mr-4 animate-fade-in shadow-lg backdrop-blur-md">
                                    <button onClick={handleEmbedToAlchemy} className="p-2 hover:bg-white/20 rounded text-white" title="Gửi sang Alchemy"><span className="material-symbols-outlined text-sm">science</span></button>
                                    <button onClick={handleDelete} className="p-2 hover:bg-white/20 rounded text-white" title="Xóa"><span className="material-symbols-outlined text-sm">delete</span></button>
                                    <button className="p-2 hover:bg-white/20 rounded text-white" title="Tải xuống"><span className="material-symbols-outlined text-sm">download</span></button>
                                    <span className="px-2 self-center text-xs font-bold text-white border-l border-white/20 ml-1">{selectedFileIds.size} đã chọn</span>
                                </div>
                            )}

                            {/* AI Cluster Button */}
                             <button 
                                onClick={handleSemanticSort}
                                disabled={isClustering}
                                className={`p-2 rounded-lg transition-all ${isClustering ? 'bg-purple-500 text-white animate-pulse' : 'text-purple-300 hover:bg-purple-900/40 hover:text-white'}`}
                                title="AI Tự động phân loại (Semantic Cluster)"
                            >
                                <span className="material-symbols-outlined">auto_awesome_mosaic</span>
                            </button>
                            
                            <div className="h-6 w-px bg-white/20 mx-2"></div>
                            
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}>
                                <span className="material-symbols-outlined">list</span>
                            </button>
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}>
                                <span className="material-symbols-outlined">grid_view</span>
                            </button>
                            <button className="p-2 rounded-lg text-white/60 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">info</span>
                            </button>
                        </div>
                    </div>

                    {/* Files Area */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                                <span className="material-symbols-outlined text-4xl animate-spin text-white">sync</span>
                            </div>
                        )}
                        
                        {/* AI CLUSTER VIEW (If Active) */}
                        {semanticClusters.length > 0 && (
                            <div className="mb-8 space-y-6 animate-slide-up">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-purple-300 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                                        <span className="material-symbols-outlined text-lg">neurology</span> Gợi ý phân loại từ AI
                                    </h3>
                                    <button onClick={() => setSemanticClusters([])} className="text-xs text-white/60 hover:text-white">Thoát chế độ AI</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {semanticClusters.map((cluster, idx) => (
                                        <div key={idx} className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 hover:bg-purple-900/30 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="material-symbols-outlined text-purple-400 group-hover:scale-110 transition-transform">folder_special</span>
                                                <h4 className="font-bold text-white text-sm">{cluster.name}</h4>
                                                <span className="ml-auto bg-purple-500/20 text-purple-200 text-[10px] px-2 py-0.5 rounded-full">{cluster.fileIds.length} files</span>
                                            </div>
                                            <div className="flex -space-x-2 overflow-hidden pl-1">
                                                {cluster.fileIds?.slice(0,4).map(fid => {
                                                    const f = files.find(file => file.id === fid);
                                                    return f ? (
                                                        <div key={fid} className="w-6 h-6 rounded bg-slate-700 border border-purple-500/50 flex items-center justify-center text-[10px] text-white" title={f.name}>
                                                            {f.name[0]}
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <hr className="border-white/10" />
                            </div>
                        )}

                        {/* Suggested Files */}
                        {suggestedFiles.length > 0 && !semanticClusters.length && (
                            <div className="mb-8">
                                <h4 className="text-sm font-medium text-white/70 mb-4">Đề xuất</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {suggestedFiles.map(file => (
                                        <DraggableDriveFile
                                            key={file.id}
                                            file={file}
                                            onClick={(e) => handleFileClick(file, e)}
                                            onDoubleClick={() => handleDoubleClick(file)}
                                            className="pearl-card p-4 rounded-xl cursor-pointer relative group overflow-hidden"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <span className={`${getIconClass(file.type)} text-3xl`}>{getIconName(file.type)}</span>
                                                {file.isStarred && <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>}
                                            </div>
                                            <p className="text-sm font-medium text-slate-800 truncate mb-1">{file.name}</p>
                                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                Bạn đã chỉnh sửa • {file.lastModified}
                                            </p>
                                            
                                            {/* ADDED DEEP READ BUTTON HERE */}
                                            {['doc','txt','pdf'].includes(file.type) && (
                                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <DeepRead 
                                                        fileContent={file.content || ''} 
                                                        fileName={file.name} 
                                                        onNavigateToAlchemy={onNavigateToAlchemy}
                                                    />
                                                </div>
                                            )}
                                            
                                            <div className={`absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none transition-opacity ${selectedFileIds.has(file.id) ? 'opacity-100' : 'opacity-0'}`}></div>
                                        </DraggableDriveFile>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Folders */}
                        {folders.length > 0 && !semanticClusters.length && (
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-white/70 mb-4">Thư mục</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {/* Add Folder Button */}
                                    <div 
                                        onClick={handleCreateFolder}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/30 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/50 cursor-pointer transition-all"
                                    >
                                        <div className="p-2 bg-white/10 rounded-lg"><span className="material-symbols-outlined text-lg">create_new_folder</span></div>
                                        <span className="text-sm font-bold">Mới</span>
                                    </div>

                                    {folders.map(folder => (
                                        <div 
                                            key={folder.id}
                                            onClick={(e) => handleFileClick(folder, e)}
                                            onDoubleClick={() => handleDoubleClick(folder)}
                                            className={`folder-grid-item p-3 rounded-xl cursor-pointer flex items-center gap-3 group relative ${selectedFileIds.has(folder.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                                        >
                                            <span className="material-symbols-outlined text-amber-400 text-2xl group-hover:scale-110 transition-transform">folder</span>
                                            <span className="text-sm font-medium text-slate-700 truncate">{folder.name}</span>
                                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-lg">more_vert</span></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Files */}
                        {!semanticClusters.length && (
                            <div>
                                <h4 className="text-sm font-medium text-white/70 mb-4">Tệp tin</h4>
                                {viewMode === 'list' ? (
                                    <div className="bg-white/80 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 shadow-sm">
                                        <table className="w-full text-left text-sm text-slate-600">
                                            <thead className="bg-slate-100/50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                                                <tr>
                                                    <th className="px-6 py-3">Tên</th>
                                                    <th className="px-6 py-3 w-32">Chủ sở hữu</th>
                                                    <th className="px-6 py-3 w-40">Sửa đổi</th>
                                                    <th className="px-6 py-3 w-24">Kích thước</th>
                                                    <th className="px-6 py-3 w-32 text-right">Tác vụ</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {normalFiles.map(file => (
                                                    <DraggableDriveFile 
                                                        key={file.id} 
                                                        file={file}
                                                        as="tr"
                                                        onClick={(e) => handleFileClick(file, e)}
                                                        onDoubleClick={() => handleDoubleClick(file)}
                                                        className={`hover:bg-blue-50/80 transition-colors cursor-pointer group ${selectedFileIds.has(file.id) ? 'bg-blue-100/60' : ''}`}
                                                    >
                                                        <td className="px-6 py-3 flex items-center gap-3">
                                                            <span className={getIconClass(file.type)}>{getIconName(file.type)}</span>
                                                            <span className="font-medium text-slate-700 truncate max-w-xs">{file.name}</span>
                                                            {file.isStarred && <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>}
                                                        </td>
                                                        <td className="px-6 py-3 text-slate-500">{file.owner}</td>
                                                        <td className="px-6 py-3 text-slate-500">{file.lastModified}</td>
                                                        <td className="px-6 py-3 text-slate-500 font-mono text-xs">{file.size}</td>
                                                        <td className="px-6 py-3 text-right">
                                                            {/* ADDED DEEP READ BUTTON HERE TOO */}
                                                            {['doc','txt','pdf'].includes(file.type) && (
                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                     <DeepRead 
                                                                        fileContent={file.content || ''} 
                                                                        fileName={file.name} 
                                                                        onNavigateToAlchemy={onNavigateToAlchemy}
                                                                    />
                                                                </div>
                                                            )}
                                                        </td>
                                                    </DraggableDriveFile>
                                                ))}
                                                {normalFiles.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Thư mục trống. Kéo thả file vào đây để tải lên.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {normalFiles.map(file => (
                                            <DraggableDriveFile
                                                key={file.id}
                                                file={file}
                                                onClick={(e) => handleFileClick(file, e)}
                                                onDoubleClick={() => handleDoubleClick(file)}
                                                className={`p-4 bg-white/80 backdrop-blur-md rounded-xl border border-white/20 hover:shadow-lg transition-all cursor-pointer flex flex-col items-center text-center gap-2 group relative ${selectedFileIds.has(file.id) ? 'ring-2 ring-blue-500 bg-blue-50/90' : ''}`}
                                            >
                                                <div className="w-full aspect-[3/4] bg-slate-100 rounded-lg flex items-center justify-center mb-1 overflow-hidden relative">
                                                    {file.type === 'image' ? (
                                                        <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-300">
                                                            <span className="material-symbols-outlined text-4xl">image</span>
                                                        </div>
                                                    ) : (
                                                        <span className={`${getIconClass(file.type)} text-5xl opacity-80 group-hover:scale-110 transition-transform`}>{getIconName(file.type)}</span>
                                                    )}
                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2">
                                                        <span className="material-symbols-outlined text-white/80 bg-black/20 rounded-full p-1">visibility</span>
                                                        
                                                        {['doc','txt','pdf'].includes(file.type) && (
                                                             <div onClick={e => e.stopPropagation()}>
                                                                 <DeepRead 
                                                                    fileContent={file.content || ''} 
                                                                    fileName={file.name} 
                                                                    onNavigateToAlchemy={onNavigateToAlchemy}
                                                                />
                                                             </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 truncate w-full px-1">{file.name}</span>
                                                <span className="text-[10px] text-slate-500">{file.lastModified}</span>
                                                {file.isStarred && <span className="absolute top-2 right-2 text-yellow-400 material-symbols-outlined text-sm drop-shadow-sm">star</span>}
                                            </DraggableDriveFile>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};
