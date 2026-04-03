// utils/keywordExtractor.js

function extractKeywordsAndSummary(text) {
  if (!text) return [];
  const sentences = text.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 10);
  const results = [];
  const seenKeywords = new Set();
  
  const NameRegex = /([A-Z][a-z0-9A-Z_]+(?:\s[A-Z][a-z0-9A-Z_]+)*)/g;
  const QuoteRegex = /"([^"]+)"|'([^']+)'/g;

  for (const sentence of sentences) {
    let matches = [];
    
    let match;
    while ((match = NameRegex.exec(sentence)) !== null) {
      if (match[1].length > 3) matches.push(match[1].toLowerCase());
    }
    
    while ((match = QuoteRegex.exec(sentence)) !== null) {
      const term = match[1] || match[2];
      if (term.length > 2 && term.length < 30) matches.push(term.toLowerCase());
    }

    if (matches.length === 0) {
      const words = sentence.split(' ');
      if (words.length > 2) {
         const topic = words.slice(0, Math.min(3, words.length)).join(' ').toLowerCase();
         if (!['tôi', 'bạn', 'khi', 'nếu', 'là', 'những', 'các'].includes(topic.split(' ')[0])) {
           matches.push(topic);
         }
      }
    }

    for (const kw of matches) {
      const cleanKw = kw.replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, '').trim();
      if (cleanKw && !seenKeywords.has(cleanKw)) {
        seenKeywords.add(cleanKw);
        results.push({
          keyword: cleanKw,
          shortValue: sentence.substring(0, 500)
        });
      }
    }
  }
  
  return results;
}

// Special parser just for short user queries
function parseQueryKeywords(query) {
  if (!query) return [];
  const words = query.toLowerCase().replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, '').split(' ').filter(w => w.length >= 3);
  
  // Basic stopword list for queries
  const stopWords = new Set(['khi', 'nào', 'nếu', 'là', 'các', 'những', 'của', 'về', 'cho', 'có', 'thể', 'hãy', 'làm', 'sao', 'để', 'giúp', 'tôi', 'bạn', 'và', 'hoặc']);
  
  // Extract Proper Nouns (Vietnamese and English rough heuristic)
  const results = [];
  
  const NameRegex = /([A-Z][a-z0-9A-Z_]+(?:\s[A-Z][a-z0-9A-Z_]+)*)/g;
  let match;
  while ((match = NameRegex.exec(query)) !== null) {
      if (match[1].length > 3) results.push(match[1].toLowerCase());
  }
  
  const QuoteRegex = /"([^"]+)"|'([^']+)'/g;
  while ((match = QuoteRegex.exec(query)) !== null) {
      const term = match[1] || match[2];
      if (term.length > 2) results.push(term.toLowerCase());
  }

  // Filter normal words against stopwords
  for (const w of words) {
    if (!stopWords.has(w) && !results.includes(w)) {
      results.push(w);
    }
  }

  return results.slice(0, 5); // Take max 5 best query terms
}

module.exports = { extractKeywordsAndSummary, parseQueryKeywords };
