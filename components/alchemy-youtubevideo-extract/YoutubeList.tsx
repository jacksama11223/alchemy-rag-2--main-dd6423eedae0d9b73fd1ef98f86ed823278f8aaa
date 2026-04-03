import React, { useState } from 'react';
import { GlassSurface } from '../common/BrandAssets';

interface SavedVideo {
    _id: string;
    url: string;
    videoId: string;
    title: string;
    subtitles: string;
    createdAt: string;
}

interface YoutubeListProps {
    videos: SavedVideo[];
    selectedVideoId?: string;
    onSelectVideo: (video: SavedVideo) => void;
    onDeleteVideo: (id: string) => void;
    onAddVideo: (url: string) => void;
    isLoading: boolean;
}

const YoutubeList: React.FC<YoutubeListProps> = ({ videos, selectedVideoId, onSelectVideo, onDeleteVideo, onAddVideo, isLoading }) => {
    const [newUrl, setNewUrl] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUrl.trim()) {
            onAddVideo(newUrl.trim());
            setNewUrl('');
        }
    };

    return (
        <GlassSurface className="h-full flex flex-col p-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">smart_display</span>
                Danh sách Video đã lưu
            </h3>

            <form onSubmit={handleAdd} className="mb-4 flex gap-2">
                <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="Nhập link YouTube..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-red-500 text-sm"
                    required
                />
                <button
                    type="submit"
                    disabled={isLoading || !newUrl.trim()}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {isLoading && videos.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <span className="material-symbols-outlined animate-spin text-2xl mb-2">sync</span>
                        <p className="text-sm">Đang tải...</p>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <span className="material-symbols-outlined text-3xl mb-2 opacity-50">video_library</span>
                        <p className="text-sm">Chưa có Video nào được lưu.</p>
                    </div>
                ) : (
                    videos.map(video => (
                        <div 
                            key={video._id}
                            onClick={() => onSelectVideo(video)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all group ${
                                selectedVideoId === video._id 
                                    ? 'border-red-500 bg-red-50 shadow-sm' 
                                    : 'border-slate-200 hover:border-red-300 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div className="w-16 h-12 bg-slate-200 rounded overflow-hidden flex-shrink-0 relative">
                                    <img 
                                        src={`https://img.youtube.com/vi/${video.videoId}/default.jpg`} 
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-sm">play_arrow</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-slate-800 text-sm line-clamp-2" title={video.title}>
                                        {video.title || video.url}
                                    </h4>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteVideo(video._id);
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

export default YoutubeList;
