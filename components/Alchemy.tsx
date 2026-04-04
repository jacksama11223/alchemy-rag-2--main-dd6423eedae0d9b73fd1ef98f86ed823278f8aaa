
// ... (Previous imports remain same)
import React, { useState, useEffect } from 'react';
import { KnowledgeNode, AlchemySource, AlchemySettings, AlchemyIntent } from '../types';
import { generateLearningContent, generateOntologyFromText, checkSemanticResonance, analyzeAlchemyHabits } from '../services/geminiService';
import { useGamification } from '../contexts/GamificationContext';
import { useBehavior } from '../contexts/BehaviorContext';
import { publishItem, getCurrentUser, logAlchemyAction, createNode, getAuthHeader } from '../services/mockBackend'; 
import { GuideTrigger } from './GuideSystem'; 

// Assets
import { BrandLogo, OceanBackground, GlassSurface } from './common/BrandAssets';
import { OceanTheme } from '../theme/theme';

// Module Imports
import { UrlScraperInput, YoutubeTranscriber, OcrScanner, AudioRecorder, DriveImporter, DirectTextInput, FileUploader, ImageAnalyzerInput, NoteImporter } from './alchemy/AlchemyAdvancedInput';
import { ImageStudio } from './alchemy/ImageStudio';
import { RoadmapPreview } from './alchemy/RoadmapPreview';
import { AlchemySettingsSidebar, AlchemyHistorySidebar } from './alchemy/AlchemySidebars';
import { MethodSelector, ProcessingView, RefinementView, ResultView } from './alchemy/AlchemyStages';
import { ZenModeToggle, KeyboardShortcutMapper, LocalStorageSyncIndicator } from './alchemy/AlchemySystemTools';
import { StreakFlame, AchievementCabinet, StudyGroupHub, LeaderboardWidget, MysteryBoxReward } from './alchemy/AlchemyGamification';
import { MarketplaceGrid, CreatorProfile } from './alchemy/AlchemyGuild';
import { FeedbackFloatingButton, NotionSyncConfig, AnkiConnectConfig, GoogleDrivePicker, ApiUsageMonitor, ErrorLogConsole } from './alchemy/AlchemySystemIntegrations';
import { EditorAll } from './alchemy/EditorAll'; 
import { ChunkingText } from './alchemy/ChunkingText'; 
import { ManualLessonCreator } from './alchemy/ManualLessonCreator';
import { AlchemyStorageManager } from './alchemy-storage/AlchemyStorageManager';
import { RagChatbot } from './alchemy/RagChatbot';
import { GuideTriggerIcon, GuidePopupModal } from './alchemy-guidesystem/GuideComponents';
import { GUIDE_DATA } from './alchemy-guidesystem/GuideData';
import { FeatureWindowControls } from './FeatureWindowControls';
import { DroppableZone } from './DroppableZone';
import { useDndActionStore } from '../stores/dndActionStore';
import { ContextualDropZone } from './ContextualDropZone';
import { AnimatePresence, motion } from 'framer-motion';
import { DocumentSelectorModal } from './Drive-MoveItems/DocumentSelectorModal';
import { IncomingAsset } from '../utils/dataProcessor';

const SIDEBAR_MENU = [
    {
        category: 'input',
        title: 'Thu Thập Dữ Liệu',
        icon: 'database',
        items: [
            { id: 'url', label: 'Trích xuất URL', icon: 'link' },
            { id: 'youtube', label: 'Video YouTube', icon: 'smart_display' },
            { id: 'ocr', label: 'Quét Ảnh (OCR)', icon: 'document_scanner' },
            { id: 'image_analyzer', label: 'Phân Tích Ảnh (Pro)', icon: 'network_intelligence' },
            { id: 'audio', label: 'Ghi Âm', icon: 'mic' },
            { id: 'note', label: 'Nhập từ NoteLab', icon: 'edit_note' },
            { id: 'drive', label: 'Google Drive', icon: 'add_to_drive' },
            { id: 'file', label: 'Tải Lên Tệp', icon: 'upload_file' },
            { id: 'text', label: 'Dán Văn Bản', icon: 'text_snippet' },
            { id: 'mixer', label: 'Kho Dữ Liệu Tạm', icon: 'blender' },
            { id: 'rag_chat', label: 'Tổng hợp và phân tích, xử lí dữ liệu', icon: 'query_stats' },
        ]
    },
    {
        category: 'process',
        title: 'Xử Lý & Chế Tạo',
        icon: 'science',
        items: [
            { id: 'ai_methods', label: 'Lò Luyện AI', icon: 'auto_awesome' },
            { id: 'image_studio', label: 'Image Studio', icon: 'image' },
            { id: 'deep_read', label: 'Đọc Sâu (Deep Read)', icon: 'menu_book' },
            { id: 'roadmap_forge', label: 'Lộ Trình Học Tập AI', icon: 'map' },
            { id: 'manual', label: 'Tạo Thủ Công', icon: 'handyman' },
            { id: 'json_editor', label: 'Biên Tập JSON', icon: 'data_object' },
        ]
    },
    {
        category: 'community',
        title: 'Cộng Đồng & Tương Tác',
        icon: 'groups',
        items: [
            { id: 'marketplace', label: 'Kho Tri Thức', icon: 'storefront' },
            { id: 'achievements', label: 'Thành Tích', icon: 'emoji_events' },
            { id: 'leaderboard', label: 'Bảng Xếp Hạng', icon: 'leaderboard' },
            { id: 'study_group', label: 'Nhóm Học Tập', icon: 'diversity_3' },
        ]
    },
    {
        category: 'settings',
        title: 'Hệ Thống',
        icon: 'settings',
        items: [
            { id: 'integrations', label: 'Tích Hợp', icon: 'extension' },
            { id: 'api_monitor', label: 'Sử Dụng API', icon: 'monitoring' },
            { id: 'error_log', label: 'Nhật Ký Lỗi', icon: 'bug_report' },
        ]
    }
];

export interface AlchemyProps {
    onBack: () => void;
    onShowAbout: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    onAddNode: (node: KnowledgeNode) => void;
    onAddNodes?: (nodes: KnowledgeNode[]) => void;
    onAddNodesAndCluster?: (nodes: KnowledgeNode[], cluster: any) => void;
    onGoToGraph: () => void;
    initialPrompt?: string;
    userNodes?: KnowledgeNode[];
    onUpdateNode?: (node: KnowledgeNode) => void;
    onNavigateToDistill?: () => void;
    intent?: AlchemyIntent | null;
    onGoToFeatures?: () => void;
    onGoToBattle?: () => void;
    onToggleTodo?: () => void;
    onNavigateToFeature?: (feature: string, params?: any) => void; 
    onClose?: () => void;
}

