const mongoose = require('mongoose');

const alchemyStorageFlashcardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sourceItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'AlchemyStorageItem' },
  front: { type: String, required: true },
  back: { type: String, required: true },
  tags: [{ type: String }],
  deckId: { type: mongoose.Schema.Types.ObjectId, ref: 'FlashcardDeck' },
  deckName: { type: String },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('AlchemyStorageFlashcard', alchemyStorageFlashcardSchema);
