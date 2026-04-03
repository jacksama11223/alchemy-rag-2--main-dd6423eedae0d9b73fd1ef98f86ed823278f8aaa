import React, { useState, useEffect } from 'react';
import { GlassSurface } from '../common/BrandAssets';
import { getAuthHeader } from '../../services/mockBackend';
import TextSelector from './TextSelector';
import TextHighlighterFlashcard from './TextHighlighterFlashcard';
import TextCreator from './TextCreator';

interface CopyPasteIntegrationProps {
    onAddSource: (source: any) => void;
}

const CopyPasteIntegration: React.FC<CopyPasteIntegrationProps> = ({ onAddSource }) => {
    const [selectedText, setSelectedText] = useState<any | null>(null);
    const [texts, setTexts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const fetchTexts = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/pasted-texts', {
                    headers: getAuthHeader()
                });
                if (response.ok) {
                    const data = await response.json();
                    setTexts(data);
                } else {
                    setTexts([]);
                }
            } catch (error) {
                console.error("Error fetching pasted texts:", error);
                setTexts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTexts();
    }, []);

    const handleSelectText = (text: any) => {
        setSelectedText(text);
        setIsCreating(false);
    };

    const handleCreateNewText = () => {
        setSelectedText(null);
        setIsCreating(true);
    };

    const handleTextCreated = (newText: any) => {
        setTexts([newText, ...texts]);
        setSelectedText(newText);
        setIsCreating(false);
    };

    const handleCancelCreate = () => {
        setIsCreating(false);
    };

    const handleImportToAlchemy = () => {
        if (selectedText) {
            onAddSource({
                id: `pasted-${Date.now()}`,
                type: 'text',
                content: selectedText.content,
                metadata: {
                    title: selectedText.title,
                    source: 'CopyPaste'
                }
            });
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-inner">
                    <span className="material-symbols-outlined text-3xl">content_paste</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Dán Văn Bản</h3>
                <p className="text-slate-600 max-w-lg mx-auto">
                    Dán nội dung văn bản bất kỳ để lưu trữ, tạo flashcard tự động hoặc đưa vào Lò Luyện AI để phân tích.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Text Selector */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <button 
                        onClick={handleCreateNewText}
                        className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm border ${
                            isCreating 
                                ? 'bg-emerald-500 text-white border-emerald-600' 
                                : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        }`}
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Thêm Văn Bản Mới
                    </button>
                    
                    <TextSelector 
                        texts={texts} 
                        isLoading={isLoading} 
                        selectedTextId={selectedText?.id || selectedText?._id} 
                        onSelectText={handleSelectText} 
                    />
                </div>

                {/* Right Column: Text Viewer & Highlighter or Creator */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {isCreating ? (
                        <TextCreator 
                            onTextCreated={handleTextCreated} 
                            onCancel={handleCancelCreate} 
                        />
                    ) : selectedText ? (
                        <>
                            <GlassSurface className="p-6 flex flex-col h-[500px]">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                                    <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-emerald-500">article</span>
                                        {selectedText.title}
                                    </h4>
                                    <button 
                                        onClick={handleImportToAlchemy}
                                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">input</span>
                                        Đưa vào Lò Luyện
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <TextHighlighterFlashcard textObj={selectedText} />
                                </div>
                            </GlassSurface>
                        </>
                    ) : (
                        <GlassSurface className="p-12 flex flex-col items-center justify-center h-[500px] text-center border-dashed border-2 border-slate-200">
                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-4xl text-slate-300">swipe_left</span>
                            </div>
                            <h4 className="text-lg font-medium text-slate-700 mb-2">Chưa chọn văn bản nào</h4>
                            <p className="text-slate-500 text-sm max-w-sm">
                                Hãy chọn một văn bản từ danh sách bên trái hoặc thêm mới để xem nội dung, highlight và tạo flashcard.
                            </p>
                        </GlassSurface>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CopyPasteIntegration;
