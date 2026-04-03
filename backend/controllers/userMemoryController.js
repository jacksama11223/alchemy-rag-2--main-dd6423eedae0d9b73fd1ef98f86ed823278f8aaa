const UserMemory = require('../models/UserMemory');
const { GoogleGenAI } = require('@google/genai');
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

const getAI = (req) => {
  const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Gemini API Key. Please provide it in settings.');
  }
  return new GoogleGenAI({ apiKey });
};

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

exports.addMemory = async (req, res) => {
  try {
    const { fact } = req.body;
    let { embedding } = req.body;
    const userId = req.user._id;

    if (!fact) {
      return res.status(400).json({ message: 'Fact is required' });
    }

    // Try to parse fact if it's a JSON string to extract key/value
    let key = 'general_fact';
    let value = fact;
    let category = 'general';

    try {
      const parsedFact = JSON.parse(fact);
      if (parsedFact.key && parsedFact.value) {
        key = parsedFact.key;
        value = parsedFact.value;
        category = parsedFact.category || 'general';
      }
    } catch (e) {
      // It's just a plain string fact, which is fine
    }

    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
      try {
        embedding = await getLocalEmbedding(fact);
      } catch (e) {
        console.error('Error generating local embedding for user memory:', e);
        return res.status(500).json({ message: 'Failed to generate embedding' });
      }
    }

    const newMemory = new UserMemory({
      userId,
      key,
      value,
      category,
      embedding
    });

    await newMemory.save();
    res.status(201).json({ message: 'Memory added successfully', memory: newMemory });
  } catch (error) {
    console.error('Error adding user memory:', error);
    res.status(500).json({ message: 'Server error adding user memory' });
  }
};

exports.getMemories = async (req, res) => {
  try {
    const userId = req.user._id;
    const memories = await UserMemory.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(memories);
  } catch (error) {
    console.error('Error fetching user memories:', error);
    res.status(500).json({ message: 'Server error fetching user memories' });
  }
};

exports.searchMemories = async (req, res) => {
  try {
    const userId = req.user._id;
    const { query, limit = 5 } = req.body;
    let { embedding } = req.body;

    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
      if (!query) {
        return res.status(400).json({ message: 'query or embedding is required' });
      }
      try {
        embedding = await getLocalEmbedding(query);
      } catch (e) {
        console.error('Error generating local embedding for searchMemories:', e);
        return res.status(500).json({ message: 'Failed to generate embedding' });
      }
    }

    let scoredMemories = [];

    if (embedding.length > 0) {
      try {
        // Attempt MongoDB Atlas Vector Search
        scoredMemories = await UserMemory.aggregate([
          {
            $vectorSearch: {
              index: 'vector_index', // Tên index bạn tạo trên MongoDB Atlas
              path: 'embedding',
              queryVector: embedding,
              numCandidates: 100,
              limit: limit,
              // filter: { userId: userId } // Bỏ comment nếu bạn đã thêm userId vào filter trong index
            }
          },
          {
            $match: { userId: String(userId) } // Lọc theo user sau khi search nếu không dùng filter bên trên
          },
          {
            $project: {
              _id: 1,
              fact: 1,
              score: { $meta: 'vectorSearchScore' }
            }
          }
        ]);
      } catch (vectorError) {
        console.warn('MongoDB Vector Search chưa được cấu hình hoặc lỗi, chuyển sang tính toán in-memory:', vectorError.message);
        
        // Fallback to in-memory cosine similarity
        const allMemories = await UserMemory.find({ userId });
        scoredMemories = allMemories.map(mem => {
          let score = 0;
          if (mem.embedding && mem.embedding.length > 0) {
            score = cosineSimilarity(embedding, mem.embedding);
          }
          return { ...mem.toObject(), score };
        });
        scoredMemories = scoredMemories.filter(m => m.score > 0.1).sort((a, b) => b.score - a.score).slice(0, limit);
      }
    }

    res.status(200).json(scoredMemories);
  } catch (error) {
    console.error('Error searching user memories:', error);
    res.status(500).json({ message: 'Server error searching user memories' });
  }
};
