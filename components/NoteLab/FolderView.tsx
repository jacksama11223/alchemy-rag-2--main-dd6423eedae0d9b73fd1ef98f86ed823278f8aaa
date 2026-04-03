
import React from 'react';
import { NotePage } from '../../types';

interface FolderViewProps {
    activePage: NotePage;
    childrenPages: NotePage[];
    onSelectPage: (id: string) => void;
    onCreateItem: (type: 'note' | 'folder') => void;
    onUpdatePage: (updates: Partial<NotePage>) => void; // New Prop
}

export const FolderView: React.FC<FolderViewProps> = ({ activePage, childrenPages, onSelectPage, onCreateItem, onUpdatePage }) => {
    
    // Project Progress Calculation
    const progress = activePage.type === 'project' && activePage.projectMetadata 
        ? activePage.projectMetadata.progress 
        : 0;

    const statusColor = (status?: string) => {
        switch(status) {
            case 'done': return 'bg-green-500';
            case 'in-progress': return 'bg-blue-500';
            case 'paused': return 'bg-yellow-500';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-8 py-12">
            {/* Folder/Project Header */}
            <div className="mb-12">
                <div className="text-6xl mb-6">{activePage.icon}</div>
                {/* Editable Title */}
                <input 
                    type="text" 
                    value={activePage.title}
                    onChange={(e) => onUpdatePage({ title: e.target.value })}
                    className="text-5xl font-black text-white mb-4 bg-transparent border-none focus:outline-none focus:ring-0 placeholder-slate-600 w-full"
                    placeholder="Untitled Folder"
                />
                
                {activePage.type === 'project' && (
                    <div className="flex items-center gap-6 mt-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <div className={`w-2.5 h-2.5 rounded-full ${statusColor(activePage.projectMetadata?.status)}`}></div>
                            <span className="text-sm font-medium text-slate-300 capitalize">{activePage.projectMetadata?.status || 'Planning'}</span>
                        </div>
                        <div className="flex-1 max-w-xs h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-sm text-slate-400">{progress}% Complete</span>
                    </div>
                )}
            </div>

            {/* Children Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Create New Buttons */}
                <button 
                    onClick={() => onCreateItem('note')}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 transition-all group h-40"
                >
                    <span className="material-symbols-outlined text-3xl text-slate-500 group-hover:text-white">note_add</span>
                    <span className="text-sm font-bold text-slate-500 group-hover:text-white">New Note</span>
                </button>
                
                <button 
                    onClick={() => onCreateItem('folder')}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 transition-all group h-40"
                >
                    <span className="material-symbols-outlined text-3xl text-slate-500 group-hover:text-white">create_new_folder</span>
                    <span className="text-sm font-bold text-slate-500 group-hover:text-white">New Folder</span>
                </button>

                {/* Items */}
                {childrenPages.map(item => (
                    <div 
                        key={item.id}
                        onClick={() => onSelectPage(item.id)}
                        className="flex flex-col p-6 rounded-xl bg-[#1e293b] border border-white/5 hover:border-blue-500/50 hover:shadow-xl transition-all cursor-pointer group relative h-40"
                    >
                        <div className="text-3xl mb-3">{item.icon}</div>
                        <h3 className="font-bold text-lg text-slate-200 group-hover:text-white truncate mb-1">{item.title || 'Untitled'}</h3>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-4">{item.type}</div>
                        <div className="mt-auto text-xs text-slate-600">Updated {new Date(item.updatedAt).toLocaleDateString()}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
