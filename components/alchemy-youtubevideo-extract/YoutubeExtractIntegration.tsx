import React, { useState, useEffect } from 'react';
import { GlassSurface } from '../common/BrandAssets';
import { getAuthHeader } from '../../services/mockBackend';
import YoutubeList from './YoutubeList';
import YoutubePlayer from './YoutubePlayer';
import YoutubeHighlighterFlashcard from './YoutubeHighlighterFlashcard';

interface YoutubeExtractIntegrationProps {
    onAddSource: (source: any) => void;
}

const YoutubeExtractIntegration: React.FC<YoutubeExtractIntegrationProps> = ({ onAddSource }) => {
    const [videos, setVideos] = useState<any[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/savedyoutubevideos', {
                headers: getAuthHeader()
            });
            if (response.ok) {
                const data = await response.json();
                setVideos(data);
            } else {
                // Fallback mock data
                setVideos([
                    {
                        _id: 'mock-vid-1',
                        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        videoId: 'dQw4w9WgXcQ',
                        title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
                        subtitles: 'We\'re no strangers to love\nYou know the rules and so do I\nA full commitment\'s what I\'m thinking of\nYou wouldn\'t get this from any other guy\n\nI just wanna tell you how I\'m feeling\nGotta make you understand\n\nNever gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you',
                        createdAt: new Date().toISOString()
                    }
                ]);
            }
        } catch (error) {
            console.error("Error fetching videos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const extractVideoId = (url: string) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    };

    const handleAddVideo = async (newUrl: string) => {
        const videoId = extractVideoId(newUrl);
        if (!videoId) {
            alert("URL YouTube không hợp lệ. Vui lòng kiểm tra lại.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/savedyoutubevideos', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    url: newUrl,
                    videoId: videoId
                })
            });

            if (response.ok) {
                const saved = await response.json();
                setVideos([saved, ...videos]);
                setSelectedVideo(saved);
            } else {
                // Fallback
                const newSaved = {
                    _id: `mock-${Date.now()}`,
                    url: newUrl,
                    videoId: videoId,
                    title: `YouTube Video: ${videoId}`,
                    subtitles: "Không thể lấy phụ đề vì máy chủ gặp lỗi hoặc video không có phụ đề đóng (CC).",
                    createdAt: new Date().toISOString()
                };
                setVideos([newSaved, ...videos]);
                setSelectedVideo(newSaved);
            }
        } catch (error) {
            console.error("Error adding video:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteVideo = async (id: string) => {
        try {
            await fetch(`/api/savedyoutubevideos/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            setVideos(videos.filter(v => v._id !== id));
            if (selectedVideo?._id === id) {
                setSelectedVideo(null);
            }
        } catch (error) {
            console.error("Error deleting video:", error);
        }
    };

    const handleImportToAlchemy = () => {
        if (selectedVideo) {
            onAddSource({
                id: `youtube-${Date.now()}`,
                type: 'youtube',
                content: selectedVideo.subtitles || 'Không có phụ đề',
                metadata: {
                    url: selectedVideo.url,
                    title: selectedVideo.title,
                    source: 'YoutubeExtract'
                }
            });
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4 shadow-inner">
                    <span className="material-symbols-outlined text-3xl">smart_display</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Trích xuất YouTube</h3>
                <p className="text-slate-600 max-w-lg mx-auto">
                    Lưu trữ video, xem trực tiếp, trích xuất phụ đề và tạo Flashcard từ nội dung video.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Video List */}
                <div className="lg:col-span-1 h-[700px]">
                    <YoutubeList 
                        videos={videos} 
                        isLoading={isLoading} 
                        selectedVideoId={selectedVideo?._id} 
                        onSelectVideo={setSelectedVideo} 
                        onDeleteVideo={handleDeleteVideo}
                        onAddVideo={handleAddVideo}
                    />
                </div>

                {/* Right Column: Video Player & Subtitles */}
                <div className="lg:col-span-2 h-[700px] flex flex-col gap-4">
                    {selectedVideo ? (
                        <>
                            {/* Top: Video Player */}
                            <div className="flex-shrink-0">
                                <YoutubePlayer videoId={selectedVideo.videoId} />
                                <div className="flex items-center justify-between mt-4 px-2">
                                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1 flex-1 pr-4" title={selectedVideo.title}>
                                        {selectedVideo.title}
                                    </h3>
                                    <button 
                                        onClick={handleImportToAlchemy}
                                        className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-md flex-shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-sm">science</span>
                                        Đưa vào Lò Luyện
                                    </button>
                                </div>
                            </div>

                            {/* Bottom: Subtitles & Flashcard */}
                            <GlassSurface className="flex-1 overflow-hidden p-4">
                                <YoutubeHighlighterFlashcard videoData={selectedVideo} />
                            </GlassSurface>
                        </>
                    ) : (
                        <GlassSurface className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            <span className="material-symbols-outlined text-6xl mb-4 opacity-50">video_library</span>
                            <h3 className="text-xl font-medium text-slate-600 mb-2">Chưa chọn Video nào</h3>
                            <p className="text-sm max-w-sm">
                                Hãy thêm một link YouTube mới hoặc chọn từ danh sách bên trái để bắt đầu xem, đọc phụ đề và tạo Flashcard.
                            </p>
                        </GlassSurface>
                    )}
                </div>
            </div>
        </div>
    );
};

export default YoutubeExtractIntegration;
