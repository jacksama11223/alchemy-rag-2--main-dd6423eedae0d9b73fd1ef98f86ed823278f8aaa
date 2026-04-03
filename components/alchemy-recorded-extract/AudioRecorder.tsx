import React, { useState, useRef, useEffect } from 'react';
import { GlassSurface } from '../common/BrandAssets';

interface AudioRecorderProps {
    onSave: (title: string, audioBase64: string, transcript: string, duration: number) => Promise<void>;
    onCancel: () => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onSave, onCancel }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recordingTime, setRecordingTime] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [title, setTitle] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'vi-VN';

            recognition.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcriptPart = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        currentTranscript += transcriptPart + ' ';
                    } else {
                        currentTranscript += transcriptPart;
                    }
                }
                setTranscript((prev) => prev + currentTranscript);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
            };

            recognitionRef.current = recognition;
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) {}
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = handleStopRecording;

            mediaRecorder.start();
            setIsRecording(true);
            setTranscript('');
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                } catch (e) {
                    console.error("Failed to start speech recognition", e);
                }
            }
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) {}
        }
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
    };

    const handleStopRecording = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            // Show save dialog or save directly
            // For simplicity, we'll prompt for title here or use default
        };
    };

    const handleSave = async () => {
        if (audioChunksRef.current.length === 0) return;
        
        setIsSaving(true);
        try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;
                const finalTitle = title.trim() || `Bản ghi âm ${new Date().toLocaleDateString('vi-VN')}`;
                // If transcript is empty (e.g. browser doesn't support), add a placeholder
                const finalTranscript = transcript.trim() || 'Không có dữ liệu văn bản được nhận diện.';
                
                await onSave(finalTitle, base64Audio, finalTranscript, recordingTime);
            };
        } catch (error) {
            console.error("Error saving recording:", error);
            setIsSaving(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <GlassSurface className="h-full flex flex-col p-8 items-center justify-center relative">
            <button 
                onClick={onCancel}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
                <span className="material-symbols-outlined">close</span>
            </button>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Ghi âm mới</h2>
                <p className="text-slate-500">Nhấn nút bên dưới để bắt đầu ghi âm và nhận diện giọng nói.</p>
            </div>

            <div className="flex flex-col items-center gap-6 mb-8">
                <div className={`text-5xl font-mono font-bold ${isRecording ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                    {formatTime(recordingTime)}
                </div>

                {!isRecording && audioChunksRef.current.length === 0 ? (
                    <button
                        onClick={startRecording}
                        className="w-24 h-24 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center shadow-xl hover:shadow-rose-500/30 transition-all hover:scale-105"
                    >
                        <span className="material-symbols-outlined text-white text-5xl">mic</span>
                    </button>
                ) : isRecording ? (
                    <button
                        onClick={stopRecording}
                        className="w-24 h-24 bg-slate-800 hover:bg-slate-900 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105"
                    >
                        <span className="material-symbols-outlined text-white text-5xl">stop</span>
                    </button>
                ) : (
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                audioChunksRef.current = [];
                                setTranscript('');
                                setRecordingTime(0);
                                startRecording();
                            }}
                            className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">replay</span>
                            Ghi âm lại
                        </button>
                    </div>
                )}
            </div>

            {/* Live Transcript Display */}
            <div className="w-full max-w-2xl bg-white/50 rounded-2xl p-6 border border-slate-200 min-h-[150px] shadow-inner mb-6">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">closed_caption</span>
                    Văn bản nhận diện
                </h4>
                <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap">
                    {transcript || (isRecording ? <span className="text-slate-400 italic">Đang lắng nghe...</span> : <span className="text-slate-400 italic">Chưa có dữ liệu</span>)}
                </p>
            </div>

            {/* Save Form */}
            {!isRecording && audioChunksRef.current.length > 0 && (
                <div className="w-full max-w-2xl flex gap-3 animate-slide-up">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nhập tên bản ghi âm (tùy chọn)..."
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                    />
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md"
                    >
                        {isSaving ? (
                            <><span className="material-symbols-outlined animate-spin">sync</span> Đang lưu...</>
                        ) : (
                            <><span className="material-symbols-outlined">save</span> Lưu bản ghi</>
                        )}
                    </button>
                </div>
            )}
        </GlassSurface>
    );
};

export default AudioRecorder;
