const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAlchemyLogs, createAlchemyLog,
  getTutorPersonas, createTutorPersona, updateTutorPersona, deleteTutorPersona,
  getAlchemyTemplates, createAlchemyTemplate, updateAlchemyTemplate, deleteAlchemyTemplate,
  getAlchemyPersonas, createAlchemyPersona, updateAlchemyPersona, deleteAlchemyPersona,
  getAlchemyStorageItems, createAlchemyStorageItem, updateAlchemyStorageItem, deleteAlchemyStorageItem,
  getAlchemyStorageFlashcards, createAlchemyStorageFlashcard, updateAlchemyStorageFlashcard, deleteAlchemyStorageFlashcard,
  getFlashcardDecks, createFlashcardDeck, updateFlashcardDeck, deleteFlashcardDeck,
  pushDeckToGraph, processAlchemyContent
} = require('../controllers/alchemyController');

router.route('/logs').get(protect, getAlchemyLogs).post(protect, createAlchemyLog);

router.route('/storage/items').get(protect, getAlchemyStorageItems).post(protect, createAlchemyStorageItem);
router.route('/storage/items/:id').put(protect, updateAlchemyStorageItem).delete(protect, deleteAlchemyStorageItem);

router.route('/storage/flashcards').get(protect, getAlchemyStorageFlashcards).post(protect, createAlchemyStorageFlashcard);
router.route('/storage/flashcards/:id').put(protect, updateAlchemyStorageFlashcard).delete(protect, deleteAlchemyStorageFlashcard);

router.route('/decks').get(protect, getFlashcardDecks).post(protect, createFlashcardDeck);
router.route('/decks/:id').put(protect, updateFlashcardDeck).delete(protect, deleteFlashcardDeck);

// Push entire deck as a single Knowledge Graph node
router.route('/push-deck-to-graph').post(protect, pushDeckToGraph);

// Process content with AI (Alchemy)
router.route('/process').post(protect, processAlchemyContent);

router.route('/tutor-personas').get(protect, getTutorPersonas).post(protect, createTutorPersona);
router.route('/tutor-personas/:id').put(protect, updateTutorPersona).delete(protect, deleteTutorPersona);

router.route('/templates').get(protect, getAlchemyTemplates).post(protect, createAlchemyTemplate);
router.route('/templates/:id').put(protect, updateAlchemyTemplate).delete(protect, deleteAlchemyTemplate);

router.route('/personas').get(protect, getAlchemyPersonas).post(protect, createAlchemyPersona);
router.route('/personas/:id').put(protect, updateAlchemyPersona).delete(protect, deleteAlchemyPersona);

module.exports = router;
