const asyncHandler = require('express-async-handler');
const Quest = require('../models/Quest');
const Achievement = require('../models/Achievement');
const User = require('../models/User');

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

module.exports = {
  addXP, updateRank,
  getQuests, createQuest, updateQuest, deleteQuest,
  getAchievements, createAchievement, updateAchievement
};
