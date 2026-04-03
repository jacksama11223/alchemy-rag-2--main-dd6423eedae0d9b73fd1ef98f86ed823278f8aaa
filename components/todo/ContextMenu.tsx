
import React, { useEffect, useRef } from 'react';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onAction: (action: string) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onAction }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div 
            ref={menuRef}
            className="fixed z-[100] bg-[#2a2a2a] border border-[#444] rounded-lg shadow-xl py-1 w-48 text-sm animate-[fadeIn_0.1s]"
            style={{ top: y, left: x }}
        >
            <div 
                className="px-4 py-2 hover:bg-[#333] cursor-pointer text-slate-200 flex items-center gap-2"
                onClick={() => onAction('expand')}
            >
                <span className="material-symbols-outlined text-sm text-green-400">account_tree</span> Mở rộng (AI)
            </div>
            <div className="h-px bg-[#444] my-1"></div>
            <div 
                className="px-4 py-2 hover:bg-[#333] cursor-pointer text-slate-200 flex items-center gap-2"
                onClick={() => onAction('tomorrow')}
            >
                <span className="material-symbols-outlined text-sm text-purple-400">calendar_month</span> Dời sang mai
            </div>
            <div 
                className="px-4 py-2 hover:bg-[#333] cursor-pointer text-slate-200 flex items-center gap-2"
                onClick={() => onAction('priority_1')}
            >
                <span className="material-symbols-outlined text-sm text-red-500">flag</span> Ưu tiên cao nhất
            </div>
            <div className="h-px bg-[#444] my-1"></div>
            <div 
                className="px-4 py-2 hover:bg-[#333] cursor-pointer text-slate-200 flex items-center gap-2"
                onClick={() => onAction('duplicate')}
            >
                <span className="material-symbols-outlined text-sm text-blue-400">content_copy</span> Nhân bản
            </div>
            <div 
                className="px-4 py-2 hover:bg-[#333] cursor-pointer text-red-400 flex items-center gap-2"
                onClick={() => onAction('delete')}
            >
                <span className="material-symbols-outlined text-sm">delete</span> Xóa
            </div>
        </div>
    );
};
