export type InteractionType = 'view_feature' | 'click_element' | 'create_content' | 'complete_task' | 'use_ai' | 'search' | 'login' | 'logout';

export interface BehaviorLog {
    timestamp: number;
    type: InteractionType;
    context: string;
    detail?: string;
}

export interface SM2Data {
    repetitions: number;
    interval: number;
    efactor: number;
    nextReviewDate: string;
}

export interface FlashcardItem {
    front: string;
    back: string;
    sm2?: SM2Data;
}

export interface QuizItem {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    sm2?: SM2Data;
}

export type NodeShape = 'circle' | 'square' | 'hexagon' | 'diamond' | 'triangle' | 'star';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export type InteractionMode = 'none' | 'linking' | 'clustering' | 'expanding';

export interface KnowledgeNode {
    id: string;
    title: string;
    type: string;
    status: string; // 'new' | 'learning' | 'review' | 'mastered'
    tags?: string[];
    x: number;
    y: number;
    z?: number; // 3D
    vx?: number; // Physics
    vy?: number;
    radius?: number;
    color?: string;
    shape?: NodeShape;
    timestamp: Date | string;
    data?: {
        summary?: string;
        flashcards?: FlashcardItem[];
        quiz?: QuizItem[];
        fillInBlanks?: any[];
        spotErrors?: any[];
        caseStudies?: any[];
        [key: string]: any;
    };
    imageUrl?: string;
    connectedNodeIds?: string[];
    mastery?: number;
    parentNodeId?: string;
    relationshipLabel?: string;
    originalAuthor?: string;
    
    // UI Helpers
    isBlocked?: boolean;
    _sortScore?: number;
    _daysUntilDue?: number;
    _weaknessAnalysis?: any;
    animPhase?: number;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    progress: number;
    goal: number;
    rewardXP: number;
    unlockedAt?: string;
    isAiGenerated?: boolean;
    isSecret?: boolean;
}

export interface AIAchievementSuggestion {
    id: string;
    title: string;
    reason: string;
    task: string;
    potentialReward: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface PathLevel {
    id: string;
    title: string;
    description: string;
    status: 'locked' | 'unlocked' | 'learning_passed' | 'completed';
    learningContent?: any[]; // Flashcards mostly
    quizContent?: any[];
}

export interface SavedLearningPath {
    id: string;
    title: string;
    createdAt: string;
    levels: PathLevel[];
    progress: number;
}

export interface Feature {
    icon: string;
    title: string;
    description: string;
}

export interface Testimonial {
    id: number;
    name: string;
    date: string;
    avatar: string;
    content: string;
    rating: number;
}

export interface ChatMessage {
    id?: string;
    role: 'user' | 'model' | 'system';
    text: string;
    timestamp: Date;
    isThinking?: boolean;
}

export interface UserAccount {
    id: string;
    name: string;
    email: string;
    avatar: string;
    isAdmin: boolean;
    friendCode?: string;
    friends?: string[]; // IDs
    joinedDate: string;
    isBanned?: boolean;
    persona?: any;
    
    // Gamification
    xp?: number;
    level?: number;
    streak?: number;
    lastCheckIn?: string;
    lp?: number;
    rankTier?: string;
    
