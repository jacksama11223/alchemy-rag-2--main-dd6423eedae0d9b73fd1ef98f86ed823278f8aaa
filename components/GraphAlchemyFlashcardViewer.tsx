import React from 'react';
import { KnowledgeNode } from '../types';
import { FlashcardModeView } from './Graph/GraphLearning';

interface GraphAlchemyFlashcardViewerProps {
    node: KnowledgeNode | null;
    isOpen: boolean;
    onClose: () => void;
}

export const GraphAlchemyFlashcardViewer: React.FC<GraphAlchemyFlashcardViewerProps> = ({ node, isOpen, onClose }) => {
    if (!isOpen) return null;

    let parsedCards = undefined;
    if (node && node.data) {
        let rawFlashcards = node.data.cards || node.data.flashcards;

        // Handle stringified JSON from some sources
        if (typeof rawFlashcards === 'string') {
            try {
                rawFlashcards = JSON.parse(rawFlashcards);
            } catch (e) {
                console.error("Failed to parse flashcards string", e);
                rawFlashcards = undefined;
            }
        }

        // Normalize into { front, back } array
        if (Array.isArray(rawFlashcards) && rawFlashcards.length > 0) {
            parsedCards = rawFlashcards.map((fc: any) => ({
                front: fc.front || fc.question || fc.q || "No Question",
                back: fc.back || fc.answer || fc.a || fc.summary || "No Answer"
            }));
        } else if (node.data.summary) {
            // Fallback to node summary if no specific flashcards
            parsedCards = [{ front: node.title, back: node.data.summary }];
        } else if (node.data.extractedText || node.data.originalContent) {
            parsedCards = [{ front: node.title, back: node.data.extractedText || node.data.originalContent }];
        } else {
            parsedCards = [{ front: node.title, back: 'Chưa có dữ liệu chi tiết cho thuật ngữ này.' }];
        }
    }

    return (
        <FlashcardModeView 
            isOpen={isOpen} 
            onClose={onClose}
            cards={parsedCards}
        />
    );
};
