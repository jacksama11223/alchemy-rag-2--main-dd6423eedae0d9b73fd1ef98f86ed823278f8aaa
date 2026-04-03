import { GoogleGenAI, Type, FunctionDeclaration, ThinkingLevel } from '@google/genai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const getAI = (apiKey?: string) => {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("Missing Gemini API Key. Please provide it in settings.");
  }
  return new GoogleGenAI({ apiKey: key });
};

// Tool Declarations
const searchKnowledgeTool: FunctionDeclaration = {
  name: 'search_knowledge',
  description: 'Search the global knowledge base for information across all user notes, alchemy data, chat history, and documents.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The search query to find relevant information.'
      },
      sourceType: {
        type: Type.STRING,
        description: 'Optional. Filter by source type: note, alchemy, node, user_memory, chat, document.'
      }
    },
    required: ['query']
  }
};

const upsertKnowledgeTool: FunctionDeclaration = {
  name: 'upsert_knowledge',
  description: 'Save or update information in the global knowledge base. Use this to remember important facts, notes, or summaries.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      textContent: {
        type: Type.STRING,
        description: 'The content to save.'
      },
      sourceType: {
        type: Type.STRING,
        description: 'The type of source: note, alchemy, node, user_memory, chat, document.'
      }
    },
    required: ['textContent', 'sourceType']
  }
};

const saveUserMemoryTool: FunctionDeclaration = {
  name: 'save_user_memory',
  description: 'Save a specific fact about the user (e.g., preferences, goals, background) to long-term memory.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      fact: {
        type: Type.STRING,
        description: 'The fact to remember about the user.'
      }
    },
    required: ['fact']
  }
};

// Tool Execution Handlers
export const executeTool = async (name: string, args: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    if (name === 'search_knowledge') {
      const res = await fetch('/api/global-knowledge/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: args.query, limit: 5, filterSourceType: args.sourceType })
      });
      return await res.json();
    }
    
    if (name === 'upsert_knowledge') {
      // Use LangChain to split text if it's too long
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const chunks = await splitter.createDocuments([args.textContent]);
      
      const results = [];
      for (const chunk of chunks) {
        const res = await fetch('/api/global-knowledge/upsert', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            textContent: chunk.pageContent,
            sourceType: args.sourceType
          })
        });
        results.push(await res.json());
      }
      return { status: "success", chunksProcessed: results.length };
    }

    if (name === 'save_user_memory') {
      const res = await fetch('/api/user-memory', {
        method: 'POST',
        headers,
        body: JSON.stringify({ fact: args.fact })
      });
      return await res.json();
    }

    return { error: `Unknown tool: ${name}` };
  } catch (error: any) {
    console.error(`Error executing tool ${name}:`, error);
    return { error: error.message };
  }
};

export const sendOmniMessage = async (message: string, history: any[], systemInstruction: string, token: string, apiKey?: string, isThinkingMode?: boolean, sessionId?: string): Promise<string> => {
  try {
    const headers: any = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    if (apiKey) {
      headers['x-gemini-api-key'] = apiKey;
    }

    // We can pass systemInstruction and isThinkingMode if the backend supports it, 
    // but for now we just pass message and sessionId (we can generate a temporary one or pass it if available).
    // Let's pass history as well, although the backend might fetch it from the DB.
    const res = await fetch('/api/chat/ai', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        sessionId: sessionId || 'default_session', // You might want to pass a real sessionId here
        systemInstruction,
        isThinkingMode
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to get response from AI Chat');
    }

    const data = await res.json();
    return data.reply || "Xin lỗi, tôi không thể trả lời lúc này.";
  } catch (error: any) {
    console.error("Omni Agent Error:", error);
    return `Đã xảy ra lỗi kết nối với Omni Agent: ${error.message}`;
  }
};

// Create Omni Agent Chat Session
export const createOmniAgentSession = (systemInstruction: string, apiKey?: string, isThinkingMode?: boolean) => {
  const ai = getAI(apiKey);
  const config: any = {
    systemInstruction: systemInstruction + "\n\nYou have access to tools to search and save knowledge. If a user asks you to remember something, use save_user_memory or upsert_knowledge. If a user asks a question about their past notes or data, use search_knowledge before answering.",
    tools: [{ functionDeclarations: [searchKnowledgeTool, upsertKnowledgeTool, saveUserMemoryTool] }]
  };
  
  if (isThinkingMode !== undefined) {
    config.thinkingConfig = {
      thinkingLevel: isThinkingMode ? ThinkingLevel.HIGH : ThinkingLevel.LOW
    };
  }

  return ai.chats.create({
    model: isThinkingMode ? 'gemini-3.1-pro-preview' : 'gemini-3-flash-preview',
    config: config
  });
};
