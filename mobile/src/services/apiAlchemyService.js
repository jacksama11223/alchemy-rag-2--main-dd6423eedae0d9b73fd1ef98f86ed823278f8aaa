import { apiGet, apiPost, apiDelete } from './apiService';

/**
 * apiAlchemyService.js
 * Centralized service for management of alchemy-related data via the Node.js Backend API.
 * This ensures synchronization between Mobile and Web versions.
 */

/**
 * Fetch all alchemy storage items for the current user from the Backend.
 */
export const getAlchemyItems = async () => {
  const result = await apiGet('/api/alchemy/storage/items');
  if (result.success) {
    return { success: true, data: result.data };
  }
  return result;
};

/**
 * Add an item to the Backend Alchemy Storage.
 * @param {object} itemData - { title, sourceType, originalContent, extractedText }
 */
export const addAlchemyItem = async (itemData) => {
  const result = await apiPost('/api/alchemy/storage/items', itemData);
  return result;
};

/**
 * Delete an alchemy item from the Backend.
 */
export const deleteAlchemyItem = async (id) => {
  const result = await apiDelete(`/api/alchemy/storage/items/${id}`);
  return result;
};

/**
 * Fetch all alchemy flashcards for the current user from the Backend.
 */
export const getAlchemyFlashcards = async () => {
  const result = await apiGet('/api/alchemy/storage/flashcards');
  if (result.success) {
    return { success: true, data: result.data };
  }
  return result;
};

/**
 * Add a flashcard to the Backend Alchemy Storage.
 */
export const addAlchemyFlashcard = async (cardData) => {
  const result = await apiPost('/api/alchemy/storage/flashcards', cardData);
  return result;
};

/**
 * Delete an alchemy flashcard from the Backend.
 */
export const deleteAlchemyFlashcard = async (id) => {
  const result = await apiDelete(`/api/alchemy/storage/flashcards/${id}`);
  return result;
};
