const asyncHandler = require('express-async-handler');
const Quest = require('../models/Quest');
const Achievement = require('../models/Achievement');
const SkillAchievement = require('../models/SkillAchievement');
const User = require('../models/User');
const { GoogleGenAI, Type } = require('@google/genai');
const RAGService = require('../services/RAGService');

// --- User Gamification Stats ---
const addXP = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;
  const user = await User.findById(req.user._id);
  if (user) {
    user.xp += amount;
    user.level = Math.floor(user.xp / 1000) + 1;
    const updatedUser = await user.save();
    res.json({ xp: updatedUser.xp, level: updatedUser.level, message: `Added ${amount} XP for ${reason}` });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const updateRank = asyncHandler(async (req, res) => {
  const { points, result } = req.body;
  const user = await User.findById(req.user._id);
  if (user) {
    user.lp += points;
    if (result === 'Victory') user.totalWins += 1;
    if (result === 'Defeat') user.totalLosses += 1;
    
    user.matchHistory.unshift({ result, lpChange: points, timestamp: new Date() });
    if (user.matchHistory.length > 50) user.matchHistory.pop();

    // Simple rank tier logic
    if (user.lp < 0) user.lp = 0;
    if (user.lp >= 100) {
      // Promotion logic (simplified)
      user.lp = 0;
      // ... update tier/division
    }

    const updatedUser = await user.save();
    res.json({ lp: updatedUser.lp, rankTier: updatedUser.rankTier, rankDivision: updatedUser.rankDivision });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// --- Quests ---
const getQuests = asyncHandler(async (req, res) => {
  const quests = await Quest.find({ user: req.user._id });
  res.json(quests);
});

const createQuest = asyncHandler(async (req, res) => {
  const quest = new Quest({ ...req.body, user: req.user._id });
  const createdQuest = await quest.save();
  res.status(201).json(createdQuest);
});

const updateQuest = asyncHandler(async (req, res) => {
  const quest = await Quest.findById(req.params.id);
  if (quest && quest.user.toString() === req.user._id.toString()) {
    Object.assign(quest, req.body);
    const updatedQuest = await quest.save();
    res.json(updatedQuest);
  } else {
    res.status(404);
    throw new Error('Quest not found or unauthorized');
  }
});

const deleteQuest = asyncHandler(async (req, res) => {
  const quest = await Quest.findById(req.params.id);
  if (quest && quest.user.toString() === req.user._id.toString()) {
    await quest.deleteOne();
    res.json({ message: 'Quest removed' });
  } else {
    res.status(404);
    throw new Error('Quest not found or unauthorized');
  }
});

// --- Achievements ---
const getAchievements = asyncHandler(async (req, res) => {
  const achievements = await Achievement.find({ user: req.user._id });
  res.json(achievements);
});

const createAchievement = asyncHandler(async (req, res) => {
  const achievement = new Achievement({ ...req.body, user: req.user._id });
  const createdAchievement = await achievement.save();
  res.status(201).json(createdAchievement);
});

const updateAchievement = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id);
  if (achievement && achievement.user.toString() === req.user._id.toString()) {
    Object.assign(achievement, req.body);
    const updatedAchievement = await achievement.save();
    res.json(updatedAchievement);
  } else {
    res.status(404);
    throw new Error('Achievement not found or unauthorized');
  }
});

// --- Skill Achievements (New Feature) ---

const getSkillAchievements = asyncHandler(async (req, res) => {
  const achievements = await SkillAchievement.find({ 
    userId: req.user._id, 
    level: 'parent' 
  }).lean();

  // Attach children to parents for easier frontend rendering
  const result = await Promise.all(achievements.map(async (parent) => {
    const children = await SkillAchievement.find({ 
      userId: req.user._id, 
      parentId: parent._id 
    }).lean();
    return { ...parent, children };
  }));

  res.json(result);
});

const getSecondBrainStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('brainPower brainLevel topSkills xp level lp rankTier');
  const achievements = await SkillAchievement.find({ userId: req.user._id });
  
  const totalSkills = achievements.length;
  const masteredSkills = achievements.filter(s => s.proficiency >= 80).length;
  const averageProficiency = totalSkills > 0 
    ? Math.round(achievements.reduce((acc, s) => acc + s.proficiency, 0) / totalSkills) 
    : 0;

  res.json({
    brainPower: user.brainPower || 0,
    brainLevel: user.brainLevel || 'Novice',
    topSkills: user.topSkills || [],
    totalSkills,
    masteredSkills,
    averageProficiency,
    xp: user.xp,
    level: user.level,
    lp: user.lp,
    rankTier: user.rankTier
  });
});

