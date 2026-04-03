
const express = require('express');
const router = express.Router();
const { getNotes, saveNote, deleteNote, attachFileToNote } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNotes).post(protect, saveNote);
router.route('/:id').delete(protect, deleteNote);
router.route('/:id/attach').post(protect, attachFileToNote);

module.exports = router;
