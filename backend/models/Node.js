const mongoose = require('mongoose');

const nodeSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, default: 'Flashcard' }, // Flashcard, Quiz, etc.
  status: { type: String, default: 'new' },
  tags: [String],
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  z: { type: Number },
  vx: { type: Number },
  vy: { type: Number },
  radius: { type: Number },
  color: { type: String },
  shape: { type: String },
  data: { type: mongoose.Schema.Types.Mixed, default: {} }, // Stores flashcards content, quiz data, etc.
  imageUrl: { type: String },
  connectedNodeIds: [String], // Simplified linkage for visual graph
  mastery: { type: Number, default: 0 },
  parentNodeId: { type: String },
  relationshipLabel: { type: String },
  originalAuthor: { type: String },
  // Phase 2 Hub Integrations
  linkedTodos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Todo' }],
  linkedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
  linkedAlchemy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AlchemyStorageItem' }]
}, {
  timestamps: true,
});

const Node = mongoose.model('Node', nodeSchema);
module.exports = Node;