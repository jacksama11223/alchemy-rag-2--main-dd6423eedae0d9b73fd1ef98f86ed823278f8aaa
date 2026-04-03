
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

// Initialize AI Client
const getAI = () => {
    const customKey = localStorage.getItem('custom_gemini_api_key');
    return new GoogleGenAI({ apiKey: customKey || process.env.API_KEY || '' });
};

// ----------------------------------------------------------------------
// 1. AI SCRIPTWRITER: Narrative Generator
// ----------------------------------------------------------------------

export const AIScriptWriter: React.FC = () => {
    const [script, setScript] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const generateScript = async () => {
        setIsGenerating(true);
        try {
            const ai = getAI();
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: "Write a compelling 2-minute presentation script explaining the evolution of Web Development based on a Knowledge Graph path (HTML -> CSS -> JS -> React). Tone: Professional yet engaging.",
                config: {
                    thinkingConfig: { thinkingBudget: 16000 },
                }
            });
            if (response.text) setScript(response.text);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-400">record_voice_over</span> 
                    AI Scriptwriter
                </h4>
                <button 
                    onClick={generateScript}
                    disabled={isGenerating}
                    className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded font-bold transition-colors disabled:opacity-50"
                >
                    {isGenerating ? 'Writing...' : 'Generate Script'}
                </button>
            </div>
            <textarea 
                className="w-full h-40 bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-slate-300 resize-none outline-none leading-relaxed"
                placeholder="Script content will appear here..."
                value={script}
                onChange={(e) => setScript(e.target.value)}
            />
        </div>
    );
};

// ----------------------------------------------------------------------
// 2. TIMELINE KEYFRAME EDITOR
// ----------------------------------------------------------------------

export const TimelineKeyframeEditor: React.FC = () => {
    const frames = [
        { id: 1, time: '00:00', title: 'Intro', type: 'Camera Pan' },
        { id: 2, time: '00:30', title: 'Focus: HTML', type: 'Zoom In' },
        { id: 3, time: '01:15', title: 'Overview', type: 'Orbit' },
    ];

    return (
        <div className="bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden mb-4">
            <div className="p-3 bg-[#0f172a] border-b border-white/10 flex justify-between items-center">
                <h4 className="text-sm font-bold text-white">Timeline Editor</h4>
                <button className="text-xs text-blue-400 hover:text-white">+ Add Keyframe</button>
            </div>
            <div className="p-2 space-y-1">
                {frames.map(f => (
                    <div key={f.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer group">
                        <span className="font-mono text-xs text-slate-500">{f.time}</span>
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-white">{f.title}</p>
                            <p className="text-[10px] text-slate-400">{f.type}</p>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white"><span className="material-symbols-outlined text-sm">edit</span></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 3. LIVE PRESENTATION TOOLS
// ----------------------------------------------------------------------

export const LivePresentationTools: React.FC = () => {
    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#1e1e1e]/90 backdrop-blur border border-white/20 rounded-full px-6 py-3 shadow-2xl flex items-center gap-6 animate-slide-up">
            <button className="flex flex-col items-center gap-1 group text-slate-400 hover:text-red-400">
                <div className="p-3 rounded-full bg-white/5 group-hover:bg-red-500/20 transition-colors">
                    <span className="material-symbols-outlined">highlight_mouse_cursor</span>
                </div>
                <span className="text-[9px] font-bold uppercase">Laser</span>
            </button>
            
            <button className="flex flex-col items-center gap-1 group text-slate-400 hover:text-yellow-400">
                <div className="p-3 rounded-full bg-white/5 group-hover:bg-yellow-500/20 transition-colors">
                    <span className="material-symbols-outlined">light_mode</span>
                </div>
                <span className="text-[9px] font-bold uppercase">Spotlight</span>
            </button>

            <button className="flex flex-col items-center gap-1 group text-slate-400 hover:text-blue-400">
                <div className="p-3 rounded-full bg-white/5 group-hover:bg-blue-500/20 transition-colors">
                    <span className="material-symbols-outlined">edit</span>
                </div>
                <span className="text-[9px] font-bold uppercase">Draw</span>
            </button>

            <div className="w-px h-8 bg-white/10"></div>

            <button className="flex flex-col items-center gap-1 group text-white">
                <div className="p-4 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg hover:scale-110 transform">
                    <span className="material-symbols-outlined text-xl">play_arrow</span>
                </div>
            </button>
        </div>
    );
};

// ----------------------------------------------------------------------
// MAIN STORYTELLING ENGINE
// ----------------------------------------------------------------------

export const StorytellingEngine: React.FC = () => {
    const [mode, setMode] = useState<'edit' | 'play'>('edit');

    return (
        <div className="w-full max-w-5xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-white">Storytelling Engine</h2>
                <div className="flex bg-black/30 p-1 rounded-lg">
                    <button 
                        onClick={() => setMode('edit')}
                        className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${mode === 'edit' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
                    >
                        Editor
                    </button>
                    <button 
                        onClick={() => setMode('play')}
                        className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${mode === 'play' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
                    >
                        Preview
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <TimelineKeyframeEditor />
                    <AIScriptWriter />
                </div>
                <div className="lg:col-span-2 bg-black rounded-2xl border border-white/10 relative overflow-hidden aspect-video flex items-center justify-center">
                    <p className="text-slate-500">3D Viewport Preview</p>
                    {mode === 'play' && <LivePresentationTools />}
                </div>
            </div>
        </div>
    );
};
