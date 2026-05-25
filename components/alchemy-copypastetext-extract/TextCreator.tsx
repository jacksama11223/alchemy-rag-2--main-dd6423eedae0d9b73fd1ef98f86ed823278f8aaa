import React, { useState } from 'react';
import { GlassSurface } from '../common/BrandAssets';
import { getAuthHeader } from '../../services/mockBackend';

interface TextCreatorProps {
    onTextCreated: (text: any) => void;
    onCancel: () => void;
}

const TextCreator: React.FC<TextCreatorProps> = ({ onTextCreated, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            alert('Vui lòng nhập tiêu đề và nội dung văn bản.');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch('/api/pasted-texts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({
                    title,
                    content,
                    source: 'manual'
                })
            });

            if (response.ok) {
                const newText = await response.json();
                onTextCreated(newText);
            } else {
                console.error('Failed to save text');
            }
        } catch (error) {
            console.error('Error saving text:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <GlassSurface className="p-6 flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500">
                        post_add
                    </span>
                    Thêm Văn Bản Mới
                </h4>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
                <div className="group">
                    <label className="block text-sm font-medium text-slate-700 mb-1 group-focus-within:text-emerald-600 transition-colors">Tiêu đề</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nhập tiêu đề cho đoạn văn bản..."
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50 focus:bg-white shadow-sm"
                    />
                </div>

                <div className="flex-1 flex flex-col group">
                    <label className="block text-sm font-medium text-slate-700 mb-1 group-focus-within:text-emerald-600 transition-colors">Nội dung văn bản</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Dán nội dung văn bản của bạn vào đây..."
                        className="w-full flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none shadow-inner bg-slate-50/50 focus:bg-white"
                    />
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                >
                    Hủy
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm"
                >
                    {isSaving ? (
                        <>
                            <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-sm">save</span>
                            Lưu Văn Bản
                        </>
                    )}
                </button>
            </div>
        </GlassSurface>
    );
};

export default TextCreator;

