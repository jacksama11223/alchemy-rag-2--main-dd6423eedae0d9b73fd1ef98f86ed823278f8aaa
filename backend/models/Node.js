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
  connectedNodeIds: [String], // Still here for legacy, matches visual link logic
  connections: [{
    targetId: { type: String }, // Can be Node ID or external
    label: { type: String, default: "" },
    style: { type: String, enum: ['solid', 'dashed'], default: 'solid' },
    hasArrow: { type: Boolean, default: false },
    color: { type: String }
  }],
  mastery: { type: Number, default: 0 },
  parentNodeId: { type: String },
  relationshipLabel: { type: String },
  originalAuthor: { type: String },
  createdID: { type: String }, // Batch identifier for roadmap/AI generations
  // Phase 2 Hub Integrations
  linkedTodos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Todo' }],
  linkedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
  linkedAlchemy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AlchemyStorageItem' }]
}, {
  timestamps: true,
});

// AUTO-CLUSTERING HOOK: If node has a createdID, ensure it's "khoanh vùng"
nodeSchema.post('save', async function(doc, next) {
    if (doc.createdID) {
        try {
            // Lazy-load clusteringService to avoid circular dependency
            const { createBatchCluster } = require('../services/clusteringService');
            // Use title or a default as label for the batch
            await createBatchCluster(doc.user, doc.createdID, doc.title || "Vùng tri thức mới");
        } catch (error) {
            console.error('[NodeModelHook] Auto-clustering failed:', error);
        }
    }
    next();
});

const Node = mongoose.model('Node', nodeSchema);
module.exports = Node;