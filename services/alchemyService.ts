import { AlchemyStorageItem, AlchemyStorageFlashcard } from '../types';

const API_URL = '/api/alchemy';

const getAuthHeader = (): Record<string, string> => {
    let userInfo = typeof window !== 'undefined' ? window.localStorage.getItem('learnai_session') : null;
    if (!userInfo) userInfo = typeof window !== 'undefined' ? window.localStorage.getItem('userInfo') : null;
    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
    return {
        'Content-Type': 'application/json'
    };
};

export const getAlchemyStorageItems = async (): Promise<AlchemyStorageItem[]> => {
    const response = await fetch(`${API_URL}/storage/items`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch storage items');
    return response.json();
};

export const saveAlchemyStorageItem = async (item: Omit<AlchemyStorageItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<AlchemyStorageItem> => {
    const response = await fetch(`${API_URL}/storage/items`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(item)
    });
    if (!response.ok) throw new Error('Failed to save storage item');
    return response.json();
};

export const updateAlchemyStorageItem = async (id: string, item: Partial<AlchemyStorageItem>): Promise<AlchemyStorageItem> => {
    const response = await fetch(`${API_URL}/storage/items/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(item)
    });
    if (!response.ok) throw new Error('Failed to update storage item');
    return response.json();
};

export const deleteAlchemyStorageItem = async (id: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/storage/items/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    });
    return response.ok;
};

export const getAlchemyStorageFlashcards = async (): Promise<AlchemyStorageFlashcard[]> => {
    const response = await fetch(`${API_URL}/storage/flashcards`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch flashcards');
    return response.json();
};

export const saveAlchemyStorageFlashcard = async (flashcard: Omit<AlchemyStorageFlashcard, 'id'>): Promise<AlchemyStorageFlashcard> => {
    const response = await fetch(`${API_URL}/storage/flashcards`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(flashcard)
    });
    if (!response.ok) throw new Error('Failed to save flashcard');
    return response.json();
};

export const updateAlchemyStorageFlashcard = async (id: string, flashcard: Partial<AlchemyStorageFlashcard>): Promise<AlchemyStorageFlashcard> => {
    const response = await fetch(`${API_URL}/storage/flashcards/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(flashcard)
    });
    if (!response.ok) throw new Error('Failed to update flashcard');
    return response.json();
};

export const deleteAlchemyStorageFlashcard = async (id: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/storage/flashcards/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    });
    return response.ok;
};

// --- FlashcardDecks ---
export interface FlashcardDeck {
    id: string;
    name: string;
    description?: string;
    color?: string;
    createdAt?: string | number;
}

export const getFlashcardDecks = async (): Promise<FlashcardDeck[]> => {
    const response = await fetch(`${API_URL}/decks`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch decks');
    const data = await response.json();
    return data.map((d: any) => ({ ...d, id: d._id }));
};

export const createFlashcardDeck = async (deck: Omit<FlashcardDeck, 'id'>): Promise<FlashcardDeck> => {
    const response = await fetch(`${API_URL}/decks`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(deck)
    });
    if (!response.ok) throw new Error('Failed to create deck');
    const data = await response.json();
    return { ...data, id: data._id };
};

export const updateFlashcardDeck = async (id: string, deck: Partial<FlashcardDeck>): Promise<FlashcardDeck> => {
    const response = await fetch(`${API_URL}/decks/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(deck)
    });
    if (!response.ok) throw new Error('Failed to update deck');
    const data = await response.json();
    return { ...data, id: data._id };
};

export const deleteFlashcardDeck = async (id: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/decks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    });
    return response.ok;
};
