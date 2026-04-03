import React from 'react';
import { GlassSurface } from '../common/BrandAssets';

interface SavedRecording {
    _id: string;
    title: string;
    audioData: string;
    transcript: string;
    duration: number;
    createdAt: string;
}

interface RecordingListProps {
    recordings: SavedRecording[];
    selectedRecordingId?: string;
    onSelectRecording: (recording: SavedRecording) => void;
    onDeleteRecording: (id: string) => void;
    onStartNewRecording: () => void;
    isLoading: boolean;
}

const RecordingList: React.FC<RecordingListProps> = ({ 
    recordings, 
    selectedRecordingId, 
    onSelectRecording, 
    onDeleteRecording, 
    onStartNewRecording,
    isLoading 
}) => {
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <GlassSurface className="h-full flex flex-col p-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500">mic</span>
                Bản ghi âm của bạn
            </h3>

            <button
                onClick={onStartNewRecording}
                className="mb-4 w-full bg-rose-500 hover:bg-rose-600 text-white px-4 py-3 rounded-xl font-bold transition-colors shadow-md flex items-center justify-center gap-2"
            >
                <span className="material-symbols-outlined">add_circle</span>
                Ghi âm mới
            </button>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {isLoading && recordings.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <span className="material-symbols-outlined animate-spin text-2xl mb-2">sync</span>
                        <p className="text-sm">Đang tải...</p>
                    </div>
                ) : recordings.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <span className="material-symbols-outlined text-3xl mb-2 opacity-50">audio_file</span>
                        <p className="text-sm">Chưa có bản ghi âm nào.</p>
                    </div>
                ) : (
                    recordings.map(recording => (
                        <div 
                            key={recording._id}
                            onClick={() => onSelectRecording(recording)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all group ${
                                selectedRecordingId === recording._id 
                                    ? 'border-rose-500 bg-rose-50 shadow-sm' 
                                    : 'border-slate-200 hover:border-rose-300 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-xl">play_arrow</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-slate-800 text-sm truncate" title={recording.title}>
                                        {recording.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                                            {formatDuration(recording.duration)}
                                        </span>
                                        <span>•</span>
                                        <span className="truncate">{formatDate(recording.createdAt)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteRecording(recording._id);
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

export default RecordingList;
