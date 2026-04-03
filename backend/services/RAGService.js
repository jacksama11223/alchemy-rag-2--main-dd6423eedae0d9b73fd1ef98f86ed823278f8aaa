const { pipeline } = require('@xenova/transformers');
const VectorStore = require('../models/VectorStore');
const KnowledgeIndex = require('../models/KnowledgeIndex');
const { parseQueryKeywords } = require('../utils/keywordExtractor');
const mongoose = require('mongoose');

let extractorPipeline = null;

const getLocalEmbeddingGlobal = async (text) => {
  if (!extractorPipeline) {
    extractorPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  const output = await extractorPipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};

class RAGService {
  async getLocalEmbedding(text) {
    return await getLocalEmbeddingGlobal(text);
  }
  async retrieve(query, userId, options = {}) {
    const { limit = 5, sourceType, originalDocId } = options;
    let combinedResults = [];
    try {
      const dbUserId = new mongoose.Types.ObjectId(userId);

      // ===== LAYER 1: FAST KEYWORD/ENTITY SPARSE SEARCH & TRACEBACK =====
      const keywords = parseQueryKeywords(query);
      const uniqueSourceIds = new Set();
      
      if (keywords.length > 0) {
        const regexStr = keywords.join('|');
        const entityResults = await KnowledgeIndex.find({
          userId: dbUserId,
          keyword: { $regex: new RegExp(regexStr, 'i') }
        }).limit(5).lean(); 

        if (entityResults.length > 0) {
          console.log(`[DualRAG] Found ${entityResults.length} Entity Keywords. Starting Reverse Traceback...`);
          
          const sourceIdsToFetch = [];
          entityResults.forEach(ent => {
             if (ent.sourceId && !uniqueSourceIds.has(ent.sourceId.toString())) {
                sourceIdsToFetch.push(ent.sourceId);
                uniqueSourceIds.add(ent.sourceId.toString());
             }
          });

          // Keyword Traceback: Fetch FULL context from VectorStore using the mapped sourceId
          if (sourceIdsToFetch.length > 0) {
             const fullDocs = await VectorStore.find({ _id: { $in: sourceIdsToFetch } }).lean();
             fullDocs.forEach(doc => {
               combinedResults.push({
                 textChunk: doc.textChunk,
                 metadata: doc.metadata,
                 score: 1.0 // Max score for strict keyword trace hit
               });
             });
             console.log(`[DualRAG] Reverse Traceback recovered ${fullDocs.length} full documents.`);
          }
        }
      }

      // ===== LAYER 2: DEEP VECTOR DENSE SEARCH =====
      const queryEmbedding = await this.getLocalEmbedding(query);
      
      const filter = { userId: { $eq: dbUserId } };
      if (sourceType) filter['metadata.sourceType'] = { $eq: sourceType };
      if (originalDocId) filter['metadata.originalDocId'] = { $eq: new mongoose.Types.ObjectId(originalDocId) };

      const vectorDocs = await VectorStore.aggregate([
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 20,
            limit: limit
          }
        },
        { $match: filter },
        { $project: { _id: 1, textChunk: 1, metadata: 1, score: { $meta: 'vectorSearchScore' } } }
      ]);
      
      // ===== LAYER 3: COMBINE, DEDUPLICATE & BOOST =====
      for (const doc of vectorDocs) {
        if (!uniqueSourceIds.has(doc._id.toString())) {
           uniqueSourceIds.add(doc._id.toString());
           
           // Apply Source Boosting
           let finalScore = doc.score;
           const sType = doc.metadata?.sourceType;
           
           if (sType === 'note' || sType === 'alchemy') {
              finalScore *= 1.2; // Digital Notes get 20% boost
           } else if (sType === 'flashcard_note' || sType === 'comment') {
              finalScore *= 0.9; // Flashcard snippets slightly deprioritized if competing with formal notes
           }

           combinedResults.push({
             textChunk: doc.textChunk,
             metadata: doc.metadata,
             score: finalScore
           });
        }
      }
      
      // Sort combined by final boosted score and respect limit
      combinedResults.sort((a, b) => b.score - a.score);
      return combinedResults.slice(0, limit);
    } catch (e) {
      console.error('RAGService dual-retrieval error:', e);
      return combinedResults;
    }
  }

  // Local TF-IDF style sentence extractor to save 80% input tokens when passing context
  extractRelevantSentences(text, query) {
    if (!text || !query) return text;
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    if (sentences.length <= 3) return text;

    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    if (keywords.length === 0) return sentences.slice(0, 3).join(' '); // fallback

    const scoredSentences = sentences.map(sentence => {
      let score = 0;
      const lowerSentence = sentence.toLowerCase();
      keywords.forEach(kw => {
        if (lowerSentence.includes(kw)) score++;
      });
      return { sentence, score, originalIndex: sentences.indexOf(sentence) };
    });

    scoredSentences.sort((a, b) => b.score - a.score);
    const topSentences = scoredSentences.slice(0, 3);
    topSentences.sort((a, b) => a.originalIndex - b.originalIndex);
    return topSentences.map(s => s.sentence).join(' ').trim();
  }

  formatContext(results, originalQuery = '') {
    if (!results || results.length === 0) return '';
    return results.map(doc => {
      let content = doc.textChunk;
      if (originalQuery) {
        content = this.extractRelevantSentences(content, originalQuery);
      }
      
      // Categorical Labeling for LLM
      const sType = doc.metadata?.sourceType;
      let label = 'TÀI LIỆU';
      
      if (sType === 'note' || sType === 'alchemy') label = 'GHI CHÚ HỆ THỐNG';
      else if (sType === 'flashcard_note') label = 'GHI CHÚ FLASHCARD';
      else if (sType === 'comment') label = 'GIẢI THÍCH TỪ AI';
      else if (sType === 'youtube') label = 'VIDEO YOUTUBE';
      else if (sType === 'web') label = 'TRANG WEB';
      else if (sType === 'voice') label = 'GHI ÂM GIỌNG NÓI';

      const title = doc.metadata?.title || 'Không tiêu đề';
      
      return `[NGUỒN: ${label} | TIÊU ĐỀ: ${title}]\n${content}`;
    }).join('\n\n');
  }
}

module.exports = new RAGService();
