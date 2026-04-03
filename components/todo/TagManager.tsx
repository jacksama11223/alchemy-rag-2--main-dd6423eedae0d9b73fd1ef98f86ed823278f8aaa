
import React, { useState } from 'react';

interface TagManagerProps {
    tags: string[];
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
}

const AVAILABLE_TAGS = ['Học tập', 'Gia đình', 'Sức khỏe', 'Khẩn cấp', 'Dài hạn', 'Ý tưởng'];
const TAG_COLORS: {[key: string]: string} = {
    'Học tập': 'bg-blue-900/50 text-blue-300 border-blue-700',
    'Gia đình': 'bg-green-900/50 text-green-300 border-green-700',
    'Sức khỏe': 'bg-red-900/50 text-red-300 border-red-700',
    'Khẩn cấp': 'bg-orange-900/50 text-orange-300 border-orange-700',
    'Dài hạn': 'bg-purple-900/50 text-purple-300 border-purple-700',
    'Ý tưởng': 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    'default': 'bg-slate-700/50 text-slate-300 border-slate-600'
};

export const TagManager: React.FC<TagManagerProps> = ({ tags, onAddTag, onRemoveTag }) => {
    const [isAdding, setIsAdding] = useState(false);

    return (
        <div className="flex flex-wrap items-center gap-2">
            {tags.map(tag => (
                <span 
                    key={tag} 
                    className={`text-xs px-2 py-0.5 rounded border flex items-center gap-1 ${TAG_COLORS[tag] || TAG_COLORS['default']}`}
                >
                    #{tag}
                    <button onClick={() => onRemoveTag(tag)} className="hover:text-white"><span className="material-symbols-outlined text-[10px]">close</span></button>
                </span>
            ))}
            
            <div className="relative">
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-xs px-2 py-0.5 rounded border border-dashed border-slate-500 text-slate-400 hover:text-white hover:border-slate-300 flex items-center gap-1"
                >
                    <span className="material-symbols-outlined text-[12px]">add</span> Label
                </button>
                
                {isAdding && (
                    <div className="absolute top-full left-0 mt-1 w-40 bg-[#1e1e1e] border border-[#333] rounded-lg shadow-xl z-50 p-1">
                        {AVAILABLE_TAGS.filter(t => !tags.includes(t)).map(tag => (
                            <button
                                key={tag}
                                onClick={() => { onAddTag(tag); setIsAdding(false); }}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-[#333] rounded flex items-center gap-2"
                            >
                                <div className={`w-2 h-2 rounded-full ${TAG_COLORS[tag]?.split(' ')[0].replace('/50', '') || 'bg-slate-500'}`}></div>
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
