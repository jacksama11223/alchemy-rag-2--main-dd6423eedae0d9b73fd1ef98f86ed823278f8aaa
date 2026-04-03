
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { BehaviorLog, KnowledgeNode, Achievement, AIAchievementSuggestion, FlashcardItem, QuizItem, PathLevel } from "../types";
import { trackRealEvent } from "./mockBackend";

const getAI = () => {
    // 1. Check LocalStorage (User entered manually in UI)
    const customKey = typeof window !== 'undefined' ? window.localStorage.getItem('custom_gemini_api_key') : null;
    
    let envKey = '';
    
    // 2. Check process.env (Vite injected via define)
    // We prioritize GEMINI_API_KEY as requested
    try {
        if (typeof process !== 'undefined' && process.env) {
            envKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
        }
    } catch (e) {
        // Ignore error
    }

    // 3. Check process.env (AI Studio standard)
    if (!envKey) {
        try {
             envKey = process.env.GEMINI_API_KEY || '';
        } catch (e) {
            // Ignore error
        }
    }

    let finalKey = customKey || envKey;

    // --- KEY SANITIZATION & DEBUGGING ---
    if (finalKey) {
        // Remove whitespace
        finalKey = finalKey.trim();
        
        // Remove surrounding quotes if they were accidentally included in .env
        if ((finalKey.startsWith('"') && finalKey.endsWith('"')) || (finalKey.startsWith("'") && finalKey.endsWith("'"))) {
            finalKey = finalKey.substring(1, finalKey.length - 1);
        }

        // AGGRESSIVE CLEANING: Google API Keys are typically alphanumeric with underscores and dashes.
        // This removes invisible characters, newlines, or weird copy-paste artifacts.
        // Regex: Keep only A-Z, a-z, 0-9, _, -
        const cleanKey = finalKey.replace(/[^a-zA-Z0-9_\-]/g, "");
        
        if (cleanKey !== finalKey) {
            console.warn("⚠️ LearnAI: Phát hiện ký tự lạ trong API Key. Đã tự động làm sạch.");
            finalKey = cleanKey;
        }

        // Debug Log (Masked) - Check Console F12
        if (typeof window !== 'undefined') {
            const masked = finalKey.length > 8 
                ? `${finalKey.substring(0, 4)}...${finalKey.substring(finalKey.length - 4)}` 
                : 'Invalid Length';
            console.log(`🔑 Gemini Key Status: [Loaded] (${masked}). Length: ${finalKey.length}`);
        }
    } else {
        console.error("❌ LearnAI: Không tìm thấy API Key nào. Vui lòng kiểm tra .env.local hoặc nhập trong Cài đặt.");
    }

    if (!finalKey) {
        // Return a dummy to prevent immediate crash, calls will fail gracefully later
        return new GoogleGenAI({ apiKey: 'MISSING_KEY' });
    }

    return new GoogleGenAI({ apiKey: finalKey });
};

// OPTIMIZED CONFIGURATION FOR LOWER TOKEN USAGE
const MODEL_THINKING = 'gemini-3-flash-preview'; // Switched to Flash for speed & cost
const MODEL_FAST = 'gemini-3-flash-preview';

const trackUsage = (model: string, inputLength: number) => {
    const estimatedTokens = Math.ceil(inputLength / 4);
    const userStr = typeof window !== 'undefined' ? window.localStorage.getItem('learnai_session') : null;
    let userId = 'guest';
    try {
        const user = userStr ? JSON.parse(userStr) : null;
        userId = user ? user.id : 'guest';
    } catch (e) {
        // Ignore parse error
    }
    
    trackRealEvent(userId, 'use_ai', { 
        model, 
        tokens: estimatedTokens,
        timestamp: new Date().toISOString()
    });
};

const autoSaveToRag = (title: string, content: string, tags: string[]) => {
    try {
        if (typeof window === 'undefined') return;
        const customKey = window.localStorage.getItem('custom_gemini_api_key');
        let token = null;
        const sessionStr = window.localStorage.getItem('learnai_session');
        if (sessionStr) {
            try {
                const session = JSON.parse(sessionStr);
                token = session.token;
            } catch (e) {}
        }
        
        const headers: any = { 'Content-Type': 'application/json' };
        if (customKey) headers['x-gemini-api-key'] = customKey;
        if (token) headers['Authorization'] = `Bearer ${token}`;

        fetch('/api/rag', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                content: content,
                metadata: {
                    title: title.substring(0, 50) + (title.length > 50 ? '...' : ''),
                    tags: tags
                }
            })
        }).catch(e => console.error("Auto-save to RAG failed", e));
    } catch (e) {
        // Ignore
    }
};

export interface PlanStrategy {
    id: string;
    name: string;
    description: string;
    pros: string[];
    cons: string[];
    estimatedDuration: string;
}

