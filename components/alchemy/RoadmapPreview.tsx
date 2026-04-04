import React from 'react';
import { motion } from 'framer-motion';

interface RoadmapStage {
    id: string;
    title: string;
    summary: string;
    concepts: string[];
    flashcardCount?: number;
}

interface RoadmapPreviewProps {
    title: string;
    stages: RoadmapStage[];
    isGenerating: boolean;
    onCommit: () => void;
    onCancel: () => void;
}

export const RoadmapPreview: React.FC<RoadmapPreviewProps> = ({ 
    title, stages, isGenerating, onCommit, onCancel 
}) => {
    return (
        <div className="flex flex-col h-full bg-white/40 backdrop-blur-md rounded-3xl border border-white p-6 shadow-xl">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sky-500">map</span>
                        {title || "Đang thiết kế lộ trình..."}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium italic">
                        Kiến trúc học tập hệ thống dựa trên kho dữ liệu của bạn.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-white transition-all"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={onCommit}
                        disabled={isGenerating || stages.length === 0}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-sky-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                        Lưu vào Sơ đồ tri thức
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
                {stages.map((stage, index) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={stage.id}
                        className="relative pl-12 pb-2"
                    >
                        {/* Connecting Line */}
                        {index < stages.length - 1 && (
                            <div className="absolute left-5 top-10 bottom-0 w-1 bg-gradient-to-b from-sky-400 to-blue-100 rounded-full" />
                        )}

                        {/* Stage Number Circle */}
                        <div className="absolute left-0 top-0 size-10 rounded-full bg-white border-4 border-sky-100 flex items-center justify-center shadow-sm z-10">
                            <span className="text-sky-600 font-black text-lg">{index + 1}</span>
                        </div>

                        <div className="bg-white/80 rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">{stage.title}</h3>
                            <p className="text-sm text-slate-600 mb-4 leading-relaxed">{stage.summary}</p>
                            
                            <div className="flex flex-wrap gap-2">
                                {stage.concepts.map(concept => (
                                    <span key={concept} className="px-2 py-1 rounded-lg bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-wider">
                                        {concept}
                                    </span>
                                ))}
                                {stage.flashcardCount && (
                                    <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                        <span className="material-symbols-outlined text-[14px]">style</span>
                                        {stage.flashcardCount} cards
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {isGenerating && (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <div className="relative size-16">
                            <div className="absolute inset-0 border-4 border-sky-100 rounded-full" />
                            <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="text-sm font-bold text-sky-600 animate-pulse">Lò luyện đang chế tạo các thẻ tri thức...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
