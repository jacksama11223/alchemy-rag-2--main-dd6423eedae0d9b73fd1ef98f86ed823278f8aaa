import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: string | null;
  onSuccess: (newFile: any) => void;
}

type TemplateType = 'book' | 'quiz' | 'research';

export const AuthoringModal: React.FC<AuthoringModalProps> = ({ isOpen, onClose, parentId, onSuccess }) => {
  const [template, setTemplate] = useState<TemplateType>('book');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templates = [
    { id: 'book', label: 'Sách chuyên đề', icon: 'book', color: 'text-blue-400', desc: 'Viết nội dung có cấu trúc chương hồi chuyên sâu.' },
    { id: 'quiz', label: 'Bộ câu hỏi ôn tập', icon: 'quiz', color: 'text-amber-400', desc: 'Tạo danh sách câu hỏi trắc nghiệm & tự luận kèm đáp án.' },
    { id: 'research', label: 'Báo cáo nghiên cứu', icon: 'analytics', color: 'text-purple-400', desc: 'Viết báo cáo phân tích chi tiết về một chủ đề.' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      const sessionStr = window.localStorage.getItem('learnai_session');
      let token = '';
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        token = session.token || '';
      }

      const res = await fetch('/api/drive-authoring/generate-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-gemini-api-key': window.localStorage.getItem('custom_gemini_api_key') || ''
        },
        body: JSON.stringify({
          templateType: template,
          userPrompt: prompt,
          parentId
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Lỗi khi tạo tài liệu');
      }

      const newFile = await res.json();
      onSuccess(newFile);
      onClose();
      setPrompt('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white/10 backdrop-blur-2xl border border-white/20 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <span className="material-symbols-outlined text-blue-400">auto_awesome</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Authoring Lab</h3>
                <p className="text-xs text-white/60">Sử dụng tri thức RAG để soạn thảo tài liệu chuyên sâu</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/60 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
            {/* Step 1: Template Selection */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-white/80 uppercase tracking-widest">Bước 1: Chọn mẫu tài liệu</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id as TemplateType)}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center text-center gap-3 group ${
                      template === t.id 
                      ? 'bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-3xl ${t.color} group-hover:scale-110 transition-transform`}>{t.icon}</span>
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-white">{t.label}</div>
                      <div className="text-[10px] text-white/50 leading-tight">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Prompt Input */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-white/80 uppercase tracking-widest">Bước 2: Bạn muốn tài liệu này viết về gì?</label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ví dụ: Lịch sử hình thành vũ trụ, Các bài tập toán logic lớp 12, Báo cáo về thị trường chứng khoán năm 2024..."
                  className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white text-sm min-h-[120px] focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-white/30">AI sẽ tự động truy vấn dữ liệu nghiên cứu liên quan</div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2 animate-shake">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 bg-white/5 flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all text-sm"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`flex-[2] py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 relative overflow-hidden group ${
                (isGenerating || !prompt.trim()) ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isGenerating ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  <span>Đang soạn thảo văn bản...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined group-hover:animate-pulse">bolt</span>
                  <span>Bắt đầu tạo bằng AI</span>
                </>
              )}
              
              {/* Magic line animation */}
              {isGenerating && (
                <motion.div 
                  className="absolute bottom-0 left-0 h-1 bg-yellow-400"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 30, ease: "linear" }}
                />
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
