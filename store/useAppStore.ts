import { create } from 'zustand';
import { KnowledgeNode, SavedDrawing, AlchemyIntent, Quest, TodoTask, UserAccount, AdminUserFlow, UserCluster, InteractionMode } from '../types';
import { logoutUser } from '../services/mockBackend';
import { socketService } from '../services/socketService';

interface AppState {
  view: string;
  interactionMode: InteractionMode;
  isLoginModalOpen: boolean;
  isLoggedIn: boolean;
  isFriendManagerOpen: boolean;
  isTodoPanelOpen: boolean;
  isFeedbackModalOpen: boolean;
  impersonatingUser: UserAccount | null;
  adminSession: UserAccount | null;
  activeAdminFlow: AdminUserFlow | null;
  flowStepIndex: number;
  scrollToFeatures: boolean;
  userNodes: KnowledgeNode[];
  userClusters: UserCluster[];
  hasLoadedNodes: boolean;
  selectedNode: KnowledgeNode | null;
  activeTagFilter: string | null;
  focusedNodeId: string | null;
  quests: Quest[];
  activeAchievement: { title: string; desc: string } | null;
  tasks: TodoTask[];
  alchemyIntent: AlchemyIntent | null;
  tutorContext: string;
  tutorContextNode: KnowledgeNode | null;
  learningQueue: KnowledgeNode[];
  currentPlaylistIndex: number;
  currentDrawing: SavedDrawing | null;
  bridgeData: { target: string; content: string } | null;
  systemNotification: { title: string; message: string } | null;
  isOnboardingModalOpen: boolean;
  isOnboardingTourRun: boolean;

  // Actions
  setView: (view: string) => void;
  setInteractionMode: (mode: InteractionMode) => void;
  setIsLoginModalOpen: (isOpen: boolean) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setIsFriendManagerOpen: (isOpen: boolean) => void;
  setIsTodoPanelOpen: (isOpen: boolean) => void;
  setIsFeedbackModalOpen: (isOpen: boolean) => void;
  setImpersonatingUser: (user: UserAccount | null) => void;
  setAdminSession: (session: UserAccount | null) => void;
  setActiveAdminFlow: (flow: AdminUserFlow | null) => void;
  setFlowStepIndex: (index: number) => void;
  setScrollToFeatures: (scroll: boolean) => void;
  setUserNodes: (nodes: KnowledgeNode[] | ((prev: KnowledgeNode[]) => KnowledgeNode[])) => void;
  setUserClusters: (clusters: UserCluster[] | ((prev: UserCluster[]) => UserCluster[])) => void;
  setHasLoadedNodes: (loaded: boolean) => void;
  setSelectedNode: (node: KnowledgeNode | null) => void;
  setActiveTagFilter: (filter: string | null) => void;
  setFocusedNodeId: (id: string | null) => void;
  setQuests: (quests: Quest[] | ((prev: Quest[]) => Quest[])) => void;
  setActiveAchievement: (achievement: { title: string; desc: string } | null) => void;
  setTasks: (tasks: TodoTask[] | ((prev: TodoTask[]) => TodoTask[])) => void;
  setAlchemyIntent: (intent: AlchemyIntent | null) => void;
  setTutorContext: (context: string) => void;
  setTutorContextNode: (node: KnowledgeNode | null) => void;
  setLearningQueue: (queue: KnowledgeNode[] | ((prev: KnowledgeNode[]) => KnowledgeNode[])) => void;
  setCurrentPlaylistIndex: (index: number) => void;
  setCurrentDrawing: (drawing: SavedDrawing | null) => void;
  setBridgeData: (data: { target: string; content: string } | null) => void;
  setSystemNotification: (notification: { title: string; message: string } | null) => void;
  setIsOnboardingModalOpen: (isOpen: boolean) => void;
  setIsOnboardingTourRun: (run: boolean) => void;

