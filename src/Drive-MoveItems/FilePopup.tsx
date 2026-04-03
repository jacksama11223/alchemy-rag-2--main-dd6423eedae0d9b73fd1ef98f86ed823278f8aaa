import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  fileData: any;
}

export const FilePopup: React.FC<FilePopupProps> = ({ isOpen, onClose, fileData }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full"
          >
            <h2 className="text-xl font-bold mb-4">{fileData.title}</h2>
            <p className="text-slate-600 mb-4">{fileData.extractedText}</p>
            <button
              onClick={onClose}
              className="w-full py-2 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600"
            >
              Đóng
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