export const analyzePlanStrategies = async (goal: string): Promise<PlanStrategy[]> => {
    const prompt = `
    User Goal: "${goal}"

    Task: Act as an elite Project Manager. Analyze this goal and propose 3 distinct execution strategies/methodologies to achieve it.
    
    Return a JSON ARRAY of 3 strategies matching this schema:
    [
      {
        "id": "unique_id_string",
        "name": "Strategy Name (e.g. Aggressive Sprint)",
        "description": "Brief explanation of the approach.",
        "pros": ["Advantage 1", "Advantage 2"],
        "cons": ["Drawback 1", "Drawback 2"],
        "estimatedDuration": "e.g. 4 weeks"
      }
    ]
    `;

    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
            }
        });
        trackUsage('gemini-3-flash-preview', goal.length);
        
        const rawText = response.text || '[]';
        const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        if (cleanedText === "[object Object]") {
            console.error("Gemini returned [object Object]");
            return [];
        }
        
        autoSaveToRag(`Plan Strategies for: ${goal}`, `Goal: ${goal}\nStrategies:\n${cleanedText}`, ['plan', 'strategy', 'auto-saved']);
        
        try {
            return JSON.parse(cleanedText);
        } catch (e) {
            console.error("JSON Parse Error", e);
            return [];
        }
    } catch (e) {
        console.error("Strategy Analysis Error", e);
        return [];
    }
};

export const generateDetailedPlan = async (goal: string, strategy: PlanStrategy): Promise<any> => {
    const prompt = `
    User Goal: "${goal}"
    Selected Strategy: "${strategy.name}" (${strategy.description})

    Task: Create a detailed, step-by-step Todo List based strictly on the selected strategy.
    
    Output Requirements:
    1. Return a JSON Object containing a 'title' and a 'tasks' array.
    2. Each task object MUST follow this standard Todo format:
       {
         "content": "Actionable task title (Verb + Noun)",
         "description": "Brief details or context",
         "priority": 1 (High) | 2 (Medium) | 3 (Normal) | 4 (Low),
         "dueDateOffset": number (days from today, e.g. 0 for today, 1 for tomorrow),
         "tags": ["String"],
         "subtasks": ["Step 1", "Step 2"] (Optional strings)
       }
    `;

    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
            }
        });
        trackUsage('gemini-3-flash-preview', goal.length);
        const rawText = response.text || '{}';
        const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        autoSaveToRag(`Detailed Plan for: ${goal}`, `Goal: ${goal}\nStrategy: ${strategy.name}\nPlan:\n${cleanedText}`, ['plan', 'detailed', 'auto-saved']);
        
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("Detailed Plan Generation Error", e);
        return { title: "Error generating plan", tasks: [] };
    }
};

export const extractActionPlan = async (chatContent: string): Promise<any[]> => {
    const prompt = `
    You are a Project Manager AI. Analyze the following conversation/text which contains a learning plan or a list of advice.
    
    Task: Extract actionable tasks.
    
    Rules:
    1. Break down the plan into specific, small tasks.
    2. Assign a Priority (1=High/Urgent, 2=Medium, 3=Normal, 4=Low).
    3. Infer a relative due date based on the plan's timeline (e.g., 'Day 1' = 'today', 'Week 2' = 'upcoming').
    4. Return a JSON ARRAY.
    5. IMPORTANT: The key for the task name MUST be "content".
    
    Input Text:
    "${chatContent.substring(0, 10000)}"
    
    Output JSON Schema:
    [
      {
        "content": "Short task title (verb + noun)",
        "description": "Detailed instruction",
        "priority": 1,
        "dueDate": "today" | "tomorrow" | "upcoming"
      }
    ]
    `;

    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        trackUsage(MODEL_FAST, chatContent.length);
        const rawText = response.text || '[]';
        const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("Action Plan Error", e);
        return [];
    }
};

export const analyzeProjectStructure = async (tasks: any[]): Promise<{
    nodes: { id: string, label: string, phase: number, description: string }[],
    edges: { from: string, to: string, relation: string }[]
}> => {
    if (!tasks || tasks.length === 0) return { nodes: [], edges: [] };

    const taskInput = tasks.map(t => ({ id: t.id, content: t.content })).slice(0, 30); 

    const prompt = `
    You are a Dependency Analyst.
    Task: Analyze this list of project tasks and restructure them into a logical dependency graph (Gantt/PERT style).
    Input Tasks: ${JSON.stringify(taskInput)}
    
    Output Schema:
    {
      "nodes": [
        { "id": "task_id_from_input", "label": "Short label", "phase": 0 (integer), "description": "Reasoning for placement" }
      ],
      "edges": [
        { "from": "predecessor_task_id", "to": "successor_task_id", "relation": "depends_on" }
      ]
    }
    `;

    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
            }
        });
        
        trackUsage('gemini-3-flash-preview', JSON.stringify(taskInput).length);
        const rawText = response.text || '{}';
        const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("Project Structure Analysis Error", e);
        return {
            nodes: tasks.map((t, i) => ({ id: t.id, label: t.content, phase: i, description: 'Fallback' })),
            edges: []
        };
    }
};

