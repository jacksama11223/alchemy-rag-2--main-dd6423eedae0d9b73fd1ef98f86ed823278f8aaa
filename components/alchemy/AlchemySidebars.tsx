
import React from 'react';
import { AlchemyPersona, AlchemySettings } from '../../types';
import { PersonaSelector, DifficultySlider, LanguageTargetSelector, TemplateMarket, TokenCostEstimator } from './AlchemyLabConfig';
import { FocusHeatmap, ForgettingCurveGraph, WeaknessRadar, StudySessionTimer, GoalSetterWidget } from './AlchemyAnalytics';
import { DyslexiaFontToggle, HighContrastMode, TextSizeSlider, KeyboardMapTable } from './AlchemyAccessibility';
import { NotionSyncConfig, AnkiConnectConfig, ApiUsageMonitor, ErrorLogConsole, GoogleDrivePicker } from './AlchemySystemIntegrations';

// --- SETTINGS SIDEBAR ---
interface SettingsSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AlchemySettings;
    onUpdateSettings: (s: Partial<AlchemySettings>) => void;
    sourceCount: number;
}

export const AlchemySettingsSidebar: React.FC<SettingsSidebarProps> = ({ 
    isOpen, onClose, settings, onUpdateSettings, sourceCount
}) => {
    return (
        <div className={`fixed top-0 right-0 h-full w-80 bg-[#0f172a]/95 backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300 border-l border-white/10 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-6 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-cyan-400">science</span> Phòng thí nghiệm
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
                </div>
                
                <div className="space-y-6">
                    {/* Lab Configuration */}
                    <PersonaSelector selectedPersona={settings.personaId} onSelect={(id) => onUpdateSettings({ personaId: id })} />
                    <DifficultySlider value={settings.difficulty} onChange={(val) => onUpdateSettings({ difficulty: val })} />
                    <LanguageTargetSelector targetLang={settings.targetLanguage} onChange={(val) => onUpdateSettings({ targetLanguage: val })} />
                    <TemplateMarket selectedTemplate={settings.templateId} onSelect={(id) => onUpdateSettings({ templateId: id })} />
                    <TokenCostEstimator sourceCount={sourceCount} difficulty={settings.difficulty} />

                    <div className="h-px bg-white/10 my-4"></div>

                    {/* Accessibility Section */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Trợ năng & Giao diện</h4>
                        <DyslexiaFontToggle />
                        <HighContrastMode />
                        <TextSizeSlider />
                        <KeyboardMapTable />
                    </div>

                    <div className="h-px bg-white/10 my-4"></div>

                    {/* Integrations Section */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Tích hợp Hệ thống</h4>
                        <GoogleDrivePicker />
                        <div className="h-2"></div>
                        <NotionSyncConfig />
                        <AnkiConnectConfig />
                        <ApiUsageMonitor />
                        <ErrorLogConsole />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- HISTORY SIDEBAR ---
interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    history: any[];
    onSelectHistory: (text: string) => void;
}

export const AlchemyHistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, history, onSelectHistory }) => {
    return (
        <div className={`fixed top-0 left-0 h-full w-80 bg-[#0f172a]/95 backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300 border-r border-white/10 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-4 h-full flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400">history</span> Kho lưu trữ
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
                </div>

                {/* Analytics Section at Top of History */}
                <div className="mb-6">
                    <GoalSetterWidget />
                    <div className="h-4"></div>
                    <StudySessionTimer />
                    <FocusHeatmap />
                    <WeaknessRadar />
                    <ForgettingCurveGraph />
                </div>

                <div className="h-px bg-white/10 mb-4"></div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Lịch sử gần đây</h4>

                <div className="space-y-3">
                    {history.length === 0 && <p className="text-sm text-slate-500 text-center italic mt-4">Chưa có thí nghiệm nào</p>}
                    {history.map(item => (
                        <div key={item.id} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-colors group" onClick={() => onSelectHistory(item.title)}>
                            <p className="font-bold text-sm text-slate-200 truncate mb-1 group-hover:text-white">{item.title}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 group-hover:text-slate-400">
                                <span className="material-symbols-outlined text-[10px]">schedule</span> {item.date}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
