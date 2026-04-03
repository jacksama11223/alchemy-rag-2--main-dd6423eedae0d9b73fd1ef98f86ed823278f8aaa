import React, { useState, useEffect } from 'react';
import { KnowledgeNode } from '../types';
import { calculateNodeMastery, calculateItemSM2 } from '../services/sm2Service';
import { generateCheatSheet, filterParetoNodes } from '../services/geminiService';
import { CramHeader } from './CramMode/CramHeader';
import { CramStats } from './CramMode/CramStats';
import { CheatSheet } from './CramMode/CheatSheet';

// New Modules
import { MnemonicsGenerator, ELI5Button, AudioPodcastPlayer } from './CramMode/AICramTools';
import { FocusTimer, DarkroomToggle, MiniMap, StickyNote } from './CramMode/CramVisuals';
import { WeatherOverlay, GuardianSpirit, HarvestButton } from './CramMode/EcologicalSystem';
import { SurvivalProbability, LearningVelocity, TopicHeatmapWidget } from './CramMode/CramAnalytics';
import { SosSignal, ExportPdfBtn, MiniLeaderboard } from './CramMode/CramSocial';

interface CramModeProps {
    onBack: () => void;
    onShowAbout: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    userNodes?: KnowledgeNode[];
    onUpdateNodes?: (nodes: KnowledgeNode[]) => void;
}

