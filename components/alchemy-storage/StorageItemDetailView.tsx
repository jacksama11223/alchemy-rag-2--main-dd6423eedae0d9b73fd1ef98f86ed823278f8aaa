import React, { useState, useEffect, useRef } from 'react';
import { AlchemyStorageItem } from '../../types';
import YoutubePlayer from '../alchemy-youtubevideo-extract/YoutubePlayer';
import RecordingPlayer from '../alchemy-recorded-extract/RecordingPlayer';
import { FileTagging } from '../Drive-MoveItems/FileTagging';
import { SplitScreenEditor } from '../Drive-MoveItems/SplitScreenEditor';

interface StorageItemDetailViewProps {
    item: AlchemyStorageItem;
    onUpdateItem: (updatedItem: AlchemyStorageItem) => void;
    onDeleteItem?: (id: string) => void;
    onClose: () => void;
    onOpenStudio?: () => void;
}

export const ZoomableImage: React.FC<{ src: string, alt: string }> = ({ src, alt }) => {
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const [mode, setMode] = useState<'pan' | 'annotate'>('pan');
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentRect, setCurrentRect] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const [annotations, setAnnotations] = useState<{ id: string, rect: { x: number, y: number, width: number, height: number } }[]>([]);
    const [hoveredAnnotationId, setHoveredAnnotationId] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                setMode(prev => prev === 'pan' ? 'annotate' : 'pan');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey && containerRef.current && containerRef.current.contains(e.target as Node)) {
                e.preventDefault();
                setScale(prev => {
                    const newScale = prev - e.deltaY * 0.001;
                    return Math.min(Math.max(0.1, newScale), 5);
                });
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (mode === 'pan') {
            if (!containerRef.current) return;
            setIsPanning(true);
            setPanStart({
                x: e.clientX,
                y: e.clientY,
                scrollLeft: containerRef.current.scrollLeft,
                scrollTop: containerRef.current.scrollTop
            });
            return;
        }

        if (!imageRef.current || !containerRef.current) return;
        
        const rect = imageRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        
        setIsDrawing(true);
        setStartPos({ x, y });
        setCurrentRect({ x, y, width: 0, height: 0 });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning && containerRef.current) {
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;
            containerRef.current.scrollLeft = panStart.scrollLeft - dx;
            containerRef.current.scrollTop = panStart.scrollTop - dy;
            return;
        }

        if (!isDrawing || !imageRef.current) return;
        
        const rect = imageRef.current.getBoundingClientRect();
        const currentX = (e.clientX - rect.left) / scale;
        const currentY = (e.clientY - rect.top) / scale;
        
        const x = Math.min(startPos.x, currentX);
        const y = Math.min(startPos.y, currentY);
        const width = Math.abs(currentX - startPos.x);
        const height = Math.abs(currentY - startPos.y);
        
        setCurrentRect({ x, y, width, height });
    };

    const handleMouseUp = () => {
        if (isPanning) {
            setIsPanning(false);
            return;
        }

        if (!isDrawing || !currentRect) return;
        
        setIsDrawing(false);
        
        if (currentRect.width > 10 && currentRect.height > 10) {
            setAnnotations(prev => [...prev, {
                id: Date.now().toString(),
                rect: currentRect
            }]);
        }
        
        setCurrentRect(null);
    };

    return (
        <div className="relative flex flex-col h-full">
            <div className="absolute top-2 right-2 z-10 flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-sky-700 rounded-lg border border-sky-200 text-xs font-medium shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">
                        {mode === 'pan' ? 'pan_tool' : 'edit'}
                    </span>
                    {mode === 'pan' ? 'Chế độ Kéo (Ctrl+N để Ghi chú)' : 'Chế độ Ghi chú (Ctrl+N để Kéo)'}
                </div>
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-slate-200">
                    <button onClick={() => setScale(p => Math.max(p - 0.2, 0.1))} className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors" title="Thu nhỏ (Ctrl + Scroll Down)">
                        <span className="material-symbols-outlined text-sm">zoom_out</span>
                    </button>
                    <button onClick={() => setScale(1)} className="px-2 text-xs font-medium text-slate-600 hover:text-slate-900" title="Khôi phục">
                        {Math.round(scale * 100)}%
                    </button>
                    <button onClick={() => setScale(p => Math.min(p + 0.2, 5))} className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors" title="Phóng to (Ctrl + Scroll Up)">
                        <span className="material-symbols-outlined text-sm">zoom_in</span>
                    </button>
                </div>
            </div>
            <div 
                ref={containerRef} 
                className={`flex-1 overflow-auto custom-scrollbar rounded-xl border border-slate-200 bg-slate-100 ${mode === 'pan' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div 
                    className="relative inline-block min-w-full min-h-full origin-top-left transition-transform duration-75"
                    style={{ transform: `scale(${scale})` }}
                >
                    <img ref={imageRef} src={src} alt={alt} className="max-w-none shadow-sm pointer-events-none select-none" draggable={false} />
                    
                    {/* Render annotations */}
                    {annotations.map(a => (
                        <div
                            key={a.id}
                            className="absolute border-2 border-sky-500 cursor-pointer transition-all bg-sky-500/20"
                            style={{
                                left: a.rect.x,
                                top: a.rect.y,
                                width: a.rect.width,
                                height: a.rect.height,
                                backgroundColor: hoveredAnnotationId === a.id ? 'rgba(14, 165, 233, 0.4)' : 'rgba(14, 165, 233, 0.2)',
                            }}
                            onMouseEnter={() => setHoveredAnnotationId(a.id)}
                            onMouseLeave={() => setHoveredAnnotationId(null)}
                            onClick={(e) => {
                                e.stopPropagation();
                                setAnnotations(prev => prev.filter(item => item.id !== a.id));
                            }}
                        >
                            {hoveredAnnotationId === a.id && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                                    Nhấp để xóa
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Render current drawing rect */}
                    {isDrawing && currentRect && (
                        <div
                            className="absolute border-2 border-sky-500 bg-sky-500/30 pointer-events-none"
                            style={{
                                left: currentRect.x,
                                top: currentRect.y,
                                width: currentRect.width,
                                height: currentRect.height,
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export const StorageItemDetailView: React.FC<StorageItemDetailViewProps> = ({ item, onUpdateItem, onDeleteItem, onClose, onOpenStudio }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(item.extractedText);
    const [editedTitle, setEditedTitle] = useState(item.title);
    const [editedTags, setEditedTags] = useState<string[]>(item.tags || []);

    useEffect(() => {
        setEditedText(item.extractedText);
        setEditedTitle(item.title);
        setEditedTags(item.tags || []);
        setIsEditing(false);
    }, [item]);

    const handleSave = () => {
        onUpdateItem({
            ...item,
            title: editedTitle,
            extractedText: editedText,
            tags: editedTags,
            updatedAt: new Date().toISOString()
        });
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa mục này?')) {
            if (onDeleteItem) {
                onDeleteItem(item.id);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-[fadeIn_0.3s]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className="text-xl font-bold text-slate-800 bg-white border border-sky-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500/50 w-full max-w-md"
                        />
                    ) : (
                        <h2 className="text-xl font-bold text-slate-800 line-clamp-1">{item.title}</h2>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        {item.sourceType}
                    </span>
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Hủy</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-xl shadow-md transition-all">Lưu</button>
                        </>
                    ) : (
                        <>
                            {onOpenStudio && (
                                <button onClick={onOpenStudio} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-bold rounded-xl shadow-md transition-all">
                                    <span className="material-symbols-outlined text-[18px]">style</span> Vào Studio
                                </button>
                            )}
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl shadow-sm transition-all">
                                <span className="material-symbols-outlined text-[18px]">edit</span> Sửa
                            </button>
                            {onDeleteItem && (
                                <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-sm font-bold rounded-xl shadow-sm transition-all">
                                    <span className="material-symbols-outlined text-[18px]">delete</span> Xóa
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 flex flex-col">
                {isEditing && (
                    <div className="mb-6 shrink-0">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Tags</h3>
                        <FileTagging currentTags={editedTags} onUpdateTags={setEditedTags} />
                    </div>
                )}
                <div className="flex-1 min-h-[400px]">
                    <SplitScreenEditor 
                        leftContent={
                            <div className="flex flex-col gap-4 h-full">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">source</span> Dữ liệu gốc
                                </h3>
                                <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 p-4 overflow-y-auto">
                                    {item.originalContent ? (
                                        item.sourceType === 'ocr' || item.sourceType === 'upload' ? (
                                            <ZoomableImage src={item.originalContent} alt="Original" />
                                        ) : item.sourceType === 'voice' ? (
                                            <RecordingPlayer audioData={item.originalContent} title={item.title} />
                                        ) : (item.sourceType === 'youtube' || item.sourceType === 'web') && typeof item.originalContent === 'string' && (item.originalContent.includes('youtube.com') || item.originalContent.includes('youtu.be')) ? (
                                            <YoutubePlayer videoId={item.originalContent.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1] || ''} />
                                        ) : (
                                            <pre className="text-sm text-slate-600 whitespace-pre-wrap font-mono">{item.originalContent}</pre>
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                                            <span className="material-symbols-outlined text-4xl mb-2">visibility_off</span>
                                            <p>Không có dữ liệu gốc hiển thị</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        }
                        rightContent={
                            <div className="flex flex-col gap-4 h-full">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">notes</span> Văn bản trích xuất
                                </h3>
                                {isEditing ? (
                                    <textarea 
                                        value={editedText}
                                        onChange={(e) => setEditedText(e.target.value)}
                                        className="flex-1 w-full p-4 bg-white border border-sky-300 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none font-sans text-slate-700 leading-relaxed"
                                    />
                                ) : (
                                    <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 overflow-y-auto shadow-sm">
                                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{item.extractedText}</p>
                                    </div>
                                )}
                            </div>
                        }
                    />
                </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400 flex justify-between">
                <span>Tạo lúc: {new Date(item.createdAt).toLocaleString()}</span>
                <span>Cập nhật: {new Date(item.updatedAt).toLocaleString()}</span>
            </div>
        </div>
    );
};
