
import React, { useState, useEffect, useRef } from 'react';

// ----------------------------------------------------------------------
// 1. LAYER STACK CONTROLLER: Advanced Layer Management
// ----------------------------------------------------------------------

export interface Layer {
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    opacity: number;
    blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
    type: 'vector' | 'raster' | 'group' | 'selection';
    nodeIds?: string[]; // IDs of nodes belonging to this layer
}

interface LayerStackControllerProps {
    isOpen: boolean;
    layers: Layer[];
    setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
    className?: string; // Added for custom styling/positioning
}

export const LayerStackController: React.FC<LayerStackControllerProps> = ({ isOpen, layers, setLayers, className = '' }) => {
    const [activeLayerId, setActiveLayerId] = useState<string>('1');
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleVisible = (id: string) => {
        setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
    };

    const toggleLocked = (id: string) => {
        setLayers(layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l));
    };

    const updateOpacity = (id: string, val: number) => {
        setLayers(layers.map(l => l.id === id ? { ...l, opacity: val } : l));
    };

    const deleteLayer = (id: string) => {
        if (confirm("Bạn có chắc muốn xóa lớp này?")) {
            setLayers(layers.filter(l => l.id !== id));
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-lg transition-all ${className}`}>
            {/* Header */}
            <div 
                className="p-3 bg-[#252525] border-b border-white/10 flex justify-between items-center cursor-pointer"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <h5 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">layers</span> Layers ({layers.length})
                </h5>
                <div className="flex gap-1 items-center">
                    <button 
                        className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors" 
                        title="New Layer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="material-symbols-outlined text-sm">add_box</span>
                    </button>
                    <span className={`material-symbols-outlined text-sm text-slate-500 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>expand_more</span>
                </div>
            </div>
            
            {/* Layer List */}
            {!isCollapsed && (
                <>
                    <div className="flex-1 overflow-y-auto bg-[#1a1a1a] max-h-[200px]">
                        {layers.map(layer => (
                            <div 
                                key={layer.id} 
                                onClick={() => setActiveLayerId(layer.id)}
                                className={`flex flex-col border-b border-white/5 transition-colors cursor-pointer ${
                                    activeLayerId === layer.id ? 'bg-blue-900/20' : 'hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center gap-2 p-2">
                                    <button onClick={(e) => { e.stopPropagation(); toggleVisible(layer.id); }} className={`text-slate-400 hover:text-white transition-colors ${!layer.visible && 'opacity-50 text-slate-600'}`}>
                                        <span className="material-symbols-outlined text-sm">{layer.visible ? 'visibility' : 'visibility_off'}</span>
                                    </button>
                                    
                                    <span className="material-symbols-outlined text-slate-500 text-sm">
                                        {layer.type === 'group' ? 'folder' : layer.type === 'raster' ? 'image' : layer.type === 'selection' ? 'select_all' : 'polyline'}
                                    </span>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-xs truncate select-none ${activeLayerId === layer.id ? 'text-blue-300 font-bold' : 'text-slate-200'}`}>
                                            {layer.name}
                                        </div>
                                    </div>
                                    
                                    <button onClick={(e) => { e.stopPropagation(); toggleLocked(layer.id); }} className={`text-slate-400 hover:text-white transition-colors ${layer.locked ? 'text-amber-500 opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <span className="material-symbols-outlined text-sm">{layer.locked ? 'lock' : 'lock_open'}</span>
                                    </button>
                                </div>

                                {/* Extended properties only for active layer */}
                                {activeLayerId === layer.id && (
                                    <div className="px-2 pb-2 pt-0 flex items-center gap-2 animate-slide-down">
                                        <span className="text-[9px] text-slate-500 font-mono w-8 text-right">{Math.round(layer.opacity * 100)}%</span>
                                        <input 
                                            type="range" min="0" max="1" step="0.1" 
                                            value={layer.opacity}
                                            onChange={(e) => updateOpacity(layer.id, parseFloat(e.target.value))}
                                            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                        />
                                        <span className="text-[9px] text-slate-500 uppercase border border-white/10 px-1 rounded">{layer.blendMode}</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                                            className="text-red-400 hover:text-red-300 ml-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-2 bg-[#1e1e1e] border-t border-white/10 flex justify-between text-[10px] text-slate-500">
                        <span>{layers.length} Layers Active</span>
                        <span>Normal Mode</span>
                    </div>
                </>
            )}
        </div>
    );
};

// ----------------------------------------------------------------------
// NEW: ZONE ACTION MODAL (The Bridge between Spatial & Workflow)
// ----------------------------------------------------------------------

interface ZoneActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    nodeCount: number;
    onAction: (action: 'LAYER' | 'QUEST' | 'KANBAN' | 'MATRIX', name: string, priority?: number) => void;
}

export const ZoneActionModal: React.FC<ZoneActionModalProps> = ({ isOpen, onClose, nodeCount, onAction }) => {
    const [name, setName] = useState('');
    const [mode, setMode] = useState<'ORGANIZE' | 'ACTION'>('ORGANIZE');

    if (!isOpen) return null;

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-96 bg-[#1e293b]/95 backdrop-blur-xl border border-indigo-500/50 rounded-2xl shadow-[0_0_50px_rgba(99,102,241,0.3)] animate-bounce-in overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-4 border-b border-indigo-500/30 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-400">select_all</span>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Vùng đã chọn</h3>
                        <p className="text-[10px] text-indigo-300 font-mono">{nodeCount} Nodes Detected</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>

            <div className="p-4 space-y-4">
                {/* Mode Switcher */}
                <div className="flex bg-black/40 p-1 rounded-lg">
                    <button 
                        onClick={() => setMode('ORGANIZE')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'ORGANIZE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Tổ Chức (Layer)
                    </button>
                    <button 
                        onClick={() => setMode('ACTION')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'ACTION' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Hành Động (Task)
                    </button>
                </div>

                <input 
                    autoFocus
                    type="text" 
                    placeholder={mode === 'ORGANIZE' ? "Đặt tên Layer mới..." : "Đặt tên Nhiệm vụ/Quest..."}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                {mode === 'ORGANIZE' ? (
                    <div className="space-y-2">
                        <button 
                            onClick={() => onAction('LAYER', name || `New Layer ${Date.now()}`)}
                            className="w-full py-3 bg-white/5 border border-white/10 hover:bg-indigo-600/20 hover:border-indigo-500/50 rounded-xl flex items-center justify-center gap-2 text-slate-200 hover:text-indigo-300 transition-all group"
                        >
                            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">layers</span>
                            <span>Lưu vào Layer Stack</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => onAction('QUEST', name || `Quest: Master ${nodeCount} items`)}
                            className="p-3 bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-500/30 hover:border-amber-400 rounded-xl flex flex-col items-center gap-1 text-amber-200 transition-all hover:scale-105"
                        >
                            <span className="material-symbols-outlined text-2xl mb-1">assignment_turned_in</span>
                            <span className="text-xs font-bold">Tạo Quest (XP)</span>
                        </button>
                        <button 
                            onClick={() => onAction('KANBAN', name || `Task: Review ${nodeCount} nodes`, 1)}
                            className="p-3 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 hover:border-blue-400 rounded-xl flex flex-col items-center gap-1 text-blue-200 transition-all hover:scale-105"
                        >
                            <span className="material-symbols-outlined text-2xl mb-1">view_kanban</span>
                            <span className="text-xs font-bold">Thêm vào Kanban</span>
                        </button>
                        <button 
                            onClick={() => onAction('MATRIX', name || `Critical: ${nodeCount} items`, 1)}
                            className="col-span-2 p-3 bg-gradient-to-br from-red-900/30 to-pink-900/30 border border-red-500/30 hover:border-red-400 rounded-xl flex items-center justify-center gap-2 text-red-200 transition-all hover:scale-[1.02]"
                        >
                            <span className="material-symbols-outlined">priority_high</span>
                            <span className="text-xs font-bold">Eisenhower (Làm ngay)</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 3. ZONE FENCING TOOL: Territory Manager & Logic Grouping
// ----------------------------------------------------------------------

export const ZoneFencingTool: React.FC<{ active: boolean, onToggle: () => void, onStartDraw?: () => void }> = ({ active, onToggle, onStartDraw }) => {
    return (
        <div className="relative group w-full">
            <button 
                onClick={() => { onToggle(); if(!active && onStartDraw) onStartDraw(); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                    active 
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/50' 
                    : 'bg-white/5 text-slate-300 border-white/10 hover:text-white hover:bg-white/10'
                }`}
                title="Zone Commander"
            >
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">select_all</span>
                    <span className="text-xs font-bold">Vùng Chọn (Zone)</span>
                </div>
                {active && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>}
            </button>
        </div>
    );
};

// ----------------------------------------------------------------------
// 4. STICKY NOTE WIDGET: Draggable Smart Memo
// ----------------------------------------------------------------------

export const StickyNoteWidget: React.FC = () => {
    const [notes, setNotes] = useState([
        { id: 1, text: "Ý tưởng: Kết nối AI với Blockchain?", color: "bg-yellow-200", x: 100, y: 150, z: 10, minimized: false }
    ]);
    
    // Using refs to handle drag state without excessive re-renders
    const draggedNoteId = useRef<number | null>(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const addNote = () => {
        setNotes([...notes, { 
            id: Date.now(), 
            text: "", 
            color: "bg-yellow-200", 
            x: window.innerWidth/2 - 100 + (Math.random() * 50), 
            y: window.innerHeight/2 - 100 + (Math.random() * 50), 
            z: Math.max(...notes.map(n => n.z), 10) + 1, 
            minimized: false 
        }]);
    };

    const updateNote = (id: number, updates: any) => {
        setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
    };

    const deleteNote = (id: number) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    const bringToFront = (id: number) => {
        const maxZ = Math.max(...notes.map(n => n.z), 10);
        updateNote(id, { z: maxZ + 1 });
    };

    // --- Drag Logic ---
    const handleMouseDown = (e: React.MouseEvent, id: number, x: number, y: number) => {
        e.preventDefault(); // Stop text selection
        e.stopPropagation(); // Stop map drag
        draggedNoteId.current = id;
        dragOffset.current = {
            x: e.clientX - x,
            y: e.clientY - y
        };
        bringToFront(id);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (draggedNoteId.current !== null) {
                const newX = e.clientX - dragOffset.current.x;
                const newY = e.clientY - dragOffset.current.y;
                setNotes(prev => prev.map(n => n.id === draggedNoteId.current ? { ...n, x: newX, y: newY } : n));
            }
        };

        const handleMouseUp = () => {
            draggedNoteId.current = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return (
        <>
            <button 
                onClick={addNote}
                className="absolute bottom-6 left-36 z-30 p-2 rounded-full bg-[#1e1e1e] border border-white/10 text-yellow-400 hover:text-white shadow-lg hover:shadow-yellow-500/20 transition-all active:scale-95"
                title="Thêm ghi chú"
            >
                <span className="material-symbols-outlined text-xl">sticky_note_2</span>
            </button>

            {notes.map(note => (
                note.minimized ? (
                    <div 
                        key={note.id}
                        className={`absolute w-8 h-8 ${note.color} rounded shadow-md cursor-pointer flex items-center justify-center hover:scale-110 transition-transform border border-black/10 select-none`}
                        style={{ left: note.x, top: note.y, zIndex: note.z }}
                        onMouseDown={(e) => handleMouseDown(e, note.id, note.x, note.y)}
                        onDoubleClick={() => updateNote(note.id, { minimized: false })}
                    >
                        <span className="material-symbols-outlined text-black text-xs opacity-70">sticky_note_2</span>
                    </div>
                ) : (
                    <div 
                        key={note.id}
                        className={`absolute w-56 h-64 ${note.color} text-slate-900 shadow-xl transform rounded-sm flex flex-col group transition-shadow duration-200 animate-pop-in select-none`}
                        style={{ left: note.x, top: note.y, zIndex: note.z }}
                        onMouseDown={() => bringToFront(note.id)}
                    >
                        {/* Drag Handle & Toolbar */}
                        <div 
                            className="flex justify-between items-center p-2 bg-black/5 cursor-move"
                            onMouseDown={(e) => handleMouseDown(e, note.id, note.x, note.y)}
                        >
                            <div className="flex gap-1" onMouseDown={e => e.stopPropagation()}>
                                {['bg-yellow-200', 'bg-green-200', 'bg-pink-200', 'bg-blue-200'].map(c => (
                                    <button 
                                        key={c}
                                        onClick={() => updateNote(note.id, { color: c })} 
                                        className={`w-3 h-3 rounded-full ${c.replace('200', '400')} border border-black/10 hover:scale-125 transition-transform`}
                                    ></button>
                                ))}
                            </div>
                            <div className="flex gap-1" onMouseDown={e => e.stopPropagation()}>
                                <button onClick={() => updateNote(note.id, { minimized: true })} className="text-slate-600 hover:text-black p-0.5 rounded hover:bg-black/10"><span className="material-symbols-outlined text-[14px]">remove</span></button>
                                <button onClick={() => deleteNote(note.id)} className="text-slate-600 hover:text-red-600 p-0.5 rounded hover:bg-black/10"><span className="material-symbols-outlined text-[14px]">close</span></button>
                            </div>
                        </div>
                        
                        <textarea 
                            className="w-full flex-1 bg-transparent border-none resize-none focus:ring-0 text-sm p-4 pt-2 font-handwritten leading-relaxed placeholder-slate-500/50 text-slate-800" 
                            placeholder="Viết ý tưởng..." 
                            value={note.text}
                            onChange={(e) => updateNote(note.id, { text: e.target.value })}
                            onMouseDown={e => e.stopPropagation()} 
                        ></textarea>
                        
                        <div className="px-3 py-1 text-[9px] text-slate-500 font-mono flex justify-between items-center opacity-60">
                            <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span className="material-symbols-outlined text-[10px] cursor-nwse-resize">drag_handle</span>
                        </div>
                    </div>
                )
            ))}
        </>
    );
};

// ----------------------------------------------------------------------
// 5. BACKGROUND MAP SELECTOR: Advanced Environment Control
// ----------------------------------------------------------------------

export const BackgroundMapSelector: React.FC<{ onChange: (map: string) => void, className?: string }> = ({ onChange, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState('dots');

    const options = [
        { id: 'none', label: 'Trống', icon: 'check_box_outline_blank', color: 'bg-black' },
        { id: 'grid', label: 'Lưới (Grid)', icon: 'grid_4x4', color: 'bg-slate-900' },
        { id: 'dots', label: 'Chấm (Dots)', icon: 'grain', color: 'bg-[#0a0a0a]' },
        { id: 'blueprint', label: 'Bản vẽ', icon: 'architecture', color: 'bg-blue-900' },
        { id: 'dark_matter', label: 'Vũ trụ', icon: 'public', color: 'bg-indigo-950' },
    ];

    return (
        <div className={`relative ${className}`}>
            <div className={`flex flex-col bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl transition-all overflow-hidden`}>
                {/* Trigger */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 w-full text-left"
                >
                    <span className="material-symbols-outlined text-sm">{options.find(o => o.id === selected)?.icon}</span>
                    <span>Nền: {options.find(o => o.id === selected)?.label}</span>
                    <span className={`material-symbols-outlined text-xs ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>

                {/* Options List */}
                {isOpen && (
                    <div className="pb-1 bg-[#151515] animate-slide-down">
                        {options.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => { setSelected(opt.id); onChange(opt.id); setIsOpen(false); }}
                                className={`flex items-center gap-2 px-3 py-2 text-xs w-full text-left transition-colors ${
                                    selected === opt.id ? 'text-cyan-400 bg-cyan-900/20 font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                }`}
                            >
                                <div className={`w-3 h-3 rounded-full border border-white/10 ${opt.color}`}></div>
                                {opt.label}
                                {selected === opt.id && <span className="material-symbols-outlined text-[10px] ml-auto">check</span>}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