const CramMode: React.FC<CramModeProps> = ({ onBack, onLogout, userNodes = [], onUpdateNodes }) => {
    const [cheatSheet, setCheatSheet] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [weakNodes, setWeakNodes] = useState<KnowledgeNode[]>([]);
    const [isReviving, setIsReviving] = useState(false);
    
    // Feature Toggles
    const [isDarkroom, setIsDarkroom] = useState(false);
    const [paretoMode, setParetoMode] = useState(false);
    const [activeTab, setActiveTab] = useState<'sheet' | 'analytics' | 'social'>('sheet');

    useEffect(() => {
        // Filter weak nodes (Mastery < 50%)
        const weak = userNodes.filter(n => calculateNodeMastery(n) < 50);
        setWeakNodes(weak);
    }, [userNodes]);

    const handleGenerate = async () => {
        if (weakNodes.length === 0) {
            alert("Bạn không có thẻ yếu nào để ôn tập!");
            return;
        }
        setIsGenerating(true);
        try {
            let targets = weakNodes.map(n => n.title);
            
            // Feature: Pareto Filter (80/20)
            if (paretoMode) {
                targets = await filterParetoNodes(targets);
            }

            const result = await generateCheatSheet(targets);
            setCheatSheet(result);
        } catch (e) {
            console.error(e);
            alert("Lỗi khi tạo Cheat Sheet.");
        } finally {
            setIsGenerating(false);
        }
    };

    // TOPIC 6: ECOLOGICAL REVIVAL & HARVEST
    const handleRevive = () => {
        if (!onUpdateNodes || weakNodes.length === 0) return;
        
        setIsReviving(true);
        
        const revivedNodes = weakNodes.map(node => {
            const newNode = { ...node };
            if (!newNode.data) return newNode;
            
            const newData = { ...newNode.data };
            const boostItems = (items: any[]) => items.map(item => ({ ...item, sm2: calculateItemSM2(item.sm2, 4) }));

            if (newData.flashcards) newData.flashcards = boostItems(newData.flashcards);
            if (newData.quiz) newData.quiz = boostItems(newData.quiz);
            if (newData.fillInBlanks) newData.fillInBlanks = boostItems(newData.fillInBlanks);
            if (newData.spotErrors) newData.spotErrors = boostItems(newData.spotErrors);
            if (newData.caseStudies) newData.caseStudies = boostItems(newData.caseStudies);
            
            newNode.data = newData;
            return newNode;
        });

        setTimeout(() => {
            onUpdateNodes(revivedNodes);
            setIsReviving(false);
            setCheatSheet(null);
            alert(`Đã hồi sinh ${revivedNodes.length} kiến thức! +500 Harvest Points.`);
        }, 1500);
    };

    // Calculated Stats
    const survivalChance = Math.max(0, 100 - weakNodes.length * 2);
    const isHarvestReady = survivalChance > 80 && weakNodes.length === 0;

    return (
        <div className={`relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden font-display transition-colors duration-500 ${isDarkroom ? 'bg-black text-red-500' : 'bg-[#2a1e3e] text-white'}`}>
            
            {/* Gamification Layers */}
            <WeatherOverlay stormIntensity={weakNodes.length / 10} />
            <GuardianSpirit health={survivalChance} />
            <HarvestButton ready={isHarvestReady} onClick={() => alert("Harvested! New Theme Unlocked.")} />
            <FocusTimer />
            
            <CramHeader onLogout={onLogout} onBack={onBack} />
            
            <main className="flex-grow flex flex-col items-center px-4 py-8 relative z-20">
                
                {/* Mode Toggles */}
                <div className="absolute top-4 right-20 flex gap-2">
                     <DarkroomToggle isDarkroom={isDarkroom} onToggle={() => setIsDarkroom(!isDarkroom)} />
                     <button onClick={() => setParetoMode(!paretoMode)} className={`p-2 rounded-full border ${paretoMode ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-transparent text-slate-400 border-white/20'}`} title="Pareto 80/20 Mode">
                        <span className="material-symbols-outlined">filter_list</span>
                     </button>
                </div>

                <div className="w-full max-w-7xl">
                    {/* Navigation Tabs (Mobile) */}
                    <div className="flex md:hidden gap-2 mb-4 overflow-x-auto">
                        {['sheet', 'analytics', 'social'].map(tab => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${activeTab === tab ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Panel: Stats & Controls */}
                        <div className={`w-full lg:w-1/3 flex flex-col gap-6 ${activeTab !== 'sheet' && 'hidden lg:flex'}`}>
                            <CramStats 
                                totalNodes={userNodes.length}
                                weakNodesCount={weakNodes.length}
                                isGenerating={isGenerating}
                                onGenerate={handleGenerate}
                                isReviving={isReviving}
                                onRevive={handleRevive}
                                hasCheatSheet={!!cheatSheet}
                                onBack={onBack}
                            />
                            
                            {/* Analytics Widget Group */}
                            <div className="grid grid-cols-2 gap-3">
                                <SurvivalProbability weakNodes={weakNodes.length} />
                                <LearningVelocity />
                            </div>
                            <TopicHeatmapWidget />
                            
                            {/* Social Widget Group */}
                            <div className="bg-[#1e1e1e]/50 p-4 rounded-xl border border-white/10 space-y-3">
                                <h5 className="text-xs font-bold uppercase text-slate-400">Trung tâm Hỗ trợ</h5>
                                <div className="flex gap-2">
                                    <SosSignal />
                                    <ExportPdfBtn />
                                </div>
                                <MiniLeaderboard />
                            </div>
                        </div>

                        {/* Right Panel: Cheat Sheet Content */}
                        <div className={`w-full lg:w-2/3 h-full ${activeTab === 'sheet' ? 'block' : 'hidden lg:block'}`}>
                            {cheatSheet && (
                                <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                                    <AudioPodcastPlayer content={cheatSheet} />
                                </div>
                            )}
                            
                            <div className="relative">
                                {cheatSheet && <StickyNote />}
                                <CheatSheet content={cheatSheet} isGenerating={isGenerating} />
                                
                                {/* Contextual Tools Overlay */}
                                {cheatSheet && (
                                    <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 pointer-events-none">
                                        <div className="pointer-events-auto"><MnemonicsGenerator topic="Complex Concept" /></div>
                                        <div className="pointer-events-auto bg-black/80 p-2 rounded-xl backdrop-blur">
                                            <ELI5Button text="Quantum Entanglement" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default React.memo(CramMode);