export const sendMessageToGemini = async (message: string, history: any[], systemInstruction?: string, isThinkingMode?: boolean): Promise<string> => {
    try {
        const ai = getAI();
        const config: any = {};
        if (systemInstruction) {
            config.systemInstruction = systemInstruction;
        }
        if (isThinkingMode !== undefined) {
            config.thinkingConfig = {
                thinkingLevel: isThinkingMode ? ThinkingLevel.HIGH : ThinkingLevel.LOW
            };
        }

        // Format history for Gemini API
        const formattedHistory: any[] = [];
        let currentRole = 'user';
        
        // Filter out initial greeting if it's the first message and from model
        let historyToProcess = [...history];
        if (historyToProcess.length > 0 && historyToProcess[0].role === 'model') {
            historyToProcess.shift();
        }

        for (const msg of historyToProcess) {
            const role = msg.role === 'user' ? 'user' : 'model';
            
            if (role === currentRole) {
                formattedHistory.push({
                    role: role,
                    parts: [{ text: msg.text || msg.parts?.[0]?.text || '' }]
                });
                currentRole = role === 'user' ? 'model' : 'user';
            } else {
                // If roles don't alternate, merge with previous or insert dummy
                if (formattedHistory.length > 0) {
                    const lastMsg = formattedHistory[formattedHistory.length - 1];
                    lastMsg.parts[0].text += `\n\n${msg.text || msg.parts?.[0]?.text || ''}`;
                }
            }
        }

        // Ensure the last message in history is from 'model' before adding the new 'user' message
        if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
            formattedHistory.push({ role: 'model', parts: [{ text: 'Vâng, tôi hiểu.' }] });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: [...formattedHistory, { role: 'user', parts: [{ text: message }] }],
            config: config
        });
        
        trackUsage('gemini-3-flash-preview', message.length);
        const textResponse = response.text || "Xin lỗi, tôi không thể trả lời lúc này.";
        
        // Auto-save AI interaction to RAG
        autoSaveToRag(`Chat Interaction: ${message}`, `User: ${message}\nAI: ${textResponse}`, ['chat', 'auto-saved']);

        return textResponse;
    } catch (error: any) {
        console.error("Gemini Error:", error);
        
        // Provide a more helpful error message to the user
        let errorMsg = `Đã xảy ra lỗi kết nối với AI.`;
        if (error.message.includes('400') || error.message.includes('INVALID_ARGUMENT')) {
            errorMsg += ` (API Key không hợp lệ). Vui lòng kiểm tra file .env.local và khởi động lại server. Bạn cũng có thể nhập Key trực tiếp ở mục 'Tài khoản' hoặc Dashboard.`;
        } else {
            errorMsg += ` (${error.message || 'Unknown error'}).`;
        }
        return errorMsg;
    }
};

export const generateLearningContent = async (content: string, type: string, options: any): Promise<any> => {
    let prompt = `
    Generate learning content based on the text below.
    Type: ${type}
    Complexity: ${options.complexity}
    Language: ${options.language}
    
    Text: "${content.substring(0, 10000)}"
    
    Return JSON format specific to the type.
    `;

    if (type === 'exam_magic_notes' || type === 'Flashcard') {
        prompt += `If exam_magic_notes: { "title": "Topic", "tags": [], "summary": "...", "flashcards": [{ "front": "...", "back": "..." }] }`;
    } else if (type === 'exam_mcq_gen' || type === 'Quiz') {
        prompt += `If exam_mcq_gen: { "title": "Topic", "tags": [], "summary": "...", "quiz": [{ "question": "...", "options": ["..."], "correctAnswer": 0, "explanation": "..." }] }`;
    } else if (type === 'exam_cloze_del') {
        prompt += `If exam_cloze_del: { "title": "Topic", "tags": [], "summary": "...", "fillInBlanks": [{ "sentence": "...", "answer": "..." }] }`;
    } else if (type === 'ref_tldr') {
        prompt += `If ref_tldr: { "title": "Topic", "tags": [], "summary": "...", "tldr": "..." }`;
    } else if (type === 'ref_eli5') {
        prompt += `If ref_eli5: { "title": "Topic", "tags": [], "summary": "...", "eli5": "..." }`;
    } else if (type === 'ref_key_takeaways') {
        prompt += `If ref_key_takeaways: { "title": "Topic", "tags": [], "summary": "...", "takeaways": ["..."] }`;
    } else if (type === 'strat_study_plan') {
        prompt += `If strat_study_plan: { "title": "Topic", "tags": [], "summary": "...", "studyPlan": [{ "day": "...", "topic": "...", "tasks": ["..."] }] }`;
    } else if (type === 'strat_spaced_rep') {
        prompt += `If strat_spaced_rep: { "title": "Topic", "tags": [], "summary": "...", "schedule": [{ "date": "...", "reviewItems": ["..."] }] }`;
    } else if (type === 'crea_blog_post') {
        prompt += `If crea_blog_post: { "title": "Topic", "tags": [], "summary": "...", "blogPost": "..." }`;
    } else if (type === 'crea_analogy') {
        prompt += `If crea_analogy: { "title": "Topic", "tags": [], "summary": "...", "analogy": "..." }`;
    } else if (type.startsWith('arch_')) {
        prompt += `If arch_*: { "title": "Topic", "tags": [], "summary": "...", "nodes": [{ "id": "...", "label": "...", "type": "..." }], "edges": [{ "source": "...", "target": "...", "label": "..." }] }`;
    } else if (type.startsWith('exp_')) {
        prompt += `If exp_*: { "title": "Topic", "tags": [], "summary": "...", "findings": [{ "concept": "...", "description": "..." }] }`;
    } else {
        prompt += `Default: { "title": "Topic", "tags": [], "summary": "...", "data": {} }`;
    }
    
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
            }
        });
        trackUsage('gemini-3-flash-preview', content.length);
        const jsonText = response.text || '{}';
        autoSaveToRag(`Learning Content: ${type}`, `Content: ${content.substring(0, 100)}\nType: ${type}\nResult:\n${jsonText}`, ['learning', type, 'auto-saved']);
        return JSON.parse(jsonText);
    } catch (e) {
        console.error(e);
        return {};
    }
};

