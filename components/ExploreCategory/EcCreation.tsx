
import React, { useState } from 'react';

// 1. BigBangCreatorModal
export const BigBangCreatorModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in p-4">
            <div className="bg-[#0f172a] border border-white/20 rounded-2xl w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"><span className="material-symbols-outlined">close</span></button>
                <div className="p-8 text-center border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                    <h2 className="text-3xl font-black text-white mb-2">Khởi tạo Vũ trụ Mới</h2>
                    <p className="text-slate-400">Bắt đầu hành trình kiến tạo tri thức của bạn.</p>
                </div>
                <div className="flex-1 p-8 overflow-y-auto">
                    {/* Content would go here - using placeholders from other components */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-cyan-300 uppercase">Tên Hành Tinh (Chủ đề)</label>
                            <input className="w-full bg-black/20 border border-white/20 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" placeholder="VD: Lập trình Python..." />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-cyan-300 uppercase">Loại hình</label>
                            <select className="w-full bg-black/20 border border-white/20 rounded-lg p-3 text-white outline-none">
                                <option>Bài học (Lesson)</option>
                                <option>Flashcard Deck</option>
                                <option>Quiz Set</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-8 h-64 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500">
                        Terraform Editor Placeholder
                    </div>
                </div>
                <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-[#020617]">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg hover:bg-white/10 text-white font-bold transition-colors">Hủy</button>
                    <button 
                        onClick={() => { alert("Đã khởi tạo vũ trụ mới thành công!"); onClose(); }}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-white font-bold hover:scale-105 transition-transform shadow-lg"
                    >
                        Kích hoạt (Publish)
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2. TerraformEditor
export const TerraformEditor: React.FC = () => (
    <div className="w-full h-full bg-[#020410] text-slate-300 font-mono text-sm p-4 outline-none resize-none" contentEditable>
        # Introduction
        <br/><br/>
        Start typing your content here...
    </div>
);

// 3. ProbeImageUploader
export const ProbeImageUploader: React.FC = () => {
    const handleUpload = () => {
        alert("Đang phân tích hình ảnh... (Mock)");
    };

    return (
        <div 
            onClick={handleUpload}
            className="border-2 border-dashed border-cyan-500/30 bg-cyan-500/5 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-cyan-500/10 transition-colors group"
        >
            <span className="material-symbols-outlined text-4xl text-cyan-400 group-hover:scale-110 transition-transform mb-2">satellite_alt</span>
            <p className="text-xs font-bold text-cyan-200 uppercase">Phóng vệ tinh thăm dò (Upload Ảnh)</p>
        </div>
    );
};

// 4. TagMeteorShowerInput
export const TagMeteorShowerInput: React.FC = () => (
    <div className="relative">
        <input className="w-full bg-transparent border-b border-white/20 py-2 text-white placeholder-slate-500 focus:border-cyan-500 outline-none" placeholder="Thêm thẻ (Tags)..." />
        <span className="material-symbols-outlined absolute right-0 top-2 text-slate-500">label</span>
    </div>
);

// 5. TelescopePreviewMode
export const TelescopePreviewMode: React.FC<{ active: boolean, onToggle: () => void }> = ({ active, onToggle }) => (
    <button 
        onClick={onToggle}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${active ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'}`}
    >
        <span className="material-symbols-outlined text-sm">visibility</span>
        {active ? 'Đang quan sát' : 'Kính viễn vọng (Preview)'}
    </button>
);

// 6. CryoChamberDrafts
export const CryoChamberDrafts: React.FC = () => (
    <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-white/10">
        <div className="bg-blue-900/20 p-2 text-xs font-bold text-blue-200 uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">ac_unit</span> Buồng đông lạnh (Nháp)
        </div>
        <div className="p-2 space-y-1">
            <div className="p-2 hover:bg-white/5 rounded cursor-pointer flex justify-between text-xs text-slate-300">
                <span>Untitled Draft 1</span>
                <span className="text-slate-500">2d ago</span>
            </div>
        </div>
    </div>
);

// 7. WormholeImporter
export const WormholeImporter: React.FC = () => (
    <div className="flex gap-2">
        <button 
            onClick={() => alert("Đang kết nối cổng Excel...")}
            className="flex-1 py-2 bg-green-600/20 border border-green-500/30 text-green-300 rounded hover:bg-green-600/30 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
        >
            <span className="material-symbols-outlined text-sm">table_view</span> Excel
        </button>
        <button 
            onClick={() => alert("Đang kết nối cổng Notion...")}
            className="flex-1 py-2 bg-white/10 border border-white/20 text-white rounded hover:bg-white/20 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
        >
            <span className="material-symbols-outlined text-sm">description</span> Notion
        </button>
    </div>
);

// 8. EscapePodExporter
export const EscapePodExporter: React.FC = () => (
    <button 
        onClick={() => alert("Đang chuẩn bị gói dữ liệu JSON...")}
        className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
    >
        <span className="material-symbols-outlined text-sm">output</span>
        Khởi động tàu thoát hiểm (Export JSON)
    </button>
);

// 9. BlueprintGallery
export const BlueprintGallery: React.FC = () => (
    <div className="grid grid-cols-3 gap-2">
        {['Sơ đồ tư duy', 'Flashcard Deck', 'Bài viết Blog'].map((name, i) => (
            <div 
                key={i} 
                onClick={() => alert(`Đã chọn bản vẽ: ${name}`)}
                className="aspect-square bg-white/5 rounded-lg border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all p-2 text-center"
            >
                <span className="material-symbols-outlined text-slate-400">architecture</span>
                <span className="text-[10px] text-slate-300 leading-tight">{name}</span>
            </div>
        ))}
    </div>
);

// 10. VisibilityShieldToggle
export const VisibilityShieldToggle: React.FC = () => {
    const [isPublic, setIsPublic] = useState(true);
    return (
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${isPublic ? 'bg-green-500' : 'bg-slate-600'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isPublic ? 'left-6' : 'left-1'}`}></div>
            </div>
            <span className="text-xs text-slate-300 font-bold">{isPublic ? 'Công khai (Public)' : 'Khiên chắn (Private)'}</span>
        </div>
    );
};
