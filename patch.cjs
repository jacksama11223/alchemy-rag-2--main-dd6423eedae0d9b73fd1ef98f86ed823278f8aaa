const fs = require('fs'); 
const path = 'backend/controllers/adaptiveLearningController.js'; 
let content = fs.readFileSync(path, 'utf8'); 

if (content.includes('generateMoreChallenge')) {
   console.log('Already exists');
   process.exit(0);
}

content += `
exports.generateMoreChallenge = async (req, res) => {
  const { term, activityType } = req.body;
  const userId = req.user._id;

  try {
     const module = await LearningModule.findOne({ user: userId, term });
     if (!module) return res.status(404).json({ message: 'Module not found' });

     const RAGService = require('../services/RAGService');
     const contextResults = await RAGService.retrieve(term, userId.toString(), { limit: 8 });
     const contextString = RAGService.formatContext(contextResults);

     const ai = getAI(req);
     let prompt = \`Tạo thêm 5 câu hỏi THỬ THÁCH hơn cho tính năng "\${activityType}" về chủ đề "\${term}".\\nĐặc biệt tập trung sửa các sai lầm hoặc lấp lỗ hổng dựa trên bối cảnh lịch sử học tập sau đây:\\n\${contextString}\\n\\n\`;
     
     const { Type } = require('@google/genai');
     let schema = {};

     if (activityType === 'quiz') {
         prompt += \`Provide 5 multiple choice questions. Format as JSON array of objects with keys: "question", "options" (array of strings), "correctAnswer", "explanation".\`;
         schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING }, explanation: { type: Type.STRING } } }};
     } else if (activityType === 'flashcard') {
         prompt += \`Provide 5 flashcards. Format as JSON array of objects with keys: "front" and "back".\`;
         schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { front: { type: Type.STRING }, back: { type: Type.STRING } } }};
     } else {
         prompt += \`Provide 5 fill-in-the-blank questions. Format as JSON array of objects with keys: "question", "answer", "explanation".\`;
         schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, answer: { type: Type.STRING }, explanation: { type: Type.STRING } } }};
     }

     let response;
     try {
       response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { responseMimeType: 'application/json', responseSchema: schema }
       });
     } catch (err) {
       console.log('[AI Fallback] gemini-3-flash failed, using lite...', err.message);
       response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-preview',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { responseMimeType: 'application/json', responseSchema: schema }
       });
     }

     const newItems = smartParse(response.text);
     if (!newItems || !Array.isArray(newItems)) throw new Error('AI failed to generate items');

     if (activityType === 'quiz') module.quiz.push(...newItems);
     else if (activityType === 'flashcard') module.flashcards.push(...newItems);
     else if (activityType === 'short_answer') module.shortAnswers.push(...newItems);

     await module.save();
     res.status(200).json(module);
  } catch (error) {
     console.error('Error generating more challenge:', error);
     res.status(500).json({ message: 'Failed to generate more content', error: error.message });
  }
};
`; 

fs.writeFileSync(path, content);
console.log('Appended successfully');
