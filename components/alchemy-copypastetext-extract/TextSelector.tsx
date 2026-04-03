import React from 'react';
import { GlassSurface } from '../common/BrandAssets';

interface TextSelectorProps {
    texts: any[];
    isLoading: boolean;
    selectedTextId: string | null;
    onSelectText: (text: any) => void;
}

const TextSelector: React.FC<TextSelectorProps> = ({ texts, isLoading, selectedTextId, onSelectText }) => {
    return (
        <GlassSurface className="p-4 h-[400px] flex flex-col">
            <h4 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Danh sách Văn bản</span>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                    {texts.length}
                </span>
            </h4>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                        <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                        <span className="text-sm">Đang tải...</span>
                    </div>
                ) : texts.length > 0 ? (
                    texts.map((text) => (
                        <button
                            key={text.id || text._id}
                            onClick={() => onSelectText(text)}
                            className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 border ${
                                (selectedTextId === text._id || selectedTextId === text.id)
                                    ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                            }`}
                        >
                            <div className={`p-2 rounded-lg shrink-0 ${
                                (selectedTextId === text._id || selectedTextId === text.id) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                                <span className="material-symbols-outlined text-sm">article</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h5 className={`font-medium text-sm truncate ${
                                    (selectedTextId === text._id || selectedTextId === text.id) ? 'text-emerald-900' : 'text-slate-700'
                                }`}>
                                    {text.title || 'Không có tiêu đề'}
                                </h5>
                                <p className="text-xs text-slate-400 mt-1 truncate">
                                    {text.content ? text.content.substring(0, 30) + '...' : 'Văn bản trống'}
                                </p>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                        <span className="material-symbols-outlined text-3xl opacity-50">content_paste_off</span>
                        <span className="text-sm">Chưa có văn bản nào</span>
                    </div>
                )}
            </div>
        </GlassSurface>
    );
};

export default TextSelector;
