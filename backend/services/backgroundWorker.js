const { GoogleGenAI, Type } = require('@google/genai');
const UserMemory = require('../models/UserMemory');
const VectorStore = require('../models/VectorStore');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
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

// In a real production app, use BullMQ or similar.
// For now, we'll use simple async functions to simulate background tasks.

class BackgroundWorker {
  constructor(apiKey) {
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      this.ai = null;
    }
  }

  async extractUserMemory(chatHistory, userId) {
    if (!this.ai) {
      console.warn('[BackgroundWorker] Missing Gemini API Key. Skipping user memory extraction.');
      return;
    }
    const historyText = chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    return await this._extractFactToMemory(historyText, userId, 'chat history');
  }

  async extractUserMemoryFromText(text, userId) {
    if (!this.ai) return;
    return await this._extractFactToMemory(text, userId, 'digital note');
  }

  async _extractFactToMemory(text, userId, sourceInfo) {
    try {
      const prompt = `
        Analyze the following ${sourceInfo} and extract any NEW, relevant facts, preferences, or personal profile information about the user.
        Format accurately. Focus on key personal details like name, birthday, age, location, or likes.
        Return the extracted information as a JSON array of objects.
        If no new information is found, return an empty array [].
        
        Content:
        ${text.substring(0, 5000)}
      `;

      const config = {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              key: { type: Type.STRING },
              value: { type: Type.STRING }
            },
            required: ['category', 'key', 'value']
          }
        }
      };

      const response = await this._generateWithFallback('gemini-3-flash-preview', prompt, config);

      if (response && response.text) {
        let extractedMemories = [];
        try {
          const jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
          extractedMemories = JSON.parse(jsonStr);
        } catch (e) {
          console.error(`[BackgroundWorker] Failed to parse memory extraction JSON:`, e.message);
        }

        for (const memory of extractedMemories) {
          if (memory && memory.key && memory.value) {
            await UserMemory.findOneAndUpdate(
              { userId, key: memory.key.trim() },
              { category: memory.category || 'general', value: memory.value.trim() },
              { upsert: true, new: true }
            );
          }
        }
      }
    } catch (error) {
      console.error(`[BackgroundWorker] Error extracting memory from ${sourceInfo}:`, error.message);
    }
  }

  async embedAndStoreDocument(content, userId, sourceType, originalDocId = null, title = '') {
    try {
      // If updating an existing document, remove old chunks first
      if (originalDocId) {
        await VectorStore.deleteMany({ userId, 'metadata.originalDocId': originalDocId });
      }

      let cleanContent = content;
      if (sourceType === 'web' || sourceType === 'alchemy') {
        try {
          const cheerio = require('cheerio');
          const $ = cheerio.load(content);
          $('script, style, noscript, iframe, nav, footer, header').remove();
          cleanContent = $('body').text().replace(/\s+/g, ' ').trim();
          if (!cleanContent) cleanContent = content; // Fallback if cheerio strips everything
        } catch (e) {
          console.warn('[BackgroundWorker] Cheerio HTML cleaning failed, using raw content:', e.message);
        }
      }

      const SmartTextSplitter = require('../utils/textSplitter');
      const splitter = new SmartTextSplitter();
      const chunks = await splitter.splitText(cleanContent, { sourceType, originalDocId, title });

      for (const chunkObj of chunks) {
        let embedding = [];
        try {
          embedding = await getLocalEmbedding(chunkObj.text);
        } catch (e) {
          console.error('[BackgroundWorker] Error generating local embedding for chunk:', e.message || e);
          continue;
        }

        if (embedding.length > 0) {
          try {
            console.log(`[BackgroundWorker] Attempting to save VectorStore chunk for ${sourceType} ${originalDocId}...`);
            const newDoc = new VectorStore({
              userId,
              textChunk: chunkObj.text,
              embedding,
              metadata: chunkObj.metadata
            });
            await newDoc.save();
            console.log(`[BackgroundWorker] Successfully saved VectorStore chunk for ${sourceType} ${originalDocId}`);
          } catch (saveError) {
            console.error(`[BackgroundWorker] ❌ Mongoose validation/save error for ${sourceType} ${originalDocId}:`, saveError.message);
            console.error(saveError.stack);
            throw saveError;
          }
        } else {
          console.warn(`[BackgroundWorker] ⚠️ Warning: Embedding is empty for chunk of ${sourceType} ${originalDocId}. Skipping save.`);
        }
      }
    } catch (error) {
      console.error('Error embedding and storing document:', error);
      throw error;
    }
  }

  // Fallback Load Balancer logic
  async _generateWithFallback(initialModelName, prompt, config) {
    let currentModel = initialModelName;
    let maxRetries = 3;
    let hasFallbackOccurred = false;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.ai.models.generateContent({
          model: currentModel,
          contents: prompt,
          config: config
        });
        return response;
      } catch (err) {
        if (err.status === 503 || err.status === 429) {
          if (attempt === maxRetries) {
            // TRIGGER LOAD BALANCER FALLBACK
            if (!hasFallbackOccurred && currentModel === 'gemini-3-flash-preview') {
              console.warn(`[BackgroundLoadBalancer] QUOTA EXHAUSTED on ${currentModel}. Triggering fallback to gemini-3.1-flash-lite-preview...`);
              currentModel = 'gemini-3.1-flash-lite-preview';
              hasFallbackOccurred = true;
              attempt = 0; // Reset attempts
              continue;
            }
            throw err;
          }
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`[BackgroundLoadBalancer] ${currentModel} busy (${err.status}). Retry ${attempt}/${maxRetries} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw err;
        }
      }
    }
  }
}

module.exports = BackgroundWorker;

