
import React, { useState } from 'react';
import { ToolType } from '../../types';

interface DrawingSidebarProps {
    onSelectTool: (tool: ToolType, icon?: string) => void;
    activeTool: ToolType;
}

const STICKERS = [
    { cat: 'Math', icons: ['function', 'percent', 'calculate', 'architecture', 'biotech'] },
    { cat: 'Shape', icons: ['pentagon', 'hexagon', 'star', 'favorite', 'cloud'] },
    { cat: 'Tech', icons: ['memory', 'code', 'terminal', 'database', 'wifi'] },
    { cat: 'Note', icons: ['push_pin', 'flag', 'bookmark', 'label', 'sticky_note_2'] },
];

export const DrawingSidebar: React.FC<DrawingSidebarProps> = ({ onSelectTool, activeTool }) => {
    const [activeTab, setActiveTab] = useState<'stickers' | 'layers'>('stickers');

    return (
        <div className="absolute top-20 left-4 w-64 bg-[#1e1e1e]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden z-40 max-h-[70vh] animate-slide-right">
            <div className="flex border-b border-white/10">
                <button 
                    onClick={() => setActiveTab('stickers')} 
                    className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${activeTab === 'stickers' ? 'bg-white/5 text-amber-400' : 'text-slate-500 hover:text-white'}`}
                >
                    Stickers
                </button>
                <button 
                    onClick={() => setActiveTab('layers')} 
                    className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${activeTab === 'layers' ? 'bg-white/5 text-cyan-400' : 'text-slate-500 hover:text-white'}`}
                >
                    Layers
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'stickers' && (
                    <div className="space-y-4">
                        {STICKERS.map((category) => (
                            <div key={category.cat}>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">{category.cat}</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {category.icons.map(icon => (
                                        <button 
                                            key={icon}
                                            onClick={() => onSelectTool('sticker', icon)}
                                            className="aspect-square rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:scale-110 transition-all"
                                            title={icon}
                                        >
                                            <span className="material-symbols-outlined text-xl">{icon}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'layers' && (
                    <div className="space-y-2">
                        <div className="text-center text-slate-500 text-xs italic py-4">
                            Quản lý Layer sắp ra mắt
                        </div>
                        {/* Placeholder for layer list */}
                        <div className="flex items-center gap-2 p-2 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                            <span className="material-symbols-outlined text-sm text-blue-400">visibility</span>
                            <span className="text-xs text-white">Main Layer</span>
                            <span className="material-symbols-outlined text-sm text-slate-500 ml-auto">lock</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
