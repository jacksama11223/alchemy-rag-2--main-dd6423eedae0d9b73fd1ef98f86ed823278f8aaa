import React, { useState, useRef } from 'react';
import { GlassSurface } from '../common/BrandAssets';
import { processImageWithVision, fileToBase64 } from './OcrHelper';

interface OcrImageProcessorProps {
  onProcessingComplete: (text: string, imageUrl: string) => void;
}

const OcrImageProcessor: React.FC<OcrImageProcessorProps> = ({ onProcessingComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setProgress(0);
      setStatus('Đang khởi tạo...');
      
      const imageUrl = await fileToBase64(file);
      
      const text = await processImageWithVision(imageUrl, (statusText, p) => {
        setStatus(statusText);
        setProgress(p);
      });
      
      onProcessingComplete(text, imageUrl);
    } catch (error) {
      console.error('OCR Processing failed:', error);
      alert('Lỗi xử lý ảnh. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setStatus('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const translateStatus = (status: string) => {
    return status;
  };

  return (
    <GlassSurface className="p-6 flex flex-col items-center justify-center border-dashed border-2 border-slate-200 min-h-[200px] rounded-2xl">
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      {isProcessing ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-amber-600 text-3xl animate-spin">document_scanner</span>
          </div>
          <div className="text-center w-full">
            <h3 className="font-medium text-slate-700 mb-1">{translateStatus(status)}</h3>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-amber-500 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-xs text-slate-500 mt-1 inline-block">{progress}%</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-slate-400 text-3xl">add_photo_alternate</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Tải ảnh lên để quét</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Sử dụng AI Thị giác (Vision LLM) để nhận diện chữ viết, bảng biểu và tiêu đề định dạng Markdown cực chuẩn.
            </p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">upload</span>
            Chọn ảnh
          </button>
        </div>
      )}
    </GlassSurface>
  );
};

export default OcrImageProcessor;
