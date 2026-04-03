import React, { useState, useEffect } from 'react';
import { GlassSurface } from '../common/BrandAssets';
import { OcrDocument, getOcrDocuments, createOcrDocument, updateOcrDocument, deleteOcrDocument } from '../../services/ocrService';
import OcrImageList from './OcrImageList';
import OcrImageProcessor from './OcrImageProcessor';
import OcrSplitView from './OcrSplitView';

interface OcrCoordinatorProps {
  onAddSource?: (source: any) => void;
}

const OcrCoordinator: React.FC<OcrCoordinatorProps> = ({ onAddSource }) => {
  const [documents, setDocuments] = useState<OcrDocument[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await getOcrDocuments();
      setDocuments(docs || []);
      if (docs && docs.length > 0 && !selectedId) {
        setSelectedId(docs[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch OCR documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessingComplete = async (text: string, imageUrl: string) => {
    setIsUploading(true);
    try {
      const newDoc = await createOcrDocument('Tài liệu quét mới', imageUrl, text);
      if (newDoc) {
        setDocuments([newDoc, ...documents]);
        setSelectedId(newDoc._id);
      }
    } catch (error) {
      console.error('Failed to save OCR document:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateDocument = async (id: string, updates: Partial<OcrDocument>) => {
    // Optimistic update
    setDocuments(docs => docs.map(doc => doc._id === id ? { ...doc, ...updates } : doc));
    
    try {
      await updateOcrDocument(id, updates);
    } catch (error) {
      console.error('Failed to update OCR document:', error);
      // Revert on failure
      fetchDocuments();
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    
    // Optimistic update
    setDocuments(docs => docs.filter(doc => doc._id !== id));
    if (selectedId === id) {
      setSelectedId(documents.length > 1 ? documents.find(d => d._id !== id)?._id || null : null);
    }
    
    try {
      await deleteOcrDocument(id);
    } catch (error) {
      console.error('Failed to delete OCR document:', error);
      // Revert on failure
      fetchDocuments();
    }
  };

  const selectedDoc = documents.find(d => d._id === selectedId);

  const handleAddToAlchemy = () => {
    if (onAddSource && selectedDoc) {
      onAddSource({
        id: Date.now().toString(),
        type: 'image',
        content: selectedDoc.extractedText,
        metadata: { fileName: selectedDoc.title, confidence: 0.95 }
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="text-center mb-4 relative">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-4 shadow-inner">
          <span className="material-symbols-outlined text-3xl">document_scanner</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Quét Ảnh (OCR)</h3>
        <p className="text-slate-600 max-w-lg mx-auto">
          Tải ảnh lên để tự động trích xuất văn bản, highlight trực tiếp trên ảnh và tạo flashcard học tập.
        </p>
        
        {selectedDoc && onAddSource && (
          <button 
            onClick={handleAddToAlchemy}
            className="absolute top-0 right-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Đưa vào Lò Luyện
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Image List & Uploader */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <OcrImageProcessor onProcessingComplete={handleProcessingComplete} />
          
          <div className="flex-1 min-h-[400px]">
            {isLoading ? (
              <GlassSurface className="p-6 flex items-center justify-center h-full">
                <span className="material-symbols-outlined animate-spin text-amber-500 text-3xl">sync</span>
              </GlassSurface>
            ) : (
              <OcrImageList 
                documents={documents}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onDelete={handleDeleteDocument}
              />
            )}
          </div>
        </div>

        {/* Right Column: Split View (Text/Image & Flashcards) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {selectedDoc ? (
            <OcrSplitView 
              document={selectedDoc} 
              onUpdateDocument={handleUpdateDocument} 
            />
          ) : (
            <GlassSurface className="p-12 flex flex-col items-center justify-center h-[600px] text-center border-dashed border-2 border-slate-200">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-slate-300">swipe_left</span>
              </div>
              <h4 className="text-lg font-medium text-slate-700 mb-2">Chưa chọn ảnh nào</h4>
              <p className="text-slate-500 text-sm max-w-sm">
                Hãy tải ảnh lên hoặc chọn một ảnh từ danh sách bên trái để xem nội dung, highlight và tạo flashcard.
              </p>
            </GlassSurface>
          )}
        </div>
      </div>
    </div>
  );
};

export default OcrCoordinator;