export const generateOntologyFromText = async (text: string) => {
    // Placeholder logic or actual implementation if needed. 
    return; 
};

export const checkSemanticResonance = async (node: any, otherNodes: any[]) => {
    try {
        const textToAnalyze = `${node.title || ''} ${node.tags ? node.tags.join(' ') : ''}`;
        
        let token = null;
        if (typeof window !== 'undefined') {
            const sessionStr = window.localStorage.getItem('learnai_session');
            if (sessionStr) {
                try {
                    const session = JSON.parse(sessionStr);
                    token = session.token;
                } catch (e) {}
            }
        }

        if (!token) {
            console.warn("Semantic Resonance bypassed: Missing Auth Token");
            return []; // Cannot search DB without auth
        }

        const response = await fetch('/api/rag/resonance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                text: textToAnalyze,
                threshold: 0.82 // 82% similarity required
            })
        });

        if (response.ok) {
            return await response.json(); // returns [{ id, title, reason }] array
        }
        return [];
    } catch (e) { 
        console.error("Resonance Check API failed:", e);
        return []; 
    }
};

export const analyzeAlchemyHabits = async (logs: BehaviorLog[]) => {
    return { 
        message: "Bạn thường học vào buổi tối. Hãy thử Flashcards để ôn tập nhanh.", 
        recommendedMethod: "Flashcard",
        recommendedDifficulty: 60
    };
};

export const askGeminiWithSearch = async (query: string, history: any[]) => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: [...history, { role: 'user', parts: [{ text: query }] }],
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        
        const textResponse = response.text || "";
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        let sources = "";
        if (chunks && chunks.length > 0) {
            sources = chunks.map((chunk: any) => chunk.web?.uri).filter(Boolean).join('\n');
        }
        
        autoSaveToRag(`Search Query: ${query}`, `Query: ${query}\nAI: ${textResponse}`, ['search', 'chat', 'auto-saved']);
        return { text: textResponse, sources: sources };
    } catch (e) {
        return { text: "Đã xảy ra lỗi khi tìm kiếm.", sources: "" };
    }
};

export const evaluateChatSession = async (messages: any[], topic: string) => {
    const prompt = `Evaluate this chat session about "${topic}". Rate user understanding (0-5) and give feedback. JSON: { "score": number, "feedback": "string" }`;
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt + "\n" + JSON.stringify(messages),
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '{ "score": 0, "feedback": "Error" }');
    } catch (e) { return { score: 0, feedback: "Evaluation failed." }; }
};

export const analyzeTutorSentiment = async (history: any[]) => {
    return { emotion: "curious", shouldSwitchPersona: null, suggestion: null };
};

export const analyzeConversationForActions = async (lastUserMsg: string, lastAiMsg: string) => {
    return { actions: [] };
};

export const generateCheatSheet = async (topics: string[]) => {
    const prompt = `Generate a concise cheat sheet for: ${topics.join(', ')}. Markdown format.`;
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "";
    } catch (e) { return "Error generating cheat sheet."; }
};

export const filterParetoNodes = async (titles: string[]) => {
    return titles.slice(0, Math.ceil(titles.length * 0.2));
};

export const analyzeImageForDiscussion = async (base64: string, promptText?: string) => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/png', // Assume png or adjust based on input if possible
                            data: base64.split(',')[1] || base64
                        }
                    },
                    { text: promptText || "Describe this image." }
                ]
            },
        });
        return response.text || "";
    } catch (e) { return "Image analysis failed."; }
};

export const distillVideoContent = async (transcript: string, detailLevel: number) => {
    const prompt = `Distill this video transcript into learning modules. Detail Level: ${detailLevel}%. 
    Return JSON: { "nodes": [{ "title": "...", "summary": "...", "flashcards": [...] }], "stats": { "compressionRate": "...", "originalWords": 0, "distilledWords": 0, "noiseLevel": "Low" } }`;
    
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt + "\n\n" + transcript.substring(0, 20000),
            config: { 
                responseMimeType: "application/json",
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) { return { nodes: [], stats: {} }; }
};

export const generateAdaptiveSkillTree = async (userNodes: any[]) => {
     return { title: "Skill Tree", levels: [] };
};

export const gradeUserAnswer = async (userAns: string, correctAns: string, question: string) => {
     const prompt = `Grade this answer. Question: "${question}". Correct: "${correctAns}". User: "${userAns}". Return JSON: { "score": 1-5, "feedback": "..." }`;
     try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '{ "score": 0, "feedback": "Error" }');
    } catch (e) { return { score: 0, feedback: "Grading failed." }; }
};

