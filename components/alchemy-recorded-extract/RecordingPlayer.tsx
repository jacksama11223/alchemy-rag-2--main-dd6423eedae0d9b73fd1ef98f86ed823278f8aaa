import React from 'react';

interface RecordingPlayerProps {
    audioData: string;
    title: string;
}

const RecordingPlayer: React.FC<RecordingPlayerProps> = ({ audioData, title }) => {
    if (!audioData) return null;

    return (
        <div className="w-full bg-slate-900 rounded-xl p-6 shadow-lg flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-2xl">graphic_eq</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate" title={title}>
                        {title}
                    </h3>
                    <p className="text-sm text-slate-400">Đang phát bản ghi âm</p>
                </div>
            </div>
            
            <div className="w-full">
                <audio 
                    controls 
                    src={audioData} 
                    className="w-full h-10 outline-none"
                    controlsList="nodownload"
                >
                    Trình duyệt của bạn không hỗ trợ thẻ audio.
                </audio>
            </div>
        </div>
    );
};

export default RecordingPlayer;
