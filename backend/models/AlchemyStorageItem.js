const mongoose = require('mongoose');

const alchemyStorageItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sourceType: { 
    type: String, 
    enum: ['note', 'ocr', 'voice', 'web', 'upload', 'drive'], 
    required: true 
  },
  title: { type: String, required: true },
  originalContent: { type: String },
  extractedText: { type: String, required: true },
  tags: [{ type: String }],
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('AlchemyStorageItem', alchemyStorageItemSchema);
