
import React, { useState, useEffect } from 'react';
import { GlassCard, NeonButton } from '../GraphUI';

interface EdgeToolbarProps {
    edge: { fromId: string, toId: string };
    onUpdate: (updates: any) => void;
    onDelete: () => void;
    onClose: () => void;
    initialData?: {
        label?: string;
        style?: string;
        hasArrow?: boolean;
    };
}

export const EdgeToolbar: React.FC<EdgeToolbarProps> = ({ edge, onUpdate, onDelete, onClose, initialData }) => {
    const [label, setLabel] = useState(initialData?.label || "");
    const [style, setStyle] = useState(initialData?.style || "solid");
    const [hasArrow, setHasArrow] = useState(initialData?.hasArrow || false);

    useEffect(() => {
        setLabel(initialData?.label || "");
        setStyle(initialData?.style || "solid");
        setHasArrow(initialData?.hasArrow || false);
    }, [edge, initialData]);

    const handleSave = () => {
        onUpdate({ label, style, hasArrow });
    };

    return (
        <div className="flex items-center gap-2 p-3 bg-[#0f172a]/95 backdrop-blur-xl border border-cyan-500/50 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.4)] z-[250] animate-slide-up">
            <div className="flex flex-col pr-4 mr-2 border-r border-white/10">
                <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">Liên kết tri thức</span>
                <span className="text-[9px] text-slate-500 truncate max-w-[120px] font-medium">Link: {edge.fromId.slice(-4)} - {edge.toId.slice(-4)}</span>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-tighter">Nhãn liên kết</span>
                <input 
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onBlur={handleSave}
                    className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[11px] text-white outline-none focus:border-cyan-500 w-32 placeholder:text-slate-700"
                    placeholder="VD: Nguyên nhân..."
                />
            </div>

            <div className="h-8 w-px bg-white/10 mx-2"></div>

            <div className="flex gap-2">
                <NeonButton 
                    icon="maximize" 
                    title="Nét liền"
                    active={style === 'solid'} 
                    onClick={() => { setStyle('solid'); onUpdate({ style: 'solid', label, hasArrow }); }} 
                />
                <NeonButton 
                    icon="horizontal_rule" 
                    title="Nét đứt"
                    active={style === 'dashed'} 
                    onClick={() => { setStyle('dashed'); onUpdate({ style: 'dashed', label, hasArrow }); }} 
                />
                <NeonButton 
                    icon="arrow_forward" 
                    title="Mũi tên"
                    active={hasArrow} 
                    onClick={() => { setHasArrow(!hasArrow); onUpdate({ hasArrow: !hasArrow, label, style }); }} 
                />
            </div>

            <div className="h-8 w-px bg-white/10 mx-2"></div>

            <div className="flex items-center gap-1">
                <button 
                    onClick={onDelete}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Xóa liên kết"
                >
                    <span className="material-symbols-outlined text-sm">delete</span>
                </button>
                <button 
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
                    title="Đóng"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>
        </div>
    );
};
