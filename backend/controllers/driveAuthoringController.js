const asyncHandler = require('express-async-handler');
const File = require('../models/File');
const RAGService = require('../services/RAGService');
const AIOrchestrator = require('../services/aiOrchestrator');
const { syncToRag } = require('../utils/ragSync');

/**
 * @desc    Generate AI content based on templates and user prompt
 * @route   POST /api/files/generate-ai
 * @access  Private
 */
const generateAiFile = asyncHandler(async (req, res) => {
  const { templateType, userPrompt, parentId } = req.body;
  const userId = req.user._id;

  if (!templateType || !userPrompt) {
    res.status(400);
    throw new Error('Please provide templateType and userPrompt');
  }

  // 1. CHATBOT-LIKE RAG: Retrieve context from Knowledge Base
  console.log(`[AI-Authoring] Retrieving context for: "${userPrompt.substring(0, 50)}..."`);
  const rawContext = await RAGService.retrieve(userPrompt, userId.toString(), { limit: 8 });
  
  // Format context exactly like the AI Chatbot
  const contextString = rawContext.map(doc => {
    const title = doc.metadata?.title || doc.metadata?.sourceType || 'Tài liệu';
    return `[Nguồn: ${title}]\n${doc.textChunk}`;
  }).join('\n\n---\n\n');

  // 2. Define Template Instructions
  let systemInstruction = "";
  let fileNamePrefix = "";

  switch (templateType) {
    case 'book':
      systemInstruction = `Bạn là một tác giả chuyên nghiệp. Hãy viết một chương sách chuyên sâu về chủ đề người dùng yêu cầu, dựa trên các thông tin ngữ cảnh được cung cấp. Cấu trúc bài viết mạch lạc, có luận điểm và phân tích chi tiết.`;
      fileNamePrefix = "Sách_";
      break;
    case 'quiz':
      systemInstruction = `Bạn là một giáo viên chuyên môn. Hãy tạo một danh sách các câu hỏi ôn tập (trắc nghiệm và tự luận) kèm đáp án chi tiết dựa trên nội dung ngữ cảnh. Giúp người dùng nắm vững các kiến thức trọng tâm.`;
      fileNamePrefix = "OnTap_";
      break;
    case 'research':
      systemInstruction = `Bạn là một nhà nghiên cứu cấp cao. Hãy viết một báo cáo nghiên cứu chuyên sâu, bao gồm tổng quan chủ đề, phân tích các khía cạnh quan trọng và kết luận dựa trên dữ liệu ngữ cảnh.`;
      fileNamePrefix = "BaoCao_";
      break;
    default:
      systemInstruction = `Bạn là một trợ lý viết lách thông minh. Hãy giúp người dùng soạn thảo tài liệu chất lượng cao dựa trên yêu cầu và ngữ cảnh cung cấp.`;
      fileNamePrefix = "TaiLieu_";
  }

  const finalUserPrompt = `[DỮ LIỆU NGỮ CẢNH TỪ KHO TRI THỨC CỦA TÔI]\n${contextString}\n\n[YÊU CẦU SOẠN THẢO]\n${userPrompt}\n\nHãy viết nội dung thật chi tiết và chất lượng.`;

  // 3. AI GENERATION with AIOrchestrator (RPM Protection)
  const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;
  const orchestrator = new AIOrchestrator(apiKey);
  
  console.log(`[AI-Authoring] Generating content using AIOrchestrator...`);
  const generatedContent = await orchestrator.run(systemInstruction, finalUserPrompt, [], userId.toString());

  if (!generatedContent) {
    res.status(500);
    throw new Error('AI failed to generate content');
  }

  // 4. SAVE TO MONGODB (File Model)
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const fileName = `${fileNamePrefix}${userPrompt.substring(0, 20).replace(/\s+/g, '_')}_${Date.now()}.txt`;
  
  const file = new File({
    user: userId,
    name: fileName,
    type: 'txt',
    parentId: parentId || null,
    size: `${(Buffer.byteLength(generatedContent, 'utf8') / 1024).toFixed(2)} KB`,
    lastModified: new Date().toISOString().split('T')[0],
    owner: 'Tôi',
    content: generatedContent
  });

  const savedFile = await file.save();

  // 5. SYNC TO RAG (Vector Store) with tag 'drivestorage'
  console.log(`[AI-Authoring] Syncing generated file to RAG with tag: drivestorage`);
  await syncToRag({
    userId: userId.toString(),
    text: generatedContent,
    title: fileName,
    sourceType: 'drivestorage',
    metadata: {
      originalDocId: savedFile._id.toString(),
      template: templateType,
      isAiGenerated: true
    }
  });

  const responseObj = savedFile.toObject();
  responseObj.id = responseObj._id;
  delete responseObj._id;

  res.status(201).json(responseObj);
});

module.exports = { generateAiFile };
