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

class SemanticRouter {
  constructor(ai) {
    this.ai = ai;
    this.routes = [
      {
        name: 'chitchat',
        utterances: [
          'chào bạn', 'bạn tên gì', 'chào buổi sáng', 'hello', 'hi',
          'bạn khỏe không', 'thời tiết hôm nay thế nào', 'cảm ơn', 'tạm biệt',
          'ai tạo ra bạn', 'bạn có thể làm gì'
        ],
        embeddings: []
      },
      {
        name: 'rag_search',
        utterances: [
          'tìm trong tài liệu', 'ghi chú của tôi', 'kiến thức về', 'giải thích khái niệm',
          'tóm tắt bài học', 'ôn tập', 'tìm kiếm', 'nội dung video', 'bài giảng',
          'tài liệu nói gì', 'dựa vào ghi chú'
        ],
        embeddings: []
      }
    ];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    try {
      for (const route of this.routes) {
        route.embeddings = [];
        for (const utterance of route.utterances) {
          try {
            const embedding = await getLocalEmbedding(utterance);
            if (embedding.length > 0) {
              route.embeddings.push(embedding);
            }
          } catch (e) {
            console.error('Error generating local embedding for router utterance:', e);
          }
        }
      }
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing SemanticRouter:', error);
    }
  }

  async route(query, queryEmbedding = null) {
    if (!this.initialized) await this.init();

    let qEmb = queryEmbedding;
    if (!qEmb) {
      try {
        qEmb = await getLocalEmbedding(query);
      } catch (e) {
        console.error('Error embedding query in router:', e);
        return 'rag_search'; // Default to RAG if error
      }
    }

    if (!qEmb || qEmb.length === 0) return 'rag_search';

    let bestRoute = 'rag_search';
    let maxScore = -1;

    for (const route of this.routes) {
      for (const emb of route.embeddings) {
        const score = cosineSimilarity(qEmb, emb);
        if (score > maxScore) {
          maxScore = score;
          bestRoute = route.name;
        }
      }
    }

    // If similarity is too low, default to RAG search
    if (maxScore < 0.6) {
      return 'rag_search';
    }

    return bestRoute;
  }
}

module.exports = SemanticRouter;
