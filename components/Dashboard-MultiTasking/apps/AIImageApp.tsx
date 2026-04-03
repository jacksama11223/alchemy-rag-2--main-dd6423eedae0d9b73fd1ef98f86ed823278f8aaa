import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion } from 'framer-motion';

export const AIImageApp: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setImageUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: prompt,
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: imageSize,
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          setImageUrl(`data:image/png;base64,${base64EncodeString}`);
          break;
        }
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] p-4 gap-4 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-2 shrink-0">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to create..."
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none h-24"
        />
      </div>

      <div className="flex gap-4 shrink-0">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aspect Ratio</label>
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
          >
            <option value="1:1">1:1 Square</option>
            <option value="2:3">2:3 Portrait</option>
            <option value="3:2">3:2 Landscape</option>
            <option value="3:4">3:4 Portrait</option>
            <option value="4:3">4:3 Landscape</option>
            <option value="9:16">9:16 Vertical</option>
            <option value="16:9">16:9 Widescreen</option>
            <option value="21:9">21:9 Ultrawide</option>
          </select>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Size</label>
          <select
            value={imageSize}
            onChange={(e) => setImageSize(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
          >
            <option value="1K">1K Standard</option>
            <option value="2K">2K High Res</option>
            <option value="4K">4K Ultra HD</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isLoading || !prompt.trim()}
        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
      >
        {isLoading ? (
          <>
            <span className="material-symbols-outlined animate-spin">refresh</span>
            Generating...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">auto_awesome</span>
            Generate Image
          </>
        )}
      </button>

      <div className="flex-1 border border-white/10 rounded-xl bg-black/20 flex items-center justify-center overflow-hidden relative min-h-[200px]">
        {imageUrl ? (
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={imageUrl}
            alt="Generated"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-slate-500 flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-4xl opacity-50">image</span>
            <span className="text-xs">Image will appear here</span>
          </div>
        )}
      </div>
    </div>
  );
};
