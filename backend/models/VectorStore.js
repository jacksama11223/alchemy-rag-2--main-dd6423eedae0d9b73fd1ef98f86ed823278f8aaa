const mongoose = require('mongoose');

/**
 * @typedef {Object} IVectorStore
 * @property {mongoose.Types.ObjectId} userId
 * @property {string} textChunk
 * @property {number[]} embedding
 * @property {Object} metadata
 * @property {string} metadata.sourceType - 'note' | 'alchemy' | 'drive' | 'chat' | 'document'
 * @property {mongoose.Types.ObjectId} [metadata.originalDocId]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const vectorStoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  textChunk: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    required: true
  },
  metadata: {
    sourceType: {
      type: String,
      required: true,
      enum: ['note', 'alchemy', 'drive', 'chat', 'document', 'pasted_text', 'youtube', 'web', 'voice', 'node', 'comment', 'learning_path', 'drivestorage', 'roadmap']
    },
    originalDocId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    title: {
      type: String,
      required: false
    },
    additionalInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }
}, { timestamps: true, collection: 'vectorstores' });

// Note: Ensure a MongoDB Atlas Vector Search Index is created on the `embedding` field.
// The index name should ideally be `vector_index`.
// IMPORTANT: The collection name in MongoDB Atlas MUST be `vectorstores` (plural, lowercase).

// Middleware to automatically generate KnowledgeIndex entries on new VectorStore insertions
vectorStoreSchema.post('save', async function(doc) {
  try {
    const KnowledgeIndex = require('./KnowledgeIndex');
    const { extractKeywordsAndSummary } = require('../utils/keywordExtractor');
    
    const extractions = extractKeywordsAndSummary(doc.textChunk);
    if (extractions.length === 0) return;

    const bulkOps = extractions.map(ext => ({
      updateOne: {
        filter: { userId: doc.userId, keyword: ext.keyword },
        update: { $set: { shortValue: ext.shortValue, sourceId: doc._id, sourceType: doc.metadata?.sourceType || 'unknown' } },
        upsert: true
      }
    }));
    await KnowledgeIndex.bulkWrite(bulkOps);
  } catch (err) {
    console.error('VectorStore post-save KnowledgeIndex hook failed:', err);
  }
});

vectorStoreSchema.post('insertMany', async function(docs) {
  try {
    const KnowledgeIndex = require('./KnowledgeIndex');
    const { extractKeywordsAndSummary } = require('../utils/keywordExtractor');
    
    let bulkOps = [];
    for (const doc of docs) {
      const extractions = extractKeywordsAndSummary(doc.textChunk);
      extractions.forEach(ext => {
        bulkOps.push({
          updateOne: {
            filter: { userId: doc.userId, keyword: ext.keyword },
            update: { $set: { shortValue: ext.shortValue, sourceId: doc._id, sourceType: doc.metadata?.sourceType || 'unknown' } },
            upsert: true
          }
        });
      });
    }
    if (bulkOps.length > 0) {
      await KnowledgeIndex.bulkWrite(bulkOps);
    }
  } catch (err) {
    console.error('VectorStore post-insertMany KnowledgeIndex hook failed:', err);
  }
});

// CASCADE DELETE: Cleanup KnowledgeIndex when VectorStore entries are removed
vectorStoreSchema.post('deleteOne', { document: true, query: false }, async function(doc) {
  try {
    const KnowledgeIndex = require('./KnowledgeIndex');
    await KnowledgeIndex.deleteMany({ sourceId: doc._id });
    console.log(`[CascadeDelete] Cleaned up KnowledgeIndex for doc ${doc._id}`);
  } catch (err) {
    console.error('VectorStore post-deleteOne cascade failed:', err);
  }
});

vectorStoreSchema.pre('deleteMany', async function() {
  try {
    const KnowledgeIndex = require('./KnowledgeIndex');
    // Find docs that match the current query filter
    const docs = await this.model.find(this.getFilter()).select('_id').lean();
    const ids = docs.map(d => d._id);
    if (ids.length > 0) {
      await KnowledgeIndex.deleteMany({ sourceId: { $in: ids } });
      console.log(`[CascadeDelete] Cleaned up KnowledgeIndex for ${ids.length} docs`);
    }
  } catch (err) {
    console.error('VectorStore pre-deleteMany cascade failed:', err);
  }
});

// Handle findOneAndDelete and similar query-level doc removals
vectorStoreSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      const KnowledgeIndex = require('./KnowledgeIndex');
      await KnowledgeIndex.deleteMany({ sourceId: doc._id });
      console.log(`[CascadeDelete] Cleaned up KnowledgeIndex for doc ${doc._id}`);
    } catch (err) {
      console.error('VectorStore post-findOneAndDelete cascade failed:', err);
    }
  }
});

module.exports = mongoose.model('VectorStore', vectorStoreSchema);
