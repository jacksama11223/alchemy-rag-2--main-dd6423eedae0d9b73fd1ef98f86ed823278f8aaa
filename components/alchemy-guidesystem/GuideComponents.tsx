import React, { useState } from 'react';
import { GuideInfo } from './GuideData';

export const GuideTriggerIcon: React.FC<{ onClick: (e: React.MouseEvent) => void }> = ({ onClick }) => {
    return (
        <div 
            onClick={onClick}
            role="button"
            tabIndex={0}
            className="ml-2 flex items-center justify-center w-5 h-5 rounded-full bg-sky-100 border border-sky-300 text-sky-600 hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all group/guide relative shrink-0 cursor-pointer"
            title="Hướng dẫn sử dụng"
            onKeyDown={(e) => e.key === 'Enter' && onClick(e as any)}
        >
            <span className="material-symbols-outlined text-[13px] animate-pulse drop-shadow-[0_0_3px_rgba(56,189,248,0.8)]">help</span>
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/guide:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                Mẹo dùng
            </span>
        </div>
    );
};

export const GuidePopupModal: React.FC<{ guide: GuideInfo | null, onClose: () => void }> = ({ guide, onClose }) => {
    const [openSection, setOpenSection] = useState<number>(0);

    if (!guide) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s]">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-[slideUp_0.3s]">
                {/* Header */}
                <div className="bg-gradient-to-r from-sky-500 to-indigo-600 p-6 text-white relative shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-3xl bg-white/20 p-2 rounded-xl">school</span>
                        <h2 className="text-2xl font-bold">{guide.title}</h2>
                    </div>
                    <p className="text-sky-100 font-medium">{guide.description}</p>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                    {/* Pain Point Section */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-4 items-start">
                        <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
                            <span className="material-symbols-outlined">sentiment_dissatisfied</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-1">Vấn đề của bạn?</h4>
                            <p className="text-amber-900 italic">"{guide.painPoint}"</p>
                        </div>
                    </div>

                    {/* Demo Image */}
                    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                        <img src={guide.demoImage} alt={`Demo for ${guide.title}`} className="w-full h-auto object-cover max-h-[250px]" />
                    </div>

                    {/* Accordion Sections */}
                    <div className="flex flex-col gap-3">
                        {guide.sections.map((section, index) => (
                            <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                                <button 
                                    onClick={() => setOpenSection(openSection === index ? -1 : index)}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                                >
                                    <span className="font-bold text-slate-800 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sky-500 text-[18px]">
                                            {index === 0 ? 'target' : 'lightbulb'}
                                        </span>
                                        {section.title}
                                    </span>
                                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${openSection === index ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </button>
                                {openSection === index && (
                                    <div className="p-4 bg-white border-t border-slate-100 text-slate-600 leading-relaxed whitespace-pre-line">
                                        {section.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition-all"
                    >
                        Đã hiểu!
                    </button>
                </div>
            </div>
        </div>
    );
};
