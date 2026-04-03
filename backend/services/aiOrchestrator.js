const { GoogleGenAI, Type, ThinkingLevel } = require('@google/genai');
const VectorStore = require('../models/VectorStore');
const SemanticCache = require('../models/SemanticCache');
const VectorQueryService = require('./VectorQueryService');
const { pipeline } = require('@xenova/transformers');

// Khởi tạo biến toàn cục để chỉ load mô hình 1 lần duy nhất khi server chạy
let extractorPipeline = null;

const getLocalEmbedding = async (text) => {
  if (!extractorPipeline) {
    console.log("⏳ Đang tải mô hình AI cục bộ vào RAM lần đầu tiên...");
    // Dùng mô hình all-MiniLM-L6-v2 siêu nhẹ, chuyên dùng cho máy tính cá nhân
    extractorPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }

  // Tính toán vector offline (0 token, 0 internet)
  const output = await extractorPipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};

class AIOrchestrator {
  constructor(apiKey) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async run(systemPrompt, userMessage, chatHistory, userId, isThinkingMode = false, disableRAGTool = false) {
    // 0. SEMANTIC CACHE CHECK (Zero API Token Querying)
    let userQueryEmbedding = [];
    try {
      userQueryEmbedding = await getLocalEmbedding(userMessage);
      const cachedAnswers = await SemanticCache.find({ userId: userId }).lean();
      
      for (const cache of cachedAnswers) {
        if (!cache.embedding) continue;
        const sim = VectorQueryService.cosineSimilarity(userQueryEmbedding, cache.embedding);
        // Extremely high threshold to ensure answer relevance
        if (sim > 0.96) {
          console.log(`[SemanticCache] HIT! Similarity: ${sim.toFixed(4)}. Saving tokens!`);
          return cache.response;
        }
      }
    } catch (e) {
       console.warn('[SemanticCache] Lookup skipped due to error:', e.message);
    }

    // UZP Pre-fetching Architecture: No LLM tools are given to Gemini anymore.
    // It is strictly a pure Generator.

    // Format history for Gemini (only keep last 5 messages to aggressively save tokens)
    const recentHistory = chatHistory.slice(-5);
    const formattedHistory = recentHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    // Add current user message
    formattedHistory.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const modelName = 'gemini-3-flash-preview';
    const config = {
      systemInstruction: systemPrompt
    };

    if (isThinkingMode) {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    let response = await this._generateWithFallback(modelName, formattedHistory, config);

    // SAVE TO CACHE FOR FUTURE (If text is generated)
    try {
      if (userQueryEmbedding.length > 0 && response.text) {
        await SemanticCache.create({
          userId: userId,
          query: userMessage,
          embedding: userQueryEmbedding,
          response: response.text
        });
      }
    } catch (e) {
      console.warn('[SemanticCache] Save failed:', e.message);
    }

    return response.text;
  }

  // Fallback Load Balancer logic
  async _generateWithFallback(initialModelName, formattedHistory, config) {
    let currentModel = initialModelName;
    let maxRetries = 3;
    let hasFallbackOccurred = false;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.ai.models.generateContent({
          model: currentModel,
          contents: formattedHistory,
          config: config
        });
        return response;
      } catch (err) {
        if (err.status === 503 || err.status === 429) {
          if (attempt === maxRetries) {
            // TRIGGER LOAD BALANCER FALLBACK
            if (!hasFallbackOccurred && currentModel === 'gemini-3-flash-preview') {
              console.warn(`[LoadBalancer] QUOTA EXHAUSTED on ${currentModel}. Triggering fallback to gemini-3.1-flash-lite-preview...`);
              currentModel = 'gemini-3.1-flash-lite-preview';
              hasFallbackOccurred = true;
              attempt = 0; // Reset attempts for the new model
              continue;
            }
            throw err; // Real exhaustion
          }
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`[LoadBalancer] ${currentModel} busy (${err.status}). Retry ${attempt}/${maxRetries} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw err;
        }
      }
    }
  }

}

module.exports = AIOrchestrator;
