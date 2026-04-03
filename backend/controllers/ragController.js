const VectorStore = require('../models/VectorStore');
const CachedDocument = require('../models/CachedDocument');
const { GoogleGenAI } = require('@google/genai');
const { pipeline } = require('@xenova/transformers');
const RAGService = require('../services/RAGService');
const { syncToRag } = require('../utils/ragSync');

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

// Helper to get Gemini AI instance using the key from headers
const getAI = (req) => {
  const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Gemini API Key. Please provide it in settings.');
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to calculate cosine similarity between two vectors
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

exports.cacheDocument = async (req, res) => {
  try {
    const { content, title } = req.body;
    const userId = req.user._id;

    if (!content || !title) {
      return res.status(400).json({ message: 'Content and title are required' });
    }

    const ai = getAI(req);
    // Removed tools and systemInstruction dependency from aiChatController
    const systemInstruction = "You are a helpful assistant.";
    const tools = [];

    // Create cache using Gemini API
    const cache = await ai.caches.create({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: content }] }],
      config: {
        ttl: '3600s', // 1 hour
        systemInstruction,
        tools
      }
    });

    const cachedDoc = new CachedDocument({
      userId,
      cacheName: cache.name,
      title,
      expiresAt: new Date(Date.now() + 3600 * 1000)
    });
    await cachedDoc.save();

    res.status(201).json({ message: 'Document cached successfully', cacheName: cache.name, title });
  } catch (error) {
    console.error('Error caching document:', error);
    res.status(500).json({ message: 'Failed to cache document', error: error.message });
  }
};

// Add a document to RAG database
exports.addDocument = async (req, res) => {
  try {
    const { content, metadata } = req.body;
    const userId = req.user._id; // Assuming authentication middleware sets req.user

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // 1. Smart Chunking & Small-to-Big Retrieval
    const SmartTextSplitter = require('../utils/textSplitter');
    const splitter = new SmartTextSplitter();
    const chunks = await splitter.splitText(content, { title: metadata?.title || 'Document', ...metadata });

    const savedDocs = [];
    for (const chunkObj of chunks) {
      let embedding = [];
      try {
        embedding = await getLocalEmbedding(chunkObj.text);
      } catch (aiError) {
        console.error('Error generating local embedding:', aiError);
      }

      if (embedding.length > 0) {
        const newDoc = new VectorStore({
          userId,
          textChunk: chunkObj.text,
          metadata: {
            ...chunkObj.metadata,
            sourceType: 'document'
          },
          embedding
        });
        await newDoc.save();
        savedDocs.push(newDoc);
      } else {
        console.warn('Skipping chunk because embedding is empty');
      }
    }

    res.status(201).json({ message: 'Document added to RAG database successfully', documents: savedDocs });
  } catch (error) {
    console.error('Error adding RAG document:', error);
    res.status(500).json({ message: 'Server error adding RAG document' });
  }
};

// Get all documents for a user
exports.getDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const documents = await VectorStore.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(documents);
  } catch (error) {
    console.error('Error fetching RAG documents:', error);
    res.status(500).json({ message: 'Server error fetching RAG documents' });
  }
};

// Search documents using Vector Similarity
exports.searchDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { query, source } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let queryEmbedding = [];
    try {
      queryEmbedding = await getLocalEmbedding(query);
    } catch (aiError) {
      console.error('Error generating local query embedding:', aiError);
    }

    let scoredDocs = [];

    if (queryEmbedding.length > 0) {
      try {
        const mongoose = require('mongoose');
        const filter = { userId: { $eq: new mongoose.Types.ObjectId(userId) } };
        if (source) {
          filter['metadata.sourceType'] = { $eq: source };
        }

        // Attempt MongoDB Atlas Vector Search
        scoredDocs = await VectorStore.aggregate([
          {
            $vectorSearch: {
              index: 'vector_index',
              path: 'embedding',
              queryVector: queryEmbedding,
              numCandidates: 50,
              limit: 10
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
              content: '$textChunk',
              metadata: 1,
              score: { $meta: 'vectorSearchScore' }
            }
          }
        ]);
        
        if (source) {
            scoredDocs = scoredDocs.filter(doc => doc.metadata && doc.metadata.sourceType === source);
        }
        scoredDocs = scoredDocs.filter(doc => doc.score > 0.7);
      } catch (vectorError) {
        console.warn('MongoDB Vector Search chưa được cấu hình hoặc lỗi, chuyển sang tính toán in-memory:', vectorError.message);
        
        // Fallback to in-memory cosine similarity
        let matchQuery = { userId };
        if (source) matchQuery['metadata.sourceType'] = source;
        const allDocs = await VectorStore.find(matchQuery);
        scoredDocs = allDocs.map(doc => {
          let score = 0;
          if (doc.embedding && doc.embedding.length > 0) {
            score = cosineSimilarity(queryEmbedding, doc.embedding);
          }
          return { ...doc.toObject(), content: doc.textChunk, score };
        });
        scoredDocs = scoredDocs.filter(d => d.score > 0.7).sort((a, b) => b.score - a.score).slice(0, 10);
      }
    } else {
      // Fallback to basic text matching if embeddings are missing
      let matchQuery = { userId };
      if (source) matchQuery['metadata.sourceType'] = source;
      const allDocs = await VectorStore.find(matchQuery);
      scoredDocs = allDocs.map(doc => {
        let score = 0;
        if (doc.textChunk.toLowerCase().includes(query.toLowerCase())) {
          score = 0.5;
        }
        return { ...doc.toObject(), content: doc.textChunk, score };
      });
      scoredDocs = scoredDocs.filter(d => d.score > 0.1).sort((a, b) => b.score - a.score).slice(0, 10);
    }

    // Deduplicate and promote parentContent
    const processDocs = (docs) => {
      const seenParents = new Set();
      const processed = [];
      for (const doc of docs) {
        let textContent = doc.content;
        let isParent = false;
        
        if (doc.metadata && doc.metadata.parentContent) {
          textContent = doc.metadata.parentContent;
          isParent = true;
        }

        // Deduplicate
        if (isParent && seenParents.has(textContent)) {
           continue; // Already included this parent chunk
        }
        if (isParent) {
           seenParents.add(textContent);
        }
        
        processed.push({ ...doc, content: textContent });
      }
      return processed.slice(0, 10);
    };

    res.status(200).json(processDocs(scoredDocs));
  } catch (error) {
    console.error('Error searching RAG documents:', error);
    res.status(500).json({ message: 'Server error searching RAG documents' });
  }
};

