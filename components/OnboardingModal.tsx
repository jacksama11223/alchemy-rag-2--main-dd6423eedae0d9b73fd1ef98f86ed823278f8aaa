import React, { useState } from 'react';
import { updateUserPersona } from '../services/mockBackend';
import { UserAccount } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (persona: string) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const personas = [
    { id: 'student', label: 'Học sinh', icon: 'school', desc: 'Tập trung vào bài giảng, ôn thi và ghi nhớ nhanh.' },
    { id: 'university', label: 'Sinh viên', icon: 'local_library', desc: 'Nghiên cứu chuyên sâu, quản lý dự án và tài liệu.' },
    { id: 'professional', label: 'Người đi làm', icon: 'work', desc: 'Tối ưu hóa công việc, ghi chú cuộc họp và kỹ năng mới.' }
  ];

  const handleComplete = async () => {
    if (!selectedPersona) return;
    setIsLoading(true);
    try {
      await updateUserPersona(selectedPersona);
      onComplete(selectedPersona);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-10 animate-[fadeIn_0.3s_ease-out]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 mb-3">Bạn là ai?</h2>
          <p className="text-slate-500">Hãy cho chúng tôi biết để tối ưu hóa trải nghiệm và cung cấp các mẫu (templates) phù hợp nhất với bạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {personas.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPersona(p.id)}
              className={`flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all ${
                selectedPersona === p.id 
                  ? 'border-blue-500 bg-blue-50 shadow-md scale-105' 
                  : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                selectedPersona === p.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <span className="material-symbols-outlined text-3xl">{p.icon}</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{p.label}</h3>
              <p className="text-xs text-slate-500">{p.desc}</p>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleComplete}
            disabled={!selectedPersona || isLoading}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            {isLoading ? 'Đang thiết lập...' : 'Bắt đầu hành trình'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
