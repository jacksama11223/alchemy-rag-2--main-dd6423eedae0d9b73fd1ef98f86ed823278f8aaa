const AdaptiveLearning = require('../models/AdaptiveLearning');
const RAGService = require('../services/RAGService');
const { GoogleGenAI } = require('@google/genai');
const { syncToRag } = require('../utils/ragSync');

// Helper to get Gemini AI instance
const getAI = (req) => {
  const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Gemini API Key. Please provide it in settings.');
  }
  return new GoogleGenAI({ apiKey });
};

// Retry helper for API Rate Limits (RPM)
const generateWithRetry = async (ai, model, prompt, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      return response;
    } catch (error) {
      // Check for rate limit error (429)
      if ((error.status === 429 || error.message?.includes('429')) && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`[Gemini] Rate limit hit. Retrying in ${delay}ms (Attempt ${attempt}/${maxRetries})...`);
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

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    // 1. Retrieve context from RAG based on the topic
    const contextResults = await RAGService.retrieve(topic, userId.toString(), { limit: 10 });
    const contextString = RAGService.formatContext(contextResults);

    // 2. Use Gemini to generate a test
    const ai = getAI(req);
    
    const prompt = `
      You are an expert tutor. Based on the following context retrieved from the user's personal knowledge base, 
      create a challenging multiple-choice test about "${topic}".
      
      CONTEXT:
      ${contextString}
      
      REQUIREMENTS:
      1. Generate 5-10 multiple-choice questions.
      2. Each question must have exactly 4 options.
      3. Specify the correct answer for each question.
      4. Provide a brief explanation for why the answer is correct.
      5. Categorize each question with relevant tags (e.g., ["Basics", "Advanced", "Logic"]).
      6. Return ONLY a valid JSON array of objects.
      
      JSON FORMAT:
      [
        {
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A",
          "explanation": "Explanation here.",
          "tags": ["Tag1", "Tag2"]
        }
      ]
    `;

    const response = await generateWithRetry(ai, 'gemini-3-flash-preview', prompt);
    const text = response.text;
    
    // Clean JSON response (handle markdown code blocks)
    let jsonStr = text.replace(/```json|```/g, '').trim();
    const testContent = JSON.parse(jsonStr);

    // 3. Save to database
    const newSession = new AdaptiveLearning({
      userId,
      topic,
      testContent,
      status: 'testing'
    });
    await newSession.save();

    res.status(201).json({ 
      sessionId: newSession._id,
      testContent 
    });
  } catch (error) {
    console.error('Error generating adaptive test:', error);
    res.status(500).json({ message: 'Failed to generate test', error: error.message });
  }
};

exports.submitTest = async (req, res) => {
  try {
    const { sessionId, answers } = req.body; // answers: [{ questionIndex, selectedAnswer }]
    const userId = req.user._id;

    const session = await AdaptiveLearning.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // 1. Calculate Results
    let score = 0;
    const evaluatedAnswers = session.testContent.map((q, index) => {
      const userAnswer = answers.find(a => a.questionIndex === index);
      const isCorrect = userAnswer && userAnswer.selectedAnswer === q.correctAnswer;
      if (isCorrect) score++;
      return {
        questionIndex: index,
        selectedAnswer: userAnswer ? userAnswer.selectedAnswer : null,
        isCorrect,
        timestamp: new Date()
      };
    });

    session.userResults = {
      score,
      totalQuestions: session.testContent.length,
      answers: evaluatedAnswers,
      completedAt: new Date()
    };

    // 2. Analyze weak/strong points using Gemini
    const ai = getAI(req);

    const analysisPrompt = `
      Analyze this user's test results for the topic "${session.topic}".
      
      TEST DATA:
      ${JSON.stringify({
        questions: session.testContent.map(q => ({ question: q.question, tags: q.tags })),
        results: evaluatedAnswers
      })}
      
      TASK:
      1. Identify "strong_tags" (tags where user got questions right).
      2. Identify "weak_tags" (tags where user got questions wrong).
      3. Provide a brief 2-sentence summary of their performance.
      4. Generate a 7-day adaptive learning roadmap to fix the weaknesses.
      5. Each roadmap day must be an object containing: "day" (number), "title" (string), "tasks" (array of strings), and "resources" (an ARRAY of objects, NOT a string).
      
      RETURN ONLY VALID JSON IN THIS FORMAT:
      {
        "analysis": {
          "weak_tags": ["tag1", "tag2"],
          "strong_tags": ["tag3"],
          "aiSummary": "Summary here."
        },
        "roadmap": [
          {
            "day": 1,
            "title": "Topic Day 1",
            "tasks": ["Task A", "Task B"],
            "resources": [
              {
                "title": "Resource Name",
                "link": "/notes/...",
                "type": "note"
              }
            ]
          }
        ]
      }
    `;

    const analysisResponse = await generateWithRetry(ai, 'gemini-3-flash-preview', analysisPrompt);
    const analysisText = analysisResponse.text;
    
    // Clean and parse JSON response
    let analysisData;
    try {
      const jsonStr = analysisText.replace(/```json|```/g, '').trim();
      analysisData = JSON.parse(jsonStr);
      
      // Sanitization for robustness: Handle cases where AI returns resources as a string
      if (analysisData.roadmap && Array.isArray(analysisData.roadmap)) {
        analysisData.roadmap = analysisData.roadmap.map(day => {
          // If resources is a string, try to parse it
          if (typeof day.resources === 'string') {
            try {
              day.resources = JSON.parse(day.resources);
            } catch (e) {
              console.warn('Failed to parse resources string from AI:', day.resources);
              day.resources = [];
            }
          }
          // Ensure it's an array for Mongoose
          if (!Array.isArray(day.resources)) {
            day.resources = [];
          }
          return day;
        });
      }
    } catch (parseError) {
      console.error('Failed to parse AI analysis result:', parseError);
      throw new Error('AI generated invalid format. Please try again.');
    }

    session.analysis = analysisData.analysis;
    session.roadmap = analysisData.roadmap;
    session.status = 'completed';
    await session.save();

    // 3. Sync Roadmap and Weaknesses to RAG for future retrieval
    await syncToRag({
      userId,
      text: `Lộ trình học tập thích ứng chủ đề ${session.topic}:\n${JSON.stringify(session.roadmap, null, 2)}\n\nĐiểm yếu cần cải thiện: ${session.analysis.weak_tags.join(', ')}`,
      title: `Lộ trình: ${session.topic}`,
      sourceType: 'roadmap',
      metadata: {
        topic: session.topic,
        score: `${score}/${session.testContent.length}`,
        isAiGenerated: true
      }
    });

    res.status(200).json({
      score,
      totalQuestions: session.testContent.length,
      analysis: session.analysis,
      roadmap: session.roadmap
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ message: 'Failed to process test results', error: error.message });
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
