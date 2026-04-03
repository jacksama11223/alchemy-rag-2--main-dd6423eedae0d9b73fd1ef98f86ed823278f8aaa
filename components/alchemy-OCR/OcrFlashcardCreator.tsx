import React, { useState, useEffect } from 'react';
import { GlassSurface } from '../common/BrandAssets';
import { OcrFlashcard } from '../../services/ocrService';

interface OcrFlashcardCreatorProps {
  highlightedText: string;
  onSave: (flashcard: OcrFlashcard) => void;
  onCancel: () => void;
}

const OcrFlashcardCreator: React.FC<OcrFlashcardCreatorProps> = ({ highlightedText, onSave, onCancel }) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState(highlightedText);

  useEffect(() => {
    setBack(highlightedText);
  }, [highlightedText]);

  const handleSave = () => {
    if (!front.trim() || !back.trim()) return;
    
    onSave({
      id: Date.now().toString(),
      front,
      back,
      highlightId: ''
    });
    setFront('');
    setBack('');
  };

  return (
    <GlassSurface className="p-6 flex flex-col gap-4 animate-fade-in border-2 border-amber-200 shadow-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500">style</span>
          Tạo Flashcard Mới
        </h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Mặt trước (Câu hỏi / Khái niệm)
        </label>
        <input 
          type="text"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="Nhập câu hỏi hoặc từ khóa..."
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-800"
          autoFocus
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Mặt sau (Định nghĩa / Giải thích)
        </label>
        <textarea 
          value={back}
          onChange={(e) => setBack(e.target.value)}
          className="w-full px-4 py-3 bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-700 min-h-[100px] resize-none"
        />
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">info</span>
          Nội dung này được lấy từ phần bạn đã highlight.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button 
          onClick={onCancel}
          className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
        >
          Hủy
        </button>
        <button 
          onClick={handleSave}
          disabled={!front.trim() || !back.trim()}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">save</span> Lưu Flashcard
        </button>
      </div>
    </GlassSurface>
  );
};

export default OcrFlashcardCreator;
