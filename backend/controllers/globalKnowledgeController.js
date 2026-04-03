const VectorStore = require('../models/VectorStore');
const { pipeline } = require('@xenova/transformers');

// Khởi tạo biến toàn cục để chỉ load mô hình 1 lần duy nhất khi server chạy
let extractorPipeline = null;

const getLocalEmbedding = async (text) => {
  if (!extractorPipeline) {
    console.log("⏳ Đang tải mô hình AI cục bộ vào RAM lần đầu tiên...");
    // Dùng mô hình all-MiniLM-L6-v2 siêu nhẹ, chuyên dùng cho máy tính cá nhân
    extractorPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  
  // Tính toán vector offline (0 token, 0 internet)
  const output = await extractorPipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};

// Helper to calculate cosine similarity between two vectors (fallback)
const cosineSimilarity = (vecA, vecB) => {
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
};

// Add or Update a document to Global Knowledge Base
exports.upsertKnowledge = async (req, res) => {
  try {
    const { textContent, sourceType, sourceId, metadata } = req.body;
    let { embedding } = req.body;
    const userId = req.user._id;

    if (!textContent || !sourceType) {
      return res.status(400).json({ message: 'textContent and sourceType are required' });
    }

    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
      try {
        embedding = await getLocalEmbedding(textContent);
      } catch (e) {
        console.error('Error generating local embedding for upsertKnowledge:', e);
        return res.status(500).json({ message: 'Failed to generate embedding' });
      }
    }

    // Check if it exists to update, else create
    let doc;
    if (sourceId) {
      doc = await VectorStore.findOne({ userId, 'metadata.originalDocId': sourceId, 'metadata.sourceType': sourceType });
    }

    if (doc) {
      doc.textChunk = textContent;
      doc.embedding = embedding;
      doc.metadata = { ...doc.metadata, ...metadata };
      await doc.save();
      return res.status(200).json({ message: 'Knowledge updated successfully', document: doc });
    } else {
      const newDoc = new VectorStore({
        userId,
        textChunk: textContent,
        embedding,
        metadata: {
          sourceType,
          originalDocId: sourceId,
          ...metadata
        }
      });
      await newDoc.save();
      return res.status(201).json({ message: 'Knowledge added successfully', document: newDoc });
    }
  } catch (error) {
    console.error('Error upserting knowledge:', error);
    res.status(500).json({ message: 'Server error upserting knowledge' });
  }
};

// Search documents using Vector Similarity
exports.searchKnowledge = async (req, res) => {
  try {
    const userId = req.user._id;
    const { query, limit = 5, filterSourceType } = req.body;
    let { embedding } = req.body;

    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
      if (!query) {
        return res.status(400).json({ message: 'query or embedding is required' });
      }
      try {
        embedding = await getLocalEmbedding(query);
      } catch (e) {
        console.error('Error generating local embedding for searchKnowledge:', e);
        return res.status(500).json({ message: 'Failed to generate embedding' });
      }
    }

    let scoredDocs = [];
    const matchStage = { userId: userId };
    if (filterSourceType) {
      matchStage['metadata.sourceType'] = filterSourceType;
    }

    try {
      const mongoose = require('mongoose');
      const filter = { userId: { $eq: new mongoose.Types.ObjectId(userId) } };
      if (filterSourceType) {
        filter['metadata.sourceType'] = { $eq: filterSourceType };
      }

      // Attempt MongoDB Atlas Vector Search
      scoredDocs = await VectorStore.aggregate([
        {
          $vectorSearch: {
            index: 'vector_index', // Tên index bạn tạo trên MongoDB Atlas
            path: 'embedding',
            queryVector: embedding,
            numCandidates: 100,
            limit: limit
            // Removed filter from here to avoid "needs to be indexed as filter" error
            // We will rely on $match in the next stage
          }
        },
        {
          $match: filter // Apply the filter here instead
        },
        {
          $project: {
            _id: 1,
            textChunk: 1,
            metadata: 1,
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ]);
      
      if (filterSourceType) {
          scoredDocs = scoredDocs.filter(doc => doc.metadata && doc.metadata.sourceType === filterSourceType);
      }
      scoredDocs = scoredDocs.filter(doc => doc.score > 0.7);
    } catch (vectorError) {
      console.warn('MongoDB Vector Search chưa được cấu hình hoặc lỗi, chuyển sang tính toán in-memory:', vectorError.message);
      
      // Fallback to in-memory cosine similarity
      const allDocs = await VectorStore.find(matchStage);
      scoredDocs = allDocs.map(doc => {
        let score = 0;
        if (doc.embedding && doc.embedding.length > 0) {
          score = cosineSimilarity(embedding, doc.embedding);
        }
        return { ...doc.toObject(), score };
      });
      scoredDocs = scoredDocs.filter(d => d.score > 0.1).sort((a, b) => b.score - a.score).slice(0, limit);
    }

    res.status(200).json(scoredDocs);
  } catch (error) {
    console.error('Error searching knowledge:', error);
    res.status(500).json({ message: 'Server error searching knowledge' });
  }
};
