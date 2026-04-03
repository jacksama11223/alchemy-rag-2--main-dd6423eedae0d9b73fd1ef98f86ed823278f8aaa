const mongoose = require('mongoose');

const ocrDocumentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'Tài liệu quét mới'
  },
  imageUrl: {
    type: String, // Base64 string or URL
    required: true
  },
  extractedText: {
    type: String,
    default: ''
  },
  highlights: [{
    id: String,
    text: String,
    rect: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    },
    color: {
      type: String,
      default: 'rgba(251, 191, 36, 0.4)' // Amber
    }
  }],
  flashcards: [{
    id: String,
    front: String,
    back: String,
    highlightId: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('OcrDocument', ocrDocumentSchema);
