
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { KnowledgeNode, AlchemyIntent, Quest, NodeShape, UserCluster, InteractionMode } from '../types';
import { LearningSideToolbar } from './LearningSideToolbar';
import { useAppStore } from '../store/useAppStore';
import { calculateNodeMastery } from '../services/sm2Service';
import { useGamification } from '../contexts/GamificationContext';
import { GuideTrigger } from './GuideSystem';
import { generateAdaptiveSkillTree, generateGraphWalkerRoadmap } from '../services/geminiService';
import { saveUserNodes, getClustersFromBackend, createClusterInBackend, updateClusterInBackend, deleteClusterFromBackend } from '../services/mockBackend';
import { BrandLogo, OceanBackground } from './common/BrandAssets';

// Layout & UI
import { GraphShell, ContextToolbar, ContextButton } from './GraphUI';

const NodeContextMenu: React.FC<{ x: number, y: number, nodeId: string, onClose: () => void, onGenerateRoadmap: () => void }> = ({ x, y, nodeId, onClose, onGenerateRoadmap }) => {
    return (
        <div 
            className="fixed z-[100] bg-[#0f172a]/95 backdrop-blur-md border border-cyan-500/50 rounded-xl p-2 shadow-[0_0_30px_rgba(6,182,212,0.4)] animate-slide-right flex flex-col gap-1 min-w-[220px]"
            style={{ left: x, top: Math.min(y, window.innerHeight - 150) }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/10 mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">auto_awesome</span> Tác vụ thông minh
            </div>
            <button 
                onClick={onGenerateRoadmap}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cyan-300 font-medium bg-cyan-900/20 hover:bg-cyan-500/30 transition-colors w-full text-left"
            >
                <span className="material-symbols-outlined text-base">explore</span>
                Tạo Lộ trình học (Auto-RAG)
            </button>
            <button 
                onClick={() => onClose()}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/10 transition-colors w-full text-left mt-1"
            >
                <span className="material-symbols-outlined text-base">close</span>
                Đóng Menu
            </button>
        </div>
    );
};

// Graph Sub-Components
import { SmartSearchBar, BreadcrumbTrail, FocusModeToggle, GraphBookmarkList } from './Graph/GraphNavigation';
import { AIChatAssistant } from './Graph/GraphAI';
import { LiveTeamPulse, ChangeLogDiff, ShareExportModal } from './Graph/GraphCollaboration';
import { KeyboardShortcutsModal, NotificationCenter, GraphBackgroundGrid } from './Graph/GraphSettings';

// NEW VISUAL COMPONENTS
import { RPGOverlay, DailyStreakFlame, AchievementPopup, QuestLog } from './Graph/GraphGamification';
import { LayerStackController, ZoneFencingTool, BackgroundMapSelector, Layer, ZoneActionModal } from './Graph/GraphSpatial';
import { OmniMenu } from './Graph/OmniMenu'; 
import { UnifiedControlPanel } from './Graph/UnifiedControlPanel';
import { TemplateGalleryModal } from './Graph/GraphCommunity';
import { NodeRevision } from './Graph/NodeRevision'; 

// Imports for Global Interaction Layer
import { VoiceCommandListener, DragDropZone, ZenAudioPlayer } from './Graph/GraphInteractions';
import { SnapToGridToggle } from './Graph/GraphQoL';

// Media & Analytics Integrations
import { GraphStatisticsDashboard, HeatmapOverlay, ClusterBoundaryRenderer } from './Graph/GraphAnalytics';
import { MacroRecorder } from './Graph/GraphScripting';

// Imports
import { FlashcardModeView, QuizGeneratorPanel } from './Graph/GraphLearning';
import { OfflineModeIndicator } from './Graph/GraphSecurity';

// --- NEW IMPORTS FOR EXPANSION & NOTE TAKING ---
import { ExpandNode } from './alchemy/ExpandNode';
import { NodeTakingNote } from './Graph/NodeTakingNote';
import { ChangeNodeStyle } from './ChangeNodeStyle';
import { FeatureWindowControls } from './FeatureWindowControls';
import { DroppableZone } from './DroppableZone';
import { useDndActionStore } from '../stores/dndActionStore';
import { GraphAlchemyFlashcardViewer } from './GraphAlchemyFlashcardViewer';

interface ExploreGraphProps {
    onBack: () => void;
    onShowAbout: () => void;
    onSearch?: () => void;
    onCategory?: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    userNodes?: KnowledgeNode[];
    onNodeClick?: (node: KnowledgeNode) => void;
    onOpenNode?: (node: KnowledgeNode) => void;
    onAddNode?: (node: KnowledgeNode) => void;
    onStartPlaylist?: (nodes: KnowledgeNode[]) => void;
    onMergeNodes?: (nodes: KnowledgeNode[]) => void;
    onDeleteNodes?: (nodes: KnowledgeNode[]) => void;
    activeFilter?: string | null;
    onClearFilter?: () => void;
    onExpandNode?: (title: string) => void;
    onAskTutor?: (node: KnowledgeNode) => void;
    focusedNodeId?: string | null;
    onNavigateToAlchemy?: (intent: AlchemyIntent) => void;
    onNavigateToFeature?: (feature: string, params?: any) => void;
    quests?: Quest[]; 
    userXP?: number;
    userLevel?: number;
    currentAchievement?: { title: string, desc: string } | null;
    onClaimReward?: (quest: Quest) => void;
    onCloseAchievement?: () => void;
    onGainXP?: (amount: number, reason: string) => void;
    onRegisterQuest?: (quest: Quest) => void;
    onAddTask?: (content: string, desc: string, priority: 1|2|3|4, dueDate: string|null) => void;
    onGoToFeatures?: () => void;
    onToggleTodo?: () => void;
    intent?: any; 
    onClearIntent?: () => void; 
    onUpdateGraph?: (nodes: KnowledgeNode[]) => void;
    userClusters?: UserCluster[];
    // Special prop for KnowledgeGraph variant in App.tsx
    onExplore?: () => void;
    onDeleteNode?: (node: KnowledgeNode) => void;
}

const SignalWidget: React.FC<{ intent: any, onAccept: () => void, onDiscard: () => void }> = ({ intent, onAccept, onDiscard }) => {
    if (!intent) return null;
    return (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] border border-cyan-500/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-bounce-in max-w-md w-full">
            <div className="flex items-center gap-3 mb-3 text-cyan-400">
                <span className="material-symbols-outlined animate-pulse text-2xl">satellite_alt</span>
                <h4 className="text-sm font-bold uppercase tracking-wider">Tín hiệu Liên Kết Thần Kinh</h4>
            </div>
            <p className="text-slate-300 text-sm mb-4 line-clamp-3"><strong className="block text-white mb-1">{intent.label}</strong>{intent.data}</p>
            <div className="flex gap-2"><button onClick={onDiscard} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-xs font-bold">Hủy</button><button onClick={onAccept} className="flex-[2] py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg animate-pulse flex items-center justify-center gap-2"><span className="material-symbols-outlined text-sm">add_circle</span>Thêm vào Mạng Lưới</button></div>
        </div>
    );
};

const ClusterEditModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (label: string, color: string) => void; onDelete: () => void; initialLabel: string; initialColor: string; }> = ({ isOpen, onClose, onSave, onDelete, initialLabel, initialColor }) => {
    const [label, setLabel] = useState(initialLabel);
    const [color, setColor] = useState(initialColor);
    useEffect(() => { if(isOpen) { setLabel(initialLabel); setColor(initialColor); } }, [isOpen, initialLabel, initialColor]);
    if (!isOpen) return null;
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-[#1e1e1e] border border-white/20 rounded-xl p-6 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-white font-bold mb-4">Cấu hình Nhóm Khái Niệm</h3>
                <div className="space-y-4">
                    <div><label className="text-xs text-slate-400 block mb-1">Tên Nhóm Khái Niệm</label><input value={label} onChange={e => setLabel(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none" placeholder="VD: Cụm React..." autoFocus /></div>
                    <div><label className="text-xs text-slate-400 block mb-1">Màu nền</label><div className="flex gap-2 flex-wrap">{colors.map(c => (<button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />))}</div></div>
                    <div className="flex gap-2 pt-2"><button onClick={onDelete} className="flex-1 py-2 text-xs font-bold text-red-400 hover:bg-red-900/20 rounded border border-transparent hover:border-red-500/30">Xóa</button><button onClick={() => onSave(label, color)} className="flex-[2] py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded shadow-lg">Lưu</button></div>
                </div>
            </div>
        </div>
    );
};

const ExploreGraph: React.FC<ExploreGraphProps> = ({ 
    onBack, onShowAbout, onSearch, onCategory, onLogout, onShowFAQ, onShowAccount, 
    userNodes = [], onNodeClick, onOpenNode, onAddNode, onDeleteNodes, 
    activeFilter, onClearFilter, focusedNodeId, onNavigateToAlchemy, onNavigateToFeature,
    quests = [], userXP = 0, userLevel = 1, currentAchievement, onClaimReward, onCloseAchievement,
    onGainXP, onRegisterQuest, onAddTask, onGoToFeatures, onToggleTodo, intent, onClearIntent, onUpdateGraph,
    onMergeNodes, onStartPlaylist, onExplore, onDeleteNode, userClusters: sharedClusters
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const nodesRef = useRef<any[]>([]);
    const [nodes, setNodes] = useState<any[]>([]);
    const [userClusters, setUserClusters] = useState<UserCluster[]>([]);
    const clustersRef = useRef<UserCluster[]>([]); 
    const [isLinkingMode, setIsLinkingMode] = useState(false);
    const linkingPathRef = useRef<any[]>([]);
    const linkModeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [editingClusterId, setEditingClusterId] = useState<string | null>(null);
    const transformRef = useRef({ x: 0, y: 0, k: 1 });
    const [transformState, setTransformState] = useState({ x: 0, y: 0, k: 1 });
    const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
    const lastMousePos = useRef({ x: 0, y: 0 }); 
    const mousePosRef = useRef({ x: 0, y: 0 }); 
    const [draggedNode, setDraggedNode] = useState<string | null>(null);
    const isNodeMovedRef = useRef(false);
    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPressRef = useRef(false);
    const clickStartPosRef = useRef({ x: 0, y: 0 });
    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const hoveredNodeIdRef = useRef<string | null>(null);
    const [contextMenuPos, setContextMenuPos] = useState<{x: number, y: number, nodeId: string} | null>(null);
    const [isGeneratingNote, setIsGeneratingNote] = useState(false);
    const [isGeneratingWalker, setIsGeneratingWalker] = useState(false);
    const [showExpandModal, setShowExpandModal] = useState(false);
    const [expandingNode, setExpandingNode] = useState<KnowledgeNode | null>(null);
    const [showStyleModal, setShowStyleModal] = useState(false);
    const [stylingNode, setStylingNode] = useState<KnowledgeNode | null>(null);
    const [showNoteTakingModal, setShowNoteTakingModal] = useState(false);
    const [activeNodeForNote, setActiveNodeForNote] = useState<KnowledgeNode | null>(null);
    const [layers, setLayers] = useState<Layer[]>([
        { id: 'default', name: 'Default Nodes', visible: true, locked: false, opacity: 1, blendMode: 'normal', type: 'group', nodeIds: [] },
        { id: 'notes', name: 'Sticky Notes', visible: true, locked: false, opacity: 1, blendMode: 'normal', type: 'group' },
        { id: 'connections', name: 'Link Matrix', visible: true, locked: true, opacity: 0.5, blendMode: 'overlay', type: 'vector' },
        { id: 'bg', name: 'Starfield', visible: true, locked: true, opacity: 0.8, blendMode: 'screen', type: 'raster' }
    ]);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showControlPanel, setShowControlPanel] = useState(false);
    const [activePanelTab, setActivePanelTab] = useState<'DATA' | 'VISUAL'>('VISUAL');
    const [showQuestLog, setShowQuestLog] = useState(false);
    const [zenMode, setZenMode] = useState(false);
    const [focusMode, setFocusMode] = useState(false);
    const [snapToGrid, setSnapToGrid] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [showClusterBoundaries, setShowClusterBoundaries] = useState(true);
    const [showBookmarks, setShowBookmarks] = useState(false);
    const [showFlashcardMode, setShowFlashcardMode] = useState(false);
    const [activeFlashcardNode, setActiveFlashcardNode] = useState<KnowledgeNode | null>(null);
    const [showQuizGen, setShowQuizGen] = useState(false);
    const [zoneToolActive, setZoneToolActive] = useState(false);
    const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, currentX: number, currentY: number } | null>(null);
    const [showZoneActionModal, setShowZoneActionModal] = useState(false);
    const [zoneSelectedNodes, setZoneSelectedNodes] = useState<any[]>([]);
    const [showStats, setShowStats] = useState(false);
    const [showAIChat, setShowAIChat] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const { isRankedMode, toggleRankedMode } = useGamification();
    const { interactionMode, setInteractionMode } = useAppStore();

    // Sync Global Interaction Mode
    useEffect(() => {
        if (interactionMode === 'linking') {
            setIsLinkingMode(true);
            setZoneToolActive(false);
        } else if (interactionMode === 'clustering') {
            setIsLinkingMode(false);
            setZoneToolActive(true);
        } else if (interactionMode === 'expanding') {
            setIsLinkingMode(false);
            setZoneToolActive(false);
            if (selectedNodeIds.size === 1) {
                const nodeId = Array.from(selectedNodeIds)[0];
                const node = nodesRef.current.find(n => n.id === nodeId);
                if (node) {
                    setExpandingNode(node);
                    setShowExpandModal(true);
                }
            }
        } else {
            setIsLinkingMode(false);
            setZoneToolActive(false);
        }
    }, [interactionMode, selectedNodeIds]);

    useEffect(() => { 
        if (sharedClusters) {
            setUserClusters(sharedClusters);
            return;
        }
        const loadClusters = async () => { 
            const data = await getClustersFromBackend(); 
            setUserClusters(data); 
        }; 
        loadClusters(); 
    }, [sharedClusters]);
    useEffect(() => { clustersRef.current = userClusters; }, [userClusters]);

    const handleExit = () => { if (onUpdateGraph) onUpdateGraph(nodesRef.current); onBack(); };

    const fitViewToNodes = () => {
        if (!containerRef.current || nodesRef.current.length === 0) return;
        
        const containerW = containerRef.current.clientWidth;
        const containerH = containerRef.current.clientHeight;

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        nodesRef.current.forEach(node => {
            if (node.x < minX) minX = node.x;
            if (node.x > maxX) maxX = node.x;
            if (node.y < minY) minY = node.y;
            if (node.y > maxY) maxY = node.y;
        });

        if (maxX === minX) { maxX += 100; minX -= 100; }
        if (maxY === minY) { maxY += 100; minY -= 100; }

        const padding = 200; 
        const graphWidth = maxX - minX + padding * 2;
        const graphHeight = maxY - minY + padding * 2;
        
        let targetScale = Math.min(containerW / graphWidth, containerH / graphHeight);
        targetScale = Math.min(Math.max(targetScale, 0.4), 1.5);

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        const newTransform = {
            x: containerW / 2 - centerX * targetScale,
            y: containerH / 2 - centerY * targetScale,
            k: targetScale
        };

        transformRef.current = newTransform;
        setTransformState(newTransform); 
    };

    const handleCreateNoteFromNode = async (node: KnowledgeNode) => {
        setActiveNodeForNote(node);
        setShowNoteTakingModal(true);
    };
    
    const handleSaveNoteToNoteLab = (title: string, content: string) => {
        if (onNavigateToFeature) {
            onNavigateToFeature('note', { label: title, data: content });
        }
        setShowNoteTakingModal(false);
        setActiveNodeForNote(null);
    };

    const handleGenerateRoadmap = async (node: KnowledgeNode) => {
        setIsGeneratingWalker(true);
        try {
            const neighborIds = node.connectedNodeIds || [];
            const neighbors = nodesRef.current.filter(n => neighborIds.includes(n.id) || n.parentNodeId === node.id || n.id === node.parentNodeId);
            const targetNodeStr = `[${node.id}] ${node.title} - ${node.data?.summary || ''}`;
            const neighborStr = neighbors.map(n => `[${n.id}] ${n.title} - ${n.data?.summary || ''}`).join('\n');

            const roadmap = await generateGraphWalkerRoadmap(targetNodeStr, neighborStr);
            if (roadmap && roadmap.length > 0 && onRegisterQuest) {
                const newQuest: Quest = {
                    id: Date.now().toString(),
                    title: `Lộ trình RAG: ${node.title}`,
                    type: 'LearningPath',
                    progress: 0,
                    total: roadmap.length,
                    reward: '1500 XP',
                    completed: false,
                    description: roadmap.map((r: any) => `- Bước ${r.step}: ${r.title}\n  Lý do: ${r.rationale}`).join('\n\n'),
                    targetNodeIds: roadmap.map((r: any) => r.nodeId).filter(Boolean)
                };
                onRegisterQuest(newQuest);
                setShowQuestLog(true);
            } else {
                alert("RAG không tìm thấy đủ dữ liệu trong mạng lưới để lập lộ trình.");
            }
        } catch(e) {
            alert("Lỗi khi tạo lộ trình Graph-Walker.");
        } finally {
            setIsGeneratingWalker(false);
        }
    };

    const handleSaveLayout = () => {
        if (nodesRef.current.length > 0) {
            if (onUpdateGraph) onUpdateGraph(nodesRef.current);
            alert("Đã lưu cấu trúc Mạng Lưới!");
        }
    };
    
    const handleSaveExpansion = (newNodeData: KnowledgeNode, parentId: string) => {
        const parentNode = nodesRef.current.find(n => n.id === parentId);
        const parentX = parentNode ? parentNode.x : 0;
        const parentY = parentNode ? parentNode.y : 0;
        const radius = 150; 
        const angle = Math.random() * Math.PI * 2;
        const startX = parentX + Math.cos(angle) * radius;
        const startY = parentY + Math.sin(angle) * radius;

        const newNode: KnowledgeNode = {
            ...newNodeData,
            id: Date.now().toString() + '-' + Math.floor(Math.random() * 1000), 
            x: startX, 
            y: startY,
            vx: 0,
            vy: 0,
            radius: 24, 
            color: '#a5f3fc',
            mastery: 0,
            parentNodeId: parentId,
            tags: newNodeData.tags ? newNodeData.tags : (parentNode?.tags ? [...parentNode.tags, 'Expanded'] : ['Expanded'])
        };
        
        const updatedAllNodes = [...nodesRef.current, newNode];
        nodesRef.current = updatedAllNodes;
        setNodes(updatedAllNodes);

        setLayers(prev => prev.map(l => l.id === 'default' ? { ...l, nodeIds: [...(l.nodeIds || []), newNode.id] } : l));

        if (onUpdateGraph) {
            onUpdateGraph(updatedAllNodes);
        } else if (onAddNode) {
            onAddNode(newNode);
        }

        setSelectedNodeIds(new Set([newNode.id]));
        if (onGainXP) onGainXP(30, "Mở rộng nghiên cứu");
    };

    const handleSaveStyle = (nodeId: string, newColor: string, newShape: NodeShape) => {
        const updatedNodes = nodesRef.current.map(n => 
            n.id === nodeId ? { ...n, color: newColor, shape: newShape } : n
        );
        nodesRef.current = updatedNodes;
        setNodes(updatedNodes);
        if (onUpdateGraph) {
            onUpdateGraph(updatedNodes);
        }
    };

    const setGraphActions = useDndActionStore(state => state.setGraphActions);

    useEffect(() => {
        setGraphActions({
            addNode: (nodeData: any) => {
                const newNode: KnowledgeNode = {
                    id: Date.now().toString(),
                    title: nodeData.title || "New Node",
                    type: 'Flashcard',
                    status: 'new',
                    tags: ['Imported'],
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 300,
                    timestamp: new Date(),
                    data: { summary: nodeData.content || nodeData.image || "" }
                };
                if (onAddNode) onAddNode(newNode);
                else {
                    const updatedNodes = [...nodesRef.current, newNode];
                    nodesRef.current = updatedNodes;
                    setNodes(updatedNodes);
                    if (onUpdateGraph) onUpdateGraph(updatedNodes);
                }
            }
        });
        return () => setGraphActions(null);
    }, [setGraphActions, onAddNode, onUpdateGraph]);

    const handleAcceptSignal = () => {
        if (!intent) return;
        const title = intent.label || "New Node";
        const summary = intent.data || "";
        const newNode: KnowledgeNode = {
            id: Date.now().toString(),
            title: title,
            type: 'Flashcard',
            status: 'new',
            tags: ['AI Generated'],
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 300,
            timestamp: new Date(),
            data: { summary: summary }
        };
        if (onAddNode) onAddNode(newNode);
        else if (onNavigateToAlchemy) onNavigateToAlchemy({ type: 'create', initialQuery: intent.data });
        if (onClearIntent) onClearIntent();
    };

    const breadcrumbPath = useMemo(() => {
        const path: { label: string; onClick?: () => void; active?: boolean }[] = [{ 
            label: 'Graph', 
            onClick: () => { 
                onClearFilter && onClearFilter(); 
                setSelectedNodeIds(new Set());
            }
        }];
        if (activeFilter) { path.push({ label: activeFilter, onClick: () => {}, active: selectedNodeIds.size === 0 }); }
        if (selectedNodeIds.size === 1) {
            const nodeId = Array.from(selectedNodeIds)[0];
            const node = userNodes.find(n => n.id === nodeId);
            if (node) { path.push({ label: node.title, active: true }); }
        }
        return path;
    }, [activeFilter, selectedNodeIds, userNodes]);

    const bubblesRef = useRef<{x: number, y: number, size: number, opacity: number, speed: number}[]>([]);
    useEffect(() => {
        bubblesRef.current = Array.from({ length: 150 }).map(() => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight + 100,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.4 + 0.1,
            speed: Math.random() * 0.2 + 0.05
        }));
    }, []);

    const handleDoubleClick = (e: React.MouseEvent) => {
        const worldPos = toWorld(e.clientX, e.clientY);
        const clickedNode = [...nodesRef.current].reverse().find(node => {
            const dx = node.x - worldPos.x;
            const dy = node.y - worldPos.y;
            return Math.sqrt(dx*dx + dy*dy) < (node.radius || 24) + 15; // Increased hitbox padding
        });

        if (clickedNode) {
            setIsDraggingCanvas(false); 
            setDraggedNode(null);

            // Double left click to open flashcards inside Alchemy
            handleFocusNode(clickedNode.id);
            setActiveFlashcardNode(clickedNode);
            setShowFlashcardMode(true);

            if (onOpenNode) {
                // Keep the original hook if the parent relies on node focus events
                onOpenNode(clickedNode);
            }
        }
    };

    const handleGlobalMouseUp = async () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }

        if (linkModeTimerRef.current) {
            clearTimeout(linkModeTimerRef.current);
            linkModeTimerRef.current = null;
        }

        if (isLinkingMode) {
            setIsLinkingMode(false);
            const pathNodes = linkingPathRef.current;
            if (pathNodes.length >= 3) {
                const newClusterPayload = {
                    label: "Nhóm Khái Niệm Mới",
                    color: "#3b82f6",
                    nodeIds: pathNodes.map(n => n.id)
                };
                
                const saved = await createClusterInBackend(newClusterPayload);
                
                if (saved) {
                    setUserClusters(prev => [...prev, saved]);
                    setEditingClusterId(saved.id);
                }
            }
            linkingPathRef.current = [];
        }
        
        if (draggedNode && isNodeMovedRef.current) {
             setNodes([...nodesRef.current]); 
        }
        
        setIsDraggingCanvas(false);
        setDraggedNode(null);
        isNodeMovedRef.current = false;
        isLongPressRef.current = false;
        
        setTransformState(transformRef.current);
    };

    useEffect(() => {
        const handleGlobalClick = () => {
            if(contextMenuPos) setContextMenuPos(null);
        }
        window.addEventListener('mouseup', handleGlobalMouseUp);
        window.addEventListener('click', handleGlobalClick);
        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            window.removeEventListener('click', handleGlobalClick);
        };
    }, [contextMenuPos, draggedNode, isLinkingMode]); 

    useEffect(() => {
        const newNodes = userNodes.map((n, idx) => {
            const existing = nodesRef.current.find(p => p.id === n.id);
            const mastery = calculateNodeMastery(n);
            const animPhase = Math.random() * Math.PI * 2; 
            
            return {
                ...n,
                x: existing ? existing.x : (n.x !== undefined ? n.x : (Math.random() - 0.5) * 400),
                y: existing ? existing.y : (n.y !== undefined ? n.y : (Math.random() - 0.5) * 400),
                vx: existing ? existing.vx : 0,
                vy: existing ? existing.vy : 0,
                radius: 24 + (n.tags?.length || 0) * 3, 
                color: n.color || getNodeColor(n.type, mastery),
                shape: n.shape || 'circle',
                mastery,
                animPhase
            };
        });
        
        nodesRef.current = newNodes;
        setNodes(newNodes);
        setLayers(prev => prev.map(l => l.id === 'default' ? { ...l, nodeIds: newNodes.map(n => n.id) } : l));
        
        if (newNodes.length > 0 && transformRef.current.k === 1) {
             const timer = setTimeout(() => fitViewToNodes(), 200);
             return () => clearTimeout(timer);
        }

    }, [userNodes]); 

    const handleFocusNode = (nodeId: string) => {
        const target = nodesRef.current.find(n => n.id === nodeId);
        if (target && containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            const newT = {
                x: width / 2 - target.x * 1.5,
                y: height / 2 - target.y * 1.5,
                k: 1.5
            };
            transformRef.current = newT;
            setTransformState(newT);
            setSelectedNodeIds(new Set([nodeId]));
            setFocusMode(true);
        }
    };

    const handleStartRevisionSession = (nodesToLearn: KnowledgeNode[]) => {
        if (nodesToLearn.length > 0 && onStartPlaylist) {
             onStartPlaylist(nodesToLearn);
        }
    };

    useEffect(() => {
        if (focusedNodeId && nodesRef.current.length > 0 && containerRef.current) {
            const target = nodesRef.current.find(n => n.id === focusedNodeId);
            if (target) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                const newT = {
                    x: width / 2 - target.x * 1.5,
                    y: height / 2 - target.y * 1.5,
                    k: 1.5
                };
                transformRef.current = newT;
                setTransformState(newT);
                setSelectedNodeIds(new Set([focusedNodeId]));
                setFocusMode(true); 
            }
        }
    }, [focusedNodeId]); 

    const getNodeColor = (type: string, mastery: number) => {
        if (mastery >= 80) return '#FFD700'; 
        if (mastery <= 30) return '#FF5555'; 
        switch(type) {
            case 'Flashcard': return '#4CC9F0'; 
            case 'Quiz': return '#F72585'; 
            case 'Case Study': return '#4361EE'; 
            case 'Fill-in-the-blanks': return '#3F37C9';
            default: return '#e2e8f0'; 
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const screenToWorld = (screenX: number, screenY: number) => {
            const t = transformRef.current;
            const rect = canvasRef.current?.getBoundingClientRect();
            const left = rect ? rect.left : 0;
            const top = rect ? rect.top : 0;
            
            return {
                x: (screenX - left - t.x) / t.k,
                y: (screenY - top - t.y) / t.k
            };
        };

        let animationFrameId: number;
        let time = 0;

        const animate = () => {
            time += 0.02;
            const width = containerRef.current?.clientWidth || window.innerWidth;
            const height = containerRef.current?.clientHeight || window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            const tX = transformRef.current.x;
            const tY = transformRef.current.y;
            const tK = transformRef.current.k;

            ctx.clearRect(0, 0, width, height);
            
            ctx.save();
            const gridSize = 40 * tK;
            const offX = tX % gridSize;
            const offY = tY % gridSize;
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let x = offX; x < width; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
            for (let y = offY; y < height; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
            ctx.stroke();
            ctx.restore();

            bubblesRef.current.forEach(bubble => {
                bubble.y -= bubble.speed;
                if (bubble.y < -50) {
                    bubble.y = height + 50;
                    bubble.x = Math.random() * width;
                }
                const drawX = (bubble.x - tX * 0.05) % width;
                const finalDrawX = drawX < 0 ? drawX + width : drawX;
                
                ctx.globalAlpha = bubble.opacity * (focusMode ? 0.1 : 0.6);
                ctx.beginPath();
                ctx.arc(finalDrawX, bubble.y, bubble.size, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff'; 
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            const hiddenNodeIds = new Set(layers.filter(l => !l.visible).flatMap(l => l.nodeIds || []));
            const currentNodes = nodesRef.current;
            const currentClusters = clustersRef.current;

            ctx.save();
            ctx.translate(tX, tY);
            ctx.scale(tK, tK);
            
            currentClusters.forEach(cluster => {
                const clusterNodes = cluster.nodeIds.map(id => currentNodes.find(n => n.id === id)).filter(Boolean);
                if (clusterNodes.length < 3) return;

                const cx = clusterNodes.reduce((acc, n) => acc + n.x, 0) / clusterNodes.length;
                const cy = clusterNodes.reduce((acc, n) => acc + n.y, 0) / clusterNodes.length;
                cluster.centroid = { x: cx, y: cy };

                ctx.beginPath();
                ctx.moveTo(clusterNodes[0].x, clusterNodes[0].y);
                for (let i = 1; i < clusterNodes.length; i++) {
                    ctx.lineTo(clusterNodes[i].x, clusterNodes[i].y);
                }
                ctx.closePath();

                ctx.fillStyle = cluster.color || '#3b82f6';
                ctx.globalAlpha = 0.15;
                ctx.fill();

                ctx.strokeStyle = cluster.color || '#3b82f6';
                ctx.lineWidth = 2 / tK;
                ctx.globalAlpha = 0.4;
                ctx.stroke();

                if (tK > 0.4) {
                    ctx.globalAlpha = 0.8;
                    ctx.fillStyle = '#fff';
                    ctx.font = `bold ${16/tK}px "Lexend"`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(cluster.label, cx, cy);
                }
            });
            ctx.restore();

            let totalKineticEnergy = 0;
            currentNodes.forEach(node => {
                if (node.id === draggedNode) return;
                if (Math.abs(node.vx) < 0.01 && Math.abs(node.vy) < 0.01) {
                    node.vx = 0; node.vy = 0;
                }
                let fx = 0, fy = 0;
                for (let j = 0; j < currentNodes.length; j++) {
                    const other = currentNodes[j];
                    if (node.id === other.id) continue;
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    if (Math.abs(dx) > 600 || Math.abs(dy) > 600) continue;
                    let distSq = dx * dx + dy * dy;
                    if (distSq < 100) distSq = 100;
                    const force = 5000 / distSq; 
                    const dist = Math.sqrt(distSq);
                    fx += (dx / dist) * force;
                    fy += (dy / dist) * force;
                }
                fx += (0 - node.x) * 0.0003; 
                fy += (0 - node.y) * 0.0003;
                node.vx = (node.vx + fx) * 0.90; 
                node.vy = (node.vy + fy) * 0.90;
                node.x += node.vx; 
                node.y += node.vy;
                totalKineticEnergy += Math.abs(node.vx) + Math.abs(node.vy);
            });

            ctx.save();
            ctx.translate(tX, tY);
            ctx.scale(tK, tK);
            
            currentNodes.forEach((node, i) => {
                if (hiddenNodeIds.has(node.id)) return;
                if (activeFilter && (!node.tags?.includes(activeFilter))) return;
                
                if (node.parentNodeId) {
                    const parent = currentNodes.find(n => n.id === node.parentNodeId);
                    if (parent && !hiddenNodeIds.has(parent.id)) {
                        drawLink(ctx, node, parent, tK, time, false);
                    }
                }
                
                if (node.connectedNodeIds) {
                    node.connectedNodeIds.forEach((targetId: string) => {
                         const target = currentNodes.find(n => n.id === targetId);
                         if (target && !hiddenNodeIds.has(target.id)) {
                             if (node.id > target.id) drawLink(ctx, node, target, tK, time, false);
                         }
                    });
                }
            });
            
            function drawLink(ctx: CanvasRenderingContext2D, n1: any, n2: any, scale: number, t: number, highlighted: boolean) {
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
                ctx.strokeStyle = highlighted ? '#22d3ee' : 'rgba(34, 211, 238, 0.2)';
                ctx.lineWidth = (highlighted ? 2 : 1) / scale;
                ctx.stroke();
            }

            currentNodes.forEach(node => {
                if (hiddenNodeIds.has(node.id)) return;
                if (activeFilter && (!node.tags?.includes(activeFilter))) return;
                
                const isSelected = selectedNodeIds.has(node.id);
                const isHovered = hoveredNodeIdRef.current === node.id;

                const sx = node.x * tK + tX;
                const sy = node.y * tK + tY;
                if (sx < -50 || sy < -50 || sx > width + 50 || sy > height + 50) return;

                const radius = node.radius || 24;
                ctx.beginPath();
                if (node.shape === 'square') ctx.rect(node.x - radius, node.y - radius, radius * 2, radius * 2);
                else ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
                
                ctx.fillStyle = node.color;
                
                if (tK > 0.5 || isSelected) {
                    ctx.shadowBlur = isSelected ? 20 : 10;
                    ctx.shadowColor = node.color;
                } else {
                    ctx.shadowBlur = 0;
                }
                
                ctx.fill();
                ctx.shadowBlur = 0; 

                if (isSelected || isHovered) {
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 3 / tK;
                    ctx.stroke();
                }

                if (tK > 0.6 || isSelected || isHovered) {
                    ctx.font = `bold ${14/tK}px "Lexend"`;
                    const metrics = ctx.measureText(node.title);
                    const labelY = node.y + radius + (20/tK);
                    
                    ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    ctx.beginPath();
                    const pad = 4/tK;
                    ctx.rect(node.x - metrics.width/2 - pad, labelY - 10/tK - pad, metrics.width + pad*2, 20/tK);
                    ctx.fill();

                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(node.title, node.x, labelY);
                }
            });

            if (isLinkingMode && linkingPathRef.current.length > 0) {
                const pathNodes = linkingPathRef.current;
                
                ctx.beginPath();
                ctx.moveTo(pathNodes[0].x, pathNodes[0].y);
                for (let i = 1; i < pathNodes.length; i++) {
                    ctx.lineTo(pathNodes[i].x, pathNodes[i].y);
                }
                const mouseWorld = screenToWorld(mousePosRef.current.x, mousePosRef.current.y);
                ctx.lineTo(mouseWorld.x, mouseWorld.y);
                
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 3 / tK;
                ctx.setLineDash([10 / tK, 10 / tK]);
                ctx.stroke();
                ctx.setLineDash([]);

                pathNodes.forEach(node => {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, (node.radius || 24) + 5/tK, 0, Math.PI * 2);
                    ctx.strokeStyle = '#facc15';
                    ctx.lineWidth = 2 / tK;
                    ctx.stroke();
                });
            }

            ctx.restore();

             if (zoneToolActive && selectionBox) {
                const { startX, startY, currentX, currentY } = selectionBox;
                ctx.save();
                ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 4]);
                ctx.fillStyle = 'rgba(6, 182, 212, 0.15)'; 
                const w = currentX - startX;
                const h = currentY - startY;
                ctx.fillRect(startX, startY, w, h);
                ctx.strokeRect(startX, startY, w, h);
                ctx.restore();
            }

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }, [draggedNode, selectedNodeIds, activeFilter, zoneToolActive, selectionBox, layers, focusMode, isLinkingMode]); 

    const toWorld = (screenX: number, screenY: number) => {
        const t = transformRef.current;
        const rect = canvasRef.current?.getBoundingClientRect();
        const left = rect ? rect.left : 0;
        const top = rect ? rect.top : 0;
        
        return {
            x: (screenX - left - t.x) / t.k,
            y: (screenY - top - t.y) / t.k
        };
    };

    const isPointInPolygon = (p: {x: number, y: number}, polygon: {x: number, y: number}[]) => {
        let isInside = false;
        let minX = polygon[0].x, maxX = polygon[0].x;
        let minY = polygon[0].y, maxY = polygon[0].y;
        for (let n = 1; n < polygon.length; n++) {
            const q = polygon[n];
            minX = Math.min(q.x, minX);
            maxX = Math.max(q.x, maxX);
            minY = Math.min(q.y, minY);
            maxY = Math.max(q.y, maxY);
        }

        if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
            return false;
        }

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            if ( (polygon[i].y > p.y) !== (polygon[j].y > p.y) &&
                    p.x < (polygon[j].x - polygon[i].x) * (p.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x ) {
                isInside = !isInside;
            }
        }
        return isInside;
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const worldPos = toWorld(e.clientX, e.clientY);
        clickStartPosRef.current = { x: e.clientX, y: e.clientY };
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        isLongPressRef.current = false;
        
        if (e.button === 2) { 
             const clickedNode = [...nodesRef.current].reverse().find(node => {
                const dx = node.x - worldPos.x;
                const dy = node.y - worldPos.y;
                return Math.sqrt(dx*dx + dy*dy) < (node.radius || 24) + 5;
            });
            if (clickedNode) {
                setContextMenuPos({ x: e.clientX, y: e.clientY, nodeId: clickedNode.id });
                setSelectedNodeIds(new Set([clickedNode.id]));
            }
            return;
        }

        if (zoneToolActive) {
            setSelectionBox({ startX: e.clientX, startY: e.clientY, currentX: e.clientX, currentY: e.clientY });
            return;
        }

        const clickedNode = [...nodesRef.current].reverse().find(node => {
            const dx = node.x - worldPos.x;
            const dy = node.y - worldPos.y;
            return Math.sqrt(dx*dx + dy*dy) < (node.radius || 24) + 10; 
        });

        if (clickedNode) {
            setDraggedNode(clickedNode.id);
            isNodeMovedRef.current = false;
            
            linkModeTimerRef.current = setTimeout(() => {
                setIsLinkingMode(true);
                linkingPathRef.current = [clickedNode];
                document.body.style.cursor = 'crosshair';
            }, 2000); 

            // INSTANT SELECT (Gỡ delay 500ms phiền phức)
            if (!e.ctrlKey) {
                setSelectedNodeIds(new Set([clickedNode.id]));
            } else {
                const newSet = new Set(selectedNodeIds);
                newSet.has(clickedNode.id) ? newSet.delete(clickedNode.id) : newSet.add(clickedNode.id);
                setSelectedNodeIds(newSet);
            }

        } else {
            const clickedCluster = userClusters.find(c => {
                 const clusterNodes = c.nodeIds.map(id => nodesRef.current.find(n => n.id === id)).filter(Boolean);
                 if (clusterNodes.length < 3) return false;
                 return isPointInPolygon(worldPos, clusterNodes.map(n => ({x: n.x, y: n.y})));
            });

            if (clickedCluster) {
                setEditingClusterId(clickedCluster.id);
            } else {
                setIsDraggingCanvas(true);
                document.body.style.cursor = 'grabbing';
                if(!e.ctrlKey) {
                    setSelectedNodeIds(new Set());
                    setFocusMode(false);
                }
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const worldPos = toWorld(e.clientX, e.clientY);
        mousePosRef.current = { x: e.clientX, y: e.clientY };

        const moveDist = Math.hypot(e.clientX - clickStartPosRef.current.x, e.clientY - clickStartPosRef.current.y);

        if (moveDist > 5) {
            if (!isLinkingMode && linkModeTimerRef.current) {
                 clearTimeout(linkModeTimerRef.current);
                 linkModeTimerRef.current = null;
            }
            if (!isLinkingMode && longPressTimerRef.current) {
                 clearTimeout(longPressTimerRef.current);
                 longPressTimerRef.current = null;
            }
        }

        if (zoneToolActive && selectionBox) {
            setSelectionBox(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null);
            return;
        }

        if (!isDraggingCanvas && !draggedNode && !isLinkingMode) {
            const hovered = [...nodesRef.current].reverse().find(node => {
                const dx = node.x - worldPos.x;
                const dy = node.y - worldPos.y;
                return Math.sqrt(dx*dx + dy*dy) < (node.radius || 24) + 5;
            });
            
            const newId = hovered ? hovered.id : null;
            if (newId !== hoveredNodeIdRef.current) {
                hoveredNodeIdRef.current = newId;
                setHoveredNodeId(newId); 
            }
        }

        if (isLinkingMode) {
            const hovered = nodesRef.current.find(node => {
                const dx = node.x - worldPos.x;
                const dy = node.y - worldPos.y;
                return Math.sqrt(dx*dx + dy*dy) < (node.radius || 24) + 15;
            });

            if (hovered) {
                const currentPath = linkingPathRef.current;
                if (!currentPath.find(n => n.id === hovered.id)) {
                    linkingPathRef.current = [...currentPath, hovered];
                }
            }
        }
        
        else if (isDraggingCanvas) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            
            transformRef.current = {
                ...transformRef.current,
                x: transformRef.current.x + dx,
                y: transformRef.current.y + dy
            };
            
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            
        } else if (draggedNode) {
            isNodeMovedRef.current = true;
            const node = nodesRef.current.find(n => n.id === draggedNode);
            if (node) {
                node.x = worldPos.x;
                node.y = worldPos.y;
                node.vx = 0;
                node.vy = 0;
            }
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const t = transformRef.current;
        const zoomSensitivity = 0.001;
        const delta = -e.deltaY * zoomSensitivity;
        const scaleAmount = Math.exp(delta);
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const worldX = (mouseX - t.x) / t.k;
        const worldY = (mouseY - t.y) / t.k;
        
        const newK = Math.min(Math.max(0.1, t.k * scaleAmount), 5);
        const newX = mouseX - worldX * newK;
        const newY = mouseY - worldY * newK;

        transformRef.current = { x: newX, y: newY, k: newK };
    };

    const handleZoomIn = () => {
        const t = transformRef.current;
        const newK = Math.min(t.k * 1.2, 5);
        const rect = containerRef.current?.getBoundingClientRect();
        const cx = rect ? rect.width/2 : 0;
        const cy = rect ? rect.height/2 : 0;
        const wx = (cx - t.x) / t.k;
        const wy = (cy - t.y) / t.k;
        const newT = { x: cx - wx * newK, y: cy - wy * newK, k: newK };
        transformRef.current = newT;
        setTransformState(newT);
    };

    const handleZoomOut = () => {
        const t = transformRef.current;
        const newK = Math.max(t.k / 1.2, 0.1);
        const rect = containerRef.current?.getBoundingClientRect();
        const cx = rect ? rect.width/2 : 0;
        const cy = rect ? rect.height/2 : 0;
        const wx = (cx - t.x) / t.k;
        const wy = (cy - t.y) / t.k;
        const newT = { x: cx - wx * newK, y: cy - wy * newK, k: newK };
        transformRef.current = newT;
        setTransformState(newT);
    };
    
    const handleFitView = () => {
        fitViewToNodes();
    };

    const selectedNodesData = userNodes.filter(n => selectedNodeIds.has(n.id));
    const singleSelectedNode = selectedNodesData.length === 1 ? selectedNodesData[0] : null;

    const handleTriggerAlchemy = (intentType: 'create' | 'expand' | 'refine' | 'connect' | 'visualize' | 'quiz' | 'repair' | 'search_create' | 'style_transfer' | 'edit') => {
        if (intentType === 'style_transfer') {
             if (singleSelectedNode) {
                 setStylingNode(singleSelectedNode);
                 setShowStyleModal(true);
             }
             return;
        }
        if (onNavigateToAlchemy) {
            if (intentType === 'edit') {
                 if (singleSelectedNode) {
                    onNavigateToAlchemy({
                        type: 'edit',
                        targetNodeId: singleSelectedNode.id
                    });
                 }
            } else {
                onNavigateToAlchemy({
                    type: intentType,
                    sourceNodes: selectedNodesData
                });
            }
        }
    };
    
    const handleOpenPanel = (tab: any) => {
        setActivePanelTab(tab);
        setShowControlPanel(true);
    }
    
    const handleZoneAction = (action: 'LAYER' | 'QUEST' | 'KANBAN' | 'MATRIX', name: string, priority: number = 1) => {
        setShowZoneActionModal(false);
        if (action === 'LAYER') {
            const newLayer: Layer = {
                id: Date.now().toString(),
                name: name,
                visible: true,
                locked: false,
                opacity: 1,
                blendMode: 'normal',
                type: 'selection',
                nodeIds: zoneSelectedNodes.map(n => n.id)
            };
            setLayers(prev => [newLayer, ...prev]);
            alert(`Đã khởi tạo lớp dữ liệu: ${name}`);
        } else if (action === 'QUEST') {
            if (onRegisterQuest) {
                const newQuest: Quest = {
                    id: Date.now().toString(),
                    title: name,
                    type: 'LearningPath',
                    progress: 0,
                    total: zoneSelectedNodes.length,
                    reward: '300 XP',
                    completed: false,
                    description: `Hoàn thành các khái niệm trong vùng đã chọn.`,
                    targetNodeIds: zoneSelectedNodes.map(n => n.id)
                };
                onRegisterQuest(newQuest);
                setShowQuestLog(true);
            }
        } else if (action === 'KANBAN' || action === 'MATRIX') {
            if (onAddTask) {
                const desc = `Nodes: ${zoneSelectedNodes.map(n => n.title).join(', ')}`;
                onAddTask(name, desc, priority as any, 'today');
            }
        }
    };

    const handleClusterSave = async (label: string, color: string) => {
        if (editingClusterId) {
            const clusterToUpdate = userClusters.find(c => c.id === editingClusterId);
            if (clusterToUpdate) {
                const updatedCluster = { ...clusterToUpdate, label, color };
                const saved = await updateClusterInBackend(updatedCluster);
                if (saved) {
                     setUserClusters(prev => prev.map(c => c.id === editingClusterId ? saved : c));
                     setEditingClusterId(null);
                }
            }
        }
    };
    
    const handleClusterDelete = async () => {
        if (editingClusterId) {
            const success = await deleteClusterFromBackend(editingClusterId);
            if (success) {
                setUserClusters(prev => prev.filter(c => c.id !== editingClusterId));
                setEditingClusterId(null);
            }
        }
    };

    // --- RENDER ---
    return (
        <DroppableZone id="graph-zone" type="GRAPH" className="w-full h-full">
        <GraphShell>
             <OceanBackground variant="deep" /> {/* Use Unified Background */}
             
             {/* Unified Header */}
             <header className={`absolute top-6 left-1/2 -translate-x-1/2 z-50 px-8 py-3 bg-[#0f172a]/80 backdrop-blur-xl border border-cyan-400/30 rounded-full flex justify-between items-center shadow-[0_0_30px_rgba(0,119,182,0.3)] transition-all duration-500 w-[90%] max-w-6xl pointer-events-auto ${zenMode ? '-translate-y-32 opacity-0' : 'translate-y-0 opacity-100'}`}>
                <div className="flex items-center gap-6">
                    <button onClick={handleExit} className="flex items-center gap-2 text-sky-200 hover:text-white transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                        </div>
                        <span className="font-bold text-sm hidden sm:block">Trở về</span>
                    </button>
                    <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
                    <BrandLogo variant="dark" className="text-white" />
                    <GuideTrigger guideKey="graph" />
                </div>

                <nav className="hidden md:flex items-center gap-6 text-sm text-sky-100/80 font-medium">
                    <button className="hover:text-cyan-300 hover:drop-shadow-[0_0_5px_cyan] transition-all cursor-pointer" onClick={(e) => { e.preventDefault(); if(onGoToFeatures) onGoToFeatures(); }}>Tính năng</button>
                    <button className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${isRankedMode ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-400 shadow-lg shadow-yellow-500/20' : 'bg-transparent border-transparent hover:text-white'}`} onClick={toggleRankedMode}>
                        <span className="material-symbols-outlined text-sm">{isRankedMode ? 'swords' : 'toggle_off'}</span>{isRankedMode ? 'Rank: ON' : 'Rank: OFF'}
                    </button>
                    <button className="hover:text-cyan-300 hover:drop-shadow-[0_0_5px_cyan] transition-all" onClick={() => setShowQuestLog(!showQuestLog)}>Nhiệm vụ</button>
                </nav>

                <div className="flex items-center gap-3">
                    {onToggleTodo && (
                        <button onClick={onToggleTodo} className="p-2 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors" title="Nhiệm vụ"><span className="material-symbols-outlined text-xl">checklist</span></button>
                    )}
                    <NotificationCenter />
                    <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
                    <button onClick={onShowAccount} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-sky-200 hover:text-white transition-colors border border-white/5"><span className="material-symbols-outlined text-xl">person</span></button>
                    <FeatureWindowControls onClose={handleExit} />
                </div>
            </header>
            
            {editingClusterId && (
                <ClusterEditModal 
                    isOpen={!!editingClusterId} 
                    onClose={() => setEditingClusterId(null)}
                    onSave={handleClusterSave}
                    onDelete={handleClusterDelete}
                    initialLabel={userClusters.find(c => c.id === editingClusterId)?.label || ''}
                    initialColor={userClusters.find(c => c.id === editingClusterId)?.color || '#3b82f6'}
                />
            )}

            {isGeneratingNote && (
                 <div className="fixed inset-0 z-[120] bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in">
                    <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
                    <span className="text-xl font-bold text-cyan-400 animate-pulse">AI đang phân tích và tổng hợp ghi chú...</span>
                    <p className="text-sm text-slate-400 mt-2">Dữ liệu từ Mạng Lưới đang được đồng bộ sang NoteLab</p>
                 </div>
            )}

            {isGeneratingWalker && (
                 <div className="fixed inset-0 z-[120] bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in">
                    <div className="w-16 h-16 border-4 border-t-green-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
                    <span className="text-xl font-bold text-green-400 animate-pulse">Graph-Walker đang trích xuất đồ thị...</span>
                    <p className="text-sm text-slate-400 mt-2">Đang tự động thiết kế lộ trình học tập tối ưu từ các phân mảnh</p>
                 </div>
            )}
            
            <OfflineModeIndicator isOffline={!navigator.onLine} />
            
            <NodeRevision 
                nodes={userNodes} 
                onFocusNode={handleFocusNode} 
                onStartSession={handleStartRevisionSession} 
            />

            {intent && (
                <SignalWidget 
                    intent={intent} 
                    onAccept={handleAcceptSignal} 
                    onDiscard={() => onClearIntent && onClearIntent()} 
                />
            )}
            
            {showExpandModal && expandingNode && (
                <ExpandNode 
                    isOpen={showExpandModal}
                    onClose={() => { setShowExpandModal(false); setExpandingNode(null); }}
                    originalNode={expandingNode}
                    onSave={handleSaveExpansion}
                />
            )}

            {showNoteTakingModal && activeNodeForNote && (
                <NodeTakingNote
                    isOpen={showNoteTakingModal}
                    onClose={() => setShowNoteTakingModal(false)}
                    node={activeNodeForNote}
                    onSaveToNoteLab={handleSaveNoteToNoteLab}
                />
            )}
            
            {showStyleModal && stylingNode && (
                <ChangeNodeStyle 
                    isOpen={showStyleModal}
                    onClose={() => { setShowStyleModal(false); setStylingNode(null); }}
                    node={stylingNode}
                    onSave={handleSaveStyle}
                />
            )}

            <div className="absolute inset-0 z-0 pointer-events-none">
                <GraphBackgroundGrid />
                <HeatmapOverlay active={showHeatmap} />
                {showClusterBoundaries && <ClusterBoundaryRenderer />}
            </div>

            <div 
                className="absolute inset-0 z-0 pointer-events-auto" 
                ref={containerRef}
                onContextMenu={(e) => e.preventDefault()} 
            >
                <canvas 
                    ref={canvasRef}
                    className={`block w-full h-full ${zoneToolActive || isLinkingMode ? 'cursor-crosshair' : isDraggingCanvas ? 'cursor-grabbing' : 'cursor-default'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleGlobalMouseUp} 
                    onDoubleClick={handleDoubleClick}
                    onWheel={handleWheel}
                />
            </div>
            
             <div className="pointer-events-none absolute inset-0 z-10">
                 <DragDropZone />
                 <ZenAudioPlayer />
            </div>

            <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ${zenMode ? 'opacity-0' : 'opacity-100'}`}>
                {/* HUD Panel Left */}
                <div className="absolute top-28 left-6 pointer-events-auto flex flex-col gap-4 p-4 bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-72 animate-slide-right transition-all">
                    <div className="border-b border-white/10 pb-3 mb-1"><BreadcrumbTrail path={breadcrumbPath} className="justify-start" /></div>
                    <RPGOverlay level={userLevel} xp={userXP} className="w-full !border-0 !shadow-none !bg-transparent !p-0" />
                    <div className="grid grid-cols-2 gap-2 mt-2"><ZoneFencingTool active={zoneToolActive} onToggle={() => setZoneToolActive(!zoneToolActive)} /><div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-colors"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">grid_view</span><span className="text-xs font-bold">Grid</span></div><SnapToGridToggle active={snapToGrid} onToggle={() => setSnapToGrid(!snapToGrid)} /></div></div>
                    <LayerStackController isOpen={true} layers={layers} setLayers={setLayers} className="!static !w-full !border-white/5 !shadow-none !bg-black/20" />
                    <BackgroundMapSelector onChange={(map) => console.log(map)} className="w-full" />
                    <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-white/5"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Chế độ Tập Trung Nghiên Cứu</span><FocusModeToggle active={focusMode} onToggle={() => setFocusMode(!focusMode)} /></div>
                </div>

                <div className="absolute top-32 left-1/2 -translate-x-1/2 w-full max-w-lg pointer-events-auto z-40">
                     <SmartSearchBar isOpen={showSearch} setIsOpen={setShowSearch} query={searchQuery} setQuery={setSearchQuery} nodes={nodes} onSelect={(node) => { if(containerRef.current) { const { width, height } = containerRef.current.getBoundingClientRect(); const newT = { x: width / 2 - node.x * 1.5, y: height / 2 - node.y * 1.5, k: 1.5 }; transformRef.current = newT; setTransformState(newT); } setSelectedNodeIds(new Set([node.id])); setFocusMode(true); }} onCreate={() => handleTriggerAlchemy('search_create')} />
                     {!showSearch && (
                        <div className="flex items-center gap-2">
                            <div onClick={() => setShowSearch(true)} className={`flex-1 flex items-center px-5 py-3 rounded-full backdrop-blur-xl border cursor-text shadow-lg transition-all group ${focusMode ? 'bg-[#0077b6]/10 border-white/10 opacity-50 hover:opacity-100' : 'bg-[#0077b6]/30 border-sky-400/30 hover:bg-[#0077b6]/50'}`}>
                                <span className="material-symbols-outlined text-sky-200 mr-3 group-hover:text-white">search</span>
                                <span className="text-sky-100/70 font-medium group-hover:text-white">Tra cứu dữ liệu trong mạng lưới...</span>
                            </div>
                            
                            {/* MAIN GRAPH TOOLBAR (FIXED ON LEFT) */}
                            <LearningSideToolbar 
                                activeMode={interactionMode} 
                                onModeChange={setInteractionMode}
                                className="fixed left-6 top-1/2 -translate-y-1/2" 
                            />

                            <VoiceCommandListener />
                        </div>
                     )}
                </div>

                <div className="absolute top-32 right-8 flex flex-col gap-4 items-end pointer-events-auto">
                    <DailyStreakFlame />
                    <GraphBookmarkList isOpen={showBookmarks} />
                </div>

                <div className="pointer-events-auto">
                     <OmniMenu onOpenPanel={handleOpenPanel} onToggleZenMode={() => setZenMode(!zenMode)} onToggleFocusMode={() => setFocusMode(!focusMode)} zenModeActive={zenMode} onCategory={onCategory} />
                </div>

                 <div className="absolute bottom-24 left-8 pointer-events-auto flex flex-col gap-2">
                      <MacroRecorder />
                 </div>

                <div className="absolute bottom-24 right-8 pointer-events-auto flex flex-col gap-2 bg-[#1e1e1e] p-2 rounded-xl border border-white/10 shadow-xl">
                    <button onClick={handleSaveLayout} className="p-2 hover:bg-white/10 rounded text-slate-300" title="Lưu cấu trúc hiện tại"><span className="material-symbols-outlined">save</span></button>
                    <div className="h-px bg-white/10 w-full my-1"></div>
                    <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 rounded text-slate-300" title="Zoom In"><span className="material-symbols-outlined">add</span></button>
                    <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 rounded text-slate-300" title="Zoom Out"><span className="material-symbols-outlined">remove</span></button>
                    <button onClick={handleFitView} className="p-2 hover:bg-white/10 rounded text-slate-300" title="Fit View"><span className="material-symbols-outlined">center_focus_strong</span></button>
                </div>

                {selectedNodesData.length > 0 && !isDraggingCanvas && !zoneToolActive && !contextMenuPos && (
                    <div className="pointer-events-auto">
                        <ContextToolbar 
                            x={nodesRef.current.find(n => n.id === selectedNodesData[0].id)?.x * transformState.k + transformState.x} 
                            y={nodesRef.current.find(n => n.id === selectedNodesData[0].id)?.y * transformState.k + transformState.y}
                        >
                            {selectedNodesData.length === 1 && (
                                <>
                                    <ContextButton icon="edit" onClick={() => handleTriggerAlchemy('edit')} tooltip="Chỉnh sửa (Alchemy)" />
                                    <ContextButton icon="account_tree" onClick={() => { setExpandingNode(selectedNodesData[0]); setShowExpandModal(true); }} tooltip="Phân tích mở rộng (AI)" variant="highlight" />
                                    <ContextButton icon="explore" onClick={() => handleGenerateRoadmap(selectedNodesData[0])} tooltip={isGeneratingWalker ? "Đang phân tích Graph..." : "Tạo Lộ Trình Học RAG (Graph-Walker)"} variant="highlight" />
                                    <ContextButton icon="palette" onClick={() => handleTriggerAlchemy('style_transfer')} tooltip="Đổi Giao Diện" variant="highlight" />
                                    <ContextButton icon="unfold_more" onClick={() => handleTriggerAlchemy('expand')} tooltip="Phân tích chuyên sâu (Alchemy)" />
                                    <ContextButton icon="auto_fix" onClick={() => handleTriggerAlchemy('refine')} tooltip="Tinh chỉnh dữ liệu (Alchemy)" />
                                    <ContextButton icon="image" onClick={() => handleTriggerAlchemy('visualize')} tooltip="Trực quan hóa" />
                                    <ContextButton icon="quiz" onClick={() => handleTriggerAlchemy('quiz')} tooltip="Tạo Bài Kiểm Tra" />
                                    <ContextButton icon="edit_note" onClick={() => handleCreateNoteFromNode(selectedNodesData[0])} tooltip="Tạo ghi chú nghiên cứu (AI)" />
                                    <ContextButton icon="school" onClick={() => { setActiveFlashcardNode(selectedNodesData[0]); setShowFlashcardMode(true); }} tooltip="Ôn tập Flashcard" />
                                    <ContextButton icon="delete" onClick={() => onDeleteNodes && onDeleteNodes(selectedNodesData)} tooltip="Xóa" variant="danger" />
                                </>
                            )}
                            {selectedNodesData.length > 1 && (
                                <>
                                    <ContextButton icon="merge" onClick={() => onMergeNodes && onMergeNodes(selectedNodesData)} tooltip="Hợp nhất Khái Niệm" />
                                    <ContextButton icon="playlist_play" onClick={() => onStartPlaylist && onStartPlaylist(selectedNodesData)} tooltip="Tạo Lộ Trình Học" />
                                    <ContextButton icon="delete" onClick={() => onDeleteNodes && onDeleteNodes(selectedNodesData)} tooltip="Xóa dữ liệu đã chọn" variant="danger" />
                                </>
                            )}
                        </ContextToolbar>
                    </div>
                )}

                {/* --- MỚI: RENDER NODE CONTEXT MENU CHO RIGHT CLICK --- */}
                {contextMenuPos && (
                    <NodeContextMenu 
                        x={contextMenuPos.x} 
                        y={contextMenuPos.y} 
                        nodeId={contextMenuPos.nodeId}
                        onClose={() => setContextMenuPos(null)}
                        onGenerateRoadmap={() => {
                            const node = nodesRef.current.find(n => n.id === contextMenuPos.nodeId);
                            if (node) handleGenerateRoadmap(node);
                            setContextMenuPos(null);
                        }}
                    />
                )}
                
                <GraphStatisticsDashboard visible={showStats} />
                <AIChatAssistant isOpen={showAIChat} onToggle={() => setShowAIChat(!showAIChat)} contextNodes={selectedNodesData} isFocusMode={focusMode} />
                <ShareExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
                <TemplateGalleryModal isOpen={showTemplates} onClose={() => setShowTemplates(false)} />
                <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
                <UnifiedControlPanel isOpen={showControlPanel} onClose={() => setShowControlPanel(false)} activeTab={activePanelTab} onTabChange={setActivePanelTab} userNodes={userNodes} />
                <QuestLog isOpen={showQuestLog} onClose={() => setShowQuestLog(false)} quests={quests} onClaimReward={onClaimReward} />
                <GraphAlchemyFlashcardViewer
                    isOpen={showFlashcardMode}
                    onClose={() => { setShowFlashcardMode(false); setActiveFlashcardNode(null); }}
                    node={activeFlashcardNode}
                />
                <QuizGeneratorPanel isOpen={showQuizGen} onClose={() => setShowQuizGen(false)} />
                <ZoneActionModal isOpen={showZoneActionModal} onClose={() => setShowZoneActionModal(false)} nodeCount={zoneSelectedNodes.length} onAction={handleZoneAction} />
                {currentAchievement && <AchievementPopup title={currentAchievement.title} description={currentAchievement.desc} visible={!!currentAchievement} onClose={onCloseAchievement} />}
            </div>
        </GraphShell>
        </DroppableZone>
    );
};

export default React.memo(ExploreGraph);
