const VectorStore = require('../models/VectorStore');
const KnowledgeIndex = require('../models/KnowledgeIndex');
const RAGService = require('../services/RAGService');
const { extractKeywordsAndSummary } = require('./keywordExtractor');

// Use the robust embedding logic from RAGService to avoid redundant model loading
const getLocalEmbedding = async (text) => {
  return await RAGService.getLocalEmbedding(text);
};

/**
 * Syncs a piece of content to the RAG system (VectorStore + KnowledgeIndex)
 * @param {Object} params 
 * @param {string} params.userId
 * @param {string} params.text
 * @param {string} params.title
 * @param {string} params.sourceType - 'node', 'comment', 'document', etc.
 * @param {Object} params.metadata - additional metadata
 */
const syncToRag = async ({ userId, text, title, sourceType, metadata = {}, originalDocId = null }) => {
  try {
    if (!text || !userId) return null;

    // 0. Cleanup old entries for the same Document ID
    const docIdToClean = originalDocId || metadata.originalDocId;
    if (docIdToClean) {
        await VectorStore.deleteMany({ userId, 'metadata.originalDocId': docIdToClean });
        await KnowledgeIndex.deleteMany({ userId, sourceId: docIdToClean });
    }

    // 1. Generate Embedding
    const embedding = await getLocalEmbedding(text);

    // 2. Save to VectorStore (Dense Search)
    const vectorDoc = new VectorStore({
      userId,
      textChunk: text,
      embedding,
      metadata: {
        ...metadata,
        title,
        sourceType,
        originalDocId: originalDocId || metadata.originalDocId,
        syncedAt: new Date()
      }
    });
    const savedVector = await vectorDoc.save();

    // 3. Extract Keywords and Save to KnowledgeIndex (Sparse Search / Key-Value)
    const keywordsData = extractKeywordsAndSummary(text);
    
    // Also add the title as a primary keyword
    if (title && !keywordsData.find(k => k.keyword === title.toLowerCase())) {
        keywordsData.push({
            keyword: title.toLowerCase(),
            shortValue: text.substring(0, 500)
        });
    }

    if (keywordsData.length > 0) {
      const indexDocs = keywordsData.map(kw => ({
        userId,
        keyword: kw.keyword,
        shortValue: kw.shortValue,
        sourceId: savedVector._id,
        sourceType
      }));
      await KnowledgeIndex.insertMany(indexDocs);
    }

    console.log(`[RAGSync] Successfully synced ${sourceType}: "${title}" (${keywordsData.length} keywords)`);
    return savedVector;
  } catch (error) {
    console.error('[RAGSync] Error syncing to RAG:', error);
    return null;
  }
};

module.exports = { syncToRag, getLocalEmbedding };