    // CRM
    ltv?: number;
    riskScore?: number;
    lastDevice?: string;
    segments?: string[];
    engagementScore?: number;
    lastActive?: string;
}

export interface AlchemySource {
    id: string;
    type: 'text' | 'url' | 'youtube' | 'image' | 'audio';
    content: string;
    metadata?: {
        fileName?: string;
        title?: string;
        url?: string;
        confidence?: number;
        duration?: string;
        audioData?: string;
    };
}

export interface AlchemySettings {
    personaId: string;
    difficulty: number;
    targetLanguage: string;
    templateId: string;
}

export interface AlchemyIntent {
    type: 'create' | 'expand' | 'refine' | 'connect' | 'visualize' | 'quiz' | 'repair' | 'search_create' | 'style_transfer' | 'edit' | 'bulk-create' | 'project-visualizer';
    initialQuery?: string;
    label?: string; // For title
    data?: any; // For raw content
    sourceNodes?: KnowledgeNode[];
    targetNodeId?: string;
    tasks?: any[]; // For bulk todo
    graphData?: any; // For project visualizer
    priority?: number; // For todo
}

export interface SavedChatSession {
    id: string;
    title: string;
    date: string;
    personaId: string;
    messages: ChatMessage[];
}

export interface TutorPersona {
    id: string;
    name: string;
    description: string;
    icon: string;
    systemInstruction: string;
    color: string;
}

export type ToolType = 'selection' | 'rectangle' | 'diamond' | 'ellipse' | 'arrow' | 'line' | 'freedraw' | 'text' | 'eraser' | 'hand' | 'highlighter' | 'sticker';
export type PageTemplate = 'blank' | 'grid' | 'ruled' | 'dotted' | 'mindmap';
export type CanvasMode = 'infinite' | 'page';

export interface DrawingPoint {
    x: number;
    y: number;
}

export interface DrawingElement {
    id: string;
    type: ToolType;
    x: number;
    y: number;
    width: number;
    height: number;
    strokeColor: string;
    backgroundColor: string;
    strokeWidth: number;
    opacity: number;
    fontSize?: number;
    points?: DrawingPoint[];
    text?: string;
    isDeleted?: boolean;
}

export interface SavedDrawing {
    id: string;
    name: string;
    date: string;
    elements: DrawingElement[];
    template?: PageTemplate;
    mode?: CanvasMode;
    pageCount?: number;
}

export interface Quest {
    id: string;
    title: string;
    type: 'Daily' | 'Weekly' | 'Epic' | 'LearningPath';
    progress: number;
    total: number;
    reward: string;
    completed: boolean;
    description: string;
    targetNodeIds?: string[];
}

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Subtask {
    id: string;
    content: string;
    isCompleted: boolean;
}

export interface TodoAttachment {
    id: string;
    name: string;
    url: string;
    type: 'file' | 'image';
}

export interface TodoComment {
    id: string;
    text: string;
    createdAt: string;
    author: string;
}

export interface TodoTask {
    id: string;
    content: string;
    description?: string;
    priority: 1 | 2 | 3 | 4;
    dueDate: string | null;
    projectId?: string;
    isCompleted: boolean;
    completedAt?: string;
    tags?: string[];
    subtasks?: Subtask[];
    status?: 'todo' | 'in-progress' | 'done' | 'backlog';
    startDate?: string;
    isMilestone?: boolean;
    reminderTime?: string;
    recurrence?: RecurrenceType;
    isDeleted?: boolean;
    linkedFeature?: string;
    attachments?: TodoAttachment[];
    comments?: TodoComment[];
    progress?: number; // 0-100 for Gantt
}

export interface Project {
    id: string;
    name: string;
    color: string;
    icon: string;
}

export interface LeaderboardEntry {
    id: string;
    name: string;
    avatar: string;
    tier: string;
    lp: number;
    rank: number;
    friends?: string[];
}

export interface RankProfile {
    tier: string; // Iron, Bronze, ...
    division: string; // I, II, III, IV
    lp: number;
    totalWins: number;
    totalLosses: number;
    seasonPoints: {
        daily: number;
        weekly: number;
        monthly: number;
    };
    matchHistory: {
        id: string;
        result: 'Victory' | 'Defeat';
        lpChange: number;
        timestamp: string;
    }[];
}

export interface AlchemyPersona {
    id: string;
    name: string;
    role: string;
    icon: string;
}

export interface AlchemyTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export type MarketplaceItemType = 'Deck' | 'Link' | 'Video';

export interface MarketplaceItem {
    id: string;
    title: string;
    author: string;
    type: MarketplaceItemType;
    price: string | number;
    category: string;
    rating?: number;
    students?: number;
    url?: string;
    description?: string;
    status?: string;
    payload?: any;
}

export interface ReportItem {
    id: string;
    type: string;
    content: string;
    reporter: string;
    timestamp: number;
    status: 'pending' | 'resolved' | 'dismissed';
    targetType: string;
}

export interface FeedbackItem {
    id: string;
    type: string;
    priority: string;
    content: string;
    userName: string;
    timestamp: number;
    status: 'New' | 'In Progress' | 'Resolved';
    reply?: string;
}

export interface AuditLogItem {
    id: string;
    category: 'Security' | 'Action' | 'System';
    actor: string;
    action: string;
    target?: string;
    timestamp: number;
}

export interface AnalyticsData {
    dailyActiveUsers: number[];
    newSignups: number[];
    aiTokensConsumed: number[];
    featureUsage: { name: string, count: number }[];
    retentionRate: number;
}

export interface FeatureFlag {
    id: string;
    key: string;
    name: string;
    description: string;
    isEnabled: boolean;
    rolloutPercentage: number;
}

export interface AlchemyLogItem {
    id: string;
    timestamp: number;
    userName: string;
    action: string;
    type: string;
}

export type DriveFileType = 'folder' | 'pdf' | 'doc' | 'txt' | 'image' | 'unknown';

export interface DriveFile {
    id: string;
    parentId: string | null;
    name: string;
    type: DriveFileType;
    size: string;
    lastModified: string;
    owner: string;
    isStarred: boolean;
    isTrashed: boolean;
    content?: string;
}

export type BlockType = 'text' | 'h1' | 'h2' | 'h3' | 'bullet' | 'todo' | 'image' | 'code' | 'quote' | 'mermaid' | 'drive_file' | 'numbered' | 'divider' | 'table' | 'callout' | 'ai_magic';

export interface NoteBlock {
    id: string;
    type: BlockType;
    content: string;
    properties?: any;
}

export interface NotePage {
    id: string;
    parentId: string | null;
    type: 'note' | 'folder' | 'project';
    title: string;
    icon: string;
    coverImage?: string | null;
    blocks: NoteBlock[];
    updatedAt: Date;
    isExpanded?: boolean;
    projectMetadata?: {
        status: 'planning' | 'in-progress' | 'paused' | 'done';
        progress: number;
    };
}

export type FileSystemType = 'note' | 'folder' | 'project';

export interface FlowStep {
    id: string;
    label: string;
    icon: string;
    description: string;
    color?: string;
    bgColor?: string;
    targetView: string; 
    expectedStateCheck?: (appState: any) => string;
}

export interface AdminUserFlow {
    id: string;
    title: string;
    category: 'Onboarding' | 'Learning' | 'Social' | 'Creation' | 'System';
    summary?: string; 
    complexity?: 'Easy' | 'Medium' | 'Hard';
    timeEstimate?: string;
    description: string;
    steps: FlowStep[];
}

export interface UserCluster {
    id: string;
    label: string;
    color: string;
    nodeIds: string[]; 
    centroid?: { x: number, y: number };
    bounds?: { minX: number, minY: number, maxX: number, maxY: number, radius?: number };
    createdID?: string;
}

export type StorageSourceType = 'note' | 'ocr' | 'voice' | 'web' | 'upload' | 'youtube' | 'unified' | 'drive';

export interface AlchemyStorageItem {
    id: string;
    sourceType: StorageSourceType;
    title: string;
    originalContent?: string; // e.g., image URL, audio URL, raw HTML
    extractedText: string;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
}

export interface AlchemyStorageFlashcard {
    id: string;
    sourceItemId?: string; // Link to the storage item it came from
    front: string;
    back: string;
    tags: string[];
    deckId?: string;
    deckName?: string;
    isSelected?: boolean; // UI state
}