// Check for semantic resonance (overlaps/merges)
exports.findResonance = async (req, res) => {
  try {
    const userId = req.user._id;
    const { text, threshold = 0.82 } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text payload is required for resonance check' });
    }

    let queryEmbedding = [];
    try {
      queryEmbedding = await getLocalEmbedding(text);
    } catch (aiError) {
      console.error('Error generating local embedding for resonance:', aiError);
      return res.status(500).json({ message: 'Embedding generation failed' });
    }

    let scoredDocs = [];

    if (queryEmbedding.length > 0) {
      try {
        const mongoose = require('mongoose');
        
        scoredDocs = await VectorStore.aggregate([
          {
            $vectorSearch: {
              index: 'vector_index',
              path: 'embedding',
              queryVector: queryEmbedding,
              numCandidates: 20,
              limit: 5
            }
          },
          {
            $match: { userId: new mongoose.Types.ObjectId(userId) }
          },
          {
            $project: {
              _id: 1,
              title: '$metadata.title',
              content: '$textChunk',
              sourceType: '$metadata.sourceType',
              score: { $meta: 'vectorSearchScore' }
            }
          }
        ]);
        
        // High threshold filter for resonance
        scoredDocs = scoredDocs.filter(doc => doc.score > threshold);
      } catch (vectorError) {
        console.warn('MongoDB Vector Search failed on resonance check, using in-memory fallback:', vectorError.message);
        
        const allDocs = await VectorStore.find({ userId });
        scoredDocs = allDocs.map(doc => {
          const score = (doc.embedding && doc.embedding.length > 0) 
            ? cosineSimilarity(queryEmbedding, doc.embedding) 
            : 0;
          return { id: doc._id, title: doc.metadata?.title, content: doc.textChunk, sourceType: doc.metadata?.sourceType, score };
        });
        scoredDocs = scoredDocs.filter(d => d.score > threshold).sort((a, b) => b.score - a.score).slice(0, 5);
      }
    }

    // Format output exactly as frontend expects: { id, title, reason }
    const matches = scoredDocs.map(doc => {
       const confidencePct = Math.round(doc.score * 100);
       return {
         id: doc._id || doc.id,
         title: doc.title || 'Khối dữ liệu không tên',
         reason: `Phát hiện mức độ trùng lặp nội dung lên tới ${confidencePct}% từ nguồn ${doc.sourceType || 'hệ thống'}.`
       };
    });

    res.status(200).json(matches);
  } catch (error) {
    console.error('Error checking semantic resonance:', error);
    res.status(500).json({ message: 'Server error checking semantic resonance' });
  }
};

