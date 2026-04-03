import React, { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { KnowledgeNode } from '../../types';
import { LearningPathTree } from '../Graph-Features-Navigated/LearningPathTree';
import { DueCardsList } from '../Graph-Features-Navigated/DueCardsList';
import { CardTypeFilter } from '../Graph-Features-Navigated/CardTypeFilter';
import { PracticeExercises } from '../Graph-Features-Navigated/PracticeExercises';
import { GlassModal } from './GlassModal';

interface DraggableFeatureNavProps {
    nodes: KnowledgeNode[];
    onNodeClick: (node: KnowledgeNode) => void;
}

type NavTab = 'path' | 'due' | 'types' | 'practice' | null;

interface TabConfig {
    id: string;
    icon: string;
    label: string;
    color: string;
    hoverBg: string;
}

const defaultTabs: TabConfig[] = [
    { id: 'path', icon: 'account_tree', label: 'Lộ trình', color: 'text-green-400', hoverBg: 'hover:bg-green-500/10' },
    { id: 'due', icon: 'schedule', label: 'Đến hạn', color: 'text-amber-400', hoverBg: 'hover:bg-amber-500/10' },
    { id: 'types', icon: 'category', label: 'Phân loại', color: 'text-cyan-400', hoverBg: 'hover:bg-cyan-500/10' },
    { id: 'practice', icon: 'fitness_center', label: 'Bài tập', color: 'text-pink-400', hoverBg: 'hover:bg-pink-500/10' },
];

export const DraggableFeatureNav: React.FC<DraggableFeatureNavProps> = ({ nodes, onNodeClick }) => {
    const [tabs, setTabs] = useState<TabConfig[]>(defaultTabs);
    const [activeTab, setActiveTab] = useState<NavTab>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [draggedTab, setDraggedTab] = useState<TabConfig | null>(null);

    // Load saved order from localStorage if available
    useEffect(() => {
        const savedOrder = localStorage.getItem('featureNavOrder');
        if (savedOrder) {
            try {
                const parsedOrder = JSON.parse(savedOrder);
                const reorderedTabs = parsedOrder.map((id: string) => defaultTabs.find(t => t.id === id)).filter(Boolean);
                if (reorderedTabs.length === defaultTabs.length) {
                    setTabs(reorderedTabs);
                }
            } catch (e) {
                console.error('Failed to parse saved order', e);
            }
        }
    }, []);

    // Save order to localStorage when changed
    useEffect(() => {
        localStorage.setItem('featureNavOrder', JSON.stringify(tabs.map(t => t.id)));
    }, [tabs]);

    const handleDragEnd = (event: any, info: any, tab: TabConfig) => {
        setIsDragging(false);
        setDraggedTab(null);
        
        // If dragged far enough to the right (e.g., x > 100)
        if (info.offset.x > 100) {
            setActiveTab(tab.id as NavTab);
        }
    };

    const handleDragStart = (tab: TabConfig) => {
        setIsDragging(true);
        setDraggedTab(tab);
    };

    const activeTabConfig = tabs.find(t => t.id === activeTab);

    return (
        <>
            {/* Drop Zone Overlay */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[40] flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-sm"
                    >
                        <motion.div 
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-96 h-96 border-4 border-dashed border-cyan-400/50 rounded-full flex flex-col items-center justify-center gap-4 bg-cyan-900/20 shadow-[0_0_50px_rgba(6,182,212,0.2)]"
                        >
                            {draggedTab && (
                                <span className={`material-symbols-outlined text-6xl ${draggedTab.color} opacity-80`}>
                                    {draggedTab.icon}
                                </span>
                            )}
                            <p className="text-2xl font-bold text-white/90 tracking-wider text-center">
                                Thả vào đây để mở<br/>
                                <span className={draggedTab?.color}>{draggedTab?.label}</span>
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar Navigation Icons */}
            <div className="absolute left-6 top-24 bottom-24 z-[45] flex gap-4 pointer-events-none">
                <div className="w-16 bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex flex-col items-center py-4 gap-4 pointer-events-auto">
                    <Reorder.Group axis="y" values={tabs} onReorder={setTabs} className="flex flex-col gap-4 w-full items-center">
                        {tabs.map(tab => (
                            <Reorder.Item
                                key={tab.id}
                                value={tab}
                                drag
                                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                dragElastic={1}
                                whileDrag={{ scale: 1.2, zIndex: 100, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                                onDragStart={() => handleDragStart(tab)}
                                onDragEnd={(e, info) => handleDragEnd(e, info, tab)}
                                className="relative z-50 cursor-grab active:cursor-grabbing rounded-xl bg-[#0f172a]/80"
                            >
                                <button
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
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>
            </div>

            {/* Glassmorphism Modal */}
            <GlassModal
                isOpen={activeTab !== null}
                onClose={() => setActiveTab(null)}
                title={activeTabConfig?.label || ''}
                icon={activeTabConfig?.icon || ''}
                color={activeTabConfig?.color || ''}
            >
                {activeTab === 'path' && <LearningPathTree nodes={nodes} onNodeClick={onNodeClick} />}
                {activeTab === 'due' && <DueCardsList nodes={nodes} onNodeClick={onNodeClick} />}
                {activeTab === 'types' && <CardTypeFilter nodes={nodes} onNodeClick={onNodeClick} />}
                {activeTab === 'practice' && <PracticeExercises nodes={nodes} onNodeClick={onNodeClick} />}
            </GlassModal>
        </>
    );
};
