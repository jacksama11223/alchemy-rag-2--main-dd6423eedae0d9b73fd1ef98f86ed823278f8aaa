
// ... (Previous imports)
import { 
    UserAccount, 
    KnowledgeNode, 
    MarketplaceItem, 
    RankProfile, 
    LeaderboardEntry, 
    // ... other imports
    ReportItem,
    FeedbackItem,
    AuditLogItem,
    AnalyticsData,
    FeatureFlag,
    InteractionType,
    AlchemyIntent,
    SavedChatSession,
    SavedDrawing, 
    NotePage,
    TodoTask,
    DriveFile,
    UserCluster
} from '../types';

// API Configuration
// Changed to relative path to utilize Vite Proxy (handles HTTPS -> HTTP)
const API_URL = '/api'; 

export const getAuthHeader = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
        if (typeof window !== 'undefined') {
            const apiKey = window.localStorage.getItem('custom_gemini_api_key') || window.localStorage.getItem('gemini_api_key') || window.localStorage.getItem('geminiApiKey');
            if (apiKey) {
                headers['x-gemini-api-key'] = apiKey;
            }

            let userStr = window.localStorage.getItem('learnai_session') || window.localStorage.getItem('userInfo');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user && user.token) {
                    headers['Authorization'] = `Bearer ${user.token}`;
                }
            }
        }
    } catch (e) {
        console.error("Error formatting auth header", e);
    }
    return headers;
};

