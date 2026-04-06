const mongoose = require('mongoose');

const skillAchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillAchievement',
    default: null
  },
  level: {
    type: String,
    enum: ['parent', 'child'],
    default: 'parent'
  },
  proficiency: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  masteredTopics: [{
    topic: String,
    depth: String, // e.g., 'basic', 'deep', 'expert'
    completedAt: Date
  }],
  lastExploredAt: {
    type: Date,
    default: Date.now
  },
  kvMetadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Index for easy searching of child nodes
skillAchievementSchema.index({ userId: 1, parentId: 1 });

module.exports = mongoose.model('SkillAchievement', skillAchievementSchema);
