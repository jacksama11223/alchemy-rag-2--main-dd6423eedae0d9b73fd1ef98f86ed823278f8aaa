const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['Daily', 'Weekly', 'Epic', 'LearningPath'], required: true },
  progress: { type: Number, default: 0 },
  total: { type: Number, required: true },
  reward: { type: String, required: true },
  completed: { type: Boolean, default: false },
  targetNodeIds: [{ type: String }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Quest', questSchema);
