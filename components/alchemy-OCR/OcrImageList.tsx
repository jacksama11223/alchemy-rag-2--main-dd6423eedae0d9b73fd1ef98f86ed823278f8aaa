import React from 'react';
import { GlassSurface } from '../common/BrandAssets';
import { OcrDocument } from '../../services/ocrService';

interface OcrImageListProps {
  documents: OcrDocument[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const OcrImageList: React.FC<OcrImageListProps> = ({ documents, selectedId, onSelect, onDelete }) => {
  return (
    <GlassSurface className="p-4 h-full flex flex-col">
      <h4 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
        <span>Danh sách Ảnh quét</span>
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
          {documents.length}
        </span>
      </h4>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div
              key={doc._id}
              onClick={() => onSelect(doc._id)}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 border cursor-pointer group ${
                selectedId === doc._id
                  ? 'bg-amber-50 border-amber-200 shadow-sm'
                  : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg shrink-0 overflow-hidden bg-slate-100 flex items-center justify-center ${
                selectedId === doc._id ? 'ring-2 ring-amber-400' : ''
              }`}>
                {doc.imageUrl ? (
                  <img src={doc.imageUrl} alt={doc.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-slate-400">image</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className={`font-medium text-sm truncate ${
                  selectedId === doc._id ? 'text-amber-900' : 'text-slate-700'
                }`}>
                  {doc.title || 'Không có tiêu đề'}
                </h5>
                <p className="text-xs text-slate-400 mt-1 truncate">
                  {doc.extractedText ? doc.extractedText.substring(0, 30) + '...' : 'Đang xử lý...'}
                </p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doc._id);
                }}
                className="p-1.5 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-all"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <span className="material-symbols-outlined text-3xl opacity-50">document_scanner</span>
            <span className="text-sm">Chưa có ảnh nào</span>
          </div>
        )}
      </div>
    </GlassSurface>
  );
};

export default OcrImageList;
