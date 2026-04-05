import { apiGet, apiPost, apiDelete } from './apiService';

/**
 * apiNoteService.js
 * Centralized service for management of notes via the Node.js Backend API.
 * This ensures synchronization between Mobile and Web versions.
 */

/**
 * Fetch all notes for the current user from the Backend.
 */
export const getUserNotes = async () => {
  const result = await apiGet('/api/notes');
  if (result.success) {
    // Map backend block structure to mobile-friendly flat view if needed
    // or just return the full backend data.
    return { 
      success: true, 
      data: result.data.map(n => ({
        ...n,
        // For mobile Dashboard simplicity, we'll provide a 'content' field 
        // derived from the first paragraph block if 'content' is missing.
        content: n.content || (n.blocks && n.blocks[0]?.content) || ''
      }))
    };
  }
  return result;
};

/**
 * Add or Update a note via the Backend.
 */
export const addNote = async (userId, title, content, id = null) => {
  // Convert flat 'content' string to Backend's block structure
  const blocks = [
    {
      id: Date.now().toString(),
      type: 'paragraph',
      content: content
    }
  ];

  const payload = {
    title,
    blocks,
    type: 'note'
  };

  if (id) payload.id = id;

  const result = await apiPost('/api/notes', payload);
  return result;
};

/**
 * Delete a note from the Backend.
 */
export const deleteNote = async (id) => {
  const result = await apiDelete(`/api/notes/${id}`);
  return result;
};
