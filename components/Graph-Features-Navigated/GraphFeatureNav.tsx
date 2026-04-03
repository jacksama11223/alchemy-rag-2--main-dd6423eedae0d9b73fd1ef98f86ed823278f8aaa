import React, { useState } from 'react';
import { KnowledgeNode } from '../../types';
import { LearningPathTree } from './LearningPathTree';
import { DueCardsList } from './DueCardsList';
import { CardTypeFilter } from './CardTypeFilter';
import { PracticeExercises } from './PracticeExercises';

interface GraphFeatureNavProps {
    nodes: KnowledgeNode[];
    onNodeClick: (node: KnowledgeNode) => void;
}

type NavTab = 'path' | 'due' | 'types' | 'practice' | null;

export const GraphFeatureNav: React.FC<GraphFeatureNavProps> = ({ nodes, onNodeClick }) => {
    const [activeTab, setActiveTab] = useState<NavTab>(null);

    const tabs = [
        { id: 'path', icon: 'account_tree', label: 'Lộ trình', color: 'text-green-400', hoverBg: 'hover:bg-green-500/10' },
        { id: 'due', icon: 'schedule', label: 'Đến hạn', color: 'text-amber-400', hoverBg: 'hover:bg-amber-500/10' },
        { id: 'types', icon: 'category', label: 'Phân loại', color: 'text-cyan-400', hoverBg: 'hover:bg-cyan-500/10' },
        { id: 'practice', icon: 'fitness_center', label: 'Bài tập', color: 'text-pink-400', hoverBg: 'hover:bg-pink-500/10' },
    ];

    return (
        <div className="absolute left-6 top-24 bottom-24 z-40 flex gap-4 pointer-events-none">
            {/* Sidebar Navigation Icons */}
            <div className="w-16 bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex flex-col items-center py-4 gap-4 pointer-events-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id as NavTab)}
                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                            activeTab === tab.id 
                            ? `bg-white/10 border border-white/20 shadow-inner ${tab.color}` 
                            : `text-slate-400 border border-transparent ${tab.hoverBg} hover:text-white`
                        }`}
                        title={tab.label}
                    >
                        <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                    </button>
                ))}
            </div>

            {/* Expanded Panel */}
            {activeTab && (
                <div className="w-80 bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col pointer-events-auto animate-[slideInLeft_0.3s_ease-out]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
                        <h2 className="font-bold text-white flex items-center gap-2">
                            <span className={`material-symbols-outlined ${tabs.find(t => t.id === activeTab)?.color}`}>
                                {tabs.find(t => t.id === activeTab)?.icon}
                            </span>
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h2>
                        <button onClick={() => setActiveTab(null)} className="text-slate-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                        {activeTab === 'path' && <LearningPathTree nodes={nodes} onNodeClick={onNodeClick} />}
                        {activeTab === 'due' && <DueCardsList nodes={nodes} onNodeClick={onNodeClick} />}
                        {activeTab === 'types' && <CardTypeFilter nodes={nodes} onNodeClick={onNodeClick} />}
                        {activeTab === 'practice' && <PracticeExercises nodes={nodes} onNodeClick={onNodeClick} />}
                    </div>
                </div>
            )}
        </div>
    );
};
