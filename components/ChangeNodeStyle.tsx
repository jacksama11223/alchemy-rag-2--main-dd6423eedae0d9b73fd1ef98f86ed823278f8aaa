
import React, { useState } from 'react';
import { KnowledgeNode, NodeShape } from '../types';

interface ChangeNodeStyleProps {
    isOpen: boolean;
    onClose: () => void;
    node: KnowledgeNode;
    onSave: (nodeId: string, newColor: string, newShape: NodeShape) => void;
}

const COLORS = [
    { hex: '#a5f3fc', name: 'Cyan (Default)' },
    { hex: '#fecdd3', name: 'Rose (Weak)' },
    { hex: '#c4b5fd', name: 'Purple (Quiz)' },
    { hex: '#fde68a', name: 'Amber (Case)' },
    { hex: '#34d399', name: 'Emerald' },
    { hex: '#60a5fa', name: 'Blue' },
    { hex: '#f87171', name: 'Red' },
    { hex: '#e879f9', name: 'Fuchsia' },
    { hex: '#22d3ee', name: 'Neon Cyan' },
    { hex: '#facc15', name: 'Neon Yellow' },
];

const SHAPES: { id: NodeShape, label: string, icon: string }[] = [
    { id: 'circle', label: 'Tròn', icon: 'circle' },
    { id: 'square', label: 'Vuông', icon: 'crop_square' },
    { id: 'hexagon', label: 'Lục giác', icon: 'hexagon' },
    { id: 'diamond', label: 'Kim cương', icon: 'diamond' },
    { id: 'triangle', label: 'Tam giác', icon: 'change_history' },
    { id: 'star', label: 'Ngôi sao', icon: 'star' },
];

export const ChangeNodeStyle: React.FC<ChangeNodeStyleProps> = ({ isOpen, onClose, node, onSave }) => {
    const [selectedColor, setSelectedColor] = useState(node.color || '#a5f3fc');
    const [selectedShape, setSelectedShape] = useState<NodeShape>(node.shape || 'circle');

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(node.id, selectedColor, selectedShape);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
            <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-white/10 bg-[#252525] flex justify-between items-center">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-400">palette</span>
                        Đổi Style: {node.title}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Preview */}
                    <div className="flex justify-center mb-6">
                        <div className="relative w-32 h-32 flex items-center justify-center bg-black/40 rounded-xl border border-white/5">
                            <div 
                                className="transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center"
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    backgroundColor: selectedColor,
                                    borderRadius: selectedShape === 'circle' ? '50%' : selectedShape === 'square' ? '8px' : '0',
                                    clipPath: selectedShape === 'hexagon' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' : 
                                              selectedShape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 
                                              selectedShape === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' :
                                              selectedShape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' :
                                              'none',
                                    transform: selectedShape === 'diamond' ? 'scale(0.8)' : 'scale(1)'
                                }}
                            >
                                <span className="material-symbols-outlined text-black/50 text-2xl">science</span>
                            </div>
                        </div>
                    </div>

                    {/* Shape Selector */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Hình Dáng</label>
                        <div className="grid grid-cols-6 gap-2">
                            {SHAPES.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedShape(s.id)}
                                    className={`aspect-square rounded-lg flex items-center justify-center border transition-all ${
                                        selectedShape === s.id 
                                        ? 'bg-purple-600/20 border-purple-500 text-purple-300' 
                                        : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-white'
                                    }`}
                                    title={s.label}
                                >
                                    <span className="material-symbols-outlined text-xl">{s.icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selector */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Màu Sắc</label>
                        <div className="grid grid-cols-5 gap-3">
                            {COLORS.map((c, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedColor(c.hex)}
                                    className={`w-full aspect-square rounded-full border-2 transition-all hover:scale-110 ${selectedColor === c.hex ? 'border-white scale-110 ring-2 ring-white/20' : 'border-transparent'}`}
                                    style={{ backgroundColor: c.hex }}
                                    title={c.name}
                                ></button>
                            ))}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-bold transition-colors">
                            Hủy bỏ
                        </button>
                        <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/20 transition-all transform active:scale-95">
                            Lưu Thay Đổi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
