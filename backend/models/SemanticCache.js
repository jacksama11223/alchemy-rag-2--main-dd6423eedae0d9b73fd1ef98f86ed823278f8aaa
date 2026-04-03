const mongoose = require('mongoose');

const semanticCacheSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  query: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    required: true
  },
  response: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('SemanticCache', semanticCacheSchema);