export const askFlashcardTutor = async (front: string, back: string, question: string) => {
    try {
        let token = null;
        if (typeof window !== 'undefined') {
            const sessionStr = window.localStorage.getItem('learnai_session');
            if (sessionStr) {
                try {
                    const session = JSON.parse(sessionStr);
                    token = session.token;
                } catch (e) {}
            }
        }

        let contextChunks = "";
        
        // 1. Retrieve deep context via Hybrid Dual-Track RAG (Same as Chatbot)
        if (token) {
            const searchQuery = `${front} ${question}`;
            const searchRes = await fetch(`/api/rag/hybrid-search`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    query: searchQuery,
                    mode: 'compressed', // TF-IDF compressed for efficiency
                    limit: 5
                })
            });
            if (searchRes.ok) {
                const results = await searchRes.json();
                contextChunks = results.contextString || "";
            }
        }

        // 2. Build the strict tutor prompt
        const prompt = `
        Bạn là một Gia Sư AI. Người dùng đang học một thẻ nhớ (Flashcard) nhưng không thể hiểu nổi đáp án.
        Nhiệm vụ của bạn: Dùng phương pháp Active Recall, đọc toàn bộ tài liệu gốc mà hệ thống RAG vừa trích xuất và giảng lại cho người học một cách dễ hiểu nhất (Như giảng cho một đứa trẻ 10 tuổi).

        [Thẻ nhớ hiện tại]
        Mặt trước (Câu hỏi): ${front}
        Mặt sau (Đáp án): ${back}

        [Câu hỏi của học viên]
        "${question}"

        [Tài liệu gốc liên quan từ Bộ nhớ Vector]
        ${contextChunks ? contextChunks : "Không tìm thấy tài liệu gốc. Hãy dùng kiến thức của bạn dựa vào thẻ nhớ để giảng."}

        Hãy trả lời bằng tiếng Việt, thân thiện và phải đúng trọng tâm dựa vào Tài liệu gốc. Sử dụng Markdown.
        `;

        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        return response.text || "Xin lỗi, gia sư AI đang gặp sự cố.";
    } catch (e) {
        console.error("askFlashcardTutor Error:", e);
        return "Lỗi đường truyền hệ thống RAG.";
    }
};

/**
 * Persists an AI-generated explanation to the RAG memory
 */
export const saveAiCommentToRag = async (text: string, title: string, metadata: any = {}) => {
    try {
        const sessionStr = typeof window !== 'undefined' ? window.localStorage.getItem('learnai_session') : null;
        let token = null;
        if (sessionStr) {
            try {
                token = JSON.parse(sessionStr).token;
            } catch (e) {}
        }
        
        if (!token) return false;

        const response = await fetch('/api/rag/comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text, title, metadata })
        });

        return response.ok;
    } catch (e) {
        console.error("Failed to save AI comment to RAG", e);
        return false;
    }
};

/**
 * Fetches past AI interactions for a specific flashcard
 */
export const getFlashcardHistory = async (flashcardTitle: string) => {
    try {
        const sessionStr = typeof window !== 'undefined' ? window.localStorage.getItem('learnai_session') : null;
        let token = null;
        if (sessionStr) {
            try {
                token = JSON.parse(sessionStr).token;
            } catch (e) {}
        }
        
        if (!token) return [];

        const response = await fetch(`/api/rag/history/${encodeURIComponent(flashcardTitle)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) return await response.json();
        return [];
    } catch (e) {
        console.error("Failed to fetch flashcard history", e);
        return [];
    }
};

/**
 * Fetches the user's private note for a specific flashcard
 */
export const getFlashcardNote = async (flashcardTitle: string) => {
    try {
        const sessionStr = typeof window !== 'undefined' ? window.localStorage.getItem('learnai_session') : null;
        let token = null;
        if (sessionStr) {
            try {
                token = JSON.parse(sessionStr).token;
            } catch (e) {}
        }
        
        if (!token) return { text: "" };

        const response = await fetch(`/api/rag/note/${encodeURIComponent(flashcardTitle)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) return await response.json();
        return { text: "" };
    } catch (e) {
        console.error("Failed to fetch flashcard note", e);
        return { text: "" };
    }
};

/**
 * Saves a user note for a specific flashcard to RAG
 */
export const saveFlashcardNote = async (flashcardTitle: string, text: string) => {
    try {
        const sessionStr = typeof window !== 'undefined' ? window.localStorage.getItem('learnai_session') : null;
        let token = null;
        if (sessionStr) {
            try {
                token = JSON.parse(sessionStr).token;
            } catch (e) {}
        }
        
        if (!token) return false;

        const response = await fetch('/api/rag/note', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ flashcardTitle, text })
        });

        return response.ok;
    } catch (e) {
        console.error("Failed to save flashcard note", e);
        return false;
    }
};


export const generateGraphWalkerRoadmap = async (targetNodeStr: string, neighborNodesStr: string) => {
    try {
        const prompt = `
        Bạn là kiến trúc sư RAG Graph-Walker. Nhiệm vụ của bạn là xây dựng Lộ Trình Học Tập (Study Roadmap) tối ưu dựa trên Graph Tri Thức của người dùng.

        [Mục tiêu chính (Node trọng tâm)] 
        ${targetNodeStr}

        [Các Node vệ tinh trong Mạng lưới (Hàng xóm/Kết nối)]
        ${neighborNodesStr}

        Hãy sắp xếp mục tiêu chính và các node vệ tinh thành một Lộ trình học (Từng bước 1). Bỏ qua những node không thực sự phù hợp với lộ trình.
        Đầu ra BẮT BUỘC TRẢ VỀ JSON Array THEO ĐÚNG FORMAT SAU, KHÔNG GIẢI THÍCH GÌ THÊM:
        [
           {
             "step": 1,
             "nodeId": "<ID của node nếu có, hoặc để trống nếu là node gợi ý mới>",
             "title": "<Tên bước / Tên node>",
             "rationale": "<Lý do ngắn gọn tại sao nên học bước này lúc này>"
           }
        ]
        `;

        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        if (response.text) {
             const data = JSON.parse(response.text);
             return data;
        }
        return [];
    } catch (e) {
        console.error("GraphWalker Error:", e);
        return [];
    }
};

