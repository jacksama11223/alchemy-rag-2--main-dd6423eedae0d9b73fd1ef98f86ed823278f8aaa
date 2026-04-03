const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');

/**
 * Smart Text Splitter for RAG
 * Implements a Router pattern integrating:
 * - Structural Markdown Chunking
 * - Temporal Overlap Chunking (Video/Audio)
 * - Parent-Child Chunking (Default)
 */
class SmartTextSplitter {
  constructor() {
    // 1. Default Parent-Child Splitter
    this.parentSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1200, chunkOverlap: 200,
      separators: ["\n\n", "\n", ".", "!", "?", ",", " ", ""],
    });
    this.childSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 400, chunkOverlap: 50,
      separators: ["\n\n", "\n", ".", "!", "?", ",", " ", ""],
    });

    // 2. Temporal Splitter (for speech, youtube transcripts context overlap)
    this.temporalSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 900,
      chunkOverlap: 350, // High overlap to maintain conversational memory across chunks
      separators: ["\n\n", "\n", " ", ""], // Avoid breaking down by punctuation as transcription might skip them
    });

    // 3. Structural Splitter (for web articles, notes)
    this.markdownSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1500,
      chunkOverlap: 100,
      separators: ["\n# ", "\n## ", "\n### ", "\n#### ", "\n\n", "\n", " ", ""], // High priority to heading boundaries
    });
  }

  async splitText(text, metadata = {}) {
    if (!text) return [];
    const cleanText = text.replace(/\s+/g, ' ').trim();
    const sourceType = metadata.sourceType || 'default';

    switch (sourceType) {
        case 'youtube':
        case 'voice':
            return await this._splitWithStrategy(cleanText, metadata, this.temporalSplitter);
        case 'web':
        case 'note':
            return await this._splitWithStrategy(cleanText, metadata, this.markdownSplitter);
        case 'ocr':
        case 'upload':
        default:
            return await this._splitWithStrategy(cleanText, metadata, this.parentSplitter);
    }
  }

  /**
   * Helper that executes a specific parent split strategy and runs uniform child splitting
   * to ensure vector embeddings operate at optimal ~400 char sizes while retaining large context.
   */
  async _splitWithStrategy(text, metadata, selectedParentSplitter) {
    const parentChunks = await selectedParentSplitter.splitText(text);
    const result = [];
    let globalChildIndex = 0;
    
    for (let pIndex = 0; pIndex < parentChunks.length; pIndex++) {
      const parentText = parentChunks[pIndex];
      // Create small child chunks for vector DB matching
      const childChunks = await this.childSplitter.splitText(parentText);
      
      for (let cIndex = 0; cIndex < childChunks.length; cIndex++) {
        result.push({
          text: childChunks[cIndex], // The accurate small chunk for math distance calculation
          metadata: {
            ...metadata,
            globalChildIndex: globalChildIndex++,
            parentIndex: pIndex,
            parentContent: parentText // The full context injected into LLM if vector matches
          }
        });
      }
    }
    
    return result;
  }
}

module.exports = SmartTextSplitter;