
import React from 'react';
import { AlchemyIntent } from '../../types';

interface DeepReadProps {
    fileContent: string;
    fileName: string;
    onNavigateToAlchemy: (intent: AlchemyIntent) => void;
}

export const DeepRead: React.FC<DeepReadProps> = ({ fileContent, fileName, onNavigateToAlchemy }) => {
    
    const handleDeepRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        // Safety check: Ensure content is present
        if (!fileContent || fileContent.trim().length === 0 || fileContent.includes('(Mocked)')) {
             // Try to be helpful if content is missing
             const contentToSend = fileContent || `[Yêu cầu đọc file: ${fileName}]\n\n(Lưu ý: File này chưa có nội dung văn bản được trích xuất. Vui lòng thử tải lại file hoặc copy-paste nội dung vào đây)`;
             
             onNavigateToAlchemy({
                type: 'create',
                initialQuery: contentToSend,
                label: `DEEP_READ_REQUEST:${fileName}`
            });
            return;
        }

        onNavigateToAlchemy({
            type: 'create', 
            initialQuery: fileContent,
            label: `DEEP_READ_REQUEST:${fileName}` // Encode intent in label
        });
    };

    return (
        <button 
            onClick={handleDeepRead}
            className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg transition-all shadow-md hover:shadow-purple-500/30 flex items-center gap-2 group cursor-pointer"
            title="Đọc sâu & Tóm tắt AI (Deep Read)"
        >
            <span className="material-symbols-outlined text-lg group-hover:animate-pulse">neurology</span>
            <span className="text-xs font-bold hidden sm:inline">Deep Read</span>
        </button>
    );
};
