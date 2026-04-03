const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, required: true },
  progress: { type: Number, default: 0 },
  goal: { type: Number, required: true },
  rewardXP: { type: Number, required: true },
  unlockedAt: { type: Date },
  isAiGenerated: { type: Boolean, default: false },
  isSecret: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
