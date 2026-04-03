
import React, { useMemo } from 'react';
import { NotePage, FileSystemType } from '../../types';

interface NoteSidebarProps {
    isOpen: boolean;
    pages: NotePage[];
    activePageId: string | null;
    onSelectPage: (id: string) => void;
    onCreatePage: (parentId: string | null, type: FileSystemType) => void;
    onToggleSidebar: () => void;
    onBack: () => void;
    onDeletePage: (id: string) => void;
    onToggleExpand: (id: string) => void;
}

interface TreeItemProps {
    item: NotePage;
    allPages: NotePage[];
    level: number;
    activePageId: string | null;
    onSelect: (id: string) => void;
    onToggleExpand: (id: string) => void;
    onCreate: (parentId: string | null, type: FileSystemType) => void;
    onDelete: (id: string) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({ item, allPages, level, activePageId, onSelect, onToggleExpand, onCreate, onDelete }) => {
    // Find children
    const children = allPages.filter(p => p.parentId === item.id);
    const hasChildren = children.length > 0;
    const isFolderOrProject = item.type === 'folder' || item.type === 'project';

    const handleCreateChild = (e: React.MouseEvent, type: FileSystemType) => {
        e.stopPropagation();
        onCreate(item.id, type);
        if (!item.isExpanded) onToggleExpand(item.id);
    };

    return (
        <div className="select-none">
            <div 
                className={`group flex items-center gap-1 px-3 py-1.5 rounded-r-md cursor-pointer transition-colors relative ${activePageId === item.id ? 'bg-blue-600/30 text-white border-l-2 border-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                style={{ paddingLeft: `${level * 12 + 12}px` }}
                onClick={() => onSelect(item.id)}
            >
                {/* Expand Toggle */}
                <div 
                    className={`p-0.5 rounded hover:bg-white/10 ${isFolderOrProject ? 'visible' : 'invisible'}`}
                    onClick={(e) => { e.stopPropagation(); onToggleExpand(item.id); }}
                >
                    <span className={`material-symbols-outlined text-[14px] transition-transform ${item.isExpanded ? 'rotate-90' : ''}`}>chevron_right</span>
                </div>

                <span className="text-base mr-1">{item.icon}</span>
                <span className="text-sm truncate flex-1">{item.title || 'Untitled'}</span>
                
                {/* Actions (visible on hover) */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                    {isFolderOrProject && (
                        <button 
                            onClick={(e) => handleCreateChild(e, 'note')}
                            className="p-1 hover:bg-white/20 rounded text-slate-400 hover:text-white"
                            title="Add Note"
                        >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                        </button>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); if(confirm('Delete?')) onDelete(item.id); }}
                        className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded text-slate-500"
                    >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                </div>
            </div>

            {/* Recursive Children */}
            {item.isExpanded && children.map(child => (
                <TreeItem 
                    key={child.id} 
                    item={child} 
                    allPages={allPages} 
                    level={level + 1}
                    activePageId={activePageId}
                    onSelect={onSelect}
                    onToggleExpand={onToggleExpand}
                    onCreate={onCreate}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export const NoteSidebar: React.FC<NoteSidebarProps> = ({ 
    isOpen, pages, activePageId, onSelectPage, onCreatePage, onToggleSidebar, onBack, onDeletePage, onToggleExpand 
}) => {
    
    // Get Root Items (parentId is null)
    const rootItems = useMemo(() => pages.filter(p => !p.parentId), [pages]);

    return (
        <div className={`${isOpen ? 'w-72' : 'w-0'} bg-[#0b1120]/80 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-300 overflow-hidden shrink-0 h-full shadow-2xl`}>
            {/* Header */}
            <div className="p-3 flex items-center gap-2 border-b border-white/5 bg-black/20">
                <button onClick={onBack} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
                <div className="flex-1 flex items-center gap-2 font-bold text-slate-200 text-sm">
                    <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-[10px] text-white shadow-lg">N</div>
                    NoteLab
                </div>
                <button onClick={onToggleSidebar} className="p-1.5 hover:bg-white/10 rounded text-slate-400">
                    <span className="material-symbols-outlined text-lg">first_page</span>
                </button>
            </div>

            {/* Tree View */}
            <div className="flex-1 overflow-y-auto py-2 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                <div className="text-[10px] font-bold text-slate-500 uppercase px-4 py-2 flex justify-between items-center">
                    Workspace
                    <span className="bg-white/5 px-1.5 rounded text-[9px]">{pages.length}</span>
                </div>
                {rootItems.map(item => (
                    <TreeItem 
                        key={item.id} 
                        item={item} 
                        allPages={pages} 
                        level={0}
                        activePageId={activePageId}
                        onSelect={onSelectPage}
                        onToggleExpand={onToggleExpand}
                        onCreate={onCreatePage}
                        onDelete={onDeletePage}
                    />
                ))}
            </div>
            
            {/* Quick Actions Footer */}
            <div className="p-3 border-t border-white/5 flex gap-2 bg-black/20">
                <button 
                    onClick={() => onCreatePage(null, 'note')}
                    className="joyride-create-note flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-slate-300 text-xs font-medium transition-colors border border-white/5"
                >
                    <span className="material-symbols-outlined text-sm">note_add</span>
                </button>
                <button 
                    onClick={() => onCreatePage(null, 'folder')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-slate-300 text-xs font-medium transition-colors border border-white/5"
                >
                    <span className="material-symbols-outlined text-sm">create_new_folder</span>
                </button>
                <button 
                    onClick={() => onCreatePage(null, 'project')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-slate-300 text-xs font-medium transition-colors border border-white/5"
                >
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                </button>
            </div>
        </div>
    );
};
