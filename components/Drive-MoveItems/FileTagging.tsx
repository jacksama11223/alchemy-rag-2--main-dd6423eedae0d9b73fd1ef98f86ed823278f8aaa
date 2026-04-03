import React, { useState } from 'react';

interface FileTaggingProps {
    currentTags: string[];
    onUpdateTags: (tags: string[]) => void;
}

export const FileTagging: React.FC<FileTaggingProps> = ({ currentTags, onUpdateTags }) => {
    const [tags, setTags] = useState<string[]>(currentTags);
    const [inputValue, setInputValue] = useState('');

    const handleAddTag = () => {
        if (inputValue.trim() && !tags.includes(inputValue.trim())) {
            const newTags = [...tags, inputValue.trim()];
            setTags(newTags);
            onUpdateTags(newTags);
            setInputValue('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        setTags(newTags);
        onUpdateTags(newTags);
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="text-blue-500 hover:text-blue-700">
                            <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Thêm tag..."
                    className="flex-1 border border-slate-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                />
                <button onClick={handleAddTag} className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">
                    Thêm
                </button>
            </div>
        </div>
    );
};
