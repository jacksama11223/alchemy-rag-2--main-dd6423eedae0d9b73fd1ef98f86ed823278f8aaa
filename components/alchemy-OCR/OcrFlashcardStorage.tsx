import React from 'react';
import { GlassSurface } from '../common/BrandAssets';
import { OcrFlashcard } from '../../services/ocrService';

interface OcrFlashcardStorageProps {
  flashcards: OcrFlashcard[];
  onDeleteFlashcard: (id: string) => void;
}

const OcrFlashcardStorage: React.FC<OcrFlashcardStorageProps> = ({ flashcards, onDeleteFlashcard }) => {
  return (
    <GlassSurface className="p-6 flex flex-col h-full">
      <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500">style</span>
          Kho Flashcard
        </div>
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
          {flashcards.length}
        </span>
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {flashcards.length > 0 ? (
          flashcards.map((card) => (
            <div key={card.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative group">
              <button 
                onClick={() => onDeleteFlashcard(card.id)}
                className="absolute top-2 right-2 p-1 rounded-full bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-all"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
              <div className="mb-2 pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Mặt trước</span>
                <p className="font-bold text-slate-800">{card.front}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Mặt sau</span>
                <p className="text-sm text-slate-600 line-clamp-3">{card.back}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <span className="material-symbols-outlined text-3xl opacity-50">style</span>
            <span className="text-sm">Chưa có flashcard nào</span>
          </div>
        )}
      </div>
    </GlassSurface>
  );
};

export default OcrFlashcardStorage;
