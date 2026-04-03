import React, { useState } from 'react';
import { AlchemyStorageItem } from '../../types';

interface AITextProcessorProps {
    selectedItems: AlchemyStorageItem[];
    onProcessText: (text: string, method: string) => void;
}

export const AITextProcessor: React.FC<AITextProcessorProps> = ({ selectedItems, onProcessText }) => {
    const [selectedMethod, setSelectedMethod] = useState<string>('Flashcard');
    
    const methods = [
        { id: 'Flashcard', label: 'Tạo Flashcard', icon: 'style', color: 'bg-amber-100 text-amber-600' },
        { id: 'Quiz', label: 'Tạo Quiz', icon: 'quiz', color: 'bg-purple-100 text-purple-600' },
        { id: 'Summary', label: 'Tóm tắt', icon: 'summarize', color: 'bg-emerald-100 text-emerald-600' },
        { id: 'Ontology', label: 'Phân tích Ontology', icon: 'account_tree', color: 'bg-blue-100 text-blue-600' }
    ];

    const handleProcess = () => {
        if (selectedItems.length === 0) {
            alert("Vui lòng chọn ít nhất một mục để xử lý.");
            return;
        }
        const combinedText = selectedItems.map(item => `[Nguồn: ${item.sourceType}]\nTiêu đề: ${item.title}\nNội dung:\n${item.extractedText}`).join('\n\n---\n\n');
        onProcessText(combinedText, selectedMethod);
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md">
                    <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Lò Luyện AI</h3>
                    <p className="text-sm text-slate-500">Xử lý {selectedItems.length} mục đã chọn</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {methods.map(method => (
                    <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                            selectedMethod === method.id 
                            ? 'border-sky-500 bg-sky-50 shadow-sm ring-1 ring-sky-500/50' 
                            : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${method.color}`}>
                            <span className="material-symbols-outlined text-[16px]">{method.icon}</span>
                        </div>
                        <span className={`text-sm font-bold ${selectedMethod === method.id ? 'text-sky-700' : 'text-slate-700'}`}>
                            {method.label}
                        </span>
                    </button>
                ))}
            </div>

            <button 
                onClick={handleProcess}
                disabled={selectedItems.length === 0}
                className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                    selectedItems.length > 0 
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 hover:shadow-xl hover:-translate-y-0.5' 
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
            >
                <span className="material-symbols-outlined animate-pulse">science</span>
                Bắt đầu xử lý
            </button>
        </div>
    );
};