// Background internal function to sync skills based on RAG knowledge
const syncSkillAchievementsInternal = async (userId, topic, analysis, req) => {
  try {
    const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    const ai = new GoogleGenAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    // Retrieve full RAG context for this user & topic to assess depth
    const contextResults = await RAGService.retrieve(topic, userId.toString(), { limit: 15 });
    const contextString = RAGService.formatContext(contextResults);

    // Get existing achievements to check for semantic overlap
    const existingSkills = await SkillAchievement.find({ userId }).select('name level').lean();
    const skillListStr = existingSkills.map(s => `${s.name} (${s.level})`).join(', ');

    const prompt = `Assess the user's proficiency in "${topic}" based on their learning history and this RAG context:\n${contextString}\n\nAnalysis from test: ${JSON.stringify(analysis)}\n\nExisting Skills: ${skillListStr}\n\nIMPORTANT: If the new skill name is semantically identical or very similar to an existing skill (e.g. "ReactJS" vs "React"), use the EXISTING skill name to avoid duplicates.\n\nOutput a JSON object with:
    {
      "parentSkill": "Main category (e.g., Programming)",
      "childSkill": "Specific skill (e.g., React)",
      "proficiency": (0-100),
      "reasoning": "Brief explanation",
      "masteredTopics": ["Topic 1", "Topic 2"],
      "brainPowerGain": (number of points earned for this update, e.g. 10-50)
    }`;

    const response = await model.generateContent(prompt);
    const text = response.response.text().replace(/```json|```/g, '').trim();
    const data = JSON.parse(text);

    // 1. Ensure Parent exists
    let parent = await SkillAchievement.findOne({ userId, name: data.parentSkill, level: 'parent' });
    if (!parent) {
      parent = await SkillAchievement.create({
        userId,
        name: data.parentSkill,
        level: 'parent',
        proficiency: data.proficiency // Initial proficiency
      });
    }

    // 2. Ensure Child exists
    let child = await SkillAchievement.findOne({ userId, name: data.childSkill, parentId: parent._id });
    if (!child) {
      child = await SkillAchievement.create({
        userId,
        name: data.childSkill,
        parentId: parent._id,
        level: 'child',
        proficiency: data.proficiency,
        masteredTopics: data.masteredTopics.map(t => ({ topic: t, depth: 'deep', completedAt: new Date() }))
      });
    } else {
      // Update child proficiency and topics
      child.proficiency = data.proficiency;
      data.masteredTopics.forEach(t => {
        if (!child.masteredTopics.some(mt => mt.topic === t)) {
          child.masteredTopics.push({ topic: t, depth: 'deep', completedAt: new Date() });
        }
      });
      child.lastExploredAt = new Date();
      await child.save();
    }

    // 3. Recalculate Parent proficiency (average of children)
    const children = await SkillAchievement.find({ userId, parentId: parent._id });
    const avgProficiency = Math.round(children.reduce((acc, curr) => acc + curr.proficiency, 0) / children.length);
    parent.proficiency = avgProficiency;
    await parent.save();

    // 4. Update User Brain Power & Level
    const user = await User.findById(userId);
    if (user) {
      user.brainPower = (user.brainPower || 0) + (data.brainPowerGain || 20);
      
      // Update Brain Level based on Power
      if (user.brainPower > 5000) user.brainLevel = 'Legend';
      else if (user.brainPower > 2500) user.brainLevel = 'Master';
      else if (user.brainPower > 1000) user.brainLevel = 'Expert';
      else if (user.brainPower > 500) user.brainLevel = 'Advanced';
      else if (user.brainPower > 200) user.brainLevel = 'Intermediate';
      else user.brainLevel = 'Novice';

      // Update Top Skills (top 3 by proficiency)
      const allChildren = await SkillAchievement.find({ userId, level: 'child' }).sort({ proficiency: -1 }).limit(3);
      user.topSkills = allChildren.map(s => s.name);
      
      await user.save();
    }

    console.log(`[SkillSync] Synced skill "${data.childSkill}" for user ${userId}. Gain: ${data.brainPowerGain}`);
  } catch (error) {
    console.error('[SkillSync] Error during background sync:', error);
  }
};

module.exports = {
  addXP, updateRank,
  getQuests, createQuest, updateQuest, deleteQuest,
  getAchievements, createAchievement, updateAchievement,
  getSkillAchievements, 
  getSecondBrainStats,
  syncSkillAchievementsInternal
};
