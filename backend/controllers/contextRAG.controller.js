// backend/controllers/contextRAG.controller.js
const { pipeline } = require('@xenova/transformers');
const VectorQueryService = require('../services/VectorQueryService');

let extractorPipeline = null;
const getLocalEmbedding = async (text) => {
  if (!extractorPipeline) {
    extractorPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  const output = await extractorPipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};

exports.getHybridRAGContext = async (req, res) => {
  try {
    const { query, sourceType } = req.body;
    const userId = req.user._id;

    if (!query) {
      return res.status(400).json({ error: 'Query is required.' });
    }

    const queryEmbedding = await getLocalEmbedding(query);
    
    // Query Zero-Token DB using VectorQueryService
    const contexts = await VectorQueryService.findSimilarContexts({
      queryEmbedding, 
      userId, 
      sourceType,
      topK: 10, 
      minSimilarity: 0.6
    });
    
    // Format response (Send back raw DB retrieved data FIRST)
    res.json({
        success: true,
        contexts: contexts
    });

  } catch (error) {
    console.error('[contextRAG] Error fetching context:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
