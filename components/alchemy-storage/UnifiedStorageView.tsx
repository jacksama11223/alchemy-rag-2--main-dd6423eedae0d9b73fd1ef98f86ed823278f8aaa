import React from 'react';
import { AlchemyStorageItem } from '../../types';

interface UnifiedStorageViewProps {
    items: AlchemyStorageItem[];
}

export const UnifiedStorageView: React.FC<UnifiedStorageViewProps> = ({ items }) => {
    const unifiedText = items.map(item => `--- ${item.title} (${item.sourceType}) ---\n${item.extractedText}`).join('\n\n');

    return (
        <div className="h-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Tổng hợp dữ liệu văn bản</h3>
            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                {unifiedText}
            </pre>
        </div>
    );
};
