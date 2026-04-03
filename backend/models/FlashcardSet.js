const mongoose = require('mongoose');

const flashcardSchema = mongoose.Schema({
  front: { type: String, required: true },
  back: { type: String, required: true },
  sourceNoteId: { type: String }, // Optional link to the original note
  highlightedText: { type: String } // The text that was highlighted
});

const flashcardSetSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  cards: [flashcardSchema],
  tags: [String],
  sourceNoteId: { type: String } // If the whole set is from one note
}, {
  timestamps: true,
});

const FlashcardSet = mongoose.model('FlashcardSet', flashcardSetSchema);
module.exports = FlashcardSet;
