
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FeatureWindowControls } from './FeatureWindowControls';
import { KnowledgeNode } from '../types';
import { calculateNodeMastery } from '../services/sm2Service';

// Import Modular Components (Old)
import { TopicGrid } from './ExploreCategory/TopicGrid';
import { ActivityHeatmap, HeatmapDayData } from './ExploreCategory/ActivityHeatmap'; // Imported type

// Import Component Groups
import * as EcNav from './ExploreCategory/EcNavigation';
import * as EcDetail from './ExploreCategory/EcTopicDetail';
import { AstronautAvatar, CosmicRankBadge, CometStreakCounter, StardustCurrency, MissionLogPanel, GalacticLeaderboard, AchievementMedalCase } from './ExploreCategory/EcGamification';
import * as EcSocial from './ExploreCategory/EcSocial';
import * as EcCreation from './ExploreCategory/EcCreation';
import * as EcMedia from './ExploreCategory/EcMedia';
import * as EcSystem from './ExploreCategory/EcSystem';
import * as EcMarket from './ExploreCategory/EcMarketplace';
import * as EcDataViz from './ExploreCategory/EcDataViz';
import * as EcEnt from './ExploreCategory/EcEnterprise';
import * as EcAmbience from './ExploreCategory/EcAmbience';
import * as EcGenAI from './ExploreCategory/EcGenAI';

interface ExploreCategoryProps {
    onBack: () => void;
    onShowAbout: () => void;
    onTopicSelect?: (tag: string) => void;
    onDifficultySelect?: () => void;
    onSkillSelect?: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    userNodes?: KnowledgeNode[];
    onGoToFeatures?: () => void;
    onOpenNode?: (node: KnowledgeNode) => void;
}

// Simple Notification Component
const NotificationToast: React.FC<{ message: string, onClose: () => void }> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-24 right-4 z-[200] bg-cyan-900/90 border border-cyan-400 text-white px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.4)] animate-bounce-in flex items-center gap-3 backdrop-blur-md">
            <span className="material-symbols-outlined text-cyan-400 animate-pulse">info</span>
            <span className="text-sm font-bold tracking-wide">{message}</span>
        </div>
    );
};

