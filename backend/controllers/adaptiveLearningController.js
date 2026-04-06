const { GoogleGenAI, Type } = require('@google/genai');
const AdaptiveLearning = require('../models/AdaptiveLearning');
const RAGService = require('../services/RAGService');
const { syncToRag } = require('../utils/ragSync');

// Helper to get Gemini AI instance
const getAI = (req) => {
  const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Gemini API Key. Please provide it in settings.');
  }
  return new GoogleGenAI({ apiKey });
};

// --- RESPONSE SCHEMAS ---

const testSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswer: { type: Type.STRING },
      explanation: { type: Type.STRING },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["question", "options", "correctAnswer", "explanation", "tags"]
  }
};

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.OBJECT,
      properties: {
        weak_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        strong_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        aiSummary: { type: Type.STRING }
      },
      required: ["weak_tags", "strong_tags", "aiSummary"]
    },
    roadmap: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.NUMBER },
          title: { type: Type.STRING },
          tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
          resources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                link: { type: Type.STRING },
                type: { type: Type.STRING }
              },
              required: ["title", "link", "type"]
            }
          }
        },
        required: ["day", "title", "tasks", "resources"]
      }
    }
  },
  required: ["analysis", "roadmap"]
};

// --- HELPERS ---

const smartParse = (input) => {
  if (!input || typeof input !== 'string') return input;
  let cleaned = input.replace(/```json|```/g, '').trim();
  try { return JSON.parse(cleaned); } catch (e) {
    try {
      // Fix single quotes for common AI pseudo-JSON
      let fixed = cleaned
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
        .replace(/: \s*'([^']*)'/g, ': "$1"')
        .replace(/,\s*'([^']*)'/g, ', "$1"')
        .replace(/\[\s*'([^']*)'/g, '["$1"');
      return JSON.parse(fixed);
    } catch (e2) { return null; }
  }
};

const deepSanitize = (data) => {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(deepSanitize);
  if (typeof data === 'object') {
    const newData = {};
    for (const key in data) {
      let val = data[key];
      // If we find a string that looks like a JSON array/object where we expect one, parse it
      if (typeof val === 'string' && (val.trim().startsWith('[') || val.trim().startsWith('{'))) {
        const parsed = smartParse(val);
        if (parsed) val = parsed;
      }
      newData[key] = deepSanitize(val);
    }
    return newData;
  }
  return data;
};

// Retry helper for API Rate Limits (RPM) with Schema support
const generateWithRetry = async (ai, model, prompt, schema = null, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const config = {};
      if (schema) {
        config.responseMimeType = "application/json";
        config.responseSchema = schema;
      }

      const response = await ai.models.generateContent({
        model: model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: config
      });
      return response;
    } catch (error) {
      if ((error.status === 429 || error.message?.includes('429')) && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`[Gemini] Rate limit hit. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

exports.generateTest = async (req, res) => {
  try {
    const { topic } = req.body;
    const userId = req.user._id;

    if (!topic) return res.status(400).json({ message: 'Topic is required' });

    const contextResults = await RAGService.retrieve(topic, userId.toString(), { limit: 10 });
    const contextString = RAGService.formatContext(contextResults);
    const ai = getAI(req);
    
    const prompt = `Create a challenging 5-10 question multiple-choice test about "${topic}" based on this context:\n${contextString}`;

    const response = await generateWithRetry(ai, 'gemini-3-flash-preview', prompt, testSchema);
    
    let testContent = smartParse(response.text);
    if (!testContent || !Array.isArray(testContent)) {
      throw new Error('AI generated invalid test format');
    }

    const newSession = new AdaptiveLearning({ userId, topic, testContent, status: 'testing' });
    await newSession.save();
    res.status(201).json({ sessionId: newSession._id, testContent });
  } catch (error) {
    console.error('Error generating adaptive test:', error);
    res.status(500).json({ message: 'Failed to generate test', error: error.message });
  }
};

exports.submitTest = async (req, res) => {
  try {
    const { sessionId, answers } = req.body;
    const userId = req.user._id;
    const session = await AdaptiveLearning.findOne({ _id: sessionId, userId });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    let score = 0;
    const evaluatedAnswers = (session.testContent || []).map((q, index) => {
      const userAnswer = (answers || []).find(a => a.questionIndex === index);
      const isCorrect = userAnswer && userAnswer.selectedAnswer === q.correctAnswer;
      if (isCorrect) score++;
      return { questionIndex: index, selectedAnswer: userAnswer?.selectedAnswer || null, isCorrect, timestamp: new Date() };
    });

    session.userResults = { score, totalQuestions: session.testContent.length, answers: evaluatedAnswers, completedAt: new Date() };

    const ai = getAI(req);
    const analysisPrompt = `Analyze test results for "${session.topic}" and create a 7-day roadmap.\nTEST DATA: ${JSON.stringify({ questions: session.testContent.map(q => ({ question: q.question, tags: q.tags })), results: evaluatedAnswers })}`;

    const analysisResponse = await generateWithRetry(ai, 'gemini-3-flash-preview', analysisPrompt, analysisSchema);
    
    let analysisData = smartParse(analysisResponse.text);
    if (!analysisData || !analysisData.roadmap) {
       throw new Error('Failed to generate roadmap analysis');
    }

    // AGGRESSIVE DEEP RECURSIVE SANITIZATION
    const sanitizedData = deepSanitize(analysisData);

    session.analysis = sanitizedData.analysis;
    session.roadmap = sanitizedData.roadmap;
    session.status = 'completed';
    await session.save();

    // Sync Roadmap to RAG (Chatbot) - Wrap in try/catch to avoid crashing if sync fails
    try {
      await syncToRag({
        userId,
        text: `Lộ trình học tập thích ứng chủ đề ${session.topic}:\n${JSON.stringify(session.roadmap, null, 2)}\n\nĐiểm yếu: ${session.analysis.weak_tags.join(', ')}`,
        title: `Lộ trình: ${session.topic}`,
        sourceType: 'roadmap',
        metadata: { topic: session.topic, score: `${score}/${session.testContent.length}`, isAiGenerated: true }
      });
    } catch (ragError) {
      console.error('[RAGSync] Error in background sync:', ragError);
    }

    res.status(200).json({ score, totalQuestions: session.testContent.length, analysis: session.analysis, roadmap: session.roadmap });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ message: 'Failed to process results', error: error.message });
  }
};

exports.getLatestRoadmap = async (req, res) => {
  try {
    const userId = req.user._id;
    const roadmap = await AdaptiveLearning.findOne({ userId, status: 'completed' })
      .sort({ updatedAt: -1 });
    
    if (!roadmap) {
      return res.status(200).json(null);
    }
    
    res.status(200).json(roadmap);
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ message: 'Failed to fetch roadmap' });
  }
};
