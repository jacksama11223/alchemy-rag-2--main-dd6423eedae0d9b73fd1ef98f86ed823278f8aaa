import React, { useState } from 'react';

interface AttachedFileDataPopupProps {
    fileId: string;
    fileName: string;
    onClose: () => void;
}

export const AttachedFileDataPopup: React.FC<AttachedFileDataPopupProps> = ({ fileId, fileName, onClose }) => {
    const [content, setContent] = useState<string | null>(null);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">Dữ liệu đính kèm: {fileName}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-6 h-[400px] overflow-y-auto">
                    <p className="text-slate-600">Đang tải dữ liệu cho file {fileId}...</p>
                </div>
            </div>
        </div>
    );
};
