
import React, { useState } from 'react';
import { extractTextFromImage, generateMindmapElementsFromRAG } from '../../services/geminiService';
import { DrawingElement } from '../../types';

interface DrawingAIPanelProps {
    onExportToGraph: () => void;
    onExportToAlchemy: (intent: string) => void;
    getCanvasImage: () => string | null; // Function to get base64 of canvas
    onNavigateToFeature?: (feature: string, params?: any) => void; 
    onAddElements: (elements: DrawingElement[]) => void;
}

export const DrawingAIPanel: React.FC<DrawingAIPanelProps> = ({ onExportToGraph, onExportToAlchemy, getCanvasImage, onNavigateToFeature, onAddElements }) => {
    const [isThinking, setIsThinking] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [showPanel, setShowPanel] = useState(true);
    const [topic, setTopic] = useState('');

    const handleAnalyze = async () => {
        const imageBase64 = getCanvasImage();
        if (!imageBase64) {
            alert("Canvas trống hoặc chưa sẵn sàng.");
            return;
        }

        setIsThinking(true);
        try {
            const text = await extractTextFromImage(imageBase64);
            setAnalysisResult(text || "Không thể phân tích hình ảnh này.");
        } catch (e) {
            console.error(e);
            setAnalysisResult("Lỗi kết nối AI.");
        } finally {
            setIsThinking(false);
        }
    };

    const handleGenerateMindmap = async () => {
        if (!topic.trim()) return;
        setIsThinking(true);
        try {
            const elements = await generateMindmapElementsFromRAG(topic);
            if (elements && elements.length > 0) {
                onAddElements(elements);
                setTopic('');
                setAnalysisResult(`Đã tạo Mindmap cho chủ đề: "${topic}". Bạn có thể tự do chỉnh sửa và di chuyển các nút trên bảng vẽ.`);
            } else {
                alert("Không thể tạo Mindmap. Hệ thống không nhận diện được cấu trúc vẽ từ AI.\nVui lòng kiểm tra F12 Console hoặc thử lại với chủ đề chi tiết hơn.");
            }
        } catch (e) {
            console.error(e);
            alert("Lỗi khi kết nối AI để tạo Mindmap.");
        } finally {
            setIsThinking(false);
        }
    };

    const handleIntegration = (target: string) => {
        if (!onNavigateToFeature) {
             alert("Tính năng đang phát triển.");
             return;
        }
        
        switch(target) {
            case 'tutor':
                onNavigateToFeature('tutor', { context: `Tôi vừa vẽ một sơ đồ. Hãy giúp tôi đánh giá nó.` });
                break;
            case 'community':
                onNavigateToFeature('community');
                break;
            case 'todo':
                onNavigateToFeature('digest'); 
                break;
            case 'drive':
                onNavigateToFeature('drive');
                break;
            case 'media':
                onNavigateToFeature('media');
                break;
        }
    };

    if (!showPanel) {
        return (
            <button 
                onClick={() => setShowPanel(true)}
                className="absolute top-20 right-4 p-3 bg-purple-600 rounded-full shadow-lg text-white hover:bg-purple-500 transition-all z-40"
                title="AI Tools"
            >
                <span className="material-symbols-outlined">auto_awesome</span>
            </button>
        );
    }

    return (
        <div className="absolute top-20 right-4 w-72 bg-[#1e1e1e]/95 backdrop-blur-md border border-purple-500/30 rounded-xl shadow-2xl z-40 flex flex-col overflow-hidden animate-slide-left max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="p-4 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#1e1e1e] z-10">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-400">psychology</span>
                    Ecosystem Portal
                </h3>
                <button onClick={() => setShowPanel(false)} className="text-slate-400 hover:text-white">
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>

            <div className="p-4 space-y-6">
                
                {/* AI Brainstorming Section */}
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Brainstorming (RAG)</p>
                    <div className="space-y-2">
                        <input 
                            type="text" 
                            placeholder="Chủ đề Mindmap..." 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 outline-none"
                        />
                        <button 
                            onClick={handleGenerateMindmap}
                            disabled={isThinking || !topic.trim()}
                            className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 border border-white/10 transition-colors shadow-lg shadow-purple-500/20"
                        >
                            {isThinking ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : <span className="material-symbols-outlined text-sm">psychology</span>}
                            {isThinking ? 'Đang tạo...' : 'Tạo Mindmap AI'}
                        </button>
                    </div>
                </div>

                {/* AI Vision Section */}
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Neural Sketch Recognition (DL)</p>
                    <button 
                        onClick={handleAnalyze}
                        disabled={isThinking}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 border border-white/10 transition-colors"
                    >
                        {isThinking ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : <span className="material-symbols-outlined text-sm">visibility</span>}
                        {isThinking ? 'Đang nhìn...' : 'Phân tích bản vẽ'}
                    </button>
                    {analysisResult && (
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5 max-h-32 overflow-y-auto custom-scrollbar mt-2">
                            <p className="text-xs text-slate-200 whitespace-pre-wrap">{analysisResult}</p>
                        </div>
                    )}
                </div>

                {/* Core Actions */}
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Core Integration</p>
                    <div className="grid grid-cols-2 gap-2">
                         <button 
                            onClick={() => onExportToAlchemy(analysisResult || "Create flashcards from this drawing")}
                            className="p-2 bg-cyan-600/20 border border-cyan-500/30 hover:bg-cyan-600/30 rounded-lg text-xs font-bold text-cyan-300 flex flex-col items-center gap-1 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">science</span>
                            Alchemy
                        </button>
                        <button 
                            onClick={onExportToGraph}
                            className="p-2 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 rounded-lg text-xs font-bold text-purple-300 flex flex-col items-center gap-1 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">hub</span>
                            Graph
                        </button>
                    </div>
                </div>

                {/* Extended Ecosystem */}
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Extended Tools</p>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => handleIntegration('tutor')} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg flex flex-col items-center gap-1 text-[10px] text-slate-300 transition-colors">
                            <span className="material-symbols-outlined text-base text-green-400">school</span> Tutor
                        </button>
                        <button onClick={() => handleIntegration('community')} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg flex flex-col items-center gap-1 text-[10px] text-slate-300 transition-colors">
                            <span className="material-symbols-outlined text-base text-pink-400">public</span> Share
                        </button>
                        <button onClick={() => handleIntegration('todo')} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg flex flex-col items-center gap-1 text-[10px] text-slate-300 transition-colors">
                            <span className="material-symbols-outlined text-base text-amber-400">checklist</span> Todo
                        </button>
                        <button onClick={() => handleIntegration('drive')} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg flex flex-col items-center gap-1 text-[10px] text-slate-300 transition-colors">
                            <span className="material-symbols-outlined text-base text-blue-400">cloud_upload</span> Drive
                        </button>
                        <button onClick={() => handleIntegration('media')} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg flex flex-col items-center gap-1 text-[10px] text-slate-300 transition-colors">
                            <span className="material-symbols-outlined text-base text-indigo-400">edit_note</span> NoteLab
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
