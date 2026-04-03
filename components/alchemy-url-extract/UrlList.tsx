import React, { useState } from 'react';
import { GlassSurface } from '../common/BrandAssets';

interface SavedUrl {
    _id: string;
    url: string;
    title: string;
    htmlContent: string;
    textContent: string;
    createdAt: string;
}

interface UrlListProps {
    urls: SavedUrl[];
    selectedUrlId?: string;
    onSelectUrl: (url: SavedUrl) => void;
    onDeleteUrl: (id: string) => void;
    onAddUrl: (url: string) => void;
    isLoading: boolean;
}

const UrlList: React.FC<UrlListProps> = ({ urls, selectedUrlId, onSelectUrl, onDeleteUrl, onAddUrl, isLoading }) => {
    const [newUrl, setNewUrl] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUrl.trim()) {
            onAddUrl(newUrl.trim());
            setNewUrl('');
        }
    };

    return (
        <GlassSurface className="h-full flex flex-col p-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">link</span>
                Danh sách URL đã lưu
            </h3>

            <form onSubmit={handleAdd} className="mb-4 flex gap-2">
                <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="Nhập URL mới..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-sm"
                    required
                />
                <button
                    type="submit"
                    disabled={isLoading || !newUrl.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {isLoading && urls.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <span className="material-symbols-outlined animate-spin text-2xl mb-2">sync</span>
                        <p className="text-sm">Đang tải...</p>
                    </div>
                ) : urls.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <span className="material-symbols-outlined text-3xl mb-2 opacity-50">web</span>
                        <p className="text-sm">Chưa có URL nào được lưu.</p>
                    </div>
                ) : (
                    urls.map(url => (
                        <div 
                            key={url._id}
                            onClick={() => onSelectUrl(url)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all group ${
                                selectedUrlId === url._id 
                                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-slate-800 text-sm truncate" title={url.title}>
                                        {url.title || url.url}
                                    </h4>
                                    <p className="text-xs text-slate-500 truncate mt-1" title={url.url}>
                                        {url.url}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteUrl(url._id);
                                    }}
                                    className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                    title="Xóa"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </GlassSurface>
    );
};

export default UrlList;
