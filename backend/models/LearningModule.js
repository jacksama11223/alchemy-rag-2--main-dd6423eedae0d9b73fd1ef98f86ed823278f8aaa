const mongoose = require('mongoose');

const learningModuleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  term: { type: String, required: true },
  topic: { type: String }, // Optional parent topic (e.g. React)
  flashcard: {
    front: { type: String, required: false }, // Made false for old ones
    back: { type: String, required: false }
  },
  flashcards: [{
    front: { type: String, required: true },
    back: { type: String, required: true }
  }],
  quiz: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String }
  }],
  shortAnswers: [{
    question: { type: String, required: true },
    answer: { type: String, required: true },
    explanation: { type: String }
  }],
  codeChallenge: {
    problem: { type: String },
    startCode: { type: String },
    solution: { type: String },
    hints: [{ type: String }]
  },
  userResults: {
    isQuizSubmitted: { type: Boolean, default: false },
    quizAnswers: { type: mongoose.Schema.Types.Mixed, default: {} },
    flashcardScores: { type: [Number], default: [] },
    shortAnswerScores: { type: [Number], default: [] }
  },
  sourceRoadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdaptiveLearning' }
}, {
  timestamps: true,
});

// Ensure a user doesn't have duplicate modules for the same term
learningModuleSchema.index({ user: 1, term: 1 }, { unique: true });

const LearningModule = mongoose.model('LearningModule', learningModuleSchema);
module.exports = LearningModule;
