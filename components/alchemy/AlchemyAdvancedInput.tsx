
import React, { useState, useRef, useEffect } from 'react';
import { AlchemySource } from '../../types';
import { PromptEngineerAssistant } from './AlchemyAIInteractions';
import { extractTextFromImage, transcribeAudio, analyzeImageWithThinking } from '../../services/geminiService';
import { scrapeWebsite } from '../../services/mockBackend'; 
import NoteLabIntegration from '../alchemy-notelab/NoteLabIntegration';
import UrlExtractIntegration from '../alchemy-url-extract/UrlExtractIntegration';
import YoutubeExtractIntegration from '../alchemy-youtubevideo-extract/YoutubeExtractIntegration';
import RecordedExtractIntegration from '../alchemy-recorded-extract/RecordedExtractIntegration';
import CopyPasteIntegration from '../alchemy-copypastetext-extract/CopyPasteIntegration';

interface InputProps {
    onAddSource: (source: AlchemySource) => void;
}

// ----------------------------------------------------------------------
// 1. URL SCRAPER: Integrated with UrlExtract
// ----------------------------------------------------------------------

export const UrlScraperInput: React.FC<InputProps> = ({ onAddSource }) => {
    return <UrlExtractIntegration onAddSource={onAddSource} />;
};

// ----------------------------------------------------------------------
// 2. YOUTUBE TRANSCRIBER: Integrated with YoutubeExtract
// ----------------------------------------------------------------------

export const YoutubeTranscriber: React.FC<InputProps> = ({ onAddSource }) => {
    return <YoutubeExtractIntegration onAddSource={onAddSource} />;
};

import OcrCoordinator from '../alchemy-OCR/OcrCoordinator';

// ----------------------------------------------------------------------
// 3. OCR SCANNER (Integrated with alchemy-OCR)
// ----------------------------------------------------------------------

export const OcrScanner: React.FC<InputProps> = ({ onAddSource }) => {
    return <OcrCoordinator onAddSource={onAddSource} />;
};

// ----------------------------------------------------------------------
// 4. AUDIO RECORDER: Integrated with RecordedExtract
// ----------------------------------------------------------------------

export const AudioRecorder: React.FC<InputProps> = ({ onAddSource }) => {
    return <RecordedExtractIntegration onAddSource={onAddSource} />;
};

// ----------------------------------------------------------------------
// 5. CONTEXT MIXER (Light Mode)
// ----------------------------------------------------------------------

interface ContextMixerProps {
    sources: AlchemySource[];
    onRemoveSource: (id: string) => void;
}