export const generateMentalModel = async (text: string) => {
    const prompt = `Extract mental models from this text. Return JSON: { "models": [{ "title": "...", "description": "...", "application": "..." }] }`;
     try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt + "\n" + text.substring(0, 5000),
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '{ "models": [] }');
    } catch (e) { return { models: [] }; }
};

export const scanUrlForContent = async (url: string) => {
    return `Content scraped from ${url}. (This is a simulation as direct scraping requires a backend). LearnAI provides tools for knowledge...`;
};

export const analyzeImageWithThinking = async (base64: string, promptText?: string) => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/png',
                            data: base64.split(',')[1] || base64
                        }
                    },
                    { text: promptText || "Analyze this image in detail." }
                ]
            },
        });
        return response.text || "";
    } catch (e) { 
        console.error(e);
        return "Image analysis failed."; 
    }
};

export const extractAndSaveUserFacts = async (message: string) => {
    const prompt = `
    Analyze the following user message and extract any personal facts, preferences, or information the user is sharing about themselves (e.g., their name, age, job, hobbies, likes, dislikes).
    If there are no personal facts, return an empty array.
    Return a JSON array of strings, where each string is a clear, concise fact about the user.
    
    User Message: "${message}"
    
    Output JSON Schema:
    ["Fact 1", "Fact 2"]
    `;
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const facts = JSON.parse(response.text || '[]');
        
        if (facts && facts.length > 0) {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') || (JSON.parse(window.localStorage.getItem('learnai_session') || '{}').token) : null;
            if (token) {
                for (const fact of facts) {
                    await fetch('/api/user-memory', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ fact })
                    });
                }
            }
        }
    } catch (e) {
        console.error("Error extracting user facts:", e);
    }
};

export const extractTextFromImage = async (base64: string) => {
    return analyzeImageForDiscussion(base64, "Extract all text from this image.");
};

export const transcribeAudio = async (base64Audio: string) => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'audio/mp3',
                            data: base64Audio.split(',')[1] || base64Audio
                        }
                    },
                    { text: "Transcribe this audio." }
                ]
            }
        });
        return response.text || "";
    } catch (e) { return "Audio transcription failed."; }
};

export const generateMnemonics = async (topic: string) => {
    const prompt = `Create a mnemonic for "${topic}".`;
    const ai = getAI();
    const res = await ai.models.generateContent({ model: MODEL_FAST, contents: prompt });
    return res.text || "";
};

export const explainLikeFive = async (text: string) => {
    const prompt = `Explain this to a 5 year old: "${text}"`;
    const ai = getAI();
    const res = await ai.models.generateContent({ model: MODEL_FAST, contents: prompt });
    return res.text || "";
};

export const generateCramAudioScript = async (content: string) => {
    const prompt = `Convert this into a podcast script: "${content}"`;
    const ai = getAI();
    const res = await ai.models.generateContent({ model: MODEL_FAST, contents: prompt });
    return res.text || "";
};

export const semanticFileClustering = async (files: any[]) => {
    const fileNames = files.map(f => ({ id: f.id, name: f.name }));
    const prompt = `Cluster these files semantically. Return JSON: { "clusters": [{ "name": "Cluster Name", "fileIds": ["id1", "id2"] }] } \n Files: ${JSON.stringify(fileNames)}`;
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '{ "clusters": [] }');
    } catch (e) { return { clusters: [] }; }
};

export const decomposeComplexTask = async (task: string) => {
    const prompt = `Decompose this task into subtasks: "${task}". Return JSON array of objects with 'content' and 'priority'.`;
     try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '[]');
    } catch (e) { return []; }
};

export const generateLevelContent = async (title: string, desc: string, type: 'Flashcard' | 'Quiz', difficulty: string) => {
    return generateLearningContent(`${title}: ${desc}`, type, { complexity: difficulty, language: 'Vietnamese' });
};

export const suggestPersonalizedAchievements = async (stats: any, recentNodes: any[], unlocked: string[], logs: any[]) => {
    const prompt = `
    Suggest 2 hidden achievements for this user based on their stats and logs.
    Stats: ${JSON.stringify(stats)}
    Recent Nodes: ${JSON.stringify(recentNodes.map(n => n.title))}
    Unlocked: ${JSON.stringify(unlocked)}
    Logs: ${JSON.stringify(logs.slice(0, 10))}
    
    Return JSON: { "suggestions": [{ "id": "...", "title": "...", "reason": "...", "task": "...", "potentialReward": "...", "difficulty": "Hard" }], "analysis": "..." }
    `;
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) { return { suggestions: [], analysis: "" }; }
};

export const getExpansionSuggestions = async (node: KnowledgeNode) => {
    const prompt = `Suggest 5 sub-topics to expand on "${node.title}". Return JSON array of strings.`;
     try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '[]');
    } catch (e) { return []; }
};

