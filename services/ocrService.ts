import { getAuthHeader } from './mockBackend';

const API_URL = '/api/ocr';

export interface OcrHighlight {
  id: string;
  text: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color: string;
}

export interface OcrFlashcard {
  id: string;
  front: string;
  back: string;
  highlightId: string;
}

export interface OcrDocument {
  _id: string;
  title: string;
  imageUrl: string;
  extractedText: string;
  highlights: OcrHighlight[];
  flashcards: OcrFlashcard[];
  createdAt: string;
  updatedAt: string;
}

export const getOcrDocuments = async (): Promise<OcrDocument[]> => {
  try {
    const response = await fetch(API_URL, { headers: getAuthHeader() });
    if (response.ok) return await response.json();
  } catch (e) {
    console.error('Error fetching OCR documents:', e);
  }
  return [];
};

export const getOcrDocumentById = async (id: string): Promise<OcrDocument | null> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, { headers: getAuthHeader() });
    if (response.ok) return await response.json();
  } catch (e) {
    console.error('Error fetching OCR document:', e);
  }
  return null;
};

export const createOcrDocument = async (title: string, imageUrl: string, extractedText: string = ''): Promise<OcrDocument | null> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ title, imageUrl, extractedText })
    });
    if (response.ok) return await response.json();
  } catch (e) {
    console.error('Error creating OCR document:', e);
  }
  return null;
};

export const updateOcrDocument = async (id: string, updates: Partial<OcrDocument>): Promise<OcrDocument | null> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(updates)
    });
    if (response.ok) return await response.json();
  } catch (e) {
    console.error('Error updating OCR document:', e);
  }
  return null;
};

export const deleteOcrDocument = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return response.ok;
  } catch (e) {
    console.error('Error deleting OCR document:', e);
  }
  return false;
};