const ExploreCategory: React.FC<ExploreCategoryProps> = ({ 
    onBack, onShowAbout, onTopicSelect, onDifficultySelect, onSkillSelect, 
    onLogout, onShowFAQ, onShowAccount, userNodes = [], onGoToFeatures, onOpenNode
}) => {
    // --- STATE ---
    const [viewMode, setViewMode] = useState<'cards' | 'heatmap' | 'detail' | 'creation' | 'marketplace' | 'admin'>('cards');
    const [isZenMode, setIsZenMode] = useState(false);
    
    // Interactive State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Tất cả');
    const [notification, setNotification] = useState<string | null>(null);
    
    // Heatmap State
    const [viewDate, setViewDate] = useState(new Date()); 
    const [heatmapMode, setHeatmapMode] = useState<'activity' | 'schedule'>('schedule');
    const [heatmapTagFilter, setHeatmapTagFilter] = useState('All');

    // Toggles
    const [showCreatorModal, setShowCreatorModal] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [ambiencePanelOpen, setAmbiencePanelOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');

    // --- NOTIFICATION HANDLER ---
    const showNotify = (msg: string) => {
        setNotification(msg);
    };

    // --- HELPER: Get Icon for Node Type ---
    const getNodeIcon = (type: string) => {
        switch (type) {
            case 'Flashcard': return 'style';
            case 'Quiz': return 'quiz';
            case 'Fill-in-the-blanks': return 'edit_note';
            case 'Spot the Error': return 'bug_report';
            case 'Case Study': return 'work_history';
            default: return 'article';
        }
    };

    // --- HELPER: Get Unique Tags ---
    const availableTags = useMemo(() => {
        const tags = new Set<string>();
        userNodes.forEach(node => {
            if (node.tags) node.tags.forEach(t => tags.add(t));
        });
        return Array.from(tags).sort();
    }, [userNodes]);

    // --- DATA PROCESSING (GRID) ---
    const gridItems = useMemo(() => {
        let filtered = userNodes;
        const now = new Date();

        if (activeFilter === 'Mới nhất') {
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            filtered = userNodes.filter(n => new Date(n.timestamp) >= oneDayAgo);
        } else if (activeFilter === 'Đang học') {
            filtered = userNodes.filter(n => {
                const m = calculateNodeMastery(n);
                return m > 0 && m < 100;
            });
        }

        if (searchQuery) {
            filtered = filtered.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || (n.tags && n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))));
        }

        return filtered.map(node => ({
            id: node.id,
            title: node.title,
            type: node.type,
            tag: node.tags?.[0] || 'General',
            icon: getNodeIcon(node.type),
            count: node.data?.flashcards?.length || 0,
            avgMastery: calculateNodeMastery(node),
            isNode: true,
            rawNode: node
        }));

    }, [userNodes, searchQuery, activeFilter]);

    // --- ADVANCED HEATMAP CALCULATION ---
    const { heatmapData, currentDay, currentMonth, currentYear, viewMonth, viewYear, startDayOffset } = useMemo(() => {
        // 1. Setup Dates
        const now = new Date();
        const realYear = now.getFullYear();
        const realMonth = now.getMonth();
        const today = now.getDate();

        const vYear = viewDate.getFullYear();
        const vMonth = viewDate.getMonth();
        const daysInMonth = new Date(vYear, vMonth + 1, 0).getDate();
        
        // Offset for Monday start (0=Sun -> 6, 1=Mon -> 0)
        const firstDayWeekday = new Date(vYear, vMonth, 1).getDay();
        const startOffset = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;

        // 2. Filter Nodes by Tag
        const filteredNodes = heatmapTagFilter === 'All' 
            ? userNodes 
            : userNodes.filter(n => n.tags?.includes(heatmapTagFilter));

        // 3. Populate Map
        const dailyMap: Record<number, { count: number, items: string[] }> = {};
        
        // Initialize map
        for (let i = 1; i <= daysInMonth; i++) dailyMap[i] = { count: 0, items: [] };

        filteredNodes.forEach(node => {
            if (heatmapMode === 'schedule') {
                // SCHEDULE MODE: Look for Future Due Dates (sm2.nextReviewDate)
                const items = node.data?.flashcards || [];
                // Group items by date. Note: A node might appear on multiple days if its cards are due differently.
                items.forEach(item => {
                    if (item.sm2?.nextReviewDate) {
                        const date = new Date(item.sm2.nextReviewDate);
                        if (date.getFullYear() === vYear && date.getMonth() === vMonth) {
                            const day = date.getDate();
                            dailyMap[day].count++;
                            if (!dailyMap[day].items.includes(node.title)) {
                                dailyMap[day].items.push(node.title);
                            }
                        }
                    }
                });
            } else {
                // ACTIVITY MODE: Look for Creation/Last Study Date
                // Currently using timestamp (creation) as proxy for "Activity"
                // In a real app, this would use a separate Activity Log array.
                const date = new Date(node.timestamp);
                if (date.getFullYear() === vYear && date.getMonth() === vMonth) {
                    const day = date.getDate();
                    dailyMap[day].count++;
                    dailyMap[day].items.push(node.title + " (Created)");
                }
            }
        });

        // 4. Transform to Array
        const maxActivity = Math.max(...Object.values(dailyMap).map(d => d.count), 1);

        const data: HeatmapDayData[] = Object.keys(dailyMap).map(dayKey => {
            const day = parseInt(dayKey);
            const info = dailyMap[day];
            return {
                day,
                count: info.count,
                intensity: info.count / maxActivity,
                items: info.items
            };
        });

        return {
            heatmapData: data,
            currentDay: today,
            currentMonth: realMonth,
            currentYear: realYear,
            viewMonth: vMonth,
            viewYear: vYear,
            startDayOffset: startOffset
        };
    }, [userNodes, viewDate, heatmapMode, heatmapTagFilter]);

    // Heatmap Navigation Handlers
    const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    const handleGoToday = () => setViewDate(new Date());

    // --- BACKGROUND STARS EFFECT ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let stars = Array.from({ length: 150 }).map(() => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 1.5,
            opacity: Math.random(),
            speed: Math.random() * 0.15
        }));

        const animate = () => {
            if (!canvas || !ctx) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw Nebulas (Soft Gradients)
            const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width);
            gradient.addColorStop(0, 'rgba(10, 36, 58, 0.2)');
            gradient.addColorStop(1, 'rgba(2, 4, 16, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0,0, canvas.width, canvas.height);

            ctx.fillStyle = 'white';
            stars.forEach(star => {
                star.y -= star.speed;
                if (star.y < 0) star.y = canvas.height;
                ctx.globalAlpha = star.opacity;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(animate);
        };
        const animId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animId);
    }, []);

    // --- HANDLERS ---
    const handleSyncToGraph = () => { if(onTopicSelect) onTopicSelect(''); };
    const handleBuyItem = (title: string, price: number) => { showNotify(`Đã mua "${title}" với giá ${price} Credits!`); };
    const handlePurchaseCredits = (amount: number) => { showNotify(`Đã nạp thành công ${amount} Credits!`); };
    const handleQuickAction = (action: string) => {
        if (action === 'create') setShowCreatorModal(true);
        else if (action === 'learn') showNotify("Đang tìm bài học phù hợp...");
        else if (action === 'search') (document.querySelector('input[placeholder*="Tìm kiếm"]') as HTMLElement)?.focus();
    };

    // --- RENDER SECTIONS ---
    const renderMainContent = () => {
        const contentClasses = "animate-fade-in-up transition-all duration-500 ease-out";
        
        switch (viewMode) {
            case 'detail':
                return (
                    <div className={`grid grid-cols-1 xl:grid-cols-4 gap-6 ${contentClasses}`}>
                        <div className="xl:col-span-3 space-y-6">
                            <EcDetail.PlanetHeroSection />
                            <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex gap-2 bg-black/20 p-1 rounded-xl">
                                        {['Overview', 'Curriculum', 'Discussions'].map(tab => (
                                            <button 
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                    <EcGenAI.ContentSummarizerBot />
                                </div>
                                {activeTab === 'Overview' && (
                                    <div className="space-y-8">
                                        <div className="flex gap-6 items-start">
                                            <div className="relative group cursor-pointer">
                                                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                                                <EcDetail.OrbitProgressBar progress={65} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Tiến độ khám phá</h3>
                                                <p className="text-slate-300 text-sm leading-relaxed max-w-xl">Hành trình tri thức của bạn đang tiến triển tốt. Hãy hoàn thành các bài kiểm tra năng lực để mở khóa huy hiệu "Nhà Thám Hiểm".</p>
                                                <div className="mt-6 flex gap-3">
                                                    <EcDetail.IgnitionButton />
                                                    <EcDetail.FlagPlantingBookmark />
                                                </div>
                                            </div>
                                        </div>
                                        <EcDetail.LoreTextContainer />
                                        <EcMedia.InteractiveQuizWidget />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="xl:col-span-1 space-y-6">
                            <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-lg">
                                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">Thông số môi trường</h4>
                                <EcDetail.GravityDifficultyMeter level={3} />
                                <div className="h-6"></div>
                                <EcDetail.TimeDilationTimer />
                            </div>
                            <EcDetail.SatelliteResources />
                            <EcDetail.PrerequisiteGateway />
                            <EcDetail.NextDestinationPreview />
                        </div>
                    </div>
                );

            case 'creation':
                return (
                    <div className={`max-w-5xl mx-auto space-y-8 ${contentClasses}`}>
                        <div className="text-center mb-12">
                            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500 mb-4 drop-shadow-lg">Phòng Thí Nghiệm Khởi Tạo</h2>
                            <p className="text-slate-400 text-lg">Kiến tạo tri thức mới từ dữ liệu thô sơ.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gradient-to-br from-white/5 to-white/0 p-8 rounded-3xl border border-white/10 hover:border-cyan-500/50 transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] group">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined">upload</span></div>
                                    Nạp dữ liệu
                                </h3>
                                <div className="space-y-4">
                                    <EcCreation.ProbeImageUploader />
                                    <EcCreation.WormholeImporter />
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-white/5 to-white/0 p-8 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] group">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined">auto_fix</span></div>
                                    AI Hỗ trợ
                                </h3>
                                <div className="space-y-4">
                                    <EcGenAI.ImageGenCanvas isOpen={false} onClose={() => {}} />
                                    <EcGenAI.VoiceOverSynthesizer />
                                </div>
                            </div>
                        </div>
                        <EcCreation.BlueprintGallery />
                    </div>
                );

            case 'marketplace':
                return (
                    <div className={`max-w-7xl mx-auto space-y-8 ${contentClasses}`}>
                        <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6 gap-4">
                            <div>
                                <h2 className="text-4xl font-black text-amber-400 mb-2 drop-shadow-md">Chợ Thiên Hà</h2>
                                <p className="text-slate-400 text-sm max-w-md">Trao đổi, mua bán các gói tri thức chất lượng cao từ cộng đồng người học toàn cầu.</p>
                            </div>
                            <EcMarket.CreditExchangePanel onPurchaseCredits={handlePurchaseCredits} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <EcMarket.TradingPostCard title="React Patterns" price={500} author="Dan A." onBuy={handleBuyItem} />
                            <EcMarket.TradingPostCard title="Vũ trụ học" price={300} author="Sagan" onBuy={handleBuyItem} />
                            <EcMarket.TradingPostCard title="Tiếng Anh Giao Tiếp" price={0} author="Community" onBuy={handleBuyItem} />
                            <EcMarket.TradingPostCard title="Luyện thi IELTS" price={1200} author="Expert_Hub" onBuy={handleBuyItem} />
                            <EcMarket.TradingPostCard title="Python for Data" price={800} author="AI_Lab" onBuy={handleBuyItem} />
                        </div>
                    </div>
                );

            case 'admin':
                return <EcEnt.AuditLogTerminal />; 

            default: // 'cards' | 'heatmap'
                return (
                    <div className={`space-y-8 ${contentClasses}`}>
                        {/* Top Controls */}
                        <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                            <div className="w-full md:w-2/3">
                                <EcNav.UniversalSearchBar value={searchQuery} onChange={setSearchQuery} />
                            </div>
                            <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                                <button onClick={() => setViewMode('cards')} className={`p-2.5 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'cards' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                                    <span className="material-symbols-outlined text-xl">grid_view</span>
                                    <span className="text-xs font-bold hidden sm:inline">Lưới</span>
                                </button>
                                <button onClick={() => setViewMode('heatmap')} className={`p-2.5 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'heatmap' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                                    <span className="material-symbols-outlined text-xl">calendar_month</span>
                                    <span className="text-xs font-bold hidden sm:inline">Nhiệt</span>
                                </button>
                            </div>
                        </div>

                        {/* Shows Filter Belt only in Cards mode to avoid clutter in Heatmap (which has its own filter) */}
                        {viewMode === 'cards' && (
                            <EcNav.FilterAsteroidBelt activeFilter={activeFilter} onSelectFilter={setActiveFilter} />
                        )}

                        {viewMode === 'cards' ? (
                            <>
                                <TopicGrid 
                                    items={gridItems} 
                                    onItemSelect={(item) => { 
                                        if (item.isNode && onOpenNode) {
                                            onOpenNode(item.rawNode);
                                        } else if (onTopicSelect) {
                                            onTopicSelect(item.title);
                                        }
                                    }} 
                                    totalNodes={userNodes.length} 
                                />
                                <EcNav.CompassPagination />
                            </>
                        ) : (
                            <ActivityHeatmap 
                                data={heatmapData} 
                                currentDay={currentDay} 
                                currentMonth={currentMonth} 
                                currentYear={currentYear}
                                viewMonth={viewMonth}
                                viewYear={viewYear}
                                startDayOffset={startDayOffset}
                                onPrevMonth={handlePrevMonth}
                                onNextMonth={handleNextMonth}
                                onGoToday={handleGoToday}
                                mode={heatmapMode}
                                onModeChange={setHeatmapMode}
                                availableTags={['All', ...availableTags]}
                                selectedTag={heatmapTagFilter}
                                onTagSelect={setHeatmapTagFilter}
                            />
                        )}
                        
                        {/* Highlights Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-3xl p-8 hover:border-indigo-500/40 transition-colors">
                                <h3 className="text-indigo-200 font-bold mb-6 flex items-center gap-3 text-lg">
                                    <span className="material-symbols-outlined text-2xl">radar</span> Radar Kỹ Năng
                                </h3>
                                <EcDataViz.RadarChartSkill />
                            </div>
                            <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-cyan-500/20 rounded-3xl p-8 hover:border-cyan-500/40 transition-colors">
                                <h3 className="text-cyan-200 font-bold mb-6 flex items-center gap-3 text-lg">
                                    <span className="material-symbols-outlined text-2xl">timeline</span> Dòng thời gian
                                </h3>
                                <EcDataViz.TimelineHorizon />
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={`relative min-h-screen w-full bg-[#020410] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1B2735]/40 via-[#020410]/80 to-[#000000] text-slate-200 font-display overflow-x-hidden ${isZenMode ? 'cursor-none' : ''}`}>
            
            {/* 0. Background Layer */}
            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-60" />
            <div className="fixed inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

            {/* Notification Toast */}
            {notification && <NotificationToast message={notification} onClose={() => setNotification(null)} />}

            {/* 1. Global Header (Hidden in Zen Mode) */}
            {!isZenMode && (
                <div className="sticky top-0 z-50 bg-[#020410]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
                    {/* Secondary Toolbar */}
                    <div className="px-6 py-2 flex items-center justify-between text-xs border-b border-white/5 bg-[#020410]/50 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => onTopicSelect && onTopicSelect('')}
                                className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-400/60 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                            >
                                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                                <span className="font-bold uppercase tracking-wide">Sơ đồ Tri thức</span>
                            </button>
                            <div className="w-px h-4 bg-white/10"></div>
                            <EcNav.StarTrailBreadcrumbs />
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setViewMode('cards')} className={`hover:text-cyan-400 transition-colors ${viewMode === 'cards' ? 'text-cyan-400 font-bold drop-shadow-[0_0_5px_cyan]' : 'text-slate-500'}`}>EXPLORE</button>
                            <span className="text-slate-700">|</span>
                            <button onClick={() => setViewMode('marketplace')} className={`hover:text-amber-400 transition-colors ${viewMode === 'marketplace' ? 'text-amber-400 font-bold drop-shadow-[0_0_5px_orange]' : 'text-slate-500'}`}>MARKET</button>
                            <span className="text-slate-700">|</span>
                            <button onClick={() => setViewMode('creation')} className={`hover:text-purple-400 transition-colors ${viewMode === 'creation' ? 'text-purple-400 font-bold drop-shadow-[0_0_5px_purple]' : 'text-slate-500'}`}>STUDIO</button>
                            <div className="ml-4">
                                <FeatureWindowControls onClose={onBack} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Main Layout Grid */}
            <div className="relative z-10 flex min-h-[calc(100vh-100px)]">
                
                {/* Left: Navigation Dock (Sidebar) */}
                {!isZenMode && (
                    <aside className="w-24 hidden md:flex flex-col items-center py-8 gap-6 border-r border-white/5 bg-[#020410]/40 backdrop-blur-md sticky top-[100px] h-[calc(100vh-100px)]">
                        <div onClick={() => setViewMode('cards')} className={`group relative p-3 rounded-2xl cursor-pointer transition-all ${viewMode === 'cards' ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                            <span className="material-symbols-outlined text-3xl">dashboard</span>
                            <span className="absolute left-14 bg-black px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">Explore</span>
                        </div>
                        <div onClick={() => setViewMode('marketplace')} className={`group relative p-3 rounded-2xl cursor-pointer transition-all ${viewMode === 'marketplace' ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                            <span className="material-symbols-outlined text-3xl">storefront</span>
                             <span className="absolute left-14 bg-black px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">Market</span>
                        </div>
                        <div onClick={() => setViewMode('creation')} className={`group relative p-3 rounded-2xl cursor-pointer transition-all ${viewMode === 'creation' ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                            <span className="material-symbols-outlined text-3xl">add_circle</span>
                             <span className="absolute left-14 bg-black px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">Create</span>
                        </div>
                        <div className="mt-auto p-3 rounded-2xl hover:bg-white/5 text-slate-500 hover:text-white cursor-pointer transition-all">
                            <span className="material-symbols-outlined text-3xl">settings</span>
                        </div>
                    </aside>
                )}

                {/* Center: Main Viewport */}
                <main className="flex-1 p-6 md:p-10 overflow-y-auto pb-20 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {renderMainContent()}
                </main>

                {/* Right: Status Panel (Collapsible on mobile) */}
                {!isZenMode && (
                    <aside className="w-80 hidden xl:flex flex-col gap-6 p-6 border-l border-white/5 bg-[#020410]/30 backdrop-blur-md sticky top-[100px] h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide">
                        
                        {/* Profile Summary */}
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-colors shadow-lg">
                            <AstronautAvatar level={5} src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                            <div>
                                <CosmicRankBadge rank="Phi công" />
                                <div className="mt-2"><StardustCurrency amount={1200} /></div>
                            </div>
                        </div>
                        
                        {/* New Daily Mission Widget */}
                        <EcSystem.DailyMissionWidget completedNodes={userNodes.length} />

                        <div className="bg-[#1e293b]/60 backdrop-blur-sm rounded-2xl p-5 border border-white/10 shadow-lg">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-yellow-400">emoji_events</span> Tài sản & Huy hiệu
                            </h4>
                            <AchievementMedalCase />
                        </div>

                        {/* Quick Tools */}
                        <div className="space-y-4">
                            <button onClick={() => setShowCreatorModal(true)} className="group w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 border border-orange-400/20">
                                <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add_circle</span> Tạo mới
                            </button>
                            
                            <div className="bg-[#1e293b]/40 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Cộng đồng</h4>
                                <EcSocial.CosmicEventsFeed />
                            </div>
                        </div>

                        {/* Ambience Control */}
                        <div className="mt-auto">
                            <button 
                                onClick={() => setAmbiencePanelOpen(!ambiencePanelOpen)}
                                className={`w-full py-3 border border-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${ambiencePanelOpen ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined text-lg">equalizer</span> Thiết lập môi trường
                            </button>
                            {ambiencePanelOpen && (
                                <div className="mt-3 bg-[#0f172a] p-4 rounded-xl border border-white/10 animate-fade-in shadow-2xl">
                                    <EcAmbience.RainSoundMixer />
                                </div>
                            )}
                        </div>
                    </aside>
                )}
            </div>

            {/* 3. Global Overlays & Modals */}
            <EcCreation.BigBangCreatorModal isOpen={showCreatorModal} onClose={() => setShowCreatorModal(false)} />
            <EcSystem.PrivacyProtocolModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
            <EcSystem.DockingSuccessToast />
            
            {/* Quick Action FAB */}
            <EcSystem.QuickActionDial onAction={handleQuickAction} />

            {/* NEW: Graph Sync Status Bar */}
            {!isZenMode && (
                <EcSystem.GraphSyncStatus totalNodes={userNodes.length} onSync={handleSyncToGraph} />
            )}

            <EcMedia.ZenModeToggle active={isZenMode} onToggle={() => setIsZenMode(!isZenMode)} />
            
            <EcSocial.SubspaceChatBox isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
            <div className="fixed bottom-6 right-6 z-40 hidden md:block" style={{ right: '80px' }}>
                {!chatOpen && (
                    <button onClick={() => setChatOpen(true)} className="w-14 h-14 bg-cyan-600/80 hover:bg-cyan-500 rounded-full shadow-[0_0_20px_rgba(8,145,178,0.5)] flex items-center justify-center text-white transition-transform hover:scale-110 border border-cyan-400/30">
                        <span className="material-symbols-outlined text-2xl">chat</span>
                    </button>
                )}
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#020617]/90 backdrop-blur-xl border-t border-white/10 flex justify-around p-3 z-50 shadow-2xl">
                <button onClick={() => setViewMode('cards')} className={`flex flex-col items-center gap-1 ${viewMode === 'cards' ? 'text-cyan-400' : 'text-slate-500 hover:text-white'}`}>
                    <span className="material-symbols-outlined text-xl">grid_view</span>
                    <span className="text-[10px] font-bold">Explore</span>
                </button>
                <button onClick={() => setShowCreatorModal(true)} className="flex flex-col items-center gap-1 text-slate-500 hover:text-amber-400 transition-colors">
                    <span className="material-symbols-outlined text-xl">add_circle</span>
                    <span className="text-[10px] font-bold">Create</span>
                </button>
                <button onClick={() => setViewMode('marketplace')} className={`flex flex-col items-center gap-1 ${viewMode === 'marketplace' ? 'text-purple-400' : 'text-slate-500 hover:text-white'}`}>
                    <span className="material-symbols-outlined text-xl">storefront</span>
                    <span className="text-[10px] font-bold">Market</span>
                </button>
                <button onClick={() => setChatOpen(true)} className="flex flex-col items-center gap-1 text-slate-500 hover:text-white">
                    <span className="material-symbols-outlined text-xl">person</span>
                    <span className="text-[10px] font-bold">Me</span>
                </button>
            </div>

        </div>
    );
};

export default React.memo(ExploreCategory);
