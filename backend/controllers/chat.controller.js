const Message = require('../models/Message');
const UserMemory = require('../models/UserMemory');
const AIOrchestrator = require('../services/aiOrchestrator');
const BackgroundWorker = require('../services/backgroundWorker');
const RAGService = require('../services/RAGService');

// @desc    Handle AI Chat interactions using 3-tier architecture
// @route   POST /api/chat/ai
const handleAIChat = async (req, res) => {
  try {
    const { message, sessionId, systemInstruction, isThinkingMode, sourceId, sourceType } = req.body;
    const userId = req.user._id;
    const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ message: 'Missing Gemini API Key.' });
    }

    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const currentSessionId = sessionId || 'default_session';

    // 1. Save new user message to Tier 1 (Message)
    const userMessageDoc = new Message({
      sessionId: currentSessionId,
      role: 'user',
      content: message
    });
    await userMessageDoc.save();

    // 2. Retrieve recent chat history from Tier 1
    const recentHistory = await Message.find({ sessionId: currentSessionId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Reverse to get chronological order
    const chatHistory = recentHistory.reverse();

    // 3. Fetch user memories from Tier 3 (UserMemory) and format as JSON string
    const userMemories = await UserMemory.find({ userId }).lean();
    const memoryContext = userMemories.reduce((acc, mem) => {
      acc[mem.key] = mem.value;
      return acc;
    }, {});
    const memoryJsonString = JSON.stringify(memoryContext); // Removed spacing to save tokens

    // 4. Universal Zero-Token Pre-fetch (UZP): Always fetch context locally before calling LLM
    console.log(`[UZP] Auto-fetching context for query: "${message.substring(0, 30)}..."`);
    const results = await RAGService.retrieve(message, userId, {
      limit: 5,
      sourceType: sourceId ? sourceType : null, // Bias if source provided
      originalDocId: sourceId || null
    });
    // Compress and inject the top sentences using TF-IDF logic inside formatContext
    const ragContext = RAGService.formatContext(results, message);

    // 5. Construct a comprehensive system prompt
    const baseInstruction = systemInstruction || `
      You are an intelligent AI assistant for the Edulearn system.
      Always answer in Vietnamese, clearly and friendly.
    `;
    
    const systemPrompt = `
      ${baseInstruction}
      
      You have access to the user's personal memory and a vast knowledge base.
      
      --- USER PERSONAL MEMORY ---
      ${memoryJsonString}
      
      ${ragContext ? `--- RETRIEVED KNOWLEDGE BASE CONTEXT ---\n${ragContext}\n\nSử dụng thông tin trên để trả lời câu hỏi của người dùng một cách chính xác nhất.` : ''}
    `;

    // 6. Call AIOrchestrator.run
    const orchestrator = new AIOrchestrator(apiKey);
    let aiResponseText = '';
    try {
      aiResponseText = await orchestrator.run(systemPrompt, message, chatHistory, userId, isThinkingMode);
    } catch (aiError) {
      console.error('AI Orchestrator Error:', aiError);
      if (aiError.status === 429) {
        return res.status(429).json({ message: 'Hệ thống AI đang quá tải do vượt quá giới hạn truy cập miễn phí (Rate Limit). Vui lòng thử lại sau 1 phút.' });
      } else if (aiError.status === 503) {
        return res.status(503).json({ message: 'Mô hình AI hiện đang quá tải (High Demand). Vui lòng thử lại sau giây lát.' });
      } else {
        return res.status(500).json({ message: 'Lỗi khi kết nối với AI. Vui lòng thử lại.' });
      }
    }

    // 7. Save AI's response to Tier 1 (Message)
    const aiMessageDoc = new Message({
      sessionId: currentSessionId,
      role: 'assistant',
      content: aiResponseText
    });
    await aiMessageDoc.save();

    // 8. Trigger BackgroundWorker to extract new information
    // BATCHING ALGORITHM: Only run every 5 messages to save 80% daily quota
    const totalSessionMessages = await Message.countDocuments({ sessionId: currentSessionId });
    if (totalSessionMessages > 0 && totalSessionMessages % 5 === 0) {
      const worker = new BackgroundWorker(apiKey);
      console.log(`[ChatController] Batch memory extraction triggered (Message count: ${totalSessionMessages})`);
      worker.extractUserMemory(chatHistory, userId).catch(err => console.error('Background worker error:', err));
    } else {
      console.log(`[ChatController] Skipping background memory scan (Message count: ${totalSessionMessages}). Waiting for batch size 5.`);
    }

    // 9. Return AI response to the frontend
    res.status(200).json({ reply: aiResponseText, sessionId: currentSessionId });

  } catch (error) {
    console.error('Error in handleAIChat:', error);
    res.status(500).json({ message: 'Server error in AI Chat' });
  }
};

module.exports = { handleAIChat };