export const suggestNoteDirections = async (node: KnowledgeNode) => {
    const prompt = `Suggest 3 note-taking strategies for "${node.title}". Return JSON array: [{ "title": "...", "description": "...", "strategy": "qa" | "feynman" | "outline" }]`;
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '[]');
    } catch (e) { return []; }
};

export const generateTargetedNote = async (node: KnowledgeNode, strategy: string) => {
    const prompt = `Generate a detailed note for "${node.title}" using strategy "${strategy}".`;
    const ai = getAI();
    const res = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt,
    });
    return res.text || "";
};

export const generateStructuredNote = async (content: string, style: 'feynman' | 'mindmap') => {
    const prompt = `Rewrite this text in ${style} style. Content: ${content.substring(0, 5000)}`;
    const ai = getAI();
    const res = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt,
    });
    return res.text || "";
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1", usePro: boolean = false): Promise<string> => {
    try {
        const ai = getAI();
        const model = usePro ? 'gemini-3-pro-image-preview' : 'gemini-3.1-flash-image-preview';
        
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { text: prompt }
                ]
            },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio as any,
                    imageSize: "1K"
                }
            }
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return "";
    } catch (e) {
        console.error("Image generation failed:", e);
        return "";
    }
};

interface MindmapNode {
    title: string;
    children?: MindmapNode[];
}

/**
 * Đếm tổng số nút trong một cây con (bao gồm cả nút hiện tại)
 */
const countSubtreeNodes = (node: MindmapNode): number => {
    if (!node.children || node.children.length === 0) return 1;
    return 1 + node.children.reduce((acc, child) => acc + countSubtreeNodes(child), 0);
};

/**
 * Lấy bảng màu HSL chuyên nghiệp cho từng nhánh
 */
const getBranchStyle = (index: number, depth: number) => {
    const hues = [260, 210, 160, 30, 330, 190]; // Purple, Blue, Teal, Orange, Pink, Cyan
    const hue = hues[index % hues.length];
    
    if (depth === 0) {
        return {
            stroke: '#1e293b', 
            bg: '#f5f3ff',     
            width: 180,
            height: 70
        };
    }
    
    return {
        stroke: `hsl(${hue}, 70%, 20%)`, 
        bg: `hsl(${hue}, 80%, 97%)`,     
        width: 150,
        height: 50
    };
};

/**
 * Thuật toán bố cục Tỏa tròn Nâng cao (Professional Radial Layout)
 */
const layoutMindmapTree = (
    node: MindmapNode, 
    centerX: number, 
    centerY: number, 
    depth: number = 0,
    branchIdx: number = 0,
    startAngle: number = 0, 
    endAngle: number = 2 * Math.PI
): any[] => {
    const elements: any[] = [];
    const rootId = `node-${Math.random().toString(36).substr(2, 9)}`;
    const style = getBranchStyle(branchIdx, depth);
    
    // Tăng bán kính dựa trên độ sâu để tránh chồng chéo
    const radius = depth === 0 ? 300 : 250 * Math.pow(0.85, depth - 1);
    
    // 1. Tạo nút hiện tại
    elements.push({
        id: rootId,
        type: 'rectangle',
        x: centerX - style.width / 2,
        y: centerY - style.height / 2,
        width: style.width,
        height: style.height,
        strokeColor: style.stroke,
        backgroundColor: style.bg,
        strokeWidth: depth === 0 ? 3 : 2,
        opacity: 1,
        text: node.title
    });

    if (node.children && node.children.length > 0) {
        const subtreeWeights = node.children.map(child => countSubtreeNodes(child));
        const totalWeight = subtreeWeights.reduce((a, b) => a + b, 0);
        
        let currentAngle = startAngle;

        node.children.forEach((child, i) => {
            const weight = subtreeWeights[i];
            const angleSpan = ((endAngle - startAngle) * weight) / totalWeight;
            const targetAngle = currentAngle + angleSpan / 2;
            
            const childX = centerX + radius * Math.cos(targetAngle);
            const childY = centerY + radius * Math.sin(targetAngle);

            // 2. Tạo mũi tên nối với Logic Edge-to-Edge
            // QUAN TRỌNG: InfiniteCanvas yêu cầu thuộc tính 'points' để vẽ mũi tên/đường thẳng
            elements.push({
                id: `arrow-${Math.random().toString(36).substr(2, 9)}`,
                type: 'arrow',
                x: centerX,
                y: centerY,
                width: childX - centerX,
                height: childY - centerY,
                strokeColor: style.stroke,
                strokeWidth: 2,
                opacity: 0.5,
                text: '',
                points: [{ x: centerX, y: centerY }, { x: childX, y: childY }] // BỔ SUNG POINTS
            });

            // 3. Đệ quy với góc thu hẹp dần (Fan-out)
            const nextBranchIdx = depth === 0 ? i : branchIdx;
            const anglePadding = 0.2; 
            const childElements = layoutMindmapTree(
                child, 
                childX, 
                childY, 
                depth + 1, 
                nextBranchIdx,
                targetAngle - (angleSpan * (0.5 - anglePadding)), 
                targetAngle + (angleSpan * (0.5 - anglePadding))
            );
            elements.push(...childElements);

            currentAngle += angleSpan;
        });
    }

    return elements;
};

