
import React, { useState, useEffect } from 'react';
import { Project } from '../../types';

interface ProjectManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: Omit<Project, 'id'>) => void;
    projectToEdit?: Project | null;
}

const COLORS = [
    { name: 'Red', class: 'text-red-400', bg: 'bg-red-500' },
    { name: 'Orange', class: 'text-orange-400', bg: 'bg-orange-500' },
    { name: 'Amber', class: 'text-amber-400', bg: 'bg-amber-500' },
    { name: 'Green', class: 'text-green-400', bg: 'bg-green-500' },
    { name: 'Blue', class: 'text-blue-400', bg: 'bg-blue-500' },
    { name: 'Cyan', class: 'text-cyan-400', bg: 'bg-cyan-500' },
    { name: 'Purple', class: 'text-purple-400', bg: 'bg-purple-500' },
    { name: 'Pink', class: 'text-pink-400', bg: 'bg-pink-500' },
    { name: 'Slate', class: 'text-slate-400', bg: 'bg-slate-500' },
];

const ICONS = [
    'folder', 'work', 'school', 'home', 'rocket_launch', 
    'star', 'favorite', 'fitness_center', 'shopping_cart', 
    'flight', 'code', 'brush', 'music_note', 'book', 'lightbulb',
    'terminal', 'database', 'cloud', 'security', 'bug_report'
];

export const ProjectManager: React.FC<ProjectManagerProps> = ({ isOpen, onClose, onSave, projectToEdit }) => {
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[4]); // Blue default
    const [selectedIcon, setSelectedIcon] = useState('folder');

    useEffect(() => {
        if (isOpen) {
            if (projectToEdit) {
                setName(projectToEdit.name);
                const colorObj = COLORS.find(c => c.class === projectToEdit.color) || COLORS[4];
                setSelectedColor(colorObj);
                setSelectedIcon(projectToEdit.icon);
            } else {
                setName('');
                setSelectedColor(COLORS[4]);
                setSelectedIcon('folder');
            }
        }
    }, [isOpen, projectToEdit]);

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({
            name: name,
            color: selectedColor.class,
            icon: selectedIcon
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-[fadeIn_0.2s]" onClick={onClose}>
            <div className="bg-[#1e1e1e] border border-[#333] rounded-2xl w-full max-w-sm shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <span className="material-symbols-outlined">close</span>
                </button>
                
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className={`material-symbols-outlined ${selectedColor.class}`}>{projectToEdit ? 'edit' : 'create_new_folder'}</span> 
                    {projectToEdit ? 'Chỉnh Sửa Dự Án' : 'Dự Án Mới'}
                </h2>

                <div className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Tên dự án</label>
                        <input 
                            type="text" 
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="VD: Học React, Du lịch..."
                            className="w-full bg-[#262626] border border-[#333] rounded-xl px-4 py-2 text-white focus:border-blue-500 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        />
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Màu sắc</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() => setSelectedColor(c)}
                                    className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${c.bg} ${selectedColor.name === c.name ? 'ring-2 ring-white scale-110' : 'opacity-70'}`}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Icon Picker */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Biểu tượng</label>
                        <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                            {ICONS.map((icon) => (
                                <button
                                    key={icon}
                                    onClick={() => setSelectedIcon(icon)}
                                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                                        selectedIcon === icon 
                                        ? 'bg-white/10 text-white shadow-inner' 
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-xl">{icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="pt-2">
                         <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#262626] border border-[#333]">
                            <span className={`material-symbols-outlined text-xl ${selectedColor.class}`}>{selectedIcon}</span>
                            <span className="text-sm font-medium text-white">{name || 'Tên dự án...'}</span>
                         </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-colors mt-2"
                    >
                        {projectToEdit ? 'Lưu Thay Đổi' : 'Tạo Dự Án'}
                    </button>
                </div>
            </div>
        </div>
    );
};
