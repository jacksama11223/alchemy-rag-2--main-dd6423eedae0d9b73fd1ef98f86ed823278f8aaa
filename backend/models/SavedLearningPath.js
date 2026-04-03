const mongoose = require('mongoose');

const pathLevelSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['locked', 'unlocked', 'learning_passed', 'completed'], default: 'locked' },
  learningContent: { type: Array, default: [] },
  quizContent: { type: Array, default: [] }
});

const savedLearningPathSchema = new mongoose.Schema({
  title: { type: String, required: true },
  levels: [pathLevelSchema],
  progress: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('SavedLearningPath', savedLearningPathSchema);