export const ContextMixer: React.FC<ContextMixerProps> = ({ sources, onRemoveSource }) => {
    if (sources.length === 0) return null;

    const totalConfidence = sources.reduce((acc, src) => acc + (src.metadata?.confidence || 1), 0) / sources.length * 100;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg mt-6 overflow-hidden animate-[fadeInUp_0.3s]">
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-amber-500">blender</span>
                    Nguyên liệu ({sources.length})
                </h4>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 uppercase">Chất lượng:</span>
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: `${totalConfidence}%` }}></div>
                    </div>
                </div>
            </div>
            
            <div className="p-3 space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
                {sources.map(src => (
                    <div key={src.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm hover:bg-blue-50 transition-colors group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                                src.type === 'url' ? 'bg-blue-100 text-blue-500' : 
                                src.type === 'youtube' ? 'bg-red-100 text-red-500' :
                                src.type === 'image' ? 'bg-sky-100 text-sky-500' : 'bg-purple-100 text-purple-500'
                            }`}>
                                <span className="material-symbols-outlined text-lg">
                                    {src.type === 'url' ? 'link' : src.type === 'youtube' ? 'smart_display' : src.type === 'image' ? 'image' : 'mic'}
                                </span>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="truncate text-slate-700 font-bold">
                                    {src.metadata?.fileName || "Unknown Source"}
                                </span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                                    {src.type.toUpperCase()} • {src.content.length} chars
                                    {src.metadata?.duration && ` • ${src.metadata.duration}`}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => onRemoveSource(src.id)} 
                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                            title="Xóa nguồn"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 6. NOTE IMPORTER (Integrated with NoteLab)
// ----------------------------------------------------------------------

export const NoteImporter: React.FC<InputProps> = ({ onAddSource }) => {
    return <NoteLabIntegration onAddSource={onAddSource} />;
};

// ----------------------------------------------------------------------
// 7. GOOGLE DRIVE IMPORTER (Mock)
// ----------------------------------------------------------------------

export const DriveImporter: React.FC<InputProps> = ({ onAddSource }) => {
    const [loading, setLoading] = useState(false);

    const handleImport = () => {
        setLoading(true);
        setTimeout(() => {
            onAddSource({
                id: Date.now().toString(),
                type: 'text',
                content: "Nội dung tài liệu từ Google Drive...",
                metadata: { fileName: "Tài liệu Drive.docx", confidence: 0.9 }
            });
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="w-full border border-slate-200 bg-white rounded-xl p-6 flex flex-col items-center justify-center shadow-sm hover:border-green-400 transition-all">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-green-600">add_to_drive</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Google Drive</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Kết nối và lấy tài liệu trực tiếp từ Google Drive của bạn.</p>
            <button 
                onClick={handleImport}
                disabled={loading}
                className="bg-green-500 hover:bg-green-400 text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
                {loading ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : <span className="material-symbols-outlined text-sm">cloud_download</span>}
                {loading ? 'Đang kết nối...' : 'Mở Drive Picker'}
            </button>
        </div>
    );
};

// ----------------------------------------------------------------------
// 8. IMAGE ANALYZER (Thinking Level HIGH)
// ----------------------------------------------------------------------

export const ImageAnalyzerInput: React.FC<InputProps> = ({ onAddSource }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [processingFile, setProcessingFile] = useState<string | null>(null);
    const [loadingText, setLoadingText] = useState("");

    const processFile = (file: File) => {
        setProcessingFile(file.name);
        setLoadingText("Đang tải ảnh...");
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const base64 = ev.target?.result as string;
            setLoadingText("Gemini Pro đang suy nghĩ sâu (Thinking Level HIGH)...");
            try {
                const analysis = await analyzeImageWithThinking(base64, "Hãy phân tích chi tiết hình ảnh này, trích xuất thông tin quan trọng, giải thích các khái niệm nếu có, và đưa ra tóm tắt toàn diện.");
                onAddSource({
                    id: Date.now().toString(),
                    type: 'image',
                    content: analysis,
                    metadata: { fileName: `Phân tích: ${file.name}`, confidence: 0.98 }
                });
            } catch (err) {
                console.error(err);
                alert("Lỗi: Không thể phân tích ảnh này.");
            } finally {
                setProcessingFile(null);
                setLoadingText("");
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="w-full">
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => e.target.files && processFile(e.target.files[0])} />
            <button 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                disabled={!!processingFile}
                className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all group relative overflow-hidden shadow-sm ${
                    isDragging 
                    ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
                    : processingFile
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-indigo-400'
                }`}
            >
                {processingFile ? (
                    <div className="flex flex-col items-center gap-3 z-10">
                        <span className="material-symbols-outlined text-4xl text-indigo-500 animate-spin">psychology</span>
                        <div className="text-center">
                            <p className="text-sm font-bold text-slate-700">{loadingText}</p>
                            <p className="text-xs text-slate-500">{processingFile}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 relative">
                            <span className="material-symbols-outlined text-3xl text-indigo-600">network_intelligence</span>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                                <span className="material-symbols-outlined text-[10px] text-white">star</span>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">Phân Tích Ảnh Chuyên Sâu</span>
                        <span className="text-xs text-slate-500 text-center">Sử dụng Gemini 3.1 Pro (Thinking Level HIGH)<br/>để phân tích chi tiết hình ảnh</span>
                    </>
                )}
            </button>
        </div>
    );
};

// ----------------------------------------------------------------------
// 9. DIRECT TEXT INPUT (Integrated with CopyPasteText)
// ----------------------------------------------------------------------

export const DirectTextInput: React.FC<InputProps> = ({ onAddSource }) => {
    return <CopyPasteIntegration onAddSource={onAddSource} />;
};

// ----------------------------------------------------------------------
// 10. FILE UPLOADER
// ----------------------------------------------------------------------

export const FileUploader: React.FC<InputProps> = ({ onAddSource }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [processingFile, setProcessingFile] = useState<string | null>(null);

    const processFile = (file: File) => {
        setProcessingFile(file.name);
        // Mock processing for text/pdf/docx
        setTimeout(() => {
            onAddSource({
                id: Date.now().toString(),
                type: 'text',
                content: `Nội dung trích xuất từ tệp ${file.name}...`,
                metadata: { fileName: file.name, confidence: 0.9 }
            });
            setProcessingFile(null);
        }, 1500);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="w-full">
            <input type="file" ref={fileInputRef} accept=".txt,.pdf,.docx,.md" className="hidden" onChange={(e) => e.target.files && processFile(e.target.files[0])} />
            <button 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                disabled={!!processingFile}
                className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all group relative overflow-hidden shadow-sm ${
                    isDragging 
                    ? 'border-emerald-500 bg-emerald-50 scale-[1.02]' 
                    : processingFile
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-emerald-400'
                }`}
            >
                {processingFile ? (
                    <div className="flex flex-col items-center gap-3 z-10">
                        <span className="material-symbols-outlined text-4xl text-emerald-500 animate-spin">sync</span>
                        <div className="text-center">
                            <p className="text-sm font-bold text-slate-700">Đang đọc tệp...</p>
                            <p className="text-xs text-slate-500">{processingFile}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-3xl text-emerald-600">upload_file</span>
                        </div>
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">Tải Lên Tệp Tài Liệu</span>
                        <span className="text-xs text-slate-500">Hỗ trợ PDF, TXT, DOCX, MD</span>
                    </>
                )}
            </button>
        </div>
    );
};
