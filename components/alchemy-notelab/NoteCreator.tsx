import React, { useState } from 'react';
import { GlassSurface } from '../common/BrandAssets';
import { getAuthHeader } from '../../services/mockBackend';

interface NoteCreatorProps {
    onNoteCreated: (note: any) => void;
    onCancel: () => void;
}

const NoteCreator: React.FC<NoteCreatorProps> = ({ onNoteCreated, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [importSource, setImportSource] = useState<'manual' | 'external'>('manual');
    const [externalUrl, setExternalUrl] = useState('');

    const handleSave = async () => {
        if (!title.trim() || (!content.trim() && importSource === 'manual')) {
            alert('Vui lòng nhập tiêu đề và nội dung ghi chú.');
            return;
        }

        setIsSaving(true);
        let finalContent = content;
        if (importSource === 'external' && externalUrl) {
            // Giả lập lấy nội dung từ URL bên ngoài (ví dụ: Notion, Evernote public link)
            finalContent = `Nội dung được nhập từ: ${externalUrl}\n\nĐây là nội dung giả lập được trích xuất từ liên kết bên ngoài. Trong thực tế, hệ thống sẽ gọi API của dịch vụ tương ứng để lấy nội dung chi tiết.`;
        }

        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({
                    title,
                    type: 'note',
                    blocks: [
                        {
                            type: 'paragraph',
                            data: { text: finalContent }
                        }
                    ]
                })
            });

            if (response.ok) {
                const newNote = await response.json();
                onNoteCreated(newNote);
            } else {
                // Fallback cho demo nếu API chưa sẵn sàng
                const mockNote = {
                    _id: `note-${Date.now()}`,
                    title,
                    type: 'note',
                    blocks: [
                        {
                            type: 'paragraph',
                            data: { text: finalContent }
                        }
                    ],
                    createdAt: new Date().toISOString()
                };
                onNoteCreated(mockNote);
            }
        } catch (error) {
            console.error('Error saving note:', error);
            // Fallback
            const mockNote = {
                _id: `note-${Date.now()}`,
                title,
                type: 'note',
                blocks: [
                    {
                        type: 'paragraph',
                        data: { text: finalContent }
                    }
                ],
                createdAt: new Date().toISOString()
            };
            onNoteCreated(mockNote);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <GlassSurface className="p-6 flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">
                        {importSource === 'manual' ? 'edit_document' : 'cloud_download'}
                    </span>
                    {importSource === 'manual' ? 'Tạo Ghi chú Mới' : 'Nhập từ Bên ngoài'}
                </h4>
                <div className="flex gap-2">
                    <button
                        onClick={() => setImportSource('manual')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            importSource === 'manual' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Viết tay
                    </button>
                    <button
                        onClick={() => setImportSource('external')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            importSource === 'external' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Nhập URL
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nhập tiêu đề ghi chú..."
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                </div>

                {importSource === 'external' && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Đường dẫn (URL)</label>
                        <input
                            type="text"
                            value={externalUrl}
                            onChange={(e) => setExternalUrl(e.target.value)}
                            placeholder="Ví dụ: https://notion.so/..."
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Hỗ trợ nhập từ Notion, Evernote, Google Docs (yêu cầu quyền truy cập công khai).
                        </p>
                    </div>
                )}

                <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={importSource === 'manual' ? "Nhập nội dung ghi chú của bạn ở đây..." : "Bạn có thể thêm ghi chú bổ sung ở đây (không bắt buộc)..."}
                        className="w-full flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
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
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                    {isSaving ? (
                        <>
                            <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-sm">save</span>
                            Lưu Ghi chú
                        </>
                    )}
                </button>
            </div>
        </GlassSurface>
    );
};

export default NoteCreator;
