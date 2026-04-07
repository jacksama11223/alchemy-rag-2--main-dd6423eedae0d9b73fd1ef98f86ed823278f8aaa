const { GoogleGenAI, Type } = require('@google/genai');
const AdaptiveLearning = require('../models/AdaptiveLearning');
const RAGService = require('../services/RAGService');
const { syncToRag } = require('../utils/ragSync');
const LearningActivity = require('../models/LearningActivity');
const User = require('../models/User');
const SkillAchievement = require('../models/SkillAchievement');
const FlashcardSet = require('../models/FlashcardSet');
const LearningModule = require('../models/LearningModule');
const mongoose = require('mongoose');

// In-memory lock for RPM control (Term-level)
const activeGenerations = new Set();

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
          },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["day", "title", "tasks", "resources", "tags"]
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
  const models = [model, 'gemini-1.5-flash', 'gemini-1.5-pro'];
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const config = schema ? { responseMimeType: "application/json", responseSchema: schema } : {};
      const response = await ai.models.generateContent({
        model: models[(attempt - 1) % models.length],
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
    const competencyContext = await RAGService.injectCompetencyContext(userId);
    const ai = getAI(req);
    
    const prompt = `${competencyContext}Create a challenging 5-10 question multiple-choice test about "${topic}" based on this context:\n${contextString}`;

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

const formatRoadmapToText = (topic, roadmap, analysis) => {
  let text = `LỘ TRÌNH HỌC TẬP THÍCH ỨNG (AI): ${topic.toUpperCase()}\n\n`;
  text += `ĐÁNH GIÁ NĂNG LỰC:\n- Điểm mạnh: ${analysis.strong_tags.join(', ')}\n- Cần cải thiện: ${analysis.weak_tags.join(', ')}\n\n`;
  text += `KẾ HOẠCH CHI TIẾT 7 NGÀY:\n`;
  
  roadmap.forEach(day => {
    text += `\n[Ngày ${day.day}: ${day.title}]\n`;
    text += `Nội dung: ${day.description}\n`;
    if (day.resources && day.resources.length > 0) {
      text += `Tài liệu: ${day.resources.map(r => `${r.title} (${r.type})`).join(', ')}\n`;
    }
  });
  
  return text;
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
    const competencyContext = await RAGService.injectCompetencyContext(userId);
    const analysisPrompt = `${competencyContext}Analyze test results for "${session.topic}" and create a 7-day roadmap.\nTEST DATA: ${JSON.stringify({ questions: session.testContent.map(q => ({ question: q.question, tags: q.tags })), results: evaluatedAnswers })}\n\nIMPORTANT FORMATTING RULES:
    1. Mark at least 2-3 key technical terms in each task using double brackets like [[React Hooks]] or [[Closure]].
    2. These bracketed terms MUST become interactive study points.
    3. Also include these technical terms in the "tags" array for each roadmap day.
    4. Use the User Competency context to skip basic topics they already know (>70% proficiency).`;

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

    // Sync Roadmap to RAG (Chatbot) - Using human-readable summary for better search results
    try {
      const humanReadableRoadmap = formatRoadmapToText(session.topic, session.roadmap, session.analysis);
      
      await syncToRag({
        userId,
        text: humanReadableRoadmap,
        title: `Lộ trình: ${session.topic}`,
        sourceType: 'roadmap',
        metadata: { 
          topic: session.topic, 
          score: `${score}/${session.testContent.length}`, 
          isAiGenerated: true,
          originalRoadmapJson: JSON.stringify(session.roadmap) // Keep JSON as backup in metadata
        }
      });
    } catch (ragError) {
      console.error('[RAGSync] Error in background sync:', ragError);
    }

    // Trigger Skill Achievement Sync (New Feature)
    try {
      const GamificationController = require('./gamificationController');
      if (GamificationController.syncSkillAchievementsInternal) {
        // Run in background
        GamificationController.syncSkillAchievementsInternal(userId, session.topic, session.analysis, req);
      }
    } catch (syncError) {
      console.error('[SkillSync] Error triggering skill sync:', syncError);
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

exports.getAllRoadmaps = async (req, res) => {
  try {
    const userId = req.user._id;
    const roadmaps = await AdaptiveLearning.find({ userId, status: 'completed' })
      .sort({ updatedAt: -1 });
    
    res.status(200).json(roadmaps || []);
  } catch (error) {
    console.error('Error fetching all roadmaps:', error);
    res.status(500).json({ message: 'Failed to fetch roadmaps' });
  }
};

exports.renameRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const { topic } = req.body;
    const userId = req.user._id;

    if (!topic) return res.status(400).json({ message: 'Topic is required' });

    const roadmap = await AdaptiveLearning.findOneAndUpdate(
      { _id: id, userId },
      { topic },
      { new: true }
    );

    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

    res.status(200).json(roadmap);
  } catch (error) {
    console.error('Error renaming roadmap:', error);
    res.status(500).json({ message: 'Failed to rename roadmap' });
  }
};

exports.deleteRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    console.log(`[DELETE] Roadmap ID: ${id} | User ID: ${userId}`);

    const roadmap = await AdaptiveLearning.findOneAndDelete({ _id: id, userId });
    
    if (!roadmap) {
      console.warn(`[DELETE] Roadmap not found or unauthorized: ${id}`);
      return res.status(404).json({ message: 'Không tìm thấy lộ trình hoặc không có quyền xóa' });
    }

    console.log(`[DELETE] Successfully deleted roadmap: ${id}`);

    res.status(200).json({ message: 'Roadmap deleted successfully' });
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    res.status(500).json({ message: 'Failed to delete roadmap' });
  }
};

