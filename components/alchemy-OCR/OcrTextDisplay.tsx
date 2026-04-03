import React, { useState, useRef, useEffect } from 'react';
import { GlassSurface } from '../common/BrandAssets';
import { OcrDocument } from '../../services/ocrService';

interface OcrTextDisplayProps {
  document: OcrDocument;
  onHighlightSelected: (text: string) => void;
}

const OcrTextDisplay: React.FC<OcrTextDisplayProps> = ({ document, onHighlightSelected }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0 && contentRef.current?.contains(selection.anchorNode)) {
        setSelectedText(selection.toString().trim());
      } else {
        setSelectedText('');
      }
    };

    window.document.addEventListener('mouseup', handleSelection);
    return () => window.document.removeEventListener('mouseup', handleSelection);
  }, []);

  const handleExtract = () => {
    if (selectedText) {
      onHighlightSelected(selectedText);
      window.getSelection()?.removeAllRanges();
      setSelectedText('');
    }
  };

  return (
    <GlassSurface className="p-6 flex flex-col h-full relative">
      <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
        <span className="material-symbols-outlined text-amber-500">article</span>
        Văn bản đã trích xuất
      </h3>
      
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto pr-2 custom-scrollbar text-slate-700 leading-relaxed whitespace-pre-wrap font-medium"
      >
        {document.extractedText || <span className="text-slate-400 italic">Không có văn bản nào được trích xuất.</span>}
      </div>

      {selectedText && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-slide-up z-50">
          <div className="flex items-center gap-2 max-w-[200px]">
            <span className="material-symbols-outlined text-amber-400 text-sm">format_quote</span>
            <span className="text-sm truncate font-medium">{selectedText}</span>
          </div>
          <div className="w-px h-6 bg-slate-700 mx-2"></div>
          <button 
            onClick={handleExtract}
            className="flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span className="material-symbols-outlined text-base">style</span>
            Tạo Flashcard
          </button>
        </div>
      )}
    </GlassSurface>
  );
};

export default OcrTextDisplay;