export const generateMindmapElementsFromRAG = async (topic: string) => {
    console.log(`[MindmapAI-V2] Khởi chạy tối ưu cho: "${topic}"`);
    try {
        const sessionStr = typeof window !== 'undefined' ? window.localStorage.getItem('learnai_session') : null;
        let token = null;
        if (sessionStr) {
            try {
                token = JSON.parse(sessionStr).token;
            } catch (e) {}
        }
        
        if (!token) {
            console.error("[MindmapAI] Lỗi: Không tìm thấy token xác thực.");
            return [];
        }

        // 1. Fetch RAG Context (Sử dụng mode: compressed để tiết kiệm Token)
        console.log(`[MindmapAI] Đang chắt lọc kiến thức từ RAG (Chế độ nén)...`);
        const searchRes = await fetch(`/api/rag/hybrid-search`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                query: topic,
                mode: 'compressed', 
                limit: 10
            })
        });

        let contextString = "";
        if (searchRes.ok) {
            const results = await searchRes.json();
            contextString = results.contextString || "";
            console.log(`[MindmapAI] RAG trích xuất thành công (${contextString.length} ký tự nén).`);
        } else {
            console.warn("[MindmapAI] Không thể kết nối API RAG, sẽ dùng kiến thức AI mặc định.");
        }

        // 2. Prompt Gemini cho Cây Ý Tưởng (Hierarchy Tree)
        const prompt = `
        Bạn là kiến trúc sư tư duy. Nhiệm vụ của bạn là xây dựng Cấu trúc cây ý tưởng (Conceptual Tree) cho chủ đề sau.
        
        [Chủ đề] ${topic}
        [Kiến thức nén từ RAG]
        ${contextString || "Dùng kiến thức của bạn về chủ đề này."}
        
        [Yêu cầu JSON]
        Trả về DUY NHẤT một đối tượng JSON đại diện cho cây ý tưởng:
        {
          "title": "Chủ đề chính (ngắn gọn, tối đa 3-5 từ)",
          "children": [
            {
              "title": "Nhánh con (tối đa 3-5 từ)",
              "children": [
                 { "title": "Chi tiết (tối đa 5 từ)", "children": [] }
              ]
            }
          ]
        }
        
        Yêu cầu nghiêm ngặt:
        1. Phân cấp logic từ tổng quát đến chi tiết.
        2. Tối đa 3-4 nhánh chính từ nút gốc. Tối đa 3 cấp độ sâu.
        3. Mỗi nút chỉ chứa từ khóa/ý chính cực kỳ ngắn gọn.
        
        KHÔNG GIẢI THÍCH, CHỈ TRẢ VỀ JSON TREE.
        `;

        const ai = getAI();
        const modelsList = ['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-1.5-flash-latest'];
        let rawText = '';
        let success = false;

        for (const modelName of modelsList) {
            try {
                console.log(`[MindmapAI] Đang yêu cầu AI xây dựng Cây ý tưởng bằng ${modelName}...`);
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config: { 
                        responseMimeType: "application/json",
                        temperature: 0.2 // Rất thấp để đảm bảo logic phân cấp
                    }
                });
                rawText = response.text || '{}';
                success = true;
                console.log(`[MindmapAI] ✅ Model ${modelName} phản hồi thành công.`);
                break;
            } catch (err: any) {
                console.warn(`[MindmapAI] ⚠️ Model ${modelName} thất bại (Lỗi: ${err.message || 'Unknown'})`);
                const isRecoverable = err.message.includes('429') || err.message.includes('404') || err.message.includes('Quota') || err.message.includes('not found');
                if (isRecoverable) {
                    continue; 
                }
                throw err;
            }
        }

        if (!success) {
            console.error("[MindmapAI] Tất cả model đều hết quota hoặc lỗi.");
            return [];
        }

        // 3. Phân tách và Vẽ lên Canvas bằng Engine chuyên nghiệp
        const cleanJSON = (text: string) => {
            let s = text.trim();
            if (s.includes('```')) {
                s = s.replace(/```json/g, '').replace(/```/g, '').trim();
            }
            return s;
        };

        try {
            const hierarchy = JSON.parse(cleanJSON(rawText));
            console.log(`[MindmapAI] Đã nhận được Cây ý tưởng. Đang khởi chạy Spatial Layout Engine...`);
            
            // Vẽ Mindmap bắt đầu từ gốc (500, 500)
            const elements = layoutMindmapTree(hierarchy, 500, 500);
            
            console.log(`[MindmapAI] ✅ Hoàn tất! Đã tạo ${elements.filter(e => e.type==='rectangle').length} đối tượng tri thức.`);
            return elements;
        } catch (parseError) {
            console.error("[MindmapAI] Lỗi phân tách Cây ý tưởng:", parseError);
            console.log("[MindmapAI] Nội dung AI phản hồi:", rawText);
            return [];
        }
    } catch (e: any) {
        console.error("[MindmapAI] Lỗi hệ thống:", e);
        if (e.message.includes('429')) {
            alert("Tư duy sáng tạo AI hiện tại đang quá tải lượt sử dụng (Quota Exceeded). Vui lòng thử lại sau vài phút hoặc đổi API Key trong Cài đặt.");
        }
        return [];
    }
};
