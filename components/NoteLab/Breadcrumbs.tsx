
import React, { useMemo } from 'react';
import { NotePage } from '../../types';

interface BreadcrumbsProps {
    pages: NotePage[];
    activePageId: string;
    onSelectPage: (id: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ pages, activePageId, onSelectPage }) => {
    
    const breadcrumbPath = useMemo(() => {
        const path: NotePage[] = [];
        let current = pages.find(p => p.id === activePageId);
        
        while (current) {
            path.unshift(current);
            if (current.parentId) {
                current = pages.find(p => p.id === current?.parentId);
            } else {
                current = undefined;
            }
        }
        return path;
    }, [pages, activePageId]);

    return (
        <div className="flex items-center gap-1 text-sm text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
            <button 
                className="hover:bg-white/5 hover:text-white px-2 py-1 rounded transition-colors"
                onClick={() => { /* Should ideally unselect page or go to root view */ }}
            >
                <span className="material-symbols-outlined text-base align-middle">home</span>
            </button>
            
            {breadcrumbPath.map((item, index) => (
                <React.Fragment key={item.id}>
                    <span className="text-slate-600">/</span>
                    <button 
                        onClick={() => onSelectPage(item.id)}
                        className={`px-2 py-1 rounded hover:bg-white/5 transition-colors flex items-center gap-2 ${
                            index === breadcrumbPath.length - 1 ? 'text-white font-bold' : 'hover:text-white'
                        }`}
                    >
                        <span className="text-xs">{item.icon}</span>
                        <span className="truncate max-w-[150px]">{item.title || 'Untitled'}</span>
                    </button>
                </React.Fragment>
            ))}
        </div>
    );
};
