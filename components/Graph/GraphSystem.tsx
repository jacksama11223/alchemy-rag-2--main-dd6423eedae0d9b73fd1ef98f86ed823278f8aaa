
import React, { useState, useEffect } from 'react';

// ----------------------------------------------------------------------
// 1. HIGH RES POSTER EXPORTER: The Render Farm
// ----------------------------------------------------------------------

interface RenderConfig {
    resolution: '4K' | '8K' | '16K' | 'Custom';
    customWidth?: number;
    customHeight?: number;
    format: 'PNG' | 'SVG' | 'PDF' | 'JPEG';
    theme: 'Dark' | 'Light' | 'Blueprint' | 'Cyberpunk';
    showWatermark: boolean;
    transparentBg: boolean;
    includeLegend: boolean;
    quality: number;
}

export const HighResPosterExporter: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const [config, setConfig] = useState<RenderConfig>({
        resolution: '8K',
        format: 'PNG',
        theme: 'Dark',
        showWatermark: true,
        transparentBg: false,
        includeLegend: true,
        quality: 100
    });
    const [isRendering, setIsRendering] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleRender = () => {
        setIsRendering(true);
        setProgress(0);
        
        // Simulate heavy rendering process
        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + Math.random() * 10;
                if (next >= 100) {
                    clearInterval(interval);
                    setIsRendering(false);
                    onClose();
                    alert("Render hoàn tất! File đã được tải xuống.");
                    return 100;
                }
                return next;
            });
        }, 200);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[fadeIn_0.2s]" onClick={() => !isRendering && onClose()}>
            <div className="bg-[#1e1e1e] w-full max-w-2xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 bg-[#0f172a] border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-cyan-400 text-2xl">camera_outdoor</span> Render Farm Studio
                    </h3>
                    <div className="flex gap-2">
                        <span className="text-xs bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded border border-cyan-500/30">GPU Ready</span>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" disabled={isRendering}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 flex gap-8 bg-[#121212]">
                    {/* Settings Column */}
                    <div className="w-1/2 space-y-6">
                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase mb-2 block tracking-wider">Độ phân giải</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['4K', '8K', '16K', 'Custom'].map(res => (
                                    <button 
                                        key={res}
                                        onClick={() => setConfig({...config, resolution: res as any})}
                                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                                            config.resolution === res 
                                            ? 'bg-cyan-600 border-cyan-500 text-white shadow-md' 
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                        }`}
                                    >
                                        {res}
                                    </button>
                                ))}
                            </div>
                            {config.resolution === 'Custom' && (
                                <div className="flex gap-2 mt-2">
                                    <input placeholder="W" type="number" className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white w-full focus:border-cyan-500 outline-none" />
                                    <span className="text-slate-500 self-center">x</span>
                                    <input placeholder="H" type="number" className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white w-full focus:border-cyan-500 outline-none" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase mb-2 block tracking-wider">Định dạng & Chất lượng</label>
                            <div className="flex gap-2 mb-3">
                                {['PNG', 'JPEG', 'SVG', 'PDF'].map(fmt => (
                                    <button 
                                        key={fmt}
                                        onClick={() => setConfig({...config, format: fmt as any})}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
                                            config.format === fmt ? 'bg-white text-black' : 'bg-white/5 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {fmt}
                                    </button>
                                ))}
                            </div>
                            {(config.format === 'JPEG' || config.format === 'PNG') && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400">Quality:</span>
                                    <input 
                                        type="range" min="50" max="100" value={config.quality} 
                                        onChange={e => setConfig({...config, quality: Number(e.target.value)})}
                                        className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                                    />
                                    <span className="text-xs text-cyan-400 font-mono w-8">{config.quality}%</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase mb-2 block tracking-wider">Tùy chọn hiển thị</label>
                            <div className="space-y-2">
                                <label className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                                    <span className="text-sm text-slate-300">Watermark</span>
                                    <input type="checkbox" checked={config.showWatermark} onChange={e => setConfig({...config, showWatermark: e.target.checked})} className="bg-black border-white/20 rounded text-cyan-500 focus:ring-0" />
                                </label>
                                <label className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                                    <span className="text-sm text-slate-300">Nền trong suốt</span>
                                    <input type="checkbox" checked={config.transparentBg} onChange={e => setConfig({...config, transparentBg: e.target.checked})} className="bg-black border-white/20 rounded text-cyan-500 focus:ring-0" />
                                </label>
                                <label className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                                    <span className="text-sm text-slate-300">Bao gồm chú giải (Legend)</span>
                                    <input type="checkbox" checked={config.includeLegend} onChange={e => setConfig({...config, includeLegend: e.target.checked})} className="bg-black border-white/20 rounded text-cyan-500 focus:ring-0" />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Preview Column */}
                    <div className="w-1/2 flex flex-col gap-4">
                        <div className="flex-1 bg-black/40 rounded-xl border border-white/10 relative overflow-hidden flex items-center justify-center p-4 group">
                            {/* Mock Preview */}
                            <div className={`w-full aspect-[16/9] rounded border border-white/20 relative shadow-2xl transition-all duration-500 ${
                                config.theme === 'Light' ? 'bg-white invert' : 
                                config.theme === 'Blueprint' ? 'bg-[#0055aa] opacity-80' : 
                                config.theme === 'Cyberpunk' ? 'bg-black shadow-[0_0_30px_fuchsia]' : 'bg-[#020410]'
                            }`}>
                                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                    <span className="material-symbols-outlined text-6xl text-slate-500">hub</span>
                                </div>
                                {config.showWatermark && <div className="absolute bottom-2 right-2 text-[8px] text-white/50 font-bold tracking-widest">LearnAI</div>}
                                {config.includeLegend && <div className="absolute bottom-2 left-2 w-16 h-8 bg-white/10 rounded"></div>}
                            </div>

                            {isRendering && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-4xl animate-spin text-cyan-400 mb-3">blur_on</span>
                                    <span className="text-white font-bold mb-1">Rendering... {Math.round(progress)}%</span>
                                    <div className="w-32 h-1 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-400 transition-all duration-200" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Theme Selector */}
                        <div className="grid grid-cols-4 gap-2">
                            {['Dark', 'Light', 'Blueprint', 'Cyberpunk'].map(t => (
                                <button 
                                    key={t}
                                    onClick={() => setConfig({...config, theme: t as any})}
                                    className={`py-2 rounded-lg text-[10px] font-bold transition-all border ${
                                        config.theme === t 
                                        ? 'border-white text-white bg-white/10' 
                                        : 'border-transparent text-slate-500 hover:text-slate-300 bg-white/5'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-[#0f172a] border-t border-white/10 flex justify-between items-center">
                    <p className="text-xs text-slate-500">Estimated Size: ~12 MB</p>
                    <div className="flex gap-3">
                        <button onClick={onClose} disabled={isRendering} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50">
                            Hủy
                        </button>
                        <button 
                            onClick={handleRender} 
                            disabled={isRendering}
                            className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white font-bold shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                        >
                            <span className="material-symbols-outlined">download</span>
                            {isRendering ? 'Đang xử lý...' : 'Render & Tải về'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 2. STORAGE QUOTA BAR & FILE MANAGER: The OS Interface
// ----------------------------------------------------------------------

export const StorageQuotaBar: React.FC<{ isOpen: boolean, onClose: () => void, onOpen?: () => void }> = ({ isOpen, onClose, onOpen }) => {
    // Mock Data
    const usage = {
        images: 25, // MB
        nodes: 5,
        audio: 15,
        backups: 10,
        total: 55,
        limit: 500
    };
    const percent = (usage.total / usage.limit) * 100;

    // File Manager State
    const [activeTab, setActiveTab] = useState<'all' | 'images' | 'audio' | 'backups'>('all');
    const [files, setFiles] = useState([
        { id: 1, name: 'Physics_Graph_Backup.json', size: '2.4 MB', type: 'backup', date: '2023-10-01' },
        { id: 2, name: 'Quantum_Concept.png', size: '1.2 MB', type: 'image', date: '2023-10-05' },
        { id: 3, name: 'Lecture_Note_Audio.mp3', size: '5.6 MB', type: 'audio', date: '2023-10-10' },
        { id: 4, name: 'React_Hooks_Map.json', size: '1.1 MB', type: 'backup', date: '2023-10-12' },
        { id: 5, name: 'Avatar.jpg', size: '0.5 MB', type: 'image', date: '2023-10-15' },
    ]);

    const filteredFiles = activeTab === 'all' ? files : files.filter(f => f.type === activeTab);

    return (
        <>
            <div className="relative group">
                <div 
                    className="px-3 py-2 cursor-pointer hover:bg-white/5 rounded-lg transition-colors"
                    onClick={onOpen}
                >
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 group-hover:text-slate-200">
                        <span>Storage</span>
                        <span>{Math.round(percent)}%</span>
                    </div>
                    <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                        <div className="h-full bg-blue-500" style={{ width: `${(usage.images/usage.limit)*100}%` }}></div>
                        <div className="h-full bg-green-500" style={{ width: `${(usage.nodes/usage.limit)*100}%` }}></div>
                        <div className="h-full bg-purple-500" style={{ width: `${(usage.audio/usage.limit)*100}%` }}></div>
                        <div className="h-full bg-orange-500" style={{ width: `${(usage.backups/usage.limit)*100}%` }}></div>
                    </div>
                </div>
            </div>

            {/* File Manager Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-[fadeIn_0.2s]" onClick={onClose}>
                    <div className="bg-[#1e293b] w-full max-w-3xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden flex flex-col h-[70vh]" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f172a]">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">folder_open</span> File Manager
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Sidebar */}
                            <div className="w-48 bg-[#162032] border-r border-white/10 p-4 space-y-2">
                                <button onClick={() => setActiveTab('all')} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'all' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>
                                    <span className="material-symbols-outlined text-sm">dashboard</span> All Files
                                </button>
                                <button onClick={() => setActiveTab('images')} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'images' ? 'bg-blue-900/30 text-blue-300' : 'text-slate-400 hover:text-blue-300'}`}>
                                    <span className="material-symbols-outlined text-sm">image</span> Images
                                </button>
                                <button onClick={() => setActiveTab('audio')} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'audio' ? 'bg-purple-900/30 text-purple-300' : 'text-slate-400 hover:text-purple-300'}`}>
                                    <span className="material-symbols-outlined text-sm">audio_file</span> Audio
                                </button>
                                <button onClick={() => setActiveTab('backups')} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'backups' ? 'bg-orange-900/30 text-orange-300' : 'text-slate-400 hover:text-orange-300'}`}>
                                    <span className="material-symbols-outlined text-sm">backup</span> Backups
                                </button>
                                
                                <div className="mt-8 pt-4 border-t border-white/10">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Usage</div>
                                    <div className="text-xs text-white font-mono mb-1">{usage.total}MB / {usage.limit}MB</div>
                                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-400" style={{ width: `${percent}%` }}></div>
                                    </div>
                                    <button className="w-full mt-4 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded text-[10px] font-bold transition-colors">
                                        Clear Cache
                                    </button>
                                </div>
                            </div>

                            {/* Main File List */}
                            <div className="flex-1 overflow-y-auto p-4 bg-[#121212]">
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex justify-between px-4 py-2 text-[10px] font-bold text-slate-500 uppercase border-b border-white/10">
                                        <span className="w-1/2">Name</span>
                                        <span className="w-20">Type</span>
                                        <span className="w-20">Size</span>
                                        <span className="w-24">Date</span>
                                        <span className="w-10 text-right">Action</span>
                                    </div>
                                    {filteredFiles.map(file => (
                                        <div key={file.id} className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group cursor-pointer">
                                            <div className="w-1/2 flex items-center gap-3">
                                                <span className={`material-symbols-outlined text-lg ${
                                                    file.type === 'image' ? 'text-blue-400' :
                                                    file.type === 'audio' ? 'text-purple-400' : 'text-orange-400'
                                                }`}>
                                                    {file.type === 'image' ? 'image' : file.type === 'audio' ? 'headphones' : 'settings_backup_restore'}
                                                </span>
                                                <span className="text-sm text-slate-200 truncate pr-4">{file.name}</span>
                                            </div>
                                            <span className="w-20 text-xs text-slate-400 capitalize">{file.type}</span>
                                            <span className="w-20 text-xs text-slate-400 font-mono">{file.size}</span>
                                            <span className="w-24 text-xs text-slate-500">{file.date}</span>
                                            <div className="w-10 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setFiles(files.filter(f => f.id !== file.id)); }}
                                                    className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredFiles.length === 0 && (
                                        <div className="text-center py-10 text-slate-500 text-sm italic">
                                            Không có file nào trong mục này.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// ----------------------------------------------------------------------
// 3. GLOBAL TRASH CAN: Recycle Bin Manager with Restore
// ----------------------------------------------------------------------

interface DeletedItem {
    id: string;
    name: string;
    type: string;
    date: string;
    originalPath: string;
}

export const GlobalTrashCan: React.FC<{ isOpen: boolean, onToggle: () => void }> = ({ isOpen, onToggle }) => {
    const [items, setItems] = useState<DeletedItem[]>([
        { id: '1', name: 'Old Physics Concept', type: 'Node', date: '2 mins ago', originalPath: '/Science/Physics' },
        { id: '2', name: 'React Hook Image', type: 'Image', date: '1 hour ago', originalPath: '/Coding/Assets' },
        { id: '3', name: 'Biology Test Link', type: 'Link', date: '1 day ago', originalPath: '/Biology/Refs' },
        { id: '4', name: 'Failed Experiment #4', type: 'Graph', date: '3 days ago', originalPath: '/Drafts' },
    ]);

    const handleRestore = (id: string) => {
        // Logic to restore would go here (call parent prop)
        setItems(prev => prev.filter(i => i.id !== id));
        alert("Đã khôi phục item về vị trí cũ.");
    };

    const handleEmpty = () => {
        if (confirm("Xóa vĩnh viễn tất cả mục? Hành động này không thể hoàn tác.")) {
            setItems([]);
        }
    };

    const handleDeleteSingle = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    return (
        <div className={`absolute bottom-6 right-64 z-30 transition-all`}>
            <button 
                onClick={onToggle}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border transition-all ${
                    isOpen 
                    ? 'bg-red-600 text-white border-red-400 scale-110 shadow-red-500/50' 
                    : 'bg-[#1e1e1e] text-slate-400 border-white/10 hover:text-red-400 hover:border-red-500/50'
                }`}
                title="Thùng rác"
            >
                <span className="material-symbols-outlined text-lg">delete_sweep</span>
                {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold border border-[#1e1e1e]">
                        {items.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute bottom-full mb-3 right-0 w-80 bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl animate-[fadeInUp_0.2s] overflow-hidden flex flex-col max-h-96">
                    <div className="p-3 border-b border-white/5 bg-gradient-to-r from-red-900/20 to-transparent flex justify-between items-center">
                        <span className="text-xs font-bold text-red-200 uppercase flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">recycling</span> Thùng rác
                        </span>
                        <button 
                            onClick={handleEmpty}
                            disabled={items.length === 0}
                            className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold disabled:opacity-50 transition-colors"
                        >
                            Làm sạch
                        </button>
                    </div>
                    
                    <div className="overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 flex-1">
                        {items.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                                <span className="material-symbols-outlined text-3xl opacity-50">delete_outline</span>
                                <p className="text-xs italic">Thùng rác trống</p>
                            </div>
                        ) : (
                            items.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-2 hover:bg-white/5 rounded-lg group transition-colors border border-transparent hover:border-white/5">
                                    <div className="flex flex-col min-w-0 flex-1 pr-2">
                                        <span className="text-xs text-slate-200 font-medium truncate">{item.name}</span>
                                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                            {item.type} • {item.date}
                                        </span>
                                        <span className="text-[9px] text-slate-600 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                            From: {item.originalPath}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleRestore(item.id)}
                                            className="p-1.5 text-green-400 hover:bg-green-500/20 rounded transition-colors" 
                                            title="Khôi phục"
                                        >
                                            <span className="material-symbols-outlined text-sm">restore_from_trash</span>
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteSingle(item.id)}
                                            className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors" 
                                            title="Xóa vĩnh viễn"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};