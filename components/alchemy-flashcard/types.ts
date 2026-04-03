export interface FlashcardTemplate {
    id: string;
    name: string;
    fields: string[];
    color: string;
}

export interface FlashcardComment {
    id: string;
    text: string;
    timestamp: number;
    author: string;
}

export interface StudioFlashcard {
    id: string;
    deckId: string;
    templateId: string;
    fieldData: Record<string, string>;
    comments: FlashcardComment[];
    createdAt: number;
}

export interface FlashcardDeck {
    id: string;
    name: string;
    description?: string;
    color?: string;
    createdAt?: string | number;
}
