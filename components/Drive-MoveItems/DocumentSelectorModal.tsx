import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IncomingAsset } from '../../utils/dataProcessor';

interface DocumentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: IncomingAsset | null;
  onAttach: (asset: IncomingAsset, documentId: string, documentType: string) => void;
}

export const DocumentSelectorModal: React.FC<DocumentSelectorModalProps> = ({
  isOpen,
  onClose,
  asset,
  onAttach
}) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // Fetch notes and other documents
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.map((note: any) => ({ ...note, docType: 'note' })));
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !asset) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">attach_file</span>
              Đính kèm tài liệu
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-4 bg-blue-50/50 border-b border-blue-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined">description</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{asset.title}</p>
              <p className="text-xs text-slate-500">Chọn tài liệu đích để đính kèm file này</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">folder_open</span>
                <p>Không có tài liệu nào để đính kèm.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {documents.map((doc) => (
                  <button
                    key={doc._id}
                    onClick={() => onAttach(asset, doc._id, doc.docType)}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
                      <span className="material-symbols-outlined">
                        {doc.docType === 'note' ? 'edit_note' : 'article'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors">{doc.title || 'Untitled'}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Cập nhật: {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-500 transition-colors">
                      chevron_right
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