// ... (Rest of file remains unchanged)
// --- SOCIAL MESSAGING (DIRECT) ---
export const getDirectMessages = async (targetId: string): Promise<any[]> => {
    try {
        const response = await fetch(`${API_URL}/social/messages/${targetId}`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const sendDirectMessage = async (targetId: string, content: string): Promise<any | null> => {
    try {
        const response = await fetch(`${API_URL}/social/messages`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ targetId, content })
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error(e); }
    return null;
};

// --- SOCIAL MESSAGING (CHANNELS) ---
export const getChannelMessagesApi = async (channelId: string): Promise<any[]> => {
    try {
        const response = await fetch(`${API_URL}/social/channels/${channelId}`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const sendChannelMessageApi = async (channelId: string, content: string): Promise<any | null> => {
    try {
        const response = await fetch(`${API_URL}/social/channels`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ channelId, content })
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error(e); }
    return null;
};

// ... (Existing functions: Users, Nodes, Market, Chat, Drawings, Notes, Todos, Files, Tools, Clusters)

export const getClustersFromBackend = async (): Promise<UserCluster[]> => {
// ... (rest of file remains same)
    try {
        const response = await fetch(`${API_URL}/clusters`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const createClusterInBackend = async (cluster: Omit<UserCluster, 'id'>): Promise<UserCluster | null> => {
    try {
        const response = await fetch(`${API_URL}/clusters`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(cluster)
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error(e); }
    return null;
};

export const updateClusterInBackend = async (cluster: UserCluster): Promise<UserCluster | null> => {
    try {
        const response = await fetch(`${API_URL}/clusters/${cluster.id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({
                label: cluster.label,
                color: cluster.color,
                nodeIds: cluster.nodeIds
            })
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error(e); }
    return null;
};

export const deleteClusterFromBackend = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/clusters/${id}`, { method: 'DELETE', headers: getAuthHeader() });
        return response.ok;
    } catch (e) { return false; }
};

export const getAllUsers = async (): Promise<UserAccount[]> => {
    try {
        const response = await fetch(`${API_URL}/users`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const getCurrentUser = (): UserAccount | null => {
    try {
        const s = typeof window !== 'undefined' ? window.localStorage.getItem('learnai_session') : null;
        return s ? JSON.parse(s) : null;
    } catch (e) { return null; }
};

export const loginUser = async (email: string, password: string) => {
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            if (typeof window !== 'undefined') window.localStorage.setItem('learnai_session', JSON.stringify(data));
            return { success: true, user: data };
        } else {
            return { success: false, message: data.message || "Login failed" };
        }
    } catch (e) { return { success: false, message: "Server error" }; }
};

export const registerUser = async (email: string, password: string, name: string) => {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            if (typeof window !== 'undefined') window.localStorage.setItem('learnai_session', JSON.stringify(data));
            return { success: true, user: data };
        } else {
            return { success: false, message: data.message || "Registration failed" };
        }
    } catch (e) { return { success: false, message: "Server error" }; }
};

export const sendOTP = async (email: string) => {
    try {
        const response = await fetch(`${API_URL}/users/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        return { success: response.ok, message: data.message };
    } catch (e) { return { success: false, message: "Server error" }; }
};

export const verifyOTPAndRegister = async (email: string, otp: string, name: string, password: string) => {
    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, name, password })
        });
        const data = await response.json();
        if (response.ok) {
            if (typeof window !== 'undefined') window.localStorage.setItem('learnai_session', JSON.stringify(data));
            return { success: true, user: data };
        } else {
            return { success: false, message: data.message || "Registration failed" };
        }
    } catch (e) { return { success: false, message: "Server error" }; }
};

export const requestPasswordReset = async (email: string) => {
    try {
        const response = await fetch(`${API_URL}/users/request-reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        return { success: response.ok, message: data.message };
    } catch (e) { return { success: false, message: "Server error" }; }
};

export const resetPassword = async (token: string, newPassword: string) => {
    try {
        const response = await fetch(`${API_URL}/users/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        });
        const data = await response.json();
        return { success: response.ok, message: data.message };
    } catch (e) { return { success: false, message: "Server error" }; }
};

export const socialLogin = async (idToken: string, provider: string) => {
    console.log('socialLogin called with:', { idToken, provider, type: typeof idToken });
    try {
        const response = await fetch(`${API_URL}/users/social`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken, provider })
        });
        const data = await response.json();
        if (response.ok) {
            if (typeof window !== 'undefined') window.localStorage.setItem('learnai_session', JSON.stringify(data));
            return { success: true, user: data };
        } else {
            return { success: false, message: data.message || "Social login failed" };
        }
    } catch (e) { return { success: false, message: "Server error" }; }
};

export const logoutUser = () => {
    if (typeof window !== 'undefined') window.localStorage.removeItem('learnai_session');
};

export const updateUserProfile = async (updates: { name?: string, email?: string, password?: string }) => {
    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(updates)
        });
        const data = await response.json();
        if (response.ok) {
            const currentSession = getCurrentUser();
            if (typeof window !== 'undefined') {
                const newSession = { ...currentSession, ...data };
                window.localStorage.setItem('learnai_session', JSON.stringify(newSession));
            }
            return { success: true, user: data };
        }
        return { success: false, message: data.message };
    } catch (e) { return { success: false, message: "Network error" }; }
};

export const sendFriendRequestApi = async (targetUserId: string) => {
    try {
        const response = await fetch(`${API_URL}/users/friend-request`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ targetUserId })
        });
        return await response.json();
    } catch (e) { return { message: "Error sending request" }; }
};

export const fetchNotifications = async () => {
    try {
        const response = await fetch(`${API_URL}/users/notifications`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
        return [];
    } catch (e) { return []; }
};

export const markNotificationRead = async (notificationId: string) => {
    try {
        const response = await fetch(`${API_URL}/users/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: getAuthHeader()
        });
        if (response.ok) return await response.json();
    } catch (e) { return null; }
};

export const respondToFriendRequestApi = async (notificationId: string, action: 'accept' | 'decline') => {
    try {
        const response = await fetch(`${API_URL}/users/friend-response`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ notificationId, action })
        });
        if (response.ok) return await response.json();
    } catch (e) { return null; }
};

export const checkInUser = async () => {
    try {
        const response = await fetch(`${API_URL}/users/checkin`, {
            method: 'POST',
            headers: getAuthHeader()
        });
        const data = await response.json();
        if (response.ok) {
            const user = getCurrentUser();
            if (user) {
                user.xp = data.xp;
                user.streak = data.streak;
                user.level = data.level;
                if (typeof window !== 'undefined') window.localStorage.setItem('learnai_session', JSON.stringify(user));
            }
            return { success: true, streak: data.streak, xp: data.xp, message: data.message };
        }
        return { success: false, streak: 0, xp: 0, message: data.message };
    } catch (e) { return { success: false, streak: 0, xp: 0, message: "Network error" }; }
};

export const saveDrawingToBackend = async (drawing: SavedDrawing): Promise<SavedDrawing | null> => {
    try {
        const response = await fetch(`${API_URL}/drawings`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(drawing)
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error("Save drawing failed", e); }
    return null;
};

export const getDrawingsFromBackend = async (): Promise<SavedDrawing[]> => {
    try {
        const response = await fetch(`${API_URL}/drawings`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const deleteDrawingFromBackend = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/drawings/${id}`, { method: 'DELETE', headers: getAuthHeader() });
        return response.ok;
    } catch (e) { return false; }
};

export const saveNoteToBackend = async (note: NotePage): Promise<NotePage | null> => {
    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(note)
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error(e); }
    return null;
};

export const getNotesFromBackend = async (): Promise<NotePage[]> => {
    try {
        const response = await fetch(`${API_URL}/notes`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const deleteNoteFromBackend = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/notes/${id}`, { method: 'DELETE', headers: getAuthHeader() });
        return response.ok;
    } catch (e) { return false; }
};

export const getTodosFromBackend = async (): Promise<TodoTask[]> => {
    try {
        const response = await fetch(`${API_URL}/todos`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const saveTodoToBackend = async (todo: TodoTask): Promise<TodoTask | null> => {
    try {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(todo)
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error(e); }
    return null;
};

export const updateTodoInBackend = async (id: string, todo: TodoTask): Promise<TodoTask | null> => {
    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(todo)
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error(e); }
    return null;
};

export const deleteTodoFromBackend = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE', headers: getAuthHeader() });
        return response.ok;
    } catch (e) { return false; }
};

export const getFilesFromBackend = async (): Promise<DriveFile[]> => {
    try {
        const response = await fetch(`${API_URL}/files`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const saveFileToBackend = async (file: DriveFile): Promise<DriveFile | null> => {
     try {
        const response = await fetch(`${API_URL}/files`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(file)
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error(e); }
    return null;
};

export const deleteFileFromBackend = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/files/${id}`, { method: 'DELETE', headers: getAuthHeader() });
        return response.ok;
    } catch (e) { return false; }
};

export const scrapeWebsite = async (url: string): Promise<{ html: string, text: string }> => {
    try {
        const response = await fetch(`${API_URL}/tools/scrape`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ url })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Scrape failed');
        }
        const data = await response.json();
        return { 
            html: data.content || '', 
            text: data.textContent || '' 
        };
    } catch (e: any) { throw e; }
};

export const processImageWithVisionAPI = async (base64Image: string, mimeType?: string): Promise<string> => {
    try {
        const response = await fetch(`${API_URL}/tools/vision-ocr`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ base64Image, mimeType })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Vision OCR failed');
        }
        const data = await response.json();
        return data.content || '';
    } catch (e: any) { throw e; }
};

export const createNode = async (nodeData: any): Promise<KnowledgeNode | null> => {
    try {
        const response = await fetch(`${API_URL}/nodes`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(nodeData)
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error("Create node failed", e); }
    return null;
};

export const fetchUserNodesFromServer = async (): Promise<KnowledgeNode[]> => {
    try {
        const response = await fetch(`${API_URL}/nodes`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) { console.error("Fetch nodes failed", e); }
    return [];
};

export const saveUserNodes = async (nodes: KnowledgeNode[]): Promise<KnowledgeNode[] | null> => {
    try {
        const response = await fetch(`${API_URL}/nodes/sync`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ nodes })
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error("Save nodes failed", e); }
    return null;
}; 
export const getUserNodes = () => [];
export const getUserNodesByUserId = (id: string) => [];
export const createNodeInBackend = async (node: Omit<KnowledgeNode, 'id'>): Promise<KnowledgeNode | null> => {
    try {
        const response = await fetch(`${API_URL}/nodes`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(node)
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error("Create node failed", e); }
    return null;
};

export const updateNodeInBackend = async (node: KnowledgeNode): Promise<KnowledgeNode | null> => {
    try {
        const response = await fetch(`${API_URL}/nodes/${node.id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(node)
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error("Update node failed", e); }
    return null;
};

export const deleteNodeInBackend = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/nodes/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        return response.ok;
    } catch (e) { console.error("Delete node failed", e); }
    return false;
};

export const getDueNodesFromBackend = async (): Promise<KnowledgeNode[]> => {
    try {
        const response = await fetch(`${API_URL}/nodes/due`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) { console.error("Fetch due nodes failed", e); }
    return [];
};

export const reviewNodeItemInBackend = async (nodeId: string, itemType: string, itemIndex: number, quality: number): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/nodes/${nodeId}/review`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ itemType, itemIndex, quality })
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error("Review item failed", e); }
    return null;
};

export const saveChatSession = async (session: SavedChatSession): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({
                title: session.title,
                personaId: session.personaId,
                messages: session.messages
            })
        });
        return response.ok;
    } catch (e) { return false; }
};

export const fetchChatSessions = async (): Promise<SavedChatSession[]> => {
    try {
        const response = await fetch(`${API_URL}/chat`, { headers: getAuthHeader() });
        if (response.ok) {
            const data = await response.json();
            return data.map((item: any) => ({
                ...item,
                id: item._id, 
                date: new Date(item.updatedAt).toLocaleDateString()
            }));
        }
    } catch (e) {}
    return [];
};

export const deleteChatSession = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/chat/${id}`, { method: 'DELETE', headers: getAuthHeader() });
        return response.ok;
    } catch (e) { return false; }
};

export const getMarketplaceFeed = async () => {
    try {
        const response = await fetch(`${API_URL}/market`);
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};
export const fetchMarketplace = async () => {
    return await getMarketplaceFeed();
};
export const getPendingMarketplaceItems = async () => {
    try {
        const response = await fetch(`${API_URL}/market/pending`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};
export const publishItem = async (item: any) => {
    try {
        const response = await fetch(`${API_URL}/market`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(item)
        });
        if (response.ok) return await response.json();
    } catch (e) {}
    return null;
};
export const importItem = async (itemId: string) => {
    // In a real app, this would copy the item to the user's account
    return true;
};

export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    try {
        const response = await fetch(`${API_URL}/users/leaderboard`);
        if (response.ok) return await response.json();
    } catch (e) { console.error(e); }
    return [];
};

export const getUserFlows = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/user-flows`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};
export const getRankProfile = () => ({ tier: 'Iron', division: 'IV', lp: 0, totalWins: 0, totalLosses: 0, seasonPoints: { daily: 0, weekly: 0, monthly: 0 }, matchHistory: [] });
export const addXPToBackend = async (amount: number, reason: string) => {
    try {
        const response = await fetch(`${API_URL}/gamification/xp`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ amount, reason })
        });
        if (response.ok) return await response.json();
    } catch (e) {}
    return null;
};

export const updateRankPoints = async (points: number, result: string) => {
    try {
        const response = await fetch(`${API_URL}/gamification/rank`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ points, result })
        });
        if (response.ok) return await response.json();
    } catch (e) {}
    return { lp: 0, rankTier: 'Iron', rankDivision: 'IV' };
};

export const approveMarketplaceItem = (id: string) => {};
export const rejectMarketplaceItem = (id: string) => {};
export const deleteMarketplaceItem = (id: string) => {};
export const getReports = async (): Promise<ReportItem[]> => {
    try {
        const response = await fetch(`${API_URL}/admin/reports`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const resolveReport = async (id: string, action: string) => {
    try {
        const response = await fetch(`${API_URL}/admin/reports/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({ status: action })
        });
        if (response.ok) return await response.json();
    } catch (e) {}
};

export const createReport = async (reportData: any) => {
    try {
        const response = await fetch(`${API_URL}/admin/reports`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(reportData)
        });
        if (response.ok) return await response.json();
    } catch (e) {}
    return null;
};