const Alchemy: React.FC<AlchemyProps> = ({ 
    onBack, onShowAbout, onLogout, onShowAccount, 
    onAddNode, onAddNodes, onAddNodesAndCluster, onGoToGraph, userNodes = [], 
    onUpdateNode, onNavigateToDistill, intent, onGoToFeatures, onGoToBattle, onToggleTodo, onNavigateToFeature, onClose
}) => {
    
    const handleClose = onClose || onBack;
    
    // --- STATE MANAGEMENT ---
    const [sources, setSources] = useState<AlchemySource[]>([]);
    const [settings, setSettings] = useState<AlchemySettings>({
        personaId: 'socrates',
        difficulty: 50,
        targetLanguage: 'vi',
        templateId: 'general'
    });
    
    // ... (Keep all existing state and effects logic unchanged) ...
    const { addXP } = useGamification();
    const { logAction, logs } = useBehavior(); 
    const currentUser = getCurrentUser();
    const [aiSuggestion, setAiSuggestion] = useState<{message: string, method?: string} | null>(null);
    const [step, setStep] = useState<'input' | 'method' | 'processing' | 'refinement' | 'result'>('input');
    const [progressStep, setProgressStep] = useState(0); 
    const [statusMessage, setStatusMessage] = useState('');
    const [tempNodeData, setTempNodeData] = useState<Partial<KnowledgeNode> | null>(null);
    const [generatedContentString, setGeneratedContentString] = useState<string>(''); 
    const [createdNodeId, setCreatedNodeId] = useState<string | null>(null);
    const [finalNodeForPublish, setFinalNodeForPublish] = useState<KnowledgeNode | null>(null);
    const [isHighlighterActive, setIsHighlighterActive] = useState(false);
    const [resonanceMatches, setResonanceMatches] = useState<{ id: string, title: string, reason: string }[]>([]);
    const [isScanningResonance, setIsScanningResonance] = useState(false);
    const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);
    const [showHistorySidebar, setShowHistorySidebar] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [isZenMode, setIsZenMode] = useState(false);
    const [showMarketplace, setShowMarketplace] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [showManualCreator, setShowManualCreator] = useState(false);
    const [editTargetNode, setEditTargetNode] = useState<KnowledgeNode | undefined>(undefined);
    const [isDeepReadMode, setIsDeepReadMode] = useState(false);
    const [activeSidebarItem, setActiveSidebarItem] = useState<string>('url');
    const [activeGuide, setActiveGuide] = useState<string | null>(null);
    const [showDocSelector, setShowDocSelector] = useState(false);
    const [assetToAttach, setAssetToAttach] = useState<IncomingAsset | null>(null);
    const [aiPromptDialog, setAiPromptDialog] = useState<{isOpen: boolean, methodId: string} | null>(null);
    const [roadmapData, setRoadmapData] = useState<{ title: string, stages: any[] }>({ title: '', stages: [] });
    const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
    const [roadmapQuery, setRoadmapQuery] = useState("");
    const [roadmapDifficulty, setRoadmapDifficulty] = useState("Medium");
    const [roadmapStagesCount, setRoadmapStagesCount] = useState(3);
    const [promptQuery, setPromptQuery] = useState("");
    const [isFetchingRag, setIsFetchingRag] = useState(false);
    const [ragResultCount, setRagResultCount] = useState(0);
    const [ragFetchDone, setRagFetchDone] = useState(false);

    // --- LOGIC FUNCTIONS (Keep same as original) ---
    useEffect(() => {
        useDndActionStore.setState({
            alchemyActions: {
                saveToTemp: (asset) => {
                    const newSource: AlchemySource = {
                        id: Date.now().toString(),
                        type: 'text',
                        content: asset.payload,
                        metadata: { title: asset.title || 'Dropped Asset' }
                    };
                    setSources(prev => [...prev, newSource]);
                    setActiveSidebarItem('mixer');
                    
                    if (localStorage.getItem('learnai_session')) {
                        import('../services/alchemyService').then(module => {
                            let sourceType = 'note';
                            if (asset.dataType === 'FILE_ASSET') sourceType = 'drive';
                            else if (asset.dataType === 'HTML_SNIPPET') sourceType = 'web';
                            
                            const storageItem = {
                                sourceId: asset.id,
                                sourceType: sourceType,
                                title: asset.title || 'Dropped Asset',
                                extractedText: asset.payload || '',
                                type: asset.dataType === 'FILE_ASSET' ? 'file' : 'text',
                                tags: sourceType === 'drive' ? ['drive'] : []
                            };
                            module.saveAlchemyStorageItem(storageItem as any).catch(err => console.error(err));
                        });
                    }
                },
                createFlashcards: (asset) => {
                    const newSource: AlchemySource = {
                        id: Date.now().toString(),
                        type: 'text',
                        content: asset.payload,
                        metadata: { title: asset.title || 'Dropped Asset' }
                    };
                    setSources([newSource]);
                    // Auto-trigger flashcard generation
                    handleMethodSelect('Flashcard', asset.payload);
                },
                attachToDocument: (asset) => {
                    setAssetToAttach(asset);
                    setShowDocSelector(true);
                }
            }
        });
        return () => {
            useDndActionStore.setState({ alchemyActions: null });
        };
    }, []);

    useEffect(() => {
        const learnHabits = async () => {
            if (logs.length > 5) {
                const suggestion = await analyzeAlchemyHabits(logs);
                if (suggestion) {
                    setAiSuggestion({ message: suggestion.message, method: suggestion.recommendedMethod });
                    if (suggestion.recommendedDifficulty) setSettings(prev => ({ ...prev, difficulty: suggestion.recommendedDifficulty }));
                }
            }
        };
        learnHabits();
    }, [logs.length]); 

    useEffect(() => {
        if (!intent) return;
        if (intent.type === 'create' && intent.initialQuery) {
            if (intent.label && intent.label.startsWith('DEEP_READ_REQUEST:')) {
                setIsDeepReadMode(true);
                setActiveSidebarItem('deep_read');
                setSources([{ id: Date.now().toString(), type: 'text', content: intent.initialQuery, metadata: { fileName: intent.label.split(':')[1], confidence: 1 } }]);
                return;
            }
            const newSource: AlchemySource = { id: Date.now().toString(), type: 'text', content: intent.initialQuery, metadata: { fileName: 'Auto-Imported Content', confidence: 1 } };
            setSources(prev => { const exists = prev.some(s => s.content === intent.initialQuery); return exists ? prev : [...prev, newSource]; });
        } else if (intent.type === 'quiz' && intent.initialQuery) {
             setSources([{ id: Date.now().toString(), type: 'text', content: intent.initialQuery, metadata: { fileName: `Note: ${intent.label || 'Unknown'}`, confidence: 1 } }]);
            setSettings(prev => ({ ...prev, personaId: 'academic' }));
            setAiSuggestion({ message: "Phát hiện nội dung từ NoteLab. Chế độ tạo Quiz được đề xuất.", method: 'Quiz' });
            setActiveSidebarItem('ai_methods');
            setStep('method'); 
        } else if (intent.type === 'edit') {
            if (intent.targetNodeId) {
                const target = userNodes.find(n => n.id === intent.targetNodeId);
                if (target) { setEditTargetNode(target); setActiveSidebarItem('json_editor'); setShowEditor(true); }
            } else { setActiveSidebarItem('json_editor'); setShowEditor(true); }
        }
    }, [intent, userNodes]);

    const handleDeepReadComplete = (markdownContent: string) => {
        const fileName = sources[0]?.metadata?.fileName || 'Deep Read Note';
        if (onNavigateToFeature) { onNavigateToFeature('note', { type: 'create', label: `Note: ${fileName}`, data: markdownContent }); } else { alert("Đã tạo note thành công! Vui lòng vào NoteLab để xem."); }
    };
    const handleAddSource = async (source: AlchemySource) => {
        setSources(prev => [...prev, source]);
        setHistory(prev => [{ id: source.id, title: source.metadata?.fileName || 'Text Input', date: new Date().toLocaleTimeString() }, ...prev]);
        logAction('create_content', 'Alchemy', `Added source: ${source.type}`);
        if (currentUser) { logAlchemyAction(currentUser.id, currentUser.name, 'Added Source', source.type.toUpperCase()); }
        
        // Save to RAG Database
        try {
            let token = localStorage.getItem('token');
            if (!token) {
                const sessionStr = localStorage.getItem('learnai_session');
                if (sessionStr) {
                    try { token = JSON.parse(sessionStr).token; } catch (e) {}
                }
            }
            const customKey = localStorage.getItem('custom_gemini_api_key') || '';
            
            if (token && source.content) {
                fetch('/api/rag', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'x-gemini-api-key': customKey
                    },
                    body: JSON.stringify({
                        content: source.content,
                        metadata: {
                            type: 'document',
                            sourceType: source.type,
                            title: source.metadata?.fileName || `Nguồn dữ liệu mới (${source.type})`,
                            tags: ['document', source.type]
                        }
                    })
                }).catch(err => console.error('Error saving document to RAG:', err));
            }
        } catch (e) {
            console.error('Error in RAG save:', e);
        }

        // Save to Alchemy Storage Backend
        import('../services/alchemyService').then(({ saveAlchemyStorageItem }) => {
            let originalContent = undefined;
            if (source.type === 'image') originalContent = source.content;
            else if (source.type === 'audio') originalContent = source.metadata?.audioData;
            else if (source.type === 'youtube' || source.type === 'url') originalContent = source.metadata?.url;

            saveAlchemyStorageItem({
                sourceType: source.type === 'youtube' || source.type === 'url' ? 'web' : source.type === 'image' ? 'ocr' : source.type === 'audio' ? 'voice' : 'note',
                title: source.metadata?.fileName || `Nguồn dữ liệu mới (${source.type})`,
                originalContent: originalContent,
                extractedText: source.content
            });
        });
    };
    const handleStartProcess = () => {
        if (sources.length === 0) { alert("Vui lòng thêm ít nhất một nguồn dữ liệu!"); return; }
        setActiveSidebarItem('ai_methods');
        setStep('method');
    };
    const handleManualCreationSave = async (data: any, type: 'Flashcard' | 'Case Study' | 'Quiz') => {
        const newNodePayload: Partial<KnowledgeNode> = { title: data.title || "Bài học thủ công", type: type, status: 'new', tags: data.tags || ['Manual'], x: (Math.random() - 0.5) * 400, y: (Math.random() - 0.5) * 300, timestamp: new Date(), data: data };
        try {
            const savedNode = await createNode(newNodePayload);
            if (savedNode) { onAddNode(savedNode); alert("Đã lưu thành công vào Cơ sở dữ liệu & Sơ đồ tri thức!"); } else { const tempNode = { ...newNodePayload, id: Date.now().toString() } as KnowledgeNode; onAddNode(tempNode); alert("Lưu tạm thời (Offline/Lỗi Server)."); }
        } catch (e) { console.error("Failed to save node:", e); const tempNode = { ...newNodePayload, id: Date.now().toString() } as KnowledgeNode; onAddNode(tempNode); }
    };
    const formatDataToString = (data: any, type: string): string => {
        let content = `# ${data.title || 'Generated Content'}\n\n`;
        if (data.tags && Array.isArray(data.tags)) content += `Tags: ${data.tags.join(', ')}\n\n`;
        if (data.summary) content += `## Summary\n${data.summary}\n\n`;
        
        if ((type === 'Quiz' || type === 'exam_mcq_gen') && data.quiz) { 
            data.quiz.forEach((q: any, i: number) => { 
                content += `### Q${i+1}: ${q.question}\n`; 
                q.options.forEach((opt: string, idx: number) => { 
                    content += `- ${String.fromCharCode(65+idx)}. ${opt}\n`; 
                }); 
                content += `> **Answer:** ${q.options[q.correctAnswer]} (${q.explanation})\n\n`; 
            }); 
        } else if ((type === 'Flashcard' || type === 'exam_magic_notes') && data.flashcards) { 
            data.flashcards.forEach((f: any) => { 
                content += `**Front:** ${f.front}\n**Back:** ${f.back}\n---\n`; 
            }); 
        } else if (type === 'exam_cloze_del' && data.fillInBlanks) {
            data.fillInBlanks.forEach((f: any) => {
                content += `**Sentence:** ${f.sentence}\n**Answer:** ${f.answer}\n---\n`;
            });
        } else if (type === 'ref_tldr' && data.tldr) {
            content += `## TL;DR\n${data.tldr}\n\n`;
        } else if (type === 'ref_eli5' && data.eli5) {
            content += `## Explain Like I'm 5\n${data.eli5}\n\n`;
        } else if (type === 'ref_key_takeaways' && data.takeaways) {
            content += `## Key Takeaways\n`;
            data.takeaways.forEach((t: string) => {
                content += `- ${t}\n`;
            });
            content += `\n`;
        } else if (type === 'strat_study_plan' && data.studyPlan) {
            content += `## Study Plan\n`;
            data.studyPlan.forEach((p: any) => {
                content += `### Day: ${p.day} - ${p.topic}\n`;
                p.tasks.forEach((t: string) => {
                    content += `- ${t}\n`;
                });
                content += `\n`;
            });
        } else if (type === 'strat_spaced_rep' && data.schedule) {
            content += `## Spaced Repetition Schedule\n`;
            data.schedule.forEach((s: any) => {
                content += `### Date: ${s.date}\n`;
                s.reviewItems.forEach((r: string) => {
                    content += `- ${r}\n`;
                });
                content += `\n`;
            });
        } else if (type === 'crea_blog_post' && data.blogPost) {
            content += `## Blog Post\n${data.blogPost}\n\n`;
        } else if (type === 'crea_analogy' && data.analogy) {
            content += `## Analogy\n${data.analogy}\n\n`;
        } else if (type.startsWith('arch_') && data.nodes) {
            content += `## Graph Nodes\n`;
            data.nodes.forEach((n: any) => {
                content += `- **${n.label}** (${n.type})\n`;
            });
            content += `\n## Graph Edges\n`;
            if (data.edges) {
                data.edges.forEach((e: any) => {
                    content += `- ${e.source} -> ${e.target} (${e.label})\n`;
                });
            }
            content += `\n`;
        } else if (type.startsWith('exp_') && data.findings) {
            content += `## Findings\n`;
            data.findings.forEach((f: any) => {
                content += `### ${f.concept}\n${f.description}\n\n`;
            });
        } else { 
            content += JSON.stringify(data, null, 2); 
        }
        return content;
    };

    const handleMethodSelect = async (method: string, overrideContent?: string) => {
        if (!overrideContent) {
            setAiPromptDialog({ isOpen: true, methodId: method });
            setPromptQuery("");
            setRagResultCount(0);
            setRagFetchDone(false);
            return;
        }
        executeMethodWithPrompt(method, "", 'ai', overrideContent);
    };

    const executeMethodWithPrompt = async (method: string, promptText: string, mode: 'ai' | 'manual', overrideContent?: string) => {
        setIsFetchingRag(true);
        setRagFetchDone(false);
        setRagResultCount(0);
        let ragContext = "";
        let localRagCount = 0;

        // ---------------------------------------------------------------
        // HYBRID DUAL-TRACK RAG — cùng thuật toán với AI Chat:
        //   1. Keyword Sparse Search → KnowledgeIndex (Regex Traceback)
        //   2. Dense Vector Search   → VectorStore (Embedding cosine sim)
        //   3. Deduplicate + Rank by score
        //   4. Full-context format (không nén TF-IDF để Forge có đủ data)
        // ---------------------------------------------------------------
        const effectiveQuery = promptText.trim() || method;
        try {
            let token = localStorage.getItem('token');
            if (!token) {
                const sessionStr = localStorage.getItem('learnai_session');
                if (sessionStr) {
                    try { token = JSON.parse(sessionStr).token; } catch (_) {}
                }
            }
            if (token && effectiveQuery) {
                const res = await fetch('/api/rag/hybrid-search', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: effectiveQuery,
                        mode: 'full',   // Full context — không nén TF-IDF cho Forge
                        limit: 8,
                    }),
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.contextString) {
                        ragContext = "--- TÀI LIỆU RAG (HYBRID DUAL-TRACK) ---\n" + data.contextString + "\n-----------------------------------------\n";
                        localRagCount = data.totalFound || 0;
                        setRagResultCount(localRagCount);
                        console.log(`[AI Forge] Hybrid RAG retrieved ${localRagCount} sources for method: ${method}`);
                    }
                }
            }
        } catch (e) {
            console.error("[AI Forge] Hybrid RAG search failed:", e);
        }

        setRagFetchDone(true);
        setIsFetchingRag(false);
        setAiPromptDialog(null);

        const baseContent = overrideContent || sources.map(s => `[Nguồn: ${s.type}] ${s.content}`).join('\n\n');
        const combinedContext = (promptText ? `Yêu Cầu Chi Tiết: ${promptText}\n\n` : '') + ragContext + (baseContent ? `--- DỮ LIỆU CÁ NHÂN ---\n${baseContent}` : '');

        if (mode === 'manual') {
            const newSource: AlchemySource = {
                id: Date.now().toString(),
                type: 'text',
                content: combinedContext,
                metadata: { fileName: `Tài liệu RAG nháp: ${method}` }
            };
            setSources(prev => [...prev, newSource]);
            setActiveSidebarItem('manual');
            setShowManualCreator(true);
            return;
        }

        setStep('processing'); setProgressStep(10); setStatusMessage(`Đang khởi động lò luyện với phương thức: ${method}...`); logAction('create_content', 'Alchemy', `Used method: ${method}`);
        if (currentUser) { logAlchemyAction(currentUser.id, currentUser.name, 'Started Process', method); }
        try {
            if (method === 'Ontology') { setProgressStep(50); await generateOntologyFromText(combinedContext); }
            setStatusMessage(`Đang tổng hợp dữ liệu RAG...`); setProgressStep(40);
            const complexityStr = settings.difficulty < 30 ? 'Easy' : settings.difficulty < 70 ? 'Medium' : 'Hard';
            const generatedData = await generateLearningContent(combinedContext, method as any, { complexity: complexityStr, language: settings.targetLanguage === 'vi' ? 'Vietnamese' : 'English' });
            setProgressStep(90);

            // Save generated flashcards to Alchemy Storage
            if ((method === 'Flashcard' || method === 'exam_magic_notes') && generatedData.flashcards) {
                import('../services/alchemyService').then(({ saveAlchemyStorageFlashcard }) => {
                    generatedData.flashcards.forEach((card: any) => {
                        saveAlchemyStorageFlashcard({
                            front: card.front,
                            back: card.back,
                            tags: generatedData.tags || []
                        }).catch(err => console.error("Failed to save flashcard to storage", err));
                    });
                });
            }

            const formattedString = formatDataToString(generatedData, method);
            setGeneratedContentString(formattedString);
            const defaultTitle = intent?.type === 'quiz' ? `Quiz: ${intent.label}` : (generatedData.title || (intent?.sourceNodes?.[0]?.title) || "Tri thức mới");
            setTempNodeData({ id: Date.now().toString(), title: defaultTitle, type: method as any, status: 'new', tags: generatedData.tags || [], timestamp: new Date(), data: generatedData });
            setTimeout(() => { setStep('refinement'); setProgressStep(100); }, 500);
        } catch (error) { console.error(error); alert("Lỗi xử lý. Vui lòng thử lại."); setStep('input'); }
    };
    const handleRefinementAction = async (action: any) => { if (!tempNodeData?.data) return; setStatusMessage("Đang tinh chỉnh..."); if (currentUser) logAlchemyAction(currentUser.id, currentUser.name, 'Refined Content', 'AI Tool'); alert(`Applied action: ${JSON.stringify(action)}`); };
    const handleFinalize = () => {
        if (tempNodeData) {
            let startX = 0; let startY = 0;
            if (intent?.sourceNodes && intent.sourceNodes.length > 0) { const avgX = intent.sourceNodes.reduce((acc, n) => acc + n.x, 0) / intent.sourceNodes.length; const avgY = intent.sourceNodes.reduce((acc, n) => acc + n.y, 0) / intent.sourceNodes.length; startX = avgX + (Math.random() - 0.5) * 200; startY = avgY + (Math.random() - 0.5) * 200; } else { startX = (Math.random() - 0.5) * 400; startY = (Math.random() - 0.5) * 300; }
            let connectedIds: string[] = []; if (intent && intent.sourceNodes) { connectedIds = intent.sourceNodes.map(n => n.id); }
            
            if (tempNodeData.type?.startsWith('arch_') && tempNodeData.data?.nodes) {
                const newNodes: KnowledgeNode[] = [];
                const idMap: Record<string, string> = {};
                const now = Date.now();
                
                // First pass: generate IDs
                tempNodeData.data.nodes.forEach((n: any, i: number) => {
                    idMap[n.id] = `temp_${n.id}_${now}_${i}`;
                });

                tempNodeData.data.nodes.forEach((n: any) => {
                    const nodeConnectedIds = [...connectedIds];
                    if (tempNodeData.data?.edges) {
                        tempNodeData.data?.edges.forEach((e: any) => {
                            if (e.source === n.id && idMap[e.target]) {
                                nodeConnectedIds.push(idMap[e.target]);
                            }
                        });
                    }
                    newNodes.push({
                        id: idMap[n.id],
                        title: n.label,
                        type: n.type || 'Concept',
                        status: 'new',
                        tags: tempNodeData.tags || [],
                        timestamp: new Date(),
                        x: startX + (Math.random() - 0.5) * 300,
                        y: startY + (Math.random() - 0.5) * 300,
                        connectedNodeIds: nodeConnectedIds,
                        data: n
                    } as KnowledgeNode);
                });
                
                if (onAddNodes) {
                    onAddNodes(newNodes);
                } else {
                    newNodes.forEach(n => onAddNode(n));
                }
                
                setCreatedNodeId(newNodes[0]?.id || null);
                setFinalNodeForPublish(newNodes[0] || null);
                if (currentUser) logAlchemyAction(currentUser.id, currentUser.name, 'Created Nodes', tempNodeData.type);
                setStep('result'); setIsScanningResonance(true); checkSemanticResonance({ title: tempNodeData.title, tags: tempNodeData.tags }, userNodes.map(n => ({ id: n.id, title: n.title, tags: n.tags }))).then(matches => { setResonanceMatches(matches); setIsScanningResonance(false); });
            } else {
                const finalNode: KnowledgeNode = { ...tempNodeData, id: Date.now().toString(), x: startX, y: startY, connectedNodeIds: connectedIds, timestamp: new Date(), type: tempNodeData.type || 'Flashcard', imageUrl: undefined } as KnowledgeNode;
                onAddNode(finalNode); setCreatedNodeId(finalNode.id); setFinalNodeForPublish(finalNode);
                if (currentUser) logAlchemyAction(currentUser.id, currentUser.name, 'Created Node', finalNode.type);
                setStep('result'); setIsScanningResonance(true); checkSemanticResonance({ title: finalNode.title, tags: finalNode.tags }, userNodes.map(n => ({ id: n.id, title: n.title, tags: n.tags }))).then(matches => { setResonanceMatches(matches); setIsScanningResonance(false); });
            }
        }
    };
    const handlePublishToLibrary = () => {
        if (!currentUser) { alert("Vui lòng đăng nhập để chia sẻ."); return; }
        if (!finalNodeForPublish) { alert("Không tìm thấy nội dung để chia sẻ."); return; }
        const title = prompt("Nhập tiêu đề cho bài chia sẻ:", finalNodeForPublish.title);
        if (!title) return;
        publishItem({ title: title, price: 'Free', category: 'Community', type: 'Deck', description: `Tạo bởi ${currentUser.name} từ Giả Kim Thuật.`, payload: [finalNodeForPublish] });
        logAlchemyAction(currentUser.id, currentUser.name, 'Published to Market', 'Deck');
        addXP(200, "Nhà sáng tạo nội dung"); alert("Đã xuất bản thành công! Cộng đồng có thể tải về ngay."); setShowMarketplace(true);
    };

    const handleAttachToDocument = async (asset: IncomingAsset, documentId: string) => {
        try {
            const response = await fetch(`/api/notes/${documentId}/attach`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileId: asset.id,
                    fileName: asset.title,
                    fileType: asset.dataType,
                    source: 'drive'
                })
            });
            
            if (response.ok) {
                alert('Đã đính kèm tài liệu thành công!');
            } else {
                alert('Lỗi khi đính kèm tài liệu.');
            }
        } catch (error) {
            console.error('Error attaching document:', error);
            alert('Lỗi khi đính kèm tài liệu.');
        } finally {
            setShowDocSelector(false);
            setAssetToAttach(null);
        }
    };

    const handleGenerateRoadmap = async () => {
        if (!roadmapQuery.trim()) {
            alert("Vui lòng nhập chủ đề lộ trình!");
            return;
        }

        setIsGeneratingRoadmap(true);
        setStatusMessage("Đang thiết kế lộ trình học tập hệ thống...");
        
        try {
            let token = localStorage.getItem('token');
            if (!token) {
                const sessionStr = localStorage.getItem('learnai_session');
                if (sessionStr) {
                    try { token = JSON.parse(sessionStr).token; } catch (_) {}
                }
            }
            const customKey = localStorage.getItem('custom_gemini_api_key') || '';

            const headers = getAuthHeader();

            const res = await fetch('/api/roadmap/generate', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    topic: roadmapQuery,
                    difficulty: roadmapDifficulty,
                    stagesCount: roadmapStagesCount
                })
            });

            if (res.ok) {
                const data = await res.json();
                setStatusMessage("Chế tạo lộ trình thành công!");
                setRoadmapData({
                    title: data.roadmapTitle,
                    stages: data.nodes.map((n: any) => ({
                        id: n._id || n.id,
                        title: n.title,
                        summary: n.data.summary,
                        concepts: n.tags.filter((t: string) => t !== 'Roadmap' && t !== data.roadmapTitle),
                        flashcardCount: n.data.flashcards?.length || 0
                    }))
                });
                
                // Add all nodes and cluster (The "Khoanh vùng" magic)
                if (data.cluster && onAddNodesAndCluster) {
                    onAddNodesAndCluster(data.nodes, data.cluster);
                } else if (onAddNodes) {
                    onAddNodes(data.nodes);
                } else {
                    data.nodes.forEach((n: any) => onAddNode(n));
                }
                
                addXP(500, "Kiến trúc sư tri thức");
            } else {
                const error = await res.json();
                alert(`Lỗi: ${error.message}`);
            }
        } catch (e) {
            console.error("Roadmap generation failed:", e);
            alert("Đã có lỗi xảy ra khi tạo lộ trình.");
        } finally {
            setIsGeneratingRoadmap(false);
        }
    };

    const reset = () => { 
        setSources([]); 
        setStep('input'); 
        setActiveSidebarItem('url'); 
        setTempNodeData(null); 
        setGeneratedContentString(''); 
        setResonanceMatches([]); 
        setFinalNodeForPublish(null); 
        setIsDeepReadMode(false); 
        setRoadmapData({ title: '', stages: [] });
        setIsGeneratingRoadmap(false);
        setRoadmapQuery("");
    };

    const activeDragItem = useDndActionStore(state => state.activeDragItem);
    const isDraggingFile = activeDragItem?.dataType === 'FILE_ASSET';
    const isDraggingText = activeDragItem?.dataType === 'TEXT_NOTE' || activeDragItem?.dataType === 'HTML_SNIPPET' || activeDragItem?.dataType === 'AI_RESPONSE';
    const showDropZones = isDraggingFile || isDraggingText;

    return (
        <DroppableZone id="alchemy-zone" type="ALCHEMY" className="w-full h-full">
        // Changed main container to use Light Mode colors
        <div className={`relative flex h-screen w-full flex-col bg-[#F8F9FA] group/design-root overflow-hidden font-display text-slate-800 selection:bg-sky-200`}>
            {/* Interactive Ocean Background - Surface Variant */}
            <OceanBackground variant="surface" />
            
            <AnimatePresence>
                {showDropZones && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] flex items-center justify-center gap-8 p-8 bg-black/40 backdrop-blur-sm"
                    >
                        {isDraggingFile && (
                            <>
                                <ContextualDropZone id="alchemy-save-temp" type="ALCHEMY" action="ALCHEMY_SAVE_TEMP" icon="blender" text="Lưu vào Kho dữ liệu tạm" isVisible={true} />
                                <ContextualDropZone id="alchemy-create-flashcard" type="ALCHEMY" action="ALCHEMY_CREATE_FLASHCARD" icon="style" text="Tạo Flashcard tự động" isVisible={true} />
                                <ContextualDropZone id="alchemy-attach-doc" type="ALCHEMY" action="ALCHEMY_ATTACH_TO_DOC" icon="attach_file" text="Đính kèm vào tài liệu" isVisible={true} />
                            </>
                        )}
                        {isDraggingText && (
                            <>
                                <ContextualDropZone id="alchemy-save-temp-text" type="ALCHEMY" action="ALCHEMY_SAVE_TEMP" icon="blender" text="Lưu vào Kho dữ liệu tạm" isVisible={true} />
                                <ContextualDropZone id="alchemy-create-flashcard-text" type="ALCHEMY" action="ALCHEMY_CREATE_FLASHCARD" icon="style" text="Tạo Flashcard tự động" isVisible={true} />
                                <ContextualDropZone id="alchemy-attach-doc-text" type="ALCHEMY" action="ALCHEMY_ATTACH_TO_DOC" icon="attach_file" text="Đính kèm vào tài liệu" isVisible={true} />
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <DocumentSelectorModal 
                isOpen={showDocSelector} 
                onClose={() => { setShowDocSelector(false); setAssetToAttach(null); }} 
                asset={assetToAttach} 
                onAttach={handleAttachToDocument} 
            />

            {aiPromptDialog && aiPromptDialog.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-blue-50 flex justify-between items-center">
                            <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sky-500 text-2xl">settings_suggest</span>
                                Lò Luyện AI · Pipeline RAG
                            </h3>
                            {!isFetchingRag && (
                                <button onClick={() => { setAiPromptDialog(null); setRagFetchDone(false); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            )}
                        </div>

                        {/* Query input — chỉ hiện khi chưa bắt đầu fetch */}
                        {!isFetchingRag && (
                            <div className="p-5">
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    Bạn muốn tạo nội dung về chủ đề gì?
                                    <span className="ml-1.5 text-xs font-normal text-slate-400">(Để trống = dùng chế độ đã chọn làm query)</span>
                                </label>
                                <textarea
                                    value={promptQuery}
                                    onChange={(e) => setPromptQuery(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) executeMethodWithPrompt(aiPromptDialog.methodId, promptQuery, 'ai'); }}
                                    autoFocus
                                    placeholder={`Ví dụ: "Giải thích về Thuyết Tương Đối của Einstein và ứng dụng thực tế"...`}
                                    className="w-full h-28 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none text-sm font-medium placeholder-slate-400 transition"
                                />
                                {/* Pipeline info */}
                                <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
                                    {[
                                        { icon: 'manage_search', label: 'Keyword\nParsing', color: 'text-violet-500' },
                                        { icon: 'hub', label: 'Vector\nSearch', color: 'text-blue-500' },
                                        { icon: 'sync_alt', label: 'Traceback\n& Rank', color: 'text-sky-500' },
                                        { icon: 'auto_awesome', label: 'AI\nGenerate', color: 'text-emerald-500' },
                                    ].map((step, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1 bg-slate-50 rounded-xl p-2 border border-slate-100">
                                            <span className={`material-symbols-outlined text-base ${step.color}`}>{step.icon}</span>
                                            <span className="text-[10px] font-bold text-slate-500 leading-tight whitespace-pre">{step.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-2 text-[11px] text-slate-400 italic text-center">Ctrl+Enter để bắt đầu nhanh bằng AI</p>
                            </div>
                        )}

                        {/* Live Pipeline Status — hiện khi đang fetch */}
                        {isFetchingRag && (
                            <div className="p-6 flex flex-col gap-4">
                                <p className="text-sm font-bold text-slate-700 text-center mb-1">Đang chạy Hybrid Dual-Track RAG...</p>
                                {[
                                    { icon: 'manage_search', label: 'Bước 1: Keyword Parsing & Entity Extraction', color: 'text-violet-500', bg: 'bg-violet-50' },
                                    { icon: 'hub',           label: 'Bước 2: Dense Vector Embedding Search',        color: 'text-blue-500',   bg: 'bg-blue-50' },
                                    { icon: 'sync_alt',      label: 'Bước 3: Keyword Traceback + Deduplication',   color: 'text-sky-500',    bg: 'bg-sky-50' },
                                    { icon: 'compress',      label: 'Bước 4: Tổng hợp Full Context cho AI Forge',  color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                ].map((s, i) => (
                                    <div key={i} className={`flex items-center gap-3 ${s.bg} rounded-xl px-4 py-2.5 animate-pulse`} style={{ animationDelay: `${i * 0.18}s` }}>
                                        <span className={`material-symbols-outlined text-xl ${s.color}`}>{s.icon}</span>
                                        <span className="text-xs font-semibold text-slate-600">{s.label}</span>
                                        <span className="material-symbols-outlined text-slate-300 text-base ml-auto animate-spin">progress_activity</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Action footer */}
                        {!isFetchingRag && (
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-base text-amber-400">database</span>
                                    {ragResultCount > 0
                                        ? <span className="font-bold text-emerald-600">{ragResultCount} tài liệu được nạp</span>
                                        : <span>Chưa có dữ liệu — sẽ truy vấn khi bắt đầu</span>
                                    }
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => executeMethodWithPrompt(aiPromptDialog.methodId, promptQuery, 'manual')}
                                        disabled={isFetchingRag}
                                        className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-white text-sm transition-all flex items-center gap-1.5 disabled:opacity-40"
                                    >
                                        <span className="material-symbols-outlined text-base">edit_note</span> Tự Viết
                                    </button>
                                    <button
                                        onClick={() => executeMethodWithPrompt(aiPromptDialog.methodId, promptQuery, 'ai')}
                                        disabled={isFetchingRag}
                                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5 disabled:opacity-40"
                                    >
                                        <span className="material-symbols-outlined text-base">auto_awesome</span> Chế Tạo Bằng AI
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={`relative z-10 flex flex-col h-screen w-full transition-all duration-300 ${showDropZones ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
            {/* Tools & Indicators */}
            <KeyboardShortcutMapper />
            <LocalStorageSyncIndicator />
            <FeedbackFloatingButton />
            <EditorAll isOpen={showEditor} onClose={() => { setShowEditor(false); setEditTargetNode(undefined); }} initialNode={editTargetNode} userNodes={userNodes} onUpdateNode={(node) => { if(onUpdateNode) onUpdateNode(node); }} />
            <ManualLessonCreator isOpen={showManualCreator} onClose={() => setShowManualCreator(false)} sourceContent={sources.map(s => s.content).join('\n\n')} onSave={handleManualCreationSave} />
            
            {/* Marketplace Modal */}
            {showMarketplace && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-[fadeIn_0.3s]">
                    <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl border border-white/60 shadow-2xl flex flex-col relative overflow-hidden">
                        <button onClick={() => setShowMarketplace(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 z-10"><span className="material-symbols-outlined">close</span></button>
                        <div className="p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md">
                            <h2 className="text-2xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">storefront</span> Kho Tri Thức Cộng Đồng
                            </h2>
                            <p className="text-sm text-slate-500">Tham khảo tài liệu từ cộng đồng nghiên cứu.</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300">
                            <div className="flex gap-6 mb-8">
                                <div className="flex-1"><MarketplaceGrid /></div>
                                <div className="w-72 shrink-0 space-y-4"><CreatorProfile /></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebars */}
            <AlchemySettingsSidebar isOpen={showSettingsSidebar} onClose={() => setShowSettingsSidebar(false)} settings={settings} onUpdateSettings={(s) => setSettings(prev => ({...prev, ...s}))} sourceCount={sources.length} />
            <AlchemyHistorySidebar isOpen={showHistorySidebar} onClose={() => setShowHistorySidebar(false)} history={history} onSelectHistory={(txt) => handleAddSource({ id: Date.now().toString(), type: 'text', content: txt })} />

            {/* Header (Unified Style) */}
            {!isZenMode && (
                <header className={`flex items-center justify-between whitespace-nowrap px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-50 ${OceanTheme.gradients.headerLight}`}>
                    <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
                         <BrandLogo variant="light" />
                    </div>
                    
                    <div className="hidden md:flex ml-8 items-center gap-8">
                        <a className="text-sm font-bold text-slate-600 hover:text-sky-600 transition-colors cursor-pointer" onClick={(e) => { e.preventDefault(); if(onGoToFeatures) onGoToFeatures(); }}>Tính năng</a>
                        <a onClick={(e) => { e.preventDefault(); onShowAbout(); }} className="text-sm font-bold text-slate-600 hover:text-sky-600 transition-colors cursor-pointer" href="#">Giới thiệu</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={onShowAccount} className="flex gap-2 cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 pl-2 pr-4 bg-white/50 border border-white text-slate-700 text-sm font-bold shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center justify-center bg-blue-100 aspect-square rounded-full size-8 text-blue-600"><span className="material-symbols-outlined text-lg">person</span></div>
                            <span className="truncate">Tài khoản</span>
                        </button>
                        <button onClick={onLogout} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 text-sm font-bold transition-colors shadow-sm">
                            <span className="truncate">Đăng xuất</span>
                        </button>
                    </div>
                </header>
            )}

            {/* Toolbar - Light Mode */}
            {!isZenMode && (
                <div className="flex items-center justify-between whitespace-nowrap px-6 py-3 font-display bg-white/30 border-b border-white/40 relative z-20 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowHistorySidebar(true)} className="md:hidden text-sky-600 hover:text-sky-800"><span className="material-symbols-outlined">history</span></button>
                        <div className="text-sky-500 text-2xl animate-pulse"><span className="material-symbols-outlined">science</span></div>
                        <h2 className="text-lg font-bold text-slate-800">
                            {intent ? (isDeepReadMode ? 'Tổng Hợp: DEEP READ' : `Tổng Hợp: ${intent.type.toUpperCase()}`) : 'Trung Tâm Xử Lý Dữ Liệu'}
                        </h2>
                        <GuideTrigger guideKey="alchemy" className="bg-sky-100 text-sky-600" />
                        <div className="ml-4"><StreakFlame /></div>
                    </div>
                    <div className="flex gap-3">
                         {onToggleTodo && <button onClick={onToggleTodo} className="p-1.5 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200 border border-amber-200 transition-all" title="Nhiệm vụ (Task)"><span className="material-symbols-outlined text-lg">checklist</span></button>}
                        <button onClick={onGoToBattle} className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 border border-red-200 transition-all" title="Học Cùng Mọi Người (Battle)"><span className="material-symbols-outlined text-lg">swords</span></button>
                        <button onClick={() => setShowMarketplace(true)} className="p-1.5 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200 border border-amber-200 transition-all" title="Cộng đồng"><span className="material-symbols-outlined text-lg">storefront</span></button>
                        <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>
                        <button onClick={onNavigateToDistill} className="p-1.5 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 border border-purple-200 transition-all" title="Distill Video"><span className="material-symbols-outlined text-lg">smart_display</span></button>
                        <button onClick={() => setShowSettingsSidebar(true)} className="p-1.5 bg-sky-100 text-sky-600 rounded-full hover:bg-sky-200 border border-sky-200 transition-all" title="Cấu hình"><span className="material-symbols-outlined text-lg">tune</span></button>
                        <ZenModeToggle isActive={isZenMode} onToggle={() => setIsZenMode(!isZenMode)} />
                        <FeatureWindowControls onClose={onBack} />
                    </div>
                </div>
            )}

            {isZenMode && <div className="absolute top-4 right-4 z-50"><ZenModeToggle isActive={isZenMode} onToggle={() => setIsZenMode(false)} /></div>}

            {/* Main Content */}
            <main className="flex-1 flex items-stretch px-4 py-6 relative z-20 gap-6 max-w-[1600px] mx-auto w-full overflow-hidden">
                
                {/* SIDEBAR */}
                {!isZenMode && (
                    <div className="w-64 shrink-0 flex flex-col gap-6 animate-[fadeInLeft_0.5s] overflow-y-auto pr-2 pb-20 custom-scrollbar">
                        {SIDEBAR_MENU.map((group) => (
                            <div key={group.category} className="flex flex-col gap-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 px-2">
                                    <span className="material-symbols-outlined text-[16px]">{group.icon}</span>
                                    {group.title}
                                </h3>
                                <div className="flex flex-col gap-1">
                                    {group.items.map((item) => {
                                        const isMixer = item.id === 'mixer';
                                        const isRagChat = item.id === 'rag_chat';
                                        const isActive = activeSidebarItem === item.id;
                                        
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    setActiveSidebarItem(item.id);
                                                    if (item.id === 'ai_methods') setStep('method');
                                                    if (item.id === 'deep_read') setIsDeepReadMode(true);
                                                    else setIsDeepReadMode(false);
                                                }}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                    isMixer
                                                    ? isActive 
                                                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md scale-105' 
                                                        : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 hover:from-amber-200 hover:to-orange-200 border border-amber-300/50 shadow-sm'
                                                    : isRagChat
                                                    ? isActive
                                                        ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white shadow-md scale-105'
                                                        : 'bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-800 hover:from-purple-200 hover:to-fuchsia-200 border border-purple-300/50 shadow-sm'
                                                    : isActive 
                                                        ? 'bg-sky-100 text-sky-700 shadow-sm' 
                                                        : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                                                }`}
                                            >
                                                <span className={`material-symbols-outlined text-[20px] ${
                                                    isMixer 
                                                    ? isActive ? 'text-white' : 'text-amber-600'
                                                    : isRagChat
                                                    ? isActive ? 'text-white' : 'text-purple-600'
                                                    : isActive ? 'text-sky-500' : 'text-slate-400'
                                                }`}>
                                                    {item.icon}
                                                </span>
                                                <span className={isMixer || isRagChat ? 'font-bold' : ''}>{item.label}</span>
                                                {group.category === 'input' && (
                                                    <GuideTriggerIcon onClick={(e) => { e.stopPropagation(); setActiveGuide(item.id); }} />
                                                )}
                                                {isMixer && !isActive && (
                                                    <span className="ml-auto w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                                )}
                                                {isRagChat && !isActive && (
                                                    <span className="ml-auto w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* MAIN CARD */}
                <GlassSurface className="flex-1 p-6 md:p-8 flex flex-col relative overflow-hidden animate-[fadeInUp_0.5s]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-sky-200/20 rounded-full blur-[120px] pointer-events-none"></div>

                    {/* AI HABIT SUGGESTION BANNER */}
                    {aiSuggestion && !isZenMode && !isDeepReadMode && ['url', 'youtube', 'ocr', 'image_analyzer', 'audio', 'note', 'drive', 'file', 'text', 'mixer'].includes(activeSidebarItem) && (
                        <div className="w-full mb-6 bg-gradient-to-r from-purple-50 to-sky-50 border border-purple-200 rounded-2xl p-4 flex items-start gap-4 animate-slide-down relative overflow-hidden shadow-sm z-10">
                            <div className="p-3 bg-purple-100 rounded-full text-purple-600 shrink-0 border border-purple-200"><span className="material-symbols-outlined text-2xl animate-pulse">neurology</span></div>
                            <div className="flex-1">
                                <h4 className="text-purple-700 font-bold text-sm uppercase tracking-wider mb-1">Phân tích thói quen nghiên cứu</h4>
                                <p className="text-slate-600 text-sm">{aiSuggestion.message}</p>
                                {aiSuggestion.method && <p className="text-xs text-sky-600 mt-1">Đã tự động tối ưu cấu hình cho: <strong>{aiSuggestion.method}</strong></p>}
                            </div>
                            <button onClick={() => setAiSuggestion(null)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-sm">close</span></button>
                        </div>
                    )}

                    {/* Render content based on activeSidebarItem */}
                    <div className="relative z-10 flex-1 flex flex-col h-full">
                        {['url', 'youtube', 'ocr', 'image_analyzer', 'audio', 'note', 'drive', 'file', 'text'].includes(activeSidebarItem) && (
                            <div className="flex flex-col xl:flex-row gap-6 w-full h-full min-h-[500px]">
                                <div className="flex-1 overflow-y-auto">
                                    {activeSidebarItem === 'url' && <div className="max-w-3xl mx-auto w-full"><UrlScraperInput onAddSource={handleAddSource} /></div>}
                                    {activeSidebarItem === 'youtube' && <div className="max-w-3xl mx-auto w-full"><YoutubeTranscriber onAddSource={handleAddSource} /></div>}
                                    {activeSidebarItem === 'ocr' && <div className="w-full"><OcrScanner onAddSource={handleAddSource} /></div>}
                                    {activeSidebarItem === 'image_analyzer' && <div className="max-w-3xl mx-auto w-full"><ImageAnalyzerInput onAddSource={handleAddSource} /></div>}
                                    {activeSidebarItem === 'audio' && <div className="max-w-3xl mx-auto w-full"><AudioRecorder onAddSource={handleAddSource} /></div>}
                                    {activeSidebarItem === 'note' && <div className="max-w-3xl mx-auto w-full"><NoteImporter onAddSource={handleAddSource} /></div>}
                                    {activeSidebarItem === 'drive' && <div className="max-w-3xl mx-auto w-full"><DriveImporter onAddSource={handleAddSource} /></div>}
                                    {activeSidebarItem === 'file' && <div className="max-w-3xl mx-auto w-full"><FileUploader onAddSource={handleAddSource} /></div>}
                                    {activeSidebarItem === 'text' && <div className="max-w-3xl mx-auto w-full"><DirectTextInput onAddSource={handleAddSource} /></div>}
                                </div>
                                <div className="w-full xl:w-[400px] shrink-0 h-[500px] xl:h-auto">
                                    <RagChatbot 
                                        contextData={sources.map(s => s.content).join('\n\n')} 
                                        pageTitle={SIDEBAR_MENU.find(g => g.category === 'input')?.items.find(i => i.id === activeSidebarItem)?.label} 
                                    />
                                </div>
                            </div>
                        )}
                        
                        {activeSidebarItem === 'rag_chat' && (
                            <div className="w-full h-full overflow-hidden">
                                <RagChatbot isGlobal={true} />
                            </div>
                        )}

                        {activeSidebarItem === 'image_studio' && <div className="max-w-4xl mx-auto w-full"><ImageStudio /></div>}
                        {activeSidebarItem === 'mixer' && <div className="w-full h-full"><AlchemyStorageManager onProcessText={(text, method) => { setSources([{ id: Date.now().toString(), type: 'text', content: text, metadata: { fileName: 'Từ Kho Dữ Liệu' } }]); handleMethodSelect(method, text); }} onPushToGraph={(nodes) => { if (onAddNodes) { onAddNodes(nodes); } else { nodes.forEach(n => onAddNode(n)); } alert("Đã đẩy flashcards lên Sơ đồ tri thức!"); onGoToGraph(); }} /></div>}
                        
                        {activeSidebarItem === 'ai_methods' && (
                            <div className="max-w-4xl mx-auto w-full">
                                <div className={`w-full flex justify-between mb-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest relative transition-opacity duration-300 ${isZenMode ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
                                    {['method', 'processing', 'refinement', 'result'].map((s) => {
                                        const isActive = step === s || (step === 'input' && s === 'method'); 
                                        return (
                                            <div key={s} className={`bg-[#F8F9FA] px-2 flex items-center gap-1 ${isActive ? 'text-sky-600 scale-110' : 'text-slate-400'} transition-all duration-300`}>
                                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-sky-500 shadow-[0_0_10px_skyblue]' : 'bg-slate-300'}`}></div>
                                                <span className="hidden sm:inline">{s}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {step === 'method' && <MethodSelector onSelect={handleMethodSelect} sourceContent={sources.map(s => s.content).join(' ')} />}
                                {step === 'processing' && <ProcessingView status={statusMessage} progress={progressStep} />}
                                {step === 'refinement' && <RefinementView title={tempNodeData?.title} onRefine={handleRefinementAction} onNext={handleFinalize} isHighlighterActive={isHighlighterActive} toggleHighlighter={() => setIsHighlighterActive(!isHighlighterActive)} initialContent={generatedContentString} />}
                                {step === 'result' && (
                                    <>
                                        <ResultView isScanningResonance={isScanningResonance} resonanceMatches={resonanceMatches} onLinkNode={(id) => { if (onUpdateNode && createdNodeId) { alert(`Linked to ${id}`); } }} onReset={reset} onGoToGraph={onGoToGraph} onPublish={handlePublishToLibrary} />
                                        <div className="absolute top-4 right-4"><MysteryBoxReward onOpen={() => alert("Bạn nhận được 50 XP và Skin: 'Neon'!")} /></div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeSidebarItem === 'deep_read' && <ChunkingText content={sources[0]?.content || ''} onComplete={handleDeepReadComplete} />}
                        
                        {activeSidebarItem === 'roadmap_forge' && (
                            <div className="max-w-4xl mx-auto w-full h-full flex flex-col gap-6">
                                {roadmapData.stages.length === 0 ? (
                                    <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white shadow-xl flex flex-col gap-6 animate-fadeIn">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-sky-100 rounded-2xl text-sky-600 shadow-sm">
                                                <span className="material-symbols-outlined text-4xl">architecture</span>
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">AI Roadmap Forge</h2>
                                                <p className="text-slate-500 font-medium">Tạo lộ trình học tập hệ thống dựa trên kho dữ liệu cá nhân.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">Chủ đề lộ trình</label>
                                                <textarea 
                                                    value={roadmapQuery}
                                                    onChange={(e) => setRoadmapQuery(e.target.value)}
                                                    placeholder="Ví dụ: 'Lập trình React nâng cao', 'Lịch sử triết học Hy Lạp'..."
                                                    className="w-full h-32 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-sky-400 focus:bg-white outline-none transition-all text-sm font-medium resize-none shadow-inner"
                                                />
                                            </div>
                                            
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">Mức độ thử thách</label>
                                                    <div className="flex gap-2">
                                                        {['Easy', 'Medium', 'Hard'].map(d => (
                                                            <button 
                                                                key={d}
                                                                onClick={() => setRoadmapDifficulty(d)}
                                                                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${roadmapDifficulty === d ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                            >
                                                                {d}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-end">
                                                        <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">Số giai đoạn (Levels)</label>
                                                        <span className="text-lg font-black text-sky-600">{roadmapStagesCount}</span>
                                                    </div>
                                                    <input 
                                                        type="range" min="2" max="6" step="1" 
                                                        value={roadmapStagesCount}
                                                        onChange={(e) => setRoadmapStagesCount(parseInt(e.target.value))}
                                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-600 transition-all"
                                                    />
                                                </div>

                                                <button 
                                                    onClick={handleGenerateRoadmap}
                                                    disabled={isGeneratingRoadmap || !roadmapQuery.trim()}
                                                    className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-2xl shadow-lg shadow-sky-100 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                                >
                                                    {isGeneratingRoadmap ? (
                                                        <>
                                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                                            Đang Phác Thảo Lộ Trình...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined">auto_awesome</span>
                                                            Bắt Đầu Chế Tạo Hệ Thống
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <RoadmapPreview 
                                        title={roadmapData.title}
                                        stages={roadmapData.stages}
                                        isGenerating={isGeneratingRoadmap}
                                        onCommit={() => { onGoToGraph(); reset(); }}
                                        onCancel={() => reset()}
                                    />
                                )}
                            </div>
                        )}

                        {activeSidebarItem === 'manual' && <ManualLessonCreator isOpen={true} onClose={() => setActiveSidebarItem('mixer')} sourceContent={sources.map(s => s.content).join('\n\n')} onSave={handleManualCreationSave} />}
                        {activeSidebarItem === 'json_editor' && <EditorAll isOpen={true} onClose={() => setActiveSidebarItem('mixer')} initialNode={editTargetNode} userNodes={userNodes} onUpdateNode={(node) => { if(onUpdateNode) onUpdateNode(node); }} />}
                        
                        {activeSidebarItem === 'marketplace' && (
                            <div className="flex gap-6 h-full">
                                <div className="flex-1 overflow-y-auto pr-2"><MarketplaceGrid /></div>
                                <div className="w-72 shrink-0 overflow-y-auto"><CreatorProfile /></div>
                            </div>
                        )}
                        {activeSidebarItem === 'achievements' && (
                            <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
                                <AchievementCabinet />
                            </div>
                        )}
                        {activeSidebarItem === 'leaderboard' && <div className="max-w-md mx-auto w-full"><LeaderboardWidget /></div>}
                        {activeSidebarItem === 'study_group' && <div className="max-w-md mx-auto w-full"><StudyGroupHub /></div>}
                        
                        {activeSidebarItem === 'integrations' && (
                            <div className="max-w-3xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                                <NotionSyncConfig />
                                <AnkiConnectConfig />
                                <GoogleDrivePicker />
                            </div>
                        )}
                        {activeSidebarItem === 'api_monitor' && <div className="max-w-3xl mx-auto w-full"><ApiUsageMonitor /></div>}
                        {activeSidebarItem === 'error_log' && <div className="max-w-3xl mx-auto w-full"><ErrorLogConsole /></div>}

                        {/* If in input category, show a quick action bar at the bottom */}
                        {['url', 'youtube', 'ocr', 'audio', 'mixer'].includes(activeSidebarItem) && (
                            <div className="mt-auto pt-8 flex justify-center gap-4 flex-wrap relative z-10">
                                <button onClick={() => setActiveSidebarItem('mixer')} className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-full border border-slate-200 shadow-sm transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xl text-sky-500">blender</span> Xem Kho Dữ Liệu ({sources.length})
                                </button>
                                <button onClick={handleStartProcess} className="px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-2xl animate-pulse">science</span> Xử lý dữ liệu
                                </button>
                            </div>
                        )}
                    </div>
                </GlassSurface>
            </main>
            <GuidePopupModal guide={activeGuide ? GUIDE_DATA[activeGuide] : null} onClose={() => setActiveGuide(null)} />
            </div>
        </div>
        </DroppableZone>
    );
};

export default React.memo(Alchemy);
