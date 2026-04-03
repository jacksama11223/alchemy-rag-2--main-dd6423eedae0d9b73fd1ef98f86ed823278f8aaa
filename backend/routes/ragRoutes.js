const express = require('express');
const router = express.Router();
const ragController = require('../controllers/ragController');
const { protect } = require('../middleware/authMiddleware');

// All RAG routes require authentication
router.use(protect);

// POST a new document to RAG
router.post('/', ragController.addDocument);

// POST a large document to Gemini Context Cache
router.post('/cache', ragController.cacheDocument);

// GET all RAG documents
router.get('/', ragController.getDocuments);

// GET search RAG documents (basic vector search, legacy)
router.get('/search', ragController.searchDocuments);

// POST check for semantic resonance
router.post('/resonance', ragController.findResonance);

// POST Hybrid Dual-Track RAG Search
// Dùng cùng thuật toán với AI Chat: Keyword Sparse + Dense Vector + Traceback + TF-IDF
router.post('/hybrid-search', ragController.hybridSearch);

// POST Save AI-generated explanation to RAG memory
router.post('/comment', ragController.saveAiComment);

// GET Flashcard History
router.get('/history/:flashcardTitle', ragController.getFlashcardHistory);

// GET/POST Flashcard Notes
router.get('/note/:flashcardTitle', ragController.getFlashcardNote);
router.post('/note', ragController.saveFlashcardNote);

module.exports = router;

