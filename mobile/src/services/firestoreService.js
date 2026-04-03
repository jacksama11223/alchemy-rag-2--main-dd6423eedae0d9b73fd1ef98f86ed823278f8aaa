import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Add a new note (POST)
export const addNote = async (userId, title, content, aiEnhanced = false) => {
  try {
    const docRef = await addDoc(collection(db, 'notes'), {
      userId,
      title,
      content,
      aiEnhanced,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding note: ", error);
    return { success: false, error: error.message };
  }
};

// Delete a note by ID
export const deleteNote = async (id) => {
  try {
    await deleteDoc(doc(db, 'notes', id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting note: ", error);
    return { success: false, error: error.message };
  }
};

// Get all notes for a user (GET)
export const getUserNotes = async (userId) => {
  try {
    const q = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const notes = [];
    querySnapshot.forEach((doc) => {
      notes.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: notes };
  } catch (error) {
    console.error("Error getting notes: ", error);
    return { success: false, error: error.message };
  }
};

// --- ALCHEMY ITEMS ---

export const addAlchemyItem = async (userId, itemData) => {
  try {
    const docRef = await addDoc(collection(db, 'alchemy_items'), {
      userId,
      ...itemData,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding alchemy item: ", error);
    return { success: false, error: error.message };
  }
};

export const getAlchemyItems = async (userId) => {
  try {
    const q = query(
      collection(db, 'alchemy_items'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: items };
  } catch (error) {
    console.error("Error getting alchemy items: ", error);
    return { success: false, error: error.message };
  }
};

export const deleteAlchemyItem = async (id) => {
  try {
    await deleteDoc(doc(db, 'alchemy_items', id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting alchemy item: ", error);
    return { success: false, error: error.message };
  }
};

// --- ALCHEMY FLASHCARDS ---

export const addAlchemyFlashcard = async (userId, cardData) => {
  try {
    const docRef = await addDoc(collection(db, 'alchemy_flashcards'), {
      userId,
      ...cardData,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding alchemy flashcard: ", error);
    return { success: false, error: error.message };
  }
};

export const getAlchemyFlashcards = async (userId) => {
  try {
    const q = query(
      collection(db, 'alchemy_flashcards'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const cards = [];
    querySnapshot.forEach((doc) => {
      cards.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: cards };
  } catch (error) {
    console.error("Error getting alchemy flashcards: ", error);
    return { success: false, error: error.message };
  }
};

export const deleteAlchemyFlashcard = async (id) => {
  try {
    await deleteDoc(doc(db, 'alchemy_flashcards', id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting alchemy flashcard: ", error);
    return { success: false, error: error.message };
  }
};