  handleGoBackToDashboard: () => void;
  handleGoToFeatures: () => void;
  handleShowAbout: () => void;
  handleShowFAQ: () => void;
  handleShowAccount: () => void;
  handleFeatureSelect: (feature: string, params?: any) => void;
  handleLogout: () => void;
  toggleTodoPanel: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  view: 'landing',
  interactionMode: 'none',
  isLoginModalOpen: false,
  isLoggedIn: false,
  isFriendManagerOpen: false,
  isTodoPanelOpen: false,
  isFeedbackModalOpen: false,
  impersonatingUser: null,
  adminSession: null,
  activeAdminFlow: null,
  flowStepIndex: 0,
  scrollToFeatures: false,
  userNodes: [],
  userClusters: [],
  hasLoadedNodes: false,
  selectedNode: null,
  activeTagFilter: null,
  focusedNodeId: null,
  quests: [],
  activeAchievement: null,
  tasks: [],
  alchemyIntent: null,
  tutorContext: '',
  tutorContextNode: null,
  learningQueue: [],
  currentPlaylistIndex: 0,
  currentDrawing: null,
  bridgeData: null,
  systemNotification: null,
  isOnboardingModalOpen: false,
  isOnboardingTourRun: false,

  setView: (view) => set({ view }),
  setInteractionMode: (interactionMode) => set({ interactionMode }),
  setIsLoginModalOpen: (isLoginModalOpen) => set({ isLoginModalOpen }),
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  setIsFriendManagerOpen: (isFriendManagerOpen) => set({ isFriendManagerOpen }),
  setIsTodoPanelOpen: (isTodoPanelOpen) => set({ isTodoPanelOpen }),
  setIsFeedbackModalOpen: (isFeedbackModalOpen) => set({ isFeedbackModalOpen }),
  setImpersonatingUser: (impersonatingUser) => set({ impersonatingUser }),
  setAdminSession: (adminSession) => set({ adminSession }),
  setActiveAdminFlow: (activeAdminFlow) => set({ activeAdminFlow }),
  setFlowStepIndex: (flowStepIndex) => set({ flowStepIndex }),
  setScrollToFeatures: (scrollToFeatures) => set({ scrollToFeatures }),
  setUserNodes: (nodes) => set((state) => ({ userNodes: typeof nodes === 'function' ? (nodes as any)(state.userNodes) : nodes })),
  setUserClusters: (clusters) => set((state) => ({ userClusters: typeof clusters === 'function' ? (clusters as any)(state.userClusters) : clusters })),
  setHasLoadedNodes: (hasLoadedNodes) => set({ hasLoadedNodes }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
  setActiveTagFilter: (activeTagFilter) => set({ activeTagFilter }),
  setFocusedNodeId: (focusedNodeId) => set({ focusedNodeId }),
  setQuests: (quests) => set((state) => ({ quests: typeof quests === 'function' ? (quests as any)(state.quests) : quests })),
  setActiveAchievement: (activeAchievement) => set({ activeAchievement }),
  setTasks: (tasks) => set((state) => ({ tasks: typeof tasks === 'function' ? (tasks as any)(state.tasks) : tasks })),
  setAlchemyIntent: (alchemyIntent) => set({ alchemyIntent }),
  setTutorContext: (tutorContext) => set({ tutorContext }),
  setTutorContextNode: (tutorContextNode) => set({ tutorContextNode }),
  setLearningQueue: (learningQueue) => set((state) => ({ learningQueue: typeof learningQueue === 'function' ? (learningQueue as any)(state.learningQueue) : learningQueue })),
  setCurrentPlaylistIndex: (currentPlaylistIndex) => set({ currentPlaylistIndex }),
  setCurrentDrawing: (currentDrawing) => set({ currentDrawing }),
  setBridgeData: (bridgeData) => set({ bridgeData }),
  setSystemNotification: (systemNotification) => set({ systemNotification }),
  setIsOnboardingModalOpen: (isOnboardingModalOpen) => set({ isOnboardingModalOpen }),
  setIsOnboardingTourRun: (isOnboardingTourRun) => set({ isOnboardingTourRun }),

  handleGoBackToDashboard: () => { set({ view: 'dashboard' }); window.scrollTo({ top: 0, behavior: 'smooth' }); },
  handleGoToFeatures: () => { 
    const { view } = get();
    if (view !== 'dashboard') set({ view: 'dashboard' }); 
    set({ scrollToFeatures: true }); 
    if (view === 'dashboard') setTimeout(() => { const el = document.getElementById('feature-navigation-grid'); if(el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); 
  },
  handleShowAbout: () => { set({ view: 'about' }); window.scrollTo({ top: 0, behavior: 'smooth' }); },
  handleShowFAQ: () => { set({ view: 'faq' }); window.scrollTo({ top: 0, behavior: 'smooth' }); },
  handleShowAccount: () => { set({ view: 'account' }); window.scrollTo({ top: 0, behavior: 'smooth' }); },
  handleFeatureSelect: (feature: string, params?: any) => {
    if (feature === 'user-guide') set({ view: 'user-guide' });
    else if (feature === 'user-flow') set({ view: 'user-flow' });
    else if (feature === 'bridge' && params) { set({ bridgeData: params, view: 'bridge' }); }
    else if (feature === 'alchemy') { 
        if (params) set({ alchemyIntent: params });
        else set({ alchemyIntent: { type: 'create' } });
        set({ view: 'alchemy' }); 
    }
    else if (feature === 'knowledge-graph') { 
        if (params && params.nodeId) {
            const targetNode = get().userNodes.find(n => n.id === params.nodeId);
            if (targetNode) {
                set({ selectedNode: targetNode, focusedNodeId: params.nodeId });
            }
        } else {
            set({ activeTagFilter: null, focusedNodeId: null }); 
        }
        set({ view: 'explore-graph' }); 
    }
    else if (feature === 'media') { 
        if(params) set({ alchemyIntent: params });
        set({ view: 'media' });
    }
    else if (feature === 'tutor') { 
        if(params && params.context) {
            set({ tutorContext: params.context, tutorContextNode: params.contextNode || null });
        } else {
            set({ tutorContext: '', tutorContextNode: null });
        }
        set({ view: 'tutor' });
    }
    else if (feature === 'drive') set({ view: 'drive' }); 
    else if (feature === 'digest') { set({ view: 'digest' }); } 
    else if (feature === 'video') set({ view: 'video' });
    else if (feature === 'youtube') set({ view: 'youtube' });
    else if (feature === 'community') set({ view: 'community' }); 
    else if (feature === 'draw') set({ view: 'drawing-manager' }); 
    else if (feature === 'explore-graph') { 
        if (params && params.nodeId) {
            const targetNode = get().userNodes.find(n => n.id === params.nodeId);
            if (targetNode) {
                set({ selectedNode: targetNode, focusedNodeId: params.nodeId });
            }
        } else {
            set({ activeTagFilter: null, focusedNodeId: null }); 
        }
        set({ view: 'explore-graph' }); 
    }
    else if (feature === 'achievements') set({ view: 'achievements' });
    else if (feature === 'codex') set({ view: 'codex' });
    else if (feature === 'holodeck') set({ view: 'holodeck' });
    else if (feature === 'dashboard') set({ view: 'dashboard' });
    else if (feature === 'note' && params) {
         set({ alchemyIntent: params, view: 'media' });
    }
    else set({ view: 'tutor' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  handleLogout: () => {
    logoutUser();
    socketService.disconnect();
    set({ isLoggedIn: false, view: 'landing', userNodes: [], userClusters: [], tasks: [], quests: [], learningQueue: [], impersonatingUser: null, adminSession: null, activeAdminFlow: null });
    localStorage.removeItem('learnai_session');
    localStorage.removeItem('learnai_todos');
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  },
  toggleTodoPanel: () => set((state) => ({ isTodoPanelOpen: !state.isTodoPanelOpen })),
}));
