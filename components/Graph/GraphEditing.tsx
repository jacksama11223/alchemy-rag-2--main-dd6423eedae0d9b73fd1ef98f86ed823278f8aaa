
import React, { useState } from 'react';

// 1. NodeEditorDrawer
export const NodeEditorDrawer: React.FC<{ isOpen: boolean, onClose: () => void, node: any }> = ({ isOpen, onClose, node }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute top-0 right-0 h-full w-96 bg-[#0f172a] border-l border-white/10 shadow-2xl z-50 flex flex-col animate-slide-left">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-white font-bold">Hiệu Chỉnh Khái Niệm</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
                <input className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white mb-4 font-bold" defaultValue={node?.title} />
                <textarea className="w-full h-64 bg-black/20 border border-white/10 rounded px-3 py-2 text-slate-300 resize-none" defaultValue={node?.data?.summary || "Mô tả chi tiết nội dung..."}></textarea>
                <div className="mt-4">
                    <label className="text-xs text-slate-500 uppercase font-bold">Tài Liệu Đính Kèm</label>
                    <MediaAttachmentUploader />
                </div>
                <div className="mt-4">
                    <label className="text-xs text-slate-500 uppercase font-bold">Thẻ Phân Loại</label>
                    <TagInputWidget initialTags={node?.tags || []} />
                </div>
            </div>
        </div>
    );
};

// 2. RelationshipLabeler
export const RelationshipLabeler: React.FC<{ x: number, y: number, visible: boolean }> = ({ x, y, visible }) => {
    if (!visible) return null;
    return (
        <div className="absolute z-40 bg-black/80 px-2 py-1 rounded border border-white/20" style={{ left: x, top: y }}>
            <input className="bg-transparent border-none text-xs text-white p-0 w-24 focus:ring-0" placeholder="Định danh mối quan hệ..." />
        </div>
    );
};

// 3. MediaAttachmentUploader
export const MediaAttachmentUploader: React.FC = () => (
    <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center hover:bg-white/5 transition-colors cursor-pointer mt-2">
        <span className="material-symbols-outlined text-slate-400 text-2xl">cloud_upload</span>
        <p className="text-xs text-slate-500 mt-1">Tải lên hình ảnh hoặc tài liệu PDF</p>
    </div>
);

// 4. TagInputWidget
export const TagInputWidget: React.FC<{ initialTags: string[] }> = ({ initialTags }) => (
    <div className="flex flex-wrap gap-2 mt-2 p-2 bg-black/20 rounded border border-white/10">
        {initialTags.map(t => (
            <span key={t} className="px-2 py-0.5 bg-blue-600/30 text-blue-200 text-xs rounded border border-blue-500/50 flex items-center gap-1">
                {t} <button className="hover:text-white">×</button>
            </span>
        ))}
        <input className="bg-transparent border-none text-xs text-white p-0 w-20 focus:ring-0" placeholder="+ Tag" />
    </div>
);

// 5. IconPickerModal
export const IconPickerModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const icons = ['school', 'star', 'rocket', 'lightbulb', 'science', 'code', 'book', 'history_edu'];
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#1e1e1e] p-4 rounded-xl shadow-xl w-64">
                <h4 className="text-white text-sm font-bold mb-3">Lựa chọn Biểu tượng Đại diện</h4>
                <div className="grid grid-cols-4 gap-2">
                    {icons.map(icon => (
                        <button key={icon} className="p-2 hover:bg-white/10 rounded flex justify-center text-slate-300 hover:text-white">
                            <span className="material-symbols-outlined">{icon}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// 6. BatchActionToolbar
export const BatchActionToolbar: React.FC<{ selectedCount: number }> = ({ selectedCount }) => {
    if (selectedCount < 2) return null;
    return (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 flex gap-2 bg-[#1e1e1e] p-2 rounded-full border border-white/20 shadow-2xl animate-fade-in-up">
            <span className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-full">Đã chọn {selectedCount} đối tượng</span>
            <button className="p-1.5 hover:bg-white/10 rounded-full text-slate-300" title="Gom nhóm"><span className="material-symbols-outlined text-sm">group_work</span></button>
            <button className="p-1.5 hover:bg-white/10 rounded-full text-slate-300" title="Thiết lập màu sắc"><span className="material-symbols-outlined text-sm">palette</span></button>
            <button className="p-1.5 hover:bg-white/10 rounded-full text-slate-300" title="Căn chỉnh vị trí"><span className="material-symbols-outlined text-sm">align_horizontal_center</span></button>
            <div className="w-px bg-white/20 h-full mx-1"></div>
            <button className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-full" title="Xóa đối tượng"><span className="material-symbols-outlined text-sm">delete</span></button>
        </div>
    );
};
