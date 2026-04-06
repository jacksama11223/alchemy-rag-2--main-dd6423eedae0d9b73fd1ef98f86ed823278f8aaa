const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: String,
  link: String,
  type: String
}, { _id: false });

const adaptiveLearningSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  topic: {
    type: String,
    required: true
  },
  testContent: [{
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String,
    tags: [String] // e.g., ['React', 'Hooks', 'UseEffect']
  }],
  userResults: {
    score: Number,
    totalQuestions: Number,
    answers: [{
      questionIndex: Number,
      selectedAnswer: String,
      isCorrect: Boolean,
      timestamp: Date
    }],
    completedAt: Date
  },
  analysis: {
    weak_tags: [String],
    strong_tags: [String],
    aiSummary: String
  },
  roadmap: [{
    day: Number,
    title: String,
    tasks: [String],
    resources: [resourceSchema],
    isCompleted: { type: Boolean, default: false }
  }],
  status: {
    type: String,
    enum: ['idle', 'testing', 'completed'],
    default: 'idle'
  }
}, { timestamps: true });

module.exports = mongoose.model('AdaptiveLearning', adaptiveLearningSchema);
