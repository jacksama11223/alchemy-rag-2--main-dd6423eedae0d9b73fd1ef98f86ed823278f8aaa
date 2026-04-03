const mongoose = require('mongoose');

const gapSuggestionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sourceNodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Node', required: true },
  targetNodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Node', required: true },
  similarityScore: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  suggestedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
});

// Ensure uniqueness of suggestions
gapSuggestionSchema.index({ sourceNodeId: 1, targetNodeId: 1 }, { unique: true });

const GapSuggestion = mongoose.model('GapSuggestion', gapSuggestionSchema);
module.exports = GapSuggestion;