exports.generateInteractiveContent = async (req, res) => {
  const { term } = req.body;
  const userId = req.user._id;
  const lockKey = `${userId}-${term}`;

  try {
    if (!term) return res.status(400).json({ message: 'Term is required' });

    // 1. Check if we already have this Unified Learning Module
    const existingModule = await LearningModule.findOne({ user: userId, term: term });
    if (existingModule) {
      console.log(`[DB] Cache Hit: Returning existing LearningModule for: ${term}`);
      return res.status(200).json(existingModule);
    }

    // 2. RPM Lock
    if (activeGenerations.has(lockKey)) {
      return res.status(429).json({ message: 'Đang tạo nội dung, vui lòng đợi giây lát...' });
    }
    activeGenerations.add(lockKey);

    console.log(`\n--- [AI GENERATION START] ---`);
    console.log(`Term: ${term} | User: ${userId}`);

    const contextResults = await RAGService.retrieve(term, userId.toString(), { limit: 5 });
    const contextString = RAGService.formatContext(contextResults);

    const ai = getAI(req);
    const prompt = `Create a learning session for the term "[[${term}]]" based on this context:\n${contextString}\n\nProvide 3 things:
    1. A Flashcard (Front & Back)
    2. A 3-question Quiz with options
    3. A Code Writing Challenge (if applicable, else a logic puzzle)

    IMPORTANT: Response MUST be pure valid JSON only.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        flashcard: {
          type: Type.OBJECT,
          properties: { front: { type: Type.STRING }, back: { type: Type.STRING } },
          required: ["front", "back"]
        },
        quiz: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        },
        codeChallenge: {
          type: Type.OBJECT,
          properties: {
             problem: { type: Type.STRING },
             startCode: { type: Type.STRING },
             solution: { type: Type.STRING },
             hints: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["problem", "startCode", "solution"]
        }
      },
      required: ["flashcard", "quiz", "codeChallenge"]
    };

    let content = null;
    const modelsList = ['gemini-3-flash-preview', 'gemini-1.5-flash-latest'];

    // --- STRATEGY 1: JSON Schema Mode (Loop through models) ---
    for (const modelName of modelsList) {
      if (content) break; 
      try {
        console.log(`[AI] Strategy 1: Attempting JSON Schema Mode with ${modelName}...`);
        const config = {
          responseMimeType: "application/json",
          responseSchema: schema
        };
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: config
        });
        
        if (response && response.text) {
          content = smartParse(response.text);
        }
      } catch (schemaErr) {
        console.warn(`[AI WARN] Strategy 1 failed for ${modelName}: ${schemaErr.message}`);
      }
    }

    // --- STRATEGY 2: Fallback to Raw Text Mode ---
    if (!content) {
      const stableModel = 'gemini-1.5-flash-latest';
      console.log(`[AI] Strategy 2: Attempting Raw Text Fallback with ${stableModel}...`);
      try {
        const rawResponse = await ai.models.generateContent({
          model: stableModel,
          contents: [{ role: 'user', parts: [{ text: prompt + "\nFormat as a flat JSON object." }] }]
        });
        if (rawResponse && rawResponse.text) {
          content = smartParse(rawResponse.text);
        }
      } catch (fallbackErr) {
        console.error(`[AI ERROR] Strategy 2 failed: ${fallbackErr.message}`);
      }
    }

    if (!content) {
      throw new Error('AI failed to return valid content in both Schema and Fallback mode.');
    }

    console.log(`[AI SUCCESS] Content generated for: ${term}`);

    // 3. PERSISTENCE: Save to Unified LearningModule
    const newModule = new LearningModule({
      user: userId,
      term: term,
      flashcard: content.flashcard,
      quiz: content.quiz,
      codeChallenge: content.codeChallenge
    });
    await newModule.save();
    console.log(`[DB] Unified LearningModule saved: ${newModule._id}`);

    res.status(200).json(newModule);
  } catch (error) {
    console.error(`\n--- [AI ERROR] ---`);
    console.error(`Term: ${term} | Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to generate interactive content', error: error.message });
  } finally {
    activeGenerations.delete(lockKey);
    console.log(`--- [AI END] ---\n`);
  }
};

