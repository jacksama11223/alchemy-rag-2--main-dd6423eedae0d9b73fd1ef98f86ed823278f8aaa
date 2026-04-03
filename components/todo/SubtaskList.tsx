
import React, { useState } from 'react';
import { Subtask } from '../../types';

interface SubtaskListProps {
    subtasks: Subtask[];
    onAddSubtask: (content: string) => void;
    onToggleSubtask: (id: string) => void;
    onDeleteSubtask: (id: string) => void;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({ subtasks, onAddSubtask, onToggleSubtask, onDeleteSubtask }) => {
    const [newSubtask, setNewSubtask] = useState('');

    const handleAdd = () => {
        if (!newSubtask.trim()) return;
        onAddSubtask(newSubtask);
        setNewSubtask('');
    };

    return (
        <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Công việc con</h4>
            
            <div className="space-y-1 mb-2">
                {subtasks.map(st => (
                    <div key={st.id} className="flex items-center gap-2 group p-1 hover:bg-[#262626] rounded">
                        <input 
                            type="checkbox" 
                            checked={st.isCompleted} 
                            onChange={() => onToggleSubtask(st.id)}
                            className="w-3 h-3 rounded-full border-slate-500 bg-transparent checked:bg-slate-500 focus:ring-0 cursor-pointer"
                        />
                        <span className={`text-sm flex-1 ${st.isCompleted ? 'line-through text-slate-600' : 'text-slate-300'}`}>{st.content}</span>
                        <button onClick={() => onDeleteSubtask(st.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500 text-sm">add</span>
                <input 
                    type="text" 
                    placeholder="Thêm bước nhỏ..." 
                    className="bg-transparent border-none text-sm text-slate-300 placeholder-slate-600 focus:ring-0 w-full p-0"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
            </div>
        </div>
    );
};