export const getFeedbacks = async (): Promise<FeedbackItem[]> => {
    try {
        const response = await fetch(`${API_URL}/admin/feedbacks`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const getMyFeedbacks = async (): Promise<FeedbackItem[]> => {
    try {
        const response = await fetch(`${API_URL}/admin/my-feedbacks`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const createFeedback = async (feedbackData: any) => {
    try {
        const response = await fetch(`${API_URL}/admin/feedbacks`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(feedbackData)
        });
        if (response.ok) return await response.json();
    } catch (e) {}
    return null;
};

export const updateFeedbackStatus = async (id: string, status: string, reply?: string) => {
    try {
        const response = await fetch(`${API_URL}/admin/feedbacks/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({ status, reply })
        });
        if (response.ok) return await response.json();
    } catch (e) {}
};

export const sendBroadcast = async (title: string, message: string, type: string) => {
    try {
        const response = await fetch(`${API_URL}/admin/broadcast`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ title, message, type })
        });
        if (response.ok) return await response.json();
    } catch (e) {}
    return null;
};

export const getAuditLogs = async (): Promise<AuditLogItem[]> => {
    try {
        const response = await fetch(`${API_URL}/admin/audit-logs`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const getFeatureFlags = async (): Promise<FeatureFlag[]> => {
    try {
        const response = await fetch(`${API_URL}/admin/feature-flags`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const updateFeatureFlag = async (id: string, updates: any) => {
    try {
        const response = await fetch(`${API_URL}/admin/feature-flags/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(updates)
        });
        if (response.ok) return await response.json();
    } catch (e) {}
};

export const getRealAnalyticsDashboardData = async (): Promise<AnalyticsData[]> => {
    try {
        const response = await fetch(`${API_URL}/analytics/data`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const trackRealEvent = async (userId: string, type: string, data: any) => {
    try {
        await fetch(`${API_URL}/analytics/behavior-logs`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ type, context: JSON.stringify(data), user: userId })
        });
    } catch (e) {}
};

export const getMyBehaviorLogs = async () => {
    try {
        const response = await fetch(`${API_URL}/analytics/my-behavior-logs`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const updateUserPersona = async (persona: any) => {
    try {
        const response = await fetch(`${API_URL}/users/persona`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({ persona })
        });
        if (response.ok) return await response.json();
    } catch (e) {}
    return null;
};

export const logAlchemyAction = async (userId: string, userName: string, action: string, type: string) => {
    try {
        await fetch(`${API_URL}/alchemy/logs`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ action, type, user: userId })
        });
    } catch (e) {}
};

export const getAlchemyLogs = async () => {
    try {
        const response = await fetch(`${API_URL}/alchemy/logs`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

// --- Alchemy Storage ---
export const getAlchemyStorageItems = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${API_URL}/alchemy/storage/items`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const saveAlchemyStorageItem = async (item: any): Promise<any | null> => {
    try {
        const response = await fetch(`${API_URL}/alchemy/storage/items`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(item)
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error(e); }
    return null;
};

export const updateAlchemyStorageItem = async (id: string, item: any): Promise<any | null> => {
    try {
        const response = await fetch(`${API_URL}/alchemy/storage/items/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(item)
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error(e); }
    return null;
};

export const deleteAlchemyStorageItem = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/alchemy/storage/items/${id}`, { method: 'DELETE', headers: getAuthHeader() });
        return response.ok;
    } catch (e) { return false; }
};

export const getAlchemyStorageFlashcards = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${API_URL}/alchemy/storage/flashcards`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const saveAlchemyStorageFlashcard = async (card: any): Promise<any | null> => {
    try {
        const response = await fetch(`${API_URL}/alchemy/storage/flashcards`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(card)
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error(e); }
    return null;
};

export const updateAlchemyStorageFlashcard = async (id: string, card: any): Promise<any | null> => {
    try {
        const response = await fetch(`${API_URL}/alchemy/storage/flashcards/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(card)
        });
        if (response.ok) return await response.json();
    } catch (e) { console.error(e); }
    return null;
};

export const deleteAlchemyStorageFlashcard = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/alchemy/storage/flashcards/${id}`, { method: 'DELETE', headers: getAuthHeader() });
        return response.ok;
    } catch (e) { return false; }
};

/**
 * Push an entire FlashcardDeck as ONE Knowledge Graph Node.
 * Backend will:
 *   1. Fetch the deck metadata + all AlchemyStorageFlashcard where deckId matches
 *   2. Create a single Node with data.flashcards = [{front, back}, ...]
 * Returns the created KnowledgeNode, or null on failure.
 */
export const pushFlashcardDeckToGraph = async (deckId: string): Promise<any | null> => {
    try {
        const response = await fetch(`${API_URL}/alchemy/push-deck-to-graph`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ deckId })
        });
        if (response.ok) return await response.json();
        const err = await response.json().catch(() => ({}));
        console.error('[pushFlashcardDeckToGraph] API error:', err.message);
    } catch (e) { console.error('[pushFlashcardDeckToGraph] Network error:', e); }
    return null;
};

export const sendSystemNotification = (title: string, message: string, type: string) => {};
export const getGlobalGraphStats = () => ({ totalNodes: 0, totalLinks: 0 });
export const addFriend = async (code: string) => {
    try {
        const response = await fetch(`${API_URL}/users/friend-request`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ targetUserId: code })
        });
        const data = await response.json();
        return { success: response.ok, message: data.message };
    } catch (e) { return { success: false, message: "Network Error" }; }
};
export const getFriendsList = async (): Promise<UserAccount[]> => {
    try {
        const response = await fetch(`${API_URL}/users/friends`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch(e) {}
    return [];
};
export const updateUserStatus = async (id: string, ban: boolean) => {
    try {
        const response = await fetch(`${API_URL}/users/${id}/status`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({ isBanned: ban })
        });
        if (response.ok) return await response.json();
    } catch (e) {}
    return null;
};

// --- Gamification ---
export const getQuests = async () => {
    try {
        const response = await fetch(`${API_URL}/gamification/quests`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const getAchievements = async () => {
    try {
        const response = await fetch(`${API_URL}/gamification/achievements`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

// --- Projects ---
export const getProjects = async () => {
    try {
        const response = await fetch(`${API_URL}/projects`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

// --- Learning Paths ---
export const getLearningPaths = async () => {
    try {
        const response = await fetch(`${API_URL}/learning-paths`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

// --- Admin User Flows ---
export const getLeaderboardData = async () => {
    try {
        const response = await fetch(`${API_URL}/gamification/leaderboard`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const getAdminUserFlows = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/user-flows`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

// --- Alchemy Personas & Templates ---
export const getTutorPersonas = async () => {
    try {
        const response = await fetch(`${API_URL}/alchemy/tutor-personas`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const getAlchemyTemplates = async () => {
    try {
        const response = await fetch(`${API_URL}/alchemy/templates`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};

export const getAlchemyPersonas = async () => {
    try {
        const response = await fetch(`${API_URL}/alchemy/personas`, { headers: getAuthHeader() });
        if (response.ok) return await response.json();
    } catch (e) {}
    return [];
};
