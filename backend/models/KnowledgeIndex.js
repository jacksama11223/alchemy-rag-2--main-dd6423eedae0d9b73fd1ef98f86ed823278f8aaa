const mongoose = require('mongoose');

const knowledgeIndexSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  keyword: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true // O(1) text search
  },
  shortValue: {
    type: String,
    required: true
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VectorStore'
  },
  sourceType: {
    type: String
  }
}, { timestamps: true });

// Create a compound text index for fuzzy searching
knowledgeIndexSchema.index({ keyword: 'text' });

module.exports = mongoose.model('KnowledgeIndex', knowledgeIndexSchema);
