
import React, { useRef, useState } from 'react';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { DriveFile, DriveFileType } from '../../types';

// Configure PDF.js worker
// We use a CDN for the worker to avoid complex Vite configuration issues with pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface UploadfileProps {
    currentFolderId: string | null;
    onUploadComplete: (newFiles: DriveFile[]) => void;
}

export const Uploadfile: React.FC<UploadfileProps> = ({ currentFolderId, onUploadComplete }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    // Helper: Read PDF Content
    const readPdfContent = async (file: File): Promise<string> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";
            
            // Limit to first 20 pages to prevent browser crash on huge books
            const maxPages = Math.min(pdf.numPages, 20);
            
            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += `--- Page ${i} ---\n${pageText}\n\n`;
            }
            
            if (pdf.numPages > 20) {
                fullText += `\n... (Content truncated after 20 pages for performance)`;
            }

            return fullText;
        } catch (error) {
            console.error("PDF Read Error:", error);
            return "Error reading PDF. The file might be password protected or scanned image.";
        }
    };

    const processFile = async (file: File): Promise<DriveFile> => {
        let content = "";
        let type: DriveFileType = 'unknown';

        setStatusText(`Đang đọc: ${file.name}...`);

        // Determine type
        if (file.type === 'application/pdf') type = 'pdf';
        else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            file.name.endsWith('.docx')
        ) {
            type = 'doc';
        }
        else if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) type = 'txt';
        else if (file.type.startsWith('image/')) type = 'image';

        // Extract Content based on type
        try {
            if (type === 'doc') {
                // Read DOCX using mammoth
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                content = result.value || "File Word trống.";
            } else if (type === 'pdf') {
                // Read PDF using pdfjs-dist
                content = await readPdfContent(file);
                if (!content.trim()) content = "PDF không có lớp văn bản (có thể là ảnh scan).";
            } else if (type === 'txt') {
                // Read Text
                content = await file.text();
            } else {
                // Images or others
                content = `[File: ${file.name}]\n(Định dạng này chưa hỗ trợ trích xuất văn bản trực tiếp. Hãy dùng tính năng OCR trong Alchemy để xử lý ảnh.)`;
            }
        } catch (error) {
            console.error("Error reading file:", error);
            content = "Lỗi khi đọc nội dung file. File có thể bị hỏng.";
        }

        // Create DriveFile object
        return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            parentId: currentFolderId,
            name: file.name,
            type: type,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            lastModified: new Date().toISOString().split('T')[0],
            owner: 'Tôi',
            isStarred: false,
            isTrashed: false,
            content: content // STORE REAL EXTRACTED CONTENT HERE
        };
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        setIsProcessing(true);
        const newFiles: DriveFile[] = [];

        try {
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                const processedFile = await processFile(file);
                newFiles.push(processedFile);
            }
            onUploadComplete(newFiles);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Có lỗi xảy ra khi đọc file.");
        } finally {
            setIsProcessing(false);
            setStatusText('');
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset input
            }
        }
    };

    return (
        <>
            <button 
                onClick={handleButtonClick}
                disabled={isProcessing}
                className={`glass-btn-highlight w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-blue-900 font-bold mb-4 bg-white hover:bg-blue-50 transition-all shadow-lg ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
            >
                {isProcessing ? (
                    <span className="material-symbols-outlined text-2xl animate-spin">sync</span>
                ) : (
                    <span className="material-symbols-outlined text-2xl">add</span>
                )}
                <div className="flex flex-col items-start leading-none">
                    <span className="text-sm">{isProcessing ? 'Đang xử lý...' : 'Tải lên Mới'}</span>
                    {statusText && <span className="text-[9px] font-normal text-blue-600/70 truncate max-w-[150px]">{statusText}</span>}
                </div>
            </button>
            <input 
                type="file" 
                multiple 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept=".docx,.txt,.pdf,.md,image/*" 
            />
        </>
    );
};
