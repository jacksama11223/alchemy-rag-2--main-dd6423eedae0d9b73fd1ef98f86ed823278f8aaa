import React, { useState, useEffect } from 'react';
import { getTutorPersonas, getAlchemyTemplates } from '../../services/mockBackend';
import { TutorPersona, AlchemyTemplate } from '../../types';

export const AdminAI: React.FC = () => {
    const [personas, setPersonas] = useState<TutorPersona[]>([]);
    const [templates, setTemplates] = useState<AlchemyTemplate[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const p = await getTutorPersonas();
            const t = await getAlchemyTemplates();
            setPersonas(p);
            setTemplates(t);
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s]">
            <div>
                <h2 className="text-2xl font-bold text-white">Cấu Hình Trí Tuệ Nhân Tạo (AI)</h2>
                <p className="text-slate-400 text-xs">Quản lý các nhân vật AI (Personas) và các mẫu tạo nội dung (Templates).</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-white/10 bg-[#162032] flex justify-between items-center">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-400">psychology</span>
                            Nhân Vật AI ({personas.length})
                        </h3>
                        <button className="text-xs font-bold px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition-all">+ Thêm Mới</button>
                    </div>
                    <div className="p-4 space-y-3">
                        {personas.map(persona => (
                            <div key={persona.id} className="bg-black/20 p-3 rounded-xl border border-white/5 flex items-start gap-3">
                                <span className={`material-symbols-outlined text-2xl text-${persona.color}-400`}>{persona.icon}</span>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white">{persona.name}</h4>
                                    <p className="text-xs text-slate-400 mb-2">{persona.description}</p>
                                    <div className="bg-black/40 p-2 rounded border border-white/5">
                                        <p className="text-[10px] text-slate-500 font-mono line-clamp-2">Prompt: {persona.systemInstruction}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                                    <button className="text-red-400 hover:text-red-300 transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-white/10 bg-[#162032] flex justify-between items-center">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-cyan-400">auto_awesome</span>
                            Mẫu Tạo Nội Dung ({templates.length})
                        </h3>
                        <button className="text-xs font-bold px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition-all">+ Thêm Mới</button>
                    </div>
                    <div className="p-4 space-y-3">
                        {templates.map(template => (
                            <div key={template.id} className="bg-black/20 p-3 rounded-xl border border-white/5 flex items-start gap-3">
                                <span className="material-symbols-outlined text-2xl text-cyan-400">{template.icon}</span>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white">{template.name}</h4>
                                    <p className="text-xs text-slate-400">{template.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                                    <button className="text-red-400 hover:text-red-300 transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
