/**
 * ragService.js
 * Mobile RAG service - mirrors web's ragService.ts behavior.
 * 
 * All calls go to the backend which handles:
 *  - Vector search (RAG retrieve)
 *  - LLM generation with context injection
 *  - User memory extraction (background)
 */

import { apiPost, apiGet } from './apiService';

// ─── Chat with RAG (mirrors POST /api/chat/ai) ───────────────────────────────
/**
 * Send a chat message. Backend auto-injects RAG context (UZP algorithm).
 * @param {string} message - User's message
 * @param {string} sessionId - Conversation session ID
 * @param {object} options - { systemInstruction, isThinkingMode, sourceId, sourceType }
 * @returns {Promise<{success, reply, sessionId}>}
 */
export const sendChatMessage = async (message, sessionId, options = {}) => {
  const result = await apiPost('/api/chat/ai', {
    message,
    sessionId,
    systemInstruction: options.systemInstruction || null,
    isThinkingMode: options.isThinkingMode || false,
    sourceId: options.sourceId || null,
    sourceType: options.sourceType || null,
  }, 45000); // 45s timeout for thinking mode

  if (result.success) {
    return {
      success: true,
      reply: result.data.reply,
      sessionId: result.data.sessionId,
    };
  }
  return result;
};

// ─── Fetch RAG context only (for Note AI Enhance) ────────────────────────────
/**
 * Retrieve relevant context from knowledge base without generating a reply.
 * @param {string} query - The search query
 * @param {string} sourceType - optional filter: 'note', 'alchemy', etc.
 * @returns {Promise<{success, context, chunks}>}
 */
export const getRAGContext = async (query, sourceType = null) => {
  const result = await apiPost('/api/rag/context', {
    query,
    sourceType,
  });

  if (result.success) {
    return {
      success: true,
      context: result.data.context || '',
      chunks: result.data.chunks || [],
    };
  }
  return result;
};

// ─── Alchemy: Process content ─────────────────────────────────────────────────
/**
 * Send content to Alchemy AI Forge for processing.
 * @param {string} content - The raw text/URL content
 * @param {string} type - 'text' | 'url' | 'image_base64'
 * @param {string} title - Optional title
 * @returns {Promise<{success, summary, flashcards, nodes, alchemyItem}>}
 */
export const processWithAlchemy = async (content, type = 'text', title = '') => {
  const result = await apiPost('/api/alchemy/process', {
    content,
    type,
    title,
  }, 60000); // 60s for heavy processing

  if (result.success) {
    return {
      success: true,
      summary: result.data.summary || '',
      flashcards: result.data.flashcards || [],
      nodes: result.data.nodes || [],
      alchemyItem: result.data.alchemyItem || null,
    };
  }
  return result;
};

// ─── Knowledge Graph Nodes ────────────────────────────────────────────────────
/**
 * Fetch all knowledge graph nodes for the current user.
 */
export const fetchKnowledgeNodes = async () => {
  const result = await apiGet('/api/nodes');
  if (result.success) {
    return { success: true, nodes: result.data };
  }
  return result;
};

/**
 * Save a node to the knowledge graph.
 */
export const saveKnowledgeNode = async (node) => {
  const result = await apiPost('/api/nodes', node);
  return result;
};

// ─── Chat Session History ─────────────────────────────────────────────────────
/**
 * Fetch chat history for a session from backend.
 */
export const fetchChatHistory = async (sessionId) => {
  const result = await apiGet(`/api/chat/history/${sessionId}`);
  if (result.success) {
    return { success: true, messages: result.data };
  }
  // If endpoint doesn't exist yet, return empty gracefully
  return { success: true, messages: [] };
};
