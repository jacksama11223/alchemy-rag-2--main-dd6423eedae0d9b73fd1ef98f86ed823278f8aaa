import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

interface ImageStudioProps {
    onImageGenerated?: (imageUrl: string) => void;
}

export const ImageStudio: React.FC<ImageStudioProps> = ({ onImageGenerated }) => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [imageSize, setImageSize] = useState('1K');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasApiKey, setHasApiKey] = useState(true);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setHasApiKey(hasKey);
            }
        };
        checkApiKey();
    }, []);

    const handleSelectApiKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            setHasApiKey(true); // Assume success to mitigate race condition
        }
    };

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY || '' });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: {
                    parts: [
                        { text: prompt }
                    ]
                },
                config: {
                    imageConfig: {
                        aspectRatio: aspectRatio,
                        imageSize: imageSize
                    }
                }
            });

            let imageUrl = null;
            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    const base64EncodeString = part.inlineData.data;
                    imageUrl = `data:image/png;base64,${base64EncodeString}`;
                    break;
                }
            }

            if (imageUrl) {
                setGeneratedImage(imageUrl);
                if (onImageGenerated) onImageGenerated(imageUrl);
            } else {
                setError('Không thể tạo hình ảnh. Vui lòng thử lại.');
            }
        } catch (err: any) {
            console.error('Image generation error:', err);
            if (err.message && err.message.includes('Requested entity was not found')) {
                setHasApiKey(false);
                setError('API Key không hợp lệ hoặc không được tìm thấy. Vui lòng chọn lại API Key.');
            } else {
                setError(err.message || 'Có lỗi xảy ra khi tạo hình ảnh.');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    if (!hasApiKey) {
        return (
            <div className="w-full max-w-4xl mx-auto py-8 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <span className="material-symbols-outlined text-6xl text-amber-500 mb-4">key</span>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Yêu cầu API Key</h2>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        Để sử dụng tính năng tạo ảnh chất lượng cao với mô hình Gemini Pro Image, bạn cần cung cấp API Key từ một dự án Google Cloud có thanh toán.
                        <br/><br/>
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-sky-500 hover:underline">Tìm hiểu thêm về thanh toán Gemini API</a>
                    </p>
                    <button 
                        onClick={handleSelectApiKey}
                        className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Chọn API Key
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto py-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-500 text-4xl">image</span>
                Image Studio
            </h2>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả hình ảnh (Prompt)</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 min-h-[120px]"
                        placeholder="Mô tả chi tiết hình ảnh bạn muốn tạo..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tỷ lệ khung hình (Aspect Ratio)</label>
                        <select 
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        >
                            <option value="1:1">1:1 (Square)</option>
                            <option value="3:4">3:4 (Portrait)</option>
                            <option value="4:3">4:3 (Landscape)</option>
                            <option value="9:16">9:16 (Story/Reel)</option>
                            <option value="16:9">16:9 (Widescreen)</option>
                            <option value="2:3">2:3</option>
                            <option value="3:2">3:2</option>
                            <option value="21:9">21:9 (Cinematic)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Kích thước (Image Size)</label>
                        <select 
                            value={imageSize}
                            onChange={(e) => setImageSize(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        >
                            <option value="1K">1K</option>
                            <option value="2K">2K</option>
                            <option value="4K">4K</option>
                        </select>
                    </div>
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${isGenerating || !prompt ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:shadow-lg hover:scale-[1.02]'}`}
                >
                    {isGenerating ? (
                        <><span className="material-symbols-outlined animate-spin">refresh</span> Đang tạo...</>
                    ) : (
                        <><span className="material-symbols-outlined">auto_awesome</span> Tạo Hình Ảnh</>
                    )}
                </button>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
                        {error}
                    </div>
                )}
            </div>

            {generatedImage && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Kết Quả</h3>
                    <img src={generatedImage} alt="Generated" className="max-w-full h-auto rounded-xl shadow-md mx-auto" />
                    <div className="mt-6 flex justify-center gap-4">
                        <a href={generatedImage} download="generated-image.png" className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-full hover:bg-slate-50 transition-colors font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined">download</span> Tải xuống
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};
