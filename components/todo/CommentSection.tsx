
import React, { useState } from 'react';
import { TodoComment } from '../../types';

interface CommentSectionProps {
    comments: TodoComment[];
    onAddComment: (text: string) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments, onAddComment }) => {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        if (!text.trim()) return;
        onAddComment(text);
        setText('');
    };

    return (
        <div className="mt-6 border-t border-[#333] pt-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">comment</span> Bình luận
            </h4>
            
            <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#444]">
                {comments.length === 0 && <p className="text-xs text-slate-600 italic">Chưa có bình luận nào.</p>}
                {comments.map(c => (
                    <div key={c.id} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {c.author.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-bold text-slate-300">{c.author}</span>
                                <span className="text-[10px] text-slate-600">{new Date(c.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-slate-400 bg-[#262626] p-2 rounded-lg rounded-tl-none">{c.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Viết bình luận..." 
                    className="flex-1 bg-[#262626] border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-slate-500"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <button 
                    onClick={handleSubmit}
                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">send</span>
                </button>
            </div>
        </div>
    );
};
