
import React, { useRef } from 'react';
import { TodoAttachment } from '../../types';

interface AttachmentListProps {
    attachments: TodoAttachment[];
    onAddAttachment: (file: TodoAttachment) => void;
    onRemoveAttachment: (id: string) => void;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({ attachments, onAddAttachment, onRemoveAttachment }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                const newAtt: TodoAttachment = {
                    id: Date.now().toString(),
                    name: file.name,
                    url: ev.target?.result as string,
                    type: file.type.startsWith('image/') ? 'image' : 'file'
                };
                onAddAttachment(newAtt);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">attachment</span> Đính kèm
            </h4>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
                {attachments.map(att => (
                    <div key={att.id} className="relative group bg-[#262626] rounded-lg p-2 flex items-center gap-2 border border-[#333]">
                        <div className="w-10 h-10 rounded bg-[#333] flex items-center justify-center overflow-hidden shrink-0">
                            {att.type === 'image' ? (
                                <img src={att.url} className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-slate-400">description</span>
                            )}
                        </div>
                        <span className="text-xs text-slate-300 truncate flex-1">{att.name}</span>
                        <button 
                            onClick={() => onRemoveAttachment(att.id)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                    </div>
                ))}
            </div>

            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-dashed border-slate-600 hover:border-slate-400 transition-all w-full justify-center"
            >
                <span className="material-symbols-outlined text-sm">add</span> Thêm file
            </button>
        </div>
    );
};