exports.getExistingModules = async (req, res) => {
  try {
    const { term } = req.query;
    const userId = req.user._id;

    if (!term) return res.status(400).json({ message: 'Term is required' });

    // Find modules for this specific term
    const modules = await LearningModule.find({
      user: userId,
      term: { $regex: new RegExp(term, 'i') }
    }).sort({ createdAt: -1 }).limit(5);

    res.status(200).json(modules);
  } catch (error) {
    console.error('Error fetching existing modules:', error);
    res.status(500).json({ message: 'Failed to fetch existing modules' });
  }
};

exports.submitActivityScore = async (req, res) => {
  try {
    const { points, activityType, term, roadmapId, dayIndex, taskIndex } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Save Activity Log
    const activity = new LearningActivity({
      userId,
      term,
      activityType,
      score: points,
      totalPoints: activityType === 'code' ? 100 : activityType === 'quiz' ? 50 : 30,
      status: points > 0 ? 'completed' : 'failed'
    });
    await activity.save();

    // 2. Update Brain Power & Level
    user.brainPower = (user.brainPower || 0) + points;
    if (user.brainPower > 5000) user.brainLevel = 'Legend';
    else if (user.brainPower > 2500) user.brainLevel = 'Master';
    else if (user.brainPower > 1000) user.brainLevel = 'Expert';
    else if (user.brainPower > 500) user.brainLevel = 'Advanced';
    else if (user.brainPower > 200) user.brainLevel = 'Intermediate';
    await user.save();

    // 3. Update Skill Proficiency (Semantic Boost)
    const skill = await SkillAchievement.findOne({ userId, name: { $regex: new RegExp(term, 'i') }, level: 'child' });
    if (skill) {
      // Increase proficiency by a small amount for each study activity
      const boost = activityType === 'code' ? 5 : activityType === 'quiz' ? 3 : 1;
      skill.proficiency = Math.min(100, skill.proficiency + boost);
      if (!skill.masteredTopics.some(t => t.topic === term)) {
        skill.masteredTopics.push({ topic: term, depth: 'deep', completedAt: new Date() });
      }
      await skill.save();
    }

    // 4. Update Roadmap Task Mastery & Proficiency
    if (roadmapId && dayIndex !== undefined && taskIndex !== undefined) {
       const roadmap = await AdaptiveLearning.findOne({ _id: roadmapId, userId });
       if (roadmap && roadmap.roadmap[dayIndex]) {
          const day = roadmap.roadmap[dayIndex];
          if (!day.taskStats) day.taskStats = [];
          
          let stat = day.taskStats.find(s => s.taskIndex === taskIndex);
          
          // Calculate activity proficiency (points earned / potential points)
          const maxPoints = activityType === 'code' ? 100 : activityType === 'quiz' ? 50 : 30;
          const currentProficiency = Math.round((points / maxPoints) * 100);

          if (!stat) {
            day.taskStats.push({
              taskIndex,
              proficiency: currentProficiency,
              attempts: 1,
              lastAttempt: new Date()
            });
          } else {
            // Update logic: Take the highest proficiency achieved so far
            stat.proficiency = Math.max(stat.proficiency, currentProficiency);
            stat.attempts += 1;
            stat.lastAttempt = new Date();
          }
          await roadmap.save();
       }
    }

    res.status(200).json({ 
      message: 'Activity recorded and power gained', 
      brainPower: user.brainPower,
      brainLevel: user.brainLevel
    });
  } catch (error) {
    console.error('Error submitting activity score:', error);
    res.status(500).json({ message: 'Failed to submit score' });
  }
};
