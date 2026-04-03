
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { BehaviorLog, InteractionType, Achievement } from '../types';
import { useGamification } from './GamificationContext';
import { trackRealEvent, getCurrentUser, getMyBehaviorLogs, updateUserPersona } from '../services/mockBackend'; // Import real tracker

// Helper for dynamic key
const getAI = () => {
    const customKey = localStorage.getItem('custom_gemini_api_key');
    return new GoogleGenAI({ apiKey: customKey || process.env.API_KEY || '' });
};

interface UserPersona {
    learningStyle: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Reading' | 'Mixed';
    focusTime: 'Morning' | 'Afternoon' | 'Night' | 'Erratic';
    strengths: string[];
    weaknesses: string[];
    suggestion: string;
}

interface BehaviorContextType {
    logAction: (type: InteractionType, context: string, detail?: string) => void;
    analyzeBehavior: () => Promise<void>;
    persona: UserPersona | null;
    isAnalyzing: boolean;
    logs: BehaviorLog[];
}

const BehaviorContext = createContext<BehaviorContextType | undefined>(undefined);

export const BehaviorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [logs, setLogs] = useState<BehaviorLog[]>([]);
    const [persona, setPersona] = useState<UserPersona | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    // UseRef to track timeout IDs for safe cleanup
    const analysisTimeoutRef = useRef<any>(null);

    // Connect to Gamification Context to unlock achievements
    const { unlockHiddenAchievement } = useGamification();
    
    // Load logs from local storage on mount
    useEffect(() => {
        const loadData = async () => {
            const currentUser = getCurrentUser();
            if (currentUser) {
                const fetchedLogs = await getMyBehaviorLogs();
                setLogs(fetchedLogs);
                if (currentUser.persona) {
                    setPersona(currentUser.persona);
                }
            } else {
                const savedLogs = localStorage.getItem('learnai_behavior_logs');
                const savedPersona = localStorage.getItem('learnai_user_persona');
                if (savedLogs) {
                    try {
                        const parsed = JSON.parse(savedLogs);
                        if (Array.isArray(parsed)) {
                            setLogs(parsed);
                        } else {
                            setLogs([]); // Reset if corrupt
                        }
                    } catch (e) {
                        console.error("Failed to parse logs", e);
                        setLogs([]);
                    }
                }
                if (savedPersona) {
                    try {
                        setPersona(JSON.parse(savedPersona));
                    } catch (e) { console.error("Failed to parse persona", e); }
                }
            }
        };
        loadData();
    }, []);

    // Save logs to local storage
    useEffect(() => {
        localStorage.setItem('learnai_behavior_logs', JSON.stringify(logs.slice(-500))); // Keep last 500
    }, [logs]);

    const logAction = (type: InteractionType, context: string, detail?: string) => {
        const newLog: BehaviorLog = {
            timestamp: Date.now(),
            type,
            context,
            detail
        };
        // Add log and keep array size manageable
        setLogs(prev => [...prev, newLog].slice(-200)); 
        
        // --- REAL TIME ANALYTICS BRIDGE ---
        const currentUser = getCurrentUser();
        const userId = currentUser ? currentUser.id : 'guest';
        
        // We persist this event to the "Backend" DB
        trackRealEvent(userId, type, { feature: context, detail });
    };

    const analyzeBehavior = async () => {
        if (logs.length < 5) return; // Need some data
        setIsAnalyzing(true);

        try {
            const ai = getAI();
            // Prepare data for the "Deep Learning" model (Gemini)
            const behavioralData = JSON.stringify(logs.slice(-50)); // Analyze last 50 actions
            
            const prompt = `
                Analyze the following user behavior logs from a learning app. 
                
                Task 1: Identify patterns in their learning style, preferred times, and struggle points.
                Task 2: Based on these unique patterns, generate 0 or 1 "Hidden Achievement" that the user has unlocked by their specific behavior.
                
                Logs: ${behavioralData}

                Return a JSON object with this exact schema:
                {
                    "persona": {
                        "learningStyle": "Visual" | "Auditory" | "Kinesthetic" | "Reading" | "Mixed",
                        "focusTime": "Morning" | "Afternoon" | "Night" | "Erratic",
                        "strengths": ["string"],
                        "weaknesses": ["string"],
                        "suggestion": "A specific, actionable recommendation to improve their learning right now."
                    },
                    "unlockedAchievement": {
                        "id": "string",
                        "title": "string",
                        "description": "string",
                        "icon": "string",
                        "category": "General",
                        "rewardXP": 200,
                        "goal": 1
                    } | null
                }
            `;

            let response;
            try {
                // Using Thinking Model (3 Pro) for deeper analysis of user behavior
                response = await ai.models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        thinkingConfig: { thinkingBudget: 16000 } 
                    }
                });
            } catch (err: any) {
                 // Fallback
                 response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });
            }

            if (response && response.text) {
                const data = JSON.parse(response.text);
                
                // Update Persona
                if (data.persona) {
                    setPersona(data.persona);
                    const currentUser = getCurrentUser();
                    if (currentUser) {
                        await updateUserPersona(data.persona);
                    } else {
                        localStorage.setItem('learnai_user_persona', JSON.stringify(data.persona));
                    }
                }

                // Handle Hidden Achievement (Async Unlock)
                if (data.unlockedAchievement) {
                    const ach: Achievement = {
                        ...data.unlockedAchievement,
                        progress: 1,
                        isAiGenerated: true,
                        isSecret: true
                    };
                    unlockHiddenAchievement(ach);
                }
            }
        } catch (error) {
            console.error("Behavior analysis failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Auto-analyze every 10 interactions using useRef for safe timeout management
    useEffect(() => {
        if (logs.length > 0 && logs.length % 10 === 0) {
            if (analysisTimeoutRef.current) {
                clearTimeout(analysisTimeoutRef.current);
            }
            analysisTimeoutRef.current = setTimeout(() => {
                analyzeBehavior();
            }, 1000);
        }
        
        return () => {
             if (analysisTimeoutRef.current) {
                clearTimeout(analysisTimeoutRef.current);
            }
        };
    }, [logs.length]);

    return (
        <BehaviorContext.Provider value={{ logAction, analyzeBehavior, persona, isAnalyzing, logs }}>
            {children}
        </BehaviorContext.Provider>
    );
};

export const useBehavior = () => {
    const context = useContext(BehaviorContext);
    if (!context) throw new Error("useBehavior must be used within BehaviorProvider");
    return context;
};