// ================================================================
// POST /api/rag/hybrid-search
// Thuật toán y hệt AI Chat: Dual-Track (Keyword Sparse + Dense Vector)
// → Keyword Traceback → TF-IDF Compression → trả về context chuẩn
// Tham số body: { query: string, mode?: 'compressed' | 'full', limit?: number }
// mode='compressed': nén 3 câu TF-IDF (giống Chat, nhanh hơn)
// mode='full'      : trả nguyên đoạn văn (tốt hơn cho Lò luyện AI chế tạo)
// ================================================================
exports.hybridSearch = async (req, res) => {
  try {
    const userId = req.user._id;
    const { query, mode = 'full', limit = 8, preferredSource } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    console.log(`[HybridSearch] mode=${mode} limit=${limit} query="${query.substring(0, 60)}..."`);

    // ---- BƯỚC 1: Dual-Track RAG (Keyword Sparse + Dense Vector + Traceback) ----
    const rawResults = await RAGService.retrieve(query, userId.toString(), {
      limit,
      sourceType: preferredSource
    });

    if (!rawResults || rawResults.length === 0) {
      return res.status(200).json({
        contextString: '',
        results: [],
        message: 'Không tìm thấy tài liệu liên quan trong kho dữ liệu của bạn.',
      });
    }

    // ---- BƯỚC 2: Format Context ----
    // mode='compressed': TF-IDF nén 3 câu (giống Chat) — tránh tràn token khi có nhiều source
    // mode='full': giữ nguyên đoạn văn — tốt hơn cho AI Forge luyện data phức tạp
    let contextString;
    if (mode === 'compressed') {
      contextString = RAGService.formatContext(rawResults, query);
    } else {
      // Full context: giữ nguyên 100% văn bản, chỉ ghép tiêu đề
      contextString = rawResults.map(doc => {
        const title = doc.metadata?.title || doc.metadata?.sourceType || 'Tài liệu';
        const score = doc.score ? ` (Độ liên quan: ${Math.round(doc.score * 100)}%)` : '';
        return `[Nguồn: ${title}${score}]\n${doc.textChunk}`;
      }).join('\n\n---\n\n');
    }

    // ---- BƯỚC 3: Trả về kết quả ----
    return res.status(200).json({
      contextString,
      results: rawResults.map(doc => ({
        title: doc.metadata?.title || 'Không có tiêu đề',
        sourceType: doc.metadata?.sourceType || 'document',
        score: doc.score,
        preview: doc.textChunk?.substring(0, 200) + '...',
      })),
      totalFound: rawResults.length,
    });

  } catch (error) {
    console.error('[HybridSearch] Error:', error);
    res.status(500).json({ message: 'Server error during hybrid RAG search' });
  }
};

// POST /api/rag/comment
// Lưu phản hồi của AI vào RAG để truy vấn sau này
exports.saveAiComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { text, title, metadata } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const saved = await syncToRag({
      userId,
      text,
      title: title || 'AI Explanation',
      sourceType: 'comment',
      metadata: { 
        ...metadata,
        isAiGenerated: true,
        category: 'explanation'
      }
    });

    res.status(201).json({ 
      message: 'AI comment saved to RAG memory', 
      id: saved?._id 
    });
  } catch (error) {
    console.error('Error saving AI comment to RAG:', error);
    res.status(500).json({ message: 'Failed to save AI comment' });
  }
};

// GET /api/rag/history/:flashcardTitle
// Lấy lịch sử các câu hỏi AI từng giải thích cho flashcard này
exports.getFlashcardHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { flashcardTitle } = req.params;

    if (!flashcardTitle) {
      return res.status(400).json({ message: 'Flashcard title is required' });
    }

    const history = await VectorStore.find({
      userId,
      'metadata.sourceType': 'comment',
      'metadata.flashcardQuestion': flashcardTitle
    }).sort({ createdAt: 1 }).lean();

    const formattedHistory = history.map(h => ({
      id: h._id,
      text: h.textChunk,
      timestamp: h.createdAt,
      userQuery: h.metadata?.userQuery
    }));

    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error('Error fetching flashcard history:', error);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
};

// GET /api/rag/note/:flashcardTitle
// Lấy ghi chú riêng của người dùng cho flashcard này
exports.getFlashcardNote = async (req, res) => {
  try {
    const userId = req.user._id;
    const { flashcardTitle } = req.params;

    const note = await VectorStore.findOne({
      userId,
      'metadata.sourceType': 'flashcard_note',
      'metadata.flashcardQuestion': flashcardTitle
    }).sort({ createdAt: -1 }).lean();

    res.status(200).json({ 
      text: note ? note.textChunk : "",
      updatedAt: note ? note.updatedAt : null
    });
  } catch (error) {
    console.error('Error fetching flashcard note:', error);
    res.status(500).json({ message: 'Failed to fetch note' });
  }
};

// POST /api/rag/note
// Lưu/Cập nhật ghi chú và đẩy lên RAG
exports.saveFlashcardNote = async (req, res) => {
  try {
    const userId = req.user._id;
    const { text, flashcardTitle } = req.body;

    if (!flashcardTitle) {
      return res.status(400).json({ message: 'Flashcard title is required' });
    }

    // Xóa ghi chú cũ của flashcard này (ghi đè)
    await VectorStore.deleteMany({
      userId,
      'metadata.sourceType': 'flashcard_note',
      'metadata.flashcardQuestion': flashcardTitle
    });

    if (text && text.trim()) {
      await syncToRag({
        userId,
        text,
        title: `Ghi chú: ${flashcardTitle}`,
        sourceType: 'flashcard_note',
        metadata: { 
          flashcardQuestion: flashcardTitle,
          isUserNote: true
        }
      });
    }

    res.status(200).json({ message: 'Flashcard note saved and indexed' });
  } catch (error) {
    console.error('Error saving flashcard note:', error);
    res.status(500).json({ message: 'Failed to save flashcard note' });
  }
};

