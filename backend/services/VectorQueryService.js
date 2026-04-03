// backend/services/VectorQueryService.js
const VectorStore = require('../models/VectorStore');

class VectorQueryService {
  constructor() {
    this.vectorCache = new Map(); // Vector Cache: Map mapping ID to embeddings
  }

  // Preload cache for a specific user to reduce DB trips
  async warmupCache(userId) {
    const vectors = await VectorStore.find({ userId }).select('embedding textChunk metadata');
    vectors.forEach(v => {
      if(v.embedding) {
        this.vectorCache.set(v._id.toString(), {
          embedding: v.embedding,
          sourceType: v.metadata.sourceType,
          originalDocId: v.metadata.originalDocId
        });
      }
    });
    console.log(`[VectorQueryService] Warmed up cache: ${this.vectorCache.size} items.`);
  }

  // Implementation of Cosine Similarity using Javascript reduction
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Pure DB/Memory zero-LLM search utilizing hash maps
  async findSimilarContexts({ queryEmbedding, userId, sourceType = null, topK = 5, minSimilarity = 0.6 }) {
    const results = [];
    const dbQuery = { userId };
    
    // For exact match filtering
    if (sourceType) dbQuery['metadata.sourceType'] = sourceType;
    
    const docs = await VectorStore.find(dbQuery).lean();
    
    for (let doc of docs) {
      if (!doc.embedding) continue;
      
      const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);
      if (similarity >= minSimilarity) {
        // Resolve parent chunks if available
        let finalContent = doc.textChunk;
        if (doc.metadata && doc.metadata.parentContent) {
           finalContent = doc.metadata.parentContent;
        }

        results.push({
          score: similarity,
          content: finalContent,
          metadata: doc.metadata,
          _id: doc._id
        });
      }
    }
    
    // Sort descending by score
    results.sort((a, b) => b.score - a.score);

    // Basic deduplication of parent contexts
    const deduplicated = [];
    const seen = new Set();
    for (const r of results) {
      if (seen.has(r.content)) continue;
      seen.add(r.content);
      deduplicated.push(r);
      if (deduplicated.length >= topK) break;
    }

    return deduplicated;
  }
}

module.exports = new VectorQueryService();
