const mongoose = require('mongoose');

const flashcardDeckSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  color: { type: String, default: 'bg-sky-500' },
  // Embedded cards for fast access when pushing to Graph
  cards: [{
    front: { type: String, required: true },
    back: { type: String, required: true },
    tags: [{ type: String }]
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('FlashcardDeck', flashcardDeckSchema);
