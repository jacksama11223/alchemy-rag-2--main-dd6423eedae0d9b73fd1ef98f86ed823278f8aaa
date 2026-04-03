
import React from 'react';

// Import kept components
import { DataManagementPanel } from './GraphData';
import { CodeLearningStudio } from './GraphVisuals';
import { KnowledgeNode } from '../../types';

interface UnifiedControlPanelProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: 'DATA' | 'VISUAL';
    onTabChange: (tab: any) => void;
    userNodes?: KnowledgeNode[];
}

export const UnifiedControlPanel: React.FC<UnifiedControlPanelProps> = ({ isOpen, onClose, activeTab, onTabChange, userNodes = [] }) => {
    if (!isOpen) return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'DATA':
                return (
                    <DataManagementPanel userNodes={userNodes} />
                );
            case 'VISUAL':
                return (
                    <div className="flex flex-col h-full gap-6 animate-fade-in pb-4">
                        <div className="flex-1 min-h-[400px]">
                             <CodeLearningStudio userNodes={userNodes} />
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
            <div className="bg-[#0b1120] w-full max-w-7xl h-[85vh] rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.1)] flex flex-col overflow-hidden relative">
                
                {/* Header & Tabs */}
                <div className="flex flex-col md:flex-row border-b border-white/10 bg-[#0f172a]">
                    <div className="p-6 border-b md:border-b-0 md:border-r border-white/10 flex items-center justify-between md:justify-start w-64">
                         <div className="flex items-center gap-2">
                             <span className="material-symbols-outlined text-cyan-400 text-3xl">hub</span>
                             <div>
                                 <h2 className="text-white font-black text-lg tracking-wider">NEXUS</h2>
                                 <p className="text-[10px] text-slate-500 uppercase">Control Center</p>
                             </div>
                         </div>
                         <button onClick={onClose} className="md:hidden text-slate-400"><span className="material-symbols-outlined">close</span></button>
                    </div>
                    
                    <div className="flex-1 flex overflow-x-auto scrollbar-hide">
                        {[
                            { id: 'DATA', icon: 'analytics', label: 'Data Center' },
                            { id: 'VISUAL', icon: 'code', label: 'Coding Studio' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                                    activeTab === tab.id 
                                    ? 'border-cyan-500 text-cyan-400 bg-white/5' 
                                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <span className="material-symbols-outlined">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    
                    <button onClick={onClose} className="hidden md:block px-6 text-slate-400 hover:text-white hover:bg-red-500/20 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-br from-[#0b1120] to-[#111827]">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
