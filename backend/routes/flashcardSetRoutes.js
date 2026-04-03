const express = require('express');
const router = express.Router();
const {
  getFlashcardSets,
  createFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet
} = require('../controllers/flashcardSetController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getFlashcardSets)
  .post(protect, createFlashcardSet);

router.route('/:id')
  .put(protect, updateFlashcardSet)
  .delete(protect, deleteFlashcardSet);

module.exports = router;
