
import React, { useState, useEffect, useRef } from 'react';

// ----------------------------------------------------------------------
// 1. FORMAT EXPORTER: The Export Studio
// ----------------------------------------------------------------------

interface ExportConfig {
    format: 'PDF' | 'CSV' | 'JSON' | 'MARKDOWN' | 'ANKI' | 'HTML' | 'EPUB';
    includeImages: boolean;
    includeMetadata: boolean;
    includeLinks: boolean;
    compression: 'None' | 'Zip' | 'Gzip';
    layout: 'List' | 'Grid' | 'Tree' | 'Timeline' | 'Book';
    paperSize: 'A4' | 'Letter' | 'A3' | 'Custom';
    theme: 'Light' | 'Dark' | 'Sepia' | 'HighContrast';
}

export const FormatExporter: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<ExportConfig>({
        format: 'PDF',
        includeImages: true,
        includeMetadata: true,
        includeLinks: false,
        compression: 'None',
        layout: 'List',
        paperSize: 'A4',
        theme: 'Light'
    });
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewPage, setPreviewPage] = useState(1);

    const handleExport = () => {
        setIsExporting(true);
        setProgress(0);
        
        // Simulation of a complex export process with stages
        const stages = ['Preparing assets...', 'Compiling data...', 'Rendering layout...', 'Compressing...', 'Finalizing...'];
        let stageIndex = 0;
        
        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + Math.random() * 5;
                if (next > (stageIndex + 1) * 20 && stageIndex < 4) {
                    stageIndex++;
                }
                
                if (next >= 100) {
                    clearInterval(interval);
                    setIsExporting(false);
                    alert(`Đã xuất file ${config.format} thành công!`);
                    setIsOpen(false);
                    return 100;
                }
                return next;
            });
        }, 100);
    };

    if (!isOpen) {
        return (
            <div className="flex gap-2">
                <button onClick={() => setIsOpen(true)} className="flex-1 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 group">
                    <span className="material-symbols-outlined text-blue-400 group-hover:scale-110 transition-transform">ios_share</span>
                    <span className="text-sm font-bold text-slate-300">Xuất Dữ Liệu</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-[fadeIn_0.2s]">
            <div className="bg-[#1e293b] w-full max-w-5xl rounded-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0f172a]">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-400 text-2xl">output</span>
                            Export Studio Pro
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Chuyển đổi tri thức thành các định dạng lưu trữ chuyên nghiệp</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-blue-900/30 border border-blue-500/30 rounded-full text-blue-200 text-xs font-mono">
                            v2.4.0
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Left: Settings Panel */}
                    <div className="w-1/3 border-r border-white/10 overflow-y-auto p-6 space-y-8 bg-[#162032]">
                        {/* Format Selection */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">extension</span> Định dạng
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['PDF', 'CSV', 'JSON', 'MARKDOWN', 'ANKI', 'HTML', 'EPUB'].map((fmt) => (
                                    <button
                                        key={fmt}
                                        onClick={() => setConfig({ ...config, format: fmt as any })}
                                        className={`px-3 py-3 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                                            config.format === fmt 
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg transform scale-105' 
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/30'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {fmt === 'PDF' ? 'picture_as_pdf' : fmt === 'JSON' ? 'data_object' : fmt === 'ANKI' ? 'style' : 'description'}
                                        </span>
                                        {fmt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Options */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">checklist</span> Nội dung
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 border border-transparent hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-400">image</span>
                                        <span className="text-sm text-slate-300">Hình ảnh minh họa</span>
                                    </div>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${config.includeImages ? 'bg-blue-600 border-blue-600' : 'border-slate-500'}`}>
                                        {config.includeImages && <span className="material-symbols-outlined text-white text-xs">check</span>}
                                    </div>
                                    <input type="checkbox" checked={config.includeImages} onChange={e => setConfig({...config, includeImages: e.target.checked})} className="hidden" />
                                </label>
                                <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 border border-transparent hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-400">tag</span>
                                        <span className="text-sm text-slate-300">Metadata (Tags, Dates)</span>
                                    </div>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${config.includeMetadata ? 'bg-blue-600 border-blue-600' : 'border-slate-500'}`}>
                                        {config.includeMetadata && <span className="material-symbols-outlined text-white text-xs">check</span>}
                                    </div>
                                    <input type="checkbox" checked={config.includeMetadata} onChange={e => setConfig({...config, includeMetadata: e.target.checked})} className="hidden" />
                                </label>
                                <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 border border-transparent hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-400">link</span>
                                        <span className="text-sm text-slate-300">Liên kết Graph</span>
                                    </div>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${config.includeLinks ? 'bg-blue-600 border-blue-600' : 'border-slate-500'}`}>
                                        {config.includeLinks && <span className="material-symbols-outlined text-white text-xs">check</span>}
                                    </div>
                                    <input type="checkbox" checked={config.includeLinks} onChange={e => setConfig({...config, includeLinks: e.target.checked})} className="hidden" />
                                </label>
                            </div>
                        </div>

                        {/* Layout & Style */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">style</span> Giao diện & Bố cục
                            </label>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <span className="text-[10px] text-slate-400 block mb-1">Layout</span>
                                    <select 
                                        disabled={config.format !== 'PDF'}
                                        value={config.layout}
                                        onChange={(e) => setConfig({...config, layout: e.target.value as any})}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                    >
                                        <option value="List">Danh sách dọc</option>
                                        <option value="Grid">Lưới Flashcards</option>
                                        <option value="Tree">Cây tư duy</option>
                                        <option value="Timeline">Dòng thời gian</option>
                                        <option value="Book">Sách điện tử</option>
                                    </select>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block mb-1">Khổ giấy</span>
                                    <select 
                                        disabled={config.format !== 'PDF'}
                                        value={config.paperSize}
                                        onChange={(e) => setConfig({...config, paperSize: e.target.value as any})}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                    >
                                        <option value="A4">A4 (Tiêu chuẩn)</option>
                                        <option value="Letter">Letter (Mỹ)</option>
                                        <option value="A3">A3 (Lớn)</option>
                                        <option value="Custom">Tùy chỉnh</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 p-1 bg-black/20 rounded-lg">
                                {['Light', 'Dark', 'Sepia', 'HighContrast'].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setConfig({...config, theme: t as any})}
                                        className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-colors ${config.theme === t ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="w-2/3 bg-black/40 p-8 flex flex-col items-center justify-center relative">
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#1e293b] rounded-lg p-1 border border-white/10 z-10">
                            <button onClick={() => setPreviewPage(Math.max(1, previewPage - 1))} className="p-1 hover:bg-white/10 rounded text-slate-400"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                            <span className="text-xs font-mono text-slate-300 px-2">{previewPage} / 5</span>
                            <button onClick={() => setPreviewPage(Math.min(5, previewPage + 1))} className="p-1 hover:bg-white/10 rounded text-slate-400"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                        </div>

                        <div className={`relative bg-white shadow-2xl transition-all duration-500 ${config.paperSize === 'A4' ? 'aspect-[1/1.414] w-[400px]' : 'aspect-[1/1.29] w-[420px]'} ${config.theme === 'Dark' ? '!bg-slate-900 !text-white' : config.theme === 'Sepia' ? '!bg-[#f4ecd8] !text-[#5b4636]' : ''}`}>
                            {/* Document Content Simulation */}
                            <div className="p-8 h-full flex flex-col transform scale-100 origin-top">
                                <div className="border-b-2 border-slate-200 pb-4 mb-6">
                                    <h1 className="text-2xl font-black uppercase tracking-tight">Kiến Thức Tổng Hợp</h1>
                                    <p className="text-xs text-slate-500 mt-1">Generated by LearnAI • {new Date().toLocaleDateString()}</p>
                                </div>
                                
                                <div className={`flex-1 ${config.layout === 'Grid' ? 'grid grid-cols-2 gap-4' : 'space-y-6'}`}>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={`border border-slate-200 p-4 rounded ${config.layout === 'Grid' ? 'aspect-video flex flex-col justify-center text-center' : ''}`}>
                                            <h3 className="font-bold text-sm mb-1 text-blue-600">Khái niệm #{i + (previewPage - 1) * 4}</h3>
                                            <p className="text-[10px] leading-relaxed opacity-80">
                                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                            </p>
                                            {config.includeMetadata && (
                                                <div className="mt-2 flex gap-1 justify-center">
                                                    <span className="text-[8px] bg-slate-100 px-1 py-0.5 rounded text-slate-500">#science</span>
                                                    <span className="text-[8px] bg-slate-100 px-1 py-0.5 rounded text-slate-500">#review</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between text-[8px] text-slate-400">
                                    <span>LearnAI Export Module</span>
                                    <span>Page {previewPage}</span>
                                </div>
                            </div>

                            {/* Processing Overlay */}
                            {isExporting && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 text-white backdrop-blur-sm">
                                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <span className="font-bold text-lg mb-2">Đang xử lý... {Math.round(progress)}%</span>
                                    <p className="text-xs text-slate-400">Đang tối ưu hóa tài nguyên vector</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-[#0f172a] flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="material-symbols-outlined text-sm">info</span>
                        <span>Estimated Size: ~2.4 MB</span>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={handleExport}
                            disabled={isExporting}
                            className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">download</span>
                            Xuất Bản Ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 2. COLLECTION BINDER: Advanced Organization
// ----------------------------------------------------------------------

interface Collection {
    id: string;
    name: string;
    count: number;
    color: string;
    icon: string;
    description?: string;
    lastModified: Date;
    cover?: string;
}

export const CollectionBinder: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([
        { id: '1', name: 'Khoa học Cơ bản', count: 12, color: 'bg-blue-500', icon: 'science', description: 'Vật lý, Hóa học và Sinh học nhập môn', lastModified: new Date(), cover: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=300&q=80' },
        { id: '2', name: 'Lịch sử Thế giới', count: 5, color: 'bg-amber-500', icon: 'history_edu', description: 'Các sự kiện quan trọng thế kỷ 20', lastModified: new Date(), cover: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&w=300&q=80' },
        { id: '3', name: 'Lập trình Fullstack', count: 24, color: 'bg-green-500', icon: 'code', description: 'React, Node.js và Database', lastModified: new Date(), cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80' },
    ]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const handleAddCollection = () => {
        if (!newCollectionName.trim()) return;
        setCollections([...collections, {
            id: Date.now().toString(),
            name: newCollectionName,
            count: 0,
            color: 'bg-slate-500',
            icon: 'folder',
            description: 'Bộ sưu tập mới',
            lastModified: new Date()
        }]);
        setNewCollectionName('');
    };

    return (
        <div className={`mt-4 bg-[#1e293b] border border-white/10 rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-cyan-500/30' : ''}`}>
            <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 bg-gradient-to-r from-[#1e293b] to-[#24344d]"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-cyan-500/10 text-cyan-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        <span className="material-symbols-outlined text-xl">folder_open</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-200">Quản lý Bộ Sưu Tập</h4>
                        <p className="text-[10px] text-slate-400">Tổ chức và nhóm các bài học</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-slate-300 font-mono">{collections.length}</span>
                    <span className="material-symbols-outlined text-slate-500 text-sm">expand_more</span>
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-white/5 bg-black/20 animate-slide-down">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2">
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}><span className="material-symbols-outlined text-lg">list</span></button>
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}><span className="material-symbols-outlined text-lg">grid_view</span></button>
                        </div>
                        <button className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">sort</span> Sắp xếp
                        </button>
                    </div>

                    <div className={`max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}`}>
                        {collections.map(col => (
                            <div key={col.id} className={`group cursor-pointer border border-white/5 hover:border-white/20 transition-all ${viewMode === 'grid' ? 'bg-[#1e293b] rounded-xl overflow-hidden' : 'flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10'}`}>
                                {viewMode === 'grid' ? (
                                    <>
                                        <div className="h-20 bg-slate-800 relative overflow-hidden">
                                            {col.cover && <img src={col.cover} alt="Cover" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />}
                                            <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-bold backdrop-blur-sm">{col.count}</div>
                                        </div>
                                        <div className="p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                                                <h5 className="text-sm font-bold text-white truncate">{col.name}</h5>
                                            </div>
                                            <p className="text-[10px] text-slate-400 truncate">{col.description}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg ${col.color} bg-opacity-20 flex items-center justify-center text-white`}>
                                                <span className="material-symbols-outlined text-lg">{col.icon}</span>
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-bold text-slate-200 group-hover:text-white">{col.name}</h5>
                                                <p className="text-[10px] text-slate-500">{col.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-500">{col.count} items</span>
                                            <button className="text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-lg">more_vert</span></button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input 
                                    value={newCollectionName}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCollection()}
                                    placeholder="Tạo bộ sưu tập mới..." 
                                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 pl-9"
                                />
                                <span className="material-symbols-outlined text-slate-500 absolute left-2.5 top-2.5 text-lg">add_circle</span>
                            </div>
                            <button 
                                onClick={handleAddCollection}
                                disabled={!newCollectionName.trim()}
                                className="px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 text-sm font-bold transition-colors"
                            >
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ----------------------------------------------------------------------
// 3. SOCIAL SHARE CARD: Visual Generator & Editor
// ----------------------------------------------------------------------

interface Sticker {
    id: string;
    icon: string;
    x: number;
    y: number;
}

export const SocialShareCard: React.FC = () => {
    const [theme, setTheme] = useState<'neon' | 'paper' | 'dark' | 'gradient'>('neon');
    const [showModal, setShowModal] = useState(false);
    const [customText, setCustomText] = useState("Lượng tử hóa Tri thức");
    const [stickers, setStickers] = useState<Sticker[]>([]);

    const getThemeStyles = () => {
        switch(theme) {
            case 'neon': return 'bg-gradient-to-br from-purple-900 to-black border-2 border-cyan-500 text-cyan-50';
            case 'paper': return 'bg-[#f8f5f2] text-slate-900 border-none';
            case 'dark': return 'bg-slate-900 text-white border border-slate-700';
            case 'gradient': return 'bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 text-white border-none';
        }
    };

    const addSticker = (icon: string) => {
        setStickers([...stickers, { id: Date.now().toString(), icon, x: Math.random() * 200, y: Math.random() * 200 }]);
    };

    return (
        <>
            <button 
                onClick={() => setShowModal(true)}
                className="w-full mt-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-pink-500/25 transition-all flex items-center justify-center gap-2 group"
            >
                <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">share</span>
                Thiết Kế Thẻ Chia Sẻ
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-[fadeIn_0.2s]">
                    <div className="bg-[#1e1e1e] rounded-2xl w-full max-w-4xl border border-white/10 shadow-2xl flex overflow-hidden h-[80vh]">
                        
                        {/* Editor Canvas (Left) */}
                        <div className="flex-1 p-8 flex items-center justify-center bg-[#121212] relative">
                            <div className={`aspect-[4/5] h-full max-h-[500px] rounded-2xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-500 ${getThemeStyles()}`}>
                                {theme === 'neon' && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.2),transparent)] pointer-events-none"></div>}
                                
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6 opacity-80">
                                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                            <span className="material-symbols-outlined text-2xl">sailing</span>
                                        </div>
                                        <div>
                                            <span className="font-black uppercase tracking-widest text-xs block">LearnAI</span>
                                            <span className="text-[10px] font-mono opacity-80">DISCOVERY CARD</span>
                                        </div>
                                    </div>
                                    
                                    <h2 className="text-4xl font-black leading-tight mb-4 break-words" contentEditable suppressContentEditableWarning>
                                        {customText}
                                    </h2>
                                    
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        Vừa hoàn thành
                                    </div>
                                </div>

                                {/* Stickers Layer */}
                                {stickers.map(sticker => (
                                    <div 
                                        key={sticker.id} 
                                        className="absolute text-4xl cursor-move select-none drop-shadow-lg transform hover:scale-110 transition-transform" 
                                        style={{ top: sticker.y, left: sticker.x }}
                                        onClick={() => setStickers(stickers.filter(s => s.id !== sticker.id))}
                                    >
                                        {sticker.icon}
                                    </div>
                                ))}

                                <div className="relative z-10 flex justify-between items-end border-t border-white/20 pt-6 mt-6">
                                    <div>
                                        <div className="text-2xl font-black">+500 XP</div>
                                        <div className="text-xs opacity-70">Knowledge Gained</div>
                                    </div>
                                    <div className="text-right">
                                        <img src="https://api.dicebear.com/7.x/identicon/svg?seed=LearnAI" alt="QR" className="w-12 h-12 rounded bg-white p-1" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls Panel (Right) */}
                        <div className="w-80 bg-[#1e293b] border-l border-white/10 p-6 flex flex-col gap-6 overflow-y-auto">
                            <div className="flex justify-between items-center">
                                <h3 className="text-white font-bold text-lg">Tùy chỉnh</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Chủ đề (Theme)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['neon', 'paper', 'dark', 'gradient'].map((t) => (
                                        <button 
                                            key={t}
                                            onClick={() => setTheme(t as any)}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all border ${
                                                theme === t 
                                                ? 'bg-blue-600 border-blue-500 text-white shadow-md' 
                                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Nội dung</label>
                                <input 
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-purple-500 mb-2"
                                    placeholder="Nhập tiêu đề..."
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Stickers</label>
                                <div className="flex flex-wrap gap-2">
                                    {['🔥', '🚀', '⭐', '🎓', '🧠', '💡', '🎉', '🏆'].map(emoji => (
                                        <button 
                                            key={emoji}
                                            onClick={() => addSticker(emoji)}
                                            className="w-10 h-10 bg-white/5 hover:bg-white/20 rounded-lg text-xl flex items-center justify-center transition-colors"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
                                <button className="w-full py-3 bg-[#1da1f2] hover:bg-[#1a91da] text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg transition-transform hover:scale-105">
                                    Chia sẻ lên Twitter
                                </button>
                                <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-colors">
                                    <span className="material-symbols-outlined text-lg">download</span> Tải ảnh về (PNG)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// ----------------------------------------------------------------------
// 4. RELATED TOPIC GRAPH (Mini Widget)
// ----------------------------------------------------------------------

export const RelatedTopicGraph: React.FC<{ topics?: string[] }> = ({ topics = ['Physics', 'Quantum', 'Time', 'Gravity', 'Space'] }) => {
    return (
        <div className="mt-4 p-5 bg-[#0f172a] rounded-xl border border-white/10 w-full relative overflow-hidden group">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 relative z-10 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-cyan-400">hub</span>
                Mạng lưới liên quan
            </h4>
            
            <div className="flex flex-wrap gap-3 relative z-10">
                {topics.map((t, i) => (
                    <div 
                        key={t} 
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-600/50 rounded-full text-xs text-cyan-200 cursor-pointer hover:bg-cyan-900/50 hover:border-cyan-500/80 hover:text-white transition-all hover:scale-105 shadow-sm"
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${i % 2 === 0 ? 'bg-cyan-400' : 'bg-purple-400'}`}></div>
                        {t}
                        <span className="material-symbols-outlined text-[10px] opacity-50">arrow_outward</span>
                    </div>
                ))}
            </div>

            {/* Background SVG Decoration */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity">
                <circle cx="85%" cy="70%" r="60" stroke="#38bdf8" strokeWidth="1" fill="none" strokeDasharray="6 4" className="animate-[spin_10s_linear_infinite]" />
                <circle cx="20%" cy="30%" r="30" stroke="#a855f7" strokeWidth="1" fill="none" className="animate-pulse" />
                <path d="M 50 150 Q 150 50 250 150" stroke="#fff" strokeWidth="0.5" fill="none" opacity="0.5" />
            </svg>
        </div>
    );
};

// ----------------------------------------------------------------------
// 5. FEEDBACK LOOP: Detailed & Gamified
// ----------------------------------------------------------------------

export const FeedbackLoop: React.FC = () => {
    const [step, setStep] = useState(0);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    if (step === 2) {
        return (
            <div className="mt-4 p-6 bg-green-900/20 border border-green-500/30 rounded-xl text-center animate-[fadeIn_0.3s]">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-green-400">
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                </div>
                <p className="text-sm text-green-200 font-bold mb-1">Cảm ơn phản hồi của bạn!</p>
                <p className="text-xs text-green-400/70">AI sẽ học hỏi từ điều này để phục vụ tốt hơn.</p>
                <div className="mt-3 inline-block px-3 py-1 bg-green-500/10 rounded-full text-[10px] text-green-300 font-bold border border-green-500/20">
                    +10 Karma Points
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4 p-5 bg-[#1e293b] rounded-xl border border-white/10 shadow-lg">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex justify-between items-center">
                <span>Chất lượng nội dung</span>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-500 border border-white/5">AI Feedback Loop</span>
            </h4>
            
            {step === 0 && (
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-slate-300">Nội dung này có hữu ích với bạn không?</p>
                    <div className="flex justify-between gap-3">
                        <button onClick={() => { setRating(1); setStep(1); }} className="flex-1 py-3 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all border border-white/5 hover:border-red-500/50 flex flex-col items-center gap-1 group">
                            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">thumb_down</span>
                            <span className="text-[10px] font-bold">Không tốt</span>
                        </button>
                        <button onClick={() => { setRating(3); setStep(1); }} className="flex-1 py-3 bg-white/5 hover:bg-yellow-500/20 hover:text-yellow-400 rounded-xl transition-all border border-white/5 hover:border-yellow-500/50 flex flex-col items-center gap-1 group">
                            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">sentiment_neutral</span>
                            <span className="text-[10px] font-bold">Bình thường</span>
                        </button>
                        <button onClick={() => { setRating(5); setStep(1); }} className="flex-1 py-3 bg-white/5 hover:bg-green-500/20 hover:text-green-400 rounded-xl transition-all border border-white/5 hover:border-green-500/50 flex flex-col items-center gap-1 group">
                            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">thumb_up</span>
                            <span className="text-[10px] font-bold">Rất tốt</span>
                        </button>
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="animate-[slideInRight_0.3s]">
                    <p className="text-sm text-slate-300 mb-3">Bạn có muốn góp ý thêm gì không?</p>
                    <textarea 
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none h-20 mb-3 placeholder-slate-500"
                        placeholder="Nội dung này có thể cải thiện ở..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <button onClick={() => setStep(2)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-bold rounded-lg transition-colors">Bỏ qua</button>
                        <button onClick={() => setStep(2)} className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg">Gửi</button>
                    </div>
                </div>
            )}
        </div>
    );
};
