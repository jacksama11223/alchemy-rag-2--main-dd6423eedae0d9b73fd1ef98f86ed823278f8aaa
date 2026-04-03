
import React from 'react';
import { AlchemyPersona, AlchemyTemplate } from '../../types';

// 1. Persona Selector
interface PersonaSelectorProps {
    selectedPersona: string;
    onSelect: (id: string) => void;
}

const PERSONAS: AlchemyPersona[] = [
    { id: 'socrates', name: 'Socrates', role: 'Đặt câu hỏi gợi mở', icon: 'psychology' },
    { id: 'feynman', name: 'Feynman', role: 'Giải thích đơn giản', icon: 'child_care' },
    { id: 'doraemon', name: 'Doraemon', role: 'Vui vẻ, sáng tạo', icon: 'smart_toy' },
    { id: 'academic', name: 'Giáo sư', role: 'Hàn lâm, chi tiết', icon: 'school' },
];

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({ selectedPersona, onSelect }) => {
    return (
        <div className="mb-6">
            <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-3 block">Người hướng dẫn (Persona)</label>
            <div className="grid grid-cols-2 gap-2">
                {PERSONAS.map(p => (
                    <button
                        key={p.id}
                        onClick={() => onSelect(p.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                            selectedPersona === p.id 
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/30'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-2xl ${selectedPersona === p.id ? 'text-cyan-300' : 'text-slate-500'}`}>{p.icon}</span>
                        <div>
                            <div className="text-sm font-bold">{p.name}</div>
                            <div className="text-[10px] opacity-70 leading-tight">{p.role}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// 2. Difficulty Slider
interface DifficultySliderProps {
    value: number;
    onChange: (val: number) => void;
}

export const DifficultySlider: React.FC<DifficultySliderProps> = ({ value, onChange }) => {
    return (
        <div className="mb-6">
            <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Độ khó</label>
                <span className={`text-xs font-bold ${value < 30 ? 'text-green-400' : value < 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {value < 30 ? 'Cơ bản' : value < 70 ? 'Trung cấp' : 'Chuyên sâu'}
                </span>
            </div>
            <input 
                type="range" 
                min="0" max="100" 
                value={value} 
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
        </div>
    );
};

// 3. Language Target Selector
interface LanguageTargetSelectorProps {
    targetLang: string;
    onChange: (lang: string) => void;
}

export const LanguageTargetSelector: React.FC<LanguageTargetSelectorProps> = ({ targetLang, onChange }) => {
    return (
        <div className="mb-6">
            <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 block">Ngôn ngữ đích</label>
            <select 
                value={targetLang} 
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2.5 text-sm bg-black/40 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none cursor-pointer"
            >
                <option value="vi">Tiếng Việt (Mặc định)</option>
                <option value="en">English (Anh)</option>
                <option value="jp">Japanese (Nhật)</option>
                <option value="cn">Chinese (Trung)</option>
                <option value="kr">Korean (Hàn)</option>
            </select>
        </div>
    );
};

// 4. Template Market
interface TemplateMarketProps {
    selectedTemplate: string;
    onSelect: (id: string) => void;
}

const TEMPLATES: AlchemyTemplate[] = [
    { id: 'general', name: 'Tổng quát', description: 'Tóm tắt & Flashcards', icon: 'description' },
    { id: 'ielts', name: 'IELTS Vocab', description: 'Từ vựng & Ví dụ', icon: 'language' },
    { id: 'coding', name: 'Coding', description: 'Snippet & Concept', icon: 'code' },
    { id: 'history', name: 'Sự kiện', description: 'Timeline & Nhân vật', icon: 'history_edu' },
];

export const TemplateMarket: React.FC<TemplateMarketProps> = ({ selectedTemplate, onSelect }) => {
    return (
        <div className="mb-6">
            <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 block">Công thức (Template)</label>
            <div className="space-y-2">
                {TEMPLATES.map(t => (
                    <div 
                        key={t.id}
                        onClick={() => onSelect(t.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                            selectedTemplate === t.id 
                            ? 'bg-amber-500/10 border-amber-500/50' 
                            : 'bg-white/5 border-transparent hover:bg-white/10'
                        }`}
                    >
                        <div className={`p-2 rounded-full ${selectedTemplate === t.id ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-300'}`}>
                            <span className="material-symbols-outlined text-lg">{t.icon}</span>
                        </div>
                        <div>
                            <div className={`text-sm font-bold ${selectedTemplate === t.id ? 'text-amber-100' : 'text-slate-300'}`}>{t.name}</div>
                            <div className="text-xs text-slate-500">{t.description}</div>
                        </div>
                        {selectedTemplate === t.id && <span className="material-symbols-outlined text-amber-500 ml-auto">check</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

// 5. Token Cost Estimator
interface TokenCostEstimatorProps {
    sourceCount: number;
    difficulty: number;
}

export const TokenCostEstimator: React.FC<TokenCostEstimatorProps> = ({ sourceCount, difficulty }) => {
    const estimatedCost = (sourceCount * 150) + (difficulty * 2);
    
    return (
        <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400">toll</span>
                <span className="text-xs font-bold text-slate-400">Ước tính AI Cost</span>
            </div>
            <span className="text-sm font-mono font-bold text-purple-300">~{estimatedCost} tokens</span>
        </div>
    );
};
