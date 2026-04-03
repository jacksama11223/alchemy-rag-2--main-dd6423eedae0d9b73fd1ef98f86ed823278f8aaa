require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const VectorStore = require('../models/VectorStore');
const KnowledgeIndex = require('../models/KnowledgeIndex');

// Basic NLP extraction for Vietnamese and English
function extractKeywordsAndSummary(text) {
  if (!text) return [];
  // Split roughly by sentences to get chunks
  const sentences = text.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 10);
  
  const results = [];
  const seenKeywords = new Set();
  
  // Extract capitalized sequences (often names/entities) or terms in quotes
  const NameRegex = /([A-Z][a-z0-9A-Z_]+(?:\s[A-Z][a-z0-9A-Z_]+)*)/g;
  const QuoteRegex = /"([^"]+)"|'([^']+)'/g;

  // Attempt extraction from each sentence
  for (const sentence of sentences) {
    let matches = [];
    
    // 1. Try finding Proper Nouns
    let match;
    while ((match = NameRegex.exec(sentence)) !== null) {
      if (match[1].length > 3) matches.push(match[1].toLowerCase());
    }
    
    // 2. Try Quotes (often defined terms)
    while ((match = QuoteRegex.exec(sentence)) !== null) {
      const term = match[1] || match[2];
      if (term.length > 2 && term.length < 30) matches.push(term.toLowerCase());
    }

    // Fallback: If no strict entity found, just take the first 1-3 words of the sentence as the "Keyword Topic"
    if (matches.length === 0) {
      const words = sentence.split(' ');
      if (words.length > 2) {
         const topic = words.slice(0, Math.min(3, words.length)).join(' ').toLowerCase();
         // Basic stopword avoidance (rough heuristic)
         if (!['tôi', 'bạn', 'khi', 'nếu', 'là', 'những', 'các'].includes(topic.split(' ')[0])) {
           matches.push(topic);
         }
      }
    }

    // Save
    for (const kw of matches) {
      if (!seenKeywords.has(kw)) {
        seenKeywords.add(kw);
        results.push({
          keyword: kw.replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, '').trim(),
          shortValue: sentence.substring(0, 500) // The sentence itself acts as the short summary point
        });
      }
    }
  }
  
  return results;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const docs = await VectorStore.find({}).lean();
    console.log(`Found ${docs.length} documents in VectorStore. Starting extraction...`);

    let totalInserted = 0;

    for (const doc of docs) {
      const extractions = extractKeywordsAndSummary(doc.textChunk);
      if (extractions.length === 0) continue;

      const bulkOps = extractions.map(ext => ({
        updateOne: {
          filter: { 
            userId: doc.userId, 
            keyword: ext.keyword 
          },
          update: { 
            $set: { 
              shortValue: ext.shortValue,
              sourceId: doc._id,
              sourceType: doc.metadata?.sourceType || 'unknown'
            } 
          },
          upsert: true
        }
      }));

      if (bulkOps.length > 0) {
        await KnowledgeIndex.bulkWrite(bulkOps);
        totalInserted += bulkOps.length;
      }
    }

    console.log(`🎉 Migration complete! Generated/Updated ${totalInserted} Key-Value pairs.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();
