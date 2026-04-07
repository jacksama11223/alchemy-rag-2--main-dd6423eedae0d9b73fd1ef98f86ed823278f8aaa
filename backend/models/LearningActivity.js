const mongoose = require('mongoose');

const learningActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  term: {
    type: String,
    required: true,
    index: true
  },
  activityType: {
    type: String,
    enum: ['flashcard', 'quiz', 'code'],
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalPoints: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'failed'],
    default: 'completed'
  },
  skillCategory: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LearningActivity', learningActivitySchema);
