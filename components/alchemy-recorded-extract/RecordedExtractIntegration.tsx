import React, { useState, useEffect } from 'react';
import { GlassSurface } from '../common/BrandAssets';
import { getAuthHeader } from '../../services/mockBackend';
import RecordingList from './RecordingList';
import AudioRecorder from './AudioRecorder';
import RecordingPlayer from './RecordingPlayer';
import TranscriptHighlighterFlashcard from './TranscriptHighlighterFlashcard';

interface RecordedExtractIntegrationProps {
    onAddSource: (source: any) => void;
}

const RecordedExtractIntegration: React.FC<RecordedExtractIntegrationProps> = ({ onAddSource }) => {
    const [recordings, setRecordings] = useState<any[]>([]);
    const [selectedRecording, setSelectedRecording] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRecordingMode, setIsRecordingMode] = useState(false);

    useEffect(() => {
        fetchRecordings();
    }, []);

    const fetchRecordings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/savedrecordings', {
                headers: getAuthHeader()
            });
            if (response.ok) {
                const data = await response.json();
                setRecordings(data);
            } else {
                // Fallback mock data
                setRecordings([
                    {
                        _id: 'mock-rec-1',
                        title: 'Bản ghi âm mẫu - Lịch sử',
                        audioData: '', // Empty for mock
                        transcript: 'Xin chào, đây là bản ghi âm mẫu. Hôm nay chúng ta sẽ tìm hiểu về lịch sử Việt Nam. Lịch sử Việt Nam nếu tính từ lúc có mặt con người sinh sống thì đã có hàng vạn năm trước Công nguyên...',
                        duration: 45,
                        createdAt: new Date().toISOString()
                    }
                ]);
            }
        } catch (error) {
            console.error("Error fetching recordings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveRecording = async (title: string, audioBase64: string, transcript: string, duration: number) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/savedrecordings', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    title,
                    audioData: audioBase64,
                    transcript,
                    duration
                })
            });

            if (response.ok) {
                const saved = await response.json();
                setRecordings([saved, ...recordings]);
                setSelectedRecording(saved);
                setIsRecordingMode(false);
            } else {
                // Fallback
                const newSaved = {
                    _id: `mock-${Date.now()}`,
                    title,
                    audioData: audioBase64,
                    transcript,
                    duration,
                    createdAt: new Date().toISOString()
                };
                setRecordings([newSaved, ...recordings]);
                setSelectedRecording(newSaved);
                setIsRecordingMode(false);
            }
        } catch (error) {
            console.error("Error saving recording:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteRecording = async (id: string) => {
        try {
            await fetch(`/api/savedrecordings/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            setRecordings(recordings.filter(r => r._id !== id));
            if (selectedRecording?._id === id) {
                setSelectedRecording(null);
            }
        } catch (error) {
            console.error("Error deleting recording:", error);
        }
    };

    const handleImportToAlchemy = () => {
        if (selectedRecording) {
            onAddSource({
                id: `audio-${Date.now()}`,
                type: 'audio',
                content: selectedRecording.transcript || 'Không có văn bản',
                metadata: {
                    fileName: selectedRecording.title,
                    duration: selectedRecording.duration,
                    source: 'RecordedExtract'
                }
            });
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-600 mb-4 shadow-inner">
                    <span className="material-symbols-outlined text-3xl">mic</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Trích xuất Ghi âm</h3>
                <p className="text-slate-600 max-w-lg mx-auto">
                    Ghi âm giọng nói, tự động chuyển đổi thành văn bản, nghe lại và tạo Flashcard từ nội dung đã ghi.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Recording List */}
                <div className="lg:col-span-1 h-[700px]">
                    <RecordingList 
                        recordings={recordings} 
                        isLoading={isLoading} 
                        selectedRecordingId={selectedRecording?._id} 
                        onSelectRecording={(rec) => {
                            setSelectedRecording(rec);
                            setIsRecordingMode(false);
                        }} 
                        onDeleteRecording={handleDeleteRecording}
                        onStartNewRecording={() => {
                            setSelectedRecording(null);
                            setIsRecordingMode(true);
                        }}
                    />
                </div>

                {/* Right Column: Recorder or Player & Transcript */}
                <div className="lg:col-span-2 h-[700px] flex flex-col gap-4">
                    {isRecordingMode ? (
                        <AudioRecorder 
                            onSave={handleSaveRecording} 
                            onCancel={() => setIsRecordingMode(false)} 
                        />
                    ) : selectedRecording ? (
                        <>
                            {/* Top: Audio Player */}
                            <div className="flex-shrink-0">
                                <RecordingPlayer 
                                    audioData={selectedRecording.audioData} 
                                    title={selectedRecording.title} 
                                />
                                <div className="flex items-center justify-end mt-4 px-2">
                                    <button 
                                        onClick={handleImportToAlchemy}
                                        className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-md flex-shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-sm">science</span>
                                        Đưa vào Lò Luyện
                                    </button>
                                </div>
                            </div>

                            {/* Bottom: Transcript & Flashcard */}
                            <GlassSurface className="flex-1 overflow-hidden p-4">
                                <TranscriptHighlighterFlashcard recordingData={selectedRecording} />
                            </GlassSurface>
                        </>
                    ) : (
                        <GlassSurface className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            <span className="material-symbols-outlined text-6xl mb-4 opacity-50">audio_file</span>
                            <h3 className="text-xl font-medium text-slate-600 mb-2">Chưa chọn Bản ghi âm</h3>
                            <p className="text-sm max-w-sm">
                                Hãy nhấn "Ghi âm mới" hoặc chọn một bản ghi âm từ danh sách bên trái để nghe lại và tạo Flashcard.
                            </p>
                        </GlassSurface>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecordedExtractIntegration;
