import React, { useState } from 'react';
import { OcrDocument, OcrFlashcard, OcrHighlight } from '../../services/ocrService';
import OcrTextDisplay from './OcrTextDisplay';
import OcrFlashcardCreator from './OcrFlashcardCreator';
import OcrFlashcardStorage from './OcrFlashcardStorage';
import OcrImageHighlighter from './OcrImageHighlighter';

interface OcrSplitViewProps {
  document: OcrDocument;
  onUpdateDocument: (id: string, updates: Partial<OcrDocument>) => void;
}

const OcrSplitView: React.FC<OcrSplitViewProps> = ({ document, onUpdateDocument }) => {
  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');

  const handleHighlightSelected = (text: string) => {
    setHighlightedText(text);
  };

  const handleSaveFlashcard = (flashcard: OcrFlashcard) => {
    const newFlashcards = [...(document.flashcards || []), flashcard];
    onUpdateDocument(document._id, { flashcards: newFlashcards });
    setHighlightedText(null);
  };

  const handleDeleteFlashcard = (id: string) => {
    const newFlashcards = (document.flashcards || []).filter(fc => fc.id !== id);
    onUpdateDocument(document._id, { flashcards: newFlashcards });
  };

  const handleAddHighlight = (highlight: OcrHighlight) => {
    const newHighlights = [...(document.highlights || []), highlight];
    onUpdateDocument(document._id, { highlights: newHighlights });
  };

  const handleRemoveHighlight = (id: string) => {
    const newHighlights = (document.highlights || []).filter(h => h.id !== id);
    onUpdateDocument(document._id, { highlights: newHighlights });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left Side: Text or Image View */}
      <div className="flex flex-col gap-4 h-[600px]">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'text' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Văn bản
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'image' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Ảnh gốc
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'text' ? (
            <OcrTextDisplay 
              document={document} 
              onHighlightSelected={handleHighlightSelected} 
            />
          ) : (
            <OcrImageHighlighter 
              imageUrl={document.imageUrl}
              highlights={document.highlights || []}
              onAddHighlight={handleAddHighlight}
              onRemoveHighlight={handleRemoveHighlight}
            />
          )}
        </div>
      </div>

      {/* Right Side: Flashcards */}
      <div className="flex flex-col gap-6 h-[600px]">
        {highlightedText ? (
          <div className="flex-1">
            <OcrFlashcardCreator 
              highlightedText={highlightedText}
              onSave={handleSaveFlashcard}
              onCancel={() => setHighlightedText(null)}
            />
          </div>
        ) : (
          <div className="flex-1">
            <OcrFlashcardStorage 
              flashcards={document.flashcards || []}
              onDeleteFlashcard={handleDeleteFlashcard}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OcrSplitView;
