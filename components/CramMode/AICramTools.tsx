import React, { useState } from 'react';
import { generateMnemonics, explainLikeFive, generateCramAudioScript } from '../../services/geminiService';

// 1. Mnemonics Generator
export const MnemonicsGenerator: React.FC<{ topic: string }> = ({ topic }) => {
    const [mnemonic, setMnemonic] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGen = async () => {
        setLoading(true);
        const res = await generateMnemonics(topic);
        setMnemonic(res);
        setLoading(false);
    };

    return (
        <div className="mt-4 p-3 bg-indigo-900/30 border border-indigo-500/30 rounded-xl">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-indigo-300 uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">magic_button</span> Thần chú ghi nhớ
                </span>
                <button onClick={handleGen} disabled={loading} className="text-indigo-400 hover:text-white">
                    <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
                </button>
            </div>
            {mnemonic && <p className="text-sm text-white italic">"{mnemonic}"</p>}
        </div>
    );
};

// 2. ELI5 Simplifier
export const ELI5Button: React.FC<{ text: string }> = ({ text }) => {
    const [simpleText, setSimpleText] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSimplify = async () => {
        setLoading(true);
        const res = await explainLikeFive(text);
        setSimpleText(res);
        setLoading(false);
    };

    return (
        <div className="mt-2">
            {!simpleText ? (
                <button onClick={handleSimplify} disabled={loading} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">child_care</span> Giải thích cho bé 5 tuổi
                    {loading && <span className="animate-spin ml-1">...</span>}
                </button>
            ) : (
                <div className="p-2 bg-cyan-900/30 rounded border border-cyan-500/30 mt-1">
                    <p className="text-xs text-cyan-100">{simpleText}</p>
                </div>
            )}
        </div>
    );
};

// 3. Audio Podcast Player (Simulated)
export const AudioPodcastPlayer: React.FC<{ content: string }> = ({ content }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    
    const handlePlay = async () => {
        setIsPlaying(!isPlaying);
        // In real app: call TTS API here
        if (!isPlaying) {
             const script = await generateCramAudioScript(content.substring(0, 1000));
             console.log("Playing script:", script);
             alert("Đang phát bản tóm tắt âm thanh (Simulated)...");
        }
    };

    return (
        <button 
            onClick={handlePlay}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isPlaying ? 'bg-purple-600 text-white animate-pulse' : 'bg-purple-900/40 text-purple-300 hover:bg-purple-800/50'
            }`}
        >
            <span className="material-symbols-outlined">{isPlaying ? 'pause' : 'headphones'}</span>
            {isPlaying ? 'Đang phát Podcast...' : 'Nghe thụ động (Podcast)'}
        </button>
    );
};
